"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { LogIn, User, X, LogOut, LayoutDashboard, Trophy, Settings } from 'lucide-react';

export default function Header() {
  const { currentUser, isAdmin, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);
  const isActive = (href) => href === '/' ? pathname === '/' : pathname.startsWith(href);

  // ─── Nav link: rounded-lg, left-border accent when active ───────────────────
  const navClass = (href) =>
    `flex items-center gap-2 text-sm px-3 py-2 rounded-lg font-medium transition-all border-l-2 ${
      isActive(href)
        ? 'border-primary text-primary bg-primary/10'
        : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
    }`;

  // ─── Account pill: rounded-full, border treatment when active ───────────────
  const accountClass = (href) =>
    `flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all border ${
      isActive(href)
        ? 'border-primary bg-primary/10 text-primary'
        : 'border-slate-700 bg-transparent text-slate-300 hover:border-primary/50 hover:text-primary hover:bg-primary/5'
    }`;

  // ─── Mobile nav link ─────────────────────────────────────────────────────────
  const mobileNavClass = (href) =>
    `flex items-center gap-3 text-sm font-medium px-4 py-3 rounded-xl transition-all border-l-2 ${
      isActive(href)
        ? 'border-primary text-primary bg-primary/10'
        : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
    }`;

  // ─── Mobile account link ─────────────────────────────────────────────────────
  const mobileAccountClass = (href) =>
    `flex items-center gap-3 text-sm font-semibold px-4 py-3 rounded-xl transition-all border ${
      isActive(href)
        ? 'border-primary bg-primary/10 text-primary'
        : 'border-slate-700 text-slate-300 hover:border-primary/50 hover:text-primary hover:bg-primary/5'
    }`;

  return (
    <header className="bg-background/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-800">
      <div className="max-w-5xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center hover:opacity-90 transition-opacity">
          <span className="font-extrabold text-2xl sm:text-3xl bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 tracking-tight">
            Aptiflux
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden sm:flex items-center gap-1">
          <Link href="/" className={navClass('/')}>
            <LayoutDashboard size={15} /> <span>Dashboard</span>
          </Link>
          <Link href="/leaderboard" className={navClass('/leaderboard')}>
            <Trophy size={15} /> <span>Leaderboard</span>
          </Link>
          {isAdmin && (
            <Link href="/admin" className={navClass('/admin')}>
              <Settings size={15} /> <span>Admin</span>
            </Link>
          )}

          {/* Divider */}
          <div className="w-px h-5 bg-slate-700 mx-2" />

          {/* Account section */}
          {currentUser ? (
            <Link href="/profile" aria-label="Profile" className={accountClass('/profile')}>
              <User size={15} /> <span>Profile</span>
            </Link>
          ) : (
            <Link href="/login" className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-semibold hover:bg-primary/90 transition-all border border-primary">
              <LogIn size={15} /> <span>Login</span>
            </Link>
          )}
        </nav>

        {/* Mobile toggle */}
        <button
          className="sm:hidden p-2 -mr-1 text-slate-300 hover:text-primary bg-slate-800/60 hover:bg-primary/10 rounded-lg transition-all border border-slate-700 hover:border-primary/40"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={20} /> : <User size={20} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="sm:hidden absolute top-16 left-0 right-0 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 shadow-xl py-3 px-4 flex flex-col gap-1 z-40">
          {/* Account first */}
          {currentUser ? (
            <Link href="/profile" onClick={closeMobileMenu} className={mobileAccountClass('/profile')}>
              <User size={18} /> <span>Profile</span>
            </Link>
          ) : (
            <Link href="/login" onClick={closeMobileMenu} className="flex items-center gap-3 text-sm font-semibold px-4 py-3 rounded-xl bg-primary text-primary-foreground border border-primary hover:bg-primary/90 transition-all">
              <LogIn size={18} /> <span>Login</span>
            </Link>
          )}

          <div className="h-px bg-slate-800 my-1" />

          {/* Nav links */}
          <Link href="/" onClick={closeMobileMenu} className={mobileNavClass('/')}>
            <LayoutDashboard size={18} /> <span>Dashboard</span>
          </Link>
          <Link href="/leaderboard" onClick={closeMobileMenu} className={mobileNavClass('/leaderboard')}>
            <Trophy size={18} /> <span>Leaderboard</span>
          </Link>

          {currentUser && (
            <>
              <div className="h-px bg-slate-800 my-1" />
              {isAdmin && (
                <Link href="/admin" onClick={closeMobileMenu} className={mobileNavClass('/admin')}>
                  <Settings size={18} /> <span>Admin Panel</span>
                </Link>
              )}
              <button
                onClick={() => { closeMobileMenu(); logout(); router.push('/'); }}
                className="flex items-center gap-3 text-sm font-medium text-red-400 hover:bg-red-950/40 px-4 py-3 rounded-xl text-left transition-all border-l-2 border-transparent hover:border-red-500/50"
              >
                <LogOut size={18} /> <span>Sign Out</span>
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
}

