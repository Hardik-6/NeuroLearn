import { ContentAdaptationConfig, StudentProfile, Activity, FuzzyState } from '../types';

/**
 * ============================================================================
 * SOFT COMPUTING MATHEMATICAL PRIMITIVES: MEMBERSHIP FUNCTIONS
 * ============================================================================
 */

/**
 * Triangular fuzzy membership function:
 *          /\
 *         /  \
 *  ______/____\______
 *       a   b  c
 */
export function triangularMembership(x: number, a: number, b: number, c: number): number {
  if (x <= a || x >= c) return 0;
  if (x === b) return 1;
  if (x > a && x < b) {
    return b === a ? 1 : (x - a) / (b - a);
  }
  if (x > b && x < c) {
    return c === b ? 1 : (c - x) / (c - b);
  }
  return 0;
}

/**
 * Trapezoidal fuzzy membership function:
 *         ______
 *        /      \
 *  _____/________\_____
 *      a   b   c  d
 */
export function trapezoidalMembership(x: number, a: number, b: number, c: number, d: number): number {
  if (x <= a || x >= d) return 0;
  if (x >= b && x <= c) return 1;
  if (x > a && x < b) {
    return b === a ? 1 : (x - a) / (b - a);
  }
  if (x > c && x < d) {
    return d === c ? 1 : (d - x) / (d - c);
  }
  return 0;
}

/**
 * ============================================================================
 * SOFT COMPUTING MODULE 1: MAMDANI FUZZY INFERENCE SYSTEM (FIS)
 * ============================================================================
 * 
 * Universe of Discourse:
 * - Input 1: Accuracy (0 to 100%)
 *     Sets: Low (trapezoidal: 0, 0, 25, 50), Medium (triangular: 30, 60, 85), High (trapezoidal: 70, 85, 100, 100)
 * - Input 2: Response Time in Seconds (0 to 120s)
 *     Sets: Fast (trapezoidal: 0, 0, 15, 30), Moderate (triangular: 20, 40, 65), Slow (trapezoidal: 50, 75, 120, 120)
 * - Input 3: Student Affective Mood (1 to 5 Likert)
 *     Sets: Negative (trapezoidal: 1, 1, 1.8, 2.8), Neutral (triangular: 2.2, 3.0, 3.8), Positive (trapezoidal: 3.2, 4.2, 5, 5)
 * - Output: Focus & Engagement Score (Universe U = [0, 100])
 *     Sets:
 *       - VeryLow: trapezoidal(0, 0, 15, 30)
 *       - Low:     triangular(20, 35, 50)
 *       - Medium:  triangular(40, 55, 70)
 *       - High:    triangular(60, 75, 90)
 *       - VeryHigh: trapezoidal(80, 90, 100, 100)
 *
 * Implication Operator: Godel / Mamdani MIN
 * Aggregation Operator: MAX across active rules
 * Defuzzification: Continuous Centroid / Center of Gravity (CoG)
 */

interface FuzzyOutputSets {
  veryLow: (x: number) => number;
  low: (x: number) => number;
  medium: (x: number) => number;
  high: (x: number) => number;
  veryHigh: (x: number) => number;
}

const OUTPUT_SETS: FuzzyOutputSets = {
  veryLow: (x: number) => trapezoidalMembership(x, 0, 0, 15, 30),
  low: (x: number) => triangularMembership(x, 20, 35, 50),
  medium: (x: number) => triangularMembership(x, 40, 55, 70),
  high: (x: number) => triangularMembership(x, 60, 75, 90),
  veryHigh: (x: number) => trapezoidalMembership(x, 80, 90, 100, 100),
};

