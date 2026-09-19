import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';
import { supabaseAdmin } from '../../../lib/supabase-admin';
import bcrypt from 'bcryptjs';

// Simple in-memory rate limiter to prevent spam signups
const rateLimit = new Map();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const MAX_ATTEMPTS = 5; // Max 5 signups per hour per IP

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
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    
    if (ip !== 'unknown' && !checkRateLimit(ip)) {
      return NextResponse.json({ error: 'Too many signup attempts from this IP. Please try again later.' }, { status: 429 });
    }

    const { name, email, room_no, stream, year, password } = await request.json();

    if (!name || !email || !room_no || !stream || !year || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Input Validation to prevent excessively long strings (DoS mitigation)
    if (
      typeof name !== 'string' || name.length > 100 ||
      typeof email !== 'string' || email.length > 254 ||
      typeof room_no !== 'string' || room_no.length > 50 ||
      typeof stream !== 'string' || stream.length > 50 ||
      typeof year !== 'string' || year.length > 10 ||
      typeof password !== 'string' || password.length > 128
    ) {
      return NextResponse.json({ error: 'Invalid input parameters' }, { status: 400 });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Insert into Supabase
    const { data, error } = await supabaseAdmin
      .from('students')
      .insert([
        {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          room_no: room_no.trim(),
          stream: stream.trim(),
          year: year.trim(),
          password_hash
        }
      ])
      .select('Uid, name, email, room_no, stream, year')
      .single();

    if (error) {
      console.error('Supabase error:', error);
      // Handle unique constraint violation on email
      if (error.code === '23505') {
        return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
      }
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }

    // Create secure HTTP-only cookie session
    const { createSession } = await import('../../../lib/session');
    await createSession(data.Uid, data.email, data.name);

    return NextResponse.json({ user: data }, { status: 201 });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
