import React, { useState, useEffect } from 'react';
import { X, HelpCircle, Plus, Check, BookOpen, AlertCircle } from 'lucide-react';
import { QuizQuestion, LessonContent } from '../types';

interface AddQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveQuestion: (question: QuizQuestion) => void;
  lessons: LessonContent[];
  defaultLessonId?: string;
}

export const AddQuestionModal: React.FC<AddQuestionModalProps> = ({
  isOpen,
  onClose,
  onSaveQuestion,
  lessons,
  defaultLessonId
}) => {
  const [questionText, setQuestionText] = useState('');
  const [topic, setTopic] = useState('');
  const [selectedLessonId, setSelectedLessonId] = useState<string>(defaultLessonId || '');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [options, setOptions] = useState<string[]>([
    '',
    '',
    '',
    ''
  ]);
  const [correctIndex, setCorrectIndex] = useState<number>(0);
  const [explanation, setExplanation] = useState('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (defaultLessonId) {
      setSelectedLessonId(defaultLessonId);
      const matched = lessons.find((l) => l.id === defaultLessonId);
      if (matched && !topic) {
        setTopic(matched.title);
      }
    }
  }, [defaultLessonId, lessons]);

  if (!isOpen) return null;

  const handleOptionChange = (idx: number, val: string) => {
    const updated = [...options];
    updated[idx] = val;
    setOptions(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) {
      setError('Please enter a question prompt.');
      return;
    }

    const filledOptions = options.map((opt, i) => opt.trim() || `Option ${String.fromCharCode(65 + i)}`);
    if (filledOptions.filter(Boolean).length < 2) {
      setError('Please provide at least 2 distinct options.');
      return;
    }

    const matchedLesson = lessons.find((l) => l.id === selectedLessonId);

    const newQuestion: QuizQuestion = {
      id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      difficulty,
      question: questionText.trim(),
      topic: topic.trim() || matchedLesson?.title || 'General Knowledge',
      options: filledOptions,
      correctIndex,
      explanation:
        explanation.trim() ||
        'Calibrated explanation providing sensory-friendly reinforcement of correct concepts.',
      lessonId: selectedLessonId || undefined
    };

    onSaveQuestion(newQuestion);
    // Reset form
    setQuestionText('');
    setTopic('');
    setExplanation('');
    setOptions(['', '', '', '']);
    setCorrectIndex(0);
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50/80 shrink-0">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-indigo-600" />
              <span>Add Multiple Choice Question (MCQ)</span>
            </h2>
            <p className="text-xs text-slate-500">
              Link this question to a specific lesson or assign it to the general quiz bank.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs text-slate-700">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-semibold text-xs">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Lesson Assignment */}
          <div className="rounded-xl bg-indigo-50/60 p-4 border border-indigo-100 space-y-2">
            <label className="font-bold text-indigo-950 flex items-center gap-1.5">
              <BookOpen className="h-4 w-4 text-indigo-600" />
              <span>Link to Lesson</span>
            </label>
            <select
              value={selectedLessonId}
              onChange={(e) => {
                setSelectedLessonId(e.target.value);
                const l = lessons.find((item) => item.id === e.target.value);
                if (l && !topic) setTopic(l.title);
              }}
              className="w-full rounded-xl border border-indigo-200 p-2.5 text-xs bg-white text-slate-800 font-medium focus:border-indigo-600 outline-none"
            >
              <option value="">General Assessment (All Lessons)</option>
              {lessons.map((lesson) => (
                <option key={lesson.id} value={lesson.id}>
                  {lesson.title} ({lesson.subject})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-indigo-700">
              When a student studies this lesson, questions linked to it will appear during their adaptive assessment.
            </p>
          </div>

          {/* Question Prompt */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-800">Question Prompt *</label>
            <textarea
              required
              rows={2}
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="e.g. Which celestial body is at the center of the solar system?"
              className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800 focus:border-indigo-600 outline-none resize-none"
            />
          </div>

          {/* Topic & Difficulty */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-800">Topic / Category</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Astronomy, Cell Structure"
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800 focus:border-indigo-600 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-800">Adaptive Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs bg-white text-slate-800 font-medium focus:border-indigo-600 outline-none"
              >
                <option value="easy">Easy (Low focus / Introductory)</option>
                <option value="medium">Medium (Standard focus)</option>
                <option value="hard">Hard (Deep engagement / Mastery)</option>
              </select>
            </div>
          </div>

          {/* Options & Radio for Correct Answer */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800">Options & Correct Answer</label>
              <span className="text-[11px] text-slate-500">Select the radio button next to the correct answer</span>
            </div>

            <div className="space-y-2">
              {options.map((opt, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-3 p-2 rounded-xl border transition-all ${
                    correctIndex === idx
                      ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-300'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <label className="flex items-center gap-2 cursor-pointer shrink-0 pl-1">
                    <input
                      type="radio"
                      name="correctOption"
                      checked={correctIndex === idx}
                      onChange={() => setCorrectIndex(idx)}
                      className="accent-emerald-600 h-4 w-4"
                    />
                    <span className="font-bold text-xs text-slate-600 w-4">
                      {String.fromCharCode(65 + idx)}
                    </span>
                  </label>

                  <input
                    type="text"
                    required
                    value={opt}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    placeholder={`Option ${String.fromCharCode(65 + idx)} text`}
                    className="flex-1 bg-transparent text-xs text-slate-800 outline-none"
                  />

                  {correctIndex === idx && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full shrink-0">
                      <Check className="h-3 w-3" />
                      Correct
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Explanation */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-800">Explanation & Neuro-Feedback</label>
            <textarea
              rows={2}
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Explain why this answer is correct in sensory-friendly, supportive language..."
              className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800 focus:border-indigo-600 outline-none resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 font-semibold text-white hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span>Save Question</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
