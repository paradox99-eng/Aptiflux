import { NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabase-admin';
import bcrypt from 'bcryptjs';

// Simple in-memory rate limiter (Note: In a serverless environment like Vercel, this memory is ephemeral per lambda instance, but it still mitigates rapid brute-forcing)
const rateLimit = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5; // Max 5 attempts per window

function checkRateLimit(ip) {
  const now = Date.now();
  const userRate = rateLimit.get(ip);

  if (!userRate) {
    rateLimit.set(ip, { count: 1, firstAttempt: now });
    return true;
  }

  if (now - userRate.firstAttempt > RATE_LIMIT_WINDOW) {
    // Reset window
    rateLimit.set(ip, { count: 1, firstAttempt: now });
    return true;
  }

  if (userRate.count >= MAX_ATTEMPTS) {
    return false; // Rate limited
  }

  userRate.count++;
  return true;
}

export async function POST(request) {
  try {
    // Get IP address for rate limiting
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    
    if (ip !== 'unknown' && !checkRateLimit(ip)) {
      return NextResponse.json({ error: 'Too many login attempts. Please try again later (15m).' }, { status: 429 });
    }

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Input validation: type and length constraints to prevent DoS payloads
    if (typeof email !== 'string' || typeof password !== 'string' || email.length > 254 || password.length > 128) {
       return NextResponse.json({ error: 'Invalid input parameters' }, { status: 400 });
    }

    // Fetch user from Supabase
    const { data: user, error } = await supabaseAdmin
      .from('students')
      .select('Uid, name, email, stream, password_hash, last_active_date, streak_count')
      .eq('email', email.trim().toLowerCase()) // Normalize email
      .single();

    if (error || !user) {
      console.log('Login failed: User not found or DB error', { error, userFound: !!user });
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    console.log('Login attempt for:', user.email, 'Password valid?', isPasswordValid);

    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Clear rate limit on successful login
    if (ip !== 'unknown') {
       rateLimit.delete(ip);
    }

    // Remove password_hash from the response object
    const { password_hash, ...userData } = user;

    // Create secure HTTP-only cookie session
    const { createSession } = await import('../../../lib/session');
    await createSession(userData.Uid, userData.email, userData.name);

    return NextResponse.json({ user: userData }, { status: 200 });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
