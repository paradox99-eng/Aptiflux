"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { User, Award, Loader2, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function PublicProfile() {
  const { uid } = useParams();
  const router = useRouter();
  
  const [profile, setProfile] = useState(null);
  const [claimedBadges, setClaimedBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPublicData = async () => {
      try {
        setLoading(true);
        // Fetch profile stats and claimed badges in a single request
        const profileRes = await fetch(`/api/public-profile?uid=${uid}`);
        if (!profileRes.ok) {
          if (profileRes.status === 404) {
            throw new Error('User not found');
          }
          throw new Error('Failed to load profile');
        }
        const profileData = await profileRes.json();
        setProfile(profileData);
        setClaimedBadges(profileData.claimed_badges || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (uid) {
      fetchPublicData();
    }
  }, [uid]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="glass-card border border-slate-800 p-8 rounded-2xl text-center max-w-md w-full">
          <User className="mx-auto text-slate-500 mb-4" size={48} />
          <h2 className="text-2xl font-bold text-foreground mb-2">Profile Not Found</h2>
          <p className="text-slate-400 mb-6">{error || 'This user does not exist or has no public profile.'}</p>
          <button 
            onClick={() => router.back()}
            className="flex items-center justify-center gap-2 w-full bg-slate-800 text-slate-300 px-4 py-2 rounded-lg font-semibold hover:bg-slate-700 transition-colors"
          >
            <ArrowLeft size={18} /> Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto animate-in fade-in duration-300">
      
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors mb-6 font-medium"
      >
        <ArrowLeft size={18} /> Back
      </button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Profile Sidebar */}
        <div className="md:col-span-1">
          <div className="glass-card p-8 rounded-2xl text-center border border-slate-800 sticky top-8">
            <div className="w-24 h-24 mx-auto rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4 shadow-[0_0_15px_rgba(37,99,235,0.2)]">
              <User size={48} />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-1">{profile.name}</h2>
            {profile.stream && (
              <p className="text-slate-400 mb-8 font-medium bg-slate-900/50 inline-block px-3 py-1 rounded-full text-sm border border-slate-800">
                {profile.stream}
              </p>
            )}
            
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="text-sm text-slate-400 uppercase font-semibold">Tests Taken</span>
                <span className="text-xl font-bold text-foreground">{profile.total_tests}</span>
              </div>
              <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="text-sm text-slate-400 uppercase font-semibold">Avg Score</span>
                <span className="text-xl font-bold text-foreground">{profile.average_score}%</span>
              </div>
              <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="text-sm text-slate-400 uppercase font-semibold">Daily Streak</span>
                <span className="text-xl font-bold text-orange-500 flex items-center gap-1">
                  {profile.streak_count} <span className="text-lg">🔥</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="md:col-span-2 space-y-8">
          
          {/* Earned Badges */}
          <div className="glass-card p-8 rounded-2xl border border-slate-800">
            <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground mb-6">
              <Award className="text-primary" /> Earned Badges
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {claimedBadges.length === 0 ? (
                <div className="col-span-full bg-slate-900/50 border border-slate-800 p-6 rounded-xl text-center">
                  <p className="text-slate-400 italic">No badges earned yet.</p>
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

          <div className="glass-card border border-slate-800 p-8 rounded-2xl text-center">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔒</span>
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">Private History</h3>
            <p className="text-slate-400 text-sm">
              Detailed test history and contact information are hidden for privacy.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
