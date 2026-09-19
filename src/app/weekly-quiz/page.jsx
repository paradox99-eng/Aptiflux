"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { questionsData } from '../../questionsData';
import { getWeekNumber } from '../../utils/quizGenerator';
import { Clock, ChevronLeft, ChevronRight, CheckCircle, Flag, Lock, Loader2, Info } from 'lucide-react';
import Calculator from '../../components/Calculator';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

export default function WeeklyQuiz() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const [isClient, setIsClient] = useState(false);

  const [quizQuestions, setQuizQuestions] = useState([]);
  const [quizLoading, setQuizLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [reviewed, setReviewed] = useState(new Set());
  const [timeLeft, setTimeLeft] = useState(600);
  const [timeSpent, setTimeSpent] = useState({});
  const [weekId, setWeekId] = useState("");
  const [hasTaken, setHasTaken] = useState(false);
  const [checkingAttempt, setCheckingAttempt] = useState(true);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    async function fetchWeeklyQuiz() {
      try {
        const now = new Date();
        const { year, week } = getWeekNumber(now);
        const currentWeekId = `${year}-W${week}`;
        setWeekId(currentWeekId);

        const { data, error } = await supabase
          .from('weekly_quizzes')
          .select('*')
          .eq('week_id', currentWeekId)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            // Quiz doesn't exist for this week yet
            setQuizQuestions([]);
          } else {
            console.error("Error fetching quiz:", error);
          }
        } else if (data) {
          setQuizQuestions(data.questions);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setQuizLoading(false);
      }
    }
    fetchWeeklyQuiz();
  }, []);

  useEffect(() => {
    async function checkAttempt() {
      if (!currentUser || !currentUser.Uid || !weekId) {
         setCheckingAttempt(false);
         return;
      }
      
      setCheckingAttempt(true);
      try {
        const { data, error } = await supabase
          .from('attempts')
          .select('id')
          .eq('student_id', currentUser.Uid)
          .eq('topic_slug', 'weekly-quiz')
          .eq('topic_title', `Weekly Quiz (${weekId})`)
          .limit(1);
          
        if (data && data.length > 0) {
          setHasTaken(true);
        }
      } catch(e) {
        console.error(e);
      } finally {
        setCheckingAttempt(false);
      }
    }
    
    checkAttempt();
  }, [currentUser, weekId]);

  useEffect(() => {
    if (quizQuestions.length === 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
      setTimeSpent(prev => ({
        ...prev,
        [currentIdx]: (prev[currentIdx] || 0) + 1
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, [quizQuestions.length, currentIdx]);

  useEffect(() => {
    if (timeLeft === 0 && quizQuestions.length > 0) {
      handleSubmit();
    }
  }, [timeLeft, quizQuestions.length]);

  const handleSubmit = () => {
    const resultState = {
      topicSlug: 'weekly-quiz',
      topicTitle: `Weekly Quiz (${weekId})`,
      quizQuestions: quizQuestions,
      answers: answers,
      timeSpent: timeSpent
    };
    localStorage.setItem('lastQuizResult', JSON.stringify(resultState));
    router.push('/result');
  };

  const handleSelect = (opt) => {
    setAnswers(prev => ({ ...prev, [currentIdx]: opt }));
  };

  const toggleReview = () => {
    setReviewed(prev => {
      const next = new Set(prev);
      if (next.has(currentIdx)) next.delete(currentIdx);
      else next.add(currentIdx);
      return next;
    });
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!isClient) return null;

  if (!currentUser) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center bg-background/80 animate-in fade-in duration-300">
        <div className="glass-card w-full sm:max-w-md sm:mx-auto p-8 pt-6 sm:p-8 rounded-t-[2rem] sm:rounded-2xl text-center shadow-xl relative overflow-hidden animate-in slide-in-from-bottom-10 duration-300 border border-slate-800">
          <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mb-6 sm:hidden"></div>
          
          <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-6 text-primary">
            <Lock size={40} />
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-3">Login Required</h2>
          <p className="text-slate-400 mb-8 leading-relaxed px-2">
            You must be logged in to view topics and take mock tests. Create an account to track your progress!
          </p>
          <div className="flex flex-col gap-3">
            <Link 
              href="/login"
              className="w-full bg-primary text-primary-foreground py-4 sm:py-3 rounded-2xl sm:rounded-xl font-bold text-lg sm:text-base hover:bg-primary/90 transition-colors shadow-[0_0_15px_rgba(37,99,235,0.3)] active:scale-[0.98]"
            >
              Log In to Continue
            </Link>
            <Link 
              href="/"
              className="w-full bg-slate-800 text-slate-300 border border-slate-700 py-4 sm:py-3 rounded-2xl sm:rounded-xl font-bold text-lg sm:text-base hover:bg-slate-700 transition-colors active:scale-[0.98]"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (checkingAttempt || quizLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin text-primary w-8 h-8" />
      </div>
    );
  }

  if (quizQuestions.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center bg-background/80 animate-in fade-in duration-300">
        <div className="glass-card w-full sm:max-w-md sm:mx-auto p-8 pt-6 sm:p-8 rounded-t-[2rem] sm:rounded-2xl text-center shadow-xl relative overflow-hidden animate-in slide-in-from-bottom-10 duration-300 border border-slate-800">
          <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mb-6 sm:hidden"></div>
          
          <div className="w-20 h-20 mx-auto bg-slate-800/50 rounded-full flex items-center justify-center mb-6 text-slate-400">
            <Info size={40} />
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-3">Quiz Not Ready</h2>
          <p className="text-slate-400 mb-8 leading-relaxed px-2">
            The Weekly Quiz for this week ({weekId}) has not been published yet. Please check back later!
          </p>
          <div className="flex flex-col gap-3">
            <Link 
              href="/"
              className="w-full bg-slate-800 text-slate-300 border border-slate-700 py-4 sm:py-3 rounded-2xl sm:rounded-xl font-bold text-lg sm:text-base hover:bg-slate-700 transition-colors active:scale-[0.98]"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (hasTaken) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center bg-background/80 animate-in fade-in duration-300">
        <div className="glass-card w-full sm:max-w-md sm:mx-auto p-8 pt-6 sm:p-8 rounded-t-[2rem] sm:rounded-2xl text-center shadow-xl relative overflow-hidden animate-in slide-in-from-bottom-10 duration-300 border border-slate-800">
          <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mb-6 sm:hidden"></div>
          
          <div className="w-20 h-20 mx-auto bg-amber-950/50 rounded-full flex items-center justify-center mb-6 text-amber-500">
            <CheckCircle size={40} />
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-3">Already Completed</h2>
          <p className="text-slate-400 mb-8 leading-relaxed px-2">
            You have already submitted the Weekly Quiz for this week. Check back on Sunday for the Leaderboard, or wait until next Monday for a fresh quiz!
          </p>
          <div className="flex flex-col gap-3">
            <Link 
              href="/"
              className="w-full bg-slate-800 text-slate-300 border border-slate-700 py-4 sm:py-3 rounded-2xl sm:rounded-xl font-bold text-lg sm:text-base hover:bg-slate-700 transition-colors active:scale-[0.98]"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = quizQuestions[currentIdx];
  const isDanger = timeLeft < 60;

  return (
    <div className="min-h-[calc(100dvh-80px)] p-2 md:p-4 max-w-5xl mx-auto flex flex-col">
      <div className="flex-1 flex flex-col lg:flex-row gap-4 items-start justify-center fade-in-stagger">
        
        {/* Quiz Column */}
        <div className="flex-1 w-full max-w-3xl flex flex-col">
          <header className="shrink-0 flex justify-between items-center mb-3 pb-3 border-b border-border-subtle">
            <h1 className="text-lg font-bold text-foreground">Weekly Quiz - {weekId}</h1>
            <div 
              className={`flex items-center gap-2 font-mono text-base font-semibold px-3 py-1.5 rounded-lg bg-slate-900 border shadow-sm ${
                isDanger ? 'text-incorrect border-incorrect animate-pulse scale-105 shadow-[0_0_10px_rgba(255,0,0,0.5)]' : 'text-slate-300 border-slate-700'
              }`}
              aria-live="polite"
            >
              <Clock size={18} />
              {formatTime(timeLeft)}
            </div>
          </header>

          <main className="glass-card border border-slate-800 p-4 md:p-6 rounded-xl mb-3 flex-1 flex flex-col md:flex-row gap-6">
            
            {currentQ.passage && (
               <div className="md:w-1/2 md:pr-4 md:border-r border-slate-800 flex flex-col">
                  <h3 className="font-bold text-slate-300 mb-2">Passage</h3>
                  <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    <p className="text-sm text-slate-400 whitespace-pre-wrap leading-relaxed max-h-64 md:max-h-full">
                      {currentQ.passage}
                    </p>
                  </div>
               </div>
            )}
            
            <div className={`flex flex-col ${currentQ.passage ? "md:w-1/2" : "w-full"}`}>
              <div className="mb-4 flex justify-between items-center text-xs font-semibold text-slate-400">
                <span>Question {currentIdx + 1} of {quizQuestions.length}</span>
                <span className="bg-primary/10 text-primary px-2 py-1 rounded-full">{currentQ.weeklyTopic}</span>
              </div>
              
              <h2 className="text-base sm:text-lg text-foreground mb-5 leading-snug whitespace-pre-wrap">
                {currentQ.text}
              </h2>

              <div className="space-y-2.5">
                {currentQ.options && currentQ.options.map((opt, i) => {
                  const isSelected = answers[currentIdx] === opt;
                  return (
                    <button
                      key={i}
                      onClick={() => handleSelect(opt)}
                      className={`w-full text-left p-3 text-sm sm:text-base rounded-lg border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                        isSelected 
                          ? 'border-primary bg-primary/10 text-primary font-semibold shadow-[0_0_10px_rgba(37,99,235,0.2)]' 
                          : 'border-slate-800 hover:border-primary/30 text-slate-300 bg-slate-900/50'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          </main>

          <footer className="shrink-0 flex justify-between items-center glass-card p-3 rounded-xl border border-slate-800 text-sm">
            <button
              onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
              disabled={currentIdx === 0}
              aria-label="Previous question"
              className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-md font-semibold text-slate-300 hover:bg-slate-800 disabled:opacity-50 transition-colors"
            >
              <ChevronLeft size={18} /> <span className="hidden sm:inline">Previous</span>
            </button>
            
            <button
              onClick={toggleReview}
              aria-label={reviewed.has(currentIdx) ? "Marked as reviewed" : "Mark for review"}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-md font-semibold transition-colors border ${
                reviewed.has(currentIdx) 
                  ? 'bg-amber-950 text-amber-500 hover:bg-amber-900 border-amber-900' 
                  : 'bg-transparent text-slate-300 hover:bg-slate-800 border-transparent'
              }`}
            >
              <Flag size={16} className={reviewed.has(currentIdx) ? 'fill-amber-500' : ''} /> 
              <span className="hidden sm:inline">{reviewed.has(currentIdx) ? 'Reviewed' : 'Review'}</span>
            </button>
            
            {currentIdx === quizQuestions.length - 1 ? (
              <button
                onClick={handleSubmit}
                className="flex items-center gap-1.5 bg-accent text-accent-foreground px-4 py-1.5 rounded-md font-semibold hover:bg-accent/90 transition-colors shadow-[0_0_15px_rgba(255,51,153,0.3)] hover:shadow-[0_0_20px_rgba(255,51,153,0.5)]"
              >
                Submit <CheckCircle size={18} />
              </button>
            ) : (
              <button
                onClick={() => setCurrentIdx(prev => Math.min(quizQuestions.length - 1, prev + 1))}
                aria-label="Next question"
                className="flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-1.5 rounded-md font-semibold hover:bg-primary/90 transition-colors shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_20px_rgba(37,99,235,0.5)]"
              >
                <span className="hidden sm:inline">Next</span> <ChevronRight size={18} />
              </button>
            )}
          </footer>
        </div>

        {/* Tools Column */}
        <div className="flex flex-col gap-4 w-full lg:w-56 shrink-0 mt-4 lg:mt-0">
          
          <div className="glass-card border border-slate-800 p-4 rounded-xl">
            <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center justify-between">
              Navigator
              <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded-full border border-slate-700">{answers && Object.keys(answers).length}/10</span>
            </h3>
            <div className="grid grid-cols-5 gap-2 lg:gap-1.5">
              {quizQuestions.map((_, i) => {
                const isAnswered = answers[i] !== undefined;
                const isReviewed = reviewed.has(i);
                const isCurrent = currentIdx === i;
                
                let btnStyle = "bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800";
                
                if (isReviewed) {
                  btnStyle = "bg-amber-950 text-amber-500 border-amber-900 hover:bg-amber-900";
                } else if (isAnswered) {
                  btnStyle = "bg-emerald-950 text-emerald-500 border-emerald-900 hover:bg-emerald-900";
                }

                if (isCurrent) {
                  btnStyle += " ring-2 ring-primary ring-offset-1 ring-offset-slate-900 shadow-[0_0_8px_rgba(37,99,235,0.6)]";
                }

                return (
                  <button
                    key={i}
                    onClick={() => {
                      setCurrentIdx(i);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`aspect-square rounded-md font-semibold text-[13px] lg:text-[11px] border transition-all flex items-center justify-center ${btnStyle}`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
            
            <div className="mt-4 lg:mt-3 flex flex-col gap-2 lg:gap-1.5 text-xs lg:text-[10px] text-slate-400">
              <div className="flex items-center gap-2 lg:gap-1.5"><div className="w-3 h-3 lg:w-2.5 lg:h-2.5 rounded-sm bg-emerald-950 border border-emerald-900"></div> Answered</div>
              <div className="flex items-center gap-2 lg:gap-1.5"><div className="w-3 h-3 lg:w-2.5 lg:h-2.5 rounded-sm bg-amber-950 border border-amber-900"></div> Marked</div>
              <div className="flex items-center gap-2 lg:gap-1.5"><div className="w-3 h-3 lg:w-2.5 lg:h-2.5 rounded-sm bg-slate-900 border border-slate-800"></div> Unanswered</div>
            </div>
          </div>

          <div className="pb-8 lg:pb-0">
            <Calculator />
          </div>
        </div>
      </div>
    </div>
  );
}

