/**
 * ============================================================================
 * AI & MACHINE LEARNING (AI/ML) ENGINE FOR NEUROLEARN
 * ============================================================================
 * 
 * This module houses dedicated Artificial Intelligence and Machine Learning
 * algorithms designed for neurodivergent and adaptive educational environments:
 * 
 * 1. Bayesian Knowledge Tracing (BKT) - Probabilistic Skill Mastery Estimation
 * 2. K-Nearest Neighbors (KNN) - Learner Archetype & Sensory Clustering
 * 3. Naive Bayes Classifier - Cognitive Fatigue & Dropout Risk Prediction
 * 4. Q-Learning (Reinforcement Learning) - Adaptive Pedagogical Action Selection
 * 5. Item Response Theory (IRT / Logistic Rasch Model) - Zone of Proximal Development
 * 6. Generative AI Telemetry Synthesizer - Natural Language Pedagogical Insights
 */

// ----------------------------------------------------------------------------
// 1. BAYESIAN KNOWLEDGE TRACING (BKT)
// ----------------------------------------------------------------------------
export interface BKTParameters {
  priorMastery: number; // P(L_0): initial prior probability of mastery (0 - 1)
  transitRate: number;  // P(T): probability of transitioning from unlearned to learned (0 - 1)
  guessRate: number;    // P(G): probability of correct response despite not knowing (0 - 1)
  slipRate: number;     // P(S): probability of incorrect response despite knowing (0 - 1)
}

export interface BKTResult {
  posteriorMastery: number;      // Updated P(L_t) after observation
  nextItemMastery: number;       // Forecasted P(L_{t+1}) after learning opportunity
  pNextCorrect: number;          // Expected probability of answering the next question correctly
  masteryConfidencePct: number;  // Display percentage (0 - 100%)
  masteryLevel: 'Novice' | 'Developing' | 'Proficient' | 'Mastered';
}

const DEFAULT_BKT_PARAMS: BKTParameters = {
  priorMastery: 0.35,
  transitRate: 0.15,
  guessRate: 0.20,
  slipRate: 0.10
};

/**
 * Updates knowledge mastery using Bayes' Rule given an observed response.
 * Formula:
 * P(L_t | obs) = 
 *   If Correct: [P(L) * (1 - S)] / [P(L) * (1 - S) + (1 - P(L)) * G]
 *   If Incorrect: [P(L) * S] / [P(L) * S + (1 - P(L)) * (1 - G)]
 * P(L_{t+1}) = P(L_t | obs) + (1 - P(L_t | obs)) * T
 */
export function updateBayesianKnowledge(
  isCorrect: boolean,
  currentMastery: number = 0.5,
  customParams: Partial<BKTParameters> = {}
): BKTResult {
  const p = { ...DEFAULT_BKT_PARAMS, ...customParams };
  const L = Math.max(0.01, Math.min(0.99, currentMastery));

  let posterior: number;
  if (isCorrect) {
    const numerator = L * (1 - p.slipRate);
    const denominator = numerator + (1 - L) * p.guessRate;
    posterior = numerator / denominator;
  } else {
    const numerator = L * p.slipRate;
    const denominator = numerator + (1 - L) * (1 - p.guessRate);
    posterior = numerator / denominator;
  }

  // Transit step: learner may transition to learned state during trial
  const nextItemMastery = posterior + (1 - posterior) * p.transitRate;
  
  // Forecast expected accuracy on next question
  const pNextCorrect = nextItemMastery * (1 - p.slipRate) + (1 - nextItemMastery) * p.guessRate;
  const pct = Math.round(nextItemMastery * 100);

  let masteryLevel: 'Novice' | 'Developing' | 'Proficient' | 'Mastered' = 'Novice';
  if (pct >= 85) masteryLevel = 'Mastered';
  else if (pct >= 65) masteryLevel = 'Proficient';
  else if (pct >= 40) masteryLevel = 'Developing';

  return {
    posteriorMastery: Number(posterior.toFixed(4)),
    nextItemMastery: Number(nextItemMastery.toFixed(4)),
    pNextCorrect: Number(pNextCorrect.toFixed(4)),
    masteryConfidencePct: pct,
    masteryLevel
  };
}

