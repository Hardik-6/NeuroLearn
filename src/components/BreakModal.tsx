import React, { useState, useEffect } from 'react';
import { Sparkles, X, RotateCcw, Heart, Coffee, Eye, Wind, Smile } from 'lucide-react';

interface BreakModalProps {
  isOpen: boolean;
  onClose: (boostedScore?: number) => void;
  currentScore: number;
}

export const BreakModal: React.FC<BreakModalProps> = ({ isOpen, onClose, currentScore }) => {
  const [secondsRemaining, setSecondsRemaining] = useState(300); // 5 min
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Rest'>('Inhale');
  const [phaseSeconds, setPhaseSeconds] = useState(4);
  const [activeTab, setActiveTab] = useState<'breathing' | 'grounding'>('breathing');

  useEffect(() => {
    if (!isOpen) {
      setSecondsRemaining(300);
      setIsTimerRunning(true);
      return;
    }

    const timer = setInterval(() => {
      if (isTimerRunning) {
        setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, isTimerRunning]);

  // Box Breathing cycle: 4s Inhale, 4s Hold, 4s Exhale, 4s Rest
  useEffect(() => {
    if (!isOpen || activeTab !== 'breathing') return;

    const breathInterval = setInterval(() => {
      setPhaseSeconds((prev) => {
        if (prev > 1) return prev - 1;

        setBreathPhase((current) => {
          if (current === 'Inhale') return 'Hold';
          if (current === 'Hold') return 'Exhale';
          if (current === 'Exhale') return 'Rest';
          return 'Inhale';
        });
        return 4;
      });
    }, 1000);

    return () => clearInterval(breathInterval);
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const handleResumeBoosted = () => {
    // Break boosts focus by replenishing cognitive reserves
    const newScore = Math.min(95, Math.max(currentScore + 25, 82));
    onClose(newScore);
  };

  return (
    <div
      id="break-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
    >
      <div
        id="break-modal-card"
        className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border-2 border-[#FF8A00]/25"
      >
        {/* Close button */}
        <button
          id="close-break-modal-btn"
          onClick={() => onClose()}
          className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-[#FFF7F3] hover:text-[#1E293B] transition-colors"
          aria-label="Close break modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF7F3] text-[#FF8A00] border border-[#FF8A00]/20 shadow-xs">
            <Coffee className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-[#1E293B]">Sensory Recharge Break</h3>
            <p className="text-xs text-[#1E293B]/60">Calibrated for neurodivergent cognitive replenishment</p>
          </div>
        </div>

        {/* Sensory friendly message */}
        <div className="rounded-2xl bg-[#FFF7F3] border border-[#FF8A00]/20 p-4 mb-5">
          <p className="text-xs text-[#1E293B] leading-relaxed">
            Your attention score dipped to <strong className="text-[#FF8A00]">{currentScore}/100</strong>. Soft computing algorithms suggest taking 5 minutes to release neck tension, look at a distant object, and reset your nervous system.
          </p>
        </div>

        {/* Mode Tabs: Box Breathing vs 5-4-3-2-1 Sensory Grounding */}
        <div className="flex rounded-xl bg-slate-100 p-1 mb-5">
          <button
            onClick={() => setActiveTab('breathing')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'breathing'
                ? 'bg-white text-[#1E293B] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Wind className="w-3.5 h-3.5 text-[#00C896]" />
            <span>Box Breathing (4-4-4-4)</span>
          </button>
          <button
            onClick={() => setActiveTab('grounding')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'grounding'
                ? 'bg-white text-[#1E293B] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-[#4D84FE]" />
            <span>5-4-3-2-1 Grounding</span>
          </button>
        </div>

        {/* Tab 1: Box Breathing Widget */}
        {activeTab === 'breathing' ? (
          <div className="flex flex-col items-center justify-center my-4">
            <div className="relative flex h-48 w-48 items-center justify-center">
              {/* Outer soft glowing rings */}
              <div
                className={`absolute inset-0 rounded-full transition-all duration-1000 ${
                  breathPhase === 'Inhale'
                    ? 'scale-115 bg-[#00C896]/20'
                    : breathPhase === 'Hold'
                    ? 'scale-110 bg-[#FF8A00]/20'
                    : breathPhase === 'Exhale'
                    ? 'scale-90 bg-[#4D84FE]/20'
                    : 'scale-95 bg-slate-200/40'
                }`}
              />
              {/* Center orb */}
              <div
                className={`relative z-10 flex h-36 w-36 flex-col items-center justify-center rounded-full shadow-lg transition-all duration-1000 ${
                  breathPhase === 'Inhale'
                    ? 'bg-gradient-to-tr from-[#00C896] to-emerald-400 text-white scale-105'
                    : breathPhase === 'Hold'
                    ? 'bg-gradient-to-tr from-[#FF8A00] to-amber-400 text-white scale-100'
                    : breathPhase === 'Exhale'
                    ? 'bg-gradient-to-tr from-[#4D84FE] to-indigo-400 text-white scale-90'
                    : 'bg-gradient-to-tr from-slate-400 to-slate-500 text-white scale-95'
                }`}
              >
                <Heart className="h-6 w-6 mb-1 opacity-90 animate-pulse" />
                <span className="text-base font-extrabold tracking-wide uppercase">{breathPhase}</span>
                <span className="text-xs opacity-90 font-mono font-bold">{phaseSeconds}s</span>
              </div>
            </div>

            <div className="mt-3 text-center">
              <span className="text-xl font-mono font-bold text-[#1E293B] tracking-wider">
                {timeFormatted}
              </span>
              <p className="text-[11px] text-[#1E293B]/60 mt-0.5">
                {breathPhase === 'Inhale' && 'Slowly breathe in through your nose...'}
                {breathPhase === 'Hold' && 'Gently hold your breath in place...'}
                {breathPhase === 'Exhale' && 'Smoothly exhale through your mouth...'}
                {breathPhase === 'Rest' && 'Pause and let your shoulders drop...'}
              </p>
            </div>
          </div>
        ) : (
          /* Tab 2: 5-4-3-2-1 Sensory Grounding Guide */
          <div className="space-y-2.5 my-2">
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center gap-3 text-xs">
              <span className="w-6 h-6 rounded-lg bg-amber-200 text-amber-800 font-bold flex items-center justify-center shrink-0">5</span>
              <span className="text-amber-950 font-medium">Spot <strong>5 things you can see</strong> around the room</span>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center gap-3 text-xs">
              <span className="w-6 h-6 rounded-lg bg-emerald-200 text-emerald-800 font-bold flex items-center justify-center shrink-0">4</span>
              <span className="text-emerald-950 font-medium">Touch <strong>4 different textures</strong> (desk, shirt, hair, smooth table)</span>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200/60 flex items-center gap-3 text-xs">
              <span className="w-6 h-6 rounded-lg bg-blue-200 text-blue-800 font-bold flex items-center justify-center shrink-0">3</span>
              <span className="text-blue-950 font-medium">Listen for <strong>3 distinct sounds</strong> (fan hum, birds, clock)</span>
            </div>
            <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-200/60 flex items-center gap-3 text-xs">
              <span className="w-6 h-6 rounded-lg bg-purple-200 text-purple-800 font-bold flex items-center justify-center shrink-0">2</span>
              <span className="text-purple-950 font-medium">Notice <strong>2 smells</strong> around your space</span>
            </div>
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200/60 flex items-center gap-3 text-xs">
              <span className="w-6 h-6 rounded-lg bg-rose-200 text-rose-800 font-bold flex items-center justify-center shrink-0">1</span>
              <span className="text-rose-950 font-medium">Acknowledge <strong>1 great thing about yourself</strong> today! <Smile className="w-3.5 h-3.5 inline text-rose-500" /></span>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-3">
          <button
            id="resume-boosted-btn"
            onClick={handleResumeBoosted}
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-[#00C896] hover:bg-[#00b587] px-5 py-3 text-sm font-bold text-white shadow-md shadow-[#00C896]/20 transition-all active:scale-98"
          >
            <Sparkles className="h-4 w-4" />
            I Feel Calmer, Resume Learning
          </button>
          <button
            id="pause-timer-btn"
            onClick={() => setIsTimerRunning(!isTimerRunning)}
            className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            {isTimerRunning ? 'Pause' : 'Resume'}
          </button>
        </div>
      </div>
    </div>
  );
};