export function estimateFocusScore(
  accuracy: number,
  responseTime: number,
  mood: number
): number {
  // Clamp inputs to canonical domain
  const acc = Math.max(0, Math.min(100, Number.isFinite(accuracy) ? accuracy : 50));
  const rt = Math.max(0, Math.min(120, Number.isFinite(responseTime) ? responseTime : 30));
  const md = Math.max(1, Math.min(5, Number.isFinite(mood) ? mood : 3));

  // 1. Fuzzification: Evaluate input linguistic membership degrees
  const accLow = trapezoidalMembership(acc, 0, 0, 25, 50);
  const accMed = triangularMembership(acc, 30, 60, 85);
  const accHigh = trapezoidalMembership(acc, 70, 85, 100, 100);

  const rtFast = trapezoidalMembership(rt, 0, 0, 15, 30);
  const rtMod = triangularMembership(rt, 20, 40, 65);
  const rtSlow = trapezoidalMembership(rt, 50, 75, 120, 120);

  const mdNeg = trapezoidalMembership(md, 1, 1, 1.8, 2.8);
  const mdNeu = triangularMembership(md, 2.2, 3.0, 3.8);
  const mdPos = trapezoidalMembership(md, 3.2, 4.2, 5, 5);

  // 2. Rule Base Evaluation (12 Mamdani Inference Rules)
  // Each rule computes firing strength using the T-norm MIN operator
  const ruleConsequents: { alpha: number; target: keyof FuzzyOutputSets }[] = [
    // Rule 1: High Accuracy AND Fast Response AND Positive Mood => Very High Focus
    { alpha: Math.min(accHigh, rtFast, mdPos), target: 'veryHigh' },

    // Rule 2: High Accuracy AND Moderate Response AND Positive Mood => High Focus
    { alpha: Math.min(accHigh, rtMod, mdPos), target: 'high' },

    // Rule 3: High Accuracy AND Moderate Response AND Neutral Mood => High Focus
    { alpha: Math.min(accHigh, rtMod, mdNeu), target: 'high' },

    // Rule 4: High Accuracy AND Slow Response (Deliberate/Careful) => Medium Focus
    { alpha: Math.min(accHigh, rtSlow), target: 'medium' },

    // Rule 5: Medium Accuracy AND Fast Response AND Positive Mood => High Focus
    { alpha: Math.min(accMed, rtFast, mdPos), target: 'high' },

    // Rule 6: Medium Accuracy AND Moderate Response AND Neutral Mood => Medium Focus
    { alpha: Math.min(accMed, rtMod, mdNeu), target: 'medium' },

    // Rule 7: Medium Accuracy AND Slow Response AND Negative Mood => Low Focus
    { alpha: Math.min(accMed, rtSlow, mdNeg), target: 'low' },

    // Rule 8: Low Accuracy AND Fast Response (Impulsive / ADHD rushing) => Low Focus
    { alpha: Math.min(accLow, rtFast), target: 'low' },

    // Rule 9: Low Accuracy AND Slow Response AND Negative Mood (Fatigued / Stuck) => Very Low Focus
    { alpha: Math.min(accLow, rtSlow, mdNeg), target: 'veryLow' },

    // Rule 10: Low Accuracy AND Moderate Response AND Neutral Mood => Low Focus
    { alpha: Math.min(accLow, rtMod, mdNeu), target: 'low' },

    // Rule 11: Negative Mood AND Slow Response (Burnout / Cognitive Resistance) => Very Low Focus
    { alpha: Math.min(mdNeg, rtSlow), target: 'veryLow' },

    // Rule 12: Positive Mood AND Fast Response => High Focus
    { alpha: Math.min(mdPos, rtFast), target: 'high' },
  ];

  // Aggregate rule firing strengths per output fuzzy set via S-norm (MAX)
  const maxAlpha: Record<keyof FuzzyOutputSets, number> = {
    veryLow: 0,
    low: 0,
    medium: 0,
    high: 0,
    veryHigh: 0,
  };

  for (const rule of ruleConsequents) {
    if (rule.alpha > maxAlpha[rule.target]) {
      maxAlpha[rule.target] = rule.alpha;
    }
  }

  // 3. Mamdani Aggregation & Centroid Defuzzification
  // Discretize Universe of Discourse U = [0, 100] with step size dx = 1
  let numerator = 0;
  let denominator = 0;

  for (let x = 0; x <= 100; x += 1) {
    // For each x in universe, aggregated mu(x) = MAX( MIN(alpha_k, mu_k(x)) )
    const muX = Math.max(
      Math.min(maxAlpha.veryLow, OUTPUT_SETS.veryLow(x)),
      Math.min(maxAlpha.low, OUTPUT_SETS.low(x)),
      Math.min(maxAlpha.medium, OUTPUT_SETS.medium(x)),
      Math.min(maxAlpha.high, OUTPUT_SETS.high(x)),
      Math.min(maxAlpha.veryHigh, OUTPUT_SETS.veryHigh(x))
    );

    numerator += x * muX;
    denominator += muX;
  }

  // Handle boundary when zero rules fire significantly (fallback to neutral center 50)
  if (denominator <= 1e-6) {
    return 50;
  }

  const defuzzified = numerator / denominator;
  return Math.min(100, Math.max(0, Math.round(defuzzified)));
}

