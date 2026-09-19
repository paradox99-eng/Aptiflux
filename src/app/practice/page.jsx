"use client";
import React, { useState, useEffect } from 'react';
import { questionsData } from '../../questionsData';
import { ChevronRight, CheckCircle, XCircle, BookOpen, Lock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import Calculator from '../../components/Calculator';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

export default function Practice() {
  const { currentUser } = useAuth();
  const [isClient, setIsClient] = useState(false);
  
  const [step, setStep] = useState("select_topic");
  const [selectedMain, setSelectedMain] = useState(null);
  const [selectedSub, setSelectedSub] = useState(null);
  
  const [practiceQuestions, setPracticeQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  if (!currentUser) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center bg-background/80 animate-in fade-in duration-300">
        <Card className="w-full sm:max-w-md sm:mx-auto p-8 pt-6 sm:p-8 rounded-t-[2rem] sm:rounded-2xl text-center shadow-xl relative overflow-hidden animate-in slide-in-from-bottom-10 duration-300">
          <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-6 text-primary">
            <Lock size={40} />
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-3">Login Required</h2>
          <p className="text-slate-400 mb-8 leading-relaxed px-2">
            You must be logged in to access practice mode.
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/login" className="w-full">
              <Button className="w-full py-4 sm:py-3 rounded-2xl sm:rounded-xl shadow-[0_0_15px_rgba(37,99,235,0.3)]">
                Log In to Continue
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  // Handle starting a practice session
  const startPractice = (mainTopic, subTopic) => {
    // Get questions for this subtopic
    const allQ = questionsData[mainTopic]?.questions || [];
    const filteredQ = allQ.filter(q => q.subtopic === subTopic);
    
    // Shuffle the questions so practice is random
    const shuffled = [...filteredQ].sort(() => 0.5 - Math.random());
    
    // Take up to 20 for a session
    setPracticeQuestions(shuffled.slice(0, 20));
    setSelectedMain(mainTopic);
    setSelectedSub(subTopic);
    setCurrentIdx(0);
    setSelectedOpt(null);
    setShowFeedback(false);
    setStep("practice");
  };

  const handleNext = () => {
    if (currentIdx < practiceQuestions.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setSelectedOpt(null);
      setShowFeedback(false);
    } else {
      // Done with practice
      setStep("select_topic");
    }
  };

  const checkAnswer = () => {
    if (selectedOpt) {
      setShowFeedback(true);
    }
  };

  if (step === "select_topic") {
    return (
      <div className="p-4 md:p-8 max-w-5xl mx-auto animate-in fade-in duration-300">
        <header className="mb-8 flex items-center gap-4">
          <Link href="/" className="glass-card p-2 rounded-full hover:bg-slate-800 transition-colors">
            <ArrowLeft className="text-slate-300" size={24} />
          </Link>
          <div>
            <h1 className="text-primary text-3xl font-bold drop-shadow-md">Normal Practice</h1>
            <p className="text-slate-400">Select a topic to start practicing at your own pace.</p>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-8">
          {Object.entries(questionsData).map(([key, category]) => {
            // Find all unique subtopics for this category
            const subtopics = [...new Set(category.questions.map(q => q.subtopic))];
            
            return (
              <Card key={key} className="p-6 rounded-2xl">
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2 capitalize">
                  <BookOpen className="text-primary" /> {category.title}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {subtopics.map(sub => (
                    <button
                      key={sub}
                      onClick={() => startPractice(key, sub)}
                      className="text-left px-4 py-3 bg-slate-900/50 border border-slate-800 hover:border-primary/50 hover:bg-primary/10 rounded-xl transition-all font-semibold text-slate-300"
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  // Practice Mode UI
  const currentQ = practiceQuestions[currentIdx];
  
  if (!currentQ) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500 mb-4">No questions found for this topic.</p>
        <Button onClick={() => setStep("select_topic")}>Go Back</Button>
      </div>
    );
  }

  const isCorrect = showFeedback && selectedOpt === currentQ.correctAnswer;
  const isIncorrect = showFeedback && selectedOpt !== currentQ.correctAnswer;

  return (
    <div className="min-h-[calc(100dvh-80px)] p-2 md:p-4 max-w-4xl mx-auto flex flex-col">
      <header className="flex justify-between items-center mb-6">
        <button 
          onClick={() => setStep("select_topic")}
          className="flex items-center gap-2 text-slate-400 hover:text-foreground font-semibold transition-colors"
        >
          <ArrowLeft size={20} /> Back to Topics
        </button>
        <div className="bg-primary/10 text-primary px-3 py-1 rounded-full font-bold text-sm">
          {selectedSub} - {currentIdx + 1} / {practiceQuestions.length}
        </div>
      </header>
      
      <div className="flex-1 flex flex-col md:flex-row gap-6">
        <Card className="p-6 md:p-8 rounded-2xl flex-1 flex flex-col relative overflow-hidden">
          
          {/* Header Progress bar */}
          <div className="absolute top-0 left-0 h-1.5 bg-slate-800 w-full">
             <div 
               className="h-full bg-primary transition-all duration-300 ease-out shadow-[0_0_10px_rgba(37,99,235,0.8)]" 
               style={{ width: `${((currentIdx) / practiceQuestions.length) * 100}%` }}
             ></div>
          </div>

          <h2 className="text-lg sm:text-xl text-foreground mb-6 font-medium whitespace-pre-wrap mt-2">
            {currentQ.text}
          </h2>

          <div className="space-y-3 mb-8">
            {currentQ.options && currentQ.options.map((opt, i) => {
              const isSelected = selectedOpt === opt;
              let style = "border-slate-800 hover:border-primary/50 text-slate-300 bg-slate-900/50";
              let icon = null;
              
              if (showFeedback) {
                if (opt === currentQ.correctAnswer) {
                  style = "border-emerald-500 bg-emerald-950/50 text-emerald-400 font-bold";
                  icon = <CheckCircle className="text-emerald-500 shrink-0" size={20} />;
                } else if (isSelected) {
                  style = "border-red-500 bg-red-950/50 text-red-400 font-semibold";
                  icon = <XCircle className="text-red-500 shrink-0" size={20} />;
                } else {
                  style = "border-slate-800 bg-slate-900 text-slate-500 opacity-50";
                }
              } else if (isSelected) {
                style = "border-primary bg-primary/10 text-primary font-bold";
              }

              return (
                <button
                  key={i}
                  disabled={showFeedback}
                  onClick={() => setSelectedOpt(opt)}
                  className={`w-full text-left p-4 sm:p-5 text-sm sm:text-base rounded-xl border-2 transition-all flex justify-between items-center ${style}`}
                >
                  <span>{opt}</span>
                  {icon}
                </button>
              );
            })}
          </div>

          {showFeedback && (
            <div className={`p-4 rounded-xl mb-6 ${isCorrect ? 'bg-emerald-950/30 border border-emerald-900' : 'bg-red-950/30 border border-red-900'} animate-in fade-in slide-in-from-bottom-2`}>
              <h3 className={`font-bold flex items-center gap-2 mb-2 ${isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                {isCorrect ? <CheckCircle size={20}/> : <XCircle size={20}/>}
                {isCorrect ? 'Correct!' : 'Incorrect'}
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed"><span className="font-semibold text-white">Explanation:</span> {currentQ.explanation}</p>
            </div>
          )}

          <div className="mt-auto flex justify-end pt-4 border-t border-slate-800">
            {!showFeedback ? (
              <Button
                onClick={checkAnswer}
                disabled={!selectedOpt}
                className="px-8 py-3 rounded-xl shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_20px_rgba(37,99,235,0.5)]"
              >
                Check Answer
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                className="bg-accent text-accent-foreground px-8 py-3 rounded-xl hover:bg-accent/90 shadow-[0_0_15px_rgba(255,51,153,0.3)] hover:shadow-[0_0_20px_rgba(255,51,153,0.5)] flex items-center gap-2"
              >
                {currentIdx < practiceQuestions.length - 1 ? 'Next Question' : 'Finish Practice'} <ChevronRight size={20} />
              </Button>
            )}
          </div>
        </Card>
        
        <div className="w-full md:w-64 shrink-0">
          <Calculator />
        </div>
      </div>
    </div>
  );
}

