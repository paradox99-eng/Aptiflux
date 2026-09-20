import React from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Target, Users } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

export const metadata = {
  title: 'About Us | Aptiflux',
  description: 'Learn more about Aptiflux and our mission to help students succeed.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0a0a1a] pt-24 pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-8">
        
        {/* Header Section */}
        <div className="text-center mb-16 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/20 blur-[100px] rounded-full z-0 pointer-events-none"></div>
          
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white mb-4">About <span className="text-primary">Aptiflux</span></h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Your ultimate platform for mastering aptitude tests and accelerating your career preparation through AI-driven personalized learning.
            </p>
          </div>
        </div>

        {/* Mission Section */}
        <Card className="mb-16">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-xl text-primary">
              <Target size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-white mb-3">Our Mission</h2>
              <p className="text-slate-300 leading-relaxed">
                We believe that quality education and test preparation should be accessible, engaging, and highly effective. 
                Our mission is to empower students and professionals with a dynamic, never-ending pool of practice questions 
                that adapt to their skill levels.
              </p>
            </div>
          </div>
        </Card>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 gap-6 mb-16">
          <Card className="hover:border-primary/50 transition-colors">
            <BookOpen size={24} className="text-primary mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Endless Practice</h3>
            <p className="text-slate-400">
              Powered by advanced AI, our platform generates unique, mathematically accurate questions across all major aptitude topics.
            </p>
          </Card>
          
          <Card className="hover:border-primary/50 transition-colors">
            <Users size={24} className="text-primary mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Built by Paradox</h3>
            <p className="text-slate-400">
              Designed with students in mind, providing step-by-step explanations, daily streaks, and engaging gamification.
            </p>
          </Card>
        </div>

        {/* Contact CTA */}
        <div className="text-center pt-8 border-t border-slate-800">
          <h2 className="text-2xl font-bold text-white mb-4">Got Questions?</h2>
          <p className="text-slate-400 mb-6">We'd love to hear from you. Whether you have feedback or need support.</p>
          <Link href="/contact" passHref>
            <Button>
              Contact Us
            </Button>
          </Link>
        </div>

      </div>
    </div>
  );
}
