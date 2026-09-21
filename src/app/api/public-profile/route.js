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
    // Fetch all data in parallel to reduce loading time
    const [studentRes, attemptsRes, badgesRes] = await Promise.all([
      supabase.from('students').select('name, stream, streak_count, email').eq('Uid', uid).single(),
      supabase.from('attempts').select('score, total_questions, topic_slug, submitted_at').eq('student_id', uid),
      supabase.from('user_badges').select('badge_id').eq('student_id', uid)
    ]);

    if (studentRes.error || !studentRes.data) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (attemptsRes.error) {
      throw new Error('Failed to fetch stats');
    }

    const student = studentRes.data;
    const attempts = attemptsRes.data;
    const claimedRecords = badgesRes.data;

    const totalTests = attempts ? attempts.length : 0;
    
    let overallAvg = 0;
    if (totalTests > 0) {
      const { getWeekNumber } = require('../../../utils/quizGenerator');
      const currentWeek = getWeekNumber(new Date());
      const isSunday = new Date().getDay() === 0;

      const isAdminProfile = student.email === 'parthibdutta947@gmail.com';
      const isScoreHidden = (test) => {
        if (isAdminProfile) return false;
        if (test.topic_slug !== 'weekly-quiz' && test.topic_slug !== 'weekly') return false;
        const testDate = new Date(test.submitted_at || Date.now());
        const testWeek = getWeekNumber(testDate);
        if (testWeek.year < currentWeek.year) return false;
        if (testWeek.year === currentWeek.year && testWeek.week < currentWeek.week) return false;
        return !isSunday;
      };

      const scoredAttempts = attempts.filter(a => !isScoreHidden(a));

      const totalScore = scoredAttempts.reduce((acc, curr) => acc + curr.score, 0);
      const totalPossible = scoredAttempts.reduce((acc, curr) => acc + curr.total_questions, 0);
      overallAvg = totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : 0;
    }

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
