import React, { useState } from 'react';
import { X, Cpu, Sliders, Layers, Sparkles, Binary, CheckCircle2, Brain } from 'lucide-react';
import { estimateFocusScore, adaptContent, optimizeLessonOrder, getFuzzyState } from '../algorithms/softComputing';
import {
  updateBayesianKnowledge,
  classifyLearnerKNN,
  predictFatigueNaiveBayes,
  recommendPedagogicalPolicyRL,
  evaluateItemResponseTheory
} from '../algorithms/aiMlEngine';
import { MOCK_ACTIVITIES } from '../mockData';

interface SoftComputingInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialScore?: number;
}

export const SoftComputingInspectorModal: React.FC<SoftComputingInspectorModalProps> = ({
  isOpen,
  onClose,
  initialScore = 78
}) => {
  const [activeTab, setActiveTab] = useState<'fuzzy' | 'anfis' | 'ga' | 'aiml'>('fuzzy');

  // Fuzzy logic simulation state
  const [accuracy, setAccuracy] = useState<number>(85);
  const [responseTime, setResponseTime] = useState<number>(18);
  const [mood, setMood] = useState<number>(4);

  // ANFIS simulation state
  const [simFocusScore, setSimFocusScore] = useState<number>(initialScore);
  const [hasDyslexia, setHasDyslexia] = useState<boolean>(true);
  const [hasADHD, setHasADHD] = useState<boolean>(true);

  // GA simulation state
  const [attentionSpanBudget, setAttentionSpanBudget] = useState<number>(25);

  // AI/ML simulation states
  const [bktPrior, setBktPrior] = useState<number>(45);
  const [bktObservedCorrect, setBktObservedCorrect] = useState<boolean>(true);
  const [knnAccuracy, setKnnAccuracy] = useState<number>(80);
  const [knnSpeedSec, setKnnSpeedSec] = useState<number>(18);
  const [knnSensory, setKnnSensory] = useState<number>(75);
  const [knnVolatility, setKnnVolatility] = useState<number>(40);
  const [nbSessionMins, setNbSessionMins] = useState<number>(28);
  const [nbMistakes, setNbMistakes] = useState<number>(2);
  const [nbVariance, setNbVariance] = useState<'low' | 'moderate' | 'high'>('high');
  const [rlFocusScore, setRlFocusScore] = useState<number>(42);
  const [irtQuestionDiff, setIrtQuestionDiff] = useState<'easy' | 'medium' | 'hard'>('medium');

  if (!isOpen) return null;

  // Real-time calculations using our production soft computing module
  const liveFocusScore = estimateFocusScore(accuracy, responseTime, mood);
  const liveFuzzyState = getFuzzyState(liveFocusScore);

  const anfisConfig = adaptContent(simFocusScore, {
    diagnoses: hasDyslexia ? ['Dyslexia'] : hasADHD ? ['ADHD'] : []
  });

  const gaSelectedActivities = optimizeLessonOrder(MOCK_ACTIVITIES, attentionSpanBudget);
  const gaTotalDuration = gaSelectedActivities.reduce((acc, curr) => acc + curr.duration, 0);

  // AI/ML module live computations from /src/algorithms/aiMlEngine.ts
  const bktResult = updateBayesianKnowledge(bktObservedCorrect, bktPrior / 100);
  const knnResult = classifyLearnerKNN({
    accuracyNorm: knnAccuracy / 100,
    speedNorm: Math.max(0.1, 1 - (knnSpeedSec / 60)),
    sensorySensitivityNorm: knnSensory / 100,
    focusVolatilityNorm: knnVolatility / 100
  });
  const nbResult = predictFatigueNaiveBayes({
    sessionLengthMinutes: nbSessionMins,
    consecutiveMistakes: nbMistakes,
    responseTimeVariance: nbVariance
  });
  const rlResult = recommendPedagogicalPolicyRL(rlFocusScore);
  const irtResult = evaluateItemResponseTheory(knnAccuracy, irtQuestionDiff);

  return (
    <div id="inspector-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center bg-[#1E293B]/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div 
        id="inspector-modal-card" 
        className="relative w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl border border-[#FF8A00]/20 my-8"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#FF8A00]/15 bg-[#FFF7F3] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#00C896]/15 text-[#00C896]">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-[#1E293B]">Soft Computing & AI/ML Inspector</h3>
              <p className="text-xs text-[#1E293B]/60 font-medium">Live Mathematical Verification & Multi-Algorithm Telemetry</p>
            </div>
          </div>
          <button
            id="close-inspector-btn"
            onClick={onClose}
            className="rounded-full p-2 text-[#1E293B]/50 hover:bg-white hover:text-[#1E293B] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation with Brand Colors */}
        <div className="flex border-b border-[#FF8A00]/15 bg-white px-6 pt-3 gap-2 overflow-x-auto">
          <button
            id="tab-fuzzy"
            onClick={() => setActiveTab('fuzzy')}
            className={`flex items-center gap-2 pb-3 px-3 text-sm font-bold border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'fuzzy'
                ? 'border-[#00C896] text-[#00C896]'
                : 'border-transparent text-[#1E293B]/60 hover:text-[#1E293B]'
            }`}
          >
            <Sliders className="h-4 w-4" />
            1. Fuzzy Logic (FIS)
          </button>
          <button
            id="tab-anfis"
            onClick={() => setActiveTab('anfis')}
            className={`flex items-center gap-2 pb-3 px-3 text-sm font-bold border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'anfis'
                ? 'border-[#FF8A00] text-[#FF8A00]'
                : 'border-transparent text-[#1E293B]/60 hover:text-[#1E293B]'
            }`}
          >
            <Layers className="h-4 w-4" />
            2. ANFIS (Adaptation)
          </button>
          <button
            id="tab-ga"
            onClick={() => setActiveTab('ga')}
            className={`flex items-center gap-2 pb-3 px-3 text-sm font-bold border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'ga'
                ? 'border-[#4D84FE] text-[#4D84FE]'
                : 'border-transparent text-[#1E293B]/60 hover:text-[#1E293B]'
            }`}
          >
            <Binary className="h-4 w-4" />
            3. Genetic Alg (Knapsack)
          </button>
          <button
            id="tab-aiml"
            onClick={() => setActiveTab('aiml')}
            className={`flex items-center gap-2 pb-3 px-3 text-sm font-bold border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'aiml'
                ? 'border-[#00C896] text-[#00C896]'
                : 'border-transparent text-[#1E293B]/60 hover:text-[#1E293B]'
            }`}
          >
            <Brain className="h-4 w-4" />
            4. AI / ML Engine (BKT, KNN, NB, RL, IRT)
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          {activeTab === 'fuzzy' && (
            <div className="space-y-6">
              <div className="rounded-2xl bg-[#FFF7F3] border border-[#FF8A00]/20 p-4">
                <h4 className="text-sm font-bold text-[#1E293B] mb-1">
                  Mamdani Fuzzy Inference System (12 Rules + Centroid CoG Defuzzification)
                </h4>
                <p className="text-xs text-[#1E293B]/70 leading-relaxed">
                  Translates continuous human behaviors (accuracy, latency, affective mood) through triangular & trapezoidal membership functions and computes the Center of Gravity over U = [0, 100].
                </p>
              </div>

              {/* Interactive Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#FFF7F3] p-4 rounded-2xl border border-[#FF8A00]/15">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-[#1E293B] mb-1">
                    <span>Accuracy</span>
                    <span className="text-[#00C896] font-bold">{accuracy}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={accuracy}
                    onChange={(e) => setAccuracy(Number(e.target.value))}
                    className="w-full accent-[#00C896]"
                  />
                  <span className="text-[11px] text-[#1E293B]/50 font-medium">Universe: [0, 100%]</span>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-[#1E293B] mb-1">
                    <span>Avg Response Time</span>
                    <span className="text-[#FF8A00] font-bold">{responseTime}s</span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={60}
                    value={responseTime}
                    onChange={(e) => setResponseTime(Number(e.target.value))}
                    className="w-full accent-[#FF8A00]"
                  />
                  <span className="text-[11px] text-[#1E293B]/50 font-medium">Fast (&lt;30s) gives +20 pts</span>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-[#1E293B] mb-1">
                    <span>Student Mood (1-5)</span>
                    <span className="text-[#4D84FE] font-bold">{mood} / 5</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={mood}
                    onChange={(e) => setMood(Number(e.target.value))}
                    className="w-full accent-[#4D84FE]"
                  />
                  <span className="text-[11px] text-[#1E293B]/50 font-medium">Affective state factor</span>
                </div>
              </div>

              {/* Live Output */}
              <div className="flex items-center justify-between p-5 rounded-2xl bg-white border-2 border-[#00C896]/30 shadow-sm">
                <div>
                  <div className="text-xs text-[#1E293B]/60 font-semibold">Defuzzified Centroid Score (CoG):</div>
                  <div className="text-3xl font-black text-[#00C896] mt-0.5">{liveFocusScore} <span className="text-base font-normal text-[#1E293B]/40">/ 100</span></div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-[#1E293B]/60 font-semibold">Linguistic Fuzzy State:</div>
                  <span className={`inline-block mt-1 px-3.5 py-1 rounded-full text-xs font-bold ${
                    liveFocusScore >= 80 ? 'bg-[#00C896]/15 text-[#00C896] border border-[#00C896]/30' :
                    liveFocusScore >= 65 ? 'bg-[#4D84FE]/15 text-[#4D84FE] border border-[#4D84FE]/30' :
                    liveFocusScore >= 45 ? 'bg-[#FF8A00]/15 text-[#FF8A00] border border-[#FF8A00]/30' :
                    'bg-rose-100 text-rose-800'
                  }`}>
                    {liveFuzzyState}
                  </span>
                </div>
              </div>

              {/* Real Mathematical Code in /src/algorithms/softComputing.ts */}
              <div className="rounded-2xl bg-[#1E293B] text-slate-200 p-5 font-mono text-xs overflow-x-auto shadow-md">
                <div className="text-[#00C896] mb-2 font-bold">// Production Mamdani Fuzzy Inference Engine (softComputing.ts)</div>
                <pre className="text-slate-300 leading-relaxed">{`// 1. Fuzzification with triangular & trapezoidal membership
const accLow = trapezoidalMembership(acc, 0, 0, 25, 50);
const accMed = triangularMembership(acc, 30, 60, 85);
const accHigh = trapezoidalMembership(acc, 70, 85, 100, 100);

// 2. Rule evaluation via Gödel/Mamdani MIN operator
const alpha1 = Math.min(accHigh, rtFast, mdPos); // => VeryHigh Focus
const alpha8 = Math.min(accLow, rtFast);         // => Impulsive/Slip

// 3. Center of Gravity (Centroid) Defuzzification
// Defuzzified Score = sum(x * mu(x)) / sum(mu(x))`}</pre>
              </div>
            </div>
          )}

          {activeTab === 'anfis' && (
            <div className="space-y-6">
              <div className="rounded-2xl bg-[#FFF7F3] border border-[#FF8A00]/20 p-4">
                <h4 className="text-sm font-bold text-[#1E293B] mb-1">
                  Adaptive Neuro-Fuzzy Inference System (ANFIS - 4 Layer Sugeno Controller)
                </h4>
                <p className="text-xs text-[#1E293B]/70 leading-relaxed">
                  Evaluates normalized premise weights w_i and applies first-order linear polynomial consequents (z_i = a*focus + b*dyslexia + c*sensory + d) to synthesize ergonomic font size and spacing.
                </p>
              </div>

              {/* Controls */}
              <div className="space-y-4 bg-[#FFF7F3] p-4 rounded-2xl border border-[#FF8A00]/15">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-[#1E293B] mb-1">
                    <span>Simulated Student Focus Score</span>
                    <span className="text-[#FF8A00] font-bold">{simFocusScore} / 100</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={100}
                    value={simFocusScore}
                    onChange={(e) => setSimFocusScore(Number(e.target.value))}
                    className="w-full accent-[#FF8A00]"
                  />
                  <div className="flex justify-between text-[11px] text-[#1E293B]/50 font-medium">
                    <span>&lt; 50 (Low Focus)</span>
                    <span>50 - 74 (Moderate)</span>
                    <span>≥ 75 (High Focus)</span>
                  </div>
                </div>

                <div className="flex gap-4 pt-2">
                  <label className="flex items-center gap-2 text-xs font-bold text-[#1E293B] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasDyslexia}
                      onChange={(e) => setHasDyslexia(e.target.checked)}
                      className="rounded accent-[#FF8A00]"
                    />
                    Student Diagnosed with Dyslexia
                  </label>
                  <label className="flex items-center gap-2 text-xs font-bold text-[#1E293B] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasADHD}
                      onChange={(e) => setHasADHD(e.target.checked)}
                      className="rounded accent-[#FF8A00]"
                    />
                    Student Diagnosed with ADHD
                  </label>
                </div>
              </div>

              {/* Triggered Config */}
              <div className="rounded-2xl border border-[#FF8A00]/15 p-5 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1E293B]/60 uppercase tracking-wider">Active ANFIS Parameters</span>
                  <span className="text-xs px-3 py-1 rounded-full bg-[#00C896]/15 text-[#00C896] font-bold">
                    {anfisConfig.ruleTriggered}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-[#FFF7F3] p-3 rounded-xl border border-[#FF8A00]/15">
                    <div className="text-xs text-[#1E293B]/60 font-semibold">Font Size</div>
                    <div className="text-lg font-black text-[#1E293B]">{anfisConfig.fontSize}</div>
                  </div>
                  <div className="bg-[#FFF7F3] p-3 rounded-xl border border-[#FF8A00]/15">
                    <div className="text-xs text-[#1E293B]/60 font-semibold">Line Spacing</div>
                    <div className="text-lg font-black text-[#1E293B]">{anfisConfig.lineSpacing}x</div>
                  </div>
                  <div className="bg-[#FFF7F3] p-3 rounded-xl border border-[#FF8A00]/15">
                    <div className="text-xs text-[#1E293B]/60 font-semibold">Visual Theme</div>
                    <div className="text-lg font-black text-[#1E293B] capitalize">{anfisConfig.theme}</div>
                  </div>
                </div>

                <div className="rounded-xl bg-[#FFF7F3] p-3.5 border border-[#FF8A00]/20 text-xs text-[#1E293B]/80">
                  <strong className="text-[#1E293B]">Adaptive Rationale: </strong>
                  {anfisConfig.reason}
                </div>
              </div>

              {/* Real Mathematical Code in softComputing.ts */}
              <div className="rounded-2xl bg-[#1E293B] text-slate-200 p-5 font-mono text-xs overflow-x-auto shadow-md">
                <div className="text-[#FF8A00] mb-2 font-bold">// 4-Layer Sugeno Neuro-Fuzzy Layer (softComputing.ts)</div>
                <pre className="text-slate-300 leading-relaxed">{`// Layer 3: Normalized weights w_bar_i = w_i / sum(w_k)
const nw1 = w1 / sumWeights;
const nw2 = w2 / sumWeights;
const nw3 = w3 / sumWeights;

// Layer 4: First-order polynomial consequents
const zFont = nw1*(-0.02*focus + 1.2*dyslexia + 18.2) + nw2*(...) + nw3*(...);
// Output synthesized continuously without hardcoded branching`}</pre>
              </div>
            </div>
          )}

          {activeTab === 'ga' && (
            <div className="space-y-6">
              <div className="rounded-2xl bg-[#FFF7F3] border border-[#FF8A00]/20 p-4">
                <h4 className="text-sm font-bold text-[#1E293B] mb-1">
                  Genetic Algorithm (GA) Lesson Sequencing & Attention Knapsack
                </h4>
                <p className="text-xs text-[#1E293B]/70 leading-relaxed">
                  Solves a constrained combinatorial knapsack problem: executes 75 generations with tournament selection, 1-point crossover, and elitism to maximize engagement without exceeding the student's daily attention limit.
                </p>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-[#1E293B] mb-1">
                  <span>Student Attention Span Budget</span>
                  <span className="text-[#4D84FE] font-black">{attentionSpanBudget} minutes</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={45}
                  value={attentionSpanBudget}
                  onChange={(e) => setAttentionSpanBudget(Number(e.target.value))}
                  className="w-full accent-[#4D84FE]"
                />
                <div className="flex justify-between text-[11px] text-[#1E293B]/50 font-medium">
                  <span>10m (High Fatigue)</span>
                  <span>25m (Standard)</span>
                  <span>45m (Extended)</span>
                </div>
              </div>

              {/* Selected chromosome / activities */}
              <div className="rounded-2xl border border-[#FF8A00]/15 p-5 bg-white space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#1E293B]">GA Converged Chromosome Output</span>
                  <span className="text-[#1E293B]/60 font-semibold">
                    Total Time: <strong className="text-[#4D84FE] font-black">{gaTotalDuration}m</strong> / {attentionSpanBudget}m budget
                  </span>
                </div>

                <div className="space-y-2">
                  {gaSelectedActivities.map((act, index) => (
                    <div key={act.id} className="flex items-center justify-between p-3 rounded-xl bg-[#FFF7F3] border border-[#FF8A00]/15 text-xs">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#4D84FE] text-white font-bold text-[10px]">
                          {index + 1}
                        </span>
                        <span className="font-bold text-[#1E293B]">{act.title}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[#1E293B]/60 font-medium">{act.duration} mins</span>
                        <span className="px-2.5 py-0.5 rounded-full bg-[#00C896]/15 text-[#00C896] font-bold text-[11px]">
                          Fitness: {act.engagement}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Real GA Code in softComputing.ts */}
              <div className="rounded-2xl bg-[#1E293B] text-slate-200 p-5 font-mono text-xs overflow-x-auto shadow-md">
                <div className="text-[#4D84FE] mb-2 font-bold">// Knapsack Evolutionary Algorithm (softComputing.ts)</div>
                <pre className="text-slate-300 leading-relaxed">{`// Binary chromosomes evolving over 75 generations
const [childA, childB] = crossover(parent1, parent2, rate=0.82);
const mutatedA = mutate(childA, rate=0.05);

// Knapsack Constraint Repair: Removes lowest (engagement/duration) items
const repaired = repairChromosome(mutatedA, activities, attentionBudget);`}</pre>
              </div>
            </div>
          )}

          {activeTab === 'aiml' && (
            <div className="space-y-6">
              {/* Header Banner */}
              <div className="rounded-2xl bg-[#FFF7F3] border border-[#00C896]/20 p-4">
                <div className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-[#00C896]" />
                  <h4 className="text-sm font-extrabold text-[#1E293B]">
                    Dedicated AI / Machine Learning Engine (/src/algorithms/aiMlEngine.ts)
                  </h4>
                </div>
                <p className="text-xs text-[#1E293B]/70 leading-relaxed mt-1">
                  Decoupled machine learning models engineered specifically for adaptive neurodivergent education: Bayesian Knowledge Tracing (BKT), K-Nearest Neighbors (KNN) clustering, Naive Bayes fatigue estimation, Reinforcement Learning (Q-Learning policy), and Item Response Theory (IRT).
                </p>
              </div>

              {/* 1. BKT Bayesian Knowledge Tracing */}
              <div className="rounded-2xl border border-[#FF8A00]/15 p-5 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#00C896] text-white font-bold text-xs">
                      1
                    </span>
                    <h5 className="text-sm font-bold text-[#1E293B]">Bayesian Knowledge Tracing (BKT)</h5>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-bold ${
                    bktResult.masteryLevel === 'Mastered' ? 'bg-[#00C896]/15 text-[#00C896]' :
                    bktResult.masteryLevel === 'Proficient' ? 'bg-[#4D84FE]/15 text-[#4D84FE]' :
                    'bg-[#FF8A00]/15 text-[#FF8A00]'
                  }`}>
                    {bktResult.masteryLevel} ({bktResult.masteryConfidencePct}%)
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#FFF7F3] p-4 rounded-xl border border-[#FF8A00]/15 text-xs">
                  <div>
                    <div className="flex justify-between font-semibold text-[#1E293B] mb-1">
                      <span>Prior Skill Mastery P(L₀)</span>
                      <span className="text-[#00C896] font-bold">{bktPrior}%</span>
                    </div>
                    <input
                      type="range"
                      min={5}
                      max={95}
                      value={bktPrior}
                      onChange={(e) => setBktPrior(Number(e.target.value))}
                      className="w-full accent-[#00C896]"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#1E293B]">Observed Answer:</span>
                    <button
                      onClick={() => setBktObservedCorrect(!bktObservedCorrect)}
                      className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                        bktObservedCorrect
                          ? 'bg-[#00C896] text-white'
                          : 'bg-rose-500 text-white'
                      }`}
                    >
                      {bktObservedCorrect ? 'Correct Answer' : 'Incorrect (Slip)'}
                    </button>
                  </div>
                </div>

                <div className="text-xs text-[#1E293B]/70 bg-white p-3 rounded-xl border border-[#FF8A00]/10 font-mono">
                  Posterior P(L): <strong className="text-[#00C896] font-bold">{(bktResult.posteriorMastery * 100).toFixed(1)}%</strong> • Projected P(L+1): <strong className="text-[#4D84FE] font-bold">{(bktResult.nextItemMastery * 100).toFixed(1)}%</strong>
                </div>
              </div>

              {/* 2. KNN Clustering */}
              <div className="rounded-2xl border border-[#FF8A00]/15 p-5 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#4D84FE] text-white font-bold text-xs">
                      2
                    </span>
                    <h5 className="text-sm font-bold text-[#1E293B]">KNN Learner Archetype Clustering (K=3)</h5>
                  </div>
                  <span className="text-xs px-3 py-1 rounded-full font-bold bg-[#4D84FE]/15 text-[#4D84FE]">
                    {knnResult.predictedArchetype}
                  </span>
                </div>
                <p className="text-xs text-[#1E293B]/70">
                  {knnResult.recommendedModality} (Confidence: <strong>{knnResult.confidencePct}%</strong>)
                </p>
              </div>

              {/* 3. Naive Bayes Fatigue */}
              <div className="rounded-2xl border border-[#FF8A00]/15 p-5 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#FF8A00] text-white font-bold text-xs">
                      3
                    </span>
                    <h5 className="text-sm font-bold text-[#1E293B]">Naive Bayes Fatigue Predictor</h5>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-bold ${
                    nbResult.alertNeeded ? 'bg-rose-100 text-rose-800' : 'bg-[#00C896]/15 text-[#00C896]'
                  }`}>
                    {nbResult.alertNeeded ? 'Decompression Needed' : 'Cognitive Load Balanced'}
                  </span>
                </div>
                <div className="text-xs text-[#1E293B]/70">
                  Posterior Fatigue Probability: <strong className="text-[#FF8A00] font-bold">{nbResult.fatigueProbabilityPct}%</strong> (Threshold: 65%)
                </div>
              </div>

              {/* 4. Reinforcement Learning */}
              <div className="rounded-2xl border border-[#FF8A00]/15 p-5 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#1E293B] text-white font-bold text-xs">
                      4
                    </span>
                    <h5 className="text-sm font-bold text-[#1E293B]">Q-Learning Pedagogical Policy Agent</h5>
                  </div>
                  <span className="text-xs px-3 py-1 rounded-full font-bold bg-[#00C896]/15 text-[#00C896]">
                    Action: {rlResult.recommendedAction}
                  </span>
                </div>
                <div className="text-xs text-[#1E293B]/70">
                  Selected via Softmax Policy Exploitation (Confidence: <strong>{rlResult.actionConfidencePct}%</strong>)
                </div>
              </div>

              {/* 5. IRT Item Response Theory */}
              <div className="rounded-2xl border border-[#FF8A00]/15 p-5 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#FF8A00] text-white font-bold text-xs">
                      5
                    </span>
                    <h5 className="text-sm font-bold text-[#1E293B]">Item Response Theory (1-Parameter Rasch)</h5>
                  </div>
                  <span className="text-xs px-3 py-1 rounded-full font-bold bg-[#4D84FE]/15 text-[#4D84FE]">
                    ZPD: {irtResult.zpdStatus}
                  </span>
                </div>
                <div className="text-xs text-[#1E293B]/70">
                  Success Probability P(θ, b): <strong className="text-[#4D84FE] font-bold">{irtResult.predictedSuccessProbability}%</strong> (Optimal Target: ~70–75%)
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-[#FF8A00]/15 bg-[#FFF7F3] px-6 py-4">
          <div className="flex items-center gap-2 text-xs font-bold text-[#00C896]">
            <CheckCircle2 className="h-4 w-4" />
            <span>Mamdani FIS • 4-Layer Sugeno ANFIS • Genetic Knapsack • Full Edge AI/ML Active</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-2xl bg-[#1E293B] hover:bg-[#0F172A] px-5 py-2.5 text-xs font-bold text-white transition-all shadow-md"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