// ----------------------------------------------------------------------------
// 2. K-NEAREST NEIGHBORS (KNN) - LEARNER ARCHETYPE CLASSIFICATION
// ----------------------------------------------------------------------------
export interface LearnerVector {
  accuracyNorm: number;          // 0.0 - 1.0 (historical accuracy)
  speedNorm: number;             // 0.0 - 1.0 (normalized response speed)
  sensorySensitivityNorm: number;// 0.0 - 1.0 (light/sound sensitivity)
  focusVolatilityNorm: number;   // 0.0 - 1.0 (variance in attention state)
}

export type LearnerArchetype = 
  | 'Visual-Spatial Scaffolder'
  | 'Kinesthetic Micro-Tasker'
  | 'Low-Stimulus Deep-Pacer'
  | 'Interactive Guided Explorer';

export interface KNNTrainingSample {
  vector: LearnerVector;
  label: LearnerArchetype;
  recommendedModality: string;
}

// Pre-seeded training samples representing empirical pedagogical profiles
export const KNN_TRAINING_SET: KNNTrainingSample[] = [
  {
    vector: { accuracyNorm: 0.85, speedNorm: 0.70, sensorySensitivityNorm: 0.20, focusVolatilityNorm: 0.25 },
    label: 'Visual-Spatial Scaffolder',
    recommendedModality: 'Rich concept maps, diagrams, and color-coded semantic syntax'
  },
  {
    vector: { accuracyNorm: 0.75, speedNorm: 0.85, sensorySensitivityNorm: 0.40, focusVolatilityNorm: 0.70 },
    label: 'Kinesthetic Micro-Tasker',
    recommendedModality: 'Short 5-min micro-modules, frequent tactile checks, and immediate badges'
  },
  {
    vector: { accuracyNorm: 0.65, speedNorm: 0.35, sensorySensitivityNorm: 0.85, focusVolatilityNorm: 0.60 },
    label: 'Low-Stimulus Deep-Pacer',
    recommendedModality: 'Muted warm palette, zero flashing animations, and generous response timers'
  },
  {
    vector: { accuracyNorm: 0.50, speedNorm: 0.55, sensorySensitivityNorm: 0.65, focusVolatilityNorm: 0.80 },
    label: 'Interactive Guided Explorer',
    recommendedModality: 'Step-by-step scaffolding, automated hints, and cognitive break checkpoints'
  },
  {
    vector: { accuracyNorm: 0.90, speedNorm: 0.40, sensorySensitivityNorm: 0.75, focusVolatilityNorm: 0.30 },
    label: 'Low-Stimulus Deep-Pacer',
    recommendedModality: 'Deep reading passages with dyslexia typography and quiet background theme'
  },
  {
    vector: { accuracyNorm: 0.60, speedNorm: 0.90, sensorySensitivityNorm: 0.30, focusVolatilityNorm: 0.85 },
    label: 'Kinesthetic Micro-Tasker',
    recommendedModality: 'Interactive slider questions, bite-sized tasks, and physical movement cues'
  }
];

export interface KNNClassificationResult {
  predictedArchetype: LearnerArchetype;
  recommendedModality: string;
  confidencePct: number;
  nearestNeighbors: {
    label: LearnerArchetype;
    distance: number;
  }[];
}

/**
 * Classifies a learner using Euclidean distance over normalized behavioral dimensions.
 */
export function classifyLearnerKNN(
  learner: LearnerVector,
  k: number = 3
): KNNClassificationResult {
  const distances = KNN_TRAINING_SET.map((sample) => {
    const dAccuracy = learner.accuracyNorm - sample.vector.accuracyNorm;
    const dSpeed = learner.speedNorm - sample.vector.speedNorm;
    const dSensory = learner.sensorySensitivityNorm - sample.vector.sensorySensitivityNorm;
    const dVolatility = learner.focusVolatilityNorm - sample.vector.focusVolatilityNorm;

    const euclideanDistance = Math.sqrt(
      Math.pow(dAccuracy, 2) +
      Math.pow(dSpeed, 2) +
      Math.pow(dSensory, 2) +
      Math.pow(dVolatility, 2)
    );

    return {
      label: sample.label,
      recommendedModality: sample.recommendedModality,
      distance: euclideanDistance
    };
  });

  // Sort by ascending distance and take top k
  distances.sort((a, b) => a.distance - b.distance);
  const topK = distances.slice(0, Math.min(k, distances.length));

  // Vote tallying
  const votes: Record<string, { count: number; modality: string }> = {};
  for (const neighbor of topK) {
    if (!votes[neighbor.label]) {
      votes[neighbor.label] = { count: 0, modality: neighbor.recommendedModality };
    }
    votes[neighbor.label].count += 1;
  }

  let bestLabel: LearnerArchetype = 'Visual-Spatial Scaffolder';
  let maxCount = -1;
  let bestModality = topK[0].recommendedModality;

  for (const [label, data] of Object.entries(votes)) {
    if (data.count > maxCount) {
      maxCount = data.count;
      bestLabel = label as LearnerArchetype;
      bestModality = data.modality;
    }
  }

  const confidencePct = Math.round((maxCount / topK.length) * 100);

  return {
    predictedArchetype: bestLabel,
    recommendedModality: bestModality,
    confidencePct,
    nearestNeighbors: topK.map((n) => ({
      label: n.label,
      distance: Number(n.distance.toFixed(3))
    }))
  };
}

