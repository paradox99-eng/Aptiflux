"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User, Trophy, Trash2, Award } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import { getWeekNumber } from '../../utils/quizGenerator';

export default function Profile() {
  const { currentUser, logout } = useAuth();
  const router = useRouter();
  const [history, setHistory] = useState([]);
  const [claimedBadges, setClaimedBadges] = useState([]);
  const [claimableBadges, setClaimableBadges] = useState([]);
  const [lockedBadges, setLockedBadges] = useState([]);
  const [isClient, setIsClient] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    const fetchHistory = async () => {
      if (currentUser?.Uid) {
        try {
          const res = await fetch(`/api/history?student_id=${currentUser.Uid}`);
          if (res.ok) {
            const data = await res.json();
            const allHistory = data.history;
            
            setHistory(allHistory);
          }
        } catch (error) {
          console.error("Failed to fetch history:", error);
        }

        try {
          const badgeRes = await fetch(`/api/badges?student_id=${currentUser.Uid}`);
          if (badgeRes.ok) {
            const badgeData = await badgeRes.json();
            if (badgeData) {
              setClaimedBadges(badgeData.claimed || []);
              setClaimableBadges(badgeData.claimable || []);
              setLockedBadges(badgeData.locked || []);
            }
          }
        } catch (error) {
          console.error("Failed to fetch badges:", error);
        }
      } else {
        // Fallback to localStorage if not logged in (though they should be redirected)
        const saved = localStorage.getItem('aptitudeHistory');
        if (saved) {
          const allHistory = JSON.parse(saved);
          setHistory(allHistory);
        }
      }
    };
    
    if (isClient) {
      if (!currentUser) {
        router.replace('/login');
      } else {
        fetchHistory();
      }
    }
  }, [isClient, currentUser, router]);

  if (!isClient || !currentUser) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/');
  };


  const handleClearHistoryConfirm = async () => {
    if (currentUser?.Uid) {
      try {
        const res = await fetch(`/api/history?student_id=${currentUser.Uid}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          setHistory([]);
          setShowClearModal(false);
          toast.success("History cleared successfully!");
        } else {
          toast.error("Failed to clear history.");
        }
      } catch (error) {
        console.error("Failed to clear history:", error);
        toast.error("Failed to clear history due to network error.");
      }
    } else {
      localStorage.removeItem('aptitudeHistory');
      setHistory([]);
      setShowClearModal(false);
      toast.success("Local history cleared!");
    }
  };

  const handleClaimBadge = async (badgeId) => {
    try {
      const res = await fetch('/api/badges/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: currentUser.Uid, badge_id: badgeId })
      });
      if (res.ok) {
        // Move from claimable to claimed locally
        const claimedBadge = claimableBadges.find(b => b.id === badgeId);
        setClaimableBadges(claimableBadges.filter(b => b.id !== badgeId));
        setClaimedBadges([...claimedBadges, claimedBadge]);
        toast.success("Badge claimed successfully!");
      } else {
        const errorData = await res.json();
        console.error("Failed to claim badge from API:", errorData);
        toast.error(`Failed to claim badge: ${errorData.error || errorData.message || 'Unknown error'}. Check server logs for RLS issues.`);
      }
    } catch (error) {
      console.error("Failed to claim badge:", error);
      toast.error("Failed to claim badge due to network error.");
    }
  };

  const totalTests = history.length;
  
  const currentWeek = getWeekNumber(new Date());
  const isSunday = new Date().getDay() === 0;

  const isScoreHidden = (test) => {
    if (test.topicSlug !== 'weekly-quiz' && test.topicSlug !== 'weekly') return false;
    const testDate = new Date(test.date || test.submitted_at || Date.now());
    const testWeek = getWeekNumber(testDate);
    if (testWeek.year < currentWeek.year) return false;
    if (testWeek.year === currentWeek.year && testWeek.week < currentWeek.week) return false;
    return !isSunday;
  };
  
  const scoredHistory = history.filter(h => !isScoreHidden(h));
  
  const overallAvg = scoredHistory.length > 0 
    ? Math.round((scoredHistory.reduce((acc, curr) => acc + curr.score, 0) / scoredHistory.reduce((acc, curr) => acc + curr.total, 0)) * 100) 
    : 0;

  return (
    <div className="min-h-screen p-8 max-w-5xl mx-auto animate-in fade-in duration-300">
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Profile Sidebar */}
        <div className="lg:col-span-1">
          <div className="glass-card p-8 rounded-2xl text-center border border-slate-800">
            <div className="w-24 h-24 mx-auto rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4 shadow-[0_0_15px_rgba(37,99,235,0.2)]">
              <User size={48} />
            </div>
            <h2 className="text-2xl font-bold text-foreground">{currentUser.name}</h2>
            <p className="text-slate-400 mb-8">{currentUser.email}</p>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                <div className="text-2xl font-bold text-foreground">{totalTests}</div>
                <div className="text-xs text-slate-400 uppercase font-semibold">Tests Taken</div>
              </div>
              <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                <div className="text-2xl font-bold text-foreground">{overallAvg}%</div>
                <div className="text-xs text-slate-400 uppercase font-semibold">Avg Score</div>
              </div>
              <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                <div className="text-2xl font-bold text-orange-500 flex items-center justify-center gap-1">
                  {currentUser.streak_count || 0} <span className="text-lg">🔥</span>
                </div>
                <div className="text-xs text-slate-400 uppercase font-semibold">Daily Streak</div>
              </div>
              <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                <div className={`text-lg font-bold mt-1 ${
                  currentUser.last_active_date === new Date().toISOString().split('T')[0]
                    ? (currentUser.streak_count > 0 ? 'text-emerald-500' : 'text-red-500')
                    : 'text-slate-400'
                }`}>
                  {currentUser.last_active_date === new Date().toISOString().split('T')[0]
                    ? (currentUser.streak_count > 0 ? 'Correct' : 'Incorrect')
                    : 'Pending'}
                </div>
                <div className="text-xs text-slate-400 uppercase font-semibold">Today's QotD</div>
              </div>
            </div>

            <button 
              onClick={handleLogout}
              className="hidden sm:flex w-full items-center justify-center gap-2 bg-slate-800 text-slate-300 border border-slate-700 px-4 py-3 rounded-lg font-semibold hover:bg-red-950/30 hover:text-red-500 hover:border-red-900/50 transition-colors"
            >
              <LogOut size={18} /> Log Out
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Earned Badges */}
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground mb-4">
              <Award className="text-primary" /> Earned Badges
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {claimedBadges.length === 0 ? (
                <div className="col-span-full glass-card border border-slate-800 p-6 rounded-2xl text-center">
                  <p className="text-slate-400 italic">No badges earned yet. Take a quiz to earn your first badge!</p>
                </div>
              ) : (
                claimedBadges.map(badge => (
                  <div key={badge.id} className={`p-[1px] rounded-2xl bg-gradient-to-br ${badge.color}`}>
                    <div className="bg-slate-950 rounded-2xl p-4 h-full flex flex-col items-center text-center justify-center relative overflow-hidden group">
                      <div className={`absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity bg-gradient-to-br ${badge.color}`}></div>
                      <div className="mb-2 relative z-10 drop-shadow-md">
                        {badge.image ? (
                          <Image src={badge.image} alt={badge.name} width={48} height={48} className="object-contain" />
                        ) : (
                          <div className="text-4xl">{badge.icon}</div>
                        )}
                      </div>
                      <h3 className="font-bold text-sm text-foreground relative z-10">{badge.name}</h3>
                      <p className="text-[10px] text-slate-400 mt-1 relative z-10 leading-tight">{badge.description}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>



          {/* Today's Performance */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground">
              <Trophy className="text-primary" /> Test History
            </h2>
            {history.length > 0 && (
              <button 
                onClick={() => setShowClearModal(true)}
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-red-500 transition-colors px-3 py-1.5 rounded-md hover:bg-red-950/30"
              >
                <Trash2 size={16} /> Clear History
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div className="glass-card border border-slate-800 p-8 rounded-2xl text-center">
              <p className="text-slate-400 italic">No tests taken yet. Head to the dashboard to start a mock test!</p>
            </div>
          ) : (
            <div className="glass-card border border-slate-800 rounded-2xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-900/80 border-b border-slate-800">
                  <tr>
                    <th className="p-4 font-semibold text-slate-400">Time</th>
                    <th className="p-4 font-semibold text-slate-400">Topic</th>
                    <th className="p-4 font-semibold text-slate-400">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {[...history].reverse().map((test, i) => {
                    const percentage = Math.round((test.score / test.total) * 100) || 0;
                    const hiddenScore = isScoreHidden(test);
                    
                    return (
                      <tr key={i} className="border-b last:border-0 border-slate-800 hover:bg-slate-800/40 transition-colors">
                        <td className="p-4 text-slate-400">{new Date(test.date || test.submitted_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                        <td className="p-4 text-foreground font-medium">{test.topicTitle}</td>
                        <td className="p-4 font-mono">
                          {hiddenScore ? (
                            <span className="px-3 py-1 rounded-full text-sm font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                              Available Sunday
                            </span>
                          ) : (
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              percentage >= 50 ? 'bg-emerald-950/50 text-emerald-500 border border-emerald-900' : 'bg-red-950/50 text-red-500 border border-red-900'
                            }`}>
                              {test.score} / {test.total} ({percentage}%)
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Available Badges */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-400 mb-4">
              Available Badges
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {[...claimableBadges, ...lockedBadges].map(badge => {
                const isClaimable = badge.status === 'claimable';
                return (
                  <div key={badge.id} className={`p-[1px] rounded-2xl bg-gradient-to-br ${isClaimable ? badge.color : 'from-slate-800 to-slate-900'} relative`}>
                    <div className={`bg-slate-950 rounded-2xl p-4 h-full flex flex-col items-center text-center justify-center relative overflow-hidden ${!isClaimable ? 'opacity-50 grayscale' : ''}`}>
                      <div className={`absolute inset-0 opacity-10 transition-opacity bg-gradient-to-br ${isClaimable ? badge.color : 'from-transparent to-transparent'}`}></div>
                      <div className="mb-2 relative z-10 drop-shadow-md">
                        {badge.image ? (
                          <Image src={badge.image} alt={badge.name} width={40} height={40} className="object-contain" />
                        ) : (
                          <div className="text-4xl">{badge.icon}</div>
                        )}
                      </div>
                      <h3 className="font-bold text-sm text-foreground relative z-10">{badge.name}</h3>
                      <p className="text-[10px] text-slate-400 mt-1 mb-6 relative z-10 leading-tight">{badge.description}</p>
                      
                      {isClaimable && (
                        <button 
                          onClick={() => handleClaimBadge(badge.id)}
                          className={`absolute bottom-3 left-1/2 -translate-x-1/2 text-[10px] font-bold px-3 py-1 rounded-full bg-gradient-to-r ${badge.color} text-white shadow-lg shadow-black/50 hover:scale-105 transition-transform z-20 whitespace-nowrap`}
                        >
                          CLAIM BADGE
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {showClearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-card rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-800">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-red-950/50 text-red-500 border border-red-900 flex items-center justify-center mb-4">
                <Trash2 size={24} />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Clear History?</h3>
              <p className="text-slate-400">Are you sure you want to clear your performance history? This action cannot be undone and will permanently reset your statistics.</p>
            </div>
            <div className="bg-slate-900/80 p-4 border-t border-slate-800 flex justify-end gap-3">
              <button 
                onClick={() => setShowClearModal(false)}
                className="px-4 py-2 font-semibold text-slate-300 hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-700"
              >
                Cancel
              </button>
              <button 
                onClick={handleClearHistoryConfirm}
                className="px-4 py-2 font-semibold bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-lg transition-colors shadow-[0_0_15px_rgba(239,68,68,0.3)]"
              >
                Yes, clear history
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

