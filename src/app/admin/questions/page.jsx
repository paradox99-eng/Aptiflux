"use client";
import React, { useState, useMemo } from 'react';
import { questionsData } from '../../../questionsData';
import { Search, Filter, BookOpen } from 'lucide-react';

export default function AdminQuestions() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Flatten questions
  const allQuestions = useMemo(() => {
    let list = [];
    Object.keys(questionsData).forEach(catKey => {
      const cat = questionsData[catKey];
      cat.questions.forEach(q => {
        list.push({ ...q, categoryTitle: cat.title });
      });
    });
    return list;
  }, []);

  const filteredQuestions = useMemo(() => {
    return allQuestions.filter(q => {
      const matchSearch = q.text.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          q.subtopic.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory = selectedCategory === 'All' || q.categoryTitle === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [allQuestions, searchTerm, selectedCategory]);

  return (
    <div className="max-w-6xl mx-auto fade-in-stagger h-full flex flex-col">
      <div className="mb-6 shrink-0">
        <h1 className="text-3xl font-bold text-foreground mb-2">Question Bank</h1>
        <p className="text-slate-400">Browse and manage all {allQuestions.length} questions in the system.</p>
      </div>

      <div className="glass-card rounded-2xl shadow-sm border border-slate-800 flex-1 flex flex-col min-h-0">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-900/50 rounded-t-2xl shrink-0">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Search questions or subtopics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary text-foreground outline-none"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter size={18} className="text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary text-foreground outline-none w-full sm:w-auto"
            >
              <option value="All">All Categories</option>
              <option value="Quantitative Aptitude">Quantitative Aptitude</option>
              <option value="Logical Reasoning">Logical Reasoning</option>
              <option value="Verbal Ability">Verbal Ability</option>
              <option value="General Awareness">General Awareness</option>
            </select>
          </div>
        </div>

        {/* Table / List */}
        <div className="overflow-y-auto p-0 flex-1 custom-scrollbar">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/50 sticky top-0 z-10 text-xs uppercase font-semibold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4 w-16">ID</th>
                <th className="px-6 py-4 w-48">Category / Subtopic</th>
                <th className="px-6 py-4">Question Text</th>
                <th className="px-6 py-4 w-32 text-center">Passage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredQuestions.length > 0 ? (
                filteredQuestions.map((q, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-slate-400">#{q.id}</td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-foreground">{q.subtopic}</div>
                      <div className="text-xs text-slate-400 mt-1">{q.categoryTitle}</div>
                    </td>
                    <td className="px-6 py-4 max-w-md">
                      <p className="truncate" title={q.text}>{q.text}</p>
                      <div className="mt-1 flex items-center gap-1.5 text-xs">
                        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
                        <span className="text-slate-400 truncate" title={q.correctAnswer}>{q.correctAnswer}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {q.passage ? (
                        <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-500 px-2.5 py-1 rounded-full text-xs font-semibold">
                          <BookOpen size={12} /> Yes
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-slate-400">
                    No questions found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