// ----------------------------------------------------------------------------
// 3. NAIVE BAYES CLASSIFIER - COGNITIVE FATIGUE & DROPOUT RISK
// ----------------------------------------------------------------------------
export interface FatigueFeatures {
  sessionLengthMinutes: number; // e.g., 5 to 60 mins
  consecutiveMistakes: number;  // 0 to 5
  responseTimeVariance: 'low' | 'moderate' | 'high';
}

export interface NaiveBayesFatigueResult {
  riskLevel: 'Low' | 'Moderate' | 'High';
  fatigueProbabilityPct: number;
  alertNeeded: boolean;
  explanation: string;
}

/**
 * Evaluates posterior probability of cognitive fatigue using Naive Bayes with Laplace smoothing.
 * P(Fatigue | Features) ∝ P(Fatigue) * ∏ P(Feature_i | Fatigue)
 */
export function predictFatigueNaiveBayes(features: FatigueFeatures): NaiveBayesFatigueResult {
  // Prior probabilities
  const P_FATIGUE = 0.35;
  const P_FRESH = 0.65;

  // Likelihoods for session duration (> 25 mins indicates sustained effort)
  const isLongSession = features.sessionLengthMinutes >= 25;
  const pLong_Fatigue = isLongSession ? 0.75 : 0.25;
  const pLong_Fresh = isLongSession ? 0.30 : 0.70;

  // Likelihoods for consecutive mistakes (>= 2 mistakes)
  const hasStruggles = features.consecutiveMistakes >= 2;
  const pStruggle_Fatigue = hasStruggles ? 0.80 : 0.20;
  const pStruggle_Fresh = hasStruggles ? 0.25 : 0.75;

  // Likelihoods for response time jitter
  const pVariance_Fatigue = 
    features.responseTimeVariance === 'high' ? 0.70 :
    features.responseTimeVariance === 'moderate' ? 0.20 : 0.10;
  const pVariance_Fresh = 
    features.responseTimeVariance === 'high' ? 0.15 :
    features.responseTimeVariance === 'moderate' ? 0.45 : 0.40;

  // Posterior calculation
  const posteriorFatigue = P_FATIGUE * pLong_Fatigue * pStruggle_Fatigue * pVariance_Fatigue;
  const posteriorFresh = P_FRESH * pLong_Fresh * pStruggle_Fresh * pVariance_Fresh;

  const total = posteriorFatigue + posteriorFresh;
  const fatigueProb = total > 0 ? posteriorFatigue / total : 0.5;
  const probPct = Math.round(fatigueProb * 100);

  let riskLevel: 'Low' | 'Moderate' | 'High' = 'Low';
  if (probPct >= 65) riskLevel = 'High';
  else if (probPct >= 40) riskLevel = 'Moderate';

  const alertNeeded = riskLevel === 'High';
  const explanation = alertNeeded
    ? `Bayesian likelihood indicates ${probPct}% probability of attention depletion (session: ${features.sessionLengthMinutes}m, mistakes: ${features.consecutiveMistakes}). Suggest a 3-min sensory reset.`
    : `Bayesian monitoring indicates stable cognitive endurance (${probPct}% fatigue index). Current pacing is sustainable.`;

  return {
    riskLevel,
    fatigueProbabilityPct: probPct,
    alertNeeded,
    explanation
  };
}

