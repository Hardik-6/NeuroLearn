import React, { useState, useEffect, useRef } from 'react';
import {
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  Award,
  AlertCircle,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  VolumeX as MuteIcon
} from 'lucide-react';
import { StudentProfile, QuizQuestion } from '../types';
import { MOCK_QUIZ_QUESTIONS, SOLAR_SYSTEM_LESSON } from '../mockData';
import { estimateFocusScore } from '../algorithms/softComputing';
import { updateBayesianKnowledge, evaluateItemResponseTheory } from '../algorithms/aiMlEngine';
import { speakText, stopSpeaking } from '../utils/speech';
import { playGentleSuccessChime, playGentleAttemptTone } from '../utils/audioChimes';

interface AdaptiveQuizProps {
  student: StudentProfile;
  questions?: QuizQuestion[];
  lessonId?: string;
  onUpdateFocusScore: (newScore: number) => void;
  onCompleteQuiz: (
    finalScorePercent: number,
    correctCount?: number,
    totalQuestions?: number,
    difficulty?: 'easy' | 'medium' | 'hard'
  ) => void;
  onNavigateBack: () => void;
}

/**
 * Intelligent helper to detect which option was spoken (by letter, number, or option wording)
 */
function detectOptionFromSpeech(clean: string, options: string[]): number | null {
  if (!clean || !options || options.length === 0) return null;
  const tokens = clean.split(/\s+/).filter(Boolean);

  // A: "a", "ay", "hey", "alpha", "option a", "choice a", "answer a", "one", "first"
  const hasA =
    tokens.includes('a') ||
    tokens.includes('ay') ||
    tokens.includes('hey') ||
    tokens.includes('alpha') ||
    tokens.includes('first') ||
    tokens.includes('one') ||
    tokens.includes('1') ||
    clean.includes('option a') ||
    clean.includes('choice a') ||
    clean.includes('answer a') ||
    clean.includes('letter a') ||
    clean.includes('option 1') ||
    clean.includes('choice 1');

  // B: "b", "bee", "be", "bravo", "option b", "choice b", "answer b", "two", "second"
  const hasB =
    tokens.includes('b') ||
    tokens.includes('bee') ||
    tokens.includes('be') ||
    tokens.includes('bravo') ||
    tokens.includes('second') ||
    tokens.includes('two') ||
    tokens.includes('2') ||
    clean.includes('option b') ||
    clean.includes('choice b') ||
    clean.includes('answer b') ||
    clean.includes('letter b') ||
    clean.includes('option 2') ||
    clean.includes('choice 2');

  // C: "c", "see", "sea", "si", "charlie", "option c", "choice c", "answer c", "three", "third"
  const hasC =
    tokens.includes('c') ||
    tokens.includes('see') ||
    tokens.includes('sea') ||
    tokens.includes('si') ||
    tokens.includes('charlie') ||
    tokens.includes('third') ||
    tokens.includes('three') ||
    tokens.includes('3') ||
    clean.includes('option c') ||
    clean.includes('choice c') ||
    clean.includes('answer c') ||
    clean.includes('letter c') ||
    clean.includes('option 3') ||
    clean.includes('choice 3');

  // D: "d", "dee", "delta", "the", "option d", "choice d", "answer d", "four", "fourth"
  const hasD =
    tokens.includes('d') ||
    tokens.includes('dee') ||
    tokens.includes('delta') ||
    tokens.includes('fourth') ||
    tokens.includes('four') ||
    tokens.includes('4') ||
    clean.includes('option d') ||
    clean.includes('choice d') ||
    clean.includes('answer d') ||
    clean.includes('letter d') ||
    clean.includes('option 4') ||
    clean.includes('choice 4');

  const letterMatches = [hasA, hasB, hasC, hasD];
  const matchedLetterIndices = letterMatches
    .map((matched, idx) => (matched ? idx : -1))
    .filter((idx) => idx !== -1);

  if (matchedLetterIndices.length === 1) {
    return matchedLetterIndices[0];
  }

  // Next: Match words in options
  const stopWords = new Set(['the', 'is', 'a', 'an', 'in', 'on', 'of', 'to', 'for', 'by', 'it', 'its', 'and', 'or', 'that', 'this', 'are', 'was', 'with']);

  let bestIndex = -1;
  let highestScore = 0;

  options.forEach((optText, idx) => {
    if (!optText) return;
    const cleanOpt = optText.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').trim();
    if (!cleanOpt) return;

    // Exact full match
    if (clean === cleanOpt) {
      bestIndex = idx;
      highestScore = 200;
      return;
    }

    // Substring match
    if (clean.includes(cleanOpt)) {
      const score = 100 + Math.min(cleanOpt.length, 30);
      if (score > highestScore) {
        highestScore = score;
        bestIndex = idx;
      }
      return;
    }

    if (cleanOpt.includes(clean) && clean.length >= 3) {
      const score = 80 + Math.min(clean.length, 20);
      if (score > highestScore) {
        highestScore = score;
        bestIndex = idx;
      }
      return;
    }

    // Keyword matching
    const optWords = cleanOpt.split(/\s+/).filter((w) => w.length >= 3 && !stopWords.has(w));
    const spokenWords = tokens.filter((w) => w.length >= 3 && !stopWords.has(w));

    let matches = 0;
    for (const w of spokenWords) {
      if (optWords.includes(w)) {
        matches++;
      } else if (w.length >= 4 && optWords.some((ow) => ow.startsWith(w) || w.startsWith(ow))) {
        matches += 0.8;
      }
    }

    if (matches > 0) {
      const score = matches * 30;
      if (score > highestScore) {
        highestScore = score;
        bestIndex = idx;
      }
    }
  });

  if (bestIndex !== -1 && highestScore >= 24) {
    return bestIndex;
  }

  if (matchedLetterIndices.length > 0) {
    return matchedLetterIndices[0];
  }

  return null;
}

