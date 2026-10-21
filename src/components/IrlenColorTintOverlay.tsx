import React from 'react';

export type IrlenTint = 'none' | 'peach' | 'butter' | 'mint' | 'rose' | 'aqua' | 'lavender';

interface IrlenColorTintOverlayProps {
  tint: IrlenTint;
  intensity: number; // 0.1 to 0.4
}

const TINT_COLORS: Record<IrlenTint, string> = {
  none: 'transparent',
  peach: '#FF8A00',
  butter: '#F59E0B',
  mint: '#00C896',
  rose: '#F43F5E',
  aqua: '#4D84FE',
  lavender: '#8B5CF6'
};

export const IrlenColorTintOverlay: React.FC<IrlenColorTintOverlayProps> = ({
  tint,
  intensity
}) => {
  if (tint === 'none') return null;

  const hex = TINT_COLORS[tint];

  return (
    <div
      className="fixed inset-0 z-30 pointer-events-none select-none transition-all duration-300"
      style={{
        backgroundColor: hex,
        opacity: intensity,
        mixBlendMode: 'multiply'
      }}
      aria-hidden="true"
    />
  );
};
