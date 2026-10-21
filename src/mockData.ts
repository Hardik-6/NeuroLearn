import {
  StudentProfile,
  Activity,
  LessonContent,
  QuizQuestion,
  StudentSubmission,
  QuizAttempt,
  CompletedLessonRecord,
  FocusSessionLog
} from './types';

// Real enrolled student cohort profiles
export const INITIAL_STUDENTS: StudentProfile[] = [
  {
    id: 'student-leo-01',
    name: 'Leo Rivera',
    age: 12,
    diagnoses: ['ADHD'],
    preferredLearningStyle: 'visual',
    currentFocusScore: 84,
    fuzzyState: 'Optimal focus',
    attentionSpanMinutes: 18,
    sensorySensitivities: ['High text density', 'Auditory distractions'],
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    recentAccuracy: 85,
    avgResponseTimeSec: 8.5,
    currentMood: 4
  },
  {
    id: 'student-maya-02',
    name: 'Maya Lin',
    age: 11,
    diagnoses: ['Dyslexia'],
    preferredLearningStyle: 'auditory',
    currentFocusScore: 78,
    fuzzyState: 'Good focus',
    attentionSpanMinutes: 22,
    sensorySensitivities: ['Crowded layouts', 'Rapid transitions'],
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    recentAccuracy: 95,
    avgResponseTimeSec: 11.2,
    currentMood: 5
  },
  {
    id: 'student-sam-03',
    name: 'Sam Thorne',
    age: 13,
    diagnoses: ['Autism'],
    preferredLearningStyle: 'reading',
    currentFocusScore: 68,
    fuzzyState: 'Steady attention',
    attentionSpanMinutes: 25,
    sensorySensitivities: ['Harsh contrast', 'Flashing elements'],
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    recentAccuracy: 80,
    avgResponseTimeSec: 14.0,
    currentMood: 3
  }
];

export const SOLAR_SYSTEM_LESSON: LessonContent = {
  id: 'lesson-solar-system',
  title: 'The Solar System & Cosmic Neighborhood',
  subject: 'Science',
  estimatedMinutes: 15,
  description: 'An inclusive, multi-sensory journey through the planets, asteroid belt, and gas giants with video, presentation slides, and text.',
  author: 'Teacher Curated',
  targetAccommodations: ['ADHD', 'Dyslexia', 'Autism'],
  videoUrl: 'https://www.youtube-nocookie.com/embed/libKVRa07BM',
  videoTitle: 'Exploring Our Solar System (Planets & Orbits)',
  pptFileName: 'Solar_System_Overview.pptx',
  pptUrl: 'https://docs.google.com/presentation/d/e/2PACX-1vTsolar_preview',
  pptSlides: [
    {
      slideNumber: 1,
      title: 'Our Solar System at a Glance',
      bullets: [
        'Center: The Sun (a yellow dwarf star containing 99.8% of all mass)',
        '8 Major Planets separated into Terrestrial and Gas Giants',
        'Gravitational equilibrium keeps elliptical orbits steady'
      ],
      visualCue: 'Sun at left, orbital rings spreading outwards to Kuiper belt',
      speakerNotes: 'Start with the central scale: remind students how vast empty space is between planets.'
    },
    {
      slideNumber: 2,
      title: 'The Inner Terrestrial Worlds',
      bullets: [
        'Mercury: Rocky, no atmosphere, extreme temperature shifts',
        'Venus: Dense CO2 blanket, runaway greenhouse heat (465°C)',
        'Earth: Liquid oceans, protective magnetic field, life',
        'Mars: Iron oxide red desert, ancient river valleys and polar ice'
      ],
      visualCue: 'Four inner rocky spheres compared side by side with true scale',
      speakerNotes: 'Highlight why Earth is special due to liquid water and moderate greenhouse effect.'
    },
    {
      slideNumber: 3,
      title: 'The Asteroid Belt & Outer Gas Giants',
      bullets: [
        'Asteroid Belt: Millions of rocky fragments between Mars and Jupiter',
        'Jupiter: Largest planet, Great Red Spot storm, 95 moons',
        'Saturn: Thousands of dazzling ringlets made of water ice chunks',
        'Uranus & Neptune: Ice giants colored cyan and deep azure by methane'
      ],
      visualCue: 'Jupiter and Saturn with prominent ring systems and storm belts',
      speakerNotes: 'Pause here for visual learners to observe the ring geometry and atmospheric bands.'
    }
  ],
  sections: [
    {
      heading: 'Our Cosmic Neighborhood',
      text: 'The solar system is made up of the Sun and everything that orbits around it. This includes 8 major planets, dwarf planets like Pluto, dozens of moons, millions of rocky asteroids, and icy comets wandering from the deep outer freeze.',
      keyPoints: [
        'The Sun contains 99.8% of all mass in the solar system.',
        'Planets travel in elliptical orbits held by gravity.'
      ]
    },
    {
      heading: 'The Inner Terrestrial Planets',
      text: 'Mercury, Venus, Earth, and Mars are the four inner planets. They are called terrestrial planets because they have solid, rocky surfaces. Earth is the only known world with oceans of liquid water and abundant life.',
      keyPoints: [
        'Mercury has extreme temperatures with no atmosphere to insulate it.',
        'Venus has a thick atmosphere that traps heat like a giant greenhouse.',
        'Mars has iron-rich red soil and polar ice caps.'
      ]
    },
    {
      heading: 'The Outer Gas & Ice Giants',
      text: 'Past the asteroid belt lie the giant planets: Jupiter, Saturn, Uranus, and Neptune. Jupiter and Saturn are mostly hydrogen and helium gas, while Uranus and Neptune contain water, ammonia, and methane ice crystals giving them vivid blue hues.',
      keyPoints: [
        'Jupiter is so massive that all other planets could fit inside it.',
        'Saturn features dazzling rings made of billions of ice chunks and dust.'
      ]
    }
  ]
};

