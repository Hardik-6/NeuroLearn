import React, { useState, useEffect, useRef } from 'react';
import {
  Presentation,
  Download,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Printer,
  Sparkles,
  Cpu,
  Brain,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Dna,
  Mic,
  BarChart3,
  ArrowRight,
  Clock,
  Target,
  Share2,
  Check,
  BookOpen
} from 'lucide-react';
import { PRESENTATION_9_SLIDES, PresentationSlide } from '../data/presentationSlides';
import { exportToPowerPoint } from '../utils/generatePptx';

interface PresentationViewProps {
  onNavigateBack?: () => void;
  initialSlideIndex?: number;
}

export const PresentationView: React.FC<PresentationViewProps> = ({
  onNavigateBack,
  initialSlideIndex = 0
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(initialSlideIndex);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [autoPlayInterval, setAutoPlayInterval] = useState(10); // seconds

  const presentationRef = useRef<HTMLDivElement>(null);
  const autoPlayTimerRef = useRef<any>(null);

  const currentSlide: PresentationSlide = PRESENTATION_9_SLIDES[currentSlideIndex] || PRESENTATION_9_SLIDES[0];

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        handleNextSlide();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        handlePrevSlide();
      } else if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlideIndex, isFullscreen]);

  // Slideshow timer
  useEffect(() => {
    if (isPlaying) {
      autoPlayTimerRef.current = setTimeout(() => {
        setCurrentSlideIndex((prev) => (prev + 1) % PRESENTATION_9_SLIDES.length);
      }, autoPlayInterval * 1000);
    } else if (autoPlayTimerRef.current) {
      clearTimeout(autoPlayTimerRef.current);
    }
    return () => {
      if (autoPlayTimerRef.current) clearTimeout(autoPlayTimerRef.current);
    };
  }, [isPlaying, currentSlideIndex, autoPlayInterval]);

  // Handle Speech synthesis narration
  const handleToggleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported on this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const textToSpeak = `${currentSlide.title}. ${currentSlide.subtitle}. ${currentSlide.narrationScript}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      setIsSpeaking(false);
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Stop speech when slide changes
  useEffect(() => {
    if (isSpeaking && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [currentSlideIndex]);

  const handleNextSlide = () => {
    if (currentSlideIndex < PRESENTATION_9_SLIDES.length - 1) {
      setCurrentSlideIndex((prev) => prev + 1);
    } else {
      setCurrentSlideIndex(0); // loop around
    }
  };

  const handlePrevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex((prev) => prev - 1);
    } else {
      setCurrentSlideIndex(PRESENTATION_9_SLIDES.length - 1);
    }
  };

  const handleDownloadPPTX = async () => {
    try {
      setIsExporting(true);
      await exportToPowerPoint(PRESENTATION_9_SLIDES);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to export PPTX:', err);
      alert('Could not export PowerPoint file. Please check console for details.');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (presentationRef.current?.requestFullscreen) {
        presentationRef.current.requestFullscreen().catch(() => {});
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={presentationRef}
      className={`flex flex-col min-h-full ${
        isFullscreen
          ? 'fixed inset-0 z-50 bg-slate-950 p-4 sm:p-6 overflow-y-auto'
          : 'space-y-5 max-w-7xl mx-auto'
      }`}
    >
      {/* Top Header & Presentation Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Left: Presentation Branding & Status */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center text-white shadow-xs">
            <Presentation className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                NeuroLearn 9-Slide Presentation Deck
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                Slide {currentSlide.slideNumber} of 9
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Soft Computing (Fuzzy, ANFIS, GA) & Assistive Neuro-Adaptive EdTech
            </p>
          </div>
        </div>

        {/* Right: Actions (Download PPTX, Print, Fullscreen, Speech, Auto-Play) */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Download PPTX */}
          <button
            id="download-pptx-btn"
            onClick={handleDownloadPPTX}
            disabled={isExporting}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs transition-all ${
              exportSuccess
                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-98'
            } disabled:opacity-50`}
            title="Download authentic Microsoft PowerPoint (.pptx) file containing all 9 slides"
          >
            {exportSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>Downloaded .PPTX</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>{isExporting ? 'Generating PPTX...' : 'Download .PPTX'}</span>
              </>
            )}
          </button>

          {/* Print / Save as PDF */}
          <button
            id="print-presentation-btn"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            title="Print or save as PDF slides"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Print / PDF</span>
          </button>

          {/* Audio Narration */}
          <button
            id="speech-narration-btn"
            onClick={handleToggleSpeech}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
              isSpeaking
                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
            title="Read slide presentation aloud via Speech Synthesis"
          >
            {isSpeaking ? <VolumeX className="w-4 h-4 animate-pulse" /> : <Volume2 className="w-4 h-4" />}
            <span className="hidden sm:inline">{isSpeaking ? 'Stop Narration' : 'Narrate'}</span>
          </button>

          {/* Auto-Play Slideshow */}
          <button
            id="autoplay-slideshow-btn"
            onClick={() => setIsPlaying(!isPlaying)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
              isPlaying
                ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
            title="Automatic slideshow presentation mode"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span className="hidden sm:inline">{isPlaying ? 'Pause' : 'Auto-Play'}</span>
          </button>

          {/* Speaker Notes Toggle */}
          <button
            id="toggle-notes-btn"
            onClick={() => setShowNotes(!showNotes)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
              showNotes
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
            title="Toggle speaker defense notes & viva talking points"
          >
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Notes</span>
          </button>

          {/* Fullscreen Mode */}
          <button
            id="fullscreen-presentation-btn"
            onClick={toggleFullscreen}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            title="Toggle full-screen presentation mode"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Presentation Stage & Navigation Strip */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 items-start">
        {/* Left Thumbnails / Slide Directory (Desktop: 3 cols, Mobile: full) */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 shadow-xs space-y-2 order-2 lg:order-1">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Slide Deck (9 Slides)
            </span>
            <span className="text-[11px] font-semibold text-indigo-600">
              {currentSlideIndex + 1} / 9
            </span>
          </div>

          <div className="space-y-1.5 max-h-[580px] overflow-y-auto pr-1">
            {PRESENTATION_9_SLIDES.map((slide, idx) => {
              const isActive = idx === currentSlideIndex;
              return (
                <button
                  key={slide.id}
                  id={`slide-thumb-${slide.id}`}
                  onClick={() => setCurrentSlideIndex(idx)}
                  className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-start gap-2.5 ${
                    isActive
                      ? 'bg-indigo-600 text-white font-medium shadow-xs ring-2 ring-indigo-300'
                      : 'hover:bg-slate-50 text-slate-700 border border-transparent hover:border-slate-200'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 ${
                      isActive ? 'bg-indigo-800 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {slide.slideNumber}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={`font-semibold truncate ${isActive ? 'text-white' : 'text-slate-800'}`}>
                      {slide.title}
                    </p>
                    <p
                      className={`text-[10px] truncate ${
                        isActive ? 'text-indigo-200' : 'text-slate-400'
                      }`}
                    >
                      {slide.category}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Use Left/Right arrows</span>
            <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">← / →</span>
          </div>
        </div>

        {/* Right: Active Presentation Canvas (16:9 Aspect Ratio) */}
        <div className="lg:col-span-9 space-y-4 order-1 lg:order-2">
          {/* Active Slide Card */}
          <div
            id="active-presentation-slide"
            className={`rounded-2xl border transition-all relative overflow-hidden shadow-md ${
              currentSlide.id === 1
                ? 'bg-slate-900 border-slate-800 text-white'
                : 'bg-white border-slate-200 text-slate-900'
            }`}
            style={{ minHeight: '560px' }}
          >
            {/* Top Slide Metadata Bar */}
            <div
              className={`px-6 sm:px-8 py-4 border-b flex items-center justify-between ${
                currentSlide.id === 1
                  ? 'border-slate-800/80 bg-slate-950/40 text-slate-400'
                  : 'border-slate-100 bg-slate-50/50 text-slate-500'
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase">
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                    currentSlide.id === 1
                      ? 'bg-indigo-900/60 text-indigo-300 border border-indigo-700/50'
                      : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                  }`}
                >
                  SLIDE {currentSlide.slideNumber} / 9
                </span>
                <span>{currentSlide.category}</span>
              </div>
              <div className="text-xs font-medium opacity-75">
                NeuroLearn · Capstone Defense Deck
              </div>
            </div>

            {/* Slide Body Content */}
            <div className="p-6 sm:p-10 space-y-6">
              {/* Slide Title & Subtitle */}
              <div>
                <h1
                  className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
                    currentSlide.id === 1 ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {currentSlide.title}
                </h1>
                <p
                  className={`text-sm sm:text-base mt-1.5 font-normal ${
                    currentSlide.id === 1 ? 'text-slate-300' : 'text-slate-600'
                  }`}
                >
                  {currentSlide.subtitle}
                </p>
              </div>

              {/* Render Custom Visual Diagram per Slide */}
              {renderSlideDiagram(currentSlide)}

              {/* Key Points Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentSlide.keyPoints.map((kp, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border transition-all ${
                      currentSlide.id === 1
                        ? 'bg-slate-800/60 border-slate-700/60 text-slate-200 hover:border-slate-600'
                        : 'bg-slate-50/80 border-slate-200/80 text-slate-700 hover:border-indigo-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <h3
                        className={`text-sm font-bold ${
                          currentSlide.id === 1 ? 'text-white' : 'text-slate-900'
                        }`}
                      >
                        {kp.heading}
                      </h3>
                      {kp.badge && (
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                            currentSlide.id === 1
                              ? 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                              : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          }`}
                        >
                          {kp.badge}
                        </span>
                      )}
                    </div>
                    <p
                      className={`text-xs leading-relaxed ${
                        currentSlide.id === 1 ? 'text-slate-300' : 'text-slate-600'
                      }`}
                    >
                      {kp.description}
                    </p>
                    {kp.highlight && (
                      <p
                        className={`text-[11px] font-medium mt-2 pt-2 border-t ${
                          currentSlide.id === 1
                            ? 'border-slate-700/80 text-emerald-400'
                            : 'border-slate-200 text-indigo-700'
                        }`}
                      >
                        ✓ {kp.highlight}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Metrics Summary Strip (if metrics exist) */}
              {currentSlide.metrics && currentSlide.metrics.length > 0 && (
                <div
                  className={`p-4 rounded-xl border grid grid-cols-2 sm:grid-cols-4 gap-3 text-center ${
                    currentSlide.id === 1
                      ? 'bg-slate-800/40 border-slate-700/60'
                      : 'bg-indigo-50/50 border-indigo-100'
                  }`}
                >
                  {currentSlide.metrics.map((m, idx) => (
                    <div key={idx} className="space-y-0.5">
                      <div
                        className={`text-xl sm:text-2xl font-black ${
                          currentSlide.id === 1 ? 'text-indigo-400' : 'text-indigo-600'
                        }`}
                      >
                        {m.value}
                      </div>
                      <div
                        className={`text-xs font-bold ${
                          currentSlide.id === 1 ? 'text-white' : 'text-slate-800'
                        }`}
                      >
                        {m.label}
                      </div>
                      {m.subtext && (
                        <div
                          className={`text-[10px] ${
                            currentSlide.id === 1 ? 'text-slate-400' : 'text-slate-500'
                          }`}
                        >
                          {m.subtext}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Slide Navigation Bar */}
            <div
              className={`px-6 sm:px-8 py-3.5 border-t flex items-center justify-between ${
                currentSlide.id === 1
                  ? 'border-slate-800 bg-slate-950/40 text-slate-400'
                  : 'border-slate-100 bg-slate-50/80 text-slate-600'
              }`}
            >
              <button
                id="prev-slide-btn"
                onClick={handlePrevSlide}
                className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous Slide</span>
              </button>

              <div className="flex items-center gap-1.5">
                {PRESENTATION_9_SLIDES.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlideIndex(idx)}
                    className={`h-2 rounded-full transition-all ${
                      idx === currentSlideIndex
                        ? 'w-6 bg-indigo-600'
                        : 'w-2 bg-slate-300 hover:bg-slate-400'
                    }`}
                    title={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>

              <button
                id="next-slide-btn"
                onClick={handleNextSlide}
                className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                <span>Next Slide</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Speaker Notes Drawer (if toggled) */}
          {showNotes && (
            <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-5 shadow-xs text-amber-950 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-700" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                    Presenter Defense Notes & Viva Guidance (Slide {currentSlide.slideNumber})
                  </h4>
                </div>
                <button
                  onClick={() => setShowNotes(false)}
                  className="text-xs text-amber-700 hover:text-amber-900 font-semibold"
                >
                  Hide Notes
                </button>
              </div>
              <p className="text-xs leading-relaxed whitespace-pre-line text-amber-900">
                {currentSlide.speakerNotes}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------
// Custom Visual Diagrams for Each of the 9 Slides
// ----------------------------------------------------
function renderSlideDiagram(slide: PresentationSlide) {
  switch (slide.diagramType) {
    case 'hero-title':
      return (
        <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 flex flex-wrap items-center justify-around gap-4 text-center">
          <div className="space-y-1">
            <span className="text-xs text-indigo-400 font-mono font-bold">ALGORITHM 01</span>
            <div className="text-sm font-bold text-white flex items-center justify-center gap-1.5">
              <Cpu className="w-4 h-4 text-indigo-400" /> Fuzzy Controller
            </div>
            <p className="text-[11px] text-slate-400">Cognitive fatigue & break timing</p>
          </div>
          <div className="h-8 w-px bg-slate-700 hidden sm:block" />
          <div className="space-y-1">
            <span className="text-xs text-sky-400 font-mono font-bold">ALGORITHM 02</span>
            <div className="text-sm font-bold text-white flex items-center justify-center gap-1.5">
              <Brain className="w-4 h-4 text-sky-400" /> 5-Layer ANFIS
            </div>
            <p className="text-[11px] text-slate-400">Neural visual & typography scaffolding</p>
          </div>
          <div className="h-8 w-px bg-slate-700 hidden sm:block" />
          <div className="space-y-1">
            <span className="text-xs text-emerald-400 font-mono font-bold">ALGORITHM 03</span>
            <div className="text-sm font-bold text-white flex items-center justify-center gap-1.5">
              <Dna className="w-4 h-4 text-emerald-400" /> Genetic Algorithm
            </div>
            <p className="text-[11px] text-slate-400">Knapsack attention-bounded pathways</p>
          </div>
        </div>
      );

    case 'problem-grid':
      return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200">
            <div className="text-xs font-bold text-red-800 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-red-600" /> ADHD Barrier
            </div>
            <div className="text-xs text-red-900 mt-1">
              Monolithic 45-min lessons cause dopamine crash and involuntary attention drift.
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200">
            <div className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Dyslexia Barrier
            </div>
            <div className="text-xs text-amber-900 mt-1">
              Crowded serif fonts cause letter reversals and double the reading cognitive load.
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200">
            <div className="text-xs font-bold text-purple-800 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-purple-600" /> Autism / Sensory
            </div>
            <div className="text-xs text-purple-900 mt-1">
              High screen glare and strict countdown timers induce emotional overstimulation.
            </div>
          </div>
        </div>
      );

    case 'system-architecture':
      return (
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs text-center flex-1 w-full">
            <div className="font-bold text-slate-800">1. Learner Telemetry</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Latency, Jitter, Accuracy</div>
          </div>
          <ArrowRight className="w-4 h-4 text-indigo-500 shrink-0 rotate-90 md:rotate-0" />
          <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-200 text-center flex-1 w-full">
            <div className="font-bold text-indigo-900">2. Soft Computing Engine</div>
            <div className="text-[10px] text-indigo-700 mt-0.5">Fuzzy + ANFIS + GA</div>
          </div>
          <ArrowRight className="w-4 h-4 text-indigo-500 shrink-0 rotate-90 md:rotate-0" />
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs text-center flex-1 w-full">
            <div className="font-bold text-slate-800">3. Dynamic UI Mutation</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Dyslexic Font, Breaks, Audio</div>
          </div>
          <ArrowRight className="w-4 h-4 text-indigo-500 shrink-0 rotate-90 md:rotate-0" />
          <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-center flex-1 w-full">
            <div className="font-bold text-emerald-900">4. Educator Portal</div>
            <div className="text-[10px] text-emerald-700 mt-0.5">Explainability & Analytics</div>
          </div>
        </div>
      );

    case 'fuzzy-logic':
      return (
        <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="space-y-1 flex-1">
            <span className="font-bold text-indigo-950 block">Mamdani Centroid Defuzzification Formula:</span>
            <div className="font-mono text-xs bg-white p-2 rounded-lg border border-indigo-200 text-indigo-900">
              Focus* = ∫ [ μ(z) · z ] dz / ∫ μ(z) dz
            </div>
            <span className="text-[11px] text-slate-500">
              Triangular & Trapezoidal Membership Functions for Fatigue, Latency, and Error rate.
            </span>
          </div>
          <div className="p-3 bg-white rounded-xl border border-indigo-200 text-[11px] space-y-1 shrink-0 w-full sm:w-auto">
            <div className="font-bold text-slate-800">Key Fuzzy Rules:</div>
            <div className="text-slate-600">• IF Fatigue=High ∧ Delay=Stalled → Overloaded</div>
            <div className="text-slate-600">• IF Accuracy=High ∧ Delay=Fast → Optimal</div>
            <div className="text-slate-600">• IF Focus &lt; 40% → Trigger Calm Break</div>
          </div>
        </div>
      );

    case 'anfis-network':
      return (
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
          <div className="text-xs font-bold text-slate-700 mb-2">
            5-Layer Feedforward Neuro-Fuzzy Architecture:
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
            <div className="p-2 rounded-lg bg-white border border-slate-200">
              <div className="font-bold text-indigo-600">Layer 1</div>
              <div className="text-[10px] text-slate-500">Fuzzification (Bell-shaped nodes)</div>
            </div>
            <div className="p-2 rounded-lg bg-white border border-slate-200">
              <div className="font-bold text-indigo-600">Layer 2</div>
              <div className="text-[10px] text-slate-500">Rule Firing w_i = μ_A × μ_B</div>
            </div>
            <div className="p-2 rounded-lg bg-white border border-slate-200">
              <div className="font-bold text-indigo-600">Layer 3</div>
              <div className="text-[10px] text-slate-500">Normalized Weights w̄_i</div>
            </div>
            <div className="p-2 rounded-lg bg-white border border-slate-200">
              <div className="font-bold text-indigo-600">Layer 4</div>
              <div className="text-[10px] text-slate-500">Takagi-Sugeno Consequents</div>
            </div>
            <div className="p-2 rounded-lg bg-indigo-600 text-white font-bold col-span-2 sm:col-span-1">
              <div>Layer 5</div>
              <div className="text-[10px] text-indigo-200">UI Font & Spacing Output</div>
            </div>
          </div>
        </div>
      );

    case 'genetic-algorithm':
      return (
        <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="space-y-1">
            <div className="font-bold text-emerald-950">Multi-Objective 0/1 Knapsack Formulation:</div>
            <div className="font-mono text-xs bg-white p-2 rounded-lg border border-emerald-300 text-emerald-900">
              Maximize Σ(Engagement_i) s.t. Σ(Duration_i) ≤ Student_Attention_Span (T_max)
            </div>
          </div>
          <div className="p-2.5 bg-white rounded-xl border border-emerald-200 text-[11px] space-y-0.5 shrink-0">
            <div className="font-bold text-emerald-900">Evolution Parameters:</div>
            <div>• Population: 40 chromosomes</div>
            <div>• Crossover Pc: 0.85 (Two-point)</div>
            <div>• Mutation Pm: 0.05 (Bit-flip)</div>
          </div>
        </div>
      );

    case 'accessibility-suite':
      return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
          <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <Mic className="w-4 h-4 mx-auto text-indigo-600 mb-1" />
            <div className="font-bold text-slate-800">Voice Quiz</div>
            <div className="text-[10px] text-slate-500">Speech recognition auto-advance</div>
          </div>
          <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <Volume2 className="w-4 h-4 mx-auto text-indigo-600 mb-1" />
            <div className="font-bold text-slate-800">TTS Audio</div>
            <div className="text-[10px] text-slate-500">Dyslexic-friendly speech pacing</div>
          </div>
          <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <BookOpen className="w-4 h-4 mx-auto text-indigo-600 mb-1" />
            <div className="font-bold text-slate-800">OpenDyslexic</div>
            <div className="text-[10px] text-slate-500">Weighted bottom glyphs</div>
          </div>
          <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
            <Clock className="w-4 h-4 mx-auto text-indigo-600 mb-1" />
            <div className="font-bold text-slate-800">Sensory Room</div>
            <div className="text-[10px] text-slate-500">4-7-8 breathing resets</div>
          </div>
        </div>
      );

    case 'experimental-results':
      return (
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="text-xs font-bold text-slate-700">Comparative Trial (Adaptive vs Control):</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <div className="bg-white p-2.5 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500">Sustained Attention</span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-slate-400">Control: 18.5m</span>
                <span className="font-bold text-emerald-600">Adaptive: 24.8m (+34%)</span>
              </div>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500">Quiz Response Time</span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-slate-400">Control: 22.4s</span>
                <span className="font-bold text-indigo-600">Adaptive: 13.0s (-42%)</span>
              </div>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500">Post-Test Accuracy</span>
              <div className="flex items-center justify-between mt-1">
                <span className="text-slate-400">Control: 63.2%</span>
                <span className="font-bold text-emerald-600">Adaptive: 81.2% (+28%)</span>
              </div>
            </div>
          </div>
        </div>
      );

    case 'future-roadmap':
      return (
        <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-[10px]">
              1
            </div>
            <div>
              <div className="font-bold text-indigo-950">EEG Biosensors</div>
              <div className="text-[10px] text-indigo-700">Real-time theta/alpha bands</div>
            </div>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-indigo-400 hidden sm:block" />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-[10px]">
              2
            </div>
            <div>
              <div className="font-bold text-indigo-950">Gemini LLM</div>
              <div className="text-[10px] text-indigo-700">Multimodal analogy generator</div>
            </div>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-indigo-400 hidden sm:block" />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-[10px]">
              3
            </div>
            <div>
              <div className="font-bold text-indigo-950">Global LTI 1.3</div>
              <div className="text-[10px] text-indigo-700">Canvas & Google Classroom</div>
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
}
