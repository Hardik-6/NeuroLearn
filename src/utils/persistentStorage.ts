import {
  StudentProfile,
  LessonContent,
  QuizQuestion,
  QuizAttempt,
  CompletedLessonRecord,
  FocusSessionLog,
  AppSettings,
  NeuroLearnDataStore,
  StudentSubmission,
  TeacherSuggestion
} from '../types';
import {
  INITIAL_STUDENTS,
  DEFAULT_LESSONS,
  MOCK_QUIZ_QUESTIONS,
  DEFAULT_SUBMISSIONS,
  DEFAULT_QUIZ_ATTEMPTS,
  DEFAULT_FOCUS_LOGS,
  DEFAULT_COMPLETED_LESSONS
} from '../mockData';

const DB_NAME = 'neurolearn_adaptive_db';
const DB_VERSION = 1;

const STORES = {
  STUDENTS: 'students',
  LESSONS: 'lessons',
  QUIZ: 'quiz_questions',
  COMPLETED_LESSONS: 'completed_lessons',
  QUIZ_ATTEMPTS: 'quiz_attempts',
  FOCUS_LOGS: 'focus_logs',
  SETTINGS: 'settings',
  META: 'meta'
};

export const STORAGE_KEYS = {
  STUDENTS: 'neuro_learn_students',
  ACTIVE_STUDENT_ID: 'neuro_learn_active_student_id',
  LESSONS: 'neuro_learn_lessons',
  SELECTED_LESSON_ID: 'neuro_learn_selected_lesson_id',
  QUIZ: 'neuro_learn_quiz_questions',
  COMPLETED_LESSONS: 'neuro_learn_completed_lessons',
  QUIZ_ATTEMPTS: 'neuro_learn_quiz_attempts',
  FOCUS_LOGS: 'neuro_learn_focus_logs',
  SUBMISSIONS: 'neuro_learn_submissions',
  SETTINGS: 'neuro_learn_settings'
};

