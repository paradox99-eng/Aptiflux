import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="glass-card p-8 rounded-2xl flex flex-col items-center gap-4 animate-pulse">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
        <h2 className="text-xl font-bold text-foreground">Loading...</h2>
        <p className="text-sm text-slate-400">Preparing your content</p>
      </div>
    </div>
  );
}
