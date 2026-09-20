"use client";

import React, { useState } from 'react';
import { Mail, MapPin, ExternalLink } from 'lucide-react';

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: '',
    roomNo: '',
    year: '',
    stream: '',
    message: ''
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const mailBody = `Name: ${formData.name}\nRoom No: ${formData.roomNo}\nYear: ${formData.year}\nStream: ${formData.stream}\n\nMessage:\n${formData.message}`;
  const mailToLink = `mailto:parthibdutta947@gmail.com?subject=${encodeURIComponent('Aptiflux Support Inquiry')}&body=${encodeURIComponent(mailBody)}`;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Contact Us</h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
          Have a question about the mock tests? Found a bug? Or just want to say hi? We'd love to hear from you.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        {/* Contact Information */}
        <div className="glass-card rounded-2xl p-8 border border-slate-800 flex flex-col h-full">
          <h2 className="text-2xl font-bold text-foreground mb-6">Get in Touch</h2>

          <div className="space-y-6 flex-grow">
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 p-3 rounded-xl text-primary shadow-[0_0_15px_rgba(37,99,235,0.2)]">
                <Mail size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-200 text-lg">Email Support</h3>
                <p className="text-slate-400 mb-2">For any technical queries or support, drop us an email.</p>
                <a href="mailto:momentsinmotion788@gmail.com" className="text-primary font-medium underline hover:opacity-80 flex items-center gap-1 drop-shadow-md">
                  momentsinmotion788@gmail.com <ExternalLink size={14} />
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-primary/10 p-3 rounded-xl text-primary shadow-[0_0_15px_rgba(37,99,235,0.2)]">
                <MapPin size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-200 text-lg">Location</h3>
                <p className="text-slate-400 mb-1">Durgapur Institute of Advanced Technology and Management (DIATM)</p>
                {/* <p className="text-slate-500 text-sm">B.Tech, 4th Year</p> */}
                <p className="text-slate-300 font-medium mt-1">Maintained by Paradox</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-8 h-full">
          {/* Social Links 
          <div className="glass-card rounded-2xl p-8 border border-slate-800 shadow-xl">
            <h2 className="text-xl font-bold text-foreground mb-4">Connect on Socials</h2>
            <p className="text-slate-400 mb-6 text-sm">
              Follow along or reach out on my personal social accounts!
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="https://linkedin.com/in/YOUR_USERNAME" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-blue-950/50 text-blue-500 border border-blue-900 px-4 py-2 rounded-xl hover:bg-blue-900 transition-colors font-medium">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg> LinkedIn
              </a>
              <a href="https://github.com/YOUR_USERNAME" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-slate-800 text-slate-300 border border-slate-700 px-4 py-2 rounded-xl hover:bg-slate-700 transition-colors font-medium">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg> GitHub
              </a>
              <a href="https://instagram.com/YOUR_USERNAME" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-pink-950/50 text-pink-500 border border-pink-900 px-4 py-2 rounded-xl hover:bg-pink-900 transition-colors font-medium">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg> Instagram
              </a>
            </div>
          </div>
          */}

          {/* Message / Form UI */}
          <div className="bg-slate-900/50 rounded-2xl p-8 border border-slate-800 flex-grow flex flex-col justify-center">
            <h2 className="text-xl font-bold text-foreground mb-4">Send a direct email</h2>
            <p className="text-slate-400 mb-6 text-sm">
              Fill in the details below. Clicking the button will open your default email client with these details.
            </p>

            <div className="space-y-4 mb-6 text-sm">
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Your Name" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-primary transition-colors" />
              <div className="grid grid-cols-2 gap-4">
                <input type="text" name="roomNo" value={formData.roomNo} onChange={handleInputChange} placeholder="Room No." className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-primary transition-colors" />
                <input type="text" name="year" value={formData.year} onChange={handleInputChange} placeholder="Year" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-primary transition-colors" />
              </div>
              <input type="text" name="stream" value={formData.stream} onChange={handleInputChange} placeholder="Stream" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-primary transition-colors" />
              <textarea name="message" value={formData.message} onChange={handleInputChange} placeholder="Your Message" rows="4" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-primary transition-colors resize-none"></textarea>
            </div>

            <a
              href={mailToLink}
              className="w-full inline-flex justify-center items-center gap-2 bg-primary text-primary-foreground font-semibold py-3 px-6 rounded-xl hover:bg-primary/90 transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_20px_rgba(37,99,235,0.5)]"
            >
              <Mail size={18} /> Open Email Client
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
