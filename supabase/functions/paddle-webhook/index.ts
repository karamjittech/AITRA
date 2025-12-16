import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.58.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, Paddle-Signature",
};

interface PlanLimits {
  credits: number;
  websites: number;
  keywords: number;
  features: string[];
}

const PLAN_LIMITS: Record<string, PlanLimits> = {
  free: {
    credits: 10,
    websites: 1,
    keywords: 5,
    features: ['basic-analysis'],
  },
  pro: {
    credits: 100,
    websites: 5,
    keywords: 50,
    features: ['basic-analysis', 'competitive-analysis', 'sentiment-tracking'],
  },
  agency: {
    credits: 500,
    websites: 25,
    keywords: 250,
    features: ['basic-analysis', 'competitive-analysis', 'sentiment-tracking', 'white-label', 'api-access'],
  },
};

async function verifyWebhookSignature(body: string, signature: string, secret: string): Promise<boolean> {
  if (!secret) {
    console.warn('PADDLE_WEBHOOK_SECRET not set, skipping signature verification');
    return true;
  }

  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const signatureData = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(body)
    );

    const hashArray = Array.from(new Uint8Array(signatureData));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return hashHex === signature;
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  try {
    const supabaseUrl = Deno.env.get("NEXT_PUBLIC_SUPABASE_URL") || Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("CUSTOM_SERVICE_ROLE_KEY");
    const paddleWebhookSecret = Deno.env.get("PADDLE_WEBHOOK_SECRET");

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing environment variables", {
        hasUrl: !!supabaseUrl,
        hasServiceKey: !!supabaseServiceKey,
      });
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const body = await req.text();
    const signature = req.headers.get('paddle-signature') || '';

    if (paddleWebhookSecret && !await verifyWebhookSignature(body, signature, paddleWebhookSecret)) {
      console.error('Invalid webhook signature');
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const event = JSON.parse(body);
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Paddle webhook received:', event.event_type);

    if (event.event_type === 'subscription.created' || event.event_type === 'transaction.completed') {
      const customData = event.data.custom_data || {};
      const userId = customData.userId;
      const tier = customData.tier || 'pro';

      if (!userId) {
        console.error('Missing userId in custom data');
        return new Response(
          JSON.stringify({ error: 'Missing userId in custom data' }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const planLimits = PLAN_LIMITS[tier as 'free' | 'pro' | 'agency'] || PLAN_LIMITS.pro;

      const nextBilledAt = event.data.next_billed_at || event.data.billing_details?.next_payment?.date;
      const billingCycleStart = new Date();
      const billingCycleEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      const { error: updateError } = await supabase
        .from('users')
        .update({
          paddle_customer_id: event.data.customer_id,
          paddle_subscription_id: event.data.subscription_id || event.data.id,
          paddle_variant_id: event.data.items?.[0]?.price_id,
          subscription_plan: tier,
          subscription_status: 'active',
          payment_method: 'paddle',
          credits_total: planLimits.credits,
          credits_used: 0,
          websites_limit: planLimits.websites,
          keywords_limit: planLimits.keywords,
          billing_cycle_start: billingCycleStart.toISOString(),
          billing_cycle_end: billingCycleEnd.toISOString(),
          next_bill_date: nextBilledAt ? new Date(nextBilledAt).toISOString() : null,
        })
        .eq('id', userId);

      if (updateError) {
        console.error('Failed to update user:', updateError);
        return new Response(
          JSON.stringify({ error: 'Database error', details: updateError.message }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const amount = event.data.details?.totals?.total
        ? parseFloat(event.data.details.totals.total) / 100
        : event.data.billing?.amount?.total
        ? parseFloat(event.data.billing.amount.total) / 100
        : 0;

      const { error: historyError } = await supabase.from('payment_history').insert({
        user_id: userId,
        paddle_transaction_id: event.data.id,
        paddle_subscription_id: event.data.subscription_id,
        amount: amount,
        currency: event.data.currency_code || 'USD',
        status: event.data.status,
        tier: tier,
        event_type: event.event_type,
        event_data: event.data,
      });

      if (historyError) {
        console.error('Failed to insert payment history:', historyError);
      }

      console.log(`Subscription activated for user ${userId}, tier: ${tier}`);
      return new Response(
        JSON.stringify({ success: true }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (event.event_type === 'subscription.canceled') {
      const subscriptionId = event.data.id;

      const { error: cancelError } = await supabase
        .from('users')
        .update({
          subscription_status: 'canceled',
        })
        .eq('paddle_subscription_id', subscriptionId);

      if (cancelError) {
        console.error('Failed to cancel subscription:', cancelError);
        return new Response(
          JSON.stringify({ error: 'Database error', details: cancelError.message }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      console.log(`Subscription canceled: ${subscriptionId}`);
      return new Response(
        JSON.stringify({ success: true }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (event.event_type === 'subscription.updated') {
      const subscriptionId = event.data.id;
      const customData = event.data.custom_data || {};
      const newTier = customData.tier;

      if (newTier) {
        const planLimits = PLAN_LIMITS[newTier as 'free' | 'pro' | 'agency'] || PLAN_LIMITS.pro;

        const { error: updateError } = await supabase
          .from('users')
          .update({
            subscription_plan: newTier,
            credits_total: planLimits.credits,
            websites_limit: planLimits.websites,
            keywords_limit: planLimits.keywords,
          })
          .eq('paddle_subscription_id', subscriptionId);

        if (updateError) {
          console.error('Failed to update subscription:', updateError);
        }
      }

      return new Response(
        JSON.stringify({ success: true }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (event.event_type === 'subscription.payment_failed') {
      const subscriptionId = event.data.id;

      const { error: failError } = await supabase
        .from('users')
        .update({
          subscription_status: 'past_due',
        })
        .eq('paddle_subscription_id', subscriptionId);

      if (failError) {
        console.error('Failed to update payment failed status:', failError);
      }

      console.log(`Payment failed for subscription: ${subscriptionId}`);
      return new Response(
        JSON.stringify({ success: true }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Unhandled event type: ${event.event_type}`);
    return new Response(
      JSON.stringify({ success: true, message: 'Event received but not processed' }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error('Webhook processing error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
