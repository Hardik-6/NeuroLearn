import React from 'react';
import {
  ArrowRight,
  CheckCircle,
  Coffee,
  Sparkles,
  FileCheck,
  Smile,
  MessageSquare,
  CheckCircle2,
  Mic,
  Video
} from 'lucide-react';
import { StudentProfile, StudentSubmission } from '../types';
import { getFuzzyState } from '../algorithms/softComputing';

interface StudentDashboardProps {
  student: StudentProfile;
  submissions?: StudentSubmission[];
  onNavigateToLesson: () => void;
  onOpenBreakModal: () => void;
  onUpdateFocusScore?: (newScore: number) => void;
  onOpenInspector?: () => void;
  onNavigateToSubmission?: () => void;
  completedLessonsCount?: number;
  quizAverage?: number;
  currentLessonTitle?: string;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  student,
  submissions = [],
  onNavigateToLesson,
  onOpenBreakModal,
  onNavigateToSubmission,
  completedLessonsCount = 0,
  quizAverage = 0,
}) => {
  const score = student.currentFocusScore ?? 0;
  const fuzzyState = getFuzzyState(score);
  const needsBreak = score > 0 && score < 45;

  // SVG Circular Meter Calculations matching original animated component
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Dynamic color matching our new brand theme with animated transitions
  const strokeColor =
    score >= 75
      ? '#00C896' // Vibrant Mint
      : score >= 50
      ? '#4D84FE' // Action Blue
      : score >= 35
      ? '#FF8A00' // Warm Orange
      : score > 0
      ? '#FF8A00'
      : '#00C896';

  const badgeBg =
    score >= 65
      ? 'bg-[#00C896]/10 text-[#00C896] border border-[#00C896]/20'
      : score >= 45
      ? 'bg-[#4D84FE]/10 text-[#4D84FE] border border-[#4D84FE]/20'
      : 'bg-[#FF8A00]/10 text-[#FF8A00] border border-[#FF8A00]/20';

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Top Welcome & Diagnostic Banner with Playful Warm Graphic Shapes */}
      <div className="card-warm p-6 sm:p-8 relative overflow-hidden bg-white border border-[#FF8A00]/15">
        {/* Decorative organic background shapes */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-[#FFF7F3] border border-[#FF8A00]/10 pointer-events-none" />
        <div className="absolute top-1/2 -right-6 w-24 h-24 rounded-full bg-[#00C896]/10 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF8A00]/10 border border-[#FF8A00]/20 text-[#FF8A00] text-xs font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#FF8A00] animate-pulse" />
              <span>Personalized Neuro-Report</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1E293B] tracking-tight">
              Adaptive Learning Journey for {student.name}
            </h1>
          </div>

          {/* Interactive Accommodation Badges */}
          <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
            {student.diagnoses.map((d) => (
              <span
                key={d}
                className="px-3.5 py-1.5 rounded-full bg-[#00C896]/10 border border-[#00C896]/20 text-[#00C896] text-xs font-bold flex items-center gap-1.5 shadow-2xs"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#00C896]" />
                {d} Optimized
              </span>
            ))}
            <span className="px-3.5 py-1.5 rounded-full bg-[#4D84FE]/10 border border-[#4D84FE]/20 text-[#4D84FE] text-xs font-bold flex items-center gap-1.5">
              <span>{student.attentionSpanMinutes}m Attention Knapsack</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: 8 Columns left, 4 Columns right */}
      <div className="grid grid-cols-12 gap-8">
        {/* Left Column (8 cols on lg screens) */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          {/* Animated Circular Focus Meter Card (Restored with Brand Colors #00C896, #FF8A00, #4D84FE) */}
          <div className="card-warm p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-8 bg-white border border-[#FF8A00]/15">
            <div className="relative w-36 h-36 shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 136 136">
                <circle
                  cx="68"
                  cy="68"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="10"
                  fill="transparent"
                  className="text-[#FFF7F3]"
                />
                <circle
                  cx="68"
                  cy="68"
                  r={radius}
                  stroke={strokeColor}
                  strokeWidth="10"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-[#1E293B]">{score}%</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#1E293B]/40">
                  Attention
                </span>
              </div>
            </div>

            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${badgeBg}`}>
                  {fuzzyState}
                </span>
                <span className="text-xs font-semibold text-[#1E293B]/50">
                  {score > 0 ? `${score}% Calibrated` : 'Baseline: 0%'}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-[#1E293B] mb-2">
                {score >= 75
                  ? 'Optimal concentration state'
                  : score >= 45
                  ? 'Steady attention state'
                  : score > 0
                  ? 'Building steady attention'
                  : 'Steady attention state (0%)'}
              </h2>
              <p className="text-[#1E293B]/70 text-sm mb-5 leading-relaxed">
                {score === 0
                  ? `Your steady attention begins at 0% and automatically improves as you complete lessons, read chapters, and take quizzes.`
                  : score >= 65
                  ? `Your steady attention is high (${score}%). Content presentation is clear, structured, and optimized for deep comprehension.`
                  : `Your steady attention is currently ${score}%. The adaptive system automatically adjusts formatting and spacing as you progress.`}
              </p>

              <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                <button
                  id="start-lesson-btn"
                  onClick={onNavigateToLesson}
                  className="bg-[#4D84FE] text-white px-6 py-3 rounded-2xl text-sm font-bold hover:bg-[#3B72EE] transition-all shadow-md shadow-[#4D84FE]/20 flex items-center gap-2 hover:scale-[1.02]"
                >
                  <span>Start Lesson</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  id="quiz-me-btn"
                  onClick={onNavigateToLesson}
                  className="border border-[#FF8A00]/25 text-[#1E293B] px-6 py-3 rounded-2xl text-sm font-bold hover:bg-[#FFF7F3] transition-all"
                >
                  Quiz Me
                </button>
              </div>
            </div>
          </div>

          {/* Active Adaptive Lesson Card with warm coral and mint CTAs */}
          <div className="card-warm p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#FF8A00]/10 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#FF8A00]">
                  Genetic Algorithm Schedule #1
                </span>
                <h2 className="text-xl font-bold text-[#1E293B] mt-0.5">
                  Today's Recommended Lesson
                </h2>
              </div>
              <span className="self-start sm:self-center px-3 py-1 rounded-full bg-[#00C896]/10 text-[#00C896] text-xs font-bold">
                Science • 15 Mins
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 p-5 rounded-2xl bg-[#FFF7F3] border border-[#FF8A00]/15">
              <div className="h-32 w-32 sm:h-28 sm:w-28 shrink-0 rounded-2xl overflow-hidden shadow-xs relative">
                <img
                  src="https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=300&auto=format&fit=crop&q=80"
                  alt="Planets and solar system"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1E293B]/70 to-transparent flex items-end p-2">
                  <span className="text-[10px] text-white font-bold uppercase tracking-wider">
                    Cosmos
                  </span>
                </div>
              </div>

              <div className="flex-1 text-center sm:text-left space-y-1.5">
                <h3 className="text-lg font-extrabold text-[#1E293B] leading-snug">
                  The Solar System & Planetary Orbits
                </h3>
                <p className="text-xs text-[#1E293B]/70 line-clamp-2 leading-relaxed">
                  Explore terrestrial worlds, giant gas planets, asteroid belts, and gravity wells with adaptive reading rulers and chunked key concepts.
                </p>
                <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                  <span className="px-2.5 py-0.5 rounded-md bg-white border border-[#FF8A00]/15 text-[11px] font-semibold text-[#1E293B]/70">
                    4 Sections
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md bg-white border border-[#FF8A00]/15 text-[11px] font-semibold text-[#1E293B]/70">
                    Video + Slides
                  </span>
                </div>
              </div>

              {/* Action Blue CTA button */}
              <button
                id="continue-lesson-btn"
                onClick={onNavigateToLesson}
                className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 rounded-2xl bg-[#4D84FE] px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-[#4D84FE]/25 hover:bg-[#3B72EE] transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Start Lesson</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {/* ANFIS live styling indicator */}
            <div className="rounded-2xl bg-white p-4 border border-[#00C896]/20 flex items-center justify-between text-xs text-[#1E293B]">
              <span className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-[#00C896]/10 text-[#00C896] flex items-center justify-center">
                  <Sparkles className="h-4 w-4" />
                </div>
                <span>
                  ANFIS typography and contrast actively tuned for <strong>{student.diagnoses.join(' + ')}</strong>
                </span>
              </span>
              <button
                onClick={onNavigateToLesson}
                className="text-[#FF8A00] font-bold hover:underline"
              >
                Preview Layout →
              </button>
            </div>
          </div>

          {/* Teacher Suggestion & Feedback Received Alert */}
          {(() => {
            const reviewedSubmissions = submissions.filter(
              (s) =>
                (s.studentId === student.id || s.studentName === student.name) &&
                s.teacherFeedback &&
                s.teacherFeedback.status === 'reviewed'
            );
            const latest = reviewedSubmissions[0];
            if (!latest) return null;

            return (
              <div className="card-warm p-6 border-l-4 border-l-[#00C896] bg-gradient-to-r from-[#FFF7F3] via-white to-white space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#00C896] text-white flex items-center justify-center font-bold">
                      ✓
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#1E293B] block">
                        New Teacher Suggestion from {latest.teacherFeedback?.teacherName || 'Ms. Priya'}
                      </span>
                      <span className="text-[11px] text-[#1E293B]/60">
                        On your {latest.mode === 'audio' ? 'Voice Recording' : 'Video Walkthrough'} for "{latest.lessonTitle}"
                      </span>
                    </div>
                  </div>
                  {onNavigateToSubmission && (
                    <button
                      onClick={onNavigateToSubmission}
                      className="text-xs font-bold text-[#4D84FE] hover:underline flex items-center gap-1"
                    >
                      <span>View Suggestions</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-[#FF8A00]/20 text-xs text-[#1E293B] leading-relaxed font-medium">
                  "{latest.teacherFeedback?.suggestion}"
                </div>

                {latest.teacherFeedback?.strengths && (
                  <p className="text-xs text-emerald-800">
                    <strong className="text-emerald-900">Recognized Strengths:</strong> {latest.teacherFeedback.strengths}
                  </p>
                )}
              </div>
            );
          })()}

          {/* Multi-Modal Assignment Submission Card */}
          <div className="card-warm p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 border-l-4 border-l-[#00C896]">
            <div className="flex items-start gap-5">
              <div className="w-14 h-14 rounded-2xl bg-[#00C896]/10 border border-[#00C896]/20 flex items-center justify-center text-[#00C896] shrink-0 shadow-xs">
                <FileCheck className="w-7 h-7" />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#00C896] bg-[#00C896]/10 px-2.5 py-0.5 rounded-full">
                    Inclusive Assessment
                  </span>
                  <span className="text-xs text-[#1E293B]/50 font-medium">Spoken · Audio · Visual</span>
                </div>
                <h4 className="text-lg font-bold text-[#1E293B]">Multi-Modal Assignment Submission</h4>
                <p className="text-xs text-[#1E293B]/70 max-w-xl leading-relaxed">
                  Overcome writing paralysis: explain concepts through live microphone voice recording, upload video presentations, or submit visual mind maps.
                </p>
              </div>
            </div>

            {/* Vibrant Mint CTA button */}
            <button
              id="dashboard-submission-shortcut-btn"
              onClick={onNavigateToSubmission}
              className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 rounded-2xl bg-[#00C896] px-6 py-3.5 text-xs font-bold text-white shadow-md shadow-[#00C896]/25 hover:bg-[#00B285] transition-all hover:scale-[1.02]"
            >
              <span>Submit Work</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Sensory Breather Warm Orange Card */}
          <div className="card-warm p-6 sm:p-8 bg-gradient-to-r from-[#FFF7F3] to-[#FFF0E8] border border-[#FF8A00]/25 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-5">
              <div className="w-12 h-12 bg-[#FF8A00]/15 border border-[#FF8A00]/25 rounded-2xl flex items-center justify-center text-[#FF8A00] shrink-0 shadow-2xs">
                <Coffee className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-[#1E293B] text-base">Sensory Breather & Reset</h3>
                <p className="text-[#1E293B]/70 text-xs mt-1 leading-relaxed">
                  {needsBreak
                    ? `Adaptive sensor indicates cognitive overload (${score}/100). Take a 3-minute sensory decompression pause.`
                    : 'Pacing is balanced. Take an optional mindful breathing exercise anytime to refresh your mental focus.'}
                </p>
              </div>
            </div>
            <button
              id="take-a-rest-btn"
              onClick={onOpenBreakModal}
              className="shrink-0 bg-[#FF8A00] hover:bg-[#E67D00] text-white px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-[#FF8A00]/25 flex items-center justify-center gap-2 hover:scale-[1.02]"
            >
              <Smile className="h-4 w-4" />
              <span>{needsBreak ? 'Take Rest' : 'Mindful Breather'}</span>
            </button>
          </div>
        </div>

        {/* Right Column (4 cols on lg screens) */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* Personalized Goals Card */}
          <div className="card-warm p-6 space-y-5">
            <h3 className="font-bold text-[#1E293B] text-base">Daily Personalized Goals</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1.5 font-semibold text-[#1E293B]">
                  <span className="text-[#1E293B]/60">Daily Reading</span>
                  <span className="text-[#FF8A00]">8 / 10 mins</span>
                </div>
                <div className="w-full bg-[#FFF7F3] h-2.5 rounded-full overflow-hidden p-0.5 border border-[#FF8A00]/10">
                  <div className="bg-[#FF8A00] h-full rounded-full transition-all" style={{ width: '80%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5 font-semibold text-[#1E293B]">
                  <span className="text-[#1E293B]/60">Quiz Accuracy</span>
                  <span className="text-[#00C896]">92%</span>
                </div>
                <div className="w-full bg-[#FFF7F3] h-2.5 rounded-full overflow-hidden p-0.5 border border-[#FF8A00]/10">
                  <div className="bg-[#00C896] h-full rounded-full transition-all" style={{ width: '92%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5 font-semibold text-[#1E293B]">
                  <span className="text-[#1E293B]/60">Attention Span Knapsack</span>
                  <span className="text-[#4D84FE]">{student.attentionSpanMinutes} mins</span>
                </div>
                <div className="w-full bg-[#FFF7F3] h-2.5 rounded-full overflow-hidden p-0.5 border border-[#FF8A00]/10">
                  <div className="bg-[#4D84FE] h-full rounded-full transition-all" style={{ width: '75%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Pill Summary */}
          <div className="card-warm p-6 flex items-center justify-between border-t-4 border-t-[#4D84FE]">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#1E293B]/50">
                Course Progress
              </span>
              <div className="flex items-baseline gap-6 mt-2">
                <div>
                  <span className="text-2xl font-black text-[#1E293B]">
                    {completedLessonsCount ?? 0}
                  </span>
                  <span className="text-[11px] font-semibold text-[#1E293B]/50 block">Lessons Done</span>
                </div>
                <div>
                  <span className="text-2xl font-black text-[#00C896]">
                    {quizAverage ?? 0}%
                  </span>
                  <span className="text-[11px] font-semibold text-[#1E293B]/50 block">Accuracy</span>
                </div>
              </div>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-[#00C896]/10 text-[#00C896] flex items-center justify-center">
              <CheckCircle className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