// Open IndexedDB safely
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported in this environment'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORES.STUDENTS)) {
        db.createObjectStore(STORES.STUDENTS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.LESSONS)) {
        db.createObjectStore(STORES.LESSONS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.QUIZ)) {
        db.createObjectStore(STORES.QUIZ, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.COMPLETED_LESSONS)) {
        db.createObjectStore(STORES.COMPLETED_LESSONS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.QUIZ_ATTEMPTS)) {
        db.createObjectStore(STORES.QUIZ_ATTEMPTS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.FOCUS_LOGS)) {
        db.createObjectStore(STORES.FOCUS_LOGS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
        db.createObjectStore(STORES.SETTINGS, { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains(STORES.META)) {
        db.createObjectStore(STORES.META, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// -------------------------------------------------------------
// FULL STORE LOAD (Backend Server-First with IndexedDB/LocalStorage Cache)
// -------------------------------------------------------------

export async function loadFullDataStore(): Promise<NeuroLearnDataStore> {
  // 1. First attempt to fetch from server's persistent disk storage
  try {
    const res = await fetch('/api/data');
    if (res.ok) {
      const serverData = (await res.json()) as NeuroLearnDataStore;
      if (serverData && Array.isArray(serverData.lessons) && Array.isArray(serverData.students)) {
        // Cache to IndexedDB and LocalStorage for zero-latency hydration
        cacheStoreLocally(serverData);
        return serverData;
      }
    }
  } catch (err) {
    console.warn('Unable to reach /api/data, falling back to local persistent cache:', err);
  }

  // 2. Fallback to IndexedDB / LocalStorage cache
  const cached = await loadStoreFromLocalCache();
  return cached;
}

async function cacheStoreLocally(data: NeuroLearnDataStore): Promise<void> {
  try {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(data.students));
    localStorage.setItem(STORAGE_KEYS.QUIZ, JSON.stringify(data.quizQuestions));
    localStorage.setItem(STORAGE_KEYS.COMPLETED_LESSONS, JSON.stringify(data.completedLessons));
    localStorage.setItem(STORAGE_KEYS.QUIZ_ATTEMPTS, JSON.stringify(data.quizAttempts));
    localStorage.setItem(STORAGE_KEYS.FOCUS_LOGS, JSON.stringify(data.focusLogs));
    localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(data.submissions || []));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));

    // For lessons, sanitize large base64 strings in localStorage if needed
    try {
      localStorage.setItem(STORAGE_KEYS.LESSONS, JSON.stringify(data.lessons));
    } catch {
      const sanitized = data.lessons.map((l) => ({
        ...l,
        fileDataUrl: l.fileDataUrl && l.fileDataUrl.length > 50000 ? undefined : l.fileDataUrl
      }));
      localStorage.setItem(STORAGE_KEYS.LESSONS, JSON.stringify(sanitized));
    }

    const db = await openDB();
    const tx = db.transaction(
      [STORES.STUDENTS, STORES.LESSONS, STORES.QUIZ, STORES.META],
      'readwrite'
    );
    const lessonStore = tx.objectStore(STORES.LESSONS);
    lessonStore.clear();
    for (const les of data.lessons) {
      lessonStore.put(les);
    }
    const studentStore = tx.objectStore(STORES.STUDENTS);
    studentStore.clear();
    for (const st of data.students) {
      studentStore.put(st);
    }
    const quizStore = tx.objectStore(STORES.QUIZ);
    quizStore.clear();
    for (const q of data.quizQuestions) {
      quizStore.put(q);
    }
    const metaStore = tx.objectStore(STORES.META);
    metaStore.put({ key: 'initialized', value: true });
  } catch (err) {
    console.warn('Local caching error:', err);
  }
}

async function loadStoreFromLocalCache(): Promise<NeuroLearnDataStore> {
  const defaultStore: NeuroLearnDataStore = {
    students: INITIAL_STUDENTS,
    lessons: DEFAULT_LESSONS,
    quizQuestions: MOCK_QUIZ_QUESTIONS,
    quizAttempts: DEFAULT_QUIZ_ATTEMPTS,
    completedLessons: DEFAULT_COMPLETED_LESSONS,
    focusLogs: DEFAULT_FOCUS_LOGS,
    submissions: DEFAULT_SUBMISSIONS,
    settings: {
      activeRole: 'student',
      activeStudentId: INITIAL_STUDENTS[0]?.id || '',
      selectedLessonId: DEFAULT_LESSONS[0]?.id || '',
      activeTheme: 'light'
    }
  };

  try {
    const rawStudents = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    const rawLessons = localStorage.getItem(STORAGE_KEYS.LESSONS);
    const rawQuiz = localStorage.getItem(STORAGE_KEYS.QUIZ);
    const rawCompleted = localStorage.getItem(STORAGE_KEYS.COMPLETED_LESSONS);
    const rawAttempts = localStorage.getItem(STORAGE_KEYS.QUIZ_ATTEMPTS);
    const rawFocus = localStorage.getItem(STORAGE_KEYS.FOCUS_LOGS);
    const rawSubmissions = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
    const rawSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);

    if (rawStudents) defaultStore.students = JSON.parse(rawStudents);
    if (rawLessons) defaultStore.lessons = JSON.parse(rawLessons);
    if (rawQuiz) defaultStore.quizQuestions = JSON.parse(rawQuiz);
    if (rawCompleted) defaultStore.completedLessons = JSON.parse(rawCompleted);
    if (rawAttempts) defaultStore.quizAttempts = JSON.parse(rawAttempts);
    if (rawFocus) defaultStore.focusLogs = JSON.parse(rawFocus);
    if (rawSubmissions) defaultStore.submissions = JSON.parse(rawSubmissions);
    if (rawSettings) defaultStore.settings = JSON.parse(rawSettings);
  } catch (e) {
    console.warn('Failed parsing localStorage cache:', e);
  }

  return defaultStore;
}

// -------------------------------------------------------------
// LESSONS PERSISTENCE
// -------------------------------------------------------------

export async function saveLessonsToStorage(lessons: LessonContent[]): Promise<void> {
  // 1. Post to server persistent file database
  try {
    await fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lessons })
    });
  } catch (err) {
    console.warn('Failed saving lessons to /api/data:', err);
  }

  // 2. Save to IndexedDB
  try {
    const db = await openDB();
    const tx = db.transaction(STORES.LESSONS, 'readwrite');
    const store = tx.objectStore(STORES.LESSONS);
    await new Promise<void>((res, rej) => {
      const clearReq = store.clear();
      clearReq.onsuccess = () => res();
      clearReq.onerror = () => rej(clearReq.error);
    });

    for (const les of lessons) {
      store.put(les);
    }

    await new Promise<void>((res, rej) => {
      tx.oncomplete = () => res();
      tx.onerror = () => rej(tx.error);
    });
  } catch (err) {
    console.warn('IndexedDB save lessons failed:', err);
  }

  // 3. Save to LocalStorage
  try {
    localStorage.setItem(STORAGE_KEYS.LESSONS, JSON.stringify(lessons));
  } catch {
    try {
      const sanitized = lessons.map((l) => ({
        ...l,
        fileDataUrl: l.fileDataUrl && l.fileDataUrl.length > 50000 ? undefined : l.fileDataUrl
      }));
      localStorage.setItem(STORAGE_KEYS.LESSONS, JSON.stringify(sanitized));
    } catch (e2) {
      console.warn('LocalStorage save lessons failed:', e2);
    }
  }
}

