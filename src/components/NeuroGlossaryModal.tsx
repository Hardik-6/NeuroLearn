import React from 'react';
import { Volume2, Sparkles, X, Lightbulb, BookOpen } from 'lucide-react';
import { GlossaryEntry } from '../utils/neuroGlossary';

interface NeuroGlossaryModalProps {
  entry: GlossaryEntry | null;
  onClose: () => void;
}

export const NeuroGlossaryModal: React.FC<NeuroGlossaryModalProps> = ({ entry, onClose }) => {
  if (!entry) return null;

  const handlePronounce = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(entry.term);
      utterance.rate = 0.8;
      utterance.pitch = 1.05;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white p-6 shadow-2xl border-2 border-[#FF8A00]/25"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header decoration */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-[#FFF7F3] text-[#FF8A00] border border-[#FF8A00]/20">
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-[#FF8A00] uppercase tracking-wider">
              Neuro-Glossary • Plain English Clue
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Word Title & Syllable Break */}
        <div className="mt-4 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-black text-[#1E293B] tracking-tight">{entry.term}</h3>
            <p className="text-sm font-semibold text-[#4D84FE] tracking-wide mt-0.5">
              🗣️ {entry.syllables}
            </p>
          </div>
          <button
            onClick={handlePronounce}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#4D84FE] hover:bg-[#3b72e5] text-white font-bold text-xs shadow-xs transition-all active:scale-95"
            title="Hear pronunciation"
          >
            <Volume2 className="w-4 h-4" />
            <span>Say it</span>
          </button>
        </div>

        {/* 5th-Grade Simple Definition */}
        <div className="mt-4 p-4 rounded-2xl bg-[#FFF7F3] border border-[#FF8A00]/15">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#1E293B] mb-1">
            <BookOpen className="w-3.5 h-3.5 text-[#FF8A00]" />
            <span>Simple Meaning</span>
          </div>
          <p className="text-sm text-[#1E293B] leading-relaxed font-medium">
            {entry.simpleDefinition}
          </p>
        </div>

        {/* Real-World Everyday Analogy */}
        <div className="mt-3 p-4 rounded-2xl bg-[#00C896]/10 border border-[#00C896]/20">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#00C896] mb-1">
            <Lightbulb className="w-3.5 h-3.5 text-[#00C896]" />
            <span>Picture It Like This</span>
          </div>
          <p className="text-sm text-[#1E293B] leading-relaxed">
            {entry.analogy}
          </p>
        </div>

        {/* Footer info */}
        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#1E293B] hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
};
