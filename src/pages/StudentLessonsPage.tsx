import React, { useState } from 'react';
import { Sparkles, Clock, Compass, Play, BookOpen, CheckCircle, Video, HelpCircle, FileText, Plus, Presentation, Trash2 } from 'lucide-react';
import { StudentProfile, Activity, LessonContent, QuizQuestion } from '../types';
import { MOCK_ACTIVITIES, DEFAULT_LESSONS } from '../mockData';
import { optimizeLessonOrder } from '../algorithms/softComputing';
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal';
import { AddQuestionModal } from '../components/AddQuestionModal';

interface StudentLessonsPageProps {
  student: StudentProfile;
  onSelectLesson: (lessonId: string) => void;
  lessons?: LessonContent[];
  quizQuestions?: QuizQuestion[];
  onOpenAddLesson?: () => void;
  onDeleteLesson?: (lessonId: string) => void;
  onAddQuestion?: (q: QuizQuestion) => void;
  isTeacher?: boolean;
}

export const StudentLessonsPage: React.FC<StudentLessonsPageProps> = ({
  student,
  onSelectLesson,
  lessons = DEFAULT_LESSONS,
  quizQuestions = [],
  onOpenAddLesson,
  onDeleteLesson,
  onAddQuestion,
  isTeacher = false
}) => {
  const [lessonToDelete, setLessonToDelete] = useState<LessonContent | null>(null);
  const [lessonForAddMcq, setLessonForAddMcq] = useState<LessonContent | null>(null);

  // Use GA knapsack sequencing
  const gaSequence = optimizeLessonOrder(MOCK_ACTIVITIES, student.attentionSpanMinutes);
  const totalAllocatedMinutes = gaSequence.reduce((acc, curr) => acc + curr.duration, 0);

  const getLessonQuestionCount = (lessonId: string) => {
    return quizQuestions.filter((q) => q.lessonId === lessonId).length;
  };

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4 text-rose-500" />;
      case 'quiz':
        return <HelpCircle className="h-4 w-4 text-indigo-500" />;
      case 'interactive':
        return <Sparkles className="h-4 w-4 text-amber-500" />;
      default:
        return <BookOpen className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full mb-1">
            <Compass className="h-3.5 w-3.5" />
            Adaptive Curriculum Repository
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isTeacher ? 'Lesson & Media Management' : 'My Personalized Lessons'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Optimized for {student.name}'s {student.attentionSpanMinutes}-minute attention span budget.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {onOpenAddLesson && (
            <button
              onClick={onOpenAddLesson}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add Lesson (Video/PPT)</span>
            </button>
          )}
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-right hidden sm:block">
            <div className="text-xs text-slate-400">Scheduled Time</div>
            <div className="text-lg font-bold text-indigo-700">
              {totalAllocatedMinutes} / {student.attentionSpanMinutes} mins
            </div>
          </div>
        </div>
      </div>

      {/* Available Lessons with Video & Presentation Deck Support */}
      <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Curriculum Units with Multi-Media</h3>
            <p className="text-xs text-slate-400">
              Lessons equipped with embedded video lectures, slide decks, and adaptive text
            </p>
          </div>
          {onOpenAddLesson && (
            <button
              onClick={onOpenAddLesson}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create New Lesson</span>
            </button>
          )}
        </div>

        {lessons.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
            <BookOpen className="h-10 w-10 text-slate-300 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800">No Lessons Found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {isTeacher
                ? 'Create a new lesson with video URLs, presentation slide decks, and adaptive reading segments.'
                : 'No lessons are currently assigned. Check back later or ask your instructor.'}
            </p>
            {isTeacher && onOpenAddLesson && (
              <button
                onClick={onOpenAddLesson}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Create Lesson</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lessons.map((les) => (
              <div
                key={les.id}
                className="rounded-2xl border border-slate-200 hover:border-indigo-300 bg-slate-50/50 hover:bg-white p-5 transition-all flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                      {les.subject}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {les.estimatedMinutes} mins
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 leading-snug">{les.title}</h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{les.description}</p>

                  {/* Media Badges */}
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    {les.fileType === 'application/pdf' || les.pptFileName?.toLowerCase().endsWith('.pdf') ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 text-[11px] font-semibold border border-rose-200">
                        <FileText className="h-3 w-3 text-rose-600" />
                        PDF Document
                      </span>
                    ) : null}

                    {les.videoUrl && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 text-[11px] font-semibold border border-rose-100">
                        <Video className="h-3 w-3" />
                        Video Included
                      </span>
                    )}

                    {((les.pptSlides && les.pptSlides.length > 0) || les.pptFileName) && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 text-[11px] font-semibold border border-amber-200">
                        <Presentation className="h-3 w-3" />
                        {les.pptSlides?.length || 1} Slides Deck
                      </span>
                    )}

                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-[11px] font-semibold border border-indigo-100">
                      <HelpCircle className="h-3 w-3" />
                      {getLessonQuestionCount(les.id)} MCQs
                    </span>

                    {les.sections && les.sections.length > 0 && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-[11px] font-semibold border border-blue-100">
                        <FileText className="h-3 w-3" />
                        {les.sections.length} Adaptive Sections
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">By {les.author || 'Instructor'}</span>
                  <div className="flex items-center gap-2">
                    {isTeacher && onAddQuestion && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setLessonForAddMcq(les);
                        }}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 text-xs font-semibold transition-colors"
                        title="Add MCQ for this lesson"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add MCQ</span>
                      </button>
                    )}

                    {isTeacher && onDeleteLesson && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setLessonToDelete(les);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete Lesson Permanently"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => onSelectLesson(les.id)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
                    >
                      <Play className="h-3.5 w-3.5 fill-white" />
                      <span>Start Lesson</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* GA Sequenced Activities List */}
      <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Today's Optimized Activity Sequence</h3>
            <p className="text-xs text-slate-400">
              Sorted by highest engagement fitness and greedy-packed into your attention budget
            </p>
          </div>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            GA Converged (0/1 Knapsack)
          </span>
        </div>

        <div className="space-y-2.5">
          {gaSequence.map((act, index) => (
            <div
              key={act.id}
              className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-indigo-300 bg-slate-50/50 hover:bg-indigo-50/30 transition-all"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white border border-slate-200 text-xs font-bold text-indigo-700">
                  {index + 1}
                </span>
                <div className="flex items-center gap-2">
                  {getActivityIcon(act.type)}
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800">{act.title}</h4>
                    <span className="text-[11px] text-slate-400 capitalize">
                      {act.subject} • {act.type} module
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <span className="text-xs font-semibold text-slate-700 block">{act.duration} mins</span>
                  <span className="text-[10px] text-emerald-600 font-bold">
                    Fitness: {act.engagement}%
                  </span>
                </div>
                <button
                  onClick={() => onSelectLesson('lesson-solar-system')}
                  className="rounded-lg bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 px-3 py-1.5 text-xs font-semibold transition-colors"
                >
                  Launch
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Confirmation modal for permanent lesson deletion */}
      {lessonToDelete && (
        <ConfirmDeleteModal
          isOpen={Boolean(lessonToDelete)}
          title="Delete Lesson Permanently"
          message={`Are you sure you want to permanently delete "${lessonToDelete.title}"? This will delete all attached slides, documents, and adaptive notes from storage.`}
          confirmLabel="Delete Lesson"
          onConfirm={() => {
            if (onDeleteLesson && lessonToDelete) {
              onDeleteLesson(lessonToDelete.id);
            }
            setLessonToDelete(null);
          }}
          onCancel={() => setLessonToDelete(null)}
        />
      )}

      {/* Add MCQ Modal for this lesson */}
      {lessonForAddMcq && onAddQuestion && (
        <AddQuestionModal
          isOpen={Boolean(lessonForAddMcq)}
          onClose={() => setLessonForAddMcq(null)}
          onAddQuestion={onAddQuestion}
          lessons={lessons}
          defaultLessonId={lessonForAddMcq.id}
        />
      )}
    </div>
  );
};

