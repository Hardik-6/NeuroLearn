import React from 'react';

/**
 * Splits text into bionic reading tokens where the first 35-50%
 * of characters in each word are bolded to create saccadic fixation anchors.
 * This significantly helps students with ADHD and Dyslexia read faster and maintain focus.
 */
export function formatBionicReading(text: string): React.ReactNode[] {
  if (!text) return [];

  // Match words, whitespace, and punctuation
  const tokens = text.split(/(\s+)/);

  return tokens.map((token, index) => {
    // If it's whitespace, return as-is
    if (/^\s+$/.test(token)) {
      return token;
    }

    // Clean leading punctuation if any
    const match = token.match(/^([^a-zA-Z0-9]*)([a-zA-Z0-9]+)([^a-zA-Z0-9]*)$/);
    if (!match) {
      return token;
    }

    const [, leadingPunct, word, trailingPunct] = match;
    const len = word.length;

    // Fixation length calculation
    let fixLen = 1;
    if (len === 1) fixLen = 1;
    else if (len <= 3) fixLen = 1;
    else if (len <= 5) fixLen = 2;
    else if (len <= 8) fixLen = 3;
    else fixLen = Math.ceil(len * 0.45);

    const boldPart = word.slice(0, fixLen);
    const normalPart = word.slice(fixLen);

    return (
      <span key={index} className="inline-block">
        {leadingPunct}
        <strong className="font-extrabold text-[#1E293B] opacity-100">{boldPart}</strong>
        <span className="opacity-90">{normalPart}</span>
        {trailingPunct}
      </span>
    );
  });
}
