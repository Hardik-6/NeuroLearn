/**
 * ============================================================================
 * NEUROLEARN: ADAPTIVE NEURO-GAMIFICATION ENGINE
 * ============================================================================
 * 
 * Specialized gamification and pedagogical orchestration engine designed for
 * neurodivergent learners (ADHD, Autism Spectrum, Dyslexia).
 * 
 * CORE PHILOSOPHIES:
 * 1. Zero Extrinsic Pressure: NO countdown timers, NO competitive leaderboards,
 *    NO streak punishment or guilt-inducing notifications.
 * 2. Learning-First Grounding: Anti-gaming explanation verification blocks
 *    brute-force guessing; rewards are tied strictly to authentic conceptual grasp.
 * 3. Sensory-Friendly Calm Sanctuaries: Rewards take the form of restorative
 *    micro-biomes (bioluminescent flora, celestial constellations, tidal stones)
 *    rather than flashing sirens, abrasive sound effects, or dopamine traps.
 * 4. ANFIS Soft-Computing Pacing: First-order Sugeno neuro-fuzzy inference for
 *    smooth, stress-free difficulty tuning.
 * 5. DAG Knowledge Graph: Skill tree scaffolding preventing cognitive overwhelm.
 * 6. Fuzzy Spaced Repetition (Neuro-SRS): Flexible, guilt-free memory consolidation.
 */

// ============================================================================
// 1. DATA STRUCTURES & INTERFACES
// ============================================================================

export type NeurodivergentProfile = 'ADHD' | 'Autism' | 'Dyslexia' | 'Combined' | 'Neurotypical-Support';

export type CognitiveFatigueLevel = 'Fresh' | 'Engaged' | 'Strained' | 'Exhausted';

export type ExplanationVerificationStatus = 'Authentic_Deep' | 'Authentic_Basic' | 'Superficial' | 'Gaming_Suspected';

export interface ConceptNode {
  id: string;
  code: string;
  title: string;
  category: 'Astrophysics' | 'Biology' | 'Mathematics' | 'ExecutiveFunction' | 'Language';
  description: string;
  tier: number; // 1 = Foundation, 2 = Intermediate, 3 = Synthesis, 4 = Mastery
  prerequisites: string[]; // IDs of prerequisite concept nodes
  requiredMasteryScore: number; // 0.0 - 1.0 (typically 0.75)
  keyVocabulary: string[]; // Essential concept semantic anchors
  corePrinciples: string[]; // Essential reasoning chains
  unlocked: boolean;
  masteryLevel: number; // 0.0 - 1.0
  consecutiveDeepExplanations: number;
  lastReviewedTimestamp?: string;
  optimalReviewWindowStart?: string;
  optimalReviewWindowEnd?: string;
}

export interface ExplanationSubmission {
  studentId: string;
  conceptId: string;
  questionId: string;
  selectedAnswer: string;
  isCorrectOption: boolean;
  explanationText: string;
  submissionModality: 'typed' | 'voice_transcript' | 'concept_node_linking';
  timeSpentSeconds: number;
}

export interface ExplanationEvaluationResult {
  status: ExplanationVerificationStatus;
  understandingScore: number; // 0.0 - 1.0
  semanticKeywordCoverage: number; // 0.0 - 1.0
  depthAnalysis: {
    sentenceComplexity: number;
    reasoningChainPresent: boolean;
    verbatimQuestionCopyDetected: boolean;
    randomPatternDetected: boolean;
    vocabularyMatches: string[];
  };
  feedback: {
    gentleAffirmation: string;
    guidingPrompt?: string;
  };
  canUnlockReward: boolean;
}

export interface SanctuaryElement {
  id: string;
  name: string;
  type: 'luminescent_moss' | 'celestial_star' | 'river_pebble' | 'whispering_tree' | 'gentle_aurora';
  narrativeDescription: string;
  sensoryTheme: 'warm_sepia' | 'deep_twilight' | 'forest_calm' | 'coastal_breeze';
  unlockedAt: string;
  conceptSourceTitle: string;
}

