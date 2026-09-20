import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { token, newPassword } = await request.json();

    if (!token || !newPassword) {
      return NextResponse.json({ error: 'Token and new password are required' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 });
    }

    // 1. Find user by token
    const { data: user, error: userError } = await supabase
      .from('students')
      .select('Uid, reset_token_expires')
      .eq('reset_token', token)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'Invalid or expired password reset token' }, { status: 400 });
    }

    // 2. Check if token is expired
    const expiryDate = new Date(user.reset_token_expires);
    const now = new Date();

    if (now > expiryDate) {
      return NextResponse.json({ error: 'Password reset token has expired. Please request a new one.' }, { status: 400 });
    }

    // 3. Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // 4. Update the user's password and clear the reset token
    const { error: updateError } = await supabase
      .from('students')
      .update({
        password_hash: hashedPassword,
        reset_token: null,
        reset_token_expires: null,
      })
      .eq('Uid', user.Uid);

    if (updateError) {
      console.error('Error updating password:', updateError);
      return NextResponse.json({ error: 'Failed to reset password. Please try again later.' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Password has been successfully reset.' }, { status: 200 });

  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
