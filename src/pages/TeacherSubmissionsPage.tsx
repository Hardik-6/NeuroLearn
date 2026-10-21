import React, { useState } from 'react';
import {
  Mic,
  Video,
  FileCheck,
  Sparkles,
  MessageSquare,
  CheckCircle2,
  Clock,
  Play,
  Pause,
  Send,
  User,
  Lightbulb,
  Heart,
  Sliders,
  Filter,
  Trash2,
  Volume2,
  Tag
} from 'lucide-react';
import { StudentSubmission, TeacherSuggestion, StudentProfile } from '../types';

interface TeacherSubmissionsPageProps {
  submissions: StudentSubmission[];
  students: StudentProfile[];
  onSaveFeedback: (submissionId: string, feedback: TeacherSuggestion) => void;
  onDeleteSubmission?: (submissionId: string) => void;
}

export const TeacherSubmissionsPage: React.FC<TeacherSubmissionsPageProps> = ({
  submissions,
  students,
  onSaveFeedback,
  onDeleteSubmission
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'audio' | 'video' | 'pending' | 'reviewed'>('all');
  const [activeSubmissionId, setActiveSubmissionId] = useState<string | null>(
    submissions[0]?.id || null
  );

  // Form State for Active Review
  const [suggestionText, setSuggestionText] = useState('');
  const [strengthsText, setStrengthsText] = useState('');
  const [selectedAccommodations, setSelectedAccommodations] = useState<string[]>([]);
  const [teacherName, setTeacherName] = useState('Ms. Priya (Special Educator)');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const activeSub = submissions.find((s) => s.id === activeSubmissionId) || submissions[0] || null;

  // Sync form when active submission changes
  React.useEffect(() => {
    if (activeSub) {
      if (activeSub.teacherFeedback && activeSub.teacherFeedback.status === 'reviewed') {
        setSuggestionText(activeSub.teacherFeedback.suggestion || '');
        setStrengthsText(activeSub.teacherFeedback.strengths || '');
        setSelectedAccommodations(activeSub.teacherFeedback.recommendedAccommodations || []);
        if (activeSub.teacherFeedback.teacherName) {
          setTeacherName(activeSub.teacherFeedback.teacherName);
        }
      } else {
        setSuggestionText('');
        setStrengthsText('');
        setSelectedAccommodations([]);
      }
      setSaveSuccessMsg(null);
    }
  }, [activeSubmissionId, activeSub?.id]);

  // Counts
  const totalCount = submissions.length;
  const audioCount = submissions.filter((s) => s.mode === 'audio').length;
  const videoCount = submissions.filter((s) => s.mode === 'video').length;
  const pendingCount = submissions.filter((s) => !s.teacherFeedback || s.teacherFeedback.status === 'pending').length;
  const reviewedCount = submissions.filter((s) => s.teacherFeedback?.status === 'reviewed').length;

  const filteredSubmissions = submissions.filter((s) => {
    if (filterMode === 'audio') return s.mode === 'audio';
    if (filterMode === 'video') return s.mode === 'video';
    if (filterMode === 'pending') return !s.teacherFeedback || s.teacherFeedback.status === 'pending';
    if (filterMode === 'reviewed') return s.teacherFeedback?.status === 'reviewed';
    return true;
  });

  const handleToggleAccommodation = (acc: string) => {
    setSelectedAccommodations((prev) =>
      prev.includes(acc) ? prev.filter((a) => a !== acc) : [...prev, acc]
    );
  };

  const handleApplyPresetSuggestion = (preset: string) => {
    setSuggestionText((prev) => (prev ? `${prev} ${preset}` : preset));
  };

  const handleApplyPresetStrength = (preset: string) => {
    setStrengthsText((prev) => (prev ? `${prev} ${preset}` : preset));
  };

  const handleSendFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSub) return;
    if (!suggestionText.trim()) {
      alert('Please enter at least one suggestion for the student.');
      return;
    }

    const feedback: TeacherSuggestion = {
      teacherName: teacherName.trim() || 'Ms. Priya (Special Educator)',
      suggestion: suggestionText.trim(),
      strengths: strengthsText.trim(),
      recommendedAccommodations: selectedAccommodations,
      status: 'reviewed',
      reviewedAt: new Date().toISOString()
    };

    onSaveFeedback(activeSub.id, feedback);
    setSaveSuccessMsg('Suggestions sent to student successfully! They will see this on their dashboard.');
    setTimeout(() => {
      setSaveSuccessMsg(null);
    }, 4000);
  };

  const commonAccommodations = [
    'Voice Recording Format Approved',
    'Video Walkthrough Presentation',
    'Mind Map Visual Anchors',
    'Extended Processing Time',
    'Chunked Tasks & Frequent Pauses',
    'Soft Irlen Color Overlays'
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF8A00] bg-[#FFF7F3] border border-[#FF8A00]/20 px-3 py-1 rounded-full mb-1.5">
            <Sparkles className="h-3.5 w-3.5 text-[#FF8A00]" />
            Inclusive Assessment & Feedback
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1E293B]">
            Voice & Video Submissions Review
          </h1>
          <p className="text-sm text-[#1E293B]/70 mt-1">
            Listen to student voice recordings, watch video walkthroughs, and provide personalized suggestions and accommodations.
          </p>
        </div>

        {/* Pending Badge */}
        {pendingCount > 0 && (
          <div className="flex items-center gap-2.5 bg-amber-50 border border-amber-300/80 px-4 py-2 rounded-2xl text-amber-900 shadow-2xs">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
            <span className="text-xs font-bold">
              {pendingCount} submission{pendingCount > 1 ? 's' : ''} awaiting your suggestions
            </span>
          </div>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card-warm p-4 border-t-4 border-t-[#4D84FE]">
          <span className="text-xs font-bold text-[#1E293B]/60 uppercase tracking-wider block">
            Total Submissions
          </span>
          <span className="text-2xl font-black text-[#1E293B] block mt-1">{totalCount}</span>
          <span className="text-[11px] text-[#1E293B]/50 font-medium">Multimodal assignments</span>
        </div>

        <div className="card-warm p-4 border-t-4 border-t-[#00C896]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#1E293B]/60 uppercase tracking-wider block">
              Voice Recordings
            </span>
            <Mic className="w-4 h-4 text-[#00C896]" />
          </div>
          <span className="text-2xl font-black text-[#00C896] block mt-1">{audioCount}</span>
          <span className="text-[11px] text-[#1E293B]/50 font-medium">Spoken oral responses</span>
        </div>

        <div className="card-warm p-4 border-t-4 border-t-[#FF8A00]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#1E293B]/60 uppercase tracking-wider block">
              Video Walkthroughs
            </span>
            <Video className="w-4 h-4 text-[#FF8A00]" />
          </div>
          <span className="text-2xl font-black text-[#FF8A00] block mt-1">{videoCount}</span>
          <span className="text-[11px] text-[#1E293B]/50 font-medium">Visual presentations</span>
        </div>

        <div className="card-warm p-4 border-t-4 border-t-amber-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#1E293B]/60 uppercase tracking-wider block">
              Reviewed with Advice
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl font-black text-[#1E293B] block mt-1">
            {reviewedCount} <span className="text-sm font-normal text-slate-400">/ {totalCount}</span>
          </span>
          <span className="text-[11px] text-[#00C896] font-semibold">
            {totalCount > 0 ? `${Math.round((reviewedCount / totalCount) * 100)}% reviewed` : '0%'}
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-white rounded-2xl border border-[#FF8A00]/15">
        <button
          onClick={() => setFilterMode('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            filterMode === 'all'
              ? 'bg-[#4D84FE] text-white shadow-xs'
              : 'text-[#1E293B]/70 hover:bg-[#FFF7F3]'
          }`}
        >
          All ({totalCount})
        </button>
        <button
          onClick={() => setFilterMode('audio')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            filterMode === 'audio'
              ? 'bg-[#00C896] text-white shadow-xs'
              : 'text-[#1E293B]/70 hover:bg-[#FFF7F3]'
          }`}
        >
          <Mic className="w-3.5 h-3.5" />
          Voice ({audioCount})
        </button>
        <button
          onClick={() => setFilterMode('video')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            filterMode === 'video'
              ? 'bg-[#FF8A00] text-white shadow-xs'
              : 'text-[#1E293B]/70 hover:bg-[#FFF7F3]'
          }`}
        >
          <Video className="w-3.5 h-3.5" />
          Video ({videoCount})
        </button>
        <button
          onClick={() => setFilterMode('pending')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            filterMode === 'pending'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'text-[#1E293B]/70 hover:bg-[#FFF7F3]'
          }`}
        >
          Pending Suggestions ({pendingCount})
        </button>
        <button
          onClick={() => setFilterMode('reviewed')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            filterMode === 'reviewed'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-[#1E293B]/70 hover:bg-[#FFF7F3]'
          }`}
        >
          Feedback Given ({reviewedCount})
        </button>
      </div>

      {/* Main Review Section: Split into Submissions List (Left) and Feedback Studio (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Submissions List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-[#1E293B]/70 uppercase tracking-wider">
              Student Submissions ({filteredSubmissions.length})
            </span>
            <span className="text-[11px] text-[#1E293B]/40">Click to listen & review</span>
          </div>

          {filteredSubmissions.length === 0 ? (
            <div className="rounded-2xl bg-white p-8 border border-slate-200 text-center space-y-2">
              <FileCheck className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">No submissions found</p>
              <p className="text-xs text-slate-400">
                Try switching the filter above or have a student submit a voice or video assignment.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredSubmissions.map((sub) => {
                const isSelected = sub.id === activeSub?.id;
                const isPending = !sub.teacherFeedback || sub.teacherFeedback.status === 'pending';

                return (
                  <div
                    key={sub.id}
                    onClick={() => setActiveSubmissionId(sub.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer text-left relative ${
                      isSelected
                        ? 'border-[#4D84FE] bg-[#4D84FE]/5 shadow-sm ring-1 ring-[#4D84FE]/30'
                        : 'border-[#FF8A00]/15 bg-white hover:bg-[#FFF7F3] hover:border-[#FF8A00]/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            sub.mode === 'audio'
                              ? 'bg-[#00C896]/15 text-[#00C896]'
                              : sub.mode === 'video'
                              ? 'bg-[#FF8A00]/15 text-[#FF8A00]'
                              : 'bg-[#4D84FE]/15 text-[#4D84FE]'
                          }`}
                        >
                          {sub.mode === 'audio' ? (
                            <Mic className="w-4 h-4" />
                          ) : sub.mode === 'video' ? (
                            <Video className="w-4 h-4" />
                          ) : (
                            <FileCheck className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-[#1E293B] leading-tight">
                            {sub.studentName}
                          </h4>
                          <span className="text-[11px] text-[#1E293B]/50 block">
                            {sub.studentDiagnoses?.join(', ') || 'Learner Profile'}
                          </span>
                        </div>
                      </div>

                      {/* Status Tag */}
                      {isPending ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                          Needs Suggestions
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          Suggestions Sent
                        </span>
                      )}
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-100">
                      <p className="text-xs font-medium text-[#1E293B]/80 line-clamp-1">
                        {sub.lessonTitle}
                      </p>
                      <div className="flex items-center justify-between text-[11px] text-[#1E293B]/45 mt-1">
                        <span>
                          {sub.mode === 'audio'
                            ? `Voice Audio (${sub.audioDurationSec || 30}s)`
                            : sub.mode === 'video'
                            ? `Video (${sub.videoFileName || 'Recorded Walkthrough'})`
                            : 'Text / MindMap'}
                        </span>
                        <span>{new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Active Player & Teacher Suggestion Composer */}
        <div className="lg:col-span-7 space-y-4">
          {activeSub ? (
            <div className="card-warm p-6 space-y-6">
              {/* Submission Header Card */}
              <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-[#FF8A00]/15">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        activeSub.mode === 'audio'
                          ? 'bg-[#00C896]/15 text-[#00C896]'
                          : 'bg-[#FF8A00]/15 text-[#FF8A00]'
                      }`}
                    >
                      {activeSub.mode === 'audio' ? <Mic className="w-3 h-3" /> : <Video className="w-3 h-3" />}
                      {activeSub.mode === 'audio' ? 'Voice Recording Submission' : 'Video Walkthrough Submission'}
                    </span>
                    <span className="text-xs text-[#1E293B]/40 font-medium">
                      Submitted {new Date(activeSub.submittedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h2 className="text-xl font-bold text-[#1E293B] mt-1.5">
                    {activeSub.lessonTitle}
                  </h2>
                  <div className="flex items-center gap-2 mt-1 text-xs text-[#1E293B]/70 font-semibold">
                    <span>Student: <strong className="text-[#1E293B]">{activeSub.studentName}</strong></span>
                    <span>•</span>
                    <span className="text-[#FF8A00]">
                      {activeSub.studentDiagnoses?.join(' • ') || 'Individual Learning Profile'}
                    </span>
                  </div>
                </div>

                {onDeleteSubmission && (
                  <button
                    onClick={() => onDeleteSubmission(activeSub.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                    title="Delete submission"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Media Player Section */}
              {activeSub.mode === 'audio' && (
                <div className="rounded-2xl bg-[#FFF7F3] p-5 border border-[#FF8A00]/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-[#00C896] text-white flex items-center justify-center">
                        <Volume2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#1E293B] uppercase tracking-wider">
                          Voice Recording Playback
                        </h4>
                        <span className="text-[11px] text-[#1E293B]/60">
                          Duration: ~{activeSub.audioDurationSec || 40} seconds
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* HTML5 Audio Player */}
                  {activeSub.audioBlobUrl ? (
                    <audio
                      controls
                      src={activeSub.audioBlobUrl}
                      className="w-full mt-2 rounded-xl"
                    />
                  ) : (
                    <div className="p-3 rounded-xl bg-white/80 border border-[#FF8A00]/15 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#00C896]/15 flex items-center justify-center text-[#00C896]">
                        <Volume2 className="w-5 h-5 animate-pulse" />
                      </div>
                      <div className="flex-1">
                        <span className="text-xs font-bold text-[#1E293B] block">
                          Recorded Voice Audio Track
                        </span>
                        <span className="text-[11px] text-[#1E293B]/50 block">
                          High-clarity oral submission recorded via student microphone
                        </span>
                      </div>
                      <span className="text-xs font-mono font-bold text-[#00C896] bg-[#00C896]/10 px-2 py-1 rounded-lg">
                        0:{activeSub.audioDurationSec || 42}
                      </span>
                    </div>
                  )}

                  {/* Spoken Speech Transcript */}
                  {activeSub.audioTranscript && (
                    <div className="bg-white rounded-xl p-4 border border-[#FF8A00]/15 space-y-1">
                      <span className="text-[11px] font-bold text-[#FF8A00] uppercase tracking-wider block">
                        Spoken Voice Transcript / Note:
                      </span>
                      <p className="text-xs text-[#1E293B] leading-relaxed italic">
                        "{activeSub.audioTranscript}"
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeSub.mode === 'video' && (
                <div className="rounded-2xl bg-[#FFF7F3] p-5 border border-[#FF8A00]/20 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#FF8A00] text-white flex items-center justify-center">
                      <Video className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#1E293B] uppercase tracking-wider">
                        Video Walkthrough Playback
                      </h4>
                      <span className="text-[11px] text-[#1E293B]/60">
                        {activeSub.videoFileName || 'Recorded Video Session'}
                      </span>
                    </div>
                  </div>

                  {activeSub.videoUrl ? (
                    <video
                      controls
                      src={activeSub.videoUrl}
                      className="w-full max-h-64 rounded-xl bg-black object-contain"
                    />
                  ) : (
                    <div className="p-6 rounded-xl bg-slate-900 text-white text-center space-y-3">
                      <Video className="w-8 h-8 text-[#FF8A00] mx-auto animate-pulse" />
                      <div>
                        <span className="text-sm font-bold block">
                          Video Walkthrough: {activeSub.videoFileName || 'Trappist_Habitability_Walkthrough.webm'}
                        </span>
                        <span className="text-xs text-slate-300">
                          Captured via student webcam with synchronized narration
                        </span>
                      </div>
                    </div>
                  )}

                  {activeSub.videoKeyPoints && activeSub.videoKeyPoints.length > 0 && (
                    <div className="bg-white rounded-xl p-3 border border-[#FF8A00]/15 space-y-1.5">
                      <span className="text-[11px] font-bold text-[#FF8A00] uppercase tracking-wider block">
                        Student Video Chapters & Key Points:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {activeSub.videoKeyPoints.map((pt, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-[#FFF7F3] text-[#1E293B] border border-[#FF8A00]/20 px-2.5 py-1 rounded-lg font-medium"
                          >
                            {pt}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Status Banner / Feedback Confirmation */}
              {saveSuccessMsg && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{saveSuccessMsg}</span>
                </div>
              )}

              {/* Current Feedback if Already Given */}
              {activeSub.teacherFeedback && activeSub.teacherFeedback.status === 'reviewed' && (
                <div className="rounded-2xl bg-emerald-50/70 p-4 border border-emerald-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Active Teacher Suggestions (Sent to Student)
                    </span>
                    <span className="text-[10px] text-emerald-700">
                      {new Date(activeSub.teacherFeedback.reviewedAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-emerald-950 font-medium leading-relaxed bg-white/70 p-3 rounded-xl border border-emerald-200/50">
                    "{activeSub.teacherFeedback.suggestion}"
                  </p>
                  {activeSub.teacherFeedback.strengths && (
                    <p className="text-xs text-emerald-800">
                      <strong>Recognized Strengths:</strong> {activeSub.teacherFeedback.strengths}
                    </p>
                  )}
                </div>
              )}

              {/* Teacher Suggestion & Guidance Composer Form */}
              <form onSubmit={handleSendFeedback} className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#FF8A00]/15 text-[#FF8A00] flex items-center justify-center">
                      <Lightbulb className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#1E293B]">
                        Provide Suggestions & Constructive Advice
                      </h3>
                      <p className="text-[11px] text-[#1E293B]/60">
                        Based on the voice recording or video, what should {activeSub.studentName} improve or explore next?
                      </p>
                    </div>
                  </div>
                </div>

                {/* Suggestions Textarea */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#1E293B] uppercase tracking-wider">
                      Teacher Suggestions & Next Steps <span className="text-rose-500">*</span>
                    </label>
                  </div>
                  <textarea
                    rows={3}
                    value={suggestionText}
                    onChange={(e) => setSuggestionText(e.target.value)}
                    placeholder={`e.g., "Great verbal explanation of orbital shielding, ${activeSub.studentName}! For your next step, try comparing TRAPPIST-1e with Mars to explain why..."`}
                    className="w-full rounded-2xl border border-[#FF8A00]/25 bg-white p-3.5 text-xs text-[#1E293B] focus:border-[#4D84FE] focus:ring-2 focus:ring-[#4D84FE]/20 outline-none transition-all leading-relaxed"
                  />
                  {/* Preset Idea Pills */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] text-[#1E293B]/50 font-bold">Quick ideas:</span>
                    <button
                      type="button"
                      onClick={() =>
                        handleApplyPresetSuggestion(
                          'Try connecting this concept to real-world examples in our next lesson.'
                        )
                      }
                      className="text-[10px] bg-[#FFF7F3] hover:bg-[#FF8A00]/10 text-[#FF8A00] border border-[#FF8A00]/20 px-2.5 py-0.5 rounded-full font-semibold transition-all"
                    >
                      + Connect to real-world
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleApplyPresetSuggestion(
                          'Feel free to pause and take a 5-second breath between major sections.'
                        )
                      }
                      className="text-[10px] bg-[#FFF7F3] hover:bg-[#FF8A00]/10 text-[#FF8A00] border border-[#FF8A00]/20 px-2.5 py-0.5 rounded-full font-semibold transition-all"
                    >
                      + Pacing & breathing pause
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleApplyPresetSuggestion(
                          'Excellent scientific terminology! Add one comparison with Earth.'
                        )
                      }
                      className="text-[10px] bg-[#FFF7F3] hover:bg-[#FF8A00]/10 text-[#FF8A00] border border-[#FF8A00]/20 px-2.5 py-0.5 rounded-full font-semibold transition-all"
                    >
                      + Add Earth comparison
                    </button>
                  </div>
                </div>

                {/* Recognized Strengths (Neurodiversity Confidence Builder) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#1E293B] uppercase tracking-wider flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-rose-500" />
                    Recognized Strengths & Encouragement (Praise)
                  </label>
                  <textarea
                    rows={2}
                    value={strengthsText}
                    onChange={(e) => setStrengthsText(e.target.value)}
                    placeholder="Highlight what the student did well (e.g. spoken clarity, creative visual presentation, deep insight)..."
                    className="w-full rounded-2xl border border-[#FF8A00]/25 bg-white p-3.5 text-xs text-[#1E293B] focus:border-[#00C896] focus:ring-2 focus:ring-[#00C896]/20 outline-none transition-all leading-relaxed"
                  />
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() =>
                        handleApplyPresetStrength(
                          'Outstanding verbal confidence and crisp, articulate pronunciation!'
                        )
                      }
                      className="text-[10px] bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold transition-all"
                    >
                      + Verbal confidence
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleApplyPresetStrength(
                          'Brilliant multi-sensory diagramming that made complex science simple.'
                        )
                      }
                      className="text-[10px] bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold transition-all"
                    >
                      + Great diagrams
                    </button>
                  </div>
                </div>

                {/* Recommended Accommodations */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#1E293B] uppercase tracking-wider block">
                    Recommended Learning Accommodations for Next Unit
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {commonAccommodations.map((acc) => {
                      const isChecked = selectedAccommodations.includes(acc);
                      return (
                        <button
                          key={acc}
                          type="button"
                          onClick={() => handleToggleAccommodation(acc)}
                          className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs text-left font-semibold transition-all ${
                            isChecked
                              ? 'border-[#00C896] bg-[#00C896]/10 text-[#1E293B]'
                              : 'border-slate-200 bg-white text-[#1E293B]/70 hover:bg-[#FFF7F3]'
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                              isChecked ? 'border-[#00C896] bg-[#00C896] text-white' : 'border-slate-300 bg-white'
                            }`}
                          >
                            {isChecked && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                          </div>
                          <span className="line-clamp-1">{acc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Educator Signature & Submit */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#FF8A00]/15">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#1E293B]/60">Feedback From:</span>
                    <input
                      type="text"
                      value={teacherName}
                      onChange={(e) => setTeacherName(e.target.value)}
                      className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-[#1E293B] font-semibold bg-white outline-none focus:border-[#4D84FE]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="flex items-center justify-center gap-2 rounded-2xl bg-[#4D84FE] px-6 py-3 text-xs font-extrabold text-white shadow-md shadow-[#4D84FE]/25 hover:bg-[#3B72EE] transition-all"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send Suggestions to Student</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="card-warm p-12 text-center text-[#1E293B]/60 space-y-2">
              <FileCheck className="w-10 h-10 mx-auto text-[#FF8A00]" />
              <h3 className="text-base font-bold text-[#1E293B]">Select a submission to review</h3>
              <p className="text-xs">
                Choose any voice recording or video walkthrough from the left to listen and provide guidance.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
