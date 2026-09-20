import { NextResponse } from 'next/server';
import { verifySession } from '../../../../lib/session';

export async function GET() {
  const session = await verifySession();

  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  // Fetch full user details from Supabase
  const { supabase } = await import('../../../../lib/supabase');
  
  const { data: user, error } = await supabase
    .from('students')
    .select('Uid, name, email, stream, last_active_date, streak_count')
    .eq('Uid', session.userId)
    .single();

  if (error || !user) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      ...user,
      role: session.role
    }
  }, { 
    status: 200,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
    }
  });
}