export const DEFAULT_LESSONS: LessonContent[] = [
  SOLAR_SYSTEM_LESSON,
  {
    id: 'lesson-plant-biology',
    title: 'Photosynthesis & Plant Cell Architecture',
    subject: 'Biology',
    estimatedMinutes: 12,
    description: 'Discover how chlorophyll converts sunlight, water, and CO2 into vital energy and oxygen.',
    author: 'Curriculum Team',
    targetAccommodations: ['ADHD', 'Dyslexia'],
    videoUrl: 'https://www.youtube-nocookie.com/embed/UPBMG5EYydo',
    videoTitle: 'Photosynthesis in 3D: Light Reaction & Calvin Cycle',
    pptFileName: 'Photosynthesis_Architecture.pptx',
    pptSlides: [
      {
        slideNumber: 1,
        title: 'Energy Capture in Chloroplasts',
        bullets: [
          'Thylakoid membranes hold green chlorophyll pigments',
          'Photon absorption excites electrons to split water molecules',
          'Byproduct released: Oxygen (O2) that all animals breathe'
        ],
        visualCue: 'Cross-section diagram of a plant leaf and chloroplast organelle',
        speakerNotes: 'Emphasize the cyclical harmony between plant photosynthesis and human respiration.'
      },
      {
        slideNumber: 2,
        title: 'Chemical Equation of Life',
        bullets: [
          '6CO2 + 6H2O + Sunlight -> C6H12O6 + 6O2',
          'Glucose provides metabolic fuel and structural cellulose for plant stems',
          'Stomata pores open and close to regulate gas exchange and water conservation'
        ],
        visualCue: 'Balanced molecular diagram showing carbon atoms flowing into glucose rings'
      }
    ],
    sections: [
      {
        heading: 'The Solar-Powered Cell',
        text: 'Every green leaf is a miniature solar-powered biochemical factory. Through microscopic pores called stomata, leaves absorb carbon dioxide from the air and water from the soil.',
        keyPoints: [
          'Chlorophyll pigments absorb blue and red light while reflecting green.',
          'Solar energy splits water into oxygen and hydrogen protons.'
        ]
      },
      {
        heading: 'Creating Glucose and Storing Fuel',
        text: 'During the Calvin cycle, hydrogen combines with carbon dioxide to synthesize glucose sugars. This organic energy fuels cellular growth and forms the cellulose building blocks of trees and flora.',
        keyPoints: [
          'Plants store excess energy as starch granules.',
          'Forests act as global carbon sinks regulating Earth\'s atmosphere.'
        ]
      }
    ]
  }
];

