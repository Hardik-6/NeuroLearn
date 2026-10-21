import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Download,
  FileText,
  RotateCw,
  Loader2
} from 'lucide-react';

// Configure PDF.js worker
if (typeof window !== 'undefined') {
  try {
    // Use worker from unpkg/cdnjs matching installed version, with graceful fallback
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/pdf.worker.min.mjs`;
  } catch (e) {
    console.warn('Failed to set PDF worker src:', e);
  }
}

interface InteractivePdfViewerProps {
  fileDataUrl: string;
  fileName?: string;
  fileSize?: number;
  title?: string;
}

export const InteractivePdfViewer: React.FC<InteractivePdfViewerProps> = ({
  fileDataUrl,
  fileName = 'Document.pdf',
  fileSize,
  title
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.2);
  const [rotation, setRotation] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Convert base64 dataUrl to Uint8Array for reliable PDF.js parsing
  const getPdfData = (dataUrl: string): Uint8Array | string => {
    try {
      if (dataUrl.startsWith('data:application/pdf;base64,') || dataUrl.startsWith('data:;base64,')) {
        const base64Index = dataUrl.indexOf('base64,');
        if (base64Index !== -1) {
          const base64String = dataUrl.substring(base64Index + 7);
          const binaryString = atob(base64String);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          return bytes;
        }
      }
    } catch (err) {
      console.warn('Could not decode base64 PDF directly, falling back to URL:', err);
    }
    return dataUrl;
  };

  // Load the PDF Document
  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);
    setLoadError(null);

    const loadPdf = async () => {
      try {
        const pdfData = getPdfData(fileDataUrl);
        const loadingTask = pdfjsLib.getDocument(
          typeof pdfData === 'string' ? { url: pdfData } : { data: pdfData }
        );

        const loadedPdf = await loadingTask.promise;
        if (isCancelled) return;

        setPdfDoc(loadedPdf);
        setNumPages(loadedPdf.numPages);
        setCurrentPage(1);
        setIsLoading(false);
      } catch (err: any) {
        console.error('PDF.js loading error:', err);
        if (!isCancelled) {
          setLoadError(err?.message || 'Unable to render PDF document directly.');
          setIsLoading(false);
        }
      }
    };

    if (fileDataUrl) {
      loadPdf();
    }

    return () => {
      isCancelled = true;
    };
  }, [fileDataUrl]);

  // Render current page onto canvas
  useEffect(() => {
    let renderTask: any = null;
    let isCancelled = false;

    const renderPage = async () => {
      if (!pdfDoc || !canvasRef.current) return;

      try {
        const page = await pdfDoc.getPage(currentPage);
        if (isCancelled) return;

        const viewport = page.getViewport({ scale, rotation });
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        if (!context) return;

        // Support high-DPI screens
        const outputScale = window.devicePixelRatio || 1;
        canvas.width = Math.floor(viewport.width * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

        const transform = outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : undefined;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
          transform: transform
        };

        renderTask = page.render(renderContext);
        await renderTask.promise;
      } catch (err: any) {
        if (err?.name !== 'RenderingCancelledException') {
          console.error('Error rendering PDF page:', err);
        }
      }
    };

    renderPage();

    return () => {
      isCancelled = true;
      if (renderTask) {
        renderTask.cancel();
      }
    };
  }, [pdfDoc, currentPage, scale, rotation]);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < numPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(2.5, +(prev + 0.2).toFixed(1)));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(0.6, +(prev - 0.2).toFixed(1)));
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.warn('Fullscreen request failed:', err);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden flex flex-col ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none h-screen' : 'w-full'
      }`}
    >
      {/* Viewer Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3 bg-slate-900 text-white border-b border-slate-800">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
            <FileText className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 truncate">
              <span className="text-xs sm:text-sm font-bold truncate text-white">
                {fileName || title || 'PDF Document'}
              </span>
              <span className="text-[10px] font-bold text-rose-300 bg-rose-950/80 px-2 py-0.5 rounded-full border border-rose-800 shrink-0">
                Interactive PDF
              </span>
            </div>
            {fileSize && (
              <span className="text-[11px] text-slate-400">
                {Math.round(fileSize / 1024)} KB • Full In-App Reader
              </span>
            )}
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
          {/* Page navigation */}
          {numPages > 0 && (
            <div className="flex items-center bg-slate-800 rounded-lg p-0.5 text-xs">
              <button
                type="button"
                onClick={handlePrevPage}
                disabled={currentPage <= 1}
                className="p-1.5 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent rounded-md transition-colors"
                title="Previous Page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="px-2.5 font-mono text-xs font-semibold text-slate-200">
                {currentPage} / {numPages}
              </span>
              <button
                type="button"
                onClick={handleNextPage}
                disabled={currentPage >= numPages}
                className="p-1.5 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent rounded-md transition-colors"
                title="Next Page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Zoom controls */}
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 text-xs">
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-1.5 hover:bg-slate-700 rounded-md transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="h-4 w-4 text-slate-300" />
            </button>
            <span className="px-2 font-mono text-xs font-semibold text-slate-300">
              {Math.round(scale * 100)}%
            </span>
            <button
              type="button"
              onClick={handleZoomIn}
              className="p-1.5 hover:bg-slate-700 rounded-md transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="h-4 w-4 text-slate-300" />
            </button>
          </div>

          {/* Rotate button */}
          <button
            type="button"
            onClick={handleRotate}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-colors"
            title="Rotate Page"
          >
            <RotateCw className="h-3.5 w-3.5" />
          </button>

          {/* Fullscreen button */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>

          {/* Download button */}
          {fileDataUrl && (
            <a
              href={fileDataUrl}
              download={fileName || 'document.pdf'}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Download</span>
            </a>
          )}
        </div>
      </div>

      {/* Main PDF Canvas Area */}
      <div className="relative flex-1 bg-slate-800/95 overflow-auto p-4 sm:p-8 flex justify-center items-start min-h-[540px] max-h-[760px]">
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/60 backdrop-blur-xs text-white z-10 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
            <p className="text-xs font-semibold tracking-wide text-slate-200">
              Rendering document pages...
            </p>
          </div>
        )}

        {loadError ? (
          <div className="bg-slate-900 border border-slate-700 p-8 rounded-2xl max-w-md text-center text-white my-auto space-y-4">
            <FileText className="h-12 w-12 text-rose-400 mx-auto" />
            <div>
              <h4 className="font-bold text-base text-slate-100">Document Ready</h4>
              <p className="text-xs text-slate-400 mt-1">
                {fileName} is attached to this lesson. You can download or view it directly in your browser.
              </p>
            </div>
            {fileDataUrl && (
              <a
                href={fileDataUrl}
                download={fileName || 'document.pdf'}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Download {fileName}</span>
              </a>
            )}
          </div>
        ) : (
          <div className="shadow-2xl rounded-sm overflow-hidden bg-white">
            <canvas ref={canvasRef} className="block max-w-full h-auto" />
          </div>
        )}
      </div>

      {/* Bottom bar for quick navigation */}
      {numPages > 1 && (
        <div className="bg-slate-900/90 border-t border-slate-800 px-4 py-2.5 flex items-center justify-between text-xs text-slate-400">
          <span>
            Viewing page <strong className="text-white">{currentPage}</strong> of <strong className="text-white">{numPages}</strong>
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrevPage}
              disabled={currentPage <= 1}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-30 transition-colors"
            >
              Previous Page
            </button>
            <button
              type="button"
              onClick={handleNextPage}
              disabled={currentPage >= numPages}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-30 transition-colors"
            >
              Next Page
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
