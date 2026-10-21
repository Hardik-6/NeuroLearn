import React, { useState, useEffect } from 'react';
import { Eye, MoveVertical, X, Minus, Plus } from 'lucide-react';

interface ReadingFocusRulerProps {
  isActive: boolean;
  onToggle: () => void;
}

export const ReadingFocusRuler: React.FC<ReadingFocusRulerProps> = ({ isActive, onToggle }) => {
  const [rulerY, setRulerY] = useState(250);
  const [rulerHeight, setRulerHeight] = useState(65); // height in pixels
  const [dimOpacity, setDimOpacity] = useState(0.45); // darkness of surrounding mask
  const [mode, setMode] = useState<'window' | 'line'>('window');

  useEffect(() => {
    if (!isActive) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Keep ruler within viewport boundaries
      setRulerY(e.clientY);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        setRulerY((prev) => Math.max(80, prev - 24));
      } else if (e.key === 'ArrowDown') {
        setRulerY((prev) => Math.min(window.innerHeight - 80, prev + 24));
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive]);

  if (!isActive) return null;

  const topMaskHeight = Math.max(0, rulerY - rulerHeight / 2);

  return (
    <div className="fixed inset-0 z-40 pointer-events-none select-none transition-opacity duration-200">
      {mode === 'window' ? (
        <>
          {/* Top dimming mask */}
          <div
            className="absolute top-0 left-0 right-0 bg-slate-950 backdrop-blur-[0.5px] transition-all duration-75"
            style={{
              height: `${topMaskHeight}px`,
              opacity: dimOpacity
            }}
          />

          {/* Focused reading clear slit / window */}
          <div
            className="absolute left-0 right-0 border-y-2 border-[#FF8A00] bg-[#FF8A00]/5 shadow-[0_0_20px_rgba(255,138,0,0.25)] transition-all duration-75"
            style={{
              top: `${topMaskHeight}px`,
              height: `${rulerHeight}px`
            }}
          >
            {/* Guide markers on left and right */}
            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-[11px] font-bold text-[#FF8A00] bg-white/90 px-2 py-0.5 rounded-full shadow-xs">
              <Eye className="w-3 h-3" />
              <span>Focus Line</span>
            </div>
          </div>

          {/* Bottom dimming mask */}
          <div
            className="absolute bottom-0 left-0 right-0 bg-slate-950 backdrop-blur-[0.5px] transition-all duration-75"
            style={{
              top: `${topMaskHeight + rulerHeight}px`,
              opacity: dimOpacity
            }}
          />
        </>
      ) : (
        /* Underline Guide Mode */
        <div
          className="absolute left-0 right-0 border-b-4 border-[#00C896] shadow-[0_4px_12px_rgba(0,200,150,0.4)] transition-all duration-75"
          style={{ top: `${rulerY}px` }}
        />
      )}

      {/* Floating control dock for ruler settings */}
      <div className="fixed bottom-6 right-6 z-50 pointer-events-auto bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-[#FF8A00]/25 p-3 flex items-center gap-3 text-xs text-[#1E293B]">
        <div className="flex items-center gap-1.5 font-bold text-[#FF8A00] pr-2 border-r border-slate-200">
          <MoveVertical className="w-4 h-4" />
          <span>Focus Ruler</span>
        </div>

        {/* Mode Toggle */}
        <div className="flex rounded-lg bg-[#FFF7F3] p-0.5 border border-[#FF8A00]/15">
          <button
            onClick={() => setMode('window')}
            className={`px-2 py-1 rounded font-semibold transition-all ${
              mode === 'window' ? 'bg-[#FF8A00] text-white shadow-xs' : 'text-[#1E293B]/70'
            }`}
          >
            Window
          </button>
          <button
            onClick={() => setMode('line')}
            className={`px-2 py-1 rounded font-semibold transition-all ${
              mode === 'line' ? 'bg-[#00C896] text-white shadow-xs' : 'text-[#1E293B]/70'
            }`}
          >
            Line
          </button>
        </div>

        {/* Height Adjust */}
        {mode === 'window' && (
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-500 font-medium">Height</span>
            <button
              onClick={() => setRulerHeight((h) => Math.max(40, h - 15))}
              className="p-1 rounded hover:bg-slate-100 text-slate-700 font-bold"
              title="Narrow window"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="font-mono text-[11px] font-bold w-7 text-center">{rulerHeight}px</span>
            <button
              onClick={() => setRulerHeight((h) => Math.min(150, h + 15))}
              className="p-1 rounded hover:bg-slate-100 text-slate-700 font-bold"
              title="Widen window"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Dimmer opacity slider */}
        {mode === 'window' && (
          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
            <span className="text-[10px] text-slate-500 font-medium">Dim</span>
            <button
              onClick={() => setDimOpacity((d) => (d === 0.3 ? 0.55 : d === 0.55 ? 0.75 : 0.3))}
              className="px-2 py-0.5 rounded bg-slate-100 font-mono font-bold text-[10px] hover:bg-slate-200"
            >
              {Math.round(dimOpacity * 100)}%
            </button>
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={onToggle}
          className="p-1.5 rounded-full hover:bg-rose-50 hover:text-rose-600 text-slate-400 transition-colors ml-1"
          title="Turn off reading ruler"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