export const MOCK_ACTIVITIES: Activity[] = [
  {
    id: 'act-1',
    title: 'Planetary Orbit Simulation',
    subject: 'Science',
    duration: 8,
    engagement: 95,
    type: 'interactive'
  },
  {
    id: 'act-2',
    title: 'Inner Rocky Planets Exploration',
    subject: 'Science',
    duration: 7,
    engagement: 89,
    type: 'reading'
  },
  {
    id: 'act-3',
    title: 'The Asteroid Belt Quick Video',
    subject: 'Science',
    duration: 5,
    engagement: 92,
    type: 'video'
  },
  {
    id: 'act-4',
    title: 'Adaptive Planet Identification Quiz',
    subject: 'Science',
    duration: 6,
    engagement: 94,
    type: 'quiz'
  },
  {
    id: 'act-5',
    title: 'Gas Giants Deep Soundscape',
    subject: 'Science',
    duration: 10,
    engagement: 74,
    type: 'video'
  },
  {
    id: 'act-6',
    title: 'Moons of Jupiter & Saturn Article',
    subject: 'Science',
    duration: 12,
    engagement: 68,
    type: 'reading'
  },
  {
    id: 'act-7',
    title: 'Kuiper Belt & Dwarf Planets Study',
    subject: 'Science',
    duration: 15,
    engagement: 62,
    type: 'reading'
  }
];

export const MOCK_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    lessonId: 'lesson-solar-system',
    topic: 'Solar System & Planetary Orbits',
    difficulty: 'easy',
    question: 'What central body sits at the very center of our solar system?',
    options: ['The Sun', 'Earth', 'Jupiter', 'The Milky Way Core'],
    correctIndex: 0,
    explanation: 'The Sun is the yellow dwarf star at the center, providing light and gravity to keep all eight planets in stable orbits.'
  },
  {
    id: 'q2',
    lessonId: 'lesson-solar-system',
    topic: 'Solar System & Planetary Orbits',
    difficulty: 'medium',
    question: 'Which planet is known as the Red Planet?',
    options: ['Earth', 'Mars', 'Jupiter', 'Venus'],
    correctIndex: 1,
    explanation: 'Mars appears reddish-orange because its surface minerals are rich in iron oxide (rust).'
  },
  {
    id: 'q3',
    lessonId: 'lesson-solar-system',
    topic: 'Solar System & Planetary Orbits',
    difficulty: 'medium',
    question: 'Which is the largest planet in our entire solar system?',
    options: ['Saturn', 'Jupiter', 'Neptune', 'Uranus'],
    correctIndex: 1,
    explanation: 'Jupiter is more than twice as massive as all the other planets in the solar system combined.'
  },
  {
    id: 'q4',
    lessonId: 'lesson-solar-system',
    topic: 'Solar System & Planetary Orbits',
    difficulty: 'hard',
    question: 'What region separates the inner rocky planets from the outer gas giants?',
    options: ['The Oort Cloud', 'The Asteroid Belt', 'The Kuiper Belt', 'The Heliosphere'],
    correctIndex: 1,
    explanation: 'The main Asteroid Belt is located roughly between the orbits of Mars and Jupiter.'
  },
  {
    id: 'q5',
    lessonId: 'lesson-solar-system',
    topic: 'Solar System & Planetary Orbits',
    difficulty: 'easy',
    question: 'Which planet is closest to the Sun?',
    options: ['Venus', 'Mercury', 'Earth', 'Mars'],
    correctIndex: 1,
    explanation: 'Mercury is the closest planet to the Sun and completes an orbit in just 88 Earth days.'
  },
  {
    id: 'q6',
    lessonId: 'lesson-plant-biology',
    topic: 'Photosynthesis & Plant Cell Architecture',
    difficulty: 'easy',
    question: 'What green pigment in plant cells captures sunlight for photosynthesis?',
    options: ['Chlorophyll', 'Hemoglobin', 'Melanin', 'Anthocyanin'],
    correctIndex: 0,
    explanation: 'Chlorophyll molecules inside chloroplasts absorb light photons to power chemical reactions.'
  },
  {
    id: 'q7',
    lessonId: 'lesson-plant-biology',
    topic: 'Photosynthesis & Plant Cell Architecture',
    difficulty: 'medium',
    question: 'What gas do plants take in through leaf stomata to produce glucose?',
    options: ['Carbon Dioxide (CO2)', 'Helium', 'Nitrogen', 'Methane'],
    correctIndex: 0,
    explanation: 'Plants absorb carbon dioxide from the surrounding air through tiny pores called stomata.'
  },
  {
    id: 'q8',
    lessonId: 'lesson-plant-biology',
    topic: 'Photosynthesis & Plant Cell Architecture',
    difficulty: 'medium',
    question: 'What vital gas is released as a byproduct of splitting water during photosynthesis?',
    options: ['Oxygen (O2)', 'Carbon Monoxide', 'Hydrogen Sulfide', 'Ozone'],
    correctIndex: 0,
    explanation: 'When sunlight energizes chloroplasts to split H2O molecules, oxygen gas is released into the atmosphere.'
  }
];

