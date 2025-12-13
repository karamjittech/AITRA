import { NextResponse } from 'next/server';
import { createServerClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
  try {
    const { code, reason } = await request.json();

    if (!code || !reason) {
      return NextResponse.json(
        { error: 'Code and reason are required' },
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

    const { data: userData, error: userError } = await (supabase as any)
      .from('users')
      .select('is_admin, email')
      .eq('id', user.id)
      .single();

    if (userError || !userData?.is_admin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { data: result, error: rpcError } = await (supabase as any).rpc(
      'revoke_redemption_code',
      {
        p_code: code,
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
          { error: result.error || 'Failed to revoke code' },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        message: result.message || 'Code revoked successfully',
        data: result,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Code revoked successfully',
    });
  } catch (error: any) {
    console.error('Error revoking code:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
