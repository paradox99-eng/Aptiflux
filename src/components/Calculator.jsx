import React, { useState } from 'react';

export default function Calculator() {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');

  const handleNum = (num) => {
    if (display === '0' || display === 'Error') {
      setDisplay(num.toString());
    } else {
      setDisplay(display + num.toString());
    }
  };

  const handleOp = (op) => {
    if (display === 'Error') return;
    setEquation(equation + display + ' ' + op + ' ');
    setDisplay('0');
  };

  const calculate = () => {
    try {
      // Evaluate the equation + current display
      // Using a safe alternative to eval could be done, but for a simple local test calculator, eval on constrained inputs is acceptable.
      // We will constrain inputs to just numbers and operators.
      const fullEq = equation + display;
      // Basic sanitization
      if (/[^0-9+\-*/. ]/.test(fullEq)) throw new Error('Invalid');
      
      // eslint-disable-next-line no-eval
      const result = eval(fullEq);
      
      setDisplay(String(result));
      setEquation('');
    } catch (e) {
      setDisplay('Error');
      setEquation('');
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setEquation('');
  };

  const handleDelete = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const buttons = [
    { label: 'C', onClick: handleClear, className: 'col-span-2 bg-red-950/50 text-red-500 hover:bg-red-900/50' },
    { label: 'DEL', onClick: handleDelete, className: 'bg-slate-800 text-slate-300 hover:bg-slate-700' },
    { label: '/', onClick: () => handleOp('/'), className: 'bg-primary/10 text-primary hover:bg-primary hover:text-white' },
    { label: '7', onClick: () => handleNum(7), className: 'bg-slate-900/50 text-foreground hover:bg-slate-800' },
    { label: '8', onClick: () => handleNum(8), className: 'bg-slate-900/50 text-foreground hover:bg-slate-800' },
    { label: '9', onClick: () => handleNum(9), className: 'bg-slate-900/50 text-foreground hover:bg-slate-800' },
    { label: '*', onClick: () => handleOp('*'), className: 'bg-primary/10 text-primary hover:bg-primary hover:text-white' },
    { label: '4', onClick: () => handleNum(4), className: 'bg-slate-900/50 text-foreground hover:bg-slate-800' },
    { label: '5', onClick: () => handleNum(5), className: 'bg-slate-900/50 text-foreground hover:bg-slate-800' },
    { label: '6', onClick: () => handleNum(6), className: 'bg-slate-900/50 text-foreground hover:bg-slate-800' },
    { label: '-', onClick: () => handleOp('-'), className: 'bg-primary/10 text-primary hover:bg-primary hover:text-white' },
    { label: '1', onClick: () => handleNum(1), className: 'bg-slate-900/50 text-foreground hover:bg-slate-800' },
    { label: '2', onClick: () => handleNum(2), className: 'bg-slate-900/50 text-foreground hover:bg-slate-800' },
    { label: '3', onClick: () => handleNum(3), className: 'bg-slate-900/50 text-foreground hover:bg-slate-800' },
    { label: '+', onClick: () => handleOp('+'), className: 'bg-primary/10 text-primary hover:bg-primary hover:text-white' },
    { label: '0', onClick: () => handleNum(0), className: 'col-span-2 bg-slate-900/50 text-foreground hover:bg-slate-800' },
    { label: '.', onClick: () => handleNum('.'), className: 'bg-slate-900/50 text-foreground hover:bg-slate-800' },
    { label: '=', onClick: calculate, className: 'bg-accent text-slate-950 hover:bg-accent/90 shadow-sm' },
  ];

  return (
    <div className="glass-card p-3 rounded-xl shadow-sm border border-slate-800 w-56 flex flex-col h-fit">
      <div className="mb-3 text-right">
        <div className="text-slate-400 text-xs h-4 font-mono">{equation}</div>
        <div className="text-2xl font-semibold text-foreground font-mono overflow-x-auto overflow-y-hidden">{display}</div>
      </div>
      <div className="grid grid-cols-4 gap-1">
        {buttons.map((btn, i) => (
          <button
            key={i}
            onClick={btn.onClick}
            className={`p-2 rounded-lg font-semibold text-base transition-colors border border-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${btn.className}`}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
}