// Dynamic 7-Day Rolling Historical Telemetry Generator
export const generateDefault7DayHistory = () => {
  const now = Date.now();
  const dayMs = 86400000;

  const quizAttempts: QuizAttempt[] = [
    // Day -6
    {
      id: 'qa-hist-6a',
      studentId: 'student-leo-01',
      lessonId: 'lesson-solar-system',
      scorePercent: 80,
      correctCount: 4,
      totalQuestions: 5,
      timestamp: new Date(now - 6 * dayMs + 3600000 * 2).toISOString(),
      difficulty: 'medium'
    },
    {
      id: 'qa-hist-6b',
      studentId: 'student-maya-02',
      lessonId: 'lesson-plant-biology',
      scorePercent: 100,
      correctCount: 5,
      totalQuestions: 5,
      timestamp: new Date(now - 6 * dayMs + 3600000 * 4).toISOString(),
      difficulty: 'easy'
    },
    // Day -5
    {
      id: 'qa-hist-5a',
      studentId: 'student-sam-03',
      lessonId: 'lesson-solar-system',
      scorePercent: 80,
      correctCount: 4,
      totalQuestions: 5,
      timestamp: new Date(now - 5 * dayMs + 3600000 * 3).toISOString(),
      difficulty: 'medium'
    },
    // Day -4
    {
      id: 'qa-hist-4a',
      studentId: 'student-maya-02',
      lessonId: 'lesson-solar-system',
      scorePercent: 100,
      correctCount: 5,
      totalQuestions: 5,
      timestamp: new Date(now - 4 * dayMs + 3600000 * 2).toISOString(),
      difficulty: 'medium'
    },
    // Day -3
    {
      id: 'qa-hist-3a',
      studentId: 'student-leo-01',
      lessonId: 'lesson-plant-biology',
      scorePercent: 80,
      correctCount: 4,
      totalQuestions: 5,
      timestamp: new Date(now - 3 * dayMs + 3600000 * 3).toISOString(),
      difficulty: 'medium'
    },
    // Day -2
    {
      id: 'qa-hist-2a',
      studentId: 'student-leo-01',
      lessonId: 'lesson-solar-system',
      scorePercent: 100,
      correctCount: 5,
      totalQuestions: 5,
      timestamp: new Date(now - 2 * dayMs + 3600000 * 1).toISOString(),
      difficulty: 'hard'
    },
    {
      id: 'qa-hist-2b',
      studentId: 'student-sam-03',
      lessonId: 'lesson-plant-biology',
      scorePercent: 80,
      correctCount: 4,
      totalQuestions: 5,
      timestamp: new Date(now - 2 * dayMs + 3600000 * 5).toISOString(),
      difficulty: 'medium'
    },
    // Day -1 (Yesterday)
    {
      id: 'qa-hist-1a',
      studentId: 'student-maya-02',
      lessonId: 'lesson-solar-system',
      scorePercent: 100,
      correctCount: 5,
      totalQuestions: 5,
      timestamp: new Date(now - 1 * dayMs + 3600000 * 4).toISOString(),
      difficulty: 'medium'
    },
    // Today
    {
      id: 'qa-hist-0a',
      studentId: 'student-leo-01',
      lessonId: 'lesson-solar-system',
      scorePercent: 100,
      correctCount: 5,
      totalQuestions: 5,
      timestamp: new Date(now - 3600000 * 2).toISOString(),
      difficulty: 'medium'
    }
  ];

  const focusLogs: FocusSessionLog[] = [
    // Day -6
    {
      id: 'fl-hist-6a',
      studentId: 'student-leo-01',
      focusScore: 78,
      fuzzyState: 'Good focus',
      timestamp: new Date(now - 6 * dayMs + 3600000 * 2).toISOString(),
      note: 'Engaged with visual solar model'
    },
    {
      id: 'fl-hist-6b',
      studentId: 'student-maya-02',
      focusScore: 88,
      fuzzyState: 'Optimal focus',
      timestamp: new Date(now - 6 * dayMs + 3600000 * 4).toISOString(),
      note: 'Deep immersion in plant biology'
    },
    // Day -5
    {
      id: 'fl-hist-5a',
      studentId: 'student-sam-03',
      focusScore: 72,
      fuzzyState: 'Good focus',
      timestamp: new Date(now - 5 * dayMs + 3600000 * 3).toISOString(),
      note: 'High auditory attention with speech aid'
    },
    {
      id: 'fl-hist-5b',
      studentId: 'student-leo-01',
      focusScore: 82,
      fuzzyState: 'Optimal focus',
      timestamp: new Date(now - 5 * dayMs + 3600000 * 5).toISOString(),
      note: 'Calm reading session with sepia palette'
    },
    // Day -4
    {
      id: 'fl-hist-4a',
      studentId: 'student-maya-02',
      focusScore: 92,
      fuzzyState: 'Optimal focus',
      timestamp: new Date(now - 4 * dayMs + 3600000 * 2).toISOString(),
      note: 'Multi-modal diagram completion'
    },
    {
      id: 'fl-hist-4b',
      studentId: 'student-sam-03',
      focusScore: 66,
      fuzzyState: 'Steady attention',
      timestamp: new Date(now - 4 * dayMs + 3600000 * 4).toISOString(),
      note: 'Sensory accommodation activated'
    },
    // Day -3
    {
      id: 'fl-hist-3a',
      studentId: 'student-leo-01',
      focusScore: 85,
      fuzzyState: 'Optimal focus',
      timestamp: new Date(now - 3 * dayMs + 3600000 * 3).toISOString(),
      note: 'Adaptive pacing enabled'
    },
    {
      id: 'fl-hist-3b',
      studentId: 'student-maya-02',
      focusScore: 80,
      fuzzyState: 'Good focus',
      timestamp: new Date(now - 3 * dayMs + 3600000 * 6).toISOString(),
      note: 'Steady visual focus'
    },
    // Day -2
    {
      id: 'fl-hist-2a',
      studentId: 'student-leo-01',
      focusScore: 86,
      fuzzyState: 'Optimal focus',
      timestamp: new Date(now - 2 * dayMs + 3600000 * 1).toISOString(),
      note: 'Spoken submission preparation'
    },
    {
      id: 'fl-hist-2b',
      studentId: 'student-sam-03',
      focusScore: 70,
      fuzzyState: 'Good focus',
      timestamp: new Date(now - 2 * dayMs + 3600000 * 5).toISOString(),
      note: 'Low glare mode active'
    },
    // Day -1 (Yesterday)
    {
      id: 'fl-hist-1a',
      studentId: 'student-maya-02',
      focusScore: 85,
      fuzzyState: 'Optimal focus',
      timestamp: new Date(now - 1 * dayMs + 3600000 * 4).toISOString(),
      note: 'Video demonstration recorded'
    },
    {
      id: 'fl-hist-1b',
      studentId: 'student-sam-03',
      focusScore: 74,
      fuzzyState: 'Good focus',
      timestamp: new Date(now - 1 * dayMs + 3600000 * 6).toISOString(),
      note: 'High comprehension on science review'
    },
    // Today
    {
      id: 'fl-hist-0a',
      studentId: 'student-leo-01',
      focusScore: 84,
      fuzzyState: 'Optimal focus',
      timestamp: new Date(now - 3600000 * 2).toISOString(),
      note: 'Live active learning session'
    },
    {
      id: 'fl-hist-0b',
      studentId: 'student-maya-02',
      focusScore: 78,
      fuzzyState: 'Good focus',
      timestamp: new Date(now - 3600000 * 3).toISOString(),
      note: 'Active feedback review'
    },
    {
      id: 'fl-hist-0c',
      studentId: 'student-sam-03',
      focusScore: 68,
      fuzzyState: 'Steady attention',
      timestamp: new Date(now - 3600000 * 1).toISOString(),
      note: 'Voice assignment completed'
    }
  ];

  const completedLessons: CompletedLessonRecord[] = [
    {
      id: 'cl-hist-6a',
      lessonId: 'lesson-solar-system',
      studentId: 'student-leo-01',
      completedAt: new Date(now - 6 * dayMs + 3600000 * 2).toISOString(),
      durationMinutes: 18
    },
    {
      id: 'cl-hist-6b',
      lessonId: 'lesson-plant-biology',
      studentId: 'student-maya-02',
      completedAt: new Date(now - 6 * dayMs + 3600000 * 4).toISOString(),
      durationMinutes: 15
    },
    {
      id: 'cl-hist-5a',
      lessonId: 'lesson-solar-system',
      studentId: 'student-sam-03',
      completedAt: new Date(now - 5 * dayMs + 3600000 * 3).toISOString(),
      durationMinutes: 16
    },
    {
      id: 'cl-hist-4a',
      lessonId: 'lesson-plant-biology',
      studentId: 'student-sam-03',
      completedAt: new Date(now - 4 * dayMs + 3600000 * 4).toISOString(),
      durationMinutes: 14
    },
    {
      id: 'cl-hist-3a',
      lessonId: 'lesson-plant-biology',
      studentId: 'student-leo-01',
      completedAt: new Date(now - 3 * dayMs + 3600000 * 3).toISOString(),
      durationMinutes: 15
    },
    {
      id: 'cl-hist-1a',
      lessonId: 'lesson-solar-system',
      studentId: 'student-maya-02',
      completedAt: new Date(now - 1 * dayMs + 3600000 * 4).toISOString(),
      durationMinutes: 18
    }
  ];

  return { quizAttempts, focusLogs, completedLessons };
};

