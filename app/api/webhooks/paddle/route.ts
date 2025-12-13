import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { PLAN_LIMITS } from '@/lib/paddle-config';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function verifyWebhookSignature(body: string, signature: string): boolean {
  const secret = process.env.PADDLE_WEBHOOK_SECRET;
  if (!secret) {
    console.warn('PADDLE_WEBHOOK_SECRET not set, skipping signature verification');
    return true;
  }

  try {
    const hash = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    return hash === signature;
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get('paddle-signature') || '';

    if (process.env.NODE_ENV === 'production' && !verifyWebhookSignature(body, signature)) {
      console.error('Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(body);
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Paddle webhook received:', event.event_type);

    if (event.event_type === 'subscription.created' || event.event_type === 'transaction.completed') {
      const customData = event.data.custom_data || {};
      const userId = customData.userId;
      const tier = customData.tier;

      if (!userId || !tier) {
        console.error('Missing userId or tier in custom data');
        return NextResponse.json({ error: 'Missing data' }, { status: 400 });
      }

      const planLimits = PLAN_LIMITS[tier as 'pro' | 'agency'];

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
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
      }

      const amount = event.data.details?.totals?.total
        ? parseFloat(event.data.details.totals.total) / 100
        : event.data.billing?.amount?.total
        ? parseFloat(event.data.billing.amount.total) / 100
        : 0;

      await supabase.from('payment_history').insert({
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

      console.log(`Subscription activated for user ${userId}, tier: ${tier}`);
      return NextResponse.json({ success: true });
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
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
      }

      console.log(`Subscription canceled: ${subscriptionId}`);
      return NextResponse.json({ success: true });
    }

    if (event.event_type === 'subscription.updated') {
      const subscriptionId = event.data.id;
      const customData = event.data.custom_data || {};
      const newTier = customData.tier;

      if (newTier) {
        const planLimits = PLAN_LIMITS[newTier as 'pro' | 'agency'];

        await supabase
          .from('users')
          .update({
            subscription_plan: newTier,
            credits_total: planLimits.credits,
            websites_limit: planLimits.websites,
            keywords_limit: planLimits.keywords,
          })
          .eq('paddle_subscription_id', subscriptionId);
      }

      return NextResponse.json({ success: true });
    }

    if (event.event_type === 'subscription.payment_failed') {
      const subscriptionId = event.data.id;

      await supabase
        .from('users')
        .update({
          subscription_status: 'past_due',
        })
        .eq('paddle_subscription_id', subscriptionId);

      console.log(`Payment failed for subscription: ${subscriptionId}`);
      return NextResponse.json({ success: true });
    }

    console.log(`Unhandled event type: ${event.event_type}`);
    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
