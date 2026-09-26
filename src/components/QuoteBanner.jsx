import React, { useState } from 'react';
import { RefreshCw, Sparkles } from 'lucide-react';
import { QUOTES } from '../utils/quotes';

export default function QuoteBanner({ scene }) {
  const [index, setIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  const nextQuote = () => {
    setIsFading(true);
    setTimeout(() => {
      setIndex((prev) => (prev + 1) % QUOTES.length);
      setIsFading(false);
    }, 200);
  };

  const item = QUOTES[index];

  return (
    <div className="relative max-w-3xl mx-auto rounded-3xl p-5 sm:p-6 bg-black/45 border border-white/10 backdrop-blur-2xl text-slate-100 shadow-2xl transition-all duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        <div className={`transition-opacity duration-200 ${isFading ? 'opacity-0' : 'opacity-100'}`}>
          <p className="font-serif italic text-sm sm:text-base leading-relaxed tracking-wide text-white/95">
            "{item.quote}"
          </p>
          <div className="mt-2 flex items-center space-x-2 text-xs font-serif">
            <span className="font-semibold text-amber-200">{item.speaker}</span>
            <span className="text-slate-500">—</span>
            <span className="text-slate-400 italic">{item.source}</span>
          </div>
        </div>

        <button
          onClick={nextQuote}
          className="self-end sm:self-center flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/15 text-xs font-serif text-slate-300 hover:text-white transition-all flex-shrink-0"
          title="Cycle Philosophical Aphorism"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFading ? 'animate-spin' : ''}`} />
          <span>Next Axiom</span>
        </button>

      </div>
    </div>
  );
}
