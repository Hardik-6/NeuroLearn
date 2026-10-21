/**
 * Gentle Web Audio chimes designed specifically for neurodivergent sensory profiles.
 * No harsh buzzers, abrupt beeps, or loud frequencies.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  try {
    if (!audioCtx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  } catch {
    return null;
  }
}

/**
 * Plays a warm, soft harmonic chord (C5 - E5 - G5) with smooth sine decay
 */
export function playGentleSuccessChime() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
  const now = ctx.currentTime;

  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine'; // Pure, gentle sine wave
    osc.frequency.setValueAtTime(freq, now + i * 0.08);

    // Soft envelope to avoid abrupt attack/clicks
    gain.gain.setValueAtTime(0, now + i * 0.08);
    gain.gain.linearRampToValueAtTime(0.08, now + i * 0.08 + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.08 + 0.6);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + i * 0.08);
    osc.stop(now + i * 0.08 + 0.65);
  });
}

/**
 * Plays a gentle, encouraging low marimba tone (soft A3 / C4) for an attempt
 */
export function playGentleAttemptTone() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(261.63, now); // C4

  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.06, now + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.45);
}
