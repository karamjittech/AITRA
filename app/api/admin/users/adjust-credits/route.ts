import { NextResponse } from 'next/server';
import { createServerClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
  try {
    const { userId, creditChange, reason } = await request.json();

    if (!userId || creditChange === undefined || !reason) {
      return NextResponse.json(
        { error: 'User ID, credit change, and reason are required' },
        { status: 400 }
      );
    }

    const parsedCreditChange = parseInt(creditChange);
    if (isNaN(parsedCreditChange)) {
      return NextResponse.json(
        { error: 'Invalid credit change value' },
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
      'adjust_user_credits',
      {
        p_user_id: userId,
        p_credit_change: parsedCreditChange,
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
          { error: result.error || 'Failed to adjust credits' },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        message: result.message || 'Credits adjusted successfully',
        data: result,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Credits adjusted successfully',
    });
  } catch (error: any) {
    console.error('Error adjusting credits:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