export const AdaptiveQuiz: React.FC<AdaptiveQuizProps> = ({
  student,
  questions,
  lessonId,
  onUpdateFocusScore,
  onCompleteQuiz,
  onNavigateBack
}) => {
  const allPool = questions && questions.length > 0 ? questions : MOCK_QUIZ_QUESTIONS;
  const lessonSpecific = lessonId ? allPool.filter((q) => q.lessonId === lessonId) : [];
  const activeQuestions: QuizQuestion[] = lessonSpecific.length > 0 ? lessonSpecific : allPool;

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(180);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [isQuizFinished, setIsQuizFinished] = useState(false);
  const [currentQuestionStartTime, setCurrentQuestionStartTime] = useState(Date.now());
  const [bktMastery, setBktMastery] = useState<number>(
    student.recentAccuracy ? student.recentAccuracy / 100 : 0.6
  );

  // Sensory Audio State
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Voice Command & Audio States
  const [isListening, setIsListening] = useState(false);
  const [voiceFeedback, setVoiceFeedback] = useState<string>('');
  const [speechSupported, setSpeechSupported] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [micPermissionDenied, setMicPermissionDenied] = useState(false);
  const recognitionRef = useRef<any>(null);
  const shouldListenRef = useRef(false);
  const isVoiceRunningRef = useRef(false);
  const micPermissionDeniedRef = useRef(false);
  const selectedOptionRef = useRef<number | null>(null);
  const currentQRef = useRef<QuizQuestion | null>(null);
  const handleNextRef = useRef<() => void>(() => {});
  const autoSubmitTimerRef = useRef<any>(null);

  // Keep refs in sync with current state
  selectedOptionRef.current = selectedOption;

  // Derive dynamic difficulty based on student's current focus score
  const dynamicDifficulty: 'easy' | 'medium' | 'hard' =
    student.currentFocusScore >= 80 ? 'hard' : student.currentFocusScore >= 50 ? 'medium' : 'easy';

  // IRT (Item Response Theory) evaluation
  const irtEvaluation = evaluateItemResponseTheory(
    correctAnswersCount > 0
      ? Math.round((correctAnswersCount / (currentQuestionIndex + 1)) * 100)
      : student.recentAccuracy,
    dynamicDifficulty
  );

  const currentQ: QuizQuestion = activeQuestions[currentQuestionIndex] || activeQuestions[0];
  currentQRef.current = currentQ;

  // Sync handleNext in ref so speech handlers always call the freshest callback
  const handleNextVoice = () => {
    if (selectedOptionRef.current === null) {
      setVoiceFeedback('Please select an option first before submitting (say Option A, B, C, or D).');
      return;
    }
    handleNextRef.current();
  };

  // Voice Command Handler Setup
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      isVoiceRunningRef.current = true;
      setIsListening(true);
      setVoiceFeedback('Listening for commands (say "Option A", "B", "C", "D", or "Submit")...');
      setMicPermissionDenied(false);
      micPermissionDeniedRef.current = false;
    };

    recognition.onerror = (event: any) => {
      // 'no-speech' and 'aborted' are normal silence timeouts or stop events, not fatal errors
      if (event.error === 'no-speech' || event.error === 'aborted') {
        return;
      }

      console.warn('Speech recognition error:', event.error);
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setVoiceFeedback('Microphone permission blocked. Please allow mic access.');
        setMicPermissionDenied(true);
        micPermissionDeniedRef.current = true;
      }
      shouldListenRef.current = false;
      isVoiceRunningRef.current = false;
      setIsListening(false);
    };

    recognition.onend = () => {
      isVoiceRunningRef.current = false;
      // Auto-restart if user still wants voice listening active and permission was not denied
      if (shouldListenRef.current && !micPermissionDeniedRef.current) {
        try {
          recognition.start();
          isVoiceRunningRef.current = true;
          setIsListening(true);
        } catch {
          // If already running or starting, keep current active state
          if (shouldListenRef.current) {
            setIsListening(true);
          } else {
            setIsListening(false);
          }
        }
      } else {
        setIsListening(false);
      }
    };

    recognition.onresult = (event: any) => {
      const lastIndex = event.results.length - 1;
      const rawTranscript = event.results[lastIndex][0]?.transcript || '';
      const transcript = rawTranscript.trim();
      const cleanTranscript = transcript.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').trim();
      const confidence = event.results[lastIndex][0]?.confidence;
      console.log(`[Voice Quiz] Heard: "${transcript}" (clean: "${cleanTranscript}", conf: ${confidence})`);
      setVoiceFeedback(`Heard: "${transcript}"`);

      const q = currentQRef.current || currentQ;
      if (!q) return;

      // 1. Direct Submit / Advance command check
      const isSubmitCommand =
        cleanTranscript === 'submit' ||
        cleanTranscript === 'next' ||
        cleanTranscript === 'continue' ||
        cleanTranscript === 'finish' ||
        cleanTranscript === 'confirm' ||
        cleanTranscript === 'enter' ||
        cleanTranscript === 'go' ||
        cleanTranscript === 'done' ||
        cleanTranscript === 'next question' ||
        cleanTranscript === 'submit answer' ||
        cleanTranscript === 'submit it';

      if (isSubmitCommand) {
        if (autoSubmitTimerRef.current) {
          clearTimeout(autoSubmitTimerRef.current);
          autoSubmitTimerRef.current = null;
        }
        const currentOpt = selectedOptionRef.current !== null ? selectedOptionRef.current : selectedOption;
        if (currentOpt !== null) {
          setVoiceFeedback('Submitting answer and advancing...');
          handleNextRef.current();
        } else {
          setVoiceFeedback('Please speak an answer (Option A, B, C, or D) before submitting.');
        }
        return;
      }

      // 2. Read aloud command check
      if (
        cleanTranscript.includes('read question') ||
        cleanTranscript.includes('read aloud') ||
        cleanTranscript === 'read' ||
        cleanTranscript === 'listen'
      ) {
        speakCurrentQuestion(q);
        return;
      }

      // 3. Option detection with automatic submission
      const matchedIdx = detectOptionFromSpeech(cleanTranscript, q.options);

      if (matchedIdx !== null) {
        if (autoSubmitTimerRef.current) {
          clearTimeout(autoSubmitTimerRef.current);
          autoSubmitTimerRef.current = null;
        }

        selectedOptionRef.current = matchedIdx;
        setSelectedOption(matchedIdx);
        setHasSubmitted(true);

        const letter = String.fromCharCode(65 + matchedIdx);
        const optText = q.options[matchedIdx];

        const isImmediate =
          cleanTranscript.includes('submit') ||
          cleanTranscript.includes('next') ||
          cleanTranscript.includes('confirm') ||
          cleanTranscript.includes('enter') ||
          cleanTranscript.includes('done') ||
          cleanTranscript.includes('go');

        if (isImmediate) {
          setVoiceFeedback(`Option ${letter}: "${optText}" selected! Submitting now...`);
          setTimeout(() => {
            handleNextRef.current();
          }, 300);
        } else {
          setVoiceFeedback(`Option ${letter} selected: "${optText}". Submitting in 1.2s...`);
          autoSubmitTimerRef.current = setTimeout(() => {
            handleNextRef.current();
          }, 1200);
        }
        return;
      }

      setVoiceFeedback(`Heard "${transcript}". Speak an answer (Option A/B/C/D or answer text) to submit.`);
    };

    recognitionRef.current = recognition;

    return () => {
      shouldListenRef.current = false;
      if (autoSubmitTimerRef.current) {
        clearTimeout(autoSubmitTimerRef.current);
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleVoiceListening = async () => {
    if (!speechSupported) {
      setVoiceFeedback('Speech Recognition is not supported by your browser. You can click options directly!');
      return;
    }

    if (isListening || isVoiceRunningRef.current) {
      shouldListenRef.current = false;
      isVoiceRunningRef.current = false;
      try {
        recognitionRef.current?.stop();
      } catch {}
      setIsListening(false);
      setVoiceFeedback('Voice command mode paused.');
      return;
    }

    // Try prompting for microphone access via getUserMedia to prompt the browser if needed
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Immediately release tracks so Web Speech API has exclusive microphone access
        stream.getTracks().forEach((track) => track.stop());
        setMicPermissionDenied(false);
        micPermissionDeniedRef.current = false;
      } catch (err: any) {
        setMicPermissionDenied(true);
        micPermissionDeniedRef.current = true;
        setIsListening(false);
        isVoiceRunningRef.current = false;
        shouldListenRef.current = false;
        setVoiceFeedback('Microphone permission not granted. You can answer by tapping the options.');
        return;
      }
    }

    shouldListenRef.current = true;
    if (!isVoiceRunningRef.current) {
      try {
        recognitionRef.current?.start();
        isVoiceRunningRef.current = true;
        setIsListening(true);
        setVoiceFeedback('Listening for speech answers and commands...');
      } catch {
        // Recognition is already active
        setIsListening(true);
        isVoiceRunningRef.current = true;
        setVoiceFeedback('Listening for speech answers and commands...');
      }
    } else {
      setIsListening(true);
      setVoiceFeedback('Listening for speech answers and commands...');
    }
  };

  const speakCurrentQuestion = (targetQ?: QuizQuestion) => {
    const q = targetQ || currentQ;
    setIsSpeaking(true);

    const textToRead = `${q.question}. Option A: ${q.options[0]}. Option B: ${q.options[1]}. Option C: ${q.options[2]}. Option D: ${q.options[3]}.`;

    speakText(textToRead, () => {
      setIsSpeaking(false);
    });
  };

  const handleStopSpeaking = () => {
    stopSpeaking();
    setIsSpeaking(false);
  };

  // Live timer countdown
  useEffect(() => {
    if (isQuizFinished) return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isQuizFinished]);

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (idx: number) => {
    setSelectedOption(idx);
    setHasSubmitted(true);
    setVoiceFeedback(`Selected Option ${String.fromCharCode(65 + idx)}: "${currentQ.options[idx]}"`);

    // Sensory gentle sound confirmation
    if (!isMuted) {
      if (idx === currentQ.correctIndex) {
        playGentleSuccessChime();
      } else {
        playGentleAttemptTone();
      }
    }
  };

  const handleNext = () => {
    if (autoSubmitTimerRef.current) {
      clearTimeout(autoSubmitTimerRef.current);
      autoSubmitTimerRef.current = null;
    }
    handleStopSpeaking();
    const currentOpt = selectedOptionRef.current !== null ? selectedOptionRef.current : selectedOption;
    if (currentOpt === null) {
      setVoiceFeedback('Please select or speak an option before submitting.');
      return;
    }
    const responseTimeSec = Math.max(
      3,
      Math.round((Date.now() - currentQuestionStartTime) / 1000)
    );
    const isCorrect = currentOpt === currentQ.correctIndex;
    const newCorrect = isCorrect ? correctAnswersCount + 1 : correctAnswersCount;
    setCorrectAnswersCount(newCorrect);

    const simulatedAccuracy = Math.round((newCorrect / (currentQuestionIndex + 1)) * 100);
    const updatedScore = estimateFocusScore(
      simulatedAccuracy,
      responseTimeSec,
      student.currentMood
    );
    onUpdateFocusScore(updatedScore);

    // AI/ML: Update Bayesian Knowledge Tracing posterior mastery
    const bktUpdate = updateBayesianKnowledge(isCorrect, bktMastery);
    setBktMastery(bktUpdate.nextItemMastery);

    if (currentQuestionIndex < activeQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      selectedOptionRef.current = null;
      setSelectedOption(null);
      setHasSubmitted(false);
      setCurrentQuestionStartTime(Date.now());
      setVoiceFeedback('Next question ready. State your answer...');
    } else {
      if (recognitionRef.current && isListening) {
        recognitionRef.current.stop();
      }
      setIsQuizFinished(true);
      onCompleteQuiz(simulatedAccuracy, newCorrect, activeQuestions.length, dynamicDifficulty);
    }
  };

  handleNextRef.current = handleNext;

  const handleRestart = () => {
    if (autoSubmitTimerRef.current) {
      clearTimeout(autoSubmitTimerRef.current);
      autoSubmitTimerRef.current = null;
    }
    handleStopSpeaking();
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setHasSubmitted(false);
    setTimerSeconds(180);
    setCorrectAnswersCount(0);
    setBktMastery(student.recentAccuracy ? student.recentAccuracy / 100 : 0.6);
    setIsQuizFinished(false);
    setCurrentQuestionStartTime(Date.now());
    setVoiceFeedback('');
  };

  if (isQuizFinished) {
    const finalPercent = Math.round((correctAnswersCount / activeQuestions.length) * 100);
    return (
      <div className="max-w-2xl mx-auto rounded-3xl bg-white p-8 sm:p-10 border border-[#FF8A00]/15 shadow-sm text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#00C896]/15 text-[#00C896]">
          <Award className="h-8 w-8" />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-[#1E293B]">Quiz Completed!</h2>
          <p className="text-xs text-[#1E293B]/60 mt-1">
            ANFIS fuzzy focus updated and cognitive Bayesian knowledge updated.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-[#FFF7F3] p-5 rounded-2xl border border-[#FF8A00]/15">
          <div>
            <span className="text-xs font-semibold text-[#1E293B]/60">Score</span>
            <div className="text-2xl font-black text-[#1E293B]">{finalPercent}%</div>
          </div>
          <div>
            <span className="text-xs font-semibold text-[#1E293B]/60">Correct</span>
            <div className="text-2xl font-black text-[#00C896]">
              {correctAnswersCount} / {activeQuestions.length}
            </div>
          </div>
          <div>
            <span className="text-xs font-semibold text-[#1E293B]/60">Final Focus</span>
            <div className="text-2xl font-black text-[#FF8A00]">
              {student.currentFocusScore} / 100
            </div>
          </div>
          <div>
            <span className="text-xs font-semibold text-[#1E293B]/60">BKT Mastery P(L)</span>
            <div className="text-2xl font-black text-[#4D84FE]">
              {Math.round(bktMastery * 100)}%
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <button
            onClick={handleRestart}
            className="flex items-center gap-2 rounded-2xl border border-[#FF8A00]/25 px-6 py-3 text-sm font-bold text-[#1E293B] hover:bg-[#FFF7F3] transition-all"
          >
            <RotateCcw className="h-4 w-4 text-[#FF8A00]" />
            Retake Quiz
          </button>

          <button
            onClick={onNavigateBack}
            className="flex items-center gap-2 rounded-2xl bg-[#4D84FE] px-6 py-3 text-sm font-bold text-white hover:bg-[#3B72EE] transition-all shadow-md shadow-[#4D84FE]/20"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Quiz Progress & Timer Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#FF8A00]/15 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#1E293B]">
            {SOLAR_SYSTEM_LESSON.title}
          </h1>
          <span className="text-xs font-semibold text-[#FF8A00]">
            Neuro-Adaptive Assessment ({activeQuestions.length} Questions)
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-[#1E293B]/70">
            Question {currentQuestionIndex + 1} of {activeQuestions.length}
          </span>
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-[#FF8A00]/20 text-[#1E293B] font-mono text-xs font-bold shadow-2xs">
            <Clock className="h-3.5 w-3.5 text-[#FF8A00]" />
            <span>{formatTimer(timerSeconds)}</span>
          </div>
        </div>
      </div>

      {/* Progress Bar in Vibrant Mint */}
      <div className="h-2.5 w-full rounded-full bg-white border border-[#FF8A00]/15 overflow-hidden p-0.5">
        <div
          className="h-full bg-[#00C896] rounded-full transition-all duration-300"
          style={{
            width: `${((currentQuestionIndex + 1) / activeQuestions.length) * 100}%`
          }}
        />
      </div>

      {/* Auditory & Voice Bar */}
      <div className="rounded-3xl bg-[#1E293B] p-5 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-[#1E293B]/20">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                isListening ? 'bg-emerald-400 animate-ping' : 'bg-slate-400'
              }`}
            />
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-200">
              Audio Accommodation & Voice Control
            </span>
          </div>
          <div className="text-xs text-slate-300 flex items-center gap-2 flex-wrap">
            {voiceFeedback ? (
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-all ${
                  voiceFeedback.includes('Submitting')
                    ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-400/40 shadow-xs'
                    : 'bg-indigo-500/20 text-indigo-200 border border-indigo-400/30'
                }`}
              >
                {voiceFeedback.includes('Submitting') && (
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                )}
                {voiceFeedback}
              </span>
            ) : (
              <span>
                {isListening
                  ? 'Listening... Speak your answer (Option A/B/C/D or answer words) to auto-submit.'
                  : 'Listen aloud or speak answers: Say "Option A", "Option B", or the answer to auto-submit.'}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={isSpeaking ? handleStopSpeaking : () => speakCurrentQuestion(currentQ)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              isSpeaking
                ? 'bg-amber-400 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
            }`}
            title="Read question and options aloud"
          >
            {isSpeaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4 text-indigo-400" />}
            <span>{isSpeaking ? 'Stop Audio' : 'Read Aloud'}</span>
          </button>

          <button
            type="button"
            id="voice-command-toggle-btn"
            onClick={toggleVoiceListening}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
              isListening
                ? 'bg-rose-500 hover:bg-rose-600 text-white animate-pulse'
                : 'bg-indigo-500 hover:bg-indigo-600 text-white'
            }`}
          >
            {isListening ? (
              <Mic className="h-4 w-4 animate-bounce" />
            ) : (
              <MicOff className="h-4 w-4" />
            )}
            <span>{isListening ? 'Listening (Tap to Stop)' : 'Voice Answer'}</span>
          </button>
        </div>
      </div>

      {/* Microphone Permission Guidance Banner */}
      {micPermissionDenied && (
        <div className="rounded-2xl border border-amber-300/80 bg-amber-50 p-4 text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-amber-200/80 p-2 text-amber-800 shrink-0 mt-0.5 sm:mt-0">
              <MicOff className="h-4 w-4" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-950">
                Microphone Permission Not Allowed
              </h4>
              <p className="text-xs text-amber-800 leading-relaxed">
                Browser blocked mic access. Click the <strong>lock / site settings icon</strong> in your browser URL bar and choose <strong>Allow Microphone</strong>, or open this app in a new browser tab. You can also simply click the answers below!
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <button
              type="button"
              onClick={toggleVoiceListening}
              className="px-3 py-1.5 rounded-xl bg-amber-600 text-white font-semibold text-xs hover:bg-amber-700 transition-colors shadow-xs"
            >
              Retry Mic
            </button>
            <button
              type="button"
              onClick={() => {
                setMicPermissionDenied(false);
                micPermissionDeniedRef.current = false;
              }}
              className="px-3 py-1.5 rounded-xl border border-amber-300 bg-white text-amber-800 font-semibold text-xs hover:bg-amber-100 transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Focus & Telemetry Info */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 rounded-2xl bg-[#FFF7F3] border border-[#FF8A00]/20 text-xs text-[#1E293B]">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#FF8A00] flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-[#FF8A00]" />
            AI/ML Telemetry:
          </span>
          <span className="font-medium">
            BKT Skill Mastery: <strong className="text-[#00C896] font-bold">{Math.round(bktMastery * 100)}%</strong>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[#1E293B]/60 font-semibold">Difficulty:</span>
          <span className="bg-[#4D84FE]/10 text-[#4D84FE] font-bold px-2.5 py-0.5 rounded-full text-[11px] capitalize">
            {currentQ.difficulty || dynamicDifficulty}
          </span>
        </div>
      </div>

      {/* Main Question Card */}
      <div className="rounded-3xl bg-white p-6 sm:p-8 border border-[#FF8A00]/15 shadow-sm space-y-6">
        {/* Question Header & Assistive Scaffolding Toolbar */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#1E293B]/60 font-bold uppercase tracking-wider">
            <span>Question {currentQuestionIndex + 1} of {activeQuestions.length}</span>
            <div className="flex items-center gap-2">
              {currentQ.topic && (
                <span className="text-[#00C896] bg-[#00C896]/10 px-2.5 py-0.5 rounded-full lowercase">
                  {currentQ.topic}
                </span>
              )}

              {/* Read Aloud Button */}
              <button
                type="button"
                onClick={() => (isSpeaking ? handleStopSpeaking() : speakCurrentQuestion())}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                  isSpeaking
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'bg-[#FFF7F3] text-[#4D84FE] border border-[#4D84FE]/20 hover:bg-[#4D84FE]/10'
                }`}
                title="Read question and options aloud"
              >
                {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                <span>{isSpeaking ? 'Stop Audio' : 'Read Aloud'}</span>
              </button>

              {/* Sound Mute Toggle */}
              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                className={`p-1.5 rounded-xl border border-[#FF8A00]/15 transition-all ${
                  isMuted ? 'text-slate-400 hover:text-slate-600 bg-slate-50' : 'text-[#00C896] bg-[#00C896]/10 hover:bg-[#00C896]/20'
                }`}
                title={isMuted ? 'Audio chimes muted' : 'Audio chimes active'}
              >
                {isMuted ? <MuteIcon className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-[#1E293B] leading-snug">
            {currentQ.question}
          </h2>
        </div>

        {/* Options List */}
        <div className="space-y-3">
          {currentQ.options.map((option, optIdx) => {
            const isSelected = selectedOption === optIdx;
            const letter = String.fromCharCode(65 + optIdx); // A, B, C, D

            return (
              <button
                key={`opt-${currentQ.id || currentQuestionIndex}-${optIdx}`}
                id={`quiz-option-${optIdx}`}
                onClick={() => handleSelectOption(optIdx)}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border text-left text-sm font-semibold transition-all ${
                  isSelected
                    ? 'border-[#4D84FE] bg-[#4D84FE]/10 text-[#1E293B] shadow-xs'
                    : 'border-[#FF8A00]/15 bg-white text-[#1E293B]/80 hover:bg-[#FFF7F3] hover:border-[#FF8A00]/30'
                }`}
              >
                {/* Radio Circle */}
                <div
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                    isSelected
                      ? 'border-[#4D84FE] bg-[#4D84FE] text-white'
                      : 'border-[#1E293B]/30 bg-white'
                  }`}
                >
                  {isSelected && <span className="h-2 w-2 rounded-full bg-white" />}
                </div>

                {/* Option text */}
                <span className="font-extrabold text-[#FF8A00] mr-1">{letter}.</span>
                <span className="flex-1">{option}</span>
                <span className="text-[11px] text-[#1E293B]/40 hidden sm:inline-block font-normal">
                  Say "Option {letter}"
                </span>
              </button>
            );
          })}
        </div>

        {/* Explanation shown after selection */}
        {hasSubmitted && (
          <div className="rounded-2xl bg-[#FFF7F3] p-4 border border-[#FF8A00]/20 text-xs text-[#1E293B]/80 leading-relaxed">
            <strong className="text-[#1E293B]">Explanation: </strong>
            {currentQ.explanation}
          </div>
        )}

        {/* Action Button */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-[#1E293B]/50 font-medium">
            {isListening ? 'Speak answer (A, B, C, D) or say "Submit"' : 'Click option or speak answer'}
          </span>
          <button
            id="quiz-next-btn"
            onClick={handleNext}
            disabled={selectedOption === null}
            className={`flex items-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-bold transition-all ${
              selectedOption !== null
                ? 'bg-[#4D84FE] text-white shadow-md shadow-[#4D84FE]/25 hover:bg-[#3B72EE]'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            <span>
              {currentQuestionIndex === activeQuestions.length - 1 ? 'Finish Quiz' : 'Submit / Next'}
            </span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Bottom Bar: Focus score meter */}
      <div className="rounded-2xl bg-white p-5 border border-[#FF8A00]/15 shadow-2xs space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-[#1E293B]">Your current focus score</span>
          <div className="flex items-center gap-2 font-mono">
            <span className="text-base font-black text-[#00C896]">
              {student.currentFocusScore}
            </span>
            <span className="text-[#1E293B]/40">/ 100</span>
          </div>
        </div>
        <div className="h-2 w-full rounded-full bg-[#FFF7F3] border border-[#FF8A00]/10 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              student.currentFocusScore >= 80
                ? 'bg-[#00C896]'
                : student.currentFocusScore >= 50
                ? 'bg-[#4D84FE]'
                : 'bg-[#FF8A00]'
            }`}
            style={{ width: `${student.currentFocusScore}%` }}
          />
        </div>
      </div>
    </div>
  );
};
