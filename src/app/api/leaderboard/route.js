import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export const revalidate = 60; // Cache for 60 seconds to improve LCP

export async function GET() {
  try {
    // Calculate the start of the current week (Monday at 00:00:00)
    const today = new Date();
    const day = today.getDay(); // 0 is Sunday, 1 is Monday, etc.
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    const startOfWeek = new Date(today.setDate(diff));
    startOfWeek.setHours(0, 0, 0, 0);

    // Fetch attempts from this week
    const { data: attempts, error } = await supabase
      .from('attempts')
      .select('student_id, student_name, score, total_questions, submitted_at')
      .eq('topic_slug', 'weekly-quiz')
      .gte('submitted_at', startOfWeek.toISOString());

    if (error) {
      console.error('Supabase error fetching leaderboard:', error);
      return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
    }

    // Aggregate scores by student
    const leaderboardMap = {};

    attempts.forEach(attempt => {
      const { student_id, student_name, score, total_questions } = attempt;
      if (!leaderboardMap[student_id]) {
        leaderboardMap[student_id] = {
          student_id,
          student_name,
          totalScore: 0,
          totalQuestions: 0,
          testsTaken: 0
        };
      }
      leaderboardMap[student_id].totalScore += score;
      leaderboardMap[student_id].totalQuestions += total_questions;
      leaderboardMap[student_id].testsTaken += 1;
    });

    // Convert map to array and sort by totalScore descending
    const leaderboard = Object.values(leaderboardMap).sort((a, b) => b.totalScore - a.totalScore);

    // Assign dense ranking (tied scores share the same rank number)
    let currentRank = 1;
    for (let i = 0; i < leaderboard.length; i++) {
      if (i > 0 && leaderboard[i].totalScore < leaderboard[i - 1].totalScore) {
        currentRank++;
      }
      leaderboard[i].rank = currentRank;
    }

    return NextResponse.json({ leaderboard }, { status: 200 });
  } catch (error) {
    console.error('Leaderboard error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
