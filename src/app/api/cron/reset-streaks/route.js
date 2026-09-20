import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabase-admin';

export async function GET(request) {
  // Check authorization header for Vercel Cron
  // You must set CRON_SECRET in Vercel Environment Variables
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Reset streak_count to 0 for all users
    const { error } = await supabaseAdmin
      .from('students')
      .update({ streak_count: 0 })
      .not('email', 'is', null); // Safe condition to update all rows

    if (error) {
      console.error('Error resetting streaks:', error);
      return NextResponse.json({ error: 'Failed to reset streaks' }, { status: 500 });
    }

    return NextResponse.json({ message: 'All streaks reset to 0' }, { status: 200 });
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
