import React, { useState } from 'react';
import {
  FileQuestion,
  Plus,
  Tag,
  Check,
  Info,
  Trash2
} from 'lucide-react';
import { MOCK_QUIZ_QUESTIONS } from '../mockData';
import { QuizQuestion, LessonContent } from '../types';
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal';

interface TeacherQuizBankPageProps {
  questions?: QuizQuestion[];
  lessons?: LessonContent[];
  onAddQuestion?: (q: QuizQuestion) => void;
  onDeleteQuestion?: (id: string) => void;
}

export const TeacherQuizBankPage: React.FC<TeacherQuizBankPageProps> = ({
  questions = MOCK_QUIZ_QUESTIONS,
  lessons = [],
  onAddQuestion,
  onDeleteQuestion
}) => {
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [isAdding, setIsAdding] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<QuizQuestion | null>(null);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newDifficulty, setNewDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [newTopic, setNewTopic] = useState('');
  const [options, setOptions] = useState<string[]>([
    'Option A',
    'Option B',
    'Option C',
    'Option D'
  ]);
  const [correctIndex, setCorrectIndex] = useState<number>(0);
  const [explanation, setExplanation] = useState('');

  const handleAddQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim()) return;

    const newQ: QuizQuestion = {
      id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      difficulty: newDifficulty,
      question: newQuestionText.trim(),
      topic: newTopic.trim() || 'General Science',
      options: options.map((opt, i) => opt.trim() || `Option ${String.fromCharCode(65 + i)}`),
      correctIndex: correctIndex,
      explanation:
        explanation.trim() || 'Calibrated explanation for neuro-adaptive learning feedback.'
    };

    if (onAddQuestion) {
      onAddQuestion(newQ);
    }
    setNewQuestionText('');
    setNewTopic('');
    setExplanation('');
    setIsAdding(false);
  };

  const handleOptionChange = (index: number, value: string) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const filtered = questions.filter((q) => {
    if (filterDifficulty === 'all') return true;
    return q.difficulty === filterDifficulty;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-indigo-700 text-xs font-semibold uppercase tracking-wider mb-1">
            <FileQuestion className="h-4 w-4" />
            <span>Adaptive Assessment Engine</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Quiz Bank & Question Records</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your question bank for neuro-adaptive difficulty tiering. Questions persist permanently until deleted.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>{isAdding ? 'Cancel' : 'Add Question'}</span>
          </button>
        </div>
      </div>

      {/* Manual Add question form */}
      {isAdding && (
        <form
          onSubmit={handleAddQuestionSubmit}
          className="bg-indigo-50/70 p-6 rounded-2xl border border-indigo-200 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-indigo-950">Add Adaptive Question</h3>
            <span className="text-xs text-indigo-700">Persists permanently in database</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Question Prompt</label>
              <input
                type="text"
                required
                value={newQuestionText}
                onChange={(e) => setNewQuestionText(e.target.value)}
                placeholder="e.g. What is the hottest planet in our solar system?"
                className="w-full rounded-xl border border-slate-300 p-2.5 text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Topic / Subject</label>
              <input
                type="text"
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                placeholder="e.g. Planetary Atmosphere"
                className="w-full rounded-xl border border-slate-300 p-2.5 text-sm bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Difficulty Tier
              </label>
              <select
                value={newDifficulty}
                onChange={(e) => setNewDifficulty(e.target.value as any)}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-sm bg-white"
              >
                <option value="easy">Easy (Adaptive trigger: Focus &lt; 50)</option>
                <option value="medium">Medium (Adaptive trigger: Focus 50 - 74)</option>
                <option value="hard">Hard (Adaptive trigger: Focus ≥ 75)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Correct Answer Option
              </label>
              <select
                value={correctIndex}
                onChange={(e) => setCorrectIndex(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-sm bg-white"
              >
                <option value={0}>Option A</option>
                <option value={1}>Option B</option>
                <option value={2}>Option C</option>
                <option value={3}>Option D</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">Multiple Choice Options</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 w-5">
                    {String.fromCharCode(65 + idx)}.
                  </span>
                  <input
                    type="text"
                    required
                    value={opt}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                    className="flex-1 rounded-xl border border-slate-300 p-2 text-xs bg-white"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Neuro-Adaptive Explanation
            </label>
            <textarea
              rows={2}
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Clear, sensory-friendly feedback explaining why this is the correct answer."
              className="w-full rounded-xl border border-slate-300 p-2.5 text-xs bg-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-indigo-600 text-xs font-semibold text-white hover:bg-indigo-700 shadow-sm"
            >
              Save Question to Bank
            </button>
          </div>
        </form>
      )}

      {/* Difficulty Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['all', 'easy', 'medium', 'hard'].map((tier) => (
          <button
            key={tier}
            onClick={() => setFilterDifficulty(tier)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border capitalize transition-colors ${
              filterDifficulty === tier
                ? 'bg-indigo-600 border-indigo-600 text-white'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tier === 'all' ? `All Questions (${questions.length})` : `${tier} tier`}
          </button>
        ))}
      </div>

      {/* Questions list */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
            <FileQuestion className="h-8 w-8 text-slate-300 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800">No Questions Found</h4>
            <p className="text-xs text-slate-500">
              {filterDifficulty === 'all'
                ? 'Your quiz bank is currently empty. Click "Add Question" above to create one.'
                : `No questions found for ${filterDifficulty} difficulty tier.`}
            </p>
          </div>
        ) : (
          filtered.map((q, idx) => (
            <div
              key={`bank-q-${q.id || 'item'}-${idx}`}
              className="rounded-2xl bg-white p-5 sm:p-6 border border-slate-200 shadow-2xs space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400">#{idx + 1}</span>
                  {q.topic && (
                    <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-100">
                      {q.topic}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full capitalize ${
                      q.difficulty === 'easy'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : q.difficulty === 'medium'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-purple-50 text-purple-700 border border-purple-200'
                    }`}
                  >
                    {q.difficulty}
                  </span>

                  {onDeleteQuestion && (
                    <button
                      onClick={() => {
                        setQuestionToDelete(q);
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete Question"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              <h3 className="text-base font-bold text-slate-900 leading-snug">{q.question}</h3>

              {/* Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {q.options.map((opt, oIdx) => (
                  <div
                    key={oIdx}
                    className={`p-2.5 rounded-lg border flex items-center gap-2 ${
                      oIdx === q.correctIndex
                        ? 'border-emerald-300 bg-emerald-50/60 text-emerald-900 font-semibold'
                        : 'border-slate-200 bg-slate-50/50 text-slate-600'
                    }`}
                  >
                    <span className="h-4 w-4 rounded-full border border-slate-300 flex items-center justify-center text-[10px]">
                      {String.fromCharCode(65 + oIdx)}
                    </span>
                    <span>{opt}</span>
                    {oIdx === q.correctIndex && (
                      <Check className="h-3.5 w-3.5 text-emerald-600 ml-auto" />
                    )}
                  </div>
                ))}
              </div>

              <div className="text-xs text-slate-500 pt-1 border-t border-slate-100 flex items-center gap-2">
                <Info className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span>{q.explanation}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Confirmation Modal for deleting quiz questions */}
      {questionToDelete && (
        <ConfirmDeleteModal
          isOpen={Boolean(questionToDelete)}
          title="Delete Question from Quiz Bank"
          message={`Are you sure you want to permanently delete this question? "${questionToDelete.question}"`}
          confirmLabel="Delete Question"
          onConfirm={() => {
            if (onDeleteQuestion && questionToDelete) {
              onDeleteQuestion(questionToDelete.id);
            }
            setQuestionToDelete(null);
          }}
          onCancel={() => setQuestionToDelete(null)}
        />
      )}
    </div>
  );
};
