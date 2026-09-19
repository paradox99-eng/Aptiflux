"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { LogIn, User, X, LogOut, LayoutDashboard, Trophy, Settings } from 'lucide-react';

export default function Header() {
  const { currentUser, isAdmin, logout } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className="bg-background/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-800">
      <div className="max-w-5xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center group hover:opacity-90 transition-opacity">
          <span className="font-extrabold text-2xl sm:text-3xl bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 tracking-tight">
            CogniCore
          </span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden sm:flex items-center gap-2">
          <Link 
            href="/" 
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-primary hover:bg-primary/10 px-3 py-2 rounded-lg transition-all font-medium"
          >
            <LayoutDashboard size={16} /> <span>Dashboard</span>
          </Link>
          <Link 
            href="/leaderboard" 
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-primary hover:bg-primary/10 px-3 py-2 rounded-lg transition-all font-medium"
          >
            <Trophy size={16} /> <span>Leaderboard</span>
          </Link>
          <div className="w-px h-6 bg-slate-800 mx-2"></div>
          {isAdmin && (
            <Link 
              href="/admin" 
              className="flex items-center gap-2 text-sm text-primary hover:bg-primary/10 px-3 py-2 rounded-lg transition-all font-medium mr-2"
            >
              <Settings size={16} /> <span>Admin Panel</span>
            </Link>
          )}
          {currentUser ? (
            <Link 
              href="/profile" 
              aria-label="Profile"
              className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold hover:bg-primary/20 transition-colors"
            >
              <User size={16} /> <span>Profile</span>
            </Link>
          ) : (
            <Link 
              href="/login" 
              className="flex items-center gap-2 bg-primary text-slate-950 px-5 py-2 rounded-full text-sm font-semibold hover:bg-primary/90 transition-colors ml-2"
            >
              <LogIn size={16} /> <span>Login</span>
            </Link>
          )}
        </nav>

        {/* Mobile Menu Button (Profile Icon) */}
        <button 
          className="sm:hidden p-2 -mr-1 text-primary bg-primary/10 hover:bg-primary/20 rounded-full transition-colors flex items-center justify-center"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={20} /> : <User size={20} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="sm:hidden absolute top-16 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-lg py-4 px-4 flex flex-col gap-2 z-40">
          {currentUser ? (
            <Link 
              href="/profile" 
              onClick={closeMobileMenu}
              className="flex items-center gap-3 text-base font-medium text-primary p-3 rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors"
            >
              <User size={20} /> <span>Profile</span>
            </Link>
          ) : (
            <Link 
              href="/login" 
              onClick={closeMobileMenu}
              className="flex items-center gap-3 text-base font-medium text-slate-300 hover:text-primary p-3 rounded-xl hover:bg-slate-800 transition-colors"
            >
              <LogIn size={20} /> <span>Login</span>
            </Link>
          )}
          <div className="h-px bg-slate-800 my-1"></div>
          <Link 
            href="/" 
            onClick={closeMobileMenu}
            className="flex items-center gap-3 text-base font-medium text-slate-300 hover:text-primary p-3 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <LayoutDashboard size={20} /> <span>Dashboard</span>
          </Link>
          <Link 
            href="/leaderboard" 
            onClick={closeMobileMenu}
            className="flex items-center gap-3 text-base font-medium text-slate-300 hover:text-primary p-3 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <Trophy size={20} /> <span>Leaderboard</span>
          </Link>
          
          {currentUser && (
            <>
              <div className="h-px bg-slate-800 my-1"></div>
              {isAdmin && (
                <Link 
                  href="/admin" 
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 text-base font-medium text-primary hover:bg-primary/10 p-3 rounded-xl transition-colors"
                >
                  <Settings size={20} /> <span>Admin Panel</span>
                </Link>
              )}
              <button 
                onClick={() => {
                  closeMobileMenu();
                  logout();
                  router.push('/');
                }}
                className="flex items-center gap-3 text-base font-medium text-red-500 hover:bg-red-950/30 p-3 rounded-xl text-left transition-colors"
              >
                <LogOut size={20} /> <span>Sign Out</span>
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
}

