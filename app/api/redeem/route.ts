import { NextResponse } from 'next/server';
import { createServerClient } from '@/utils/supabase/server';
import { validateCodeFormat, getNextTier, canStackToNextTier, getTierInfo } from '@/lib/appsumo-tiers';

export async function POST(request: Request) {
  try {
    const { code } = await request.json();

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Code is required' },
        { status: 400 }
      );
    }

    const normalizedCode = code.trim().toUpperCase();

    const validation = validateCodeFormat(normalizedCode);
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Invalid code format. Expected format: LTD-T1-XXXX, LTD-T2-XXXX, or LTD-T3-XXXX' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data: codeData, error: codeError } = await supabase
      .from('redemption_codes')
      .select('*')
      .eq('code', normalizedCode)
      .single();

    if (codeError || !codeData) {
      return NextResponse.json(
        { error: 'Code not found' },
        { status: 404 }
      );
    }

    const redemptionCode = codeData as any;

    if (redemptionCode.redeemed_by) {
      return NextResponse.json(
        { error: 'This code has already been redeemed' },
        { status: 400 }
      );
    }

    if (redemptionCode.expires_at && new Date(redemptionCode.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'This code has expired' },
        { status: 400 }
      );
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userRecord = userData as any;
    const currentIsLTD = userRecord.is_lifetime_deal || false;
    const currentTier = userRecord.appsumo_tier || 0;
    const codesRedeemed = userRecord.codes_redeemed || [];

    if (codesRedeemed.includes(normalizedCode)) {
      return NextResponse.json(
        { error: 'You have already redeemed this code' },
        { status: 400 }
      );
    }

    let newTier: number;
    let message: string;

    if (!currentIsLTD || currentTier === 0) {
      newTier = redemptionCode.tier;
      message = `Welcome to AppSumo Tier ${newTier}!`;
    } else {
      if (!canStackToNextTier(currentTier)) {
        return NextResponse.json(
          { error: 'You are already at the maximum tier (Tier 3)' },
          { status: 400 }
        );
      }

      newTier = getNextTier(currentTier);
      message = `Upgraded from Tier ${currentTier} to Tier ${newTier}!`;
    }

    const tierInfo = getTierInfo(newTier);
    if (!tierInfo) {
      return NextResponse.json(
        { error: 'Invalid tier configuration' },
        { status: 500 }
      );
    }

    const { error: updateUserError } = await (supabase as any)
      .from('users')
      .update({
        is_lifetime_deal: true,
        appsumo_tier: newTier,
        codes_redeemed: [...codesRedeemed, normalizedCode],
        credits_total: tierInfo.credits,
        credits_used: 0,
        websites_limit: tierInfo.features.maxWebsites,
        keywords_limit: tierInfo.features.maxKeywords,
        last_credit_reset: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (updateUserError) {
      return NextResponse.json(
        { error: 'Failed to update user account' },
        { status: 500 }
      );
    }

    const { error: updateCodeError } = await (supabase as any)
      .from('redemption_codes')
      .update({
        redeemed_by: user.id,
        redeemed_at: new Date().toISOString(),
      })
      .eq('code', normalizedCode);

    if (updateCodeError) {
      return NextResponse.json(
        { error: 'Failed to mark code as redeemed' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message,
      tier: newTier,
      tierName: tierInfo.name,
      features: tierInfo.features,
      credits: tierInfo.credits,
    });
  } catch (error) {
    console.error('Redemption error:', error);
    return NextResponse.json(
      { error: 'An error occurred during redemption' },
      { status: 500 }
    );
  }
}
