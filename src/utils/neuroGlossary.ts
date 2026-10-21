export interface GlossaryEntry {
  term: string;
  syllables: string;
  simpleDefinition: string;
  analogy: string;
  category?: string;
}

export const NEURO_GLOSSARY: Record<string, GlossaryEntry> = {
  photosphere: {
    term: 'Photosphere',
    syllables: 'Pho-to-sphere',
    simpleDefinition: 'The bright outer surface of the Sun that we can see from Earth.',
    analogy: 'Like the glowing crust of a giant fiery loaf of bread in space.',
    category: 'Astronomy'
  },
  gravitational: {
    term: 'Gravitational',
    syllables: 'Gra-vi-ta-tion-al',
    simpleDefinition: 'Related to the invisible force that pulls objects toward one another.',
    analogy: 'Like an invisible magnet that keeps your feet firmly planted on the ground.',
    category: 'Physics'
  },
  terrestrial: {
    term: 'Terrestrial',
    syllables: 'Ter-res-tri-al',
    simpleDefinition: 'Rocky planets that have a solid, hard ground you could walk on.',
    analogy: 'Like rocky stepping stones across a pond, unlike a gas cloud.',
    category: 'Astronomy'
  },
  equilibrium: {
    term: 'Equilibrium',
    syllables: 'E-qui-li-bri-um',
    simpleDefinition: 'A state of perfect balance where opposing forces cancel each other out.',
    analogy: 'Like a see-saw with two friends of the exact same weight sitting completely flat.',
    category: 'Science'
  },
  atmosphere: {
    term: 'Atmosphere',
    syllables: 'At-mos-phere',
    simpleDefinition: 'The blanket of air and gases surrounding a planet.',
    analogy: 'Like a cozy winter jacket wrapping the Earth to keep warmth and breathable air inside.',
    category: 'Astronomy'
  },
  radiation: {
    term: 'Radiation',
    syllables: 'Ra-di-a-tion',
    simpleDefinition: 'Energy that travels in waves or high-speed particles through space.',
    analogy: 'Like the invisible warmth you feel on your skin when standing near a cozy campfire.',
    category: 'Physics'
  },
  photosynthesis: {
    term: 'Photosynthesis',
    syllables: 'Pho-to-syn-the-sis',
    simpleDefinition: 'How plants use sunlight, water, and air to make their own sugary food.',
    analogy: 'Like a solar-powered green kitchen inside every leaf that bakes plant cookies from sunshine!',
    category: 'Biology'
  },
  asteroid: {
    term: 'Asteroid',
    syllables: 'As-te-roid',
    simpleDefinition: 'A small rocky object orbiting the Sun, smaller than a planet.',
    analogy: 'Like leftover building bricks tumbling through space from when planets were first made.',
    category: 'Astronomy'
  },
  hemisphere: {
    term: 'Hemisphere',
    syllables: 'He-mi-sphere',
    simpleDefinition: 'Exactly one half of a sphere or globe.',
    analogy: 'Like cutting an orange in half—each half is a hemisphere.',
    category: 'Geography'
  },
  density: {
    term: 'Density',
    syllables: 'Den-si-ty',
    simpleDefinition: 'How tightly packed the stuff inside an object is.',
    analogy: 'A sponge has low density, but a heavy metal coin of the same size has high density.',
    category: 'Physics'
  },
  adaptive: {
    term: 'Adaptive',
    syllables: 'A-dap-tive',
    simpleDefinition: 'Able to change and adjust to what you specifically need in the moment.',
    analogy: 'Like a smart pair of shoes that automatically tightens or loosens when your feet get tired.',
    category: 'General'
  },
  cognitive: {
    term: 'Cognitive',
    syllables: 'Cog-ni-tive',
    simpleDefinition: 'Related to mental thinking, learning, remembering, and paying attention.',
    analogy: 'Like the brain’s mental muscle power when solving a fun puzzle.',
    category: 'Psychology'
  }
};

/**
 * Searches text for any glossary terms
 */
export function findGlossaryTerm(word: string): GlossaryEntry | null {
  const clean = word.toLowerCase().replace(/[^a-z]/g, '');
  return NEURO_GLOSSARY[clean] || null;
}
