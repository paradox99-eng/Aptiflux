"use client";
import React, { useEffect, useState } from 'react';
import { Trophy, Medal, Award, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

export default function LeaderboardClient({ initialLeaderboard, error: initialError }) {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && !currentUser) {
      router.replace('/login');
    }
  }, [isClient, currentUser, router]);

  const isSunday = new Date().getDay() === 0;
  const isAdmin = currentUser?.email === 'parthibdutta947@gmail.com';
  const canViewLeaderboard = isSunday || isAdmin;
  
  const leaderboard = initialLeaderboard || [];
  const error = initialError || null;
  const loading = false;

  if (!isClient || !currentUser) {
    return null;
  }

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return <Trophy className="text-yellow-500" size={28} />;
      case 2: return <Trophy className="text-slate-400" size={26} />;
      case 3: return <Trophy className="text-amber-600" size={24} />;
      default: return <span className="text-slate-500 font-bold text-lg w-7 text-center">{rank}</span>;
    }
  };

  const getRankStyle = (rank) => {
    switch (rank) {
      case 1: return "bg-yellow-500/10 border-yellow-500/20";
      case 2: return "bg-slate-500/10 border-slate-500/20";
      case 3: return "bg-amber-600/10 border-amber-600/20";
      default: return "glass-card border-slate-800 hover:bg-slate-800/50 transition-colors";
    }
  };

  return (
    <div className="flex flex-col bg-background">
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 sm:py-12">
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 text-primary">
            <Trophy size={32} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">Weekly Leaderboard</h1>
          <p className="text-slate-400 max-w-xl">
            See how you stack up against other students this week. Scores are aggregated across all mock tests taken since Monday.
          </p>
        </div>

        {!canViewLeaderboard ? (
          <div className="glass-card border border-slate-800 rounded-3xl p-12 text-center shadow-sm max-w-2xl mx-auto mt-8">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
              <AlertCircle size={40} />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Leaderboard Hidden</h2>
            <p className="text-slate-400 mb-8 leading-relaxed">
              The weekly leaderboard is currently building up! Rankings are revealed every <strong>Sunday</strong> so everyone can see the final results at once. Keep practicing and check back on Sunday!
            </p>
            <Link 
              href="/"
              className="inline-flex items-center justify-center bg-primary text-slate-950 px-8 py-3.5 rounded-xl font-semibold hover:-translate-y-0.5 transition-transform shadow-sm"
            >
              Back to Dashboard
            </Link>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="animate-spin mb-4" size={40} />
            <p>Loading rankings...</p>
          </div>
        ) : error ? (
          <div className="bg-red-950/50 border border-red-900 rounded-2xl p-6 text-center text-red-500 flex flex-col items-center">
            <AlertCircle className="mb-2" size={32} />
            <p className="font-semibold mb-1">Failed to load leaderboard</p>
            <p className="text-sm opacity-80 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-900 text-white hover:bg-red-800 rounded-lg font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="glass-card border border-slate-800 rounded-2xl p-12 text-center shadow-sm">
            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="text-slate-500" size={40} />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">No tests taken this week!</h2>
            <p className="text-slate-400 mb-6">Be the first to get on the board by taking a mock test.</p>
            <Link 
              href="/"
              className="inline-flex items-center justify-center bg-primary text-slate-950 px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
            >
              Take a Test Now
            </Link>
          </div>
        ) : (
          <div className="glass-card rounded-2xl shadow-sm border border-slate-800 overflow-hidden">
            {/* Header Row */}
            <div className="hidden sm:grid grid-cols-12 gap-4 p-4 bg-slate-900/50 border-b border-slate-800 text-sm font-semibold text-slate-400 uppercase tracking-wider">
              <div className="col-span-2 text-center">Rank</div>
              <div className="col-span-5">Student Name</div>
              <div className="col-span-2 text-center">Tests</div>
              <div className="col-span-3 text-right pr-4">Total Score</div>
            </div>

            {/* Leaderboard List */}
            <div className="divide-y divide-slate-800">
              {leaderboard.map((student) => (
                <div 
                  key={student.student_id}
                  className={`grid grid-cols-12 gap-3 sm:gap-4 p-4 items-center ${getRankStyle(student.rank)}`}
                >
                  <div className="col-span-2 flex justify-center items-center">
                    {getRankIcon(student.rank)}
                  </div>
                  <div className="col-span-7 sm:col-span-5 font-bold text-foreground truncate text-lg">
                    {student.student_name || 'Anonymous'}
                  </div>
                  <div className="hidden sm:block col-span-2 text-center text-slate-400 font-medium">
                    {student.testsTaken}
                  </div>
                  <div className="col-span-3 text-right pr-2 sm:pr-4 flex flex-col sm:block items-end">
                    <span className="font-bold text-primary text-xl sm:text-2xl">{student.totalScore}</span>
                    <span className="text-xs text-slate-500 font-medium sm:hidden block mt-0.5">
                      {student.testsTaken} {student.testsTaken === 1 ? 'test' : 'tests'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
