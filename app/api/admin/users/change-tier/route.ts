import { NextResponse } from 'next/server';
import { createServerClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
  try {
    const { userId, newTier, reason } = await request.json();

    if (!userId || newTier === undefined || !reason) {
      return NextResponse.json(
        { error: 'User ID, new tier, and reason are required' },
        { status: 400 }
      );
    }

    const parsedTier = parseInt(newTier);
    if (isNaN(parsedTier) || parsedTier < 0 || parsedTier > 3) {
      return NextResponse.json(
        { error: 'Invalid tier value. Must be 0, 1, 2, or 3' },
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

    const { data: adminData, error: adminError } = await (supabase as any)
      .from('users')
      .select('is_admin, email')
      .eq('id', user.id)
      .single();

    if (adminError || !adminData?.is_admin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { data: result, error: rpcError } = await (supabase as any).rpc(
      'change_user_tier',
      {
        p_user_id: userId,
        p_new_tier: parsedTier,
        p_admin_id: user.id,
        p_reason: reason,
      }
    );

    if (rpcError) {
      return NextResponse.json(
        { error: rpcError.message },
        { status: 500 }
      );
    }

    if (result && typeof result === 'object' && 'success' in result) {
      if (!result.success) {
        return NextResponse.json(
          { error: result.error || 'Failed to change tier' },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        message: result.message || 'Tier changed successfully',
        data: result,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Tier changed successfully',
    });
  } catch (error: any) {
    console.error('Error changing tier:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