export interface StudentSanctuaryState {
  studentId: string;
  totalUnderstandingVerifications: number;
  compassionateRestDaysTaken: number;
  activeSanctuaryElements: SanctuaryElement[];
  currentFloraVitality: number; // 0.0 - 1.0 (calm growth meter, never decays punitive)
}

// ============================================================================
// 2. ANTI-GAMING EXPLANATION VERIFICATION ENGINE
// ============================================================================

export class ExplanationVerificationEngine {
  /**
   * Evaluates student explanations to verify authentic understanding before
   * granting mastery or rewards. Blocks spam, gibberish, copy-paste, and guessing.
   */
  public static verifyExplanation(
    submission: ExplanationSubmission,
    concept: ConceptNode,
    questionPrompt: string
  ): ExplanationEvaluationResult {
    const rawText = submission.explanationText.trim();
    const cleanLower = rawText.toLowerCase();
    const promptLower = questionPrompt.toLowerCase();

    // 1. Anti-Cheat Check: Minimum character threshold
    if (cleanLower.length < 12) {
      return {
        status: 'Gaming_Suspected',
        understandingScore: 0.1,
        semanticKeywordCoverage: 0,
        depthAnalysis: {
          sentenceComplexity: 0.1,
          reasoningChainPresent: false,
          verbatimQuestionCopyDetected: false,
          randomPatternDetected: false,
          vocabularyMatches: []
        },
        feedback: {
          gentleAffirmation: 'You are on the right track!',
          guidingPrompt: 'Can you share one reason why this happens in your own words?'
        },
        canUnlockReward: false
      };
    }

    // 2. Anti-Cheat Check: Keyboard mashing / gibberish detection
    // High consonant density or low vowel ratio check
    const vowels = cleanLower.match(/[aeiou]/g) || [];
    const consonants = cleanLower.match(/[bcdfghjklmnpqrstvwxyz]/g) || [];
    const vowelRatio = vowels.length / Math.max(1, vowels.length + consonants.length);
    const repeatedCharPattern = /(.)\1{4,}/; // e.g. "aaaaaa" or "asdfasdf"

    if (vowelRatio < 0.15 || vowelRatio > 0.85 || repeatedCharPattern.test(cleanLower)) {
      return {
        status: 'Gaming_Suspected',
        understandingScore: 0.05,
        semanticKeywordCoverage: 0,
        depthAnalysis: {
          sentenceComplexity: 0,
          reasoningChainPresent: false,
          verbatimQuestionCopyDetected: false,
          randomPatternDetected: true,
          vocabularyMatches: []
        },
        feedback: {
          gentleAffirmation: 'Take your time — there is no rush.',
          guidingPrompt: 'Take a gentle breath and try describing what makes this idea true.'
        },
        canUnlockReward: false
      };
    }

    // 3. Anti-Cheat Check: Verbatim Question Echo
    // If student simply copied the question text without adding reasoning
    const promptWords = new Set(promptLower.split(/\W+/).filter(w => w.length > 3));
    const explanationWords = cleanLower.split(/\W+/).filter(w => w.length > 3);
    const overlappingPromptWords = explanationWords.filter(w => promptWords.has(w));
    const overlapRatio = overlappingPromptWords.length / Math.max(1, explanationWords.length);

    const isVerbatimEcho = overlapRatio > 0.85 && explanationWords.length <= promptWords.size + 2;
    if (isVerbatimEcho) {
      return {
        status: 'Superficial',
        understandingScore: 0.25,
        semanticKeywordCoverage: 0.1,
        depthAnalysis: {
          sentenceComplexity: 0.2,
          reasoningChainPresent: false,
          verbatimQuestionCopyDetected: true,
          randomPatternDetected: false,
          vocabularyMatches: []
        },
        feedback: {
          gentleAffirmation: 'You restated the question clearly!',
          guidingPrompt: 'Now, why do you think this occurs? What causes it?'
        },
        canUnlockReward: false
      };
    }

    // 4. Semantic Anchor / Conceptual Vocabulary Analysis
    const matchedVocab: string[] = [];
    concept.keyVocabulary.forEach(vocab => {
      const vocabWord = vocab.toLowerCase();
      if (cleanLower.includes(vocabWord)) {
        matchedVocab.push(vocab);
      }
    });
    const vocabCoverage = matchedVocab.length / Math.max(1, Math.min(3, concept.keyVocabulary.length));

    // 5. Reasoning Chain Connective Analysis (Because, therefore, causes, leads to, so)
    const causalConnectives = ['because', 'therefore', 'causes', 'since', 'means that', 'leads to', 'due to', 'results in', 'which makes'];
    const reasoningChainPresent = causalConnectives.some(conn => cleanLower.includes(conn));

    // 6. Sentence Complexity & Coherence Estimate
    const wordCount = explanationWords.length;
    const sentenceComplexity = Math.min(1.0, (wordCount / 18) * (reasoningChainPresent ? 1.2 : 0.8));

    // Synthesize understanding score
    let understanding = (vocabCoverage * 0.45) + (sentenceComplexity * 0.35) + (submission.isCorrectOption ? 0.20 : 0.0);
    understanding = Math.min(1.0, Math.max(0.0, understanding));

    let status: ExplanationVerificationStatus = 'Superficial';
    if (understanding >= 0.70 && reasoningChainPresent) {
      status = 'Authentic_Deep';
    } else if (understanding >= 0.45) {
      status = 'Authentic_Basic';
    }

    const canUnlockReward = (status === 'Authentic_Deep' || status === 'Authentic_Basic') && submission.isCorrectOption;

    return {
      status,
      understandingScore: Number(understanding.toFixed(3)),
      semanticKeywordCoverage: Number(vocabCoverage.toFixed(3)),
      depthAnalysis: {
        sentenceComplexity: Number(sentenceComplexity.toFixed(3)),
        reasoningChainPresent,
        verbatimQuestionCopyDetected: false,
        randomPatternDetected: false,
        vocabularyMatches: matchedVocab
      },
      feedback: {
        gentleAffirmation: canUnlockReward
          ? `Wonderful insight! You thoughtfully applied ${matchedVocab.slice(0, 2).join(' and ') || 'the core concept'}.`
          : 'Thank you for sharing your thoughts. Let’s look a little deeper at how this works together.',
        guidingPrompt: canUnlockReward
          ? undefined
          : 'Can you connect this with what you learned about ' + (concept.keyVocabulary[0] || 'the core principle') + '?'
      },
      canUnlockReward
    };
  }
}

