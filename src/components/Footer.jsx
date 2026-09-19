import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-800 bg-background py-8">
      <div className="max-w-5xl mx-auto px-8 flex flex-col md:flex-row items-center justify-between text-slate-400 text-sm">
        <p>&copy; {new Date().getFullYear()} CogniCore. All rights reserved.</p>
        <div className="flex flex-wrap justify-center md:justify-end gap-x-6 gap-y-2 mt-4 md:mt-0">
          <Link href="/about" className="hover:text-primary transition-colors">About Us</Link>
          <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
          <Link href="/contact" className="hover:text-primary transition-colors">Contact us</Link>
        </div>
      </div>
    </footer>
  );
}

