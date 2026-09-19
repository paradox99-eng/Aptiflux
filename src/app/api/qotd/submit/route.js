import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabase-admin';
import { questionsData } from '../../../../questionsData';
import { apiHandler } from '../../../../lib/api-handler';

export const POST = apiHandler(async (request, context, session) => {
  const { uid, questionId, selectedAnswer } = await request.json();

  if (!uid || !questionId || !selectedAnswer) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  if (session.userId !== uid) {
    return NextResponse.json({ error: 'Forbidden: ID mismatch' }, { status: 403 });
  }

  // Flatten all questions to find the one that was answered
  let targetQuestion = null;
  for (const category in questionsData) {
    if (questionsData[category]?.questions) {
      targetQuestion = questionsData[category].questions.find(q => q.id === questionId);
      if (targetQuestion) break;
    }
  }

  if (!targetQuestion) {
    return NextResponse.json({ error: 'Question not found' }, { status: 404 });
  }

  const isCorrect = targetQuestion.correctAnswer === selectedAnswer;

  // Fetch current streak data
  const { data: student, error: fetchError } = await supabaseAdmin
    .from('students')
    .select('streak_count, last_active_date')
    .eq('Uid', uid)
    .single();

  if (fetchError) {
    throw new Error('Failed to fetch user data'); // apiHandler will catch this and return 500
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = yesterdayDate.toISOString().split('T')[0];

  let newStreak = student.streak_count || 0;
  let message = 'Streak maintained!';

  if (student.last_active_date === todayStr) {
    message = 'Already completed Question of the Day today.';
  } else if (!isCorrect) {
    newStreak = 0;
    message = 'Incorrect answer. Try again tomorrow!';
  } else if (student.last_active_date === yesterdayStr) {
    newStreak += 1;
    message = 'Streak increased!';
  } else {
    newStreak = 1;
    message = 'Started a new streak!';
  }

  if (student.last_active_date !== todayStr) {
    const { error: updateError } = await supabaseAdmin
      .from('students')
      .update({ streak_count: newStreak, last_active_date: todayStr })
      .eq('Uid', uid);

    if (updateError) {
      throw new Error('Failed to update streak');
    }
  }

  return NextResponse.json({
    correct: isCorrect,
    explanation: targetQuestion.explanation,
    ...( !isCorrect && { correctAnswer: targetQuestion.correctAnswer } ), // DRY conditional inclusion
    streak_count: newStreak,
    message
  });
});
