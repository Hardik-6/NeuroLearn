import React, { useState, useEffect } from 'react';
import {
  Role,
  StudentProfile,
  LessonContent,
  QuizQuestion,
  QuizAttempt,
  CompletedLessonRecord,
  FocusSessionLog,
  StudentSubmission,
  TeacherSuggestion
} from './types';
import {
  INITIAL_STUDENTS,
  DEFAULT_LESSONS,
  SOLAR_SYSTEM_LESSON,
  MOCK_QUIZ_QUESTIONS,
  DEFAULT_SUBMISSIONS,
  DEFAULT_QUIZ_ATTEMPTS,
  DEFAULT_FOCUS_LOGS,
  DEFAULT_COMPLETED_LESSONS
} from './mockData';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { BreakModal } from './components/BreakModal';
import { SoftComputingInspectorModal } from './components/SoftComputingInspectorModal';
import { AddLessonModal } from './components/AddLessonModal';
import {
  saveLessonsToStorage,
  deleteLessonFromStorage,
  saveQuizToStorage,
  deleteQuizQuestionFromStorage,
  saveStudentsToStorage,
  deleteStudentFromStorage,
  loadFullDataStore,
  recordCompletedLesson,
  recordQuizAttempt,
  recordFocusLog,
  saveSettingsToStorage,
  saveSubmissionToStorage,
  saveTeacherFeedbackToStorage,
  deleteSubmissionFromStorage
} from './utils/persistentStorage';

// Pages
import { LandingPage } from './pages/LandingPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { LessonView } from './pages/LessonView';
import { AdaptiveQuiz } from './pages/AdaptiveQuiz';
import { TeacherDashboard } from './pages/TeacherDashboard';
import { StudentProfilePage } from './pages/StudentProfilePage';
import { StudentLessonsPage } from './pages/StudentLessonsPage';
import { StudentProgressPage } from './pages/StudentProgressPage';
import { TeacherAnalyticsPage } from './pages/TeacherAnalyticsPage';
import { TeacherStudentsPage } from './pages/TeacherStudentsPage';
import { TeacherQuizBankPage } from './pages/TeacherQuizBankPage';
import { TeacherSubmissionsPage } from './pages/TeacherSubmissionsPage';
import { MultiModalSubmissionPage } from './pages/MultiModalSubmissionPage';
import { getFuzzyState } from './algorithms/softComputing';

const DEFAULT_GUEST_STUDENT: StudentProfile = {
  id: 'guest-learner',
  name: 'Student Learner',
  age: 12,
  diagnoses: ['ADHD', 'Dyslexia'],
  preferredLearningStyle: 'visual',
  currentFocusScore: 0,
  fuzzyState: 'Steady attention',
  attentionSpanMinutes: 20,
  sensorySensitivities: ['High text density', 'Visual glare'],
  recentAccuracy: 0,
  avgResponseTimeSec: 0,
  currentMood: 4
};

const STORAGE_KEYS = {
  STUDENTS: 'neuro_adaptive_students_v2',
  LESSONS: 'neuro_adaptive_lessons_v2',
  QUIZ: 'neuro_adaptive_quiz_questions_v2',
  ACTIVE_STUDENT_ID: 'neuro_adaptive_active_student_id_v2',
  SELECTED_LESSON_ID: 'neuro_adaptive_selected_lesson_id_v2',
  SUBMISSIONS: 'neuro_adaptive_submissions_v2',
  ACTIVE_ROLE: 'neuro_adaptive_active_role_v2'
};