// ============================================================================
// 3. ANFIS ADAPTIVE DIFFICULTY CONTROLLER
// ============================================================================

export interface ANFISInputState {
  focusScore: number; // 0 - 100
  timeOnTaskMinutes: number; // continuous minutes
  understandingDepth: number; // 0.0 - 1.0 from explanation engine
  historicalAccuracy: number; // 0.0 - 1.0
}

export interface ANFISDifficultyOutput {
  crispDifficultyScore: number; // 1.0 (gentle scaffolding) to 3.0 (synthesis challenge)
  linguisticDifficulty: 'Gentle Scaffolding' | 'Balanced Exploratory' | 'Deep Synthesis';
  sensoryRestAdvised: boolean;
  recommendedModality: 'visual_schematic' | 'chunked_text' | 'interactive_kinesthetic';
  scaffoldingSupports: string[];
}

export class ANFISDifficultyEngine {
  /**
   * First-Order Sugeno Neuro-Fuzzy Inference System.
   * Modulates cognitive load without causing learner frustration or under-stimulation.
   */
  public static computeAdaptivePacing(input: ANFISInputState): ANFISDifficultyOutput {
    // 1. Fuzzification: Membership functions (Gaussian and Sigmoidal)
    const muFocusLow = this.gaussianMF(input.focusScore, 25, 18);
    const muFocusMed = this.gaussianMF(input.focusScore, 60, 15);
    const muFocusHigh = this.gaussianMF(input.focusScore, 90, 15);

    const muFatigueFresh = this.sigmoidMF(input.timeOnTaskMinutes, -0.3, 15);
    const muFatigueStrained = this.gaussianMF(input.timeOnTaskMinutes, 25, 8);
    const muFatigueExhausted = this.sigmoidMF(input.timeOnTaskMinutes, 0.4, 30);

    const muDepthSuperficial = 1 - input.understandingDepth;
    const muDepthDeep = input.understandingDepth;

    // 2. Fuzzy Rule Base (Sugeno T-Norm Evaluation via Product)
    // Rule 1: IF Focus is Low OR Fatigue is Exhausted THEN Difficulty = 1.0 (Gentle Scaffolding)
    const w1 = Math.max(muFocusLow, muFatigueExhausted);
    const z1 = 1.0;

    // Rule 2: IF Focus is High AND Fatigue is Fresh AND Depth is Deep THEN Difficulty = 3.0 (Deep Synthesis)
    const w2 = muFocusHigh * muFatigueFresh * muDepthDeep;
    const z2 = 2.0 + (input.understandingDepth * 0.8) + (input.historicalAccuracy * 0.2);

    // Rule 3: IF Focus is Medium AND Fatigue is Strained THEN Difficulty = 1.5 (Balanced with Micro-Breaks)
    const w3 = muFocusMed * muFatigueStrained;
    const z3 = 1.5;

    // Rule 4: IF Depth is Superficial THEN Scaffolding = 1.2
    const w4 = muDepthSuperficial * 0.8;
    const z4 = 1.2;

    // Rule 5: Default Moderate rule
    const w5 = muFocusMed * muFatigueFresh;
    const z5 = 2.0;

    // 3. Defuzzification (Sugeno Weighted Average Centroid)
    const totalWeights = w1 + w2 + w3 + w4 + w5;
    const crispScore = totalWeights > 0
      ? (w1 * z1 + w2 * z2 + w3 * z3 + w4 * z4 + w5 * z5) / totalWeights
      : 2.0;

    const clampedDifficulty = Math.min(3.0, Math.max(1.0, crispScore));

    let linguisticDifficulty: 'Gentle Scaffolding' | 'Balanced Exploratory' | 'Deep Synthesis' = 'Balanced Exploratory';
    if (clampedDifficulty <= 1.4) linguisticDifficulty = 'Gentle Scaffolding';
    else if (clampedDifficulty >= 2.4) linguisticDifficulty = 'Deep Synthesis';

    const sensoryRestAdvised = input.timeOnTaskMinutes > 22 || input.focusScore < 38;

    const scaffoldingSupports: string[] = [];
    if (clampedDifficulty < 1.8) {
      scaffoldingSupports.push('Sentence starter frames for written explanations');
      scaffoldingSupports.push('Visual anchor diagram highlighting cause-and-effect');
    }
    if (sensoryRestAdvised) {
      scaffoldingSupports.push('Optional 2-minute restorative deep-breathing pause');
    }

    return {
      crispDifficultyScore: Number(clampedDifficulty.toFixed(2)),
      linguisticDifficulty,
      sensoryRestAdvised,
      recommendedModality: input.focusScore < 50 ? 'visual_schematic' : 'chunked_text',
      scaffoldingSupports
    };
  }

