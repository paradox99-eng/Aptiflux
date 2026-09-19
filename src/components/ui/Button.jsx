import React from 'react';
import { cn } from '../../lib/utils';

export function Button({ 
  children, 
  variant = 'default', 
  size = 'default', 
  className, 
  disabled,
  ...props 
}) {
  const baseStyles = "inline-flex items-center justify-center font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_20px_rgba(37,99,235,0.5)]",
    outline: "border border-slate-700 bg-transparent hover:bg-slate-800 text-slate-200",
    ghost: "bg-transparent hover:bg-slate-800 text-slate-200"
  };

  const sizes = {
    default: "py-3 px-6",
    sm: "py-2 px-4 text-sm",
    lg: "py-4 px-8 text-lg"
  };

  return (
    <button 
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
