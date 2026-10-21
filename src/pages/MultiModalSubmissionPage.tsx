import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Video,
  Network,
  FileText,
  Play,
  Pause,
  Upload,
  CheckCircle2,
  Sparkles,
  Plus,
  Trash2,
  Volume2,
  Square,
  RefreshCw,
  Send,
  Eye,
  Award,
  Lightbulb,
  Heart,
  Clock,
  Camera
} from 'lucide-react';
import { StudentProfile, StudentSubmission, TeacherSuggestion } from '../types';

type SubmissionMode = 'audio' | 'video' | 'mindmap' | 'text';

interface MindMapNode {
  id: string;
  label: string;
  category: string;
  notes: string;
  color: string;
}

interface MultiModalSubmissionPageProps {
  student: StudentProfile;
  submissions?: StudentSubmission[];
  onSaveSubmission?: (submission: StudentSubmission) => void;
  onNavigateToDashboard?: () => void;
}

export const MultiModalSubmissionPage: React.FC<MultiModalSubmissionPageProps> = ({
  student,
  submissions = [],
  onSaveSubmission,
  onNavigateToDashboard
}) => {
  const [selectedMode, setSelectedMode] = useState<SubmissionMode>('audio');
  const [assignmentTitle] = useState('Demonstrate Understanding: TRAPPIST-1 Habitability Factors');
  const [assignmentPrompt] = useState(
    'Demonstrate how atmospheric shielding and orbital distance determine whether exoplanet TRAPPIST-1e can support liquid water. Express your understanding in whatever modality works best for your brain.'
  );

  // Audio Mode State
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [audioBlobUrl, setAudioBlobUrl] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioTranscript, setAudioTranscript] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Video Mode State
  const [videoFile, setVideoFile] = useState<{ name: string; size: string; previewUrl: string } | null>(null);
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const [videoRecordingSeconds, setVideoRecordingSeconds] = useState(0);
  const videoRecorderRef = useRef<MediaRecorder | null>(null);
  const videoChunksRef = useRef<Blob[]>([]);
  const webcamStreamRef = useRef<MediaStream | null>(null);
  const webcamPreviewRef = useRef<HTMLVideoElement | null>(null);
  const [videoKeyPoints, setVideoKeyPoints] = useState<string[]>([
    '0:15 - Magnetosphere overview',
    '1:02 - Atmospheric pressure comparison'
  ]);
  const [newKeyPoint, setNewKeyPoint] = useState('');

  // Mind Map Mode State
  const [mindMapNodes, setMindMapNodes] = useState<MindMapNode[]>([
    {
      id: 'node-1',
      label: 'TRAPPIST-1e Core',
      category: 'Geology',
      notes: 'Dense iron core produces protective magnetic field against M-dwarf flares.',
      color: 'bg-rose-100 border-rose-300 text-rose-950'
    },
    {
      id: 'node-2',
      label: 'Habitable Goldilocks Zone',
      category: 'Orbital Mechanics',
      notes: 'Receives ~66% of Earth stellar flux, allowing stable surface liquid water.',
      color: 'bg-emerald-100 border-emerald-300 text-emerald-950'
    },
    {
      id: 'node-3',
      label: 'Atmospheric Shield',
      category: 'Atmosphere',
      notes: 'Secondary outgassing maintains greenhouse balance without runaway vaporization.',
      color: 'bg-sky-100 border-sky-300 text-sky-950'
    }
  ]);
  const [newNodeLabel, setNewNodeLabel] = useState('');
  const [newNodeNotes, setNewNodeNotes] = useState('');

  // Written Text Mode
  const [textContent, setTextContent] = useState(
    'TRAPPIST-1e is considered the most promising candidate because its density suggests an Earth-like rocky composition with an active core. While its parent star emits intense ultraviolet flares, simulations indicate that a modest magnetic shield combined with ozone layers can preserve surface water.'
  );

  // Submission Status
  const [isSubmittedJustNow, setIsSubmittedJustNow] = useState(false);

  // Filter submissions for this student
  const studentSubmissions = submissions.filter(
    (s) => s.studentId === student.id || s.studentName === student.name
  );

  // Audio Recording Handlers (Real MediaRecorder with Fallback Simulation)
  const handleStartAudioRecording = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;
        audioChunksRef.current = [];

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };

        recorder.onstop = () => {
          const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const url = URL.createObjectURL(blob);
          setAudioBlobUrl(url);
          if (!audioTranscript) {
            setAudioTranscript(
              'Spoken summary: "I explained how the iron core density creates magnetic shielding against stellar flares, keeping liquid water safe on TRAPPIST-1e."'
            );
          }
        };

        recorder.start();
        setIsRecordingAudio(true);
        setRecordingSeconds(0);
      } else {
        setIsRecordingAudio(true);
        setRecordingSeconds(0);
      }
    } catch {
      setIsRecordingAudio(true);
      setRecordingSeconds(0);
    }
  };

  const handleStopAudioRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
    } else {
      // Fallback simulated audio note
      setAudioBlobUrl('simulated-audio-note');
      if (!audioTranscript) {
        setAudioTranscript(
          'Spoken summary: "In this verbal walkthrough, I explained how TRAPPIST-1e stays in the Goldilocks zone with balanced greenhouse gases and magnetic defense."'
        );
      }
    }
    setIsRecordingAudio(false);
  };

  useEffect(() => {
    let interval: number;
    if (isRecordingAudio) {
      interval = window.setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => window.clearInterval(interval);
  }, [isRecordingAudio]);

  // Video Webcam Recording Handlers
  const handleStartWebcamVideo = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        webcamStreamRef.current = stream;
        if (webcamPreviewRef.current) {
          webcamPreviewRef.current.srcObject = stream;
        }

        const recorder = new MediaRecorder(stream);
        videoRecorderRef.current = recorder;
        videoChunksRef.current = [];

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) videoChunksRef.current.push(e.data);
        };

        recorder.onstop = () => {
          const blob = new Blob(videoChunksRef.current, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          setVideoFile({
            name: `Webcam_Presentation_${student.name.replace(/\s+/g, '_')}.webm`,
            size: `${(blob.size / (1024 * 1024)).toFixed(1)} MB`,
            previewUrl: url
          });
        };

        recorder.start();
        setIsRecordingVideo(true);
        setVideoRecordingSeconds(0);
      }
    } catch (e) {
      alert('Camera access could not be initialized. You can also upload a video file directly below!');
    }
  };

  const handleStopWebcamVideo = () => {
    if (videoRecorderRef.current && videoRecorderRef.current.state !== 'inactive') {
      videoRecorderRef.current.stop();
    }
    if (webcamStreamRef.current) {
      webcamStreamRef.current.getTracks().forEach((t) => t.stop());
      webcamStreamRef.current = null;
    }
    setIsRecordingVideo(false);
  };

  useEffect(() => {
    let interval: number;
    if (isRecordingVideo) {
      interval = window.setInterval(() => {
        setVideoRecordingSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => window.clearInterval(interval);
  }, [isRecordingVideo]);

  const handleAddKeyPoint = () => {
    if (!newKeyPoint.trim()) return;
    setVideoKeyPoints([...videoKeyPoints, newKeyPoint.trim()]);
    setNewKeyPoint('');
  };

  const handleAddMindMapNode = () => {
    if (!newNodeLabel.trim()) return;
    const colors = [
      'bg-purple-100 border-purple-300 text-purple-950',
      'bg-amber-100 border-amber-300 text-amber-950',
      'bg-indigo-100 border-indigo-300 text-indigo-950'
    ];
    const node: MindMapNode = {
      id: `node-${Date.now()}`,
      label: newNodeLabel.trim(),
      category: 'Concept Node',
      notes: newNodeNotes.trim() || 'Visual idea connection',
      color: colors[mindMapNodes.length % colors.length]
    };
    setMindMapNodes([...mindMapNodes, node]);
    setNewNodeLabel('');
    setNewNodeNotes('');
  };

  const handleRemoveMindMapNode = (id: string) => {
    setMindMapNodes((prev) => prev.filter((n) => n.id !== id));
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile({
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        previewUrl: URL.createObjectURL(file)
      });
    }
  };

  const handleSubmit = () => {
    const newSubmission: StudentSubmission = {
      id: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      studentId: student.id,
      studentName: student.name,
      studentDiagnoses: student.diagnoses,
      lessonId: 'lesson-solar-system',
      lessonTitle: assignmentTitle,
      mode: selectedMode,
      audioBlobUrl: selectedMode === 'audio' ? audioBlobUrl || undefined : undefined,
      audioDurationSec: selectedMode === 'audio' ? recordingSeconds || 45 : undefined,
      audioTranscript: selectedMode === 'audio' ? audioTranscript : undefined,
      videoUrl: selectedMode === 'video' ? videoFile?.previewUrl : undefined,
      videoFileName: selectedMode === 'video' ? videoFile?.name : undefined,
      videoKeyPoints: selectedMode === 'video' ? videoKeyPoints : undefined,
      textContent: selectedMode === 'text' ? textContent : undefined,
      mindMapNodes: selectedMode === 'mindmap' ? mindMapNodes : undefined,
      submittedAt: new Date().toISOString(),
      teacherFeedback: {
        teacherName: '',
        suggestion: '',
        status: 'pending',
        reviewedAt: ''
      }
    };

    if (onSaveSubmission) {
      onSaveSubmission(newSubmission);
    }

    setIsSubmittedJustNow(true);
    setTimeout(() => {
      setIsSubmittedJustNow(false);
    }, 6000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#FF8A00]/20 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF8A00] bg-[#FFF7F3] border border-[#FF8A00]/25 px-3 py-1 rounded-full mb-2">
              <Sparkles className="h-3.5 w-3.5 text-[#FF8A00]" />
              <span>Multi-Modal Flexibility • Neurodiversity First</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1E293B]">
              Submit Assignment with Voice or Video
            </h1>
            <p className="text-sm text-[#1E293B]/70 mt-1 max-w-2xl leading-relaxed">
              Express your knowledge in the format that feels easiest for your brain. Record your voice, shoot a video walkthrough, draw a mind map, or type notes. Your teacher will review and send helpful suggestions.
            </p>
          </div>

          <div className="bg-[#FFF7F3] rounded-2xl p-4 border border-[#FF8A00]/20 shrink-0 text-center">
            <span className="text-[11px] text-[#1E293B]/60 block uppercase tracking-wider font-bold">
              Feedback Loop
            </span>
            <span className="text-sm font-extrabold text-[#00C896] block mt-0.5">
              Teacher Review Active
            </span>
            <span className="text-[10px] text-[#1E293B]/50 font-medium mt-0.5 block">
              Audio & Video Supported
            </span>
          </div>
        </div>
      </div>

      {/* Assignment Prompt Overview */}
      <div className="card-warm p-5">
        <span className="text-[11px] font-bold text-[#FF8A00] uppercase tracking-wider">
          Active Assignment Prompt
        </span>
        <h3 className="text-base font-bold text-[#1E293B] mt-0.5">{assignmentTitle}</h3>
        <p className="text-xs text-[#1E293B]/70 mt-1 leading-relaxed">{assignmentPrompt}</p>
      </div>

      {/* Modality Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            mode: 'audio' as SubmissionMode,
            label: 'Voice Recording',
            desc: 'Speak your thoughts freely',
            icon: Mic,
            activeColor: 'border-[#00C896] text-[#00C896] bg-[#00C896]/10'
          },
          {
            mode: 'video' as SubmissionMode,
            label: 'Video Walkthrough',
            desc: 'Webcam or uploaded video',
            icon: Video,
            activeColor: 'border-[#FF8A00] text-[#FF8A00] bg-[#FF8A00]/10'
          },
          {
            mode: 'mindmap' as SubmissionMode,
            label: 'Visual Mind Map',
            desc: 'Concept graph & nodes',
            icon: Network,
            activeColor: 'border-[#4D84FE] text-[#4D84FE] bg-[#4D84FE]/10'
          },
          {
            mode: 'text' as SubmissionMode,
            label: 'Structured Writing',
            desc: 'Guided written response',
            icon: FileText,
            activeColor: 'border-[#1E293B] text-[#1E293B] bg-slate-100'
          }
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = selectedMode === tab.mode;
          return (
            <button
              key={tab.mode}
              onClick={() => setSelectedMode(tab.mode)}
              className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                isSelected
                  ? `${tab.activeColor} shadow-xs font-bold`
                  : 'bg-white border-[#FF8A00]/15 hover:bg-[#FFF7F3] text-[#1E293B]/70'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-xl bg-white border border-[#FF8A00]/15 shadow-2xs">
                  <Icon className="h-4 w-4" />
                </div>
                {isSelected && (
                  <span className="text-[10px] font-extrabold uppercase tracking-wider">
                    Selected
                  </span>
                )}
              </div>
              <div>
                <span className="text-sm font-bold block">{tab.label}</span>
                <span className="text-[11px] opacity-70 block mt-0.5">{tab.desc}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Modality Specific Workspace */}
      <div className="card-warm p-6 sm:p-8 space-y-6">
        {/* 1. Voice Recording Mode */}
        {selectedMode === 'audio' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#FF8A00]/15">
              <div>
                <h3 className="text-lg font-bold text-[#1E293B]">
                  Voice Recording Studio
                </h3>
                <p className="text-xs text-[#1E293B]/60 mt-0.5">
                  Record your oral explanation. Perfect for ADHD and Dyslexia without writing friction.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[#1E293B] bg-white px-3 py-1 rounded-xl border border-[#FF8A00]/20">
                  {Math.floor(recordingSeconds / 60)}:
                  {(recordingSeconds % 60).toString().padStart(2, '0')}
                </span>
              </div>
            </div>

            {/* Mic Controls */}
            <div className="bg-[#FFF7F3] p-6 rounded-2xl border border-[#FF8A00]/20 text-center space-y-4">
              <div className="flex items-center justify-center">
                <button
                  type="button"
                  onClick={isRecordingAudio ? handleStopAudioRecording : handleStartAudioRecording}
                  className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-md ${
                    isRecordingAudio
                      ? 'bg-rose-500 text-white animate-pulse ring-8 ring-rose-200'
                      : 'bg-[#00C896] hover:bg-[#00B285] text-white'
                  }`}
                >
                  {isRecordingAudio ? (
                    <Square className="h-8 w-8 fill-current" />
                  ) : (
                    <Mic className="h-8 w-8" />
                  )}
                </button>
              </div>

              <div>
                <span className="text-sm font-bold text-[#1E293B] block">
                  {isRecordingAudio
                    ? 'Recording your voice... Click to Stop'
                    : audioBlobUrl
                    ? 'Recording captured! Click mic to re-record'
                    : 'Click microphone to begin voice recording'}
                </span>
                <span className="text-xs text-[#1E293B]/50 block mt-1">
                  Speak at your natural pace. Your teacher will listen and send suggestions directly back to you.
                </span>
              </div>

              {/* Audio Playback Player */}
              {audioBlobUrl && (
                <div className="max-w-md mx-auto pt-2">
                  <div className="p-3 bg-white rounded-xl border border-[#00C896]/30 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#00C896]/15 flex items-center justify-center text-[#00C896] shrink-0">
                      <Volume2 className="w-4 h-4" />
                    </div>
                    <div className="flex-1 text-left">
                      <span className="text-xs font-bold text-[#1E293B] block">
                        Your Voice Recording Ready
                      </span>
                      <span className="text-[10px] text-[#1E293B]/50">
                        Duration: {recordingSeconds || 42} seconds
                      </span>
                    </div>
                    <audio controls src={audioBlobUrl} className="h-8 max-w-[200px]" />
                  </div>
                </div>
              )}
            </div>

            {/* Transcript / Spoken Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#1E293B] uppercase tracking-wider block">
                Voice Notes & Spoken Summary (For your teacher to read along)
              </label>
              <textarea
                rows={3}
                value={audioTranscript}
                onChange={(e) => setAudioTranscript(e.target.value)}
                placeholder="Optional: Type key points you mentioned in your recording..."
                className="w-full rounded-2xl border border-[#FF8A00]/25 bg-white p-3.5 text-xs text-[#1E293B] focus:border-[#4D84FE] focus:ring-2 focus:ring-[#4D84FE]/20 outline-none transition-all"
              />
            </div>
          </div>
        )}

        {/* 2. Video Walkthrough Mode */}
        {selectedMode === 'video' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#FF8A00]/15">
              <div>
                <h3 className="text-lg font-bold text-[#1E293B]">
                  Video Walkthrough Studio
                </h3>
                <p className="text-xs text-[#1E293B]/60 mt-0.5">
                  Record using your webcam or upload a pre-recorded presentation video.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Webcam Recording Option */}
              <div className="p-5 rounded-2xl bg-[#FFF7F3] border border-[#FF8A00]/20 space-y-3 text-center">
                <div className="w-10 h-10 rounded-xl bg-[#FF8A00] text-white flex items-center justify-center mx-auto">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#1E293B]">Record with Webcam</h4>
                  <p className="text-xs text-[#1E293B]/60 mt-0.5">
                    Demonstrate props, screen models, or talk to camera.
                  </p>
                </div>

                {isRecordingVideo ? (
                  <div className="space-y-3">
                    <video
                      ref={webcamPreviewRef}
                      autoPlay
                      muted
                      className="w-full max-h-48 rounded-xl bg-black object-cover"
                    />
                    <div className="flex items-center justify-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                      <span className="text-xs font-mono font-bold text-rose-600">
                        Recording: {videoRecordingSeconds}s
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleStopWebcamVideo}
                      className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700"
                    >
                      Stop & Save Video
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleStartWebcamVideo}
                    className="px-4 py-2.5 rounded-xl bg-[#FF8A00] hover:bg-[#E67C00] text-white font-bold text-xs transition-all shadow-xs"
                  >
                    Start Webcam Recording
                  </button>
                )}
              </div>

              {/* File Upload Option */}
              <div className="p-5 rounded-2xl bg-[#FFF7F3] border border-[#FF8A00]/20 space-y-3 text-center">
                <div className="w-10 h-10 rounded-xl bg-[#4D84FE] text-white flex items-center justify-center mx-auto">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#1E293B]">Upload Video File</h4>
                  <p className="text-xs text-[#1E293B]/60 mt-0.5">
                    Upload MP4, WebM, or MOV screen recordings.
                  </p>
                </div>
                <label className="inline-block cursor-pointer px-4 py-2.5 rounded-xl bg-[#4D84FE] hover:bg-[#3B72EE] text-white font-bold text-xs transition-all shadow-xs">
                  Choose Video File
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Video Preview Player */}
            {videoFile && (
              <div className="p-4 rounded-2xl bg-white border border-[#00C896]/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-[#00C896]" />
                    <span className="text-xs font-bold text-[#1E293B]">
                      Video Attached: {videoFile.name} ({videoFile.size})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setVideoFile(null)}
                    className="text-xs text-rose-500 hover:underline"
                  >
                    Remove
                  </button>
                </div>

                <video
                  controls
                  src={videoFile.previewUrl}
                  className="w-full max-h-56 rounded-xl bg-black object-contain"
                />
              </div>
            )}

            {/* Key Timestamp Chapters */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#1E293B] uppercase tracking-wider block">
                Video Timestamps & Key Topics
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newKeyPoint}
                  onChange={(e) => setNewKeyPoint(e.target.value)}
                  placeholder="e.g., 0:30 - Explanation of orbital distance"
                  className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs text-[#1E293B] outline-none focus:border-[#4D84FE]"
                />
                <button
                  type="button"
                  onClick={handleAddKeyPoint}
                  className="px-4 py-2 rounded-xl bg-[#00C896] text-white font-bold text-xs hover:bg-[#00B285]"
                >
                  Add Chapter
                </button>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {videoKeyPoints.map((kp, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-[#FFF7F3] border border-[#FF8A00]/20 text-[#1E293B] px-3 py-1 rounded-xl font-medium"
                  >
                    {kp}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 3. Mind Map Mode */}
        {selectedMode === 'mindmap' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#FF8A00]/15">
              <h3 className="text-base font-bold text-[#1E293B]">
                Interactive Concept Mind Map
              </h3>
              <span className="text-xs text-[#1E293B]/50 font-medium">
                {mindMapNodes.length} nodes connected
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {mindMapNodes.map((node) => (
                <div
                  key={node.id}
                  className={`p-4 rounded-2xl border ${node.color} relative group shadow-2xs`}
                >
                  <button
                    onClick={() => handleRemoveMindMapNode(node.id)}
                    className="absolute top-2 right-2 text-slate-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                  <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">
                    {node.category}
                  </span>
                  <h4 className="text-sm font-bold mt-0.5">{node.label}</h4>
                  <p className="text-xs mt-1 leading-relaxed opacity-90">{node.notes}</p>
                </div>
              ))}
            </div>

            <div className="p-4 bg-[#FFF7F3] rounded-2xl border border-[#FF8A00]/20 flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="New concept node label..."
                value={newNodeLabel}
                onChange={(e) => setNewNodeLabel(e.target.value)}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-[#4D84FE]"
              />
              <input
                type="text"
                placeholder="Concept details or notes..."
                value={newNodeNotes}
                onChange={(e) => setNewNodeNotes(e.target.value)}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-[#4D84FE]"
              />
              <button
                type="button"
                onClick={handleAddMindMapNode}
                className="px-4 py-2 rounded-xl bg-[#4D84FE] text-white font-bold text-xs shrink-0 hover:bg-[#3B72EE]"
              >
                + Add Node
              </button>
            </div>
          </div>
        )}

        {/* 4. Structured Writing Mode */}
        {selectedMode === 'text' && (
          <div className="space-y-3">
            <h3 className="text-base font-bold text-[#1E293B]">
              Structured Written Response
            </h3>
            <textarea
              rows={6}
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              className="w-full rounded-2xl border border-[#FF8A00]/25 bg-white p-4 text-xs text-[#1E293B] leading-relaxed outline-none focus:border-[#4D84FE] focus:ring-2 focus:ring-[#4D84FE]/20"
            />
          </div>
        )}

        {/* Submission Confirmation Banner */}
        {isSubmittedJustNow && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-3 animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <span className="block text-sm">Assignment successfully sent to your teacher!</span>
              <span className="block text-[11px] font-normal text-emerald-800">
                Ms. Priya will listen to your voice recording / video walkthrough and provide constructive suggestions.
              </span>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#FF8A00]/15">
          <div className="text-xs text-[#1E293B]/60">
            Student: <strong>{student.name}</strong> • Modality: <strong className="capitalize">{selectedMode}</strong>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-[#00C896] hover:bg-[#00B285] px-8 py-3.5 text-sm font-extrabold text-white shadow-md shadow-[#00C896]/25 transition-all"
          >
            <Send className="w-4 h-4" />
            <span>Submit to Teacher for Suggestions</span>
          </button>
        </div>
      </div>

      {/* Submitted Assignments & Teacher Suggestions Section */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#FF8A00]/15 text-[#FF8A00] flex items-center justify-center">
              <Lightbulb className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#1E293B]">
                My Submissions & Teacher Suggestions
              </h2>
              <p className="text-xs text-[#1E293B]/60">
                View your submitted voice & video recordings and read suggestions from your educator.
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-[#1E293B]/50">
            {studentSubmissions.length} record{studentSubmissions.length === 1 ? '' : 's'}
          </span>
        </div>

        {studentSubmissions.length === 0 ? (
          <div className="card-warm p-8 text-center text-[#1E293B]/60 space-y-2">
            <Volume2 className="w-8 h-8 mx-auto text-[#FF8A00]" />
            <h4 className="text-sm font-bold text-[#1E293B]">No previous submissions yet</h4>
            <p className="text-xs">
              Record your voice or video above and submit to receive personalized suggestions from your teacher!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {studentSubmissions.map((sub) => {
              const hasFeedback = sub.teacherFeedback && sub.teacherFeedback.status === 'reviewed';

              return (
                <div key={sub.id} className="card-warm p-6 space-y-4">
                  {/* Top Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#FF8A00]/15">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          sub.mode === 'audio'
                            ? 'bg-[#00C896]/15 text-[#00C896]'
                            : 'bg-[#FF8A00]/15 text-[#FF8A00]'
                        }`}
                      >
                        {sub.mode === 'audio' ? <Mic className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#1E293B]">{sub.lessonTitle}</h4>
                        <span className="text-[11px] text-[#1E293B]/50">
                          Submitted {new Date(sub.submittedAt).toLocaleDateString()} at{' '}
                          {new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    {hasFeedback ? (
                      <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Teacher Suggestions Received!
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold flex items-center gap-1 border border-amber-200">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        Awaiting Teacher Review
                      </span>
                    )}
                  </div>

                  {/* Submission Playback Preview */}
                  {sub.mode === 'audio' && (
                    <div className="p-3.5 rounded-xl bg-[#FFF7F3] border border-[#FF8A00]/15 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#1E293B] flex items-center gap-1.5">
                          <Mic className="w-3.5 h-3.5 text-[#00C896]" />
                          Your Voice Audio Recording ({sub.audioDurationSec || 40}s)
                        </span>
                      </div>
                      {sub.audioBlobUrl && (
                        <audio controls src={sub.audioBlobUrl} className="w-full h-8" />
                      )}
                      {sub.audioTranscript && (
                        <p className="text-xs text-[#1E293B]/80 italic">"{sub.audioTranscript}"</p>
                      )}
                    </div>
                  )}

                  {sub.mode === 'video' && (
                    <div className="p-3.5 rounded-xl bg-[#FFF7F3] border border-[#FF8A00]/15 space-y-2">
                      <span className="text-xs font-bold text-[#1E293B] flex items-center gap-1.5">
                        <Video className="w-3.5 h-3.5 text-[#FF8A00]" />
                        Your Video Walkthrough ({sub.videoFileName || 'Recorded Walkthrough'})
                      </span>
                      {sub.videoUrl && (
                        <video controls src={sub.videoUrl} className="w-full max-h-48 rounded-lg bg-black" />
                      )}
                    </div>
                  )}

                  {/* Teacher Feedback / Suggestion Box */}
                  {hasFeedback ? (
                    <div className="rounded-2xl bg-gradient-to-br from-[#FFF7F3] to-white p-5 border-2 border-[#00C896]/30 shadow-xs space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-[#00C896] text-white flex items-center justify-center font-bold">
                            ✓
                          </div>
                          <div>
                            <span className="text-xs font-bold text-[#1E293B] block">
                              Personalized Suggestions from {sub.teacherFeedback?.teacherName || 'Ms. Priya'}
                            </span>
                            <span className="text-[10px] text-[#1E293B]/50">
                              Reviewed {new Date(sub.teacherFeedback?.reviewedAt || '').toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {sub.teacherFeedback?.score && (
                          <span className="text-xs font-black text-[#00C896] bg-[#00C896]/10 px-3 py-1 rounded-full">
                            Score: {sub.teacherFeedback.score}/100
                          </span>
                        )}
                      </div>

                      {/* Constructive Suggestion */}
                      <div className="p-3.5 bg-white rounded-xl border border-[#FF8A00]/15 space-y-1">
                        <span className="text-[11px] font-bold text-[#FF8A00] uppercase tracking-wider block">
                          Teacher Suggestions & Advice:
                        </span>
                        <p className="text-xs text-[#1E293B] font-medium leading-relaxed">
                          "{sub.teacherFeedback?.suggestion}"
                        </p>
                      </div>

                      {/* Strengths */}
                      {sub.teacherFeedback?.strengths && (
                        <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200 text-xs text-emerald-950 space-y-0.5">
                          <strong className="text-emerald-900 block font-bold">
                            Recognized Strengths & Encouragement:
                          </strong>
                          <p className="text-emerald-800 leading-relaxed">
                            {sub.teacherFeedback.strengths}
                          </p>
                        </div>
                      )}

                      {/* Approved Accommodations */}
                      {sub.teacherFeedback?.recommendedAccommodations &&
                        sub.teacherFeedback.recommendedAccommodations.length > 0 && (
                          <div className="space-y-1">
                            <span className="text-[11px] font-bold text-[#1E293B]/70 uppercase tracking-wider block">
                              Accommodations Approved for Next Unit:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {sub.teacherFeedback.recommendedAccommodations.map((acc, i) => (
                                <span
                                  key={i}
                                  className="text-xs bg-[#4D84FE]/10 text-[#4D84FE] border border-[#4D84FE]/20 px-2.5 py-0.5 rounded-full font-bold"
                                >
                                  {acc}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200/80 text-amber-900 text-xs flex items-center gap-2.5">
                      <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                      <div>
                        <strong className="block">Awaiting Teacher Suggestions</strong>
                        <span className="text-amber-800">
                          Ms. Priya has received your submission and will provide audio/video feedback shortly.
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