export default function App() {
  const [role, setRole] = useState<Role>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_ROLE);
      if (saved === 'teacher' || saved === 'student') return saved;
    } catch { }
    return 'student';
  });

  const [currentRoute, setCurrentRoute] = useState<string>('student-dashboard');

  // 1. Persistent Students
  const [students, setStudents] = useState<StudentProfile[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STUDENTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Could not read students from localStorage:', e);
    }
    return INITIAL_STUDENTS;
  });

  const [activeStudentId, setActiveStudentId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_STUDENT_ID);
      if (saved) return saved;
    } catch { }
    return '';
  });

  // 2. Persistent Lessons
  const [lessons, setLessons] = useState<LessonContent[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LESSONS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Could not read lessons from localStorage:', e);
    }
    return DEFAULT_LESSONS;
  });

  const [selectedLessonId, setSelectedLessonId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SELECTED_LESSON_ID);
      if (saved) return saved;
    } catch { }
    return DEFAULT_LESSONS[0]?.id || '';
  });

  // 3. Persistent Quiz Questions
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.QUIZ);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const seen = new Set<string>();
          return parsed.map((q: QuizQuestion, i: number) => {
            if (!q.id || seen.has(q.id)) {
              const freshId = `q-restored-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 7)}`;
              seen.add(freshId);
              return { ...q, id: freshId };
            }
            seen.add(q.id);
            return q;
          });
        }
      }
    } catch (e) {
      console.warn('Could not read quiz questions from localStorage:', e);
    }
    return MOCK_QUIZ_QUESTIONS;
  });

  // 4. Learning progress, quiz results & focus telemetry
  const [completedLessons, setCompletedLessons] = useState<CompletedLessonRecord[]>(() => {
    try {
      const saved = localStorage.getItem('neuro_adaptive_completed_lessons_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch { }
    return DEFAULT_COMPLETED_LESSONS;
  });

  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>(() => {
    try {
      const saved = localStorage.getItem('neuro_adaptive_quiz_attempts_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch { }
    return DEFAULT_QUIZ_ATTEMPTS;
  });

  const [focusLogs, setFocusLogs] = useState<FocusSessionLog[]>(() => {
    try {
      const saved = localStorage.getItem('neuro_adaptive_focus_logs_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch { }
    return DEFAULT_FOCUS_LOGS;
  });

  // 5. Voice & Video Student Submissions & Teacher Suggestions
  const [submissions, setSubmissions] = useState<StudentSubmission[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Could not read submissions from localStorage:', e);
    }
    return DEFAULT_SUBMISSIONS;
  });

  // Modal states
  const [isBreakModalOpen, setIsBreakModalOpen] = useState(false);
  const [isInspectorModalOpen, setIsInspectorModalOpen] = useState(false);
  const [isAddLessonModalOpen, setIsAddLessonModalOpen] = useState(false);

  // Full Store Hydration: Server disk is primary source of truth
  useEffect(() => {
    let isMounted = true;
    const hydrateAllData = async () => {
      try {
        const fullStore = await loadFullDataStore();
        if (isMounted && fullStore) {
          if (Array.isArray(fullStore.students) && fullStore.students.length > 0) {
            setStudents(fullStore.students);
          }
          if (Array.isArray(fullStore.lessons) && fullStore.lessons.length > 0) {
            setLessons(fullStore.lessons);
          }
          if (Array.isArray(fullStore.quizQuestions)) {
            const seen = new Set<string>();
            const sanitized = fullStore.quizQuestions.map((q, i) => {
              if (!q.id || seen.has(q.id)) {
                const freshId = `q-init-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 7)}`;
                seen.add(freshId);
                return { ...q, id: freshId };
              }
              seen.add(q.id);
              return q;
            });
            setQuizQuestions(sanitized);
          }
          if (Array.isArray(fullStore.completedLessons)) {
            setCompletedLessons(fullStore.completedLessons);
          }
          if (Array.isArray(fullStore.quizAttempts)) {
            setQuizAttempts(fullStore.quizAttempts);
          }
          if (Array.isArray(fullStore.focusLogs)) {
            setFocusLogs(fullStore.focusLogs);
          }
          if (Array.isArray(fullStore.submissions) && fullStore.submissions.length > 0) {
            setSubmissions(fullStore.submissions);
          }
          if (fullStore.settings) {
            if (fullStore.settings.activeRole) setRole(fullStore.settings.activeRole);
            if (fullStore.settings.activeStudentId) setActiveStudentId(fullStore.settings.activeStudentId);
            if (fullStore.settings.selectedLessonId) setSelectedLessonId(fullStore.settings.selectedLessonId);
          }
        }
      } catch (err) {
        console.warn('App initialization hydration notice:', err);
      }
    };

    hydrateAllData();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (activeStudentId) {
      try {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_STUDENT_ID, activeStudentId);
      } catch { }
      saveSettingsToStorage({ activeStudentId });
    }
  }, [activeStudentId]);

  useEffect(() => {
    if (selectedLessonId) {
      try {
        localStorage.setItem(STORAGE_KEYS.SELECTED_LESSON_ID, selectedLessonId);
      } catch { }
      saveSettingsToStorage({ selectedLessonId });
    }
  }, [selectedLessonId]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_ROLE, role);
    } catch { }
    saveSettingsToStorage({ activeRole: role });
  }, [role]);

  // Active student object (falls back gracefully to default student if list is empty)
  const activeStudent: StudentProfile =
    students.find((s) => s.id === activeStudentId) || students[0] || DEFAULT_GUEST_STUDENT;

  // Active selected lesson
  const currentLesson: LessonContent =
    lessons.find((l) => l.id === selectedLessonId) || lessons[0] || SOLAR_SYSTEM_LESSON;

  // Update focus score for active student and derive fuzzy state
  const handleUpdateFocusScore = (newScore: number) => {
    const clamped = Math.min(100, Math.max(0, Math.round(newScore)));
    const updatedState = getFuzzyState(clamped);

    setStudents((prev) => {
      const updated = prev.map((s) =>
        s.id === activeStudent.id
          ? { ...s, currentFocusScore: clamped, fuzzyState: updatedState }
          : s
      );
      saveStudentsToStorage(updated);
      return updated;
    });

    recordFocusLog(activeStudent.id, clamped, updatedState);
  };

  const handleSaveProfile = (newProfile: StudentProfile) => {
    setStudents((prev) => {
      const updated = [newProfile, ...prev];
      saveStudentsToStorage(updated);
      return updated;
    });
    setActiveStudentId(newProfile.id);
  };

  const handleDeleteStudent = (studentId: string) => {
    setStudents((prev) => {
      const updated = prev.filter((s) => s.id !== studentId);
      if (activeStudentId === studentId) {
        setActiveStudentId(updated.length > 0 ? updated[0].id : '');
      }
      return updated;
    });
    deleteStudentFromStorage(studentId);
  };

  const handleSaveNewLesson = (newLesson: LessonContent) => {
    setLessons((prev) => {
      const updated = [newLesson, ...prev];
      saveLessonsToStorage(updated);
      return updated;
    });
    setSelectedLessonId(newLesson.id);
    setIsAddLessonModalOpen(false);
  };

  const handleDeleteLesson = (lessonId: string) => {
    setLessons((prev) => {
      const updated = prev.filter((l) => l.id !== lessonId);
      if (selectedLessonId === lessonId) {
        setSelectedLessonId(updated.length > 0 ? updated[0].id : '');
      }
      return updated;
    });
    deleteLessonFromStorage(lessonId);
  };

  const handleAddQuizQuestion = (q: QuizQuestion) => {
    setQuizQuestions((prev) => {
      const isDup = prev.some((item) => item.id === q.id);
      const safeQ = isDup
        ? { ...q, id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` }
        : q;
      const updated = [safeQ, ...prev];
      saveQuizToStorage(updated);
      return updated;
    });
  };

  const handleDeleteQuizQuestion = (qId: string) => {
    setQuizQuestions((prev) => {
      const updated = prev.filter((q) => q.id !== qId);
      return updated;
    });
    deleteQuizQuestionFromStorage(qId);
  };

  const handleCompleteLesson = (lessonId: string) => {
    recordCompletedLesson(lessonId, activeStudent.id, 15).then((rec) => {
      if (rec) {
        setCompletedLessons((prev) => [rec, ...prev]);
      }
    });

    // Steady attention state improves automatically as the student completes lessons
    setStudents((prev) => {
      const updated = prev.map((s) => {
        if (s.id === activeStudent.id) {
          const current = s.currentFocusScore ?? 0;
          const newScore = Math.min(100, current + 25);
          const updatedState = getFuzzyState(newScore);
          recordFocusLog(s.id, newScore, updatedState);
          return {
            ...s,
            currentFocusScore: newScore,
            fuzzyState: updatedState
          };
        }
        return s;
      });
      saveStudentsToStorage(updated);
      return updated;
    });
  };

  const handleCompleteQuiz = (
    finalScore: number,
    correctCount = 0,
    totalQuestions = 1,
    difficulty: 'easy' | 'medium' | 'hard' = 'medium'
  ) => {
    // Dynamic steady attention calibration based on quiz completion and accuracy
    setStudents((prev) => {
      const updated = prev.map((s) => {
        if (s.id === activeStudent.id) {
          const current = s.currentFocusScore ?? 0;
          const boost = Math.max(15, Math.round((finalScore / 100) * 30));
          const newScore = Math.min(100, current + boost);
          const updatedState = getFuzzyState(newScore);
          recordFocusLog(s.id, newScore, updatedState);
          return {
            ...s,
            recentAccuracy: finalScore,
            currentFocusScore: newScore,
            fuzzyState: updatedState
          };
        }
        return s;
      });
      saveStudentsToStorage(updated);
      return updated;
    });

    recordQuizAttempt({
      studentId: activeStudent.id,
      lessonId: selectedLessonId,
      scorePercent: finalScore,
      correctCount,
      totalQuestions,
      difficulty
    }).then((att) => {
      if (att) {
        setQuizAttempts((prev) => [att, ...prev]);
      }
    });
  };

  const handleUpdateStudent = (updatedStudent: StudentProfile) => {
    setStudents((prev) => {
      const updated = prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s));
      saveStudentsToStorage(updated);
      return updated;
    });
  };

  const handleSaveSubmission = (sub: StudentSubmission) => {
    setSubmissions((prev) => {
      const idx = prev.findIndex((s) => s.id === sub.id);
      const updated = idx >= 0 ? prev.map((s) => (s.id === sub.id ? sub : s)) : [sub, ...prev];
      return updated;
    });
    saveSubmissionToStorage(sub);
  };

  const handleSaveTeacherFeedback = (submissionId: string, feedback: TeacherSuggestion) => {
    setSubmissions((prev) =>
      prev.map((s) => (s.id === submissionId ? { ...s, teacherFeedback: feedback } : s))
    );
    saveTeacherFeedbackToStorage(submissionId, feedback);
  };

  const handleDeleteSubmission = (submissionId: string) => {
    setSubmissions((prev) => prev.filter((s) => s.id !== submissionId));
    deleteSubmissionFromStorage(submissionId);
  };

  const handleRoleChange = (newRole: Role) => {
    setRole(newRole);
    if (newRole === 'teacher') {
      if (
        currentRoute.startsWith('student') ||
        currentRoute === 'lesson-view' ||
        currentRoute === 'adaptive-quiz'
      ) {
        setCurrentRoute('teacher-dashboard');
      }
    } else {
      if (currentRoute.startsWith('teacher')) {
        setCurrentRoute('student-dashboard');
      }
    }
  };

  const handleNavigate = (route: string) => {
    setCurrentRoute(route);
  };

  const handleSelectLesson = (lessonId: string) => {
    setSelectedLessonId(lessonId);
    setCurrentRoute('lesson-view');
  };

  // If user is on the public landing page
  if (currentRoute === 'landing') {
    return (
      <div className="min-h-screen bg-slate-50">
        <LandingPage
          onGetStarted={(targetRole) => {
            setRole(targetRole);
            setCurrentRoute(targetRole === 'student' ? 'student-dashboard' : 'teacher-dashboard');
          }}
          onOpenInspector={() => setIsInspectorModalOpen(true)}
          onOpenPresentation={() => {
            setCurrentRoute('presentation-deck');
          }}
        />
        <SoftComputingInspectorModal
          isOpen={isInspectorModalOpen}
          onClose={() => setIsInspectorModalOpen(false)}
          initialScore={activeStudent.currentFocusScore}
        />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-[#FFF7F3] font-sans text-[#1E293B] overflow-hidden selection:bg-[#00C896]/20 selection:text-[#1E293B]">
      {/* Persistent Desktop Sidebar */}
      <Sidebar
        role={role}
        currentRoute={currentRoute}
        onNavigate={handleNavigate}
        onRoleChange={handleRoleChange}
        pendingSubmissionsCount={
          submissions.filter((s) => !s.teacherFeedback || s.teacherFeedback.status === 'pending').length
        }
      />

      {/* Main Workspace Column with Top Header and Scrollable Content */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header
          role={role}
          onRoleChange={handleRoleChange}
          activeStudent={activeStudent}
          currentRoute={currentRoute}
          onNavigate={handleNavigate}
        />

        {/* Dynamic Main Content Canvas */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-8">
          {/* Student Routes */}
          {role === 'student' && (
            <>
              {currentRoute === 'student-dashboard' && (
                <StudentDashboard
                  student={activeStudent}
                  submissions={submissions}
                  onNavigateToLesson={() => handleSelectLesson(selectedLessonId)}
                  onOpenBreakModal={() => setIsBreakModalOpen(true)}
                  onNavigateToSubmission={() => setCurrentRoute('multimodal-submission')}
                  completedLessonsCount={completedLessons.length}
                  quizAverage={
                    quizAttempts.length > 0
                      ? Math.round(
                        quizAttempts.reduce((acc, q) => acc + q.scorePercent, 0) /
                        quizAttempts.length
                      )
                      : (activeStudent.recentAccuracy || 0)
                  }
                  currentLessonTitle={currentLesson.title}
                />
              )}

              {currentRoute === 'multimodal-submission' && (
                <MultiModalSubmissionPage
                  student={activeStudent}
                  submissions={submissions}
                  onSaveSubmission={handleSaveSubmission}
                  onNavigateToDashboard={() => setCurrentRoute('student-dashboard')}
                />
              )}

              {currentRoute === 'student-lessons' && (
                <StudentLessonsPage
                  student={activeStudent}
                  lessons={lessons}
                  quizQuestions={quizQuestions}
                  onSelectLesson={handleSelectLesson}
                  onOpenAddLesson={() => setIsAddLessonModalOpen(true)}
                  isTeacher={false}
                />
              )}

              {currentRoute === 'lesson-view' && (
                <LessonView
                  lesson={currentLesson}
                  student={activeStudent}
                  onNavigateToQuiz={() => setCurrentRoute('adaptive-quiz')}
                  onNavigateBack={() => setCurrentRoute('student-lessons')}
                  onCompleteLesson={handleCompleteLesson}
                />
              )}

              {currentRoute === 'adaptive-quiz' && (
                <AdaptiveQuiz
                  student={activeStudent}
                  questions={quizQuestions}
                  lessonId={selectedLessonId}
                  onUpdateFocusScore={handleUpdateFocusScore}
                  onCompleteQuiz={(finalScore, correctCount, totalQuestions, difficulty) => {
                    handleCompleteQuiz(finalScore, correctCount, totalQuestions, difficulty);
                  }}
                  onNavigateBack={() => setCurrentRoute('student-dashboard')}
                />
              )}

              {currentRoute === 'student-progress' && (
                <StudentProgressPage
                  student={activeStudent}
                  quizAttempts={quizAttempts}
                  completedLessons={completedLessons}
                  focusLogs={focusLogs}
                />
              )}
            </>
          )}

          {/* Teacher Routes */}
          {role === 'teacher' && (
            <>
              {currentRoute === 'teacher-dashboard' && (
                <TeacherDashboard
                  students={students}
                  submissions={submissions}
                  onNavigateToCreateProfile={() => setCurrentRoute('create-profile')}
                  onNavigateToAnalytics={() => setCurrentRoute('teacher-analytics')}
                  onNavigateToLessons={() => setCurrentRoute('teacher-lessons')}
                  onNavigateToQuizBank={() => setCurrentRoute('teacher-quiz-bank')}
                  onNavigateToSubmissions={() => setCurrentRoute('teacher-submissions')}
                  onOpenInspector={() => setIsInspectorModalOpen(true)}
                  onSelectStudentForInspection={(student) => {
                    setActiveStudentId(student.id);
                    setIsInspectorModalOpen(true);
                  }}
                />
              )}

              {currentRoute === 'teacher-submissions' && (
                <TeacherSubmissionsPage
                  submissions={submissions}
                  students={students}
                  onSaveFeedback={handleSaveTeacherFeedback}
                  onDeleteSubmission={handleDeleteSubmission}
                />
              )}

              {currentRoute === 'teacher-students' && (
                <TeacherStudentsPage
                  students={students}
                  onNavigateToCreateProfile={() => setCurrentRoute('create-profile')}
                  onSelectStudentForInspection={(student) => {
                    setActiveStudentId(student.id);
                    setIsInspectorModalOpen(true);
                  }}
                  onDeleteStudent={handleDeleteStudent}
                />
              )}

              {currentRoute === 'teacher-lessons' && (
                <StudentLessonsPage
                  student={activeStudent}
                  lessons={lessons}
                  quizQuestions={quizQuestions}
                  onSelectLesson={handleSelectLesson}
                  onOpenAddLesson={() => setIsAddLessonModalOpen(true)}
                  onDeleteLesson={handleDeleteLesson}
                  onAddQuestion={handleAddQuizQuestion}
                  isTeacher={true}
                />
              )}

              {currentRoute === 'teacher-quiz-bank' && (
                <TeacherQuizBankPage
                  questions={quizQuestions}
                  lessons={lessons}
                  onAddQuestion={handleAddQuizQuestion}
                  onDeleteQuestion={handleDeleteQuizQuestion}
                />
              )}

              {currentRoute === 'teacher-analytics' && (
                <TeacherAnalyticsPage
                  students={students}
                  quizAttempts={quizAttempts}
                  focusLogs={focusLogs}
                  completedLessons={completedLessons}
                />
              )}

              {currentRoute === 'teacher-settings' && (
                <div className="max-w-2xl mx-auto rounded-2xl bg-white p-6 border border-slate-200 space-y-4">
                  <h2 className="text-xl font-bold text-slate-900">Educator Settings & Class Model</h2>
                  <p className="text-xs text-slate-500">
                    Configure sensitivity thresholds for class-wide cognitive break suggestions and genetic knapsack bounds.
                  </p>
                  <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-900 space-y-2">
                    <strong className="block text-indigo-950">Capstone Soft Computing Parameter Defaults:</strong>
                    <div>• Fuzzy Defuzzification Method: Center of Gravity (Centroid)</div>
                    <div>• ANFIS Adaptation Threshold: Low (&lt;50), Medium (50–74), High (≥75)</div>
                    <div>• GA Optimization Target: Maximize sum(Engagement) s.t. Time ≤ Attention Span</div>
                  </div>
                  <button
                    onClick={() => setIsInspectorModalOpen(true)}
                    className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors"
                  >
                    Open Live Algorithm Inspector
                  </button>
                </div>
              )}
            </>
          )}



          {currentRoute === 'create-profile' && (
            <StudentProfilePage
              onSaveProfile={handleSaveProfile}
              onNavigateBack={() =>
                setCurrentRoute(role === 'teacher' ? 'teacher-students' : 'student-dashboard')
              }
            />
          )}
        </main>
      </div>

      {/* Sensory Break Modal with 4-7-8 Breathing Loop */}
      <BreakModal
        isOpen={isBreakModalOpen}
        onClose={(boostedScore) => {
          setIsBreakModalOpen(false);
          if (boostedScore) {
            handleUpdateFocusScore(boostedScore);
          }
        }}
        currentScore={activeStudent.currentFocusScore}
      />

      {/* Soft Computing Inspector Modal (Fuzzy Logic, ANFIS, Genetic Algorithm) */}
      <SoftComputingInspectorModal
        isOpen={isInspectorModalOpen}
        onClose={() => setIsInspectorModalOpen(false)}
        initialScore={activeStudent.currentFocusScore}
      />

      {/* Teacher Add Lesson Modal (Video, Presentation Slides, Adaptive Text) */}
      <AddLessonModal
        isOpen={isAddLessonModalOpen}
        onClose={() => setIsAddLessonModalOpen(false)}
        onSaveLesson={handleSaveNewLesson}
      />
    </div>
  );
}