export async function deleteLessonFromStorage(lessonId: string): Promise<void> {
  // 1. Server delete
  try {
    await fetch(`/api/lessons/${encodeURIComponent(lessonId)}`, {
      method: 'DELETE'
    });
  } catch (err) {
    console.warn(`Failed calling DELETE /api/lessons/${lessonId}:`, err);
  }

  // 2. Local delete
  try {
    const db = await openDB();
    const tx = db.transaction(STORES.LESSONS, 'readwrite');
    tx.objectStore(STORES.LESSONS).delete(lessonId);
  } catch (e) {
    console.warn('IndexedDB delete lesson failed:', e);
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LESSONS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const filtered = parsed.filter((l: LessonContent) => l.id !== lessonId);
        localStorage.setItem(STORAGE_KEYS.LESSONS, JSON.stringify(filtered));
      }
    }
  } catch (e) {
    console.warn('LocalStorage delete lesson failed:', e);
  }
}

export async function loadLessonsFromStorage(): Promise<LessonContent[]> {
  try {
    const res = await fetch('/api/lessons');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch (err) {
    console.warn('Fetch /api/lessons failed, checking local:', err);
  }

  // IndexedDB check
  try {
    const db = await openDB();
    const tx = db.transaction(STORES.LESSONS, 'readonly');
    const store = tx.objectStore(STORES.LESSONS);
    const all = await new Promise<LessonContent[]>((res, rej) => {
      const req = store.getAll();
      req.onsuccess = () => res(req.result || []);
      req.onerror = () => rej(req.error);
    });
    if (all.length > 0) return all;
  } catch (err) {
    console.warn('IndexedDB load lessons failed:', err);
  }

  // LocalStorage check
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.LESSONS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {}

  return DEFAULT_LESSONS;
}

// -------------------------------------------------------------
// QUIZ QUESTIONS PERSISTENCE
// -------------------------------------------------------------

export async function saveQuizToStorage(questions: QuizQuestion[]): Promise<void> {
  // 1. Server write
  try {
    await fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quizQuestions: questions })
    });
  } catch (err) {
    console.warn('Failed saving quiz questions to /api/data:', err);
  }

  // 2. IndexedDB
  try {
    const db = await openDB();
    const tx = db.transaction([STORES.QUIZ, STORES.META], 'readwrite');
    const store = tx.objectStore(STORES.QUIZ);
    const metaStore = tx.objectStore(STORES.META);

    await new Promise<void>((res, rej) => {
      const clearReq = store.clear();
      clearReq.onsuccess = () => res();
      clearReq.onerror = () => rej(clearReq.error);
    });

    for (const q of questions) {
      store.put(q);
    }
    metaStore.put({ key: 'quiz_initialized', value: true });

    await new Promise<void>((res, rej) => {
      tx.oncomplete = () => res();
      tx.onerror = () => rej(tx.error);
    });
  } catch (err) {
    console.warn('IndexedDB save quiz failed:', err);
  }

  // 3. LocalStorage
  try {
    localStorage.setItem(STORAGE_KEYS.QUIZ, JSON.stringify(questions));
    localStorage.setItem('neuro_learn_quiz_saved', 'true');
  } catch (err) {
    console.warn('LocalStorage save quiz failed:', err);
  }
}

export async function deleteQuizQuestionFromStorage(questionId: string): Promise<void> {
  // 1. Server delete
  try {
    await fetch(`/api/quiz/${encodeURIComponent(questionId)}`, {
      method: 'DELETE'
    });
  } catch (err) {
    console.warn(`Failed calling DELETE /api/quiz/${questionId}:`, err);
  }

  // 2. IndexedDB delete
  try {
    const db = await openDB();
    const tx = db.transaction(STORES.QUIZ, 'readwrite');
    tx.objectStore(STORES.QUIZ).delete(questionId);
  } catch (e) {
    console.warn('IndexedDB delete quiz question failed:', e);
  }

  // 3. LocalStorage delete
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.QUIZ);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const filtered = parsed.filter((q: QuizQuestion) => q.id !== questionId);
        localStorage.setItem(STORAGE_KEYS.QUIZ, JSON.stringify(filtered));
      }
    }
  } catch (e) {
    console.warn('LocalStorage delete quiz question failed:', e);
  }
}