/**
 * ============================================================================
 * SOFT COMPUTING MODULE 2: LINGUISTIC STATE CONVERSION
 * ============================================================================
 * Maps the defuzzified crisp focus metric to standard qualitative linguistic states.
 */
export function getFuzzyState(score: number): FuzzyState {
  if (score >= 80) return 'Optimal focus';
  if (score >= 65) return 'Good focus';
  if (score >= 45) return 'Steady attention';
  if (score >= 25) return 'Low focus';
  if (score > 0) return 'Distracted';
  return 'Distracted';
}

/**
 * ============================================================================
 * SOFT COMPUTING MODULE 3: ANFIS / SUGENO NEURO-FUZZY CONTROLLER
 * ============================================================================
 * Implements a 4-Layer First-Order Sugeno Neuro-Fuzzy Architecture:
 * 
 * Layer 1 (Fuzzification):
 *   Computes premise memberships for normalized inputs:
 *   - x1 = Focus Score [0, 100] -> Linguistic terms: Low (L), Medium (M), High (H)
 *   - x2 = Dyslexia Flag (0 or 1)
 *   - x3 = Sensory Sensitivity Indicator (0 or 1)
 * 
 * Layer 2 (Rule Firing):
 *   w_i = mu_A_i(x1) * mu_B_i(x2)
 * 
 * Layer 3 (Normalization):
 *   w_bar_i = w_i / sum(w_j)
 * 
 * Layer 4 (First-Order Sugeno Consequent Functions):
 *   z_font_i = a_i * x1 + b_i * x2 + c_i * x3 + d_i
 *   z_spacing_i = e_i * x1 + f_i * x2 + g_i * x3 + h_i
 * 
 * Layer 5 (Crisp Output):
 *   Output = sum(w_bar_i * z_i)
 */
