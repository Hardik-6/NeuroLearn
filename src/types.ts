export type Role = 'student' | 'teacher';

export type DiagnosisType = 'ADHD' | 'Autism' | 'Dyslexia' | 'Other';

export type LearningStyle = 'visual' | 'auditory' | 'kinesthetic' | 'reading';

export type FuzzyState = 'Optimal focus' | 'Good focus' | 'Steady attention' | 'Low focus' | 'Overloaded' | 'Distracted';

export interface StudentProfile {
  id: string;
  name: string;
  age: number;
  diagnoses: DiagnosisType[];
  sensorySensitivities: string[];
  attentionSpanMinutes: number;
  preferredLearningStyle: LearningStyle;
  currentFocusScore: number;
  fuzzyState: FuzzyState;
  avatarUrl?: string;
  recentAccuracy: number;
  avgResponseTimeSec: number;
  currentMood: number; // 1 to 5
}

export interface Activity {
  id: string;
  title: string;
  subject: string;
  duration: number; // minutes
  engagement: number; // 1 to 100 engagement score
  type: 'video' | 'interactive' | 'reading' | 'quiz';
  completed?: boolean;
}

export interface SlideItem {
  slideNumber: number;
  title: string;
  bullets: string[];
  visualCue?: string;
  speakerNotes?: string;
}

export interface LessonContent {
  id: string;
  title: string;
  subject: string;
  estimatedMinutes: number;
  description: string;
  sections: {
    heading: string;
    text: string;
    keyPoints?: string[];
  }[];
  videoUrl?: string; // YouTube embed / MP4 / video link
  videoTitle?: string;
  pptFileName?: string;
  pptUrl?: string; // presentation link or embed
  fileDataUrl?: string; // Embedded base64 / blob URL for PDF, PPT, and documents
  fileType?: string; // 'application/pdf', 'application/vnd.ms-powerpoint', etc.
  fileSize?: number;
  pptSlides?: SlideItem[];
  targetAccommodations?: string[];
  author?: string;
  createdAt?: string;
}

export interface QuizQuestion {
  id: string;
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  topic?: string;
  lessonId?: string; // Associates this MCQ with a specific lesson
}

export interface ContentAdaptationConfig {
  fontSize: '14px' | '16px' | '18px';
  lineSpacing: '1.4' | '1.6' | '1.8';
  theme: 'light' | 'cream' | 'dark';
  reason: string;
  ruleTriggered: string;
}

export interface QuizAttempt {
  id: string;
  studentId: string;
  lessonId?: string;
  scorePercent: number;
  correctCount: number;
  totalQuestions: number;
  timestamp: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface CompletedLessonRecord {
  id: string;
  lessonId: string;
  studentId: string;
  completedAt: string;
  durationMinutes: number;
  rating?: number;
}

export interface FocusSessionLog {
  id: string;
  studentId: string;
  focusScore: number;
  fuzzyState: FuzzyState;
  timestamp: string;
  note?: string;
}

export interface TeacherSuggestion {
  teacherName: string;
  suggestion: string;
  strengths?: string;
  recommendedAccommodations?: string[];
  status: 'pending' | 'reviewed';
  reviewedAt: string;
  score?: number;
}

export interface StudentSubmission {
  id: string;
  studentId: string;
  studentName: string;
  studentDiagnoses?: string[];
  lessonId: string;
  lessonTitle: string;
  mode: 'audio' | 'video' | 'mindmap' | 'text';
  audioBlobUrl?: string;
  audioDurationSec?: number;
  audioTranscript?: string;
  videoUrl?: string;
  videoFileName?: string;
  videoKeyPoints?: string[];
  textContent?: string;
  mindMapNodes?: Array<{
    id: string;
    label: string;
    category?: string;
    notes?: string;
    color?: string;
  }>;
  submittedAt: string;
  teacherFeedback?: TeacherSuggestion;
}

export interface AppSettings {
  activeRole: Role;
  activeStudentId: string;
  selectedLessonId: string;
  activeTheme?: 'light' | 'cream' | 'dark';
}

export interface NeuroLearnDataStore {
  students: StudentProfile[];
  lessons: LessonContent[];
  quizQuestions: QuizQuestion[];
  quizAttempts: QuizAttempt[];
  completedLessons: CompletedLessonRecord[];
  focusLogs: FocusSessionLog[];
  submissions: StudentSubmission[];
  settings: AppSettings;
}
