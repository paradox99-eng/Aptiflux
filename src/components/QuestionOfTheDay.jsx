"use client";
import React, { useState, useEffect } from 'react';
import { Flame, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';

export default function QuestionOfTheDay({ currentUser }) {
  const { updateCurrentUser } = useAuth();
  const [qotd, setQotd] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState(null);
  const [submitState, setSubmitState] = useState('idle'); // 'idle', 'submitting', 'correct', 'incorrect', 'already_done'
  const [feedback, setFeedback] = useState(null); // { message, explanation, correctAnswer }
  const [streak, setStreak] = useState(currentUser?.streak_count || 0);

  useEffect(() => {
    // If the user's last active date is today, they already completed it
    const now = new Date();
    const localDate = new Date(now.getTime() - (now.getTimezoneOffset() * 60000));
    const todayStr = localDate.toISOString().split('T')[0];
    
    if (currentUser?.last_active_date === todayStr) {
      setSubmitState('already_done');
      setLoading(false);
      return;
    }

    const fetchQotd = async () => {
      try {
        const res = await fetch('/api/qotd');
        if (res.ok) {
          const data = await res.json();
          setQotd(data.question);
        }
      } catch (err) {
        console.error('Failed to fetch QotD:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchQotd();
  }, [currentUser]);

  const handleSubmit = async () => {
    if (!selectedOption || submitState !== 'idle') return;
    
    setSubmitState('submitting');
    
    const now = new Date();
    const localDate = new Date(now.getTime() - (now.getTimezoneOffset() * 60000));
    const todayStr = localDate.toISOString().split('T')[0];
    
    const yesterdayDate = new Date(now.getTime() - 86400000);
    const localYesterday = new Date(yesterdayDate.getTime() - (yesterdayDate.getTimezoneOffset() * 60000));
    const yesterdayStr = localYesterday.toISOString().split('T')[0];

    try {
      const res = await fetch('/api/qotd/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: currentUser.Uid,
          questionId: qotd.id,
          selectedAnswer: selectedOption,
          todayStr,
          yesterdayStr
        })
      });
      
      const data = await res.json();
      if (res.ok) {
        if (data.correct) {
          setSubmitState('correct');
          setStreak(data.streak_count);
          updateCurrentUser({ streak_count: data.streak_count, last_active_date: todayStr });
        } else {
          setSubmitState('incorrect');
          setStreak(0);
          updateCurrentUser({ streak_count: 0, last_active_date: todayStr });
        }
        setFeedback(data);
      } else {
        toast.error(data.error || 'Failed to submit answer');
        setSubmitState('idle');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error while submitting');
      setSubmitState('idle');
    }
  };

  if (loading) {
    return (
      <div className="glass-card border border-slate-800 rounded-2xl p-6 mb-8 flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="glass-card border border-slate-800 rounded-2xl p-6 mb-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 flex flex-col items-end">
        <div className="flex items-center gap-1 text-orange-500 font-bold bg-orange-500/10 px-3 py-1.5 rounded-full border border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.2)]">
          <Flame size={18} className={streak > 0 ? "animate-pulse" : ""} /> 
          <span>{streak} Day Streak</span>
        </div>
      </div>

      <h2 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
        Question of the Day
      </h2>
      
      {submitState === 'already_done' ? (
        <div className="mt-4 p-4 bg-emerald-950/30 border border-emerald-900/50 rounded-xl flex items-center gap-3 text-emerald-400">
          <CheckCircle size={24} />
          <div>
            <p className="font-semibold">You've already completed today's question!</p>
            <p className="text-sm opacity-80">Come back tomorrow to keep your streak going.</p>
          </div>
        </div>
      ) : qotd ? (
        <div className="mt-6">
          <p className="text-slate-200 mb-6 text-lg">{qotd.text}</p>
          
          <div className="space-y-3 mb-6">
            {qotd.options.map((opt, idx) => {
              const isSelected = selectedOption === opt;
              const isSubmitted = submitState === 'correct' || submitState === 'incorrect';
              let btnClass = "w-full text-left p-4 rounded-xl border transition-all duration-200 ";
              
              if (isSubmitted) {
                if (submitState === 'correct' && isSelected) {
                  btnClass += "bg-emerald-950/50 border-emerald-500 text-emerald-400";
                } else if (submitState === 'incorrect' && isSelected) {
                  btnClass += "bg-red-950/50 border-red-500 text-red-400";
                } else if (isSubmitted && opt === feedback?.correctAnswer) {
                  // Show the correct answer if they got it wrong
                  btnClass += "bg-emerald-950/30 border-emerald-500/50 text-emerald-400";
                } else {
                  btnClass += "bg-slate-900/50 border-slate-800 text-slate-500 opacity-50 cursor-not-allowed";
                }
              } else {
                btnClass += isSelected 
                  ? "bg-primary/20 border-primary text-primary shadow-[0_0_15px_rgba(37,99,235,0.2)]" 
                  : "bg-slate-900/50 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700 cursor-pointer";
              }

              return (
                <button
                  key={idx}
                  disabled={isSubmitted || submitState === 'submitting'}
                  onClick={() => setSelectedOption(opt)}
                  className={btnClass}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {!['correct', 'incorrect'].includes(submitState) && (
            <button
              onClick={handleSubmit}
              disabled={!selectedOption || submitState === 'submitting'}
              className="w-full sm:w-auto bg-primary text-primary-foreground font-semibold py-3 px-8 rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_20px_rgba(37,99,235,0.5)]"
            >
              {submitState === 'submitting' ? 'Submitting...' : 'Submit Answer'}
            </button>
          )}

          {feedback && (
            <div className={`mt-6 p-4 rounded-xl border ${
              submitState === 'correct' ? 'bg-emerald-950/20 border-emerald-900/50' : 'bg-red-950/20 border-red-900/50'
            }`}>
              <div className="flex items-start gap-3">
                {submitState === 'correct' ? (
                  <CheckCircle className="text-emerald-500 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="text-red-500 shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className={`font-bold ${submitState === 'correct' ? 'text-emerald-500' : 'text-red-500'}`}>
                    {feedback.message}
                  </h4>
                  <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                    {feedback.explanation}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="text-slate-400 mt-4">Failed to load question of the day.</p>
      )}
    </div>
  );
}