export function adaptContent(
  focusScore: number,
  profile?: Partial<StudentProfile>
): ContentAdaptationConfig {
  const normFocus = Math.max(0, Math.min(100, focusScore));
  const hasDyslexia = profile?.diagnoses?.includes('Dyslexia') ? 1 : 0;
  const isSensorySensitive = profile?.sensorySensitivities && profile.sensorySensitivities.length > 0 ? 1 : 0;
  const isLightSensitive = profile?.sensorySensitivities?.some(s => {
    const lower = s.toLowerCase();
    return lower.includes('light') || lower.includes('glare') || lower.includes('contrast');
  }) ?? false;

  // Layer 1: Input Membership Functions
  const muLow = trapezoidalMembership(normFocus, 0, 0, 35, 55);
  const muMed = triangularMembership(normFocus, 40, 62, 80);
  const muHigh = trapezoidalMembership(normFocus, 65, 82, 100, 100);

  // Layer 2: Rule Firing Weights (w_i)
  // Rule 1: Focus is Low
  const w1 = muLow;
  // Rule 2: Focus is Medium OR Dyslexia is present
  const w2 = Math.max(muMed, hasDyslexia * 0.85);
  // Rule 3: Focus is High AND Dyslexia is absent
  const w3 = Math.max(0, muHigh * (1 - hasDyslexia * 0.5));

  const sumWeights = w1 + w2 + w3;
  // Layer 3: Normalized Weights (w_bar_i)
  const nw1 = sumWeights > 0 ? w1 / sumWeights : 0.333;
  const nw2 = sumWeights > 0 ? w2 / sumWeights : 0.333;
  const nw3 = sumWeights > 0 ? w3 / sumWeights : 0.334;

  // Layer 4: First-order linear polynomial consequents
  // z_font = a * focus + b * dyslexia + c * sensory + d (base in px)
  const zFont1 = -0.02 * normFocus + 1.2 * hasDyslexia + 0.5 * isSensorySensitive + 18.2;
  const zFont2 = -0.015 * normFocus + 1.0 * hasDyslexia + 0.3 * isSensorySensitive + 16.5;
  const zFont3 = -0.01 * normFocus + 0.5 * hasDyslexia + 0.0 * isSensorySensitive + 14.8;

  // z_spacing = e * focus + f * dyslexia + g * sensory + h (line-height ratio)
  const zSpacing1 = -0.002 * normFocus + 0.15 * hasDyslexia + 0.05 * isSensorySensitive + 1.82;
  const zSpacing2 = -0.0015 * normFocus + 0.12 * hasDyslexia + 0.04 * isSensorySensitive + 1.64;
  const zSpacing3 = -0.001 * normFocus + 0.05 * hasDyslexia + 0.00 * isSensorySensitive + 1.45;

  // Layer 5: Weighted average defuzzified continuous outputs
  const calculatedFont = nw1 * zFont1 + nw2 * zFont2 + nw3 * zFont3;
  const calculatedSpacing = nw1 * zSpacing1 + nw2 * zSpacing2 + nw3 * zSpacing3;

  // Quantize continuous Sugeno output to supported typographical discrete classes
  let fontSize: '14px' | '16px' | '18px';
  if (calculatedFont >= 17.0) {
    fontSize = '18px';
  } else if (calculatedFont >= 15.2) {
    fontSize = '16px';
  } else {
    fontSize = '14px';
  }

  let lineSpacing: '1.4' | '1.6' | '1.8';
  if (calculatedSpacing >= 1.72) {
    lineSpacing = '1.8';
  } else if (calculatedSpacing >= 1.52) {
    lineSpacing = '1.6';
  } else {
    lineSpacing = '1.4';
  }

  // Theme selection: High visual load or light sensitivity favors soft cream/sepia
  let theme: 'light' | 'cream' | 'dark' = 'light';
  if (isLightSensitive || fontSize === '18px' || (hasDyslexia && normFocus < 60)) {
    theme = 'cream';
  }

  // Construct explainable pedagogical justification
  let reason = '';
  let ruleTriggered = '';

  if (fontSize === '18px') {
    reason = `ANFIS inferred elevated cognitive strain (focus score ${normFocus.toFixed(0)}, calculated font ${calculatedFont.toFixed(1)}px). Applied 18px text and 1.8x line height on soft cream to alleviate visual crowding and working memory load.`;
    ruleTriggered = `ANFIS Rule 1 (Sugeno w1=${nw1.toFixed(2)}) → Font: 18px, LineSpacing: 1.8, Palette: ${theme}`;
  } else if (fontSize === '16px' || hasDyslexia) {
    reason = hasDyslexia
      ? `Dyslexia accommodation synthesized via Sugeno Layer 4: 16px font and 1.6x line spacing maintain optimal character disambiguation.`
      : `Moderate steady attention (focus score ${normFocus.toFixed(0)}). ANFIS adjusted typography to 16px with 1.6x spacing for sustained comprehension.`;
    ruleTriggered = `ANFIS Rule 2 (Sugeno w2=${nw2.toFixed(2)}) → Font: 16px, LineSpacing: 1.6, Palette: ${theme}`;
  } else {
    reason = `Optimal cognitive flow detected (focus score ${normFocus.toFixed(0)}). ANFIS calibrated layout to 14px with 1.4x line height for dense, high-throughput learning.`;
    ruleTriggered = `ANFIS Rule 3 (Sugeno w3=${nw3.toFixed(2)}) → Font: 14px, LineSpacing: 1.4, Palette: ${theme}`;
  }

  return {
    fontSize,
    lineSpacing,
    theme,
    reason,
    ruleTriggered
  };
}

