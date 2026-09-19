import React from 'react';
import { cn } from '../../lib/utils';

export function Card({ children, className, ...props }) {
  return (
    <div 
      className={cn("bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm", className)} 
      {...props}
    >
      {children}
    </div>
  );
}
