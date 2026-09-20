import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';
import { ALL_BADGES } from '../../../lib/badges';

export const revalidate = 0;

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const uid = searchParams.get('uid');

  if (!uid) {
    return NextResponse.json({ error: 'Missing uid parameter' }, { status: 400 });
  }

  try {
    // 1. Fetch student info (no email)
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('name, stream, streak_count')
      .eq('Uid', uid)
      .single();

    if (studentError || !student) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 2. Fetch aggregate stats from attempts
    const { data: attempts, error: attemptsError } = await supabase
      .from('attempts')
      .select('score, total_questions, topic_slug')
      .eq('student_id', uid);

    if (attemptsError) {
      throw new Error('Failed to fetch stats');
    }

    const totalTests = attempts ? attempts.length : 0;
    
    let overallAvg = 0;
    if (totalTests > 0) {
      const isSunday = new Date().getDay() === 0;
      const scoredAttempts = attempts.filter(a => a.topic_slug !== 'weekly-quiz' || isSunday);

      const totalScore = scoredAttempts.reduce((acc, curr) => acc + curr.score, 0);
      const totalPossible = scoredAttempts.reduce((acc, curr) => acc + curr.total_questions, 0);
      overallAvg = totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : 0;
    }

    // 3. Fetch claimed badges
    const { data: claimedRecords } = await supabase
      .from('user_badges')
      .select('badge_id')
      .eq('student_id', uid);

    const claimedIds = new Set((claimedRecords || []).map(r => r.badge_id));
    const claimedBadges = ALL_BADGES.filter(badge => claimedIds.has(badge.id));

    return NextResponse.json({
      name: student.name,
      stream: student.stream,
      streak_count: student.streak_count || 0,
      total_tests: totalTests,
      average_score: overallAvg,
      claimed_badges: claimedBadges
    }, { status: 200 });

  } catch (error) {
    console.error('Public profile API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
