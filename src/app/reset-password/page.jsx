"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { KeyRound, Eye, EyeOff } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

function ResetPasswordForm() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      toast.error('Invalid or missing reset token.');
      router.push('/login');
    }
  }, [token, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return toast.error('Passwords do not match');
    }
    if (newPassword.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }

    setLoading(true);
    try {
      const response = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      toast.success('Password reset successfully! You can now log in.');
      router.push('/login');
    } catch (err) {
      toast.error(err.message || 'Failed to reset password');
    }
    setLoading(false);
  };

  if (!token) return null;

  return (
    <div className="glass-card w-full max-w-md p-8 rounded-2xl animate-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
          <KeyRound size={24} />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Create New Password</h2>
        <p className="text-slate-400 mt-2">Enter your new secure password.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">New Password</label>
          <div className="relative">
            <Input 
              type={showPassword ? "text" : "password"} 
              required
              className="pr-10"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              tabIndex="-1"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Confirm New Password</label>
          <Input 
            type={showPassword ? "text" : "password"} 
            required
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
          />
        </div>

        <Button 
          type="submit" 
          disabled={loading}
          className="w-full mt-2"
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </Button>
      </form>
    </div>
  );
}

export default function ResetPassword() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <React.Suspense fallback={<div className="animate-pulse w-full max-w-md h-96 bg-slate-900/50 rounded-2xl"></div>}>
        <ResetPasswordForm />
      </React.Suspense>
    </div>
  );
}
