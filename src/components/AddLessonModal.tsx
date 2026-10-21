import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Video,
  FileText,
  Presentation,
  Upload,
  Sparkles,
  CheckCircle2,
  Clock,
  Layers
} from 'lucide-react';
import { LessonContent, SlideItem } from '../types';

interface AddLessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveLesson: (lesson: LessonContent) => void;
}

export const AddLessonModal: React.FC<AddLessonModalProps> = ({
  isOpen,
  onClose,
  onSaveLesson
}) => {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Science');
  const [estimatedMinutes, setEstimatedMinutes] = useState(15);
  const [description, setDescription] = useState('');
  
  // Video fields
  const [videoUrl, setVideoUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('');

  // PPT / PDF fields
  const [pptFileName, setPptFileName] = useState('');
  const [pptUrl, setPptUrl] = useState('');
  const [fileDataUrl, setFileDataUrl] = useState('');
  const [fileType, setFileType] = useState('');
  const [fileSize, setFileSize] = useState(0);
  const [isReadingFile, setIsReadingFile] = useState(false);
  const [slides, setSlides] = useState<SlideItem[]>([
    {
      slideNumber: 1,
      title: 'Introduction & Core Concept',
      bullets: ['Key idea introduced in plain language', 'Visual reference and real-world connection'],
      visualCue: 'Central diagram or thematic graphic',
      speakerNotes: 'Begin with an engaging question to activate prior knowledge.'
    }
  ]);

  // Sections / Notes fields
  const [sections, setSections] = useState<{ heading: string; text: string; keyPoints: string[] }[]>([
    {
      heading: 'Foundational Principles',
      text: '',
      keyPoints: ['']
    }
  ]);

  // Accommodations
  const [accommodations, setAccommodations] = useState<string[]>(['ADHD', 'Dyslexia']);

  if (!isOpen) return null;

  const handleAddSlide = () => {
    setSlides((prev) => [
      ...prev,
      {
        slideNumber: prev.length + 1,
        title: `Slide ${prev.length + 1}: Key Concept`,
        bullets: ['Important insight', 'Practical application'],
        visualCue: 'Diagram or supporting visual notes',
        speakerNotes: 'Reinforce concept with an interactive prompt.'
      }
    ]);
  };

  const handleRemoveSlide = (idx: number) => {
    if (slides.length <= 1) return;
    setSlides((prev) =>
      prev
        .filter((_, i) => i !== idx)
        .map((s, i) => ({ ...s, slideNumber: i + 1 }))
    );
  };

  const handleUpdateSlide = (idx: number, field: keyof SlideItem, value: any) => {
    setSlides((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, [field]: value } : s))
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsReadingFile(true);
    setPptFileName(file.name);
    setFileSize(file.size);

    const isPdf = file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf';
    setFileType(isPdf ? 'application/pdf' : file.type || 'application/vnd.ms-powerpoint');

    // Parse base file name for default title if empty
    const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
    const formattedTitle = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
    if (!title) {
      setTitle(formattedTitle);
    }
    // Read full file content via FileReader
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setFileDataUrl(result);
      }
      setIsReadingFile(false);
    };
    reader.onerror = () => {
      setIsReadingFile(false);
    };
    reader.readAsDataURL(file);

    // For PDFs: keep clean without fake boilerplate reading text, allow document to be primary
    if (isPdf) {
      if (!description) {
        setDescription(`Interactive PDF document: ${file.name}`);
      }
      setSlides([]); // PDF document is rendered directly in the PDF viewer
    } else {
      if (!description) {
        setDescription(`Adaptive learning module and interactive presentation for ${formattedTitle}.`);
      }
      // Auto-generate high quality, student-friendly slide overview for PPTs
      setSlides([
        {
          slideNumber: 1,
          title: `${formattedTitle} - Objectives & Overview`,
          bullets: [
            `Primary study material: ${file.name}`,
            'Chunked sensory-friendly breakdown designed for focused comprehension',
            'Multi-slide presentation ready with customizable reading pace'
          ],
          visualCue: `Interactive material preview & cover for ${formattedTitle}`,
          speakerNotes: `Activate prior knowledge: discuss core themes before diving into ${formattedTitle}.`
        },
        {
          slideNumber: 2,
          title: 'Key Concepts & Adaptive Discussion',
          bullets: [
            'Core conceptual principles structured for neurodivergent learners',
            'Accommodated visual layout with adjustable font sizing and line spacing',
            'Integrated text-to-speech audio reader available on demand'
          ],
          visualCue: 'Step-by-step visual concept roadmap',
          speakerNotes: 'Reinforce primary definitions and check for student comprehension.'
        }
      ]);
    }
  };

  const handleAddSection = () => {
    setSections((prev) => [
      ...prev,
      {
        heading: `Section ${prev.length + 1}`,
        text: '',
        keyPoints: ['']
      }
    ]);
  };

  const handleRemoveSection = (idx: number) => {
    if (sections.length <= 1) return;
    setSections((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleToggleAccommodation = (acc: string) => {
    setAccommodations((prev) =>
      prev.includes(acc) ? prev.filter((a) => a !== acc) : [...prev, acc]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Convert video URL to embed format if YouTube
    let cleanVideoUrl = videoUrl.trim();
    if (cleanVideoUrl.includes('youtube.com/watch?v=')) {
      const videoId = cleanVideoUrl.split('watch?v=')[1]?.split('&')[0];
      if (videoId) cleanVideoUrl = `https://www.youtube-nocookie.com/embed/${videoId}`;
    } else if (cleanVideoUrl.includes('youtu.be/')) {
      const videoId = cleanVideoUrl.split('youtu.be/')[1]?.split('?')[0];
      if (videoId) cleanVideoUrl = `https://www.youtube-nocookie.com/embed/${videoId}`;
    }

    const newLesson: LessonContent = {
      id: `lesson-${Date.now()}`,
      title: title.trim(),
      subject,
      estimatedMinutes: Number(estimatedMinutes) || 15,
      description: description.trim() || 'Comprehensive neurodivergent lesson module.',
      videoUrl: cleanVideoUrl || undefined,
      videoTitle: videoTitle.trim() || (cleanVideoUrl ? `${title} Video Resource` : undefined),
      pptFileName: pptFileName.trim() || undefined,
      pptUrl: pptUrl.trim() || undefined,
      fileDataUrl: fileDataUrl || undefined,
      fileType: fileType || undefined,
      fileSize: fileSize || undefined,
      pptSlides: slides.length > 0 ? slides : undefined,
      sections: sections.filter((s) => s.heading.trim() && s.text.trim()),
      targetAccommodations: accommodations,
      author: 'Educator Added',
      createdAt: new Date().toLocaleDateString()
    };

    onSaveLesson(newLesson);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50/80 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-600" />
              <span>Add New Lesson (Video, PPT & Reading)</span>
            </h2>
            <p className="text-xs text-slate-500">
              Easily attach educational videos, upload presentation slide decks, and structure adaptive reading sections.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-700">
          {/* Basic Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="font-semibold text-slate-800">Lesson Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Photosynthesis & Cellular Energy"
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:border-indigo-600 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-800">Subject</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:border-indigo-600 outline-none bg-white"
              >
                <option value="Science">Science</option>
                <option value="Biology">Biology</option>
                <option value="Physics">Physics</option>
                <option value="Math">Math</option>
                <option value="History">History</option>
                <option value="Literature">Literature</option>
                <option value="Computer Science">Computer Science</option>
              </select>
            </div>

            <div className="space-y-1.5 sm:col-span-1">
              <label className="font-semibold text-slate-800">Estimated Duration (Mins)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={5}
                  max={60}
                  value={estimatedMinutes}
                  onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:border-indigo-600 outline-none"
                />
                <Clock className="h-4 w-4 text-slate-400 shrink-0" />
              </div>
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="font-semibold text-slate-800">Overview / Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary of learning goals..."
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:border-indigo-600 outline-none"
              />
            </div>
          </div>

          {/* Video Attachment Section */}
          <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Video className="h-4 w-4 text-rose-500" />
                <span>Video Resource (YouTube / MP4 Embed)</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setVideoUrl('https://www.youtube-nocookie.com/embed/libKVRa07BM');
                  setVideoTitle('Exploring Our Solar System (Planets & Orbits)');
                }}
                className="text-[11px] text-indigo-600 font-semibold hover:underline"
              >
                Insert Sample Educational Video
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] text-slate-500">Video Embed URL (YouTube or Web Video)</label>
                <input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=... or .mp4"
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs bg-white focus:border-indigo-600 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-500">Video Caption / Title</label>
                <input
                  type="text"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  placeholder="e.g. Visual Demonstration & Walkthrough"
                  className="w-full rounded-lg border border-slate-300 p-2 text-xs bg-white focus:border-indigo-600 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Presentation / PPT Section */}
          <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Presentation className="h-4 w-4 text-amber-500" />
                <span>Presentation / Slide Deck (PPT / PPTX / PDF)</span>
              </div>
              <button
                type="button"
                onClick={handleAddSlide}
                className="flex items-center gap-1 text-[11px] bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg font-semibold hover:bg-indigo-100 transition-colors"
              >
                <Plus className="h-3 w-3" />
                <span>Add Slide</span>
              </button>
            </div>

            {/* Drag & Drop / File Upload trigger */}
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center bg-white hover:border-indigo-400 transition-colors relative">
              <Upload className="h-6 w-6 text-indigo-600 mx-auto mb-1.5" />
              <p className="font-semibold text-slate-800">
                {isReadingFile ? 'Processing document...' : pptFileName ? `Attached: ${pptFileName}` : 'Upload Presentation or Document (.pdf, .ppt, .pptx)'}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Drag and drop your file or click to select (PDFs are directly viewable in the student lesson hub)
              </p>
              <input
                type="file"
                accept=".ppt,.pptx,.pdf,.odp,.txt"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
            </div>

            {pptFileName && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{pptFileName}</span>
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-md bg-emerald-200/70 text-emerald-800">
                        {fileType === 'application/pdf' ? 'Interactive PDF' : 'Slide Deck'}
                      </span>
                    </div>
                    <span className="text-[11px] text-emerald-700">
                      {Math.round(fileSize / 1024)} KB • Ready for interactive student viewing
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setPptFileName('');
                    setFileDataUrl('');
                    setFileType('');
                    setFileSize(0);
                  }}
                  className="px-2.5 py-1 text-[11px] font-semibold text-rose-600 hover:bg-rose-100 rounded-lg transition-colors"
                >
                  Remove File
                </button>
              </div>
            )}

            {/* Interactive Slides editor */}
            <div className="space-y-3 pt-2">
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                Slides in Deck ({slides.length})
              </label>
              {slides.map((slide, idx) => (
                <div key={idx} className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-[11px]">Slide {slide.slideNumber}</span>
                    {slides.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSlide(idx)}
                        className="text-slate-400 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  <input
                    type="text"
                    value={slide.title}
                    onChange={(e) => handleUpdateSlide(idx, 'title', e.target.value)}
                    placeholder="Slide Title..."
                    className="w-full rounded-lg border border-slate-200 p-1.5 text-xs font-semibold focus:border-indigo-600 outline-none"
                  />

                  <textarea
                    rows={2}
                    value={slide.bullets.join('\n')}
                    onChange={(e) =>
                      handleUpdateSlide(
                        idx,
                        'bullets',
                        e.target.value.split('\n').filter(Boolean)
                      )
                    }
                    placeholder="Bullet points (one per line)..."
                    className="w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-indigo-600 outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Reading & Concept Sections */}
          <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <FileText className="h-4 w-4 text-indigo-500" />
                <span>Lesson Reading Sections & Takeaways</span>
              </div>
              <button
                type="button"
                onClick={handleAddSection}
                className="flex items-center gap-1 text-[11px] bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg font-semibold hover:bg-indigo-100 transition-colors"
              >
                <Plus className="h-3 w-3" />
                <span>Add Section</span>
              </button>
            </div>

            {sections.map((sec, sIdx) => (
              <div key={sIdx} className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-[11px]">Section {sIdx + 1}</span>
                  {sections.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSection(sIdx)}
                      className="text-slate-400 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <input
                  type="text"
                  value={sec.heading}
                  onChange={(e) => {
                    const newHeading = e.target.value;
                    setSections((prev) =>
                      prev.map((s, i) => (i === sIdx ? { ...s, heading: newHeading } : s))
                    );
                  }}
                  placeholder="Section Heading..."
                  className="w-full rounded-lg border border-slate-200 p-1.5 text-xs font-semibold focus:border-indigo-600 outline-none"
                />

                <textarea
                  rows={3}
                  value={sec.text}
                  onChange={(e) => {
                    const newText = e.target.value;
                    setSections((prev) =>
                      prev.map((s, i) => (i === sIdx ? { ...s, text: newText } : s))
                    );
                  }}
                  placeholder="Descriptive lesson content (supports ANFIS adaptive text, line spacing, and browser text-to-speech)..."
                  className="w-full rounded-lg border border-slate-200 p-2 text-xs focus:border-indigo-600 outline-none"
                />
              </div>
            ))}
          </div>

          {/* Neurodivergent Accommodations Checklist */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-800">Target Neurodivergent Accommodations</label>
            <div className="flex flex-wrap gap-2">
              {['ADHD', 'Dyslexia', 'Autism', 'Sensory Sensitive', 'Kinesthetic'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleToggleAccommodation(tag)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    accommodations.includes(tag)
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Save & Publish Lesson</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