  private static gaussianMF(x: number, c: number, sigma: number): number {
    return Math.exp(-0.5 * Math.pow((x - c) / Math.max(0.001, sigma), 2));
  }

  private static sigmoidMF(x: number, k: number, x0: number): number {
    return 1 / (1 + Math.exp(-k * (x - x0)));
  }
}

// ============================================================================
// 4. KNOWLEDGE GRAPH & CONCEPT UNLOCKING SYSTEM
// ============================================================================

export class SkillTreeKnowledgeGraph {
  private nodes: Map<string, ConceptNode> = new Map();

  constructor(initialNodes: ConceptNode[]) {
    initialNodes.forEach(node => this.nodes.set(node.id, { ...node }));
    this.refreshUnlockStatuses();
  }

  public getNode(id: string): ConceptNode | undefined {
    return this.nodes.get(id);
  }

  public getAllNodes(): ConceptNode[] {
    return Array.from(this.nodes.values());
  }

  /**
   * Concept unlocking rule:
   * A child node unlocks ONLY when ALL prerequisite nodes have achieved:
   * 1. Mastery Level >= requiredMasteryScore (typically 0.75)
   * 2. At least 1 verified authentic explanation in the parent node
   */
  public refreshUnlockStatuses(): void {
    this.nodes.forEach(node => {
      if (node.prerequisites.length === 0) {
        node.unlocked = true;
        return;
      }

      const allPrereqsSatisfied = node.prerequisites.every(prereqId => {
        const prereqNode = this.nodes.get(prereqId);
        if (!prereqNode) return false;
        return (
          prereqNode.masteryLevel >= prereqNode.requiredMasteryScore &&
          prereqNode.consecutiveDeepExplanations >= 1
        );
      });

      node.unlocked = allPrereqsSatisfied;
    });
  }

