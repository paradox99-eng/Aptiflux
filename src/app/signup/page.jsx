"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { UserPlus, Eye, EyeOff } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [stream, setStream] = useState('');
  const [otherStream, setOtherStream] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreedToTerms) {
      toast.error('You must agree to the Terms and Conditions to sign up.');
      return;
    }
    setLoading(true);
    try {
      const finalStream = stream === 'Other' ? otherStream : stream;
      await signup(email, password, name, finalStream);
      toast.success('Account created successfully!');
      router.push('/profile');
    } catch (err) {
      toast.error(err.message || 'Failed to create an account');
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
          
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-300 mb-1">Stream</label>
            <select 
              required
              className="w-full h-10 px-3 py-2 bg-slate-950 border border-input rounded-md text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-foreground"
              value={stream}
              onChange={e => setStream(e.target.value)}
            >
              <option value="" disabled>Select Stream</option>
              <option value="B.Tech">B.Tech</option>
              <option value="BBA">BBA</option>
              <option value="MBA">MBA</option>
              <option value="MCA">MCA</option>
              <option value="BCA">BCA</option>
              <option value="BHM">BHM</option>
              <option value="Diploma">Diploma</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {stream === 'Other' && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="block text-sm font-medium text-slate-300 mb-1">Please mention your stream</label>
              <Input 
                type="text" 
                required
                placeholder="e.g. B.Sc, BA, etc."
                className="focus:ring-accent/50 focus:border-accent"
                value={otherStream}
                onChange={e => setOtherStream(e.target.value)}
              />
            </div>
          )}

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
          
          <div className="flex items-start gap-2 pt-2 pb-1">
            <input 
              type="checkbox" 
              id="terms" 
              required
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-1 cursor-pointer w-4 h-4 rounded border-slate-700 text-accent focus:ring-accent/50 bg-slate-900"
            />
            <label htmlFor="terms" className="text-sm text-slate-300">
              I agree to the <Link href="/terms" className="text-accent hover:underline" target="_blank">Terms and Conditions</Link> and <Link href="/privacy" className="text-accent hover:underline" target="_blank">Privacy Policy</Link>
            </label>
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

