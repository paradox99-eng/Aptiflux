import { supabase } from '../../lib/supabase';
import LeaderboardClient from './LeaderboardClient';

export const revalidate = 60; // Cache the page for 60 seconds

export default async function LeaderboardPage() {
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

  let leaderboard = [];

  if (!error && attempts) {
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
    leaderboard = Object.values(leaderboardMap).sort((a, b) => b.totalScore - a.totalScore);

    // Assign dense ranking
    let currentRank = 1;
    for (let i = 0; i < leaderboard.length; i++) {
      if (i > 0 && leaderboard[i].totalScore < leaderboard[i - 1].totalScore) {
        currentRank++;
      }
      leaderboard[i].rank = currentRank;
    }
  }

  return <LeaderboardClient initialLeaderboard={leaderboard} error={error?.message} />;
}