  /**
   * Records verified mastery progress and recursively refreshes frontier
   */
  public recordMasteryUpdate(
    nodeId: string,
    verifiedUnderstandingScore: number,
    isAuthenticExplanation: boolean
  ): { newlyUnlockedNodes: ConceptNode[]; nodeUpdated: ConceptNode | null } {
    const node = this.nodes.get(nodeId);
    if (!node) return { newlyUnlockedNodes: [], nodeUpdated: null };

    // Exponential moving average for mastery
    node.masteryLevel = Number(
      (node.masteryLevel * 0.6 + verifiedUnderstandingScore * 0.4).toFixed(3)
    );

    if (isAuthenticExplanation) {
      node.consecutiveDeepExplanations += 1;
    } else {
      node.consecutiveDeepExplanations = Math.max(0, node.consecutiveDeepExplanations - 1);
    }

    const previousLocked = new Set<string>();
    this.nodes.forEach(n => {
      if (!n.unlocked) previousLocked.add(n.id);
    });

    this.refreshUnlockStatuses();

    const newlyUnlocked: ConceptNode[] = [];
    previousLocked.forEach(id => {
      const refreshed = this.nodes.get(id);
      if (refreshed && refreshed.unlocked) {
        newlyUnlocked.push(refreshed);
      }
    });

    return { newlyUnlockedNodes: newlyUnlocked, nodeUpdated: node };
  }

  /**
   * Provides non-overwhelming cognitive scope:
   * For ADHD/Autistic students, never display 20 sprawling nodes at once.
   * Returns max 3 "Current Focus Frontier" concepts to prevent decision paralysis.
   */
  public getFocusedFrontier(maxRecommendations: number = 3): ConceptNode[] {
    const unlockedUnmastered = Array.from(this.nodes.values()).filter(
      n => n.unlocked && n.masteryLevel < n.requiredMasteryScore
    );

    // Sort by lowest tier first, then by closest to completion
    unlockedUnmastered.sort((a, b) => {
      if (a.tier !== b.tier) return a.tier - b.tier;
      return b.masteryLevel - a.masteryLevel;
    });

    return unlockedUnmastered.slice(0, maxRecommendations);
  }
}

// ============================================================================
// 5. FUZZY SPACED REPETITION SYSTEM (NEURO-SRS)
// ============================================================================

export interface SRSReviewResult {
  nextReviewDate: string;
  recommendedIntervalDays: number;
  retentionStability: number;
  gentleReviewWindow: {
    opensOn: string;
    targetOn: string;
    friendlyGraceUntil: string;
  };
  explanationPrompt: string;
}