/**
 * ============================================================================
 * SOFT COMPUTING MODULE 4: GENETIC ALGORITHM (GA) FOR 0/1 KNAPSACK
 * ============================================================================
 * 
 * Optimizes activity curation under an attention span time constraint:
 * 
 * Mathematical Formulation:
 *   Maximize Fitness(C) = sum_{i=1}^N C_i * Engagement_i - Penalty(C)
 *   Subject to: sum_{i=1}^N C_i * Duration_i <= AttentionBudget
 * 
 * Algorithm Components:
 *   - Binary Chromosome: C in {0, 1}^N where C_i indicates activity selection.
 *   - Population Size: 40 individuals.
 *   - Generations: 75 evolutionary iterations.
 *   - Selection: Tournament Selection (k=3).
 *   - Crossover: 1-point crossover with probability P_c = 0.82.
 *   - Mutation: Bit-flip mutation with probability P_m = 0.05 per locus.
 *   - Elitism: Top 2 elite chromosomes preserved across generations.
 *   - Constraint Handling: Deterministic knapsack repair removing lowest
 *     efficiency (Engagement / Duration) items when budget is exceeded.
 */

interface Individual {
  chromosome: number[]; // binary array [0 or 1]
  fitness: number;
  totalDuration: number;
  totalEngagement: number;
}

/**
 * Repairs a chromosome exceeding the attention budget by dropping items with
 * the lowest engagement-to-duration ratio until the constraint is satisfied.
 */
function repairChromosome(
  chromosome: number[],
  activities: Activity[],
  attentionBudget: number
): number[] {
  const repaired = [...chromosome];
  let currentDuration = 0;

  for (let i = 0; i < activities.length; i++) {
    if (repaired[i] === 1) {
      currentDuration += activities[i].duration;
    }
  }

  if (currentDuration <= attentionBudget) {
    return repaired;
  }

  // Create indexed list of active items sorted by efficiency (ascending: worst first)
  const activeItems: { index: number; efficiency: number; duration: number }[] = [];
  for (let i = 0; i < activities.length; i++) {
    if (repaired[i] === 1) {
      const dur = Math.max(1, activities[i].duration);
      activeItems.push({
        index: i,
        efficiency: activities[i].engagement / dur,
        duration: dur,
      });
    }
  }

  activeItems.sort((a, b) => a.efficiency - b.efficiency);

  // Drop least efficient activities until within budget
  for (const item of activeItems) {
    if (currentDuration <= attentionBudget) break;
    repaired[item.index] = 0;
    currentDuration -= item.duration;
  }

  return repaired;
}

/**
 * Computes the objective fitness of an individual chromosome.
 */
function evaluateIndividual(
  chromosome: number[],
  activities: Activity[],
  attentionBudget: number
): Individual {
  let totalDuration = 0;
  let totalEngagement = 0;

  for (let i = 0; i < activities.length; i++) {
    if (chromosome[i] === 1) {
      totalDuration += activities[i].duration;
      totalEngagement += activities[i].engagement;
    }
  }

  // Penalty function for budget violation (guiding search gradient even if unfeasible)
  let penalty = 0;
  if (totalDuration > attentionBudget) {
    const excess = totalDuration - attentionBudget;
    penalty = excess * 25; // Severe quadratic or steep linear penalty
  }

  const fitness = Math.max(0, totalEngagement - penalty);

  return {
    chromosome,
    fitness,
    totalDuration,
    totalEngagement,
  };
}

/**
 * Tournament selection operator: picks k random individuals and returns the best.
 */
function tournamentSelect(population: Individual[], k = 3): Individual {
  let best = population[Math.floor(Math.random() * population.length)];
  for (let i = 1; i < k; i++) {
    const competitor = population[Math.floor(Math.random() * population.length)];
    if (competitor.fitness > best.fitness) {
      best = competitor;
    }
  }
  return best;
}

