"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, BrainCircuit, Database, ShieldAlert } from 'lucide-react';

export default function AdminLayout({ children }) {
  const { currentUser, isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && (!currentUser || !isAdmin)) {
      router.replace('/');
    }
  }, [mounted, currentUser, isAdmin, router]);

  if (!mounted || !isAdmin) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <ShieldAlert size={48} className="text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-foreground">Access Denied</h2>
        <p className="text-slate-400 mt-2">You do not have permission to view this page.</p>
      </div>
    );
  }

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'AI Agents', href: '/admin/agents', icon: BrainCircuit },
    { name: 'Question Bank', href: '/admin/questions', icon: Database },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-64px)] bg-background">
      {/* Sidebar */}
      <aside className="w-full md:w-64 glass-card border-r border-slate-800 shrink-0">
        <div className="p-6">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Admin Navigation</h2>
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-sm ${
                    isActive
                      ? 'bg-primary/20 text-primary drop-shadow-md'
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-primary' : 'text-slate-500'} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

