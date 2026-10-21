import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronRight,
  Volume2,
  VolumeX,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowRight,
  Info,
  CheckCircle2,
  FileText,
  Video,
  Presentation,
  ChevronLeft,
  Download,
  Eye,
  Type,
  Palette,
  BookMarked,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { StudentProfile, LessonContent } from '../types';
import { SOLAR_SYSTEM_LESSON } from '../mockData';
import { adaptContent } from '../algorithms/softComputing';
import { InteractivePdfViewer } from '../components/InteractivePdfViewer';
import { ReadingFocusRuler } from '../components/ReadingFocusRuler';
import { IrlenColorTintOverlay, IrlenTint } from '../components/IrlenColorTintOverlay';
import { NeuroGlossaryModal } from '../components/NeuroGlossaryModal';
import { formatBionicReading } from '../utils/bionicReading';
import { findGlossaryTerm, NEURO_GLOSSARY, GlossaryEntry } from '../utils/neuroGlossary';

interface LessonViewProps {
  student: StudentProfile;
  lesson?: LessonContent;
  onNavigateToQuiz: () => void;
  onNavigateBack: () => void;
  onCompleteLesson?: (lessonId: string) => void;
}

export const LessonView: React.FC<LessonViewProps> = ({
  student,
  lesson = SOLAR_SYSTEM_LESSON,
  onNavigateToQuiz,
  onNavigateBack,
  onCompleteLesson
}) => {
  // Compute initial adaptive settings via the ANFIS controller
  const anfisRecommendation = adaptContent(student.currentFocusScore, student);

  const isPdf = Boolean(
    lesson.fileType === 'application/pdf' ||
    lesson.pptFileName?.toLowerCase().endsWith('.pdf')
  );

  const isPpt = Boolean(
    lesson.pptFileName?.toLowerCase().endsWith('.ppt') ||
    lesson.pptFileName?.toLowerCase().endsWith('.pptx') ||
    (!isPdf && lesson.pptSlides && lesson.pptSlides.length > 0)
  );

  // Core typography and theme state
  const [fontSize, setFontSize] = useState<'14px' | '16px' | '18px'>(anfisRecommendation.fontSize);
  const [lineSpacing, setLineSpacing] = useState<'1.4' | '1.6' | '1.8'>(anfisRecommendation.lineSpacing);
  const [theme, setTheme] = useState<'light' | 'cream' | 'dark'>(anfisRecommendation.theme);
  const [isWhyOpen, setIsWhyOpen] = useState(true);

  // Assistive feature states (real, practical neurodivergent tools)
  const [isRulerActive, setIsRulerActive] = useState(false);
  const [isBionicActive, setIsBionicActive] = useState(false);
  const [selectedTint, setSelectedTint] = useState<IrlenTint>('none');
  const [tintIntensity, setTintIntensity] = useState(0.2);
  const [isTintMenuOpen, setIsTintMenuOpen] = useState(false);
  const [activeGlossaryEntry, setActiveGlossaryEntry] = useState<GlossaryEntry | null>(null);
  const [isGlossaryDrawerOpen, setIsGlossaryDrawerOpen] = useState(false);

  // Enhanced Speech & Karaoke Tracking state
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSpeechPaused, setIsSpeechPaused] = useState(false);
  const [speechSpeed, setSpeechSpeed] = useState<number>(0.9);
  const [currentSpeakingSectionIdx, setCurrentSpeakingSectionIdx] = useState<number | null>(null);
  const [currentSpeakingSentence, setCurrentSpeakingSentence] = useState<string>('');

  // Active view tab: 'all' | 'video' | 'slides' | 'pdf' | 'reading'
  const [activeMediaTab, setActiveMediaTab] = useState<'all' | 'video' | 'slides' | 'pdf' | 'reading'>(() => {
    if (isPdf) return 'pdf';
    if (isPpt) return 'slides';
    if (lesson.videoUrl) return 'video';
    return 'reading';
  });

  // Presentation slides viewer state
  const slides = lesson.pptSlides || [];
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showSpeakerNotes, setShowSpeakerNotes] = useState(false);

  // Synchronize when student's focus score changes
  useEffect(() => {
    const updated = adaptContent(student.currentFocusScore, student);
    setFontSize(updated.fontSize);
    setLineSpacing(updated.lineSpacing);
    setTheme(updated.theme);
  }, [student.currentFocusScore, student]);

  // Cleanup speech synthesis on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Split section into sentences for fine-grained karaoke reading
  const splitIntoSentences = (text: string): string[] => {
    if (!text) return [];
    return text.match(/[^.!?]+[.!?]+(\s+|$)|[^.!?]+$/g) || [text];
  };

  // Playback controller for sentence-by-sentence TTS
  const speakSection = (sectionIndex: number, textToSpeak: string) => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported on this browser.');
      return;
    }

    if (isSpeaking && currentSpeakingSectionIdx === sectionIndex && !isSpeechPaused) {
      window.speechSynthesis.pause();
      setIsSpeechPaused(true);
      return;
    }

    if (isSpeechPaused && currentSpeakingSectionIdx === sectionIndex) {
      window.speechSynthesis.resume();
      setIsSpeechPaused(false);
      return;
    }

    window.speechSynthesis.cancel();
    setCurrentSpeakingSectionIdx(sectionIndex);
    setIsSpeaking(true);
    setIsSpeechPaused(false);

    const sentences = splitIntoSentences(textToSpeak);
    let sIdx = 0;

    const speakNextSentence = () => {
      if (sIdx >= sentences.length) {
        setIsSpeaking(false);
        setIsSpeechPaused(false);
        setCurrentSpeakingSectionIdx(null);
        setCurrentSpeakingSentence('');
        return;
      }

      const sentence = sentences[sIdx].trim();
      setCurrentSpeakingSentence(sentence);

      const utterance = new SpeechSynthesisUtterance(sentence);
      utterance.rate = speechSpeed;
      utterance.pitch = 1.0;

      utterance.onend = () => {
        sIdx++;
        speakNextSentence();
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        setIsSpeechPaused(false);
        setCurrentSpeakingSectionIdx(null);
        setCurrentSpeakingSentence('');
      };

      window.speechSynthesis.speak(utterance);
    };

    speakNextSentence();
  };

  // Read entire lesson sequentially
  const handleToggleWholeLessonSpeech = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsSpeechPaused(false);
      setCurrentSpeakingSectionIdx(null);
      setCurrentSpeakingSentence('');
      return;
    }

    const fullText = `${lesson.title}. ${lesson.description}. ${lesson.sections
      .map((s) => `${s.heading}. ${s.text}`)
      .join(' ')}`;

    speakSection(-1, fullText);
  };

  // Theme styling classes
  const themeClasses = {
    light: 'bg-white text-[#1E293B] border-slate-200/90',
    cream: 'bg-[#FFF7F3] text-[#1E293B] border-[#FF8A00]/20',
    dark: 'bg-[#1E293B] text-slate-100 border-slate-700'
  };

  // Font size classes
  const fontSizeClasses = {
    '14px': 'text-sm',
    '16px': 'text-base',
    '18px': 'text-lg'
  };

  // Line spacing classes
  const lineSpacingClasses = {
    '1.4': 'leading-normal',
    '1.6': 'leading-relaxed',
    '1.8': 'leading-loose'
  };

  const currentSlide = slides[currentSlideIndex];

  // Render text with interactive glossary hot-spots & optional bionic reading
  const renderInteractiveText = (text: string) => {
    if (isBionicActive) {
      return formatBionicReading(text);
    }

    // Split words to detect glossary terms
    const words = text.split(/(\s+)/);
    return words.map((token, i) => {
      const entry = findGlossaryTerm(token);
      if (entry) {
        return (
          <span
            key={i}
            onClick={(e) => {
              e.stopPropagation();
              setActiveGlossaryEntry(entry);
            }}
            className="cursor-pointer underline decoration-dotted decoration-[#FF8A00] decoration-2 underline-offset-4 font-semibold text-[#1E293B] hover:bg-[#FF8A00]/20 px-1 py-0.5 rounded transition-all"
            title={`Click for simple meaning of "${entry.term}"`}
          >
            {token}
            <Sparkles className="inline-block w-2.5 h-2.5 text-[#FF8A00] ml-0.5 -mt-2" />
          </span>
        );
      }
      return token;
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 1. Assistive Overlays */}
      <ReadingFocusRuler
        isActive={isRulerActive}
        onToggle={() => setIsRulerActive(!isRulerActive)}
      />
      <IrlenColorTintOverlay tint={selectedTint} intensity={tintIntensity} />
      <NeuroGlossaryModal
        entry={activeGlossaryEntry}
        onClose={() => setActiveGlossaryEntry(null)}
      />

      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-slate-500" aria-label="Breadcrumb">
        <button
          onClick={onNavigateBack}
          className="hover:text-[#4D84FE] font-medium transition-colors"
        >
          My Lessons
        </button>
        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
        <span className="text-[#1E293B] font-semibold">{lesson.title}</span>
      </nav>

      {/* Header with Title & Adaptivity Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#FF8A00]/15 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF8A00] bg-[#FFF7F3] border border-[#FF8A00]/20 px-3 py-1 rounded-full mb-1.5">
            <Sparkles className="h-3.5 w-3.5 text-[#FF8A00]" />
            Neuro-Sensory Adaptive Lesson Hub
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1E293B]">
            {lesson.title}
          </h1>
          <p className="text-sm text-[#1E293B]/70 mt-1">
            {lesson.description}
          </p>
        </div>

        {/* Text & Assistive Settings Toolbar */}
        <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl border border-[#FF8A00]/20 shadow-xs">
          {/* Font Size A- / A / A+ */}
          <div className="flex items-center bg-[#FFF7F3] p-0.5 rounded-xl border border-[#FF8A00]/10">
            <button
              id="font-size-small"
              onClick={() => setFontSize('14px')}
              className={`px-2 py-1 text-xs font-bold rounded-lg transition-all ${
                fontSize === '14px' ? 'bg-[#4D84FE] text-white shadow-xs' : 'text-[#1E293B]/70'
              }`}
              title="Compact font (14px)"
            >
              A-
            </button>
            <button
              id="font-size-medium"
              onClick={() => setFontSize('16px')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                fontSize === '16px' ? 'bg-[#4D84FE] text-white shadow-xs' : 'text-[#1E293B]/70'
              }`}
              title="Regular font (16px)"
            >
              A
            </button>
            <button
              id="font-size-large"
              onClick={() => setFontSize('18px')}
              className={`px-2 py-1 text-xs font-bold rounded-lg transition-all ${
                fontSize === '18px' ? 'bg-[#4D84FE] text-white shadow-xs' : 'text-[#1E293B]/70'
              }`}
              title="Large font (18px) for dyslexia/low fatigue"
            >
              A+
            </button>
          </div>

          {/* Line Spacing */}
          <div className="flex items-center bg-[#FFF7F3] p-0.5 rounded-xl border border-[#FF8A00]/10">
            <button
              id="line-spacing-14"
              onClick={() => setLineSpacing('1.4')}
              className={`px-2 py-1 text-xs rounded-lg font-mono transition-all ${
                lineSpacing === '1.4' ? 'bg-[#00C896] text-white shadow-xs' : 'text-[#1E293B]/70'
              }`}
              title="Tight line spacing (1.4)"
            >
              ≡
            </button>
            <button
              id="line-spacing-16"
              onClick={() => setLineSpacing('1.6')}
              className={`px-2 py-1 text-xs rounded-lg font-mono transition-all ${
                lineSpacing === '1.6' ? 'bg-[#00C896] text-white shadow-xs' : 'text-[#1E293B]/70'
              }`}
              title="Medium line spacing (1.6)"
            >
              ≣
            </button>
            <button
              id="line-spacing-18"
              onClick={() => setLineSpacing('1.8')}
              className={`px-2 py-1 text-xs rounded-lg font-mono transition-all ${
                lineSpacing === '1.8' ? 'bg-[#00C896] text-white shadow-xs' : 'text-[#1E293B]/70'
              }`}
              title="Relaxed line spacing (1.8)"
            >
              ☷
            </button>
          </div>

          {/* Color Themes: White / Sepia-Cream / Dark */}
          <div className="flex items-center gap-1.5 px-1">
            <button
              id="theme-light-btn"
              onClick={() => setTheme('light')}
              className={`h-5 w-5 rounded-full bg-white border-2 transition-all ${
                theme === 'light' ? 'border-[#4D84FE] scale-110 shadow-xs' : 'border-[#1E293B]/20'
              }`}
              title="Clean Light Theme"
            />
            <button
              id="theme-cream-btn"
              onClick={() => setTheme('cream')}
              className={`h-5 w-5 rounded-full bg-[#FFF7F3] border-2 transition-all ${
                theme === 'cream' ? 'border-[#FF8A00] scale-110 shadow-xs' : 'border-[#FF8A00]/30'
              }`}
              title="Warm Peach Cream (#FFF7F3)"
            />
            <button
              id="theme-dark-btn"
              onClick={() => setTheme('dark')}
              className={`h-5 w-5 rounded-full bg-[#1E293B] border-2 transition-all ${
                theme === 'dark' ? 'border-[#00C896] scale-110 shadow-xs' : 'border-transparent'
              }`}
              title="Charcoal Dark Theme"
            />
          </div>

          {/* Bionic Reading Toggle */}
          <button
            id="toggle-bionic-btn"
            onClick={() => setIsBionicActive(!isBionicActive)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              isBionicActive
                ? 'bg-[#FF8A00] text-white shadow-xs'
                : 'bg-[#FFF7F3] text-[#1E293B] hover:bg-[#FF8A00]/15 border border-[#FF8A00]/20'
            }`}
            title="Bionic Reading bolding first syllables to guide eye saccades"
          >
            <Type className="w-3.5 h-3.5" />
            <span>Bionic</span>
          </button>

          {/* Reading Focus Ruler Toggle */}
          <button
            id="toggle-ruler-btn"
            onClick={() => setIsRulerActive(!isRulerActive)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              isRulerActive
                ? 'bg-[#00C896] text-white shadow-xs'
                : 'bg-[#FFF7F3] text-[#1E293B] hover:bg-[#00C896]/15 border border-[#00C896]/25'
            }`}
            title="Focus Ruler to isolate reading lines and prevent track loss"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Ruler</span>
          </button>

          {/* Irlen Tint Dropdown Toggle */}
          <div className="relative">
            <button
              id="toggle-tint-btn"
              onClick={() => setIsTintMenuOpen(!isTintMenuOpen)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedTint !== 'none'
                  ? 'bg-[#4D84FE] text-white shadow-xs'
                  : 'bg-[#FFF7F3] text-[#1E293B] hover:bg-[#4D84FE]/15 border border-[#4D84FE]/25'
              }`}
              title="Scotopic / Irlen Color Tint Filters for visual stress and glare"
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Tint</span>
            </button>

            {isTintMenuOpen && (
              <div className="absolute right-0 top-full mt-2 z-50 w-52 rounded-2xl bg-white p-3 shadow-xl border border-slate-200 space-y-2 text-xs">
                <div className="font-bold text-[#1E293B] flex items-center justify-between">
                  <span>Irlen Tint Filters</span>
                  <button
                    onClick={() => setIsTintMenuOpen(false)}
                    className="text-slate-400 hover:text-slate-700"
                  >
                    ✕
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['none', 'peach', 'mint', 'butter', 'rose', 'aqua', 'lavender'] as IrlenTint[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => {
                        setSelectedTint(t);
                        setIsTintMenuOpen(false);
                      }}
                      className={`py-1 rounded-lg font-semibold text-[10px] capitalize border transition-all ${
                        selectedTint === t
                          ? 'border-[#4D84FE] bg-[#4D84FE]/10 text-[#4D84FE] font-bold'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                {selectedTint !== 'none' && (
                  <div className="pt-2 border-t flex items-center justify-between text-[11px] text-slate-500">
                    <span>Intensity:</span>
                    <div className="flex gap-1">
                      {[0.15, 0.25, 0.35].map((val) => (
                        <button
                          key={val}
                          onClick={() => setTintIntensity(val)}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                            tintIntensity === val ? 'bg-[#4D84FE] text-white font-bold' : 'bg-slate-100'
                          }`}
                        >
                          {Math.round(val * 100)}%
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Neuro-Glossary Drawer Toggle */}
          <button
            id="open-glossary-btn"
            onClick={() => setIsGlossaryDrawerOpen(!isGlossaryDrawerOpen)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#FFF7F3] border border-[#FF8A00]/20 text-xs font-bold text-[#FF8A00] hover:bg-[#FF8A00]/15 transition-all"
            title="Browse lesson vocabulary glossary"
          >
            <BookMarked className="w-3.5 h-3.5" />
            <span>Clues</span>
          </button>

          {/* Listen Whole Lesson */}
          <button
            id="tts-listen-btn"
            onClick={handleToggleWholeLessonSpeech}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              isSpeaking
                ? 'bg-rose-600 text-white animate-pulse'
                : 'bg-[#4D84FE] text-white hover:bg-[#3b72e5]'
            }`}
          >
            {isSpeaking ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
            <span>{isSpeaking ? 'Stop Audio' : 'Listen'}</span>
          </button>
        </div>
      </div>

      {/* Speed & Audio Status Bar (when speaking) */}
      {isSpeaking && (
        <div className="flex items-center justify-between p-3 rounded-2xl bg-[#00C896]/15 border border-[#00C896]/30 text-xs text-[#1E293B]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00C896] animate-ping" />
            <span className="font-bold text-[#00C896]">Auditory Karaoke Active:</span>
            <span className="italic truncate max-w-sm sm:max-w-md">"{currentSpeakingSentence}"</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] text-slate-500 font-semibold">Speed:</span>
            {[0.75, 0.9, 1.0, 1.25].map((spd) => (
              <button
                key={spd}
                onClick={() => setSpeechSpeed(spd)}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                  speechSpeed === spd ? 'bg-[#00C896] text-white' : 'bg-white text-slate-700'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Vocabulary Quick Drawer (if open) */}
      {isGlossaryDrawerOpen && (
        <div className="p-4 rounded-3xl bg-[#FFF7F3] border-2 border-[#FF8A00]/25 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-sm text-[#1E293B]">
              <BookMarked className="w-4 h-4 text-[#FF8A00]" />
              <span>Neuro-Glossary • Plain English Clues for this Lesson</span>
            </div>
            <button
              onClick={() => setIsGlossaryDrawerOpen(false)}
              className="text-xs text-slate-500 hover:text-slate-900 font-semibold"
            >
              Close Clues
            </button>
          </div>
          <p className="text-xs text-[#1E293B]/70">
            Click any word below to see its <strong>syllable breakdown</strong>, <strong>5th-grade plain English meaning</strong>, and <strong>everyday analogy</strong>!
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {Object.values(NEURO_GLOSSARY).map((entry) => (
              <button
                key={entry.term}
                onClick={() => setActiveGlossaryEntry(entry)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#FF8A00]/25 text-xs font-bold text-[#1E293B] hover:border-[#FF8A00] hover:bg-[#FFF7F3] shadow-2xs transition-all active:scale-95"
              >
                <span>{entry.term}</span>
                <span className="text-[10px] text-[#4D84FE] font-mono">({entry.syllables})</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Media Format Filter Buttons */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveMediaTab('all')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
            activeMediaTab === 'all'
              ? 'bg-[#4D84FE] border-[#4D84FE] text-white shadow-xs'
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <span>All Content</span>
        </button>

        {lesson.videoUrl && (
          <button
            onClick={() => setActiveMediaTab('video')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              activeMediaTab === 'video'
                ? 'bg-[#FF8A00] border-[#FF8A00] text-white shadow-xs'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Video className="h-3.5 w-3.5 text-[#FF8A00]" />
            <span>Video Resource</span>
          </button>
        )}

        {isPdf && (
          <button
            onClick={() => setActiveMediaTab('pdf')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              activeMediaTab === 'pdf'
                ? 'bg-[#00C896] border-[#00C896] text-white shadow-xs'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <FileText className="h-3.5 w-3.5 text-[#00C896]" />
            <span>PDF Document</span>
          </button>
        )}

        {isPpt && (
          <button
            onClick={() => setActiveMediaTab('slides')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              activeMediaTab === 'slides'
                ? 'bg-[#FF8A00] border-[#FF8A00] text-white shadow-xs'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Presentation className="h-3.5 w-3.5 text-[#FF8A00]" />
            <span>Slide Deck ({slides.length} Slides)</span>
          </button>
        )}

        <button
          onClick={() => setActiveMediaTab('reading')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
            activeMediaTab === 'reading'
              ? 'bg-[#4D84FE] border-[#4D84FE] text-white shadow-xs'
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <FileText className="h-3.5 w-3.5 text-[#4D84FE]" />
          <span>Adaptive Text</span>
        </button>
      </div>

      {/* 1. Video Player Section (if present and active) */}
      {lesson.videoUrl && (activeMediaTab === 'all' || activeMediaTab === 'video') && (
        <div className="rounded-2xl bg-slate-900 overflow-hidden border border-slate-800 shadow-md">
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950 text-slate-200 text-xs">
            <div className="flex items-center gap-2">
              <Video className="h-4 w-4 text-[#FF8A00]" />
              <span className="font-semibold">{lesson.videoTitle || 'Educational Video Lesson'}</span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">Sensory-Paced Video</span>
          </div>

          <div className="relative w-full aspect-video bg-black flex items-center justify-center">
            {lesson.videoUrl.includes('youtube') || lesson.videoUrl.includes('youtu.be') ? (
              <iframe
                src={lesson.videoUrl}
                title={lesson.videoTitle || 'Lesson Video'}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                controls
                src={lesson.videoUrl}
                className="w-full h-full object-contain"
              >
                Your browser does not support HTML5 video playback.
              </video>
            )}
          </div>
        </div>
      )}

      {/* 2. Embedded Interactive PDF Viewer (if PDF is present and active) */}
      {isPdf && (activeMediaTab === 'all' || activeMediaTab === 'pdf') && (
        <InteractivePdfViewer
          fileDataUrl={lesson.fileDataUrl || ''}
          fileName={lesson.pptFileName || `${lesson.title}.pdf`}
          fileSize={lesson.fileSize}
          title={lesson.title}
        />
      )}

      {/* 3. Interactive Presentation / PPT Slides Viewer (if present and active) */}
      {isPpt && slides.length > 0 && (activeMediaTab === 'all' || activeMediaTab === 'slides') && currentSlide && (
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
          {/* Deck Top Bar */}
          <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Presentation className="h-4 w-4 text-[#FF8A00]" />
              <span className="text-xs font-bold text-slate-800">
                {lesson.pptFileName || 'Interactive Slide Deck'}
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                (Slide {currentSlideIndex + 1} of {slides.length})
              </span>
            </div>

            <div className="flex items-center gap-2">
              {lesson.fileDataUrl && (
                <a
                  href={lesson.fileDataUrl}
                  download={lesson.pptFileName || `${lesson.title}.pptx`}
                  className="flex items-center gap-1 text-xs text-amber-700 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-lg font-semibold transition-colors"
                >
                  <Download className="h-3 w-3" />
                  <span>Download Deck</span>
                </a>
              )}
              {currentSlide.speakerNotes && (
                <button
                  onClick={() => setShowSpeakerNotes(!showSpeakerNotes)}
                  className="text-xs text-[#4D84FE] hover:underline font-semibold"
                >
                  {showSpeakerNotes ? 'Hide Notes' : 'Teacher Notes'}
                </button>
              )}
            </div>
          </div>

          {/* Active Slide Canvas */}
          <div className="p-8 sm:p-10 min-h-[260px] flex flex-col justify-between bg-gradient-to-br from-slate-50 via-white to-indigo-50/20">
            <div className="space-y-4">
              <span className="text-xs font-bold text-[#4D84FE] uppercase tracking-wider">
                Slide #{currentSlide.slideNumber}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                {isBionicActive ? formatBionicReading(currentSlide.title) : currentSlide.title}
              </h2>

              <ul className="space-y-2.5 pt-2">
                {currentSlide.bullets.map((bullet, bIdx) => (
                  <li key={bIdx} className="flex items-start gap-2.5 text-sm text-slate-700">
                    <span className="h-2 w-2 rounded-full bg-[#4D84FE] mt-1.5 shrink-0" />
                    <span className="leading-relaxed">
                      {isBionicActive ? formatBionicReading(bullet) : bullet}
                    </span>
                  </li>
                ))}
              </ul>

              {currentSlide.visualCue && (
                <div className="mt-4 p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900">
                  <strong className="font-semibold text-amber-950">Visual Cue: </strong>
                  {currentSlide.visualCue}
                </div>
              )}
            </div>

            {showSpeakerNotes && currentSlide.speakerNotes && (
              <div className="mt-6 p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-900">
                <strong>Speaker Notes: </strong>
                {currentSlide.speakerNotes}
              </div>
            )}
          </div>

          {/* Deck Navigation Controls */}
          <div className="flex items-center justify-between px-6 py-3 bg-slate-50 border-t border-slate-200 text-xs">
            <button
              onClick={() => setCurrentSlideIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentSlideIndex === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-semibold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous Slide</span>
            </button>

            <div className="flex items-center gap-1">
              {slides.map((_, dotIdx) => (
                <button
                  key={dotIdx}
                  onClick={() => setCurrentSlideIndex(dotIdx)}
                  className={`h-2 rounded-full transition-all ${
                    dotIdx === currentSlideIndex
                      ? 'w-6 bg-[#4D84FE]'
                      : 'w-2 bg-slate-300 hover:bg-slate-400'
                  }`}
                  aria-label={`Go to slide ${dotIdx + 1}`}
                />
              ))}
            </div>

            <button
              onClick={() => setCurrentSlideIndex((prev) => Math.min(slides.length - 1, prev + 1))}
              disabled={currentSlideIndex === slides.length - 1}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-semibold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition-colors"
            >
              <span>Next Slide</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* "Why did this change?" Expandable Accordion Note */}
      {(activeMediaTab === 'all' || activeMediaTab === 'reading') && (
        <div className="rounded-2xl border border-[#FF8A00]/25 bg-[#FFF7F3] p-4 transition-all">
          <button
            id="why-did-this-change-toggle"
            onClick={() => setIsWhyOpen(!isWhyOpen)}
            className="w-full flex items-center justify-between text-left text-xs font-bold text-[#1E293B]"
          >
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-[#FF8A00]" />
              <span>Cognitive Adaptation Telemetry</span>
            </div>
            {isWhyOpen ? (
              <ChevronUp className="h-4 w-4 text-[#FF8A00]" />
            ) : (
              <ChevronDown className="h-4 w-4 text-[#FF8A00]" />
            )}
          </button>

          {isWhyOpen && (
            <div className="mt-2 text-xs text-[#1E293B]/80 leading-relaxed pl-6 border-t border-[#FF8A00]/15 pt-2 space-y-1">
              <p>
                {student.currentFocusScore < 70
                  ? `Text is enlarged (${fontSize}) with relaxed line spacing (${lineSpacing}x) because your attention is calibrated at ${student.currentFocusScore}/100. This relieves visual crowding and dyslexia strain.`
                  : `Attention is calibrated at ${student.currentFocusScore}/100. High cognitive bandwidth layout is enabled with ${fontSize} typography.`}
              </p>
              <p className="text-[11px] text-[#FF8A00] font-mono">
                ANFIS Fuzzy Controller Rule: {anfisRecommendation.ruleTriggered}
              </p>
            </div>
          )}
        </div>
      )}

      {/* 3. Main Adaptive Reading Sections */}
      {(activeMediaTab === 'all' || activeMediaTab === 'reading') && lesson.sections.length > 0 && (
        <div
          id="adaptive-lesson-content-box"
          className={`rounded-3xl p-6 sm:p-8 border shadow-xs transition-all duration-300 ${
            themeClasses[theme]
          } ${fontSizeClasses[fontSize]} ${lineSpacingClasses[lineSpacing]}`}
        >
          <div className="space-y-8 max-w-prose">
            {lesson.sections.map((sec, idx) => {
              const isThisSectionSpeaking = currentSpeakingSectionIdx === idx;

              return (
                <section
                  key={idx}
                  className={`space-y-3 p-4 rounded-2xl transition-all duration-200 ${
                    isThisSectionSpeaking
                      ? 'bg-[#00C896]/10 ring-2 ring-[#00C896]/40'
                      : 'hover:bg-black/[0.02]'
                  }`}
                >
                  <div className="flex items-center justify-between border-b pb-2">
                    <h3 className="text-xl font-extrabold tracking-tight">
                      {isBionicActive ? formatBionicReading(sec.heading) : sec.heading}
                    </h3>

                    {/* Section TTS Play Button */}
                    <button
                      onClick={() => speakSection(idx, `${sec.heading}. ${sec.text}`)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
                        isThisSectionSpeaking
                          ? 'bg-[#00C896] text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-[#1E293B]'
                      }`}
                      title="Read this section aloud with sentence tracking"
                    >
                      {isThisSectionSpeaking ? (
                        <>
                          <Pause className="w-3 h-3" />
                          <span>Pause</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 text-[#4D84FE]" />
                          <span>Read</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Body Paragraph with clickable glossary & bionic rendering */}
                  <div className="opacity-95 leading-relaxed">
                    {renderInteractiveText(sec.text)}
                  </div>

                  {sec.keyPoints && sec.keyPoints.length > 0 && (
                    <div
                      className={`p-3.5 rounded-2xl text-xs space-y-1.5 ${
                        theme === 'dark'
                          ? 'bg-slate-800/80 border border-slate-700'
                          : theme === 'cream'
                          ? 'bg-white border border-[#FF8A00]/20'
                          : 'bg-[#FFF7F3] border border-[#FF8A00]/15'
                      }`}
                    >
                      <strong className="block font-bold text-[#FF8A00]">
                        Key Takeaways:
                      </strong>
                      <ul className="list-disc pl-4 space-y-1 text-[#1E293B]/85">
                        {sec.keyPoints.map((kp, kIdx) => (
                          <li key={kIdx}>
                            {isBionicActive ? formatBionicReading(kp) : kp}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </section>
              );
            })}
          </div>

          {/* Lesson Bottom Action / Take Adaptive Quiz */}
          <div className="mt-8 pt-6 border-t border-[#FF8A00]/15 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-[#1E293B]/70">
              <CheckCircle2 className="h-4 w-4 text-[#00C896]" />
              <span>Ready to test your knowledge with adaptive difficulty?</span>
            </div>

            <button
              id="proceed-to-quiz-btn"
              onClick={() => {
                if (onCompleteLesson && lesson?.id) {
                  onCompleteLesson(lesson.id);
                }
                onNavigateToQuiz();
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-[#00C896] hover:bg-[#00b587] px-6 py-3 text-sm font-bold text-white shadow-md shadow-[#00C896]/20 transition-all hover:translate-x-0.5 active:scale-98"
            >
              <span>Take Adaptive Quiz</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