export async function loadQuizFromStorage(): Promise<QuizQuestion[]> {
  try {
    const res = await fetch('/api/quiz');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        return data;
      }
    }
  } catch (err) {
    console.warn('Fetch /api/quiz failed, checking local:', err);
  }

  try {
    const db = await openDB();
    const metaTx = db.transaction(STORES.META, 'readonly');
    const hasBeenInit = await new Promise<boolean>((res) => {
      const req = metaTx.objectStore(STORES.META).get('quiz_initialized');
      req.onsuccess = () => res(Boolean(req.result?.value));
      req.onerror = () => res(false);
    });

    if (hasBeenInit) {
      const tx = db.transaction(STORES.QUIZ, 'readonly');
      const all = await new Promise<QuizQuestion[]>((res, rej) => {
        const req = tx.objectStore(STORES.QUIZ).getAll();
        req.onsuccess = () => res(req.result || []);
        req.onerror = () => rej(req.error);
      });
      return all;
    }
  } catch (err) {
    console.warn('IndexedDB load quiz failed:', err);
  }

  try {
    const isSaved = localStorage.getItem('neuro_learn_quiz_saved');
    const saved = localStorage.getItem(STORAGE_KEYS.QUIZ);
    if (isSaved === 'true' && saved !== null) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    } else if (saved !== null) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.warn('LocalStorage load quiz failed:', err);
  }

  return MOCK_QUIZ_QUESTIONS;
}

// -------------------------------------------------------------
// STUDENTS PERSISTENCE
// -------------------------------------------------------------

export async function saveStudentsToStorage(students: StudentProfile[]): Promise<void> {
  try {
    await fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ students })
    });
  } catch (err) {
    console.warn('Failed saving students to /api/data:', err);
  }

  try {
    const db = await openDB();
    const tx = db.transaction(STORES.STUDENTS, 'readwrite');
    const store = tx.objectStore(STORES.STUDENTS);
    await new Promise<void>((res, rej) => {
      const clearReq = store.clear();
      clearReq.onsuccess = () => res();
      clearReq.onerror = () => rej(clearReq.error);
    });
    for (const s of students) {
      store.put(s);
    }
  } catch (err) {
    console.warn('IndexedDB save students failed:', err);
  }

  try {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  } catch (e) {
    console.warn('LocalStorage save students failed:', e);
  }
}

export async function deleteStudentFromStorage(studentId: string): Promise<void> {
  try {
    await fetch(`/api/students/${encodeURIComponent(studentId)}`, {
      method: 'DELETE'
    });
  } catch (err) {
    console.warn(`Failed calling DELETE /api/students/${studentId}:`, err);
  }

  try {
    const db = await openDB();
    const tx = db.transaction(STORES.STUDENTS, 'readwrite');
    tx.objectStore(STORES.STUDENTS).delete(studentId);
  } catch (e) {}

  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const filtered = parsed.filter((s: StudentProfile) => s.id !== studentId);
        localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(filtered));
      }
    }
  } catch (e) {}
}

export async function loadStudentsFromStorage(): Promise<StudentProfile[]> {
  try {
    const res = await fetch('/api/students');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch (err) {
    console.warn('Fetch /api/students failed, checking local:', err);
  }

  try {
    const db = await openDB();
    const tx = db.transaction(STORES.STUDENTS, 'readonly');
    const all = await new Promise<StudentProfile[]>((res, rej) => {
      const req = tx.objectStore(STORES.STUDENTS).getAll();
      req.onsuccess = () => res(req.result || []);
      req.onerror = () => rej(req.error);
    });
    if (all.length > 0) return all;
  } catch (err) {}

  try {
    const saved = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}

  return INITIAL_STUDENTS;
}

// -------------------------------------------------------------
// PROGRESS, QUIZ RESULTS, AND SETTINGS
// -------------------------------------------------------------

export async function recordCompletedLesson(
  lessonId: string,
  studentId: string,
  durationMinutes = 15
): Promise<CompletedLessonRecord | null> {
  try {
    const res = await fetch('/api/progress/complete-lesson', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lessonId, studentId, durationMinutes })
    });
    if (res.ok) {
      const data = await res.json();
      return data.record;
    }
  } catch (e) {
    console.warn('Failed recording completed lesson to server:', e);
  }

  // Fallback client log
  const record: CompletedLessonRecord = {
    id: `comp-${Date.now()}`,
    lessonId,
    studentId,
    completedAt: new Date().toISOString(),
    durationMinutes
  };
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COMPLETED_LESSONS);
    const list = raw ? JSON.parse(raw) : [];
    list.unshift(record);
    localStorage.setItem(STORAGE_KEYS.COMPLETED_LESSONS, JSON.stringify(list));
  } catch (e) {}
  return record;
}

