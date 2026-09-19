import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export const revalidate = 0; // Dynamic route

// Define all possible badges in the system
const ALL_BADGES = [
  {
    id: 'bronze-quizzer',
    name: 'Bronze Quizzer',
    description: 'Completed your first mock test.',
    color: 'from-orange-600 to-yellow-600',
    image: '/achievement/badge.png'
  },
  {
    id: 'streak-7d',
    name: '7-Day Streak',
    description: 'Answered the Question of the Day 7 days in a row.',
    color: 'from-orange-400 to-red-600',
    image: '/achievement/task.png'
  },
  {
    id: 'streak-1m',
    name: '1-Month Streak',
    description: 'Completed a quiz in 4 different weeks.',
    color: 'from-blue-400 to-indigo-600',
    image: '/achievement/badge (1).png'
  },
  {
    id: 'streak-6m',
    name: '6-Month Streak',
    description: 'Completed a quiz in 24 different weeks.',
    color: 'from-purple-400 to-pink-600',
    image: '/achievement/achievement.png'
  },
  {
    id: 'streak-1y',
    name: '1-Year Streak',
    description: 'Completed a quiz in 52 different weeks.',
    color: 'from-red-500 to-orange-500',
    image: '/achievement/success.png'
  },
  {
    id: 'flawless',
    name: 'Flawless Victory',
    description: 'Achieved 100% on a mock test.',
    color: 'from-emerald-400 to-emerald-700',
    image: '/achievement/medal.png'
  },
  {
    id: 'rank-1',
    name: 'Champion',
    description: 'Rank 1 on the current Weekly Leaderboard.',
    color: 'from-yellow-300 to-yellow-600',
    image: '/achievement/trophy.png'
  },
  {
    id: 'rank-2',
    name: 'Silver Medalist',
    description: 'Rank 2 on the current Weekly Leaderboard.',
    color: 'from-slate-300 to-slate-500',
    image: '/achievement/trophy (1).png'
  },
  {
    id: 'rank-3',
    name: 'Bronze Medalist',
    description: 'Rank 3 on the current Weekly Leaderboard.',
    color: 'from-amber-600 to-amber-800',
    image: '/achievement/trophy (2).png'
  }
];

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const student_id = searchParams.get('student_id');

  if (!student_id) {
    return NextResponse.json({ error: 'Missing student_id' }, { status: 400 });
  }

  try {
    // 1. Fetch user attempts
    const { data: attempts, error: attemptsError } = await supabase
      .from('attempts')
      .select('*')
      .eq('student_id', student_id)
      .order('submitted_at', { ascending: false });

    if (attemptsError) throw attemptsError;

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
    let totalQuizzes = attempts?.length || 0;

    if (totalQuizzes > 0) earnedIds.add('bronze-quizzer');
    if (streakCount >= 7) earnedIds.add('streak-7d');

    attempts?.forEach(a => {
      if (a.score === a.total_questions && a.total_questions > 0) {
        flawless = true;
      }
    });

    if (flawless) earnedIds.add('flawless');

    const weeksSet = new Set();
    attempts?.forEach(a => {
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

    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const startOfWeek = new Date(today.setDate(diff));
    startOfWeek.setHours(0, 0, 0, 0);

    const { data: lbAttempts } = await supabase
      .from('attempts')
      .select('student_id, score, total_questions')
      .eq('topic_slug', 'weekly-quiz')
      .gte('submitted_at', startOfWeek.toISOString());

    if (lbAttempts) {
      const leaderboardMap = {};
      lbAttempts.forEach(attempt => {
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
