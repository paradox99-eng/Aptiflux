"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { LogIn, User, X, LogOut, Home, Trophy, Settings } from 'lucide-react';

export default function Header() {
  const { currentUser, isAdmin, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {}, []);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);
  const isActive = (href) => href === '/' ? pathname === '/' : pathname.startsWith(href);

  // ── Desktop: ALL links share one shape. Active = underline + primary tint ───
  const navClass = (href) =>
    `flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg font-medium transition-all relative ${
      isActive(href)
        ? 'text-primary bg-primary/10 after:absolute after:bottom-0 after:left-2 after:right-2 after:h-0.5 after:bg-primary after:rounded-full'
        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
    }`;

  // ── Desktop Profile: same rounded-lg family, just with avatar bg ─────────────
  const profileClass = () =>
    `flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg font-medium transition-all relative ${
      isActive('/profile')
        ? 'text-primary bg-primary/10 after:absolute after:bottom-0 after:left-2 after:right-2 after:h-0.5 after:bg-primary after:rounded-full'
        : 'text-slate-300 hover:text-slate-100 hover:bg-slate-800/50'
    }`;

  // ── Mobile: vertical list — border-l-2 is correct here ──────────────────────
  const mobileNavClass = (href) =>
    `flex items-center gap-3 text-sm font-medium px-4 py-3 rounded-xl transition-all border-l-2 ${
      isActive(href)
        ? 'border-primary text-primary bg-primary/10'
        : 'border-transparent text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
    }`;

  return (
    <header className="bg-background/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-800">
      <div className="max-w-5xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center hover:opacity-90 transition-opacity">
          <span className="font-extrabold text-2xl sm:text-3xl bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 tracking-tight">
            Aptiflux
          </span>
        </Link>

        {/* Desktop Navigation — one unified visual family */}
        <nav className="hidden sm:flex items-center gap-0.5">
          <Link href="/" className={navClass('/')}>
            <Home size={14} /> <span>Home</span>
          </Link>
          <Link href="/leaderboard" className={navClass('/leaderboard')}>
            <Trophy size={14} /> <span>Leaderboard</span>
          </Link>
          {isAdmin && (
            <Link href="/admin" className={navClass('/admin')}>
              <Settings size={14} /> <span>Admin</span>
            </Link>
          )}

          {/* Thin divider separates navigation from account */}
          <div className="w-px h-5 bg-slate-700 mx-2 shrink-0" />

          {currentUser ? (
            <Link href="/profile" aria-label="Profile" className={profileClass()}>
              <span className="w-5 h-5 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center shrink-0">
                <User size={11} className="text-primary" />
              </span>
              <span>Profile</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
            >
              <LogIn size={14} /> <span>Login</span>
            </Link>
          )}
        </nav>

        {/* Mobile toggle */}
        <button
          className="sm:hidden flex items-center justify-center w-9 h-9 rounded-lg border border-slate-700 bg-slate-800/60 text-slate-300 hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={18} /> : <User size={18} />}
        </button>
      </div>

      {/* Mobile Menu — vertical list, border-l-2 works correctly here */}
      {isMobileMenuOpen && (
        <div className="sm:hidden absolute top-16 left-0 right-0 bg-slate-950/97 backdrop-blur-md border-b border-slate-800 shadow-xl py-2 px-3 flex flex-col gap-0.5 z-40">

          {/* Account item at top */}
          {currentUser ? (
            <Link href="/profile" onClick={closeMobileMenu} className={mobileNavClass('/profile')}>
              <span className="w-6 h-6 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center shrink-0">
                <User size={12} className="text-primary" />
              </span>
              <span>Profile</span>
            </Link>
          ) : (
            <Link
              href="/login"
              onClick={closeMobileMenu}
              className="flex items-center gap-3 text-sm font-semibold px-4 py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
            >
              <LogIn size={18} /> <span>Login</span>
            </Link>
          )}

          <div className="h-px bg-slate-800 my-1 mx-1" />

          {/* Nav items */}
          <Link href="/" onClick={closeMobileMenu} className={mobileNavClass('/')}>
            <Home size={18} /> <span>Home</span>
          </Link>
          <Link href="/leaderboard" onClick={closeMobileMenu} className={mobileNavClass('/leaderboard')}>
            <Trophy size={18} /> <span>Leaderboard</span>
          </Link>

          {currentUser && (
            <>
              <div className="h-px bg-slate-800 my-1 mx-1" />
              {isAdmin && (
                <Link href="/admin" onClick={closeMobileMenu} className={mobileNavClass('/admin')}>
                  <Settings size={18} /> <span>Admin Panel</span>
                </Link>
              )}
              <button
                onClick={() => { closeMobileMenu(); logout(); router.push('/'); }}
                className="flex items-center gap-3 text-sm font-medium text-red-400 hover:bg-red-950/40 px-4 py-3 rounded-xl text-left transition-all border-l-2 border-transparent hover:border-red-500/40"
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
