import React, { useState } from 'react';
import { ArrowLeft, Plus, X, Check, Sparkles, UserPlus } from 'lucide-react';
import { StudentProfile, DiagnosisType, LearningStyle } from '../types';

interface StudentProfilePageProps {
  onSaveProfile: (profile: StudentProfile) => void;
  onNavigateBack: () => void;
}

export const StudentProfilePage: React.FC<StudentProfilePageProps> = ({
  onSaveProfile,
  onNavigateBack
}) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [diagnoses, setDiagnoses] = useState<DiagnosisType[]>(['ADHD']);
  const [sensorySensitivities, setSensorySensitivities] = useState<string[]>([
    'loud sounds',
    'bright lights',
    'crowds'
  ]);
  const [newSensitivityInput, setNewSensitivityInput] = useState('');
  const [attentionSpanMinutes, setAttentionSpanMinutes] = useState<number>(30);
  const [preferredLearningStyle, setPreferredLearningStyle] = useState<LearningStyle>('visual');
  const [saveFeedback, setSaveFeedback] = useState(false);

  const availableDiagnoses: DiagnosisType[] = ['ADHD', 'Autism', 'Dyslexia', 'Other'];

  const toggleDiagnosis = (diag: DiagnosisType) => {
    if (diagnoses.includes(diag)) {
      if (diagnoses.length > 1) {
        setDiagnoses(diagnoses.filter((d) => d !== diag));
      }
    } else {
      setDiagnoses([...diagnoses, diag]);
    }
  };

  const handleAddSensitivity = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    if (e) e.preventDefault();

    const trimmed = newSensitivityInput.trim().toLowerCase();
    if (trimmed && !sensorySensitivities.includes(trimmed)) {
      setSensorySensitivities([...sensorySensitivities, trimmed]);
      setNewSensitivityInput('');
    }
  };

  const removeSensitivity = (tag: string) => {
    setSensorySensitivities(sensorySensitivities.filter((s) => s !== tag));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newProfile: StudentProfile = {
      id: `student-${Date.now()}`,
      name: name.trim(),
      age: typeof age === 'number' ? age : 12,
      diagnoses,
      sensorySensitivities,
      attentionSpanMinutes: Number(attentionSpanMinutes) || 25,
      preferredLearningStyle,
      currentFocusScore: 0,
      fuzzyState: 'Steady attention',
      avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      recentAccuracy: 0,
      avgResponseTimeSec: 0,
      currentMood: 4
    };

    onSaveProfile(newProfile);
    setSaveFeedback(true);
    setTimeout(() => {
      setSaveFeedback(false);
      onNavigateBack();
    }, 1500);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back button matching panel 6 */}
      <button
        id="back-to-students-btn"
        onClick={onNavigateBack}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Students</span>
      </button>

      {/* Main Card */}
      <div className="rounded-2xl bg-white p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Create Student Profile</h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure neurodivergent accommodations for the ANFIS content adapter and genetic sequencing engine.
          </p>
        </div>

        {saveFeedback && (
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-xs text-emerald-800 flex items-center gap-2">
            <Check className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Profile saved successfully! Neuro-adaptive rules generated. Returning to roster...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name Field */}
          <div>
            <label htmlFor="student-name-input" className="block text-xs font-bold text-slate-700 mb-1.5">
              Name <span className="text-rose-500">*</span>
            </label>
            <input
              id="student-name-input"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter student name (e.g. Maya Chen)"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none transition-all"
            />
          </div>

          {/* Age Field */}
          <div>
            <label htmlFor="student-age-input" className="block text-xs font-bold text-slate-700 mb-1.5">
              Age <span className="text-rose-500">*</span>
            </label>
            <input
              id="student-age-input"
              type="number"
              min={5}
              max={25}
              required
              value={age}
              onChange={(e) => setAge(e.target.value ? Number(e.target.value) : '')}
              placeholder="Enter age"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none transition-all"
            />
          </div>

          {/* Diagnosis Type(s) multi-select matching panel 6 */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Diagnosis Type(s) <span className="text-rose-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {availableDiagnoses.map((diag) => {
                const isSelected = diagnoses.includes(diag);
                return (
                  <button
                    key={diag}
                    type="button"
                    id={`diag-pill-${diag}`}
                    onClick={() => toggleDiagnosis(diag)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      isSelected
                        ? 'bg-indigo-50 border-indigo-600 text-indigo-700 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{isSelected ? '✓' : '+'}</span>
                    <span>{diag}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sensory Sensitivities Tag Input matching panel 6 */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Sensory Sensitivities <span className="text-rose-500">*</span>
            </label>

            {/* Existing tags */}
            <div className="flex flex-wrap gap-2 mb-2">
              {sensorySensitivities.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50/80 border border-indigo-200 px-2.5 py-1 text-xs font-medium text-indigo-900"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => removeSensitivity(tag)}
                    className="text-indigo-400 hover:text-indigo-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>

            {/* Input to add tag */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newSensitivityInput}
                onChange={(e) => setNewSensitivityInput(e.target.value)}
                onKeyDown={handleAddSensitivity}
                placeholder="Add more (e.g. flickering animations, high contrast) and press Enter"
                className="flex-1 rounded-xl border border-slate-300 px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none"
              />
              <button
                type="button"
                onClick={handleAddSensitivity}
                className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Add
              </button>
            </div>
          </div>

          {/* Attention Span in Minutes matching panel 6 */}
          <div>
            <label htmlFor="attention-span-input" className="block text-xs font-bold text-slate-700 mb-1.5">
              Attention Span (minutes) <span className="text-rose-500">*</span>
            </label>
            <input
              id="attention-span-input"
              type="number"
              min={5}
              max={60}
              required
              value={attentionSpanMinutes}
              onChange={(e) => setAttentionSpanMinutes(Number(e.target.value))}
              placeholder="30"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-800 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none transition-all"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Used as the knapsack capacity budget in our Genetic Algorithm scheduler.
            </p>
          </div>

          {/* Preferred Learning Style dropdown matching panel 6 */}
          <div>
            <label htmlFor="learning-style-select" className="block text-xs font-bold text-slate-700 mb-1.5">
              Preferred Learning Style <span className="text-rose-500">*</span>
            </label>
            <select
              id="learning-style-select"
              value={preferredLearningStyle}
              onChange={(e) => setPreferredLearningStyle(e.target.value as LearningStyle)}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-800 bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none transition-all"
            >
              <option value="visual">Visual</option>
              <option value="auditory">Auditory</option>
              <option value="kinesthetic">Kinesthetic</option>
              <option value="reading">Reading</option>
            </select>
          </div>

          {/* Submit Button matching panel 6 */}
          <div className="pt-4 flex justify-end">
            <button
              id="save-profile-btn"
              type="submit"
              className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-all flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              <span>Save Profile</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
