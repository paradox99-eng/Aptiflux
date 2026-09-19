"use client";
import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { questionsData } from '../../questionsData';
import { CheckCircle, XCircle, Home, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

export default function Result() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const [scoreData, setScoreData] = useState(null);
  const [quizQuestionsState, setQuizQuestionsState] = useState(null);
  const submittedToDb = useRef(false);

  useEffect(() => {
    const savedStateStr = localStorage.getItem('lastQuizResult');
    if (!savedStateStr) {
      router.replace('/');
      return;
    }
    
    const state = JSON.parse(savedStateStr);
    const { topicSlug, topicTitle, quizQuestions, answers, timeSpent = {} } = state;
    if (!quizQuestions) {
      router.replace('/');
      return;
    }
    setQuizQuestionsState(quizQuestions);

    let score = 0;
    const breakdown = {};

    quizQuestions.forEach((q, idx) => {
      const isCorrect = answers[idx] === q.correctAnswer;
      if (isCorrect) score++;

      const sub = q.subtopic || 'General';
      if (!breakdown[sub]) breakdown[sub] = { total: 0, correct: 0 };
      breakdown[sub].total++;
      if (isCorrect) breakdown[sub].correct++;
    });

    const newScore = {
      date: new Date().toISOString(),
      topicTitle: topicTitle,
      score,
      total: quizQuestions.length,
      answers,
      timeSpent,
      breakdown,
      topicSlug
    };

    setScoreData(newScore);

    // Save to localStorage for backwards compatibility / offline
    const saved = localStorage.getItem('aptitudeHistory');
    const history = saved ? JSON.parse(saved) : [];
    
    // In React 18 Strict Mode, this useEffect will run twice. 
    // We should prevent saving duplicate history entries
    const isDuplicate = history.length > 0 && history[history.length - 1].date.substring(0, 20) === newScore.date.substring(0, 20) && history[history.length - 1].topicSlug === newScore.topicSlug;
    
    if (!isDuplicate) {
      history.push(newScore);
      localStorage.setItem('aptitudeHistory', JSON.stringify(history));
    }

    // Submit to Supabase Backend
    const submitToBackend = async () => {
      if (currentUser && currentUser.Uid && !submittedToDb.current) {
        submittedToDb.current = true;
        try {
          await fetch('/api/submit-test', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              student_id: currentUser.Uid,
              student_name: currentUser.name,
              topicSlug,
              topicTitle,
              score,
              totalQuestions: quizQuestions.length,
              answers
            }),
          });
        } catch (error) {
          console.error("Failed to submit score to DB:", error);
        }
      }
    };

    submitToBackend();

    // We no longer remove 'lastQuizResult' here because Strict Mode's second pass would fail and redirect to '/'
  }, [router, currentUser]);

  if (!scoreData || !quizQuestionsState) return null;

  const isSunday = new Date().getDay() === 0;
  const isWeeklyQuiz = scoreData.topicSlug === 'weekly-quiz';
  const showResults = !isWeeklyQuiz || isSunday;

  if (!showResults) {
    return (
      <div className="min-h-screen p-8 max-w-2xl mx-auto flex flex-col items-center justify-center text-center">
        <Card className="p-10 shadow-xl">
          <div className="w-20 h-20 bg-emerald-950/50 border border-emerald-900 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-500">
            <CheckCircle size={40} />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-4">Quiz Submitted!</h1>
          <p className="text-slate-400 text-lg mb-8 leading-relaxed">
            Your answers for the Weekly Quiz have been securely saved. 
            Check back this <strong>Sunday</strong> to see your score, detailed explanations, and where you rank on the Leaderboard!
          </p>
          <Link href="/">
            <Button className="px-8 py-3.5 shadow-[0_0_15px_rgba(37,99,235,0.3)]">
              <Home size={20} className="mr-2" /> Back to Dashboard
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto">
      <header className="mb-12 text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">Test Complete</h1>
        <p className="text-slate-400">Here is your performance breakdown for {scoreData.topicTitle}.</p>
      </header>

      <Card className="p-8 mb-10 text-center">
        <h2 className="text-xl text-slate-300 mb-4">Your Score</h2>
        <div className="text-6xl font-mono font-bold mb-6">
          <span className={scoreData.score / scoreData.total >= 0.5 ? 'text-emerald-500' : 'text-red-500'}>
            {scoreData.score}
          </span>
          <span className="text-slate-600"> / {scoreData.total}</span>
        </div>
        
        {scoreData.breakdown && Object.keys(scoreData.breakdown).length > 0 && (
          <div className="mb-8 max-w-md mx-auto">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Topic Breakdown</h3>
            <div className="space-y-2">
              {Object.entries(scoreData.breakdown).map(([sub, data]) => (
                <div key={sub} className="flex items-center justify-between bg-slate-900/50 px-4 py-2 rounded-md border border-slate-800">
                  <span className="text-slate-300 font-medium">{sub}</span>
                  <span className="font-mono text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                    {data.correct}/{data.total} <span className="opacity-50 text-xs ml-1">({Math.round((data.correct/data.total)*100)}%)</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <Link href="/">
          <Button className="px-6 py-3 shadow-[0_0_15px_rgba(37,99,235,0.3)]">
            <Home size={20} className="mr-2" /> Return to Dashboard
          </Button>
        </Link>
      </Card>

      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-foreground border-b border-slate-800 pb-2">Detailed Review</h2>
        {quizQuestionsState.map((q, idx) => {
          const userAnswer = scoreData.answers[idx];
          const isCorrect = userAnswer === q.correctAnswer;
          const isOmitted = !userAnswer;

          return (
            <Card 
              key={idx} 
              className="p-6 fade-in-stagger"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="mt-1">
                  {isCorrect ? (
                    <CheckCircle className="text-emerald-500" size={24} />
                  ) : (
                    <XCircle className="text-red-500" size={24} />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start gap-4 mb-3">
                    <h3 className="text-lg font-medium text-foreground">{q.text}</h3>
                    <div className="flex items-center gap-1.5 text-slate-400 bg-slate-900/50 px-2.5 py-1 rounded-full border border-slate-800 shrink-0 text-sm font-mono">
                      <Clock size={14} />
                      {scoreData.timeSpent?.[idx] || 0}s
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    {q.options.map((opt, i) => {
                      let bgColor = 'bg-slate-900/50 border-slate-800 text-slate-400';
                      if (opt === q.correctAnswer) {
                        bgColor = 'bg-emerald-950/50 border-emerald-900 text-emerald-500 font-semibold';
                      } else if (opt === userAnswer) {
                        bgColor = 'bg-red-950/50 border-red-900 text-red-500 font-semibold';
                      }
                      
                      return (
                        <div key={i} className={`p-3 rounded-md border ${bgColor}`}>
                          {opt}
                        </div>
                      )
                    })}
                  </div>
                  {(!isCorrect || isOmitted) && (
                    <div className="bg-slate-900 p-4 rounded-md border border-slate-800">
                      <span className="font-semibold text-slate-300 block mb-1">Explanation:</span>
                      <p className="text-slate-400 leading-relaxed">{q.explanation}</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

