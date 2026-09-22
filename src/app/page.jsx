"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

import { PenLine, Trophy, Clock, LogIn, UserPlus, Flame, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import dynamic from 'next/dynamic';
const QuestionOfTheDay = dynamic(() => import('../components/QuestionOfTheDay'), { 
  ssr: false, 
  loading: () => <div className="p-8 text-center text-slate-400">Loading today's question...</div>
});
import { useRouter } from 'next/navigation';

export default function Home() {
  const { currentUser, loading } = useAuth();
  const [showQotdModal, setShowQotdModal] = useState(false);
  const [qotdStarted, setQotdStarted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (currentUser) {
      // Get local date string YYYY-MM-DD
      const now = new Date();
      const localDate = new Date(now.getTime() - (now.getTimezoneOffset() * 60000));
      const todayStr = localDate.toISOString().split('T')[0];
      
      // Only show popup if they haven't answered today
      if (currentUser.last_active_date !== todayStr) {
        const timer = setTimeout(() => {
          setShowQotdModal(true);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [currentUser]);

  if (loading) {
    return (
      <div className="animate-in fade-in duration-300 flex flex-col items-center min-h-[60vh] pb-12">
        <div className="w-full h-[500px] sm:h-[600px] flex flex-col items-center justify-center relative mb-12 overflow-hidden">
          <Image 
            src="/images/hero.webp" 
            alt="Hero background" 
            fill 
            priority
            fetchPriority="high"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-black/20 z-10"></div>
          <div className="relative z-20 text-center px-4 max-w-2xl mt-16">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    // Landing page for not logged in users
    return (
      <div className="animate-in fade-in duration-300 flex flex-col items-center min-h-[60vh] pb-12">
        {/* Hero Section */}
        <div 
          className="w-full h-[500px] sm:h-[600px] flex flex-col items-center justify-center relative mb-12 overflow-hidden"
        >
          <Image 
            src="/images/hero.webp" 
            alt="Hero background" 
            fill 
            priority
            fetchPriority="high"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-black/20 z-10"></div>
          <div className="relative z-20 text-center px-4 max-w-2xl">
            <h1 className="text-white text-4xl sm:text-5xl mb-6 font-bold drop-shadow-lg">Master Your Aptitude</h1>
            <p className="text-lg sm:text-xl text-slate-200 leading-relaxed drop-shadow-md">
              Practice mock tests, track your progress, and climb the leaderboard. Sign in to start your journey!
            </p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-6 w-full max-w-lg px-4 sm:px-0">
          <Link 
            href="/login"
            className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-md hover:shadow-lg hover:shadow-primary/20 w-full text-lg"
          >
            <LogIn size={20} /> Login
          </Link>
          
          <Link 
            href="/signup"
            className="flex items-center justify-center gap-2 bg-transparent text-primary border-2 border-primary px-8 py-4 rounded-xl font-bold hover:bg-primary/10 transition-all shadow-sm hover:shadow-md hover:shadow-primary/10 w-full text-lg"
          >
            <UserPlus size={20} /> Sign Up
          </Link>
        </div>
      </div>
    );
  }

  // Dashboard for logged in users
  return (
    <div className="animate-in fade-in duration-300">
      {/* Hero Banner for Dashboard */}
      <div className="w-full h-[200px] sm:h-[240px] flex items-end relative overflow-hidden">
        <Image 
          src="/images/hero.webp" 
          alt="Hero background" 
          fill 
          priority
          fetchPriority="high"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/55 z-10"></div>
        <div className="max-w-5xl w-full mx-auto px-4 sm:px-8 pb-6 relative z-10">
          <h1 className="text-white text-3xl sm:text-4xl font-bold mb-1 drop-shadow-2xl" style={{textShadow: '0 2px 16px rgba(0,0,0,0.9), 0 1px 4px rgba(0,0,0,0.8)'}}>Aptiflux Tests</h1>
          <p className="text-slate-200 text-base max-w-2xl drop-shadow-lg" style={{textShadow: '0 1px 8px rgba(0,0,0,0.8)'}}>Select a topic below to start your timed mock test. Good luck!</p>
        </div>
      </div>

      <div className="px-4 sm:px-8 pt-6 pb-8 max-w-5xl mx-auto">
        <section className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Practice Card — same base, slate accent */}
          <div className="glass-card p-8 rounded-3xl flex flex-col justify-between border border-slate-800 relative overflow-hidden">
            {/* Left accent stripe */}
            <div className="absolute top-0 left-0 bottom-0 w-1 bg-slate-600 rounded-l-3xl" />
            <div>
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-2xl bg-slate-800/60 border border-slate-700 flex items-center justify-center">
                  <PenLine className="text-slate-300 w-9 h-9" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-4">Normal Practice</h2>
              <p className="text-slate-400 mb-8">
                Practice questions topic by topic at your own pace. Immediate feedback, no time limits, and scores are not tracked on the leaderboard.
              </p>
            </div>
            <Link
              href="/practice"
              className="inline-flex items-center justify-center h-14 bg-slate-700 text-slate-100 border-2 border-slate-500 px-6 rounded-xl font-bold hover:bg-slate-600 hover:border-slate-400 hover:text-white transition-all text-lg w-full"
            >
              Start Practice
            </Link>
          </div>

          {/* Weekly Quiz Card — same base, primary accent + ranked badge */}
          <div className="glass-card p-8 rounded-3xl flex flex-col justify-between border border-slate-800 relative overflow-hidden">
            {/* Left accent stripe */}
            <div className="absolute top-0 left-0 bottom-0 w-1 bg-primary rounded-l-3xl shadow-[2px_0_12px_rgba(37,99,235,0.4)]" />
            {/* Ranked badge */}
            <div className="absolute top-0 right-0 bg-amber-500 text-amber-950 text-xs font-bold px-3 py-1 rounded-bl-xl shadow-lg">
              Ranked
            </div>
            <div>
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-slate-800/60 border border-slate-700 flex items-center justify-center">
                    <Trophy className="text-primary w-9 h-9" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-amber-500 rounded-full p-1 shadow-lg border-2 border-slate-950">
                    <Clock className="text-amber-950 w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-4">Weekly Quiz</h2>
              <p className="text-slate-400 mb-8">
                Test your skills across 10 random questions carefully selected for this week. Your performance counts towards the leaderboard!
              </p>
            </div>
            <button
              onClick={() => router.push('/weekly-quiz')}
              className="inline-flex items-center justify-center h-14 bg-primary text-primary-foreground px-6 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-[0_0_18px_rgba(37,99,235,0.3)] hover:shadow-[0_0_28px_rgba(37,99,235,0.5)] text-lg w-full"
            >
              Take This Week's Quiz
            </button>
          </div>

        </section>

      </div>

      {/* QotD Modal */}
      {showQotdModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-lg relative overflow-hidden animate-in zoom-in-95 duration-200 shadow-2xl">
            <button 
              onClick={() => setShowQotdModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white z-20"
            >
              <X size={24} />
            </button>
            
            {!qotdStarted ? (
              <div className="p-8 text-center pt-12">
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center border-2 border-orange-500/50 shadow-[0_0_30px_rgba(249,115,22,0.3)]">
                    <Flame className="text-orange-500 w-10 h-10 animate-pulse" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">Question of the Day</h2>
                <p className="text-slate-300 mb-8">
                  Keep your daily streak alive! Answer today's question to maintain your progress and climb the ranks.
                </p>
                <button
                  onClick={() => setQotdStarted(true)}
                  className="bg-orange-500 text-white font-bold py-3 px-8 rounded-xl hover:bg-orange-600 transition-all shadow-[0_0_15px_rgba(249,115,22,0.4)] hover:shadow-[0_0_25px_rgba(249,115,22,0.6)] w-full sm:w-auto"
                >
                  Answer Now
                </button>
              </div>
            ) : (
              <div className="p-2 sm:p-4">
                <QuestionOfTheDay currentUser={currentUser} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