export class FuzzySpacedRepetitionEngine {
  /**
   * Neuro-affirming Spaced Repetition.
   * Traditional SuperMemo-2 (SM-2) penalizes learners for missing specific days,
   * triggering shame and avoidance loops.
   * Neuro-SRS uses fuzzy cognitive stability to provide wide, compassionate
   * "Gentle Review Windows" where students can refresh concepts whenever they feel ready.
   */
  public static calculateNextReview(
    concept: ConceptNode,
    lastVerificationScore: number, // 0.0 - 1.0
    studentFocusState: number // 0 - 100
  ): SRSReviewResult {
    // 1. Fuzzy Memory Stability Index (S)
    const baseStability = Math.max(0.2, concept.masteryLevel);
    const focusModifier = (studentFocusState / 100) * 0.3 + 0.85; // 0.85 to 1.15
    const explanationModifier = lastVerificationScore >= 0.7 ? 1.4 : 0.8;

    const fuzzyStability = Number((baseStability * focusModifier * explanationModifier).toFixed(2));

    // 2. Interval Calculation in days
    // Tier 1 (Foundation): 2 - 4 days
    // Tier 2 (Application): 5 - 10 days
    // Tier 3 (Synthesis): 12 - 24 days
    const tierMultiplier = concept.tier === 1 ? 3 : concept.tier === 2 ? 7 : 14;
    const intervalDays = Math.max(1, Math.round(tierMultiplier * fuzzyStability));

    const now = new Date();
    const targetDate = new Date(now.getTime() + intervalDays * 24 * 60 * 60 * 1000);

    // 3. Gentle Review Window (Opens early, has a wide grace period without penalty)
    const windowOpen = new Date(targetDate.getTime() - 1 * 24 * 60 * 60 * 1000);
    const friendlyGrace = new Date(targetDate.getTime() + 4 * 24 * 60 * 60 * 1000);

    const randomVocab = concept.keyVocabulary[0] || 'the core mechanism';
    const explanationPrompt = `Can you recall in one warm sentence how ${randomVocab} relates to ${concept.title}?`;

    return {
      nextReviewDate: targetDate.toISOString(),
      recommendedIntervalDays: intervalDays,
      retentionStability: fuzzyStability,
      gentleReviewWindow: {
        opensOn: windowOpen.toISOString(),
        targetOn: targetDate.toISOString(),
        friendlyGraceUntil: friendlyGrace.toISOString()
      },
      explanationPrompt
    };
  }
}

// ============================================================================
// 6. SANCTUARY & RESTORATIVE REWARDS ORCHESTRATOR
// ============================================================================

export class SanctuaryRewardsOrchestrator {
  private static BIOME_ELEMENTS: Omit<SanctuaryElement, 'id' | 'unlockedAt' | 'conceptSourceTitle'>[] = [
    {
      name: 'Glowing Amber Moss',
      type: 'luminescent_moss',
      narrativeDescription: 'A soft, bioluminescent moss that radiates calm golden light across your sanctuary floor.',
      sensoryTheme: 'warm_sepia'
    },
    {
      name: 'Pleiades Guide Star',
      type: 'celestial_star',
      narrativeDescription: 'A gentle silver star that pulses softly in the twilight sky, reflecting deep conceptual focus.',
      sensoryTheme: 'deep_twilight'
    },
    {
      name: 'Polished River Basalt',
      type: 'river_pebble',
      narrativeDescription: 'A smooth, grounding water stone nestled quietly beside a slow-moving mountain brook.',
      sensoryTheme: 'coastal_breeze'
    },
    {
      name: 'Ancient Whispering Redwood',
      type: 'whispering_tree',
      narrativeDescription: 'A majestic tree rooted in understanding, offering a tranquil sensory shelter.',
      sensoryTheme: 'forest_calm'
    },
    {
      name: 'Gentle Emerald Aurora',
      type: 'gentle_aurora',
      narrativeDescription: 'A peaceful, wave-like shimmer of emerald light that eases visual strain.',
      sensoryTheme: 'forest_calm'
    }
  ];

