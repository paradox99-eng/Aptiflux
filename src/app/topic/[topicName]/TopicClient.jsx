"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { questionsData } from '../../../questionsData';
import { BookOpen, Play, ChevronLeft, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';

export default function TopicClient({ topicName }) {
  const topic = questionsData[topicName];
  const router = useRouter();
  const { currentUser } = useAuth();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (!topic) {
      router.replace('/');
    }
  }, [topic, router]);

  if (!isClient || !topic) {
    return null;
  }

  if (!currentUser) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center bg-background/80 animate-in fade-in duration-300">
        <div className="glass-card w-full sm:max-w-md sm:mx-auto p-8 pt-6 sm:p-8 rounded-t-[2rem] sm:rounded-2xl text-center shadow-xl relative overflow-hidden animate-in slide-in-from-bottom-10 duration-300 border border-slate-800">
          <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mb-6 sm:hidden"></div>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary hidden sm:block"></div>
          
          <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-6 text-primary">
            <BookOpen size={40} />
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-3">Login Required</h2>
          <p className="text-slate-400 mb-8 leading-relaxed px-2">
            You must be logged in to view topics and take mock tests. Create an account to track your progress!
          </p>
          <div className="flex flex-col gap-3">
            <Link 
              href="/login"
              className="w-full bg-primary text-slate-950 py-4 sm:py-3 rounded-2xl sm:rounded-xl font-bold text-lg sm:text-base hover:bg-primary/90 transition-colors shadow-sm active:scale-[0.98]"
            >
              Log In to Continue
            </Link>
            <Link 
              href="/"
              className="w-full bg-slate-100 text-slate-400 py-4 sm:py-3 rounded-2xl sm:rounded-xl font-bold text-lg sm:text-base hover:bg-slate-700 transition-colors active:scale-[0.98]"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const subtopics = Array.from(new Set(topic.questions.map(q => q.subtopic).filter(Boolean))).sort();

  return (
    <div className="min-h-screen p-8 max-w-5xl mx-auto animate-in fade-in duration-300">
      <header className="mb-10 text-center relative flex flex-col md:block items-center">
        <Link href="/" className="self-start mb-6 md:mb-0 md:absolute left-0 top-1/2 md:-translate-y-1/2 flex items-center text-slate-400 hover:text-primary transition-colors">
          <ChevronLeft size={20} /> Back to Dashboard
        </Link>
        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4 mt-2 md:mt-0">
          <BookOpen className="text-primary shrink-0" size={32} />
          <h1 className="text-3xl md:text-4xl text-foreground font-bold text-balance leading-tight">{topic.title}</h1>
        </div>
        <p className="text-slate-400">Choose to take a randomized mixed test, or practice a specific subtopic below.</p>
      </header>

      <section className="mb-12 flex justify-center">
        <Link 
          href={`/test/${topicName}`}
          className="flex items-center gap-2 bg-accent text-slate-950 px-10 py-4 rounded-xl text-lg font-bold hover:bg-accent/90 transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/50 focus-visible:ring-offset-2 shadow-sm"
        >
          <Play fill="currentColor" size={24} /> Start Random Mixed Test
        </Link>
      </section>

      {subtopics.length > 0 && (
        <section>
          <h2 className="text-2xl mb-6 border-b border-border-subtle pb-2 font-semibold text-foreground">
            Practice by Subtopic
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {subtopics.map(sub => {
              const subQCount = topic.questions.filter(q => q.subtopic === sub).length;
              return (
                <div key={sub} className="glass-card border border-slate-800 shadow-sm p-5 rounded-2xl flex flex-col justify-between">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-foreground leading-tight">{sub}</h3>
                    <p className="text-sm text-slate-400 mt-1">{subQCount} Questions</p>
                  </div>
                  <Link 
                    href={`/test/${topicName}?subtopic=${encodeURIComponent(sub)}`}
                    className="block text-center bg-primary/10 text-primary hover:bg-primary hover:text-white px-4 py-2 rounded-md font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    Start Test
                  </Link>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