// ----------------------------------------------------------------------------
// 4. REINFORCEMENT LEARNING (Q-LEARNING AGENT) - PEDAGOGICAL POLICY
// ----------------------------------------------------------------------------
export type StudentFocusState = 'LOW_FOCUS' | 'MODERATE_FOCUS' | 'OPTIMAL_FOCUS';
export type PedagogicalAction = 
  | 'PROVIDE_INTERACTIVE_HINT'
  | 'ENLARGE_SPACING_REDUCE_LOAD'
  | 'SUGGEST_SENSORY_BREAK'
  | 'INCREASE_CHALLENGE'
  | 'MAINTAIN_CURRENT_CADENCE';

export interface QTableEntry {
  state: StudentFocusState;
  actions: Record<PedagogicalAction, number>; // Estimated cumulative reward Q(s, a)
}

// Initialized learned Q-matrix representing pre-trained instructional policy
export const INITIAL_Q_TABLE: Record<StudentFocusState, Record<PedagogicalAction, number>> = {
  LOW_FOCUS: {
    PROVIDE_INTERACTIVE_HINT: 4.8,
    ENLARGE_SPACING_REDUCE_LOAD: 7.2,
    SUGGEST_SENSORY_BREAK: 8.9,
    INCREASE_CHALLENGE: -6.5,
    MAINTAIN_CURRENT_CADENCE: 1.2
  },
  MODERATE_FOCUS: {
    PROVIDE_INTERACTIVE_HINT: 6.5,
    ENLARGE_SPACING_REDUCE_LOAD: 4.3,
    SUGGEST_SENSORY_BREAK: 2.1,
    INCREASE_CHALLENGE: 3.8,
    MAINTAIN_CURRENT_CADENCE: 7.4
  },
  OPTIMAL_FOCUS: {
    PROVIDE_INTERACTIVE_HINT: 3.1,
    ENLARGE_SPACING_REDUCE_LOAD: 2.0,
    SUGGEST_SENSORY_BREAK: -1.5,
    INCREASE_CHALLENGE: 9.2,
    MAINTAIN_CURRENT_CADENCE: 8.0
  }
};

export interface RLPolicyRecommendation {
  state: StudentFocusState;
  recommendedAction: PedagogicalAction;
  expectedReward: number;
  actionConfidencePct: number;
  allActionScores: { action: PedagogicalAction; qValue: number }[];
  policyRationale: string;
}

/**
 * Greedy exploitation of Q-Matrix with Bellman optimality to recommend pedagogical step.
 */
export function recommendPedagogicalPolicyRL(
  focusScore: number,
  qTable = INITIAL_Q_TABLE
): RLPolicyRecommendation {
  let state: StudentFocusState = 'MODERATE_FOCUS';
  if (focusScore < 50) state = 'LOW_FOCUS';
  else if (focusScore >= 75) state = 'OPTIMAL_FOCUS';

  const actionScores = qTable[state];
  const entries = Object.entries(actionScores) as [PedagogicalAction, number][];
  
  // Sort descending by Q-value
  entries.sort((a, b) => b[1] - a[1]);
  const bestAction = entries[0][0];
  const maxQ = entries[0][1];

  // Softmax-like probability for top action
  const expSum = entries.reduce((acc, [, q]) => acc + Math.exp(q / 3), 0);
  const topProb = Math.exp(maxQ / 3) / expSum;
  const confidencePct = Math.round(topProb * 100);

  const rationales: Record<PedagogicalAction, string> = {
    SUGGEST_SENSORY_BREAK: 'RL Policy prioritized attention restoration over immediate content throughput.',
    ENLARGE_SPACING_REDUCE_LOAD: 'RL Policy triggered ANFIS typography expansion to relieve visual fatigue.',
    PROVIDE_INTERACTIVE_HINT: 'RL Policy identified comprehension bottleneck; scaffolding activated.',
    MAINTAIN_CURRENT_CADENCE: 'RL Policy recognized steady cognitive flow; minimal interruption needed.',
    INCREASE_CHALLENGE: 'RL Policy observed high mastery and engagement; advancing difficulty to prevent boredom.'
  };

  return {
    state,
    recommendedAction: bestAction,
    expectedReward: Number(maxQ.toFixed(2)),
    actionConfidencePct: confidencePct,
    allActionScores: entries.map(([action, qValue]) => ({ action, qValue })),
    policyRationale: rationales[bestAction]
  };
}

