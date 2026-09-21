import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';
import { ALL_BADGES } from '../../../lib/badges';
import { getWeekNumber } from '../../../utils/quizGenerator';

export const revalidate = 0; // Dynamic route

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const student_id = searchParams.get('student_id');

  if (!student_id) {
    return NextResponse.json({ error: 'Missing student_id' }, { status: 400 });
  }

  try {
    // 1. Fetch user attempts
    const { data: rawAttempts, error: attemptsError } = await supabase
      .from('attempts')
      .select('*')
      .eq('student_id', student_id)
      .order('submitted_at', { ascending: false });

    if (attemptsError) throw attemptsError;

    // Filter out attempts that are still hidden (weekly quiz before Sunday)
    const today = new Date();
    const currentWeek = getWeekNumber(today);
    const isSunday = today.getDay() === 0;

    const isScoreHidden = (test) => {
      if (test.topic_slug !== 'weekly-quiz' && test.topic_slug !== 'weekly') return false;
      const testDate = new Date(test.submitted_at || Date.now());
      const testWeek = getWeekNumber(testDate);
      if (testWeek.year < currentWeek.year) return false;
      if (testWeek.year === currentWeek.year && testWeek.week < currentWeek.week) return false;
      return !isSunday;
    };

    const attempts = (rawAttempts || []).filter(a => !isScoreHidden(a));

    // Fetch student data for streak count
    const { data: studentRecord } = await supabase
      .from('students')
      .select('streak_count')
      .eq('Uid', student_id)
      .single();

    const streakCount = studentRecord?.streak_count || 0;

    // 2. Fetch claimed badges from user_badges table
    const { data: claimedRecords, error: claimedError } = await supabase
      .from('user_badges')
      .select('badge_id, claimed_at')
      .eq('student_id', student_id);
    
    // Ignore error if table doesn't exist yet so it doesn't crash before migration
    const claimedIds = new Set((claimedRecords || []).map(r => r.badge_id));

    // Calculate dynamically earned conditions
    const earnedIds = new Set();

    let flawless = false;
    let totalQuizzes = attempts.length;

    if (totalQuizzes > 0) earnedIds.add('bronze-quizzer');
    if (streakCount >= 7) earnedIds.add('streak-7d');

    attempts.forEach(a => {
      if (a.score === a.total_questions && a.total_questions > 0) {
        flawless = true;
      }
    });

    if (flawless) earnedIds.add('flawless');

    const weeksSet = new Set();
    attempts.forEach(a => {
      const d = new Date(a.submitted_at);
      const firstDayOfYear = new Date(d.getFullYear(), 0, 1);
      const pastDaysOfYear = (d.getTime() - firstDayOfYear.getTime()) / 86400000;
      const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
      weeksSet.add(`${d.getFullYear()}-W${weekNum}`);
    });

    const uniqueWeeks = weeksSet.size;
    if (uniqueWeeks >= 4) earnedIds.add('streak-1m');
    if (uniqueWeeks >= 24) earnedIds.add('streak-6m');
    if (uniqueWeeks >= 52) earnedIds.add('streak-1y');

    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const startOfWeek = new Date(today.setDate(diff));
    startOfWeek.setHours(0, 0, 0, 0);

    const { data: lbAttempts } = await supabase
      .from('attempts')
      .select('student_id, score, total_questions, submitted_at, topic_slug')
      .eq('topic_slug', 'weekly-quiz')
      .gte('submitted_at', startOfWeek.toISOString());

    if (lbAttempts) {
      // Filter out hidden attempts for leaderboard as well
      const visibleLbAttempts = lbAttempts.filter(a => !isScoreHidden(a));

      const leaderboardMap = {};
      visibleLbAttempts.forEach(attempt => {
        const { student_id: sid, score } = attempt;
        if (!leaderboardMap[sid]) leaderboardMap[sid] = 0;
        leaderboardMap[sid] += score;
      });

      const sortedIds = Object.keys(leaderboardMap).sort((a, b) => leaderboardMap[b] - leaderboardMap[a]);
      
      let userRank = -1;
      let currentRank = 1;
      let previousScore = -1;

      for (let i = 0; i < sortedIds.length; i++) {
        const sid = sortedIds[i];
        const score = leaderboardMap[sid];
        if (i > 0 && score < previousScore) currentRank++;
        if (sid === student_id) { userRank = currentRank; break; }
        previousScore = score;
      }

      if (userRank === 1) earnedIds.add('rank-1');
      if (userRank === 2) earnedIds.add('rank-2');
      if (userRank === 3) earnedIds.add('rank-3');
    }

    // Process badges into claimed, claimable, and locked lists
    const claimed = [];
    const claimable = [];
    const locked = [];

    ALL_BADGES.forEach(badge => {
      if (claimedIds.has(badge.id)) {
        claimed.push({ ...badge, status: 'claimed' });
      } else if (earnedIds.has(badge.id)) {
        claimable.push({ ...badge, status: 'claimable' });
      } else {
        locked.push({ ...badge, status: 'locked' });
      }
    });

    return NextResponse.json({ claimed, claimable, locked }, { status: 200 });

  } catch (error) {
    console.error('Badges API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