export async function recordQuizAttempt(
  attempt: Omit<QuizAttempt, 'id' | 'timestamp'>
): Promise<QuizAttempt | null> {
  try {
    const res = await fetch('/api/progress/quiz-attempt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(attempt)
    });
    if (res.ok) {
      const data = await res.json();
      return data.attempt;
    }
  } catch (e) {
    console.warn('Failed recording quiz attempt to server:', e);
  }

  const record: QuizAttempt = {
    ...attempt,
    id: `qa-${Date.now()}`,
    timestamp: new Date().toISOString()
  };
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.QUIZ_ATTEMPTS);
    const list = raw ? JSON.parse(raw) : [];
    list.unshift(record);
    localStorage.setItem(STORAGE_KEYS.QUIZ_ATTEMPTS, JSON.stringify(list));
  } catch (e) {}
  return record;
}

export async function recordFocusLog(
  studentId: string,
  focusScore: number,
  fuzzyState: any,
  note?: string
): Promise<FocusSessionLog | null> {
  try {
    const res = await fetch('/api/progress/focus-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, focusScore, fuzzyState, note })
    });
    if (res.ok) {
      const data = await res.json();
      return data.log;
    }
  } catch (e) {
    console.warn('Failed recording focus log to server:', e);
  }

  const log: FocusSessionLog = {
    id: `fl-${Date.now()}`,
    studentId,
    focusScore,
    fuzzyState,
    timestamp: new Date().toISOString(),
    note
  };
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FOCUS_LOGS);
    const list = raw ? JSON.parse(raw) : [];
    list.unshift(log);
    localStorage.setItem(STORAGE_KEYS.FOCUS_LOGS, JSON.stringify(list));
  } catch (e) {}
  return log;
}

export async function saveSettingsToStorage(settings: Partial<AppSettings>): Promise<void> {
  try {
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
  } catch (e) {
    console.warn('Failed saving settings to server:', e);
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    const existing = raw ? JSON.parse(raw) : {};
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({ ...existing, ...settings }));
  } catch (e) {}
}

// -------------------------------------------------------------
// VOICE & VIDEO STUDENT SUBMISSIONS & TEACHER FEEDBACK
// -------------------------------------------------------------

export async function saveSubmissionToStorage(
  submission: StudentSubmission
): Promise<StudentSubmission> {
  try {
    const res = await fetch('/api/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submission)
    });
    if (res.ok) {
      const data = await res.json();
      if (data.submission) return data.submission;
    }
  } catch (e) {
    console.warn('Failed saving submission to server:', e);
  }

  // Fallback to localStorage
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
    const list: StudentSubmission[] = raw ? JSON.parse(raw) : [...DEFAULT_SUBMISSIONS];
    const existingIdx = list.findIndex((s) => s.id === submission.id);
    if (existingIdx >= 0) {
      list[existingIdx] = submission;
    } else {
      list.unshift(submission);
    }
    localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(list));
  } catch (e) {}

  return submission;
}

export async function saveTeacherFeedbackToStorage(
  submissionId: string,
  feedback: TeacherSuggestion
): Promise<StudentSubmission | null> {
  try {
    const res = await fetch(`/api/submissions/${submissionId}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(feedback)
    });
    if (res.ok) {
      const data = await res.json();
      if (data.submission) return data.submission;
    }
  } catch (e) {
    console.warn('Failed saving teacher feedback to server:', e);
  }

  // Fallback to localStorage
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
    const list: StudentSubmission[] = raw ? JSON.parse(raw) : [...DEFAULT_SUBMISSIONS];
    const sub = list.find((s) => s.id === submissionId);
    if (sub) {
      sub.teacherFeedback = feedback;
      localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(list));
      return sub;
    }
  } catch (e) {}

  return null;
}

export async function deleteSubmissionFromStorage(submissionId: string): Promise<void> {
  try {
    await fetch(`/api/submissions/${submissionId}`, { method: 'DELETE' });
  } catch (e) {
    console.warn('Failed deleting submission from server:', e);
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
    if (raw) {
      const list: StudentSubmission[] = JSON.parse(raw);
      const updated = list.filter((s) => s.id !== submissionId);
      localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(updated));
    }
  } catch (e) {}
}
