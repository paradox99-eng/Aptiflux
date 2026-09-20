"use client";
import React, { useState } from 'react';
import { BrainCircuit, Sparkles, Wand2, Activity } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminAgents() {
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [isGeneratingWeeklyQuiz, setIsGeneratingWeeklyQuiz] = useState(false);
  const [topicToGenerate, setTopicToGenerate] = useState('Number System');
  const [numQuestions, setNumQuestions] = useState(5);

  const handleGenerate = async () => {
    setIsGeneratingQuestions(true);
    
    try {
      const response = await fetch('/api/admin/generate-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subtopic: topicToGenerate,
          numQuestions: parseInt(numQuestions)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate questions');
      }

      toast.success(`Successfully generated ${data.count} new questions for ${topicToGenerate}! They have been added to your local questionsData.js file.`);
    } catch (error) {
      console.error(error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto fade-in-stagger">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">AI Agents Console</h1>
        <p className="text-slate-400">Manually trigger background agents to generate content or analyze data.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Content Generator Agent */}
        <div className="glass-card rounded-2xl shadow-sm border border-slate-800 overflow-hidden">
          <div className="bg-primary/20 border-b border-slate-800 p-5 flex items-start gap-4">
            <div className="w-12 h-12 bg-primary/30 text-primary rounded-full flex items-center justify-center shrink-0">
              <Sparkles size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Content Generator</h2>
              <p className="text-sm text-slate-400 mt-1">Generates unique, mathematically accurate aptitude questions with step-by-step explanations.</p>
            </div>
          </div>
          <div className="p-5">
            <div className="mb-4">
              <label className="block text-sm font-semibold text-slate-300 mb-2">Target Subtopic</label>
              <select 
                value={topicToGenerate}
                onChange={(e) => setTopicToGenerate(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary text-foreground outline-none"
              >
                <option value="Number System">Number System</option>
                <option value="Geometry">Geometry</option>
                <option value="Reading Comprehension">Reading Comprehension</option>
                <option value="Syllogism">Syllogism</option>
                <option value="Time and Work">Time and Work</option>
                <option value="Time, Speed and Distance">Time, Speed and Distance</option>
                
              </select>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-300 mb-2">Number of Questions</label>
              <input 
                type="number" 
                min="1" 
                max="20"
                value={numQuestions}
                onChange={(e) => setNumQuestions(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary text-foreground outline-none"
              />
            </div>
            <button 
              onClick={handleGenerate}
              disabled={isGeneratingQuestions}
              className="w-full bg-primary text-slate-950 font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-primary/80 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isGeneratingQuestions ? (
                <><Activity size={18} className="animate-spin" /> Generating...</>
              ) : (
                <><Wand2 size={18} /> Trigger Generation</>
              )}
            </button>
          </div>
        </div>

        {/* Weekly Quiz Generator Agent */}
        <div className="glass-card rounded-2xl shadow-sm border border-slate-800 overflow-hidden">
          <div className="bg-amber-950/30 border-b border-slate-800 p-5 flex items-start gap-4">
            <div className="w-12 h-12 bg-amber-500/20 text-amber-500 rounded-full flex items-center justify-center shrink-0">
              <Sparkles size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Weekly Quiz Generator</h2>
              <p className="text-sm text-slate-400 mt-1">Generates exactly 10 random mixed questions and publishes them for the current week.</p>
            </div>
          </div>
          <div className="p-5">
            <button 
              onClick={async () => {
                setIsGeneratingWeeklyQuiz(true);
                try {
                  const response = await fetch('/api/admin/generate-weekly-quiz', { method: 'POST' });
                  const data = await response.json();
                  if (!response.ok) throw new Error(data.error || 'Failed to generate weekly quiz');
                  toast.success(`Successfully generated and published 10 questions for week ${data.weekId}!`);
                } catch (error) {
                  console.error(error);
                  toast.error(`Error: ${error.message}`);
                } finally {
                  setIsGeneratingWeeklyQuiz(false);
                }
              }}
              disabled={isGeneratingWeeklyQuiz}
              className="w-full bg-amber-600 text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-amber-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed mt-auto"
            >
              {isGeneratingWeeklyQuiz ? (
                <><Activity size={18} className="animate-spin" /> Generating...</>
              ) : (
                <><Wand2 size={18} /> Publish Weekly Quiz</>
              )}
            </button>
          </div>
        </div>

        {/* Analytics Agent */}
        <div className="glass-card rounded-2xl shadow-sm border border-slate-800 overflow-hidden opacity-80 md:col-span-2 lg:col-span-1">
          <div className="bg-emerald-950/30 border-b border-slate-800 p-5 flex items-start gap-4">
            <div className="w-12 h-12 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center shrink-0">
              <BrainCircuit size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Analytics Agent</h2>
              <p className="text-sm text-slate-400 mt-1">Analyzes global student scores to identify widespread weak spots and generate study plans.</p>
            </div>
          </div>
          <div className="p-5 flex flex-col items-center justify-center h-48 text-center text-slate-400">
            <p>This agent runs automatically in the background on a cron job every Sunday.</p>
            <button disabled className="mt-4 bg-slate-800 text-slate-500 font-semibold py-2 px-6 rounded-lg cursor-not-allowed">
              Manual Trigger Disabled
            </button>
          </div>
        </div>
        
      </div>
    </div>
  );
}