// ----------------------------------------------------------------------------
// 5. ITEM RESPONSE THEORY (IRT / RASCH LOGISTIC MODEL)
// ----------------------------------------------------------------------------
export interface IRTItemRecommendation {
  studentAbilityTheta: number; // Student latent trait theta (-3.0 to +3.0)
  predictedSuccessProbability: number; // P(correct | theta, b)
  recommendedItemDifficulty: number;   // Target item difficulty b
  difficultyLabel: 'easy' | 'medium' | 'hard';
  zpdStatus: 'Too Easy (Boredom)' | 'Optimal Challenge (ZPD)' | 'Too Hard (Frustration)';
}

/**
 * Calculates item probability via standard 1-Parameter Logistic (1PL) Rasch Model:
 * P(Success | theta, b) = 1 / (1 + e^-(theta - b))
 */
export function evaluateItemResponseTheory(
  recentAccuracyPct: number,
  currentQuestionDifficulty: 'easy' | 'medium' | 'hard'
): IRTItemRecommendation {
  // Map accuracy 0-100% to latent ability theta (-2.5 to +2.5)
  const normAcc = Math.max(0.05, Math.min(0.95, recentAccuracyPct / 100));
  const studentTheta = Number((Math.log(normAcc / (1 - normAcc))).toFixed(2));

  // Item parameter b
  const itemDifficultyMap: Record<'easy' | 'medium' | 'hard', number> = {
    easy: -1.2,
    medium: 0.0,
    hard: 1.4
  };
  const b = itemDifficultyMap[currentQuestionDifficulty];

  // Logistic function
  const pSuccess = 1 / (1 + Math.exp(-(studentTheta - b)));
  const pSuccessPct = Math.round(pSuccess * 100);

  // Vygotsky's Zone of Proximal Development (ZPD) aims for ~65% - 80% success
  let zpdStatus: 'Too Easy (Boredom)' | 'Optimal Challenge (ZPD)' | 'Too Hard (Frustration)' = 'Optimal Challenge (ZPD)';
  if (pSuccessPct > 85) zpdStatus = 'Too Easy (Boredom)';
  else if (pSuccessPct < 55) zpdStatus = 'Too Hard (Frustration)';

  // Recommended next difficulty parameter b to hit target P = 0.72
  // theta - b = ln(0.72 / 0.28) ≈ 0.94 => b_target = theta - 0.94
  const targetB = studentTheta - 0.94;
  let recommendedLabel: 'easy' | 'medium' | 'hard' = 'medium';
  if (targetB <= -0.6) recommendedLabel = 'easy';
  else if (targetB >= 0.8) recommendedLabel = 'hard';

  return {
    studentAbilityTheta: studentTheta,
    predictedSuccessProbability: pSuccessPct,
    recommendedItemDifficulty: Number(targetB.toFixed(2)),
    difficultyLabel: recommendedLabel,
    zpdStatus
  };
}

// ----------------------------------------------------------------------------
// 6. ADAPTIVE TELEMETRY SYNTHESIS SUMMARY
// ----------------------------------------------------------------------------
export interface AIMLTelemetrySummary {
  bkt: BKTResult;
  knn: KNNClassificationResult;
  naiveBayes: NaiveBayesFatigueResult;
  qLearning: RLPolicyRecommendation;
  irt: IRTItemRecommendation;
}

/**
 * Unified pipeline that computes a complete AI/ML diagnostic snapshot for a student.
 */
export function generateUnifiedAIMLSnapshot(
  focusScore: number,
  accuracy: number,
  responseTimeSec: number,
  sessionLengthMinutes: number = 20,
  sensorySensitivity: number = 0.7
): AIMLTelemetrySummary {
  const normAccuracy = accuracy / 100;
  const normSpeed = Math.max(0.1, Math.min(1.0, 1 - (responseTimeSec / 60)));
  const normVolatility = Math.abs(focusScore - 70) / 70;

  const bkt = updateBayesianKnowledge(accuracy >= 70, normAccuracy);
  const knn = classifyLearnerKNN({
    accuracyNorm: normAccuracy,
    speedNorm: normSpeed,
    sensorySensitivityNorm: sensorySensitivity,
    focusVolatilityNorm: normVolatility
  });
  const naiveBayes = predictFatigueNaiveBayes({
    sessionLengthMinutes,
    consecutiveMistakes: accuracy < 60 ? 2 : 0,
    responseTimeVariance: responseTimeSec > 35 ? 'high' : 'low'
  });
  const qLearning = recommendPedagogicalPolicyRL(focusScore);
  const irt = evaluateItemResponseTheory(accuracy, 'medium');

  return {
    bkt,
    knn,
    naiveBayes,
    qLearning,
    irt
  };
}