/**
 * 1-Point Crossover operator.
 */
function crossover(parentA: number[], parentB: number[], crossoverRate = 0.82): [number[], number[]] {
  if (Math.random() > crossoverRate || parentA.length <= 1) {
    return [[...parentA], [...parentB]];
  }
  const point = Math.floor(Math.random() * (parentA.length - 1)) + 1;
  const child1 = [...parentA.slice(0, point), ...parentB.slice(point)];
  const child2 = [...parentB.slice(0, point), ...parentA.slice(point)];
  return [child1, child2];
}

/**
 * Bit-flip mutation operator.
 */
function mutate(chromosome: number[], mutationRate = 0.05): number[] {
  return chromosome.map(gene => {
    return Math.random() < mutationRate ? 1 - gene : gene;
  });
}

/**
 * Main Genetic Algorithm execution function.
 */
export function optimizeLessonOrder(
  activities: Activity[],
  attentionSpanMinutes: number
): Activity[] {
  if (!activities || activities.length === 0) return [];
  const budget = Math.max(5, Number.isFinite(attentionSpanMinutes) ? attentionSpanMinutes : 25);

  const numGenes = activities.length;

  // Single-item edge case: check if it fits
  if (numGenes === 1) {
    return activities[0].duration <= budget ? [activities[0]] : [];
  }

  const POPULATION_SIZE = 40;
  const MAX_GENERATIONS = 75;
  const ELITISM_COUNT = 2;

  // 1. Initialize Population with random binary strings and repair constraint violations
  let population: Individual[] = [];
  for (let i = 0; i < POPULATION_SIZE; i++) {
    const rawChromosome = Array.from({ length: numGenes }, () => (Math.random() < 0.4 ? 1 : 0));
    // Ensure chromosome is not completely empty
    if (!rawChromosome.some(g => g === 1)) {
      rawChromosome[Math.floor(Math.random() * numGenes)] = 1;
    }
    const repaired = repairChromosome(rawChromosome, activities, budget);
    population.push(evaluateIndividual(repaired, activities, budget));
  }

  // 2. Evolutionary Loop
  for (let gen = 0; gen < MAX_GENERATIONS; gen++) {
    // Sort descending by fitness
    population.sort((a, b) => b.fitness - a.fitness);

    const nextGeneration: Individual[] = [];

    // Elitism: carry over the top performers unaltered
    for (let e = 0; e < ELITISM_COUNT; e++) {
      nextGeneration.push(population[e]);
    }

    // Generate offspring to fill population
    while (nextGeneration.length < POPULATION_SIZE) {
      const parent1 = tournamentSelect(population, 3);
      const parent2 = tournamentSelect(population, 3);

      const [childA, childB] = crossover(parent1.chromosome, parent2.chromosome);
      const mutatedA = mutate(childA, 0.05);
      const mutatedB = mutate(childB, 0.05);

      const repairedA = repairChromosome(mutatedA, activities, budget);
      const repairedB = repairChromosome(mutatedB, activities, budget);

      nextGeneration.push(evaluateIndividual(repairedA, activities, budget));
      if (nextGeneration.length < POPULATION_SIZE) {
        nextGeneration.push(evaluateIndividual(repairedB, activities, budget));
      }
    }

    population = nextGeneration;
  }

  // 3. Extract Best Chromosome from final generation
  population.sort((a, b) => b.fitness - a.fitness);
  const bestIndividual = population[0];

  // Convert binary chromosome back into Activity[] sequence
  // Order preserved based on highest pedagogical engagement density (engagement / duration)
  const selectedActivities: Activity[] = [];
  for (let i = 0; i < numGenes; i++) {
    if (bestIndividual.chromosome[i] === 1) {
      selectedActivities.push(activities[i]);
    }
  }

  // Final Pareto arrangement: sequence selected activities by descending engagement
  selectedActivities.sort((a, b) => b.engagement - a.engagement);

  return selectedActivities;
}
