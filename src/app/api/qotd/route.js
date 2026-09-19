import { NextResponse } from 'next/server';
import { questionsData } from '../../../questionsData';

export async function GET() {
  try {
    // Flatten all questions into a single array
    const allQuestions = [];
    for (const category in questionsData) {
      if (questionsData[category] && questionsData[category].questions) {
        allQuestions.push(...questionsData[category].questions);
      }
    }

    if (allQuestions.length === 0) {
      return NextResponse.json({ error: 'No questions available' }, { status: 404 });
    }

    // Use the current day as a seed so the question is the same for everyone on a given day
    // Math.floor(Date.now() / 86400000) gives the number of days since epoch
    // Offset by timezone if needed, but UTC is fine for a global QOTD
    const currentDay = Math.floor(Date.now() / 86400000);
    const questionIndex = currentDay % allQuestions.length;
    
    const selectedQuestion = allQuestions[questionIndex];

    // Don't send the correct answer to the client for the daily question to prevent cheating
    const { correctAnswer, explanation, ...clientQuestion } = selectedQuestion;

    return NextResponse.json({ question: clientQuestion });
  } catch (error) {
    console.error('Error fetching QOTD:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
