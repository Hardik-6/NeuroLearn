import React, { useState } from 'react';
import { Users, Plus, Search, Filter, ShieldAlert, Sparkles, ChevronRight, Trash2, UserPlus, AlertTriangle } from 'lucide-react';
import { StudentProfile } from '../types';
import { adaptContent } from '../algorithms/softComputing';

interface TeacherStudentsPageProps {
  students: StudentProfile[];
  onNavigateToCreateProfile: () => void;
  onSelectStudentForInspection?: (student: StudentProfile) => void;
  onDeleteStudent?: (studentId: string) => void;
}

export const TeacherStudentsPage: React.FC<TeacherStudentsPageProps> = ({
  students,
  onNavigateToCreateProfile,
  onSelectStudentForInspection,
  onDeleteStudent
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDiag, setFilterDiag] = useState<string>('all');
  const [studentToDelete, setStudentToDelete] = useState<StudentProfile | null>(null);

  const filtered = students.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDiag =
      filterDiag === 'all' || s.diagnoses.some((d) => d.toLowerCase() === filterDiag.toLowerCase());
    return matchesSearch && matchesDiag;
  });

  const confirmDelete = () => {
    if (studentToDelete && onDeleteStudent) {
      onDeleteStudent(studentToDelete.id);
      setStudentToDelete(null);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-indigo-700 text-xs font-semibold uppercase tracking-wider mb-1">
            <Users className="h-4 w-4" />
            <span>Class Cohort Management</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Enrolled Neurodivergent Students</h1>
          <p className="text-xs text-slate-500 mt-1">
            Review live cognitive fuzzy scores, active ANFIS accommodations, and attention budgets.
          </p>
        </div>

        <button
          id="students-page-create-profile-btn"
          onClick={onNavigateToCreateProfile}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>New Student Profile</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by student name..."
            className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2 text-xs bg-white focus:border-indigo-600 outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {['all', 'ADHD', 'Autism', 'Dyslexia'].map((diag) => (
            <button
              key={diag}
              onClick={() => setFilterDiag(diag)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all whitespace-nowrap ${
                filterDiag === diag
                  ? 'bg-indigo-600 border-indigo-600 text-white'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {diag === 'all' ? 'All Profiles' : diag}
            </button>
          ))}
        </div>
      </div>

      {/* Empty State if no students */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 border border-slate-200 text-center space-y-4 shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <Users className="h-7 w-7" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-bold text-slate-900">
              {students.length === 0 ? 'No Student Profiles Yet' : 'No Matching Students'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {students.length === 0
                ? 'Sample profiles have been cleared. As a teacher, you can add real student profiles with customized sensory profiles and learning accommodations.'
                : `No student matches "${searchTerm}". Try a different search query or filter.`}
            </p>
          </div>
          <button
            onClick={onNavigateToCreateProfile}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors"
          >
            <UserPlus className="h-4 w-4" />
            <span>Create First Student Profile</span>
          </button>
        </div>
      ) : (
        /* Students Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((s) => {
            const anfis = adaptContent(s.currentFocusScore, s);
            return (
              <div
                key={s.id}
                className="rounded-2xl bg-white p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-4 hover:border-indigo-300 transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={s.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                        alt={s.name}
                        className="h-11 w-11 rounded-full object-cover ring-2 ring-slate-100"
                      />
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">{s.name}</h3>
                        <span className="text-xs text-slate-400">Age {s.age}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          s.fuzzyState === 'Good focus' || s.fuzzyState === 'Optimal focus'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : s.fuzzyState === 'Low focus'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {s.fuzzyState}
                      </span>
                      {onDeleteStudent && (
                        <button
                          type="button"
                          onClick={() => setStudentToDelete(s)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title={`Delete ${s.name}'s profile`}
                          aria-label={`Delete ${s.name}'s profile`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {s.diagnoses.map((d) => (
                      <span
                        key={d}
                        className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[11px] font-semibold"
                      >
                        {d}
                      </span>
                    ))}
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] capitalize">
                      {s.preferredLearningStyle}
                    </span>
                  </div>

                  {/* Telemetry and ANFIS rules */}
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-500">
                      <span>Fuzzy Focus Score:</span>
                      <strong className="text-slate-800">{s.currentFocusScore} / 100</strong>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Attention Budget:</span>
                      <strong className="text-slate-800">{s.attentionSpanMinutes} mins (GA)</strong>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-[11px] text-slate-600 leading-snug">
                      <strong className="text-slate-700">Active Adaptation: </strong>
                      Font {anfis.fontSize}, {anfis.lineSpacing}x spacing, {anfis.theme} theme.
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => onSelectStudentForInspection?.(s)}
                    className="flex-1 py-2 px-3 rounded-xl border border-slate-200 bg-white hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 text-xs font-semibold text-slate-700 transition-colors text-center"
                  >
                    Inspect Telemetry
                  </button>
                  {onDeleteStudent && (
                    <button
                      onClick={() => setStudentToDelete(s)}
                      className="py-2 px-3 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {studentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Delete Student Profile?</h3>
                <span className="text-xs text-slate-500">This action cannot be undone.</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to delete <strong className="text-slate-900">{studentToDelete.name}</strong>'s profile?
              All associated telemetry, focus history, and individualized accommodations will be removed.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStudentToDelete(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 text-xs font-semibold text-white hover:bg-rose-700 transition-colors shadow-sm"
              >
                <Trash2 className="h-4 w-4" />
                <span>Yes, Delete Profile</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
