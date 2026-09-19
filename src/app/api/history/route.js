import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';
import { apiHandler } from '../../../lib/api-handler';

export const GET = apiHandler(async (request, context, session) => {
  const { searchParams } = new URL(request.url);
  const student_id = searchParams.get('student_id');

  if (!student_id) {
    return NextResponse.json({ error: 'Missing student_id parameter' }, { status: 400 });
  }
  
  if (session.userId !== student_id) {
    return NextResponse.json({ error: 'Forbidden: ID mismatch' }, { status: 403 });
  }

  const { data, error } = await supabase
    .from('attempts')
    .select('id, topic_slug, topic_title, score, total_questions, submitted_at')
    .eq('student_id', student_id)
    .order('submitted_at', { ascending: false });

  if (error) {
    throw new Error('Failed to fetch history');
  }

  // Map to frontend expected format
  const history = data.map(attempt => ({
    id: attempt.id,
    topicSlug: attempt.topic_slug,
    topicTitle: attempt.topic_title,
    score: attempt.score,
    total: attempt.total_questions,
    date: attempt.submitted_at
  }));

  return NextResponse.json({ history }, { status: 200 });
});
