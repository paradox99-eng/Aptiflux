import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';
import crypto from 'crypto';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // 1. Check if the user exists
    const { data: user, error: userError } = await supabase
      .from('students')
      .select('Uid, email, name')
      .eq('email', email.trim().toLowerCase())
      .single();

    if (userError || !user) {
      // Security best practice: Don't reveal if email exists or not.
      // Just return success even if user not found.
      return NextResponse.json({ message: 'If an account with that email exists, we sent a password reset link.' }, { status: 200 });
    }

    // 2. Generate a random secure token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // 3. Set expiry to 1 hour from now
    const resetTokenExpires = new Date();
    resetTokenExpires.setHours(resetTokenExpires.getHours() + 1);

    // 4. Update the user in the database
    const { error: updateError } = await supabase
      .from('students')
      .update({
        reset_token: resetToken,
        reset_token_expires: resetTokenExpires.toISOString(),
      })
      .eq('Uid', user.Uid);

    if (updateError) {
      console.error('Error updating reset token:', updateError);
      return NextResponse.json({ error: 'Failed to process request. Please try again later.' }, { status: 500 });
    }

    // 5. Send the email using Resend
    // Use the dynamic base URL depending on environment
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
                    
    const resetLink = `${baseUrl}/reset-password?token=${resetToken}`;

    const { error: emailError } = await resend.emails.send({
      from: 'Aptiflux Support <onboarding@resend.dev>', // Free tier Resend limit (requires onboarding@resend.dev for unverified domains)
      to: [user.email],
      subject: 'Reset your Aptiflux Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Reset Your Password</h2>
          <p>Hi ${user.name || 'Student'},</p>
          <p>You recently requested to reset your password for your Aptiflux account. Click the button below to reset it. <strong>This link will expire in 1 hour.</strong></p>
          <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 4px; font-weight: bold; margin: 16px 0;">Reset Password</a>
          <p>If you did not request a password reset, please ignore this email or reply to let us know. This password reset is only valid for the next hour.</p>
          <p>Thanks,<br>The Aptiflux Team</p>
        </div>
      `,
    });

    if (emailError) {
      console.error('Error sending email:', emailError);
      return NextResponse.json({ error: 'Failed to send reset email. Please try again later.' }, { status: 500 });
    }

    return NextResponse.json({ message: 'If an account with that email exists, we sent a password reset link.' }, { status: 200 });
    
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
