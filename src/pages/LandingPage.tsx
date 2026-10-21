import React from 'react';
import {
  Brain,
  Layers,
  Clock,
  LayoutDashboard,
  ArrowRight,
  CheckCircle2,
  Activity,
  Compass,
  HeartHandshake
} from 'lucide-react';
import { Role } from '../types';

interface LandingPageProps {
  onGetStarted: (role: Role) => void;
  onOpenInspector?: () => void;
  onOpenPresentation?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-900 flex flex-col justify-between">
      {/* Landing Navigation Header */}
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-30 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
              <Brain className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900 block leading-none">
                Neuro<span className="text-indigo-600">Learn</span>
              </span>
              <span className="text-xs text-slate-500 font-medium">Adaptive Learning Platform</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <nav className="flex items-center gap-6 text-sm font-medium text-slate-600">
              <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
              <button
                id="landing-header-dashboard-btn"
                onClick={() => onGetStarted('student')}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors"
              >
                Go to Dashboard
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
              Personalized learning <br />
              <span className="text-indigo-600">for every mind</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
              NeuroLearn adapts to the unique needs of neurodivergent students (ADHD, autism, dyslexia) to create a calmer, intuitive, and highly supportive learning experience.
            </p>

            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <button
                id="hero-get-started-btn"
                onClick={() => onGetStarted('student')}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-base font-semibold text-white shadow-md hover:bg-indigo-700 transition-all hover:translate-x-0.5"
              >
                <span>Launch Student Workspace</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center gap-6 pt-4 text-xs font-medium text-slate-500">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Sensory-friendly UI
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Cognitive break alerts
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Multi-modal submissions
              </span>
            </div>
          </div>

          {/* Hero Visual Card / Interactive Preview */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl bg-white p-6 shadow-xl border border-slate-200/80 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                    RS
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-800">Riya Sen (Age 12)</h2>
                    <p className="text-xs text-indigo-600 font-medium">ADHD + Dyslexia Profile</p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                  Focus: 78%
                </span>
              </div>

              {/* Dynamic visual preview */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Soft Computing Real-time Controller</span>
                  <span className="font-mono text-indigo-600">ANFIS Rule #2</span>
                </div>
                <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 space-y-2">
                  <div className="text-xs font-bold text-slate-700">Adaptive Presentation Active:</div>
                  <p className="text-xs text-slate-600 leading-relaxed font-sans">
                    "Enlarged 16px font with 1.6x line spacing to reduce visual crowding for dyslexia accommodation."
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1 text-center">
                <div className="rounded-xl bg-indigo-50/80 p-3 border border-indigo-100">
                  <div className="text-[11px] text-slate-500 font-medium">Attention Budget</div>
                  <div className="text-base font-bold text-indigo-900 mt-0.5">25 Mins (GA)</div>
                </div>
                <div className="rounded-xl bg-emerald-50/80 p-3 border border-emerald-100">
                  <div className="text-[11px] text-slate-500 font-medium">Fuzzy State</div>
                  <div className="text-base font-bold text-emerald-800 mt-0.5">Good Focus</div>
                </div>
              </div>

              <button
                onClick={() => onGetStarted('student')}
                className="w-full rounded-xl bg-slate-900 py-3 text-center text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
              >
                Launch Student Workspace Preview →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Feature Highlights matching panel 1 in user's image */}
      <section id="features" className="py-16 px-6 bg-white border-y border-slate-200/80">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Built for diverse cognitive styles
            </h2>
            <p className="text-sm text-slate-600">
              Transforming standardized classroom materials into adaptive, sensory-friendly pathways.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="rounded-xl bg-slate-50/80 border border-slate-200 p-6 space-y-3 hover:border-indigo-300 transition-colors">
              <div className="h-10 w-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <Layers className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Adaptive content</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Adjusts to your learning style and needs. Dynamically tunes font sizes, spacing, and contrast.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-xl bg-slate-50/80 border border-slate-200 p-6 space-y-3 hover:border-indigo-300 transition-colors">
              <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Compass className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Smart lesson sequencing</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Picks the right order for better results. Utilizes genetic algorithms to fit within attention span limits.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-xl bg-slate-50/80 border border-slate-200 p-6 space-y-3 hover:border-indigo-300 transition-colors">
              <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <Activity className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Real-time focus monitoring</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tracks attention & suggests breaks. Uses fuzzy logic to spot fatigue and offer calming respites.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="rounded-xl bg-slate-50/80 border border-slate-200 p-6 space-y-3 hover:border-indigo-300 transition-colors">
              <div className="h-10 w-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <LayoutDashboard className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Teacher dashboard</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Helps teachers support each student effectively with class engagement analytics and fuzzy status flags.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to action footer banner */}
      <section className="pb-16 px-6">
        <div className="max-w-6xl mx-auto rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 p-8 sm:p-12 text-white text-center shadow-lg space-y-6">
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight">
            Start your personalized learning journey today!
          </h2>
          <p className="text-indigo-100 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            Experience the next era of neuro-adaptive education. Designed for ADHD, Autism, Dyslexia, and unique minds everywhere.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              id="footer-cta-btn"
              onClick={() => onGetStarted('student')}
              className="rounded-xl bg-white px-6 py-3 text-sm font-bold text-indigo-700 shadow-md hover:bg-slate-100 transition-colors"
            >
              Open Student Dashboard →
            </button>
            <button
              onClick={() => onGetStarted('teacher')}
              className="rounded-xl border border-indigo-300/60 bg-indigo-800/40 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-800/60 transition-colors"
            >
              Open Teacher Dashboard
            </button>
          </div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 px-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-indigo-600" />
            <span className="font-semibold text-slate-700">NeuroLearn</span>
          </div>
          <div>Adaptive Learning Platform</div>
        </div>
      </footer>
    </div>
  );
};
