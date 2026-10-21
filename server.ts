import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import {
  INITIAL_STUDENTS,
  DEFAULT_LESSONS,
  MOCK_QUIZ_QUESTIONS,
  DEFAULT_SUBMISSIONS,
  DEFAULT_QUIZ_ATTEMPTS,
  DEFAULT_FOCUS_LOGS,
  DEFAULT_COMPLETED_LESSONS
} from './src/mockData';
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
} from './src/types';

// Persistent storage location on disk
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'neurolearn_db.json');

function getDefaultDatabase(): NeuroLearnDataStore {
  return {
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
}

function ensureDataDirectory(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readDB(): NeuroLearnDataStore {
  try {
    ensureDataDirectory();
    if (!fs.existsSync(DB_FILE)) {
      const initial = getDefaultDatabase();
      writeDB(initial);
      return initial;
    }

    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    if (!raw.trim()) {
      const initial = getDefaultDatabase();
      writeDB(initial);
      return initial;
    }

    const parsed = JSON.parse(raw);

    // Safeguard schema integrity
    const validated: NeuroLearnDataStore = {
      students: Array.isArray(parsed.students) && parsed.students.length > 0 ? parsed.students : INITIAL_STUDENTS,
      lessons: Array.isArray(parsed.lessons) && parsed.lessons.length > 0 ? parsed.lessons : DEFAULT_LESSONS,
      quizQuestions: Array.isArray(parsed.quizQuestions) && parsed.quizQuestions.length > 0 ? parsed.quizQuestions : MOCK_QUIZ_QUESTIONS,
      quizAttempts: Array.isArray(parsed.quizAttempts) && parsed.quizAttempts.length > 0 ? parsed.quizAttempts : DEFAULT_QUIZ_ATTEMPTS,
      completedLessons: Array.isArray(parsed.completedLessons) && parsed.completedLessons.length > 0 ? parsed.completedLessons : DEFAULT_COMPLETED_LESSONS,
      focusLogs: Array.isArray(parsed.focusLogs) && parsed.focusLogs.length > 0 ? parsed.focusLogs : DEFAULT_FOCUS_LOGS,
      submissions: Array.isArray(parsed.submissions) && parsed.submissions.length > 0 ? parsed.submissions : DEFAULT_SUBMISSIONS,
      settings: parsed.settings && typeof parsed.settings === 'object' ? {
        activeRole: parsed.settings.activeRole || 'student',
        activeStudentId: parsed.settings.activeStudentId || (INITIAL_STUDENTS[0]?.id || ''),
        selectedLessonId: parsed.settings.selectedLessonId || (parsed.lessons?.[0]?.id || DEFAULT_LESSONS[0]?.id || ''),
        activeTheme: parsed.settings.activeTheme || 'light'
      } : {
        activeRole: 'student',
        activeStudentId: INITIAL_STUDENTS[0]?.id || '',
        selectedLessonId: DEFAULT_LESSONS[0]?.id || '',
        activeTheme: 'light'
      }
    };

    return validated;
  } catch (err) {
    console.error('Error reading persistent database from disk:', err);
    try {
      if (fs.existsSync(DB_FILE)) {
        const corruptedBackup = path.join(DATA_DIR, `neurolearn_db.corrupted.${Date.now()}.json`);
        fs.copyFileSync(DB_FILE, corruptedBackup);
        console.warn(`Corrupted database backed up to ${corruptedBackup}`);
      }
    } catch (e) {
      console.error('Failed to create backup:', e);
    }
    const fallback = getDefaultDatabase();
    writeDB(fallback);
    return fallback;
  }
}

function writeDB(data: NeuroLearnDataStore): void {
  try {
    ensureDataDirectory();
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error('Error writing persistent database to disk:', err);
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e2) {
      console.error('Direct disk write also failed:', e2);
    }
  }
}

// Lazy Gemini client helper
let aiClient: GoogleGenAI | null = null;
function getGeminiAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Ensure high body limit for file and PDF attachments (up to 50MB)
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Initialize and verify database on boot
  const initialData = readDB();
  console.log(
    `[NeuroLearn DB] Initialized persistent storage at: ${DB_FILE} (${initialData.lessons.length} lessons, ${initialData.quizQuestions.length} MCQs, ${initialData.submissions.length} submissions, ${initialData.students.length} students)`
  );

  // 1. Health check endpoint with storage telemetry
  app.get('/api/health', (req, res) => {
    const db = readDB();
    res.json({
      status: 'ok',
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
      storage: {
        location: DB_FILE,
        studentsCount: db.students.length,
        lessonsCount: db.lessons.length,
        quizQuestionsCount: db.quizQuestions.length,
        quizAttemptsCount: db.quizAttempts.length,
        completedLessonsCount: db.completedLessons.length,
        focusLogsCount: db.focusLogs.length,
        submissionsCount: db.submissions.length
      }
    });
  });

  // 2. Full Data Store API
  app.get('/api/data', (req, res) => {
    try {
      const db = readDB();
      res.json(db);
    } catch (e) {
      res.status(500).json({ error: 'Failed to retrieve database' });
    }
  });

  app.post('/api/data', (req, res) => {
    try {
      const incoming = req.body as Partial<NeuroLearnDataStore>;
      const current = readDB();
      const merged: NeuroLearnDataStore = {
        students: Array.isArray(incoming.students) ? incoming.students : current.students,
        lessons: Array.isArray(incoming.lessons) ? incoming.lessons : current.lessons,
        quizQuestions: Array.isArray(incoming.quizQuestions) ? incoming.quizQuestions : current.quizQuestions,
        quizAttempts: Array.isArray(incoming.quizAttempts) ? incoming.quizAttempts : current.quizAttempts,
        completedLessons: Array.isArray(incoming.completedLessons) ? incoming.completedLessons : current.completedLessons,
        focusLogs: Array.isArray(incoming.focusLogs) ? incoming.focusLogs : current.focusLogs,
        submissions: Array.isArray(incoming.submissions) ? incoming.submissions : current.submissions,
        settings: incoming.settings ? { ...current.settings, ...incoming.settings } : current.settings
      };
      writeDB(merged);
      res.json({ success: true, data: merged });
    } catch (e) {
      res.status(500).json({ error: 'Failed to save database' });
    }
  });

  // 3. Lessons Endpoints
  app.get('/api/lessons', (req, res) => {
    const db = readDB();
    res.json(db.lessons);
  });

  app.post('/api/lessons', (req, res) => {
    try {
      const lesson = req.body as LessonContent;
      if (!lesson || !lesson.title) {
        return res.status(400).json({ error: 'Valid lesson object required' });
      }
      const db = readDB();
      const existingIdx = db.lessons.findIndex((l) => l.id === lesson.id);
      if (existingIdx >= 0) {
        db.lessons[existingIdx] = lesson;
      } else {
        db.lessons.unshift(lesson);
      }
      db.settings.selectedLessonId = lesson.id;
      writeDB(db);
      res.json({ success: true, lesson, count: db.lessons.length });
    } catch (e) {
      res.status(500).json({ error: 'Failed to save lesson' });
    }
  });

  app.delete('/api/lessons/:id', (req, res) => {
    try {
      const { id } = req.params;
      const db = readDB();
      db.lessons = db.lessons.filter((l) => l.id !== id);
      if (db.settings.selectedLessonId === id) {
        db.settings.selectedLessonId = db.lessons[0]?.id || '';
      }
      writeDB(db);
      res.json({ success: true, deletedId: id, count: db.lessons.length });
    } catch (e) {
      res.status(500).json({ error: 'Failed to delete lesson' });
    }
  });

  // 4. Quiz Questions Endpoints
  app.get('/api/quiz', (req, res) => {
    const db = readDB();
    res.json(db.quizQuestions);
  });

  app.post('/api/quiz', (req, res) => {
    try {
      const question = req.body as QuizQuestion;
      if (!question || !question.question) {
        return res.status(400).json({ error: 'Valid question object required' });
      }
      const db = readDB();
      const existingIdx = db.quizQuestions.findIndex((q) => q.id === question.id);
      if (existingIdx >= 0) {
        db.quizQuestions[existingIdx] = question;
      } else {
        db.quizQuestions.unshift(question);
      }
      writeDB(db);
      res.json({ success: true, question, count: db.quizQuestions.length });
    } catch (e) {
      res.status(500).json({ error: 'Failed to save quiz question' });
    }
  });

  app.delete('/api/quiz/:id', (req, res) => {
    try {
      const { id } = req.params;
      const db = readDB();
      db.quizQuestions = db.quizQuestions.filter((q) => q.id !== id);
      writeDB(db);
      res.json({ success: true, deletedId: id, count: db.quizQuestions.length });
    } catch (e) {
      res.status(500).json({ error: 'Failed to delete quiz question' });
    }
  });

  // 5. Students Endpoints
  app.get('/api/students', (req, res) => {
    const db = readDB();
    res.json(db.students);
  });

  app.post('/api/students', (req, res) => {
    try {
      const student = req.body as StudentProfile;
      if (!student || !student.name) {
        return res.status(400).json({ error: 'Valid student profile required' });
      }
      const db = readDB();
      const existingIdx = db.students.findIndex((s) => s.id === student.id);
      if (existingIdx >= 0) {
        db.students[existingIdx] = student;
      } else {
        db.students.unshift(student);
      }
      db.settings.activeStudentId = student.id;
      writeDB(db);
      res.json({ success: true, student, count: db.students.length });
    } catch (e) {
      res.status(500).json({ error: 'Failed to save student profile' });
    }
  });

  app.delete('/api/students/:id', (req, res) => {
    try {
      const { id } = req.params;
      const db = readDB();
      db.students = db.students.filter((s) => s.id !== id);
      if (db.settings.activeStudentId === id) {
        db.settings.activeStudentId = db.students[0]?.id || '';
      }
      writeDB(db);
      res.json({ success: true, deletedId: id, count: db.students.length });
    } catch (e) {
      res.status(500).json({ error: 'Failed to delete student profile' });
    }
  });

  // 6. Learning Progress & Analytics Endpoints
  app.post('/api/progress/complete-lesson', (req, res) => {
    try {
      const { lessonId, studentId, durationMinutes, rating } = req.body;
      if (!lessonId) {
        return res.status(400).json({ error: 'lessonId required' });
      }
      const db = readDB();
      const record: CompletedLessonRecord = {
        id: `comp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        lessonId,
        studentId: studentId || db.settings.activeStudentId || 'guest-learner',
        completedAt: new Date().toISOString(),
        durationMinutes: Number(durationMinutes) || 15,
        rating: rating ? Number(rating) : undefined
      };
      db.completedLessons.unshift(record);
      writeDB(db);
      res.json({ success: true, record, totalCompleted: db.completedLessons.length });
    } catch (e) {
      res.status(500).json({ error: 'Failed to record completed lesson' });
    }
  });

  app.post('/api/progress/quiz-attempt', (req, res) => {
    try {
      const { studentId, lessonId, scorePercent, correctCount, totalQuestions, difficulty } = req.body;
      const db = readDB();
      const attempt: QuizAttempt = {
        id: `qa-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        studentId: studentId || db.settings.activeStudentId || 'guest-learner',
        lessonId,
        scorePercent: Number(scorePercent) || 0,
        correctCount: Number(correctCount) || 0,
        totalQuestions: Number(totalQuestions) || 1,
        timestamp: new Date().toISOString(),
        difficulty: difficulty || 'medium'
      };
      db.quizAttempts.unshift(attempt);

      // Update student profile metrics
      const targetStudentId = studentId || db.settings.activeStudentId;
      if (targetStudentId) {
        const student = db.students.find((s) => s.id === targetStudentId);
        if (student) {
          student.recentAccuracy = attempt.scorePercent;
        }
      }

      writeDB(db);
      res.json({ success: true, attempt, totalAttempts: db.quizAttempts.length });
    } catch (e) {
      res.status(500).json({ error: 'Failed to record quiz attempt' });
    }
  });

  app.post('/api/progress/focus-log', (req, res) => {
    try {
      const { studentId, focusScore, fuzzyState, note } = req.body;
      const db = readDB();
      const log: FocusSessionLog = {
        id: `fl-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        studentId: studentId || db.settings.activeStudentId || 'guest-learner',
        focusScore: Math.min(100, Math.max(0, Math.round(Number(focusScore) || 75))),
        fuzzyState: fuzzyState || 'Optimal focus',
        timestamp: new Date().toISOString(),
        note
      };
      db.focusLogs.unshift(log);

      if (db.focusLogs.length > 150) {
        db.focusLogs = db.focusLogs.slice(0, 150);
      }

      const targetStudentId = studentId || db.settings.activeStudentId;
      if (targetStudentId) {
        const student = db.students.find((s) => s.id === targetStudentId);
        if (student) {
          student.currentFocusScore = log.focusScore;
          student.fuzzyState = log.fuzzyState;
        }
      }

      writeDB(db);
      res.json({ success: true, log });
    } catch (e) {
      res.status(500).json({ error: 'Failed to record focus log' });
    }
  });

  // 7. Settings Endpoints
  app.get('/api/settings', (req, res) => {
    const db = readDB();
    res.json(db.settings);
  });

  app.post('/api/settings', (req, res) => {
    try {
      const newSettings = req.body;
      const db = readDB();
      db.settings = { ...db.settings, ...newSettings };
      writeDB(db);
      res.json({ success: true, settings: db.settings });
    } catch (e) {
      res.status(500).json({ error: 'Failed to update settings' });
    }
  });

  // 8. Student Submissions & Teacher Feedback/Suggestions Endpoints
  app.get('/api/submissions', (req, res) => {
    try {
      const db = readDB();
      res.json(db.submissions || []);
    } catch (e) {
      res.status(500).json({ error: 'Failed to retrieve submissions' });
    }
  });

  app.post('/api/submissions', (req, res) => {
    try {
      const sub = req.body as StudentSubmission;
      if (!sub || !sub.studentId) {
        return res.status(400).json({ error: 'Valid submission with studentId required' });
      }
      const db = readDB();
      const existingIdx = (db.submissions || []).findIndex((s) => s.id === sub.id);
      if (!db.submissions) db.submissions = [];

      if (existingIdx >= 0) {
        db.submissions[existingIdx] = sub;
      } else {
        db.submissions.unshift(sub);
      }

      writeDB(db);
      res.json({ success: true, submission: sub, count: db.submissions.length });
    } catch (e) {
      res.status(500).json({ error: 'Failed to save submission' });
    }
  });

  app.post('/api/submissions/:id/feedback', (req, res) => {
    try {
      const { id } = req.params;
      const feedback = req.body as TeacherSuggestion;
      if (!feedback || !feedback.suggestion) {
        return res.status(400).json({ error: 'Teacher suggestion is required' });
      }
      const db = readDB();
      if (!db.submissions) db.submissions = [];
      const sub = db.submissions.find((s) => s.id === id);
      if (!sub) {
        return res.status(404).json({ error: 'Submission not found' });
      }

      sub.teacherFeedback = {
        teacherName: feedback.teacherName || 'Ms. Priya (Special Educator)',
        suggestion: feedback.suggestion,
        strengths: feedback.strengths || '',
        recommendedAccommodations: Array.isArray(feedback.recommendedAccommodations)
          ? feedback.recommendedAccommodations
          : [],
        status: 'reviewed',
        reviewedAt: new Date().toISOString(),
        score: feedback.score
      };

      writeDB(db);
      res.json({ success: true, submission: sub });
    } catch (e) {
      res.status(500).json({ error: 'Failed to record teacher suggestion' });
    }
  });

  app.delete('/api/submissions/:id', (req, res) => {
    try {
      const { id } = req.params;
      const db = readDB();
      if (db.submissions) {
        db.submissions = db.submissions.filter((s) => s.id !== id);
        writeDB(db);
      }
      res.json({ success: true, deletedId: id });
    } catch (e) {
      res.status(500).json({ error: 'Failed to delete submission' });
    }
  });

  // Vite middleware in dev or static files in prod
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        watch: {
          ignored: ['**/data/**', '**/neurolearn_db.json']
        }
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`NeuroLearn server running on http://0.0.0.0:${PORT}`);
  });

  process.on('SIGTERM', () => {
    server.close();
  });
  process.on('SIGINT', () => {
    server.close();
  });
}

startServer();

