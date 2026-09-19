"use client";

import React from 'react';

export default function TermsOfService() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-12">
      <h1 className="text-3xl font-bold text-foreground mb-8">Terms of Service</h1>
      
      <div className="prose prose-slate max-w-none space-y-6 text-slate-400">
        <p>
          Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">1. Acceptance of Terms</h2>
          <p className="text-slate-300 mb-6 leading-relaxed">
            By accessing and using CogniCore (created and maintained by Paradox), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by these terms, please do not use this platform.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-3">2. Description of Service</h2>
          <p className="text-slate-300 mb-6 leading-relaxed">
            CogniCore provides an online environment for students (such as those from B.Tech, DIATM, and beyond) to practice aptitude questions and view their rankings on a global leaderboard. We reserve the right to modify or discontinue, temporarily or permanently, the service with or without notice.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">3. User Accounts and Security</h2>
          <p>
            To use certain features of the site (like saving scores and appearing on the leaderboard), you must register for an account. You are responsible for maintaining the confidentiality of your account information, including your password. You agree to notify us immediately of any unauthorized use of your account.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">4. Acceptable Use</h2>
          <p>
            You agree not to use the platform to:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Attempt to hack, destabilize, or exploit vulnerabilities within the platform (e.g., automated bot signups, SQL injection, or rate limit circumvention).</li>
            <li>Submit false or misleading information during registration.</li>
            <li>Use automated scripts to answer questions or artificially inflate your score on the leaderboard.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">5. Intellectual Property</h2>
          <p>
            All content on this website, including but not limited to the questions, design, UI, and code, are the property of the platform administrators or are used with permission. You may not reproduce, distribute, or create derivative works without explicit written consent.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">6. Termination</h2>
          <p>
            We may terminate or suspend your account and access to the platform immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground mb-3">7. Contact Information</h2>
          <p>
            If you have any questions about these Terms, please contact Paradox at <a href="mailto:momentsinmotion788@gmail.com" className="text-primary underline hover:opacity-80">momentsinmotion788@gmail.com</a>.
          </p>
        </section>
      </div>
    </div>
  );
}