const defaultHistory = generateDefault7DayHistory();
export const DEFAULT_QUIZ_ATTEMPTS: QuizAttempt[] = defaultHistory.quizAttempts;
export const DEFAULT_FOCUS_LOGS: FocusSessionLog[] = defaultHistory.focusLogs;
export const DEFAULT_COMPLETED_LESSONS: CompletedLessonRecord[] = defaultHistory.completedLessons;

// Dynamic 7-day rolling engagement window
export const CLASS_ENGAGEMENT_DATA = [6, 5, 4, 3, 2, 1, 0].map((daysAgo) => {
  const d = new Date(Date.now() - daysAgo * 86400000);
  const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const dayLogs = DEFAULT_FOCUS_LOGS.filter((l) =>
    l.timestamp.startsWith(d.toISOString().slice(0, 10))
  );
  const avgFocus =
    dayLogs.length > 0
      ? Math.round(dayLogs.reduce((acc, l) => acc + l.focusScore, 0) / dayLogs.length)
      : 75;
  return {
    date: dateStr,
    engagement: Math.min(95, avgFocus + 2),
    focus: avgFocus,
    attendance: daysAgo === 0 ? 3 : (daysAgo % 2 === 0 ? 3 : 2)
  };
});

export const DEFAULT_SUBMISSIONS: StudentSubmission[] = [
  {
    id: 'sub-sample-leo-voice',
    studentId: 'student-leo-01',
    studentName: 'Leo Rivera',
    studentDiagnoses: ['ADHD', 'Sensory Sensitivity'],
    lessonId: 'lesson-solar-system',
    lessonTitle: 'The Solar System & Cosmic Neighborhood',
    mode: 'audio',
    audioDurationSec: 42,
    audioTranscript:
      'Hi Ms. Priya! Here is my voice assignment on planetary habitability and magnetic shielding. I think the key reason an exoplanet like TRAPPIST-1e could have liquid oceans is that its density is almost identical to Earth\'s iron-rich core, which creates a protective magnetosphere against intense radiation flares. Even though it orbits very close, the magnetic field deflects charged stellar particles away.',
    submittedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    teacherFeedback: {
      teacherName: 'Ms. Priya (Special Educator)',
      suggestion:
        'Brilliant verbal reasoning, Leo! Your connection between core density and protective magnetic deflection was spot-on. Next suggestion: try comparing TRAPPIST-1e with Venus to explain why runaway greenhouse vapor didn\'t strip its oceans away.',
      strengths:
        'Outstanding spoken clarity, rich scientific vocabulary, and confident verbal synthesis without cognitive fatigue.',
      recommendedAccommodations: [
        'Voice Recording Format Approved',
        'Mind Map Visual Anchors',
        'Reduced Text Density'
      ],
      status: 'reviewed',
      reviewedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      score: 95
    }
  },
  {
    id: 'sub-sample-maya-video',
    studentId: 'student-maya-02',
    studentName: 'Maya Lin',
    studentDiagnoses: ['Dyslexia', 'Auditory Processing'],
    lessonId: 'lesson-solar-system',
    lessonTitle: 'The Solar System & Cosmic Neighborhood',
    mode: 'video',
    videoFileName: 'Maya_Solar_System_Walkthrough.webm',
    videoKeyPoints: [
      '0:12 - Inner rocky planet composition & density',
      '0:48 - The asteroid belt as a natural planetary divide',
      '1:20 - Saturn\'s icy ringlet dynamics and water ice reflection'
    ],
    submittedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    teacherFeedback: {
      teacherName: 'Ms. Priya (Special Educator)',
      suggestion:
        'Exceptional video walkthrough, Maya! Using hand-drawn physical props and pointing to the scale models while explaining the ring particles made your explanation vivid and easy to follow. As a suggestion: feel free to pause for 5 seconds between sections so your working memory stays relaxed.',
      strengths:
        'Superb visual pacing, multi-sensory diagramming, and enthusiastic delivery.',
      recommendedAccommodations: [
        'Video Walkthrough Presentation',
        'Visual Graphic Organizers',
        'Extended Processing Time'
      ],
      status: 'reviewed',
      reviewedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      score: 98
    }
  },
  {
    id: 'sub-sample-sam-voice',
    studentId: 'student-sam-03',
    studentName: 'Sam Thorne',
    studentDiagnoses: ['Autism Spectrum', 'Light Sensitivity'],
    lessonId: 'lesson-solar-system',
    lessonTitle: 'The Solar System & Cosmic Neighborhood',
    mode: 'audio',
    audioDurationSec: 36,
    audioTranscript:
      'Hello Ms. Priya, this is Sam recording my voice response. The Goldilocks habitable zone for TRAPPIST-1e is much closer in than Earth is to the Sun because the red dwarf star is cooler and less luminous. Because of this tight orbit, tidal locking could occur, meaning one side always faces the star while the other faces deep space, requiring atmospheric winds to distribute warmth evenly.',
    submittedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    teacherFeedback: {
      teacherName: '',
      suggestion: '',
      status: 'pending',
      reviewedAt: ''
    }
  }
];
