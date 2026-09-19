import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabase-admin';
import { apiHandler } from '../../../lib/api-handler';

export const POST = apiHandler(async (request, context, session) => {
  const { student_id, student_name, topicSlug, topicTitle, score, totalQuestions, answers } = await request.json();

  if (!student_id || !topicSlug || score === undefined || !totalQuestions) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  if (session.userId !== student_id) {
    return NextResponse.json({ error: 'Forbidden: ID mismatch' }, { status: 403 });
  }

  // Insert into Supabase attempts table
  const { data, error } = await supabaseAdmin
    .from('attempts')
    .insert([
      {
        student_id,
        student_name,
        topic_slug: topicSlug,
        topic_title: topicTitle,
        score,
        total_questions: totalQuestions,
        answers
      }
    ])
    .select()
    .single();

  if (error) {
    throw new Error('Failed to submit test');
  }

  return NextResponse.json({ attempt: data }, { status: 201 });
});
