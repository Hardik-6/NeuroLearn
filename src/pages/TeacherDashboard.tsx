import React, { useState } from 'react';
import {
  Users,
  UserCheck,
  AlertTriangle,
  PlusCircle,
  BookOpen,
  FileQuestion,
  BarChart3,
  CheckCircle,
  Eye,
  Sliders,
  X,
  Sparkles,
  Info,
  Mic,
  Video,
  MessageSquare
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from 'recharts';
import { StudentProfile, FuzzyState, StudentSubmission } from '../types';
import { adaptContent } from '../algorithms/softComputing';

interface TeacherDashboardProps {
  students: StudentProfile[];
  submissions?: StudentSubmission[];
  onNavigateToCreateProfile: () => void;
  onNavigateToAnalytics: () => void;
  onNavigateToLessons: () => void;
  onNavigateToQuizBank: () => void;
  onNavigateToSubmissions?: () => void;
  onOpenInspector?: () => void;
  onSelectStudentForInspection?: (student: StudentProfile) => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  students,
  submissions = [],
  onNavigateToCreateProfile,
  onNavigateToAnalytics,
  onNavigateToLessons,
  onNavigateToQuizBank,
  onNavigateToSubmissions,
  onOpenInspector,
  onSelectStudentForInspection
}) => {
  const [inspectingStudent, setInspectingStudent] = useState<StudentProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'flagged' | 'all'>('flagged');

  // Real calculation: filter students flagged with attention-needed states or low score (< 60)
  const flaggedStudents = students.filter(
    (s) =>
      s.fuzzyState === 'Low focus' ||
      s.fuzzyState === 'Overloaded' ||
      s.fuzzyState === 'Distracted' ||
      s.currentFocusScore < 60
  );

  const totalStudents = students.length;
  const activeToday = students.filter((s) => (s.currentFocusScore ?? 0) > 0).length;
  const needSupportCount = flaggedStudents.length;

  // Real class averages derived strictly from enrolled student records
  const avgClassFocus =
    totalStudents > 0
      ? Math.round(students.reduce((acc, s) => acc + s.currentFocusScore, 0) / totalStudents)
      : 0;

  const optimalCount = students.filter((s) => s.currentFocusScore >= 75).length;
  const steadyCount = students.filter((s) => s.currentFocusScore >= 50 && s.currentFocusScore < 75).length;
  const supportCount = students.filter((s) => s.currentFocusScore < 50).length;

  // Real student performance data for chart
  const studentChartData = students.map((s) => ({
    name: s.name.length > 12 ? s.name.slice(0, 10) + '..' : s.name,
    fullName: s.name,
    focus: s.currentFocusScore,
    accuracy: s.recentAccuracy ?? 0,
    state: s.fuzzyState
  }));

  const getStateBadgeColor = (state: FuzzyState) => {
    switch (state) {
      case 'Overloaded':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'Low focus':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Distracted':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
  };

  const displayedList = activeTab === 'flagged' ? flaggedStudents : students;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Dashboard Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF8A00] bg-[#FFF7F3] border border-[#FF8A00]/20 px-3 py-1 rounded-full mb-1.5">
          <Sparkles className="h-3.5 w-3.5 text-[#FF8A00]" />
          Educator Telemetry
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1E293B]">
          Teacher Dashboard
        </h1>
        <p className="text-sm text-[#1E293B]/70 mt-1">
          Overview of your class performance and real-time neuro-adaptive cognitive states
        </p>
      </div>

      {/* Real-time Class Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Total Students - Action Blue #4D84FE */}
        <div className="card-warm p-6 flex items-center justify-between border-t-4 border-t-[#4D84FE]">
          <div>
            <div className="flex items-center gap-2 text-[#1E293B]/60 text-xs font-bold uppercase tracking-wider">
              <Users className="h-4 w-4 text-[#4D84FE]" />
              <span>Total Students</span>
            </div>
            <div className="text-3xl font-black text-[#1E293B] mt-2">{totalStudents}</div>
            <span className="text-xs text-[#1E293B]/50 font-medium">
              {totalStudents === 0
                ? 'No profiles registered'
                : totalStudents === 1
                ? '1 enrolled student'
                : `${totalStudents} enrolled students`}
            </span>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-[#4D84FE]/10 text-[#4D84FE] flex items-center justify-center">
            <Users className="h-6 w-6" />
          </div>
        </div>

        {/* Active Today - Vibrant Mint #00C896 */}
        <div className="card-warm p-6 flex items-center justify-between border-t-4 border-t-[#00C896]">
          <div>
            <div className="flex items-center gap-2 text-[#1E293B]/60 text-xs font-bold uppercase tracking-wider">
              <UserCheck className="h-4 w-4 text-[#00C896]" />
              <span>Active Learners</span>
            </div>
            <div className="text-3xl font-black text-[#1E293B] mt-2">{activeToday}</div>
            <span className="text-xs text-[#00C896] font-bold">
              {totalStudents > 0
                ? `${Math.round((activeToday / totalStudents) * 100)}% active rate`
                : 'Awaiting student sign-on'}
            </span>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-[#00C896]/10 text-[#00C896] flex items-center justify-center">
            <UserCheck className="h-6 w-6" />
          </div>
        </div>

        {/* Need Support - Warm Orange #FF8A00 */}
        <div className="card-warm p-6 flex items-center justify-between border-t-4 border-t-[#FF8A00]">
          <div>
            <div className="flex items-center gap-2 text-[#FF8A00] text-xs font-bold uppercase tracking-wider">
              <AlertTriangle className="h-4 w-4 text-[#FF8A00]" />
              <span>Need Support</span>
            </div>
            <div className="text-3xl font-black text-[#FF8A00] mt-2">{needSupportCount}</div>
            <span className="text-xs text-[#FF8A00] font-semibold">
              {needSupportCount === 0 ? 'All students steady' : `${needSupportCount} flagged by fuzzy state`}
            </span>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-[#FF8A00]/10 text-[#FF8A00] flex items-center justify-center">
            <AlertTriangle className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Real Enrolled Class Performance & Neuro-Adaptive State Distribution */}
      <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900">Enrolled Student Focus & Accuracy</h2>
            <p className="text-xs text-slate-400">
              Live cognitive telemetry and focus score telemetry for current enrolled cohort
            </p>
          </div>
          {totalStudents > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full">
                Cohort Average: {avgClassFocus}% Focus
              </span>
              <button
                onClick={onNavigateToAnalytics}
                className="text-xs font-bold text-[#FF8A00] hover:text-[#E67D00] bg-[#FFF7F3] border border-[#FF8A00]/25 px-3 py-1 rounded-full transition-all flex items-center gap-1.5 shadow-2xs hover:scale-105"
              >
                <span>View 7-Day History</span>
                <span>→</span>
              </button>
            </div>
          )}
        </div>

        {totalStudents === 0 ? (
          <div className="py-12 px-4 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200 space-y-3">
            <Users className="h-10 w-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700">No Student Records Enrolled</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Student profiles created by educators will automatically populate live cognitive telemetry, focus meters, and fuzzy inference states here.
            </p>
            <button
              onClick={onNavigateToCreateProfile}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Create Student Profile</span>
            </button>
          </div>
        ) : (
          <>
            {/* Breakdown Chips */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-[#00C896]/10 border border-[#00C896]/20 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#00C896]">Optimal Focus (≥75%)</span>
                  <p className="text-[11px] text-[#1E293B]/60 font-medium">Standard load & rapid pacing</p>
                </div>
                <span className="text-xl font-black text-[#00C896]">{optimalCount}</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#4D84FE]/10 border border-[#4D84FE]/20 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#4D84FE]">Steady Focus (50-74%)</span>
                  <p className="text-[11px] text-[#1E293B]/60 font-medium">Balanced presentation</p>
                </div>
                <span className="text-xl font-black text-[#4D84FE]">{steadyCount}</span>
              </div>
              <div className="p-4 rounded-2xl bg-[#FF8A00]/10 border border-[#FF8A00]/20 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#FF8A00]">Low Focus / Support (&lt;50%)</span>
                  <p className="text-[11px] text-[#1E293B]/60 font-medium">Sensory accommodations active</p>
                </div>
                <span className="text-xl font-black text-[#FF8A00]">{supportCount}</span>
              </div>
            </div>

            {/* Recharts Bar Chart for Enrolled Students */}
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={studentChartData} margin={{ top: 10, right: 20, left: -15, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tickLine={false}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      fontSize: '12px'
                    }}
                    formatter={(val: number, name: string) => [
                      `${val}%`,
                      name === 'focus' ? 'Focus Score' : 'Quiz Accuracy'
                    ]}
                  />
                  <Bar dataKey="focus" name="focus" radius={[6, 6, 0, 0]}>
                    {studentChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.focus >= 75
                            ? '#10b981'
                            : entry.focus >= 50
                            ? '#4f46e5'
                            : '#f43f5e'
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>

      {/* Two Column Grid: Left = Students Requiring Attention, Right = Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Students Requiring Attention (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl bg-white p-6 border border-slate-200/80 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Students requiring attention</h2>
              <span className="text-xs text-slate-400">Real-time Fuzzy Telemetry</span>
            </div>
            {totalStudents > 0 && (
              <div className="flex gap-1 p-0.5 bg-slate-100 rounded-xl text-xs">
                <button
                  onClick={() => setActiveTab('flagged')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    activeTab === 'flagged'
                      ? 'bg-white text-indigo-700 shadow-2xs font-semibold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Flagged ({needSupportCount})
                </button>
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    activeTab === 'all'
                      ? 'bg-white text-indigo-700 shadow-2xs font-semibold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  All ({totalStudents})
                </button>
              </div>
            )}
          </div>

          {totalStudents === 0 ? (
            <div className="py-8 px-4 text-center rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <Users className="h-8 w-8 text-slate-300 mx-auto" />
              <h3 className="text-xs font-bold text-slate-700">No student profiles registered</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Enrolled students requiring cognitive rest or experiencing sensory overload will appear here.
              </p>
              <button
                onClick={onNavigateToCreateProfile}
                className="mt-2 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors"
              >
                Create student profile
              </button>
            </div>
          ) : displayedList.length === 0 ? (
            <div className="py-8 px-4 text-center rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-2">
              <CheckCircle className="h-8 w-8 text-emerald-600 mx-auto" />
              <h3 className="text-xs font-bold text-emerald-950">
                All {totalStudents} students in steady focus
              </h3>
              <p className="text-xs text-emerald-800 max-w-sm mx-auto">
                No students currently require attention or sensory accommodation interventions.
              </p>
              <button
                onClick={() => setActiveTab('all')}
                className="mt-1 text-xs text-indigo-600 hover:text-indigo-800 font-semibold underline"
              >
                View all enrolled students
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs font-semibold text-slate-400">
                    <th className="pb-3">Student</th>
                    <th className="pb-3">Focus Score</th>
                    <th className="pb-3">State</th>
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayedList.map((student) => (
                    <tr key={student.id} className="group hover:bg-slate-50/70 transition-colors">
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              student.avatarUrl ||
                              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
                            }
                            alt={student.name}
                            className="h-9 w-9 rounded-full object-cover ring-1 ring-slate-200"
                          />
                          <div>
                            <span className="font-semibold text-slate-800 block text-sm">
                              {student.name}
                            </span>
                            <span className="text-xs text-slate-400">
                              Age {student.age} • {(student.diagnoses || []).join(', ')}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-mono font-bold text-xs ${
                              student.currentFocusScore >= 75
                                ? 'text-emerald-600'
                                : student.currentFocusScore >= 50
                                ? 'text-indigo-600'
                                : 'text-rose-600'
                            }`}
                          >
                            {student.currentFocusScore}%
                          </span>
                          <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden hidden sm:block">
                            <div
                              className={`h-full rounded-full ${
                                student.currentFocusScore >= 75
                                  ? 'bg-emerald-500'
                                  : student.currentFocusScore >= 50
                                  ? 'bg-indigo-500'
                                  : 'bg-rose-500'
                              }`}
                              style={{ width: `${student.currentFocusScore}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${getStateBadgeColor(
                            student.fuzzyState
                          )}`}
                        >
                          {student.fuzzyState}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => setInspectingStudent(student)}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-indigo-300 hover:text-indigo-600 transition-colors shadow-2xs"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Actions Grid (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl bg-white p-6 border border-slate-200/80 shadow-2xs space-y-4">
          <h2 className="text-base font-bold text-slate-900">Quick actions</h2>

          <div className="grid grid-cols-2 gap-3">
            {/* Review voice and video submissions */}
            {onNavigateToSubmissions && (
              <button
                id="quick-action-review-submissions"
                onClick={onNavigateToSubmissions}
                className="col-span-2 flex items-center justify-between p-4 rounded-xl border border-[#FF8A00]/30 bg-[#FFF7F3] hover:bg-[#FF8A00]/10 text-left transition-all group shadow-2xs"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-[#00C896] text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Mic className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#1E293B] block">
                      Voice & Video Submissions
                    </span>
                    <span className="text-[11px] text-[#1E293B]/60 block">
                      Listen, watch & send suggestions
                    </span>
                  </div>
                </div>
                {submissions.filter((s) => !s.teacherFeedback || s.teacherFeedback.status === 'pending').length > 0 && (
                  <span className="text-[10px] font-extrabold bg-[#FF8A00] text-white px-2.5 py-1 rounded-full animate-pulse">
                    {submissions.filter((s) => !s.teacherFeedback || s.teacherFeedback.status === 'pending').length} New
                  </span>
                )}
              </button>
            )}

            {/* Create student profile */}
            <button
              id="quick-action-create-profile"
              onClick={onNavigateToCreateProfile}
              className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-indigo-50/60 hover:border-indigo-300 text-center transition-all group"
            >
              <div className="h-9 w-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                <PlusCircle className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-700">
                Create student profile
              </span>
            </button>

            {/* Create lesson */}
            <button
              id="quick-action-create-lesson"
              onClick={onNavigateToLessons}
              className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-emerald-50/60 hover:border-emerald-300 text-center transition-all group"
            >
              <div className="h-9 w-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                <BookOpen className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-700">
                Create lesson
              </span>
            </button>

            {/* Add quiz question */}
            <button
              id="quick-action-add-quiz"
              onClick={onNavigateToQuizBank}
              className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-amber-50/60 hover:border-amber-300 text-center transition-all group"
            >
              <div className="h-9 w-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                <FileQuestion className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold text-slate-800 group-hover:text-amber-700">
                Add quiz question
              </span>
            </button>

            {/* View analytics */}
            <button
              id="quick-action-view-analytics"
              onClick={onNavigateToAnalytics}
              className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-purple-50/60 hover:border-purple-300 text-center transition-all group"
            >
              <div className="h-9 w-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                <BarChart3 className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold text-slate-800 group-hover:text-purple-700">
                View analytics
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Student Inspector Drawer / Modal */}
      {inspectingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-3">
                <img
                  src={
                    inspectingStudent.avatarUrl ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
                  }
                  alt={inspectingStudent.name}
                  className="h-12 w-12 rounded-full object-cover"
                />
                <div>
                  <h3 className="text-base font-bold text-slate-900">{inspectingStudent.name}</h3>
                  <span className="text-xs text-slate-400">
                    Age {inspectingStudent.age} • {(inspectingStudent.diagnoses || []).join(', ')}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setInspectingStudent(null)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span>Fuzzy Logic Focus Score:</span>
                <span className="text-base font-bold text-indigo-700">
                  {inspectingStudent.currentFocusScore} / 100 ({inspectingStudent.fuzzyState})
                </span>
              </div>

              <div>
                <span className="font-bold text-slate-700">Sensory Sensitivities:</span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {(inspectingStudent.sensorySensitivities || []).length > 0 ? (
                    inspectingStudent.sensorySensitivities.map((s, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-medium"
                      >
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400">No specific sensitivities registered</span>
                  )}
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-700">ANFIS Live Presentation Tuning:</span>
                <div className="mt-1.5 p-3 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-900 leading-relaxed">
                  {adaptContent(inspectingStudent.currentFocusScore, inspectingStudent).reason}
                </div>
              </div>

              <div className="flex justify-between items-center text-slate-500 pt-2 border-t">
                <span>Attention Span Budget: {inspectingStudent.attentionSpanMinutes} mins</span>
                <span className="capitalize">Style: {inspectingStudent.preferredLearningStyle}</span>
              </div>
            </div>

            <div className="flex gap-2">
              {onSelectStudentForInspection && (
                <button
                  onClick={() => {
                    const target = inspectingStudent;
                    setInspectingStudent(null);
                    onSelectStudentForInspection(target);
                  }}
                  className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Open Algorithm Inspector</span>
                </button>
              )}
              <button
                onClick={() => setInspectingStudent(null)}
                className="flex-1 rounded-xl bg-slate-100 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
