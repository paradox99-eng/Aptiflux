import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabase-admin';
import { apiHandler } from '../../../../lib/api-handler';

export const POST = apiHandler(async (request, context, session) => {
  const { student_id, badge_id } = await request.json();

  if (!student_id || !badge_id) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }

  if (session.userId !== student_id) {
    return NextResponse.json({ error: 'Forbidden: ID mismatch' }, { status: 403 });
  }

  // Insert into user_badges
  const { data, error } = await supabaseAdmin
    .from('user_badges')
    .insert([{ student_id, badge_id }]);

  if (error) {
    if (error.code === '23505') {
      // Unique constraint violation - already claimed
      return NextResponse.json({ message: 'Badge already claimed' }, { status: 200 });
    }
    throw error;
  }

  return NextResponse.json({ success: true }, { status: 200 });
});
