"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { questionsData } from '../../../questionsData';
import { Clock, ChevronLeft, ChevronRight, CheckCircle, Flag, Lock } from 'lucide-react';
import Calculator from '../../../components/Calculator';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';

function QuizContent({ topicName }) {
  const searchParams = useSearchParams();
  const subtopicFilter = searchParams.get('subtopic');
  const router = useRouter();
  const topic = questionsData[topicName];
  const { currentUser } = useAuth();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (!topic) {
      router.replace('/');
    }
  }, [topic, router]);

  const [quizQuestions, setQuizQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [reviewed, setReviewed] = useState(new Set());
  const [timeLeft, setTimeLeft] = useState(600);
  const [timeSpent, setTimeSpent] = useState({});
  const [mobileTab, setMobileTab] = useState('quiz');

  useEffect(() => {
    if (!topic) return;
    const seenStorage = JSON.parse(localStorage.getItem('seenQuestions') || '[]');
    let seenQuestions = new Set(seenStorage);

    let availableQuestions = [...topic.questions];
    if (subtopicFilter) {
      availableQuestions = availableQuestions.filter(q => q.subtopic === subtopicFilter);
    }
    
    let freshQuestions = availableQuestions.filter(q => !seenQuestions.has(q.id));
    
    if (freshQuestions.length < 10) {
      alert("You have exhausted all fresh questions for this topic! Resetting your memory so you can continue practicing.");
      const availableIds = new Set(availableQuestions.map(q => q.id));
      const newSeenStorage = seenStorage.filter(id => !availableIds.has(id));
      localStorage.setItem('seenQuestions', JSON.stringify(newSeenStorage));
      seenQuestions = new Set(newSeenStorage);
      freshQuestions = [...availableQuestions];
    }
    
    let selected;
    if (subtopicFilter) {
      if (subtopicFilter === 'Puzzles') {
        // For puzzles, do not shuffle and do not use seenQuestions filter
        selected = availableQuestions;
      } else {
        selected = freshQuestions.sort(() => 0.5 - Math.random());
      }
    } else {
      const shuffled = freshQuestions.sort(() => 0.5 - Math.random());
      selected = shuffled.slice(0, 10);
    }
    setQuizQuestions(selected);
    
    const newlySeen = selected.map(q => q.id);
    const updatedSeenStorage = Array.from(new Set([...Array.from(seenQuestions), ...newlySeen]));
    localStorage.setItem('seenQuestions', JSON.stringify(updatedSeenStorage));
    
  }, [topic, subtopicFilter]);

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
      topicSlug: topicName,
      topicTitle: topic.title,
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

  if (!isClient || !topic) return null;

  if (!currentUser) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center bg-slate-900/60 animate-in fade-in duration-300">
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
              className="w-full bg-primary text-slate-950 py-4 sm:py-3 rounded-2xl sm:rounded-xl font-bold text-lg sm:text-base hover:bg-primary/90 transition-colors shadow-sm active:scale-[0.98]"
            >
              Log In to Continue
            </Link>
            <Link 
              href="/"
              className="w-full bg-slate-100 text-slate-400 py-4 sm:py-3 rounded-2xl sm:rounded-xl font-bold text-lg sm:text-base hover:bg-slate-700 transition-colors active:scale-[0.98]"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (quizQuestions.length === 0) return null;

  const currentQ = quizQuestions[currentIdx];
  const isDanger = timeLeft < 60;

  return (
    <div className="min-h-[calc(100dvh-80px)] p-2 md:p-4 max-w-5xl mx-auto flex flex-col">
      <div className="flex-1 flex flex-col lg:flex-row gap-4 items-start justify-center fade-in-stagger">
        
        {/* Quiz Column */}
        <div className="flex-1 w-full max-w-3xl flex flex-col">
          <header className="shrink-0 flex justify-between items-center mb-3 pb-3 border-b border-border-subtle">
            <h1 className="text-lg font-bold text-foreground">{subtopicFilter ? `${subtopicFilter} Test` : `${topic.title} Test`}</h1>
            <div 
              className={`flex items-center gap-2 font-mono text-base font-semibold px-3 py-1.5 rounded-lg glass-card border shadow-sm ${
                isDanger ? 'text-incorrect border-incorrect animate-pulse scale-105' : 'text-slate-400 border-slate-800'
              }`}
              aria-live="polite"
            >
              <Clock size={18} />
              {formatTime(timeLeft)}
            </div>
          </header>

          <main className="glass-card border border-slate-800 shadow-sm p-4 md:p-6 rounded-xl mb-3 flex-1 flex flex-col md:flex-row gap-6">
            
            {currentQ.passage && (
               <div className="md:w-1/2 md:pr-4 md:border-r border-slate-800 flex flex-col">
                  <h3 className="font-bold text-slate-800 mb-2">Passage</h3>
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
                <span className="bg-primary/10 text-primary px-2 py-1 rounded-full">{currentQ.subtopic || 'General'}</span>
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
                          ? 'border-primary bg-primary/5 text-primary font-semibold' 
                          : 'border-border-subtle hover:border-primary/30 text-slate-400'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          </main>

          <footer className="shrink-0 flex justify-between items-center glass-card p-3 rounded-xl border border-slate-800 shadow-sm text-sm">
            <button
              onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
              disabled={currentIdx === 0}
              aria-label="Previous question"
              className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-md font-semibold text-slate-400 hover:bg-slate-700 disabled:opacity-50 transition-colors"
            >
              <ChevronLeft size={18} /> <span className="hidden sm:inline">Previous</span>
            </button>
            
            <button
              onClick={toggleReview}
              aria-label={reviewed.has(currentIdx) ? "Marked as reviewed" : "Mark for review"}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-md font-semibold transition-colors ${
                reviewed.has(currentIdx) 
                  ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' 
                  : 'text-slate-400 hover:bg-slate-700'
              }`}
            >
              <Flag size={16} className={reviewed.has(currentIdx) ? 'fill-amber-700' : ''} /> 
              <span className="hidden sm:inline">{reviewed.has(currentIdx) ? 'Reviewed' : 'Review'}</span>
            </button>
            
            {currentIdx === quizQuestions.length - 1 ? (
              <button
                onClick={handleSubmit}
                className="flex items-center gap-1.5 bg-accent text-slate-950 px-4 py-1.5 rounded-md font-semibold hover:bg-accent/90 transition-colors shadow-sm"
              >
                Submit <CheckCircle size={18} />
              </button>
            ) : (
              <button
                onClick={() => setCurrentIdx(prev => Math.min(quizQuestions.length - 1, prev + 1))}
                aria-label="Next question"
                className="flex items-center gap-1.5 bg-primary text-slate-950 px-4 py-1.5 rounded-md font-semibold hover:bg-primary/90 transition-colors shadow-sm"
              >
                <span className="hidden sm:inline">Next</span> <ChevronRight size={18} />
              </button>
            )}
          </footer>
        </div>

        {/* Tools Column */}
        <div className="flex flex-col gap-4 w-full lg:w-56 shrink-0 mt-4 lg:mt-0">
          
          <div className="glass-card border border-slate-800 shadow-sm p-4 rounded-xl">
            <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center justify-between">
              Navigator
              <span className="text-[10px] bg-slate-700 text-slate-400 px-1.5 py-0.5 rounded-full">{answers && Object.keys(answers).length}/10</span>
            </h3>
            <div className="grid grid-cols-5 gap-2 lg:gap-1.5">
              {quizQuestions.map((_, i) => {
                const isAnswered = answers[i] !== undefined;
                const isReviewed = reviewed.has(i);
                const isCurrent = currentIdx === i;
                
                let btnStyle = "bg-slate-100 text-slate-400 border-transparent hover:bg-slate-700";
                
                if (isReviewed) {
                  btnStyle = "bg-amber-100 text-amber-700 border-amber-300 hover:bg-amber-200";
                } else if (isAnswered) {
                  btnStyle = "bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200";
                }

                if (isCurrent) {
                  btnStyle += " ring-2 ring-primary ring-offset-1";
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
              <div className="flex items-center gap-2 lg:gap-1.5"><div className="w-3 h-3 lg:w-2.5 lg:h-2.5 rounded-sm bg-emerald-100 border border-emerald-300"></div> Answered</div>
              <div className="flex items-center gap-2 lg:gap-1.5"><div className="w-3 h-3 lg:w-2.5 lg:h-2.5 rounded-sm bg-amber-100 border border-amber-300"></div> Marked</div>
              <div className="flex items-center gap-2 lg:gap-1.5"><div className="w-3 h-3 lg:w-2.5 lg:h-2.5 rounded-sm bg-slate-100 border border-slate-200"></div> Unanswered</div>
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

export default function QuizClient({ topicName }) {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>}>
      <QuizContent topicName={topicName} />
    </Suspense>
  );
}
