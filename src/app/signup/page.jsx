"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { UserPlus, Eye, EyeOff } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [roomNo, setRoomNo] = useState('');
  const [stream, setStream] = useState('');
  const [year, setYear] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signup(email, password, name, roomNo, stream, year);
      router.push('/profile');
    } catch (err) {
      setError(err.message || 'Failed to create an account');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="glass-card w-full max-w-md p-8 rounded-2xl animate-in slide-in-from-bottom-4 duration-500">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent/10 text-accent mb-4">
            <UserPlus size={24} />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Create an Account</h2>
          <p className="text-slate-400 mt-2">Join to save your aptitude test history.</p>
        </div>

        {error && (
          <div className="bg-incorrect-bg border border-incorrect text-incorrect px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Name</label>
            <Input 
              type="text" 
              required
              className="focus:ring-accent/50 focus:border-accent"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
            <Input 
              type="email" 
              required
              className="focus:ring-accent/50 focus:border-accent"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Room No</label>
              <Input 
                type="text" 
                required
                className="focus:ring-accent/50 focus:border-accent"
                value={roomNo}
                onChange={e => setRoomNo(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Year</label>
              <Input 
                type="text" 
                required
                className="focus:ring-accent/50 focus:border-accent"
                value={year}
                onChange={e => setYear(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Stream</label>
            <Input 
              type="text" 
              required
              className="focus:ring-accent/50 focus:border-accent"
              value={stream}
              onChange={e => setStream(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Input 
                type={showPassword ? "text" : "password"} 
                required
                minLength={6}
                className="pr-10 focus:ring-accent/50 focus:border-accent"
                value={password}
                onChange={e => setPassword(e.target.value)}
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
          <Button 
            type="submit" 
            disabled={loading}
            className="w-full mt-2 bg-accent text-accent-foreground hover:bg-accent/90 shadow-[0_0_15px_rgba(255,51,153,0.3)] hover:shadow-[0_0_20px_rgba(255,51,153,0.5)]"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-400 border-t border-border-subtle pt-6">
          Already have an account? <Link href="/login" className="text-accent font-medium hover:underline">Log in</Link>
        </div>
      </div>
    </div>
  );
}

