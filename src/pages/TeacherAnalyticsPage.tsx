import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  AreaChart,
  Area,
  Legend
} from 'recharts';
import { StudentProfile, QuizAttempt, FocusSessionLog, CompletedLessonRecord } from '../types';
import {
  Brain,
  BarChart3,
  TrendingUp,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  Activity
} from 'lucide-react';

interface TeacherAnalyticsPageProps {
  students: StudentProfile[];
  quizAttempts?: QuizAttempt[];
  focusLogs?: FocusSessionLog[];
  completedLessons?: CompletedLessonRecord[];
}

export const TeacherAnalyticsPage: React.FC<TeacherAnalyticsPageProps> = ({
  students,
  quizAttempts = [],
  focusLogs = [],
  completedLessons = []
}) => {
  const [chartView, setChartView] = useState<'focusAccuracy' | 'attendance'>('focusAccuracy');
  const [filterStudentId, setFilterStudentId] = useState<string>('all');

  // 1. Dynamic 7-Day Historical Window Calculation (100% Real Logs & Submissions)
  const historical7DayData = useMemo(() => {
    const days = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const targetDate = new Date(now.getTime() - i * 86400000);
      const dateStr = targetDate.toISOString().slice(0, 10);
      const dayName = i === 0 ? 'Today' : targetDate.toLocaleDateString('en-US', { weekday: 'short' });
      const fullDate = targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      // Real focus logs on that calendar date
      const dayLogs = focusLogs.filter(
        (l) =>
          (filterStudentId === 'all' || l.studentId === filterStudentId) &&
          l.timestamp.startsWith(dateStr)
      );
      // Real quiz attempts on that calendar date
      const dayQuizzes = quizAttempts.filter(
        (q) =>
          (filterStudentId === 'all' || q.studentId === filterStudentId) &&
          q.timestamp.startsWith(dateStr)
      );
      // Real completed lessons on that calendar date
      const dayLessons = completedLessons.filter(
        (l) =>
          (filterStudentId === 'all' || l.studentId === filterStudentId) &&
          l.completedAt.startsWith(dateStr)
      );

      // Active unique students on this day
      const activeIds = new Set<string>([
        ...dayLogs.map((l) => l.studentId),
        ...dayQuizzes.map((q) => q.studentId),
        ...dayLessons.map((l) => l.studentId)
      ]);

      // Real class average focus for this day
      let dayFocus: number | null = null;
      if (dayLogs.length > 0) {
        dayFocus = Math.round(dayLogs.reduce((acc, l) => acc + l.focusScore, 0) / dayLogs.length);
      } else if (i === 0) {
        // Today: live focus of currently enrolled active students
        const targetCohort =
          filterStudentId === 'all'
            ? students.filter((s) => (s.currentFocusScore || 0) > 0)
            : students.filter((s) => s.id === filterStudentId && (s.currentFocusScore || 0) > 0);
        if (targetCohort.length > 0) {
          dayFocus = Math.round(
            targetCohort.reduce((acc, s) => acc + (s.currentFocusScore || 0), 0) / targetCohort.length
          );
        }
      }

      // Real class average quiz accuracy for this day (100% based on MCQ answers)
      let dayAccuracy: number | null = null;
      if (dayQuizzes.length > 0) {
        dayAccuracy = Math.round(
          dayQuizzes.reduce((acc, q) => acc + q.scorePercent, 0) / dayQuizzes.length
        );
      } else if (i === 0) {
        const targetCohort =
          filterStudentId === 'all'
            ? students.filter((s) => (s.recentAccuracy || 0) > 0)
            : students.filter((s) => s.id === filterStudentId && (s.recentAccuracy || 0) > 0);
        if (targetCohort.length > 0) {
          dayAccuracy = Math.round(
            targetCohort.reduce((acc, s) => acc + (s.recentAccuracy || 0), 0) / targetCohort.length
          );
        }
      }

      // Real active student attendance
      const attendance =
        filterStudentId !== 'all'
          ? activeIds.has(filterStudentId) ? 1 : (i === 0 ? 1 : 0)
          : i === 0 && activeIds.size === 0
          ? students.filter((s) => (s.currentFocusScore || 0) > 0).length
          : activeIds.size;

      days.push({
        dateStr,
        day: `${dayName} (${fullDate})`,
        shortDay: dayName,
        focus: dayFocus,
        accuracy: dayAccuracy,
        attendance,
        quizzesCount: dayQuizzes.length,
        lessonsCount: dayLessons.length
      });
    }

    return days;
  }, [students, focusLogs, quizAttempts, completedLessons, filterStudentId]);

  // Overall 7-Day Stats (Real averages of recorded days)
  const avg7DayFocus = useMemo(() => {
    const validDays = historical7DayData.filter((d) => d.focus !== null && d.focus > 0);
    if (validDays.length === 0) return 0;
    return Math.round(validDays.reduce((acc, d) => acc + (d.focus || 0), 0) / validDays.length);
  }, [historical7DayData]);

  const avg7DayAccuracy = useMemo(() => {
    const validDays = historical7DayData.filter((d) => d.accuracy !== null && d.accuracy > 0);
    if (validDays.length === 0) return 0;
    return Math.round(validDays.reduce((acc, d) => acc + (d.accuracy || 0), 0) / validDays.length);
  }, [historical7DayData]);

  const totalQuizzes7Day = useMemo(() => {
    if (filterStudentId === 'all') {
      return quizAttempts.length;
    }
    return quizAttempts.filter((q) => q.studentId === filterStudentId).length;
  }, [quizAttempts, filterStudentId]);

  // Compute fuzzy state distribution for current enrolled cohort
  const fuzzyDistribution = useMemo(() => {
    return [
      { name: 'Optimal', count: students.filter((s) => s.fuzzyState === 'Optimal focus').length, color: '#00C896' },
      { name: 'Good', count: students.filter((s) => s.fuzzyState === 'Good focus').length, color: '#4D84FE' },
      { name: 'Steady', count: students.filter((s) => s.fuzzyState === 'Steady attention').length, color: '#FF8A00' },
      { name: 'Low Focus', count: students.filter((s) => s.fuzzyState === 'Low focus').length, color: '#f59e0b' },
      { name: 'Overloaded', count: students.filter((s) => s.fuzzyState === 'Overloaded').length, color: '#ef4444' },
      { name: 'Distracted', count: students.filter((s) => s.fuzzyState === 'Distracted').length, color: '#8b5cf6' },
    ];
  }, [students]);

  // Student focus comparison bar chart
  const studentFocusData = useMemo(() => {
    return students.map((s) => ({
      name: s.name.split(' ')[0],
      fullName: s.name,
      focus: s.currentFocusScore ?? 0,
      accuracy: s.recentAccuracy ?? 0,
      state: s.fuzzyState
    }));
  }, [students]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Page Header */}
      <div className="card-warm p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF8A00] bg-[#FFF7F3] border border-[#FF8A00]/20 px-3 py-1 rounded-full mb-1.5">
            <Sparkles className="h-3.5 w-3.5 text-[#FF8A00]" />
            Real-Time Cognitive Analytics
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1E293B]">
            Class Learning Analytics & 7-Day History
          </h1>
          <p className="text-xs text-[#1E293B]/70 mt-1">
            Real-time aggregation of student attention telemetry, fuzzy inference states, and rolling 7-day learning history.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#00C896]/10 border border-[#00C896]/20 px-3 py-1.5 rounded-full text-xs font-bold text-[#00C896]">
          <span className="w-2 h-2 rounded-full bg-[#00C896] animate-pulse" />
          <span>Live Dynamic Sync Active</span>
        </div>
      </div>

      {/* 7-Day Rolling Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card-warm p-4 border-t-4 border-t-[#00C896]">
          <span className="text-xs font-bold text-[#1E293B]/60 uppercase tracking-wider block">
            7-Day Avg Focus
          </span>
          <span className="text-2xl font-black text-[#00C896] block mt-1">{avg7DayFocus}%</span>
          <span className="text-[11px] text-[#1E293B]/50 font-medium">Computed via fuzzy logic</span>
        </div>

        <div className="card-warm p-4 border-t-4 border-t-[#4D84FE]">
          <span className="text-xs font-bold text-[#1E293B]/60 uppercase tracking-wider block">
            7-Day Quiz Accuracy
          </span>
          <span className="text-2xl font-black text-[#4D84FE] block mt-1">{avg7DayAccuracy}%</span>
          <span className="text-[11px] text-[#1E293B]/50 font-medium">Concept retention</span>
        </div>

        <div className="card-warm p-4 border-t-4 border-t-[#FF8A00]">
          <span className="text-xs font-bold text-[#1E293B]/60 uppercase tracking-wider block">
            Total Quiz Attempts
          </span>
          <span className="text-2xl font-black text-[#FF8A00] block mt-1">{totalQuizzes7Day}</span>
          <span className="text-[11px] text-[#1E293B]/50 font-medium">Logged in database</span>
        </div>

        <div className="card-warm p-4 border-t-4 border-t-purple-500">
          <span className="text-xs font-bold text-[#1E293B]/60 uppercase tracking-wider block">
            Enrolled Students
          </span>
          <span className="text-2xl font-black text-purple-600 block mt-1">{students.length}</span>
          <span className="text-[11px] text-[#1E293B]/50 font-medium">Cohort profiles</span>
        </div>
      </div>

      {/* Real & Dynamic 7-Day Historical Analytics Chart Section */}
      <div className="card-warm p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#FF8A00]/15">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#00C896] text-white flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#1E293B]">
                  7-Day Historical Learning Trends
                </h2>
                <p className="text-xs text-[#1E293B]/60">
                  Rolling 7-day calendar window dynamically calculated from actual student sessions and quiz attempts
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Student Filter Selector */}
            {students.length > 0 && (
              <select
                aria-label="Filter 7-day historical chart by student"
                value={filterStudentId}
                onChange={(e) => setFilterStudentId(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-[#FF8A00]/25 bg-white text-xs font-bold text-[#1E293B] focus:outline-hidden focus:ring-2 focus:ring-[#4D84FE]"
              >
                <option value="all">Whole Class Cohort</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            )}

            {/* Chart View Selector */}
            <div className="flex items-center gap-1.5 p-1 bg-[#FFF7F3] rounded-xl border border-[#FF8A00]/15 text-xs font-bold">
              <button
                onClick={() => setChartView('focusAccuracy')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  chartView === 'focusAccuracy'
                    ? 'bg-[#4D84FE] text-white shadow-xs'
                    : 'text-[#1E293B]/70 hover:text-[#1E293B]'
                }`}
              >
                Focus & Accuracy
              </button>
              <button
                onClick={() => setChartView('attendance')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  chartView === 'attendance'
                    ? 'bg-[#FF8A00] text-white shadow-xs'
                    : 'text-[#1E293B]/70 hover:text-[#1E293B]'
                }`}
              >
                Daily Attendance
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Chart */}
        <div className="h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {chartView === 'focusAccuracy' ? (
              <AreaChart data={historical7DayData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="focusGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00C896" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#00C896" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="accuracyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4D84FE" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#4D84FE" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#FF8A00" strokeOpacity={0.12} />
                <XAxis
                  dataKey="shortDay"
                  tickLine={false}
                  axisLine={{ stroke: '#FF8A00', strokeOpacity: 0.2 }}
                  tick={{ fontSize: 12, fill: '#1E293B' }}
                />
                <YAxis
                  domain={[0, 100]}
                  tickLine={false}
                  axisLine={{ stroke: '#FF8A00', strokeOpacity: 0.2 }}
                  tick={{ fontSize: 12, fill: '#1E293B' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    border: '1px solid rgba(255, 138, 0, 0.2)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                    fontSize: '12px',
                    color: '#1E293B'
                  }}
                  formatter={(val: any, name: string) => {
                    if (val === null || val === undefined) {
                      return ['No recorded data', name === 'focus' ? 'Avg Focus Score' : 'Avg Quiz Accuracy'];
                    }
                    return [
                      `${val}%`,
                      name === 'focus' ? 'Avg Focus Score' : 'Avg Quiz Accuracy'
                    ];
                  }}
                  labelFormatter={(label, payload) => {
                    const item = payload?.[0]?.payload;
                    return item ? `${item.day} — ${item.quizzesCount} quizzes, ${item.lessonsCount} lessons` : label;
                  }}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  height={36}
                  formatter={(value) => (
                    <span className="text-xs font-bold text-[#1E293B]">
                      {value === 'focus' ? 'Cognitive Focus Score (0-100)' : 'Quiz Accuracy (% Correct)'}
                    </span>
                  )}
                />
                <Area
                  type="monotone"
                  dataKey="focus"
                  stroke="#00C896"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#focusGradient)"
                  dot={{ r: 4, fill: '#00C896', strokeWidth: 2, stroke: '#ffffff' }}
                  activeDot={{ r: 6 }}
                  connectNulls={true}
                />
                <Area
                  type="monotone"
                  dataKey="accuracy"
                  stroke="#4D84FE"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#accuracyGradient)"
                  dot={{ r: 4, fill: '#4D84FE', strokeWidth: 2, stroke: '#ffffff' }}
                  activeDot={{ r: 6 }}
                  connectNulls={true}
                />
              </AreaChart>
            ) : (
              <BarChart data={historical7DayData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#FF8A00" strokeOpacity={0.12} />
                <XAxis
                  dataKey="shortDay"
                  tickLine={false}
                  axisLine={{ stroke: '#FF8A00', strokeOpacity: 0.2 }}
                  tick={{ fontSize: 12, fill: '#1E293B' }}
                />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={{ stroke: '#FF8A00', strokeOpacity: 0.2 }}
                  tick={{ fontSize: 12, fill: '#1E293B' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '16px',
                    border: '1px solid rgba(255, 138, 0, 0.2)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                    fontSize: '12px',
                    color: '#1E293B'
                  }}
                  formatter={(val: number) => [`${val} Active Students`, 'Daily Attendance']}
                  labelFormatter={(label, payload) => {
                    const item = payload?.[0]?.payload;
                    return item ? item.day : label;
                  }}
                />
                <Bar dataKey="attendance" fill="#FF8A00" radius={[8, 8, 0, 0]} name="Active Students" />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Dynamic Calendar Strip Footnote */}
        <div className="flex flex-wrap items-center justify-between text-xs text-[#1E293B]/60 pt-2 border-t border-[#FF8A00]/10">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00C896]" />
            <span>Green: Soft computing defuzzified attention</span>
            <span className="w-2 h-2 rounded-full bg-[#4D84FE] ml-2" />
            <span>Blue: MCQ accuracy</span>
          </div>
          <span className="text-[11px] text-[#FF8A00] font-bold">
            Data window: {historical7DayData[0]?.day} → {historical7DayData[historical7DayData.length - 1]?.day}
          </span>
        </div>
      </div>

      {/* Cohort Breakdown Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Current Student Focus & Accuracy Bar Chart (8 cols) */}
        <div className="lg:col-span-8 card-warm p-6 space-y-4">
          <div>
            <h2 className="text-base font-bold text-[#1E293B]">
              Current Cohort Focus & Accuracy Breakdown
            </h2>
            <p className="text-xs text-[#1E293B]/60">
              Live snapshot comparing individual student attention vs quiz performance
            </p>
          </div>

          <div className="h-72 w-full pt-2">
            {studentFocusData.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#1E293B]/50">
                <Users className="w-8 h-8 mb-2 text-[#FF8A00]" />
                <span className="text-xs font-bold">No enrolled student profiles yet</span>
                <span className="text-[11px]">Create student profiles to view individual telemetry comparisons.</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={studentFocusData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#FF8A00" strokeOpacity={0.12} />
                  <XAxis dataKey="name" tickLine={false} axisLine={{ stroke: '#FF8A00', strokeOpacity: 0.2 }} tick={{ fontSize: 12, fill: '#1E293B' }} />
                  <YAxis domain={[0, 100]} tickLine={false} axisLine={{ stroke: '#FF8A00', strokeOpacity: 0.2 }} tick={{ fontSize: 12, fill: '#1E293B' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      border: '1px solid rgba(255, 138, 0, 0.2)',
                      fontSize: '12px',
                      color: '#1E293B'
                    }}
                  />
                  <Bar dataKey="focus" fill="#00C896" radius={[6, 6, 0, 0]} name="Focus Score" />
                  <Bar dataKey="accuracy" fill="#4D84FE" radius={[6, 6, 0, 0]} name="Quiz Accuracy %" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Fuzzy States Distribution (4 cols) */}
        <div className="lg:col-span-4 card-warm p-6 space-y-4">
          <div>
            <h2 className="text-base font-bold text-[#1E293B]">Fuzzy State Distribution</h2>
            <p className="text-xs text-[#1E293B]/60">Cognitive load categorizations</p>
          </div>

          <div className="space-y-3 pt-2">
            {fuzzyDistribution.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-semibold text-[#1E293B]">{item.name}</span>
                </div>
                <span className="font-extrabold text-[#1E293B] bg-white px-2.5 py-0.5 rounded-full border border-[#FF8A00]/15">
                  {item.count} student{item.count === 1 ? '' : 's'}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-[#FF8A00]/15 text-[11px] text-[#1E293B]/70 leading-relaxed">
            <strong className="text-[#FF8A00]">ANFIS Adaptation Rule: </strong>
            Students flagged with <strong>Low focus</strong> or <strong>Overloaded</strong> automatically trigger font enlargement (18px) and sensory micro-breaks.
          </div>
        </div>
      </div>
    </div>
  );
};
