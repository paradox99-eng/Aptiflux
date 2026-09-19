"use client";

import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-12">
      <h1 className="text-3xl font-bold text-foreground mb-8">Privacy Policy</h1>
      
      <div className="prose prose-slate max-w-none space-y-6 text-slate-400">
        <p>
          Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">1. Information We Collect</h2>
          <p className="text-slate-300 mb-4 leading-relaxed">
            When you register for an account on CogniCore, we collect the following personal information:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><strong>Personal Identification:</strong> Paradox, <a href="mailto:momentsinmotion788@gmail.com" className="text-primary underline hover:opacity-80">momentsinmotion788@gmail.com</a></li>
            {/* <li><strong>Academic Details:</strong> B.Tech, 4th Year, DIATM.</li> */}
            <li><strong>Usage Data:</strong> Test scores, time taken on mock tests, and overall leaderboard rankings.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">2. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Provide, operate, and maintain our mock test platform.</li>
            <li>Calculate rankings and display the global Leaderboard.</li>
            <li>Track your academic progress over time on your personal Dashboard.</li>
            <li>Ensure the security of our platform and prevent malicious activity (such as spam or brute-force attacks).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">3. Data Storage and Security</h2>
          <p>
            Your data is securely stored using Supabase, our database provider. Passwords are cryptographically hashed using standard hashing algorithms (bcrypt) before being stored. We do not have access to your raw password. We implement strict rate-limiting and security headers to protect your data during transit.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">4. Public Visibility</h2>
          <p>
            By participating in mock tests, you acknowledge that your <strong>Name</strong>, <strong>Stream</strong>, <strong>Year</strong>, and <strong>Test Scores</strong> may be publicly visible to other registered users on the Leaderboard. Your email address and room number remain private and will not be displayed on the public leaderboard.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">5. Data Retention and Deletion</h2>
          <p>
            We retain your data for as long as your account is active to provide you with historical test tracking. If you wish to delete your account and all associated test data, please contact us.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">6. Cookies and Local Storage</h2>
          <p>
            We use browser Local Storage to maintain your active login session and improve platform performance. We do not use third-party tracking cookies for advertising purposes.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">7. Contact Us</h2>
          <p>
            If you have any questions or concerns about this Privacy Policy or how your data is handled, please reach out to the platform administrator.
          </p>
        </section>
      </div>
    </div>
  );
}

