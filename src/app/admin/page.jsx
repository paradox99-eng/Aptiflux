"use client";
import React, { useEffect, useState } from 'react';
import { Users, FileText, ClipboardList, Clock } from 'lucide-react';
import { questionsData } from '../../questionsData';
import { supabase } from '../../lib/supabase';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalQuestions: 0,
    totalTestsTaken: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);

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

    const fetchRecentActivity = async () => {
      setActivityLoading(true);
      try {
        // Fetch latest 10 attempts, joined with student name
        const { data, error } = await supabase
          .from('attempts')
          .select('id, topic_slug, score, total_questions, submitted_at, student_id')
          .order('submitted_at', { ascending: false })
          .limit(10);

        if (error) {
          console.error("Error fetching recent activity:", error);
          setRecentActivity([]);
          return;
        }

        if (!data || data.length === 0) {
          setRecentActivity([]);
          return;
        }

        // Fetch student names for the IDs
        const ids = [...new Set(data.map(a => a.student_id))];
        const { data: students } = await supabase
          .from('students')
          .select('Uid, name, email')
          .in('Uid', ids);

        const studentMap = {};
        (students || []).forEach(s => { studentMap[s.Uid] = s; });

        const enriched = data.map(attempt => ({
          ...attempt,
          total: attempt.total_questions,
          studentName: studentMap[attempt.student_id]?.name || studentMap[attempt.student_id]?.email || 'Unknown User',
        }));

        setRecentActivity(enriched);
      } catch (err) {
        console.error("Failed to fetch recent activity:", err);
        setRecentActivity([]);
      } finally {
        setActivityLoading(false);
      }
    };

    fetchStats();
    fetchRecentActivity();
  }, []);

  const statCards = [
    { name: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-500', bg: 'bg-blue-950/50 border border-blue-900' },
    { name: 'Total Questions', value: stats.totalQuestions, icon: FileText, color: 'text-emerald-500', bg: 'bg-emerald-950/50 border border-emerald-900' },
    { name: 'Tests Taken', value: stats.totalTestsTaken, icon: ClipboardList, color: 'text-purple-500', bg: 'bg-purple-950/50 border border-purple-900' }
  ];

  const formatTime = (isoString) => {
    if (!isoString) return 'Unknown time';
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const formatTopic = (slug) => {
    if (!slug) return 'Unknown Topic';
    return slug
      .replace(/-/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
  };

  const getScoreColor = (score, total) => {
    const pct = total > 0 ? (score / total) * 100 : 0;
    if (pct >= 80) return 'text-emerald-400';
    if (pct >= 50) return 'text-amber-400';
    return 'text-red-400';
  };

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

        {activityLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : recentActivity.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <ClipboardList size={40} className="mx-auto mb-3 opacity-40" />
            <p>No test submissions yet.</p>
            <p className="text-sm mt-2 opacity-60">Activity will appear here once users start taking tests.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between py-3 gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center shrink-0 text-slate-400 font-bold text-sm">
                    {(activity.studentName?.[0] || '?').toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{activity.studentName}</p>
                    <p className="text-xs text-slate-400 truncate">completed <span className="text-slate-300">{formatTopic(activity.topic_slug)}</span></p>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <span className={`text-sm font-bold ${getScoreColor(activity.score, activity.total)}`}>
                    {activity.score}/{activity.total}
                  </span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock size={11} />
                    {formatTime(activity.submitted_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