  /**
   * Awards a peaceful sanctuary asset ONLY when genuine understanding has been verified.
   */
  public static attemptAwardSanctuaryCultivation(
    evaluation: ExplanationEvaluationResult,
    concept: ConceptNode,
    currentState: StudentSanctuaryState
  ): { state: StudentSanctuaryState; newElement?: SanctuaryElement; reason: string } {
    if (!evaluation.canUnlockReward) {
      return {
        state: currentState,
        reason: 'Reward paused: explanation was either incomplete or required deeper conceptual reasoning.'
      };
    }

    // Select an element matching the student's sensory sanctuary
    const template = this.BIOME_ELEMENTS[
      currentState.activeSanctuaryElements.length % this.BIOME_ELEMENTS.length
    ];

    const newElement: SanctuaryElement = {
      ...template,
      id: `elem-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      unlockedAt: new Date().toISOString(),
      conceptSourceTitle: concept.title
    };

    const updatedState: StudentSanctuaryState = {
      ...currentState,
      totalUnderstandingVerifications: currentState.totalUnderstandingVerifications + 1,
      currentFloraVitality: Math.min(1.0, currentState.currentFloraVitality + 0.15),
      activeSanctuaryElements: [...currentState.activeSanctuaryElements, newElement]
    };

    return {
      state: updatedState,
      newElement,
      reason: `Verified understanding in "${concept.title}" nurtured your calm sanctuary!`
    };
  }
}

// ============================================================================
// 7. PRE-CONFIGURED CURRICULUM KNOWLEDGE GRAPH
// ============================================================================

export const DEFAULT_ASTROPHYSICS_SKILL_TREE: ConceptNode[] = [
  {
    id: 'node-gravity-foundation',
    code: 'ASTRO-101',
    title: 'Gravity & Planetary Mass',
    category: 'Astrophysics',
    description: 'How mass bends space and holds planets in steady, gentle orbital paths.',
    tier: 1,
    prerequisites: [],
    requiredMasteryScore: 0.70,
    keyVocabulary: ['mass', 'gravity', 'attraction', 'orbit'],
    corePrinciples: ['Greater mass creates stronger gravitational attraction', 'Distance decreases gravitational pull'],
    unlocked: true,
    masteryLevel: 0.82,
    consecutiveDeepExplanations: 2
  },
  {
    id: 'node-orbital-mechanics',
    code: 'ASTRO-102',
    title: 'Elliptical Orbits & Keplerian Motion',
    category: 'Astrophysics',
    description: 'Understanding why orbits are stretched ovals rather than rigid circles.',
    tier: 2,
    prerequisites: ['node-gravity-foundation'],
    requiredMasteryScore: 0.75,
    keyVocabulary: ['ellipse', 'velocity', 'foci', 'inertia', 'perihelion'],
    corePrinciples: ['Planets speed up closer to the sun due to gravitational acceleration'],
    unlocked: true,
    masteryLevel: 0.65,
    consecutiveDeepExplanations: 1
  },
  {
    id: 'node-solar-radiation',
    code: 'ASTRO-103',
    title: 'Solar Wind & Planetary Atmospheres',
    category: 'Astrophysics',
    description: 'How magnetic fields shield delicate atmospheres from energetic solar particles.',
    tier: 2,
    prerequisites: ['node-gravity-foundation'],
    requiredMasteryScore: 0.75,
    keyVocabulary: ['magnetosphere', 'plasma', 'aurora', 'shielding', 'atmosphere'],
    corePrinciples: ['A planetary magnetic dynamo deflects ionized solar particles'],
    unlocked: true,
    masteryLevel: 0.40,
    consecutiveDeepExplanations: 0
  },
  {
    id: 'node-habitable-zones',
    code: 'ASTRO-201',
    title: 'Goldilocks Habitable Zones',
    category: 'Astrophysics',
    description: 'Synthesizing stellar distance, atmospheric pressure, and liquid water viability.',
    tier: 3,
    prerequisites: ['node-orbital-mechanics', 'node-solar-radiation'],
    requiredMasteryScore: 0.80,
    keyVocabulary: ['habitable', 'equilibrium', 'liquid water', 'insolation', 'greenhouse'],
    corePrinciples: ['Surface water stability requires both moderate temperature and sufficient atmospheric pressure'],
    unlocked: false,
    masteryLevel: 0.0,
    consecutiveDeepExplanations: 0
  }
];
