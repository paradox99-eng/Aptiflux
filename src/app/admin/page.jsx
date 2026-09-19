"use client";
import React, { useEffect, useState } from 'react';
import { Users, FileText, ClipboardList } from 'lucide-react';
import { questionsData } from '../../questionsData';
import { supabase } from '../../lib/supabase';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalQuestions: 0,
    totalTestsTaken: 0
  });

  useEffect(() => {
    // Calculate total questions
    let totalQ = 0;
    Object.values(questionsData).forEach(cat => {
      totalQ += cat.questions.length;
    });

    const fetchStats = async () => {
      try {
        // Fetch total users from 'students' table
        const { count: usersCount, error: usersError } = await supabase
          .from('students')
          .select('*', { count: 'exact', head: true });
        
        // Fetch total tests from 'attempts' table
        const { count: attemptsCount, error: attemptsError } = await supabase
          .from('attempts')
          .select('*', { count: 'exact', head: true });

        if (usersError) console.error("Error fetching users:", usersError);
        if (attemptsError) console.error("Error fetching attempts:", attemptsError);

        setStats({
          totalUsers: usersCount || 0,
          totalQuestions: totalQ,
          totalTestsTaken: attemptsCount || 0
        });
      } catch (err) {
        console.error("Failed to fetch admin stats:", err);
        setStats(prev => ({ ...prev, totalQuestions: totalQ }));
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    { name: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-500', bg: 'bg-blue-950/50 border border-blue-900' },
    { name: 'Total Questions', value: stats.totalQuestions, icon: FileText, color: 'text-emerald-500', bg: 'bg-emerald-950/50 border border-emerald-900' },
    { name: 'Tests Taken', value: stats.totalTestsTaken, icon: ClipboardList, color: 'text-purple-500', bg: 'bg-purple-950/50 border border-purple-900' }
  ];

  return (
    <div className="max-w-5xl mx-auto fade-in-stagger">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
        <p className="text-slate-400">Overview of platform metrics and recent activity.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="glass-card p-6 rounded-2xl shadow-sm border border-slate-800 flex items-center gap-4">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 ${stat.bg} ${stat.color}`}>
                <Icon size={24} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-400 uppercase tracking-wide">{stat.name}</p>
                <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="glass-card rounded-2xl shadow-sm border border-slate-800 p-6">
        <h2 className="text-xl font-bold text-foreground mb-4">Recent Activity</h2>
        <div className="text-center py-12 text-slate-400">
          <p>No recent activity to display.</p>
          <p className="text-sm mt-2 opacity-80">Connect to your Supabase backend to stream real-time test submissions here.</p>
        </div>
      </div>
    </div>
  );
}

