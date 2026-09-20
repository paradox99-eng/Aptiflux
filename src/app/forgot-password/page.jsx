"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Mail } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setSubmitted(true);
      toast.success('Password reset link sent!');
    } catch (err) {
      toast.error(err.message || 'Failed to send reset link');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="glass-card w-full max-w-md p-8 rounded-2xl animate-in slide-in-from-bottom-4 duration-500">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
            <Mail size={24} />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Forgot Password</h2>
          <p className="text-slate-400 mt-2">Enter your email to receive a reset link.</p>
        </div>

        {submitted ? (
          <div className="text-center space-y-6">
            <p className="text-slate-300">
              If an account exists for <span className="font-semibold text-white">{email}</span>, we have sent an email with instructions to reset your password.
            </p>
            <Link href="/login">
              <Button className="w-full">Return to Login</Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
              <Input 
                type="email" 
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full mt-2"
            >
              {loading ? 'Sending link...' : 'Send Reset Link'}
            </Button>
          </form>
        )}

        <div className="mt-6 text-center text-sm text-slate-400 border-t border-border-subtle pt-6">
          Remember your password? <Link href="/login" className="text-primary font-medium hover:underline">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
