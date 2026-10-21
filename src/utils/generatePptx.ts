import pptxgen from 'pptxgenjs';
import { PRESENTATION_9_SLIDES, PresentationSlide } from '../data/presentationSlides';

export async function exportToPowerPoint(slides: PresentationSlide[] = PRESENTATION_9_SLIDES): Promise<void> {
  const pptx = new pptxgen();

  pptx.layout = 'LAYOUT_16x9';
  pptx.author = 'NeuroLearn Team';
  pptx.company = 'NeuroLearn Adaptive Systems';
  pptx.title = 'NeuroLearn: Personalized Adaptive Learning Platform for Neurodivergent Students';
  pptx.subject = 'Soft Computing in Assistive Education (Fuzzy Logic, ANFIS, Genetic Algorithms)';

  // Color Palette Constants
  const C_DARK_BG = '0F172A'; // Slate 900
  const C_LIGHT_BG = 'F8FAFC'; // Slate 50
  const C_WHITE = 'FFFFFF';
  const C_INDIGO = '4F46E5'; // Indigo 600
  const C_INDIGO_DARK = '3730A3'; // Indigo 800
  const C_INDIGO_LIGHT = 'EEF2FF'; // Indigo 50
  const C_EMERALD = '059669'; // Emerald 600
  const C_SLATE_DARK = '1E293B'; // Slate 800
  const C_SLATE_MUTED = '64748B'; // Slate 500
  const C_BORDER = 'E2E8F0'; // Slate 200

  // ----------------------------------------------------
  // SLIDE 1: TITLE SLIDE (Dark Navy Premium Theme)
  // ----------------------------------------------------
  const s1 = slides[0];
  const slide1 = pptx.addSlide();
  slide1.background = { color: C_DARK_BG };

  // Category Tag
  slide1.addText(s1.category.toUpperCase(), {
    x: 0.8,
    y: 0.8,
    w: 8.0,
    h: 0.35,
    fontSize: 11,
    bold: true,
    color: '818CF8', // Indigo 400
    fontFace: 'Arial',
    charSpacing: 2
  });

  // Main Title
  slide1.addText(s1.title, {
    x: 0.8,
    y: 1.25,
    w: 11.5,
    h: 1.0,
    fontSize: 44,
    bold: true,
    color: C_WHITE,
    fontFace: 'Arial'
  });

  // Subtitle
  slide1.addText(s1.subtitle, {
    x: 0.8,
    y: 2.3,
    w: 11.5,
    h: 0.8,
    fontSize: 18,
    color: '94A3B8', // Slate 400
    fontFace: 'Arial'
  });

  // Decorative Accent Line
  slide1.addShape(pptx.ShapeType.rect, {
    x: 0.8,
    y: 3.2,
    w: 2.5,
    h: 0.06,
    fill: { color: C_INDIGO },
    line: { color: C_INDIGO }
  });

  // 3 Focus Area Cards on Title Slide
  s1.keyPoints.forEach((kp, idx) => {
    const cardX = 0.8 + idx * 3.9;
    const cardY = 3.6;
    const cardW = 3.65;
    const cardH = 2.4;

    slide1.addShape(pptx.ShapeType.roundRect, {
      x: cardX,
      y: cardY,
      w: cardW,
      h: cardH,
      rectRadius: 0.15,
      fill: { color: '1E293B' },
      line: { color: '334155', width: 1 }
    });

    slide1.addText(kp.badge?.toUpperCase() || `PILLAR 0${idx + 1}`, {
      x: cardX + 0.3,
      y: cardY + 0.25,
      w: cardW - 0.6,
      h: 0.25,
      fontSize: 9,
      bold: true,
      color: '38BDF8', // Sky 400
      fontFace: 'Arial'
    });

    slide1.addText(kp.heading, {
      x: cardX + 0.3,
      y: cardY + 0.55,
      w: cardW - 0.6,
      h: 0.5,
      fontSize: 14,
      bold: true,
      color: C_WHITE,
      fontFace: 'Arial'
    });

    slide1.addText(kp.description, {
      x: cardX + 0.3,
      y: cardY + 1.1,
      w: cardW - 0.6,
      h: 1.1,
      fontSize: 11,
      color: 'CBD5E1',
      fontFace: 'Arial',
      lineSpacing: 16
    });
  });

  // Footer Metadata
  slide1.addText('Capstone Project Defense · Soft Computing & Assistive EdTech · Slide 1 of 9', {
    x: 0.8,
    y: 6.7,
    w: 11.5,
    h: 0.3,
    fontSize: 10,
    color: '64748B',
    fontFace: 'Arial'
  });

  slide1.addNotes(s1.speakerNotes);

  // ----------------------------------------------------
  // SLIDES 2 THROUGH 9: CONTENT SLIDES (High-Contrast White Theme)
  // ----------------------------------------------------
  for (let i = 1; i < slides.length; i++) {
    const s = slides[i];
    const slide = pptx.addSlide();
    slide.background = { color: C_LIGHT_BG };

    // Header Band / Slide Category
    slide.addText(`${s.category.toUpperCase()} · SLIDE ${s.slideNumber} OF 9`, {
      x: 0.8,
      y: 0.5,
      w: 9.0,
      h: 0.25,
      fontSize: 10,
      bold: true,
      color: C_INDIGO,
      fontFace: 'Arial',
      charSpacing: 1.5
    });

    // Main Title
    slide.addText(s.title, {
      x: 0.8,
      y: 0.8,
      w: 11.5,
      h: 0.65,
      fontSize: 24,
      bold: true,
      color: C_SLATE_DARK,
      fontFace: 'Arial'
    });

    // Subtitle
    slide.addText(s.subtitle, {
      x: 0.8,
      y: 1.45,
      w: 11.5,
      h: 0.35,
      fontSize: 12,
      color: C_SLATE_MUTED,
      fontFace: 'Arial'
    });

    // Divider Line
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.8,
      y: 1.9,
      w: 11.7,
      h: 0.02,
      fill: { color: C_BORDER },
      line: { color: C_BORDER }
    });

    // Left Column: Key Points (W: 7.6)
    const leftColX = 0.8;
    const leftColW = 7.6;
    const topY = 2.15;
    const pointH = 0.95;

    s.keyPoints.forEach((kp, kpIdx) => {
      const pY = topY + kpIdx * 1.05;

      // Card Background
      slide.addShape(pptx.ShapeType.roundRect, {
        x: leftColX,
        y: pY,
        w: leftColW,
        h: pointH,
        rectRadius: 0.1,
        fill: { color: C_WHITE },
        line: { color: C_BORDER, width: 1 }
      });

      // Left Accent bar on card
      slide.addShape(pptx.ShapeType.rect, {
        x: leftColX,
        y: pY,
        w: 0.1,
        h: pointH,
        fill: { color: C_INDIGO },
        line: { color: C_INDIGO }
      });

      // Heading
      slide.addText(kp.heading, {
        x: leftColX + 0.25,
        y: pY + 0.1,
        w: leftColW - 0.4,
        h: 0.28,
        fontSize: 12,
        bold: true,
        color: C_SLATE_DARK,
        fontFace: 'Arial'
      });

      // Description
      slide.addText(kp.description + (kp.highlight ? ` [${kp.highlight}]` : ''), {
        x: leftColX + 0.25,
        y: pY + 0.38,
        w: leftColW - 0.4,
        h: 0.5,
        fontSize: 10,
        color: '475569',
        fontFace: 'Arial',
        lineSpacing: 13
      });
    });

    // Right Column: Metrics & Architecture Summary (W: 3.8)
    const rightColX = 8.7;
    const rightColW = 3.8;

    // Metric Summary Container
    slide.addShape(pptx.ShapeType.roundRect, {
      x: rightColX,
      y: topY,
      w: rightColW,
      h: 4.25,
      rectRadius: 0.12,
      fill: { color: C_INDIGO_LIGHT },
      line: { color: 'C7D2FE', width: 1 } // Indigo 200
    });

    slide.addText('KEY METRICS & HIGHLIGHTS', {
      x: rightColX + 0.3,
      y: topY + 0.2,
      w: rightColW - 0.6,
      h: 0.3,
      fontSize: 10,
      bold: true,
      color: C_INDIGO_DARK,
      fontFace: 'Arial',
      charSpacing: 1
    });

    if (s.metrics && s.metrics.length > 0) {
      s.metrics.forEach((m, mIdx) => {
        const mY = topY + 0.6 + mIdx * 0.85;

        slide.addText(m.value, {
          x: rightColX + 0.3,
          y: mY,
          w: rightColW - 0.6,
          h: 0.38,
          fontSize: 20,
          bold: true,
          color: C_INDIGO,
          fontFace: 'Arial'
        });

        slide.addText(m.label + (m.subtext ? ` · ${m.subtext}` : ''), {
          x: rightColX + 0.3,
          y: mY + 0.36,
          w: rightColW - 0.6,
          h: 0.35,
          fontSize: 9.5,
          color: '334155',
          fontFace: 'Arial'
        });
      });
    }

    // Bottom Footer
    slide.addText(`NeuroLearn Capstone Defense · Page ${s.slideNumber} of 9`, {
      x: 0.8,
      y: 6.7,
      w: 8.0,
      h: 0.3,
      fontSize: 9.5,
      color: C_SLATE_MUTED,
      fontFace: 'Arial'
    });

    slide.addText('Confidential & Educational Project Material', {
      x: 8.5,
      y: 6.7,
      w: 4.0,
      h: 0.3,
      fontSize: 9.5,
      color: C_SLATE_MUTED,
      fontFace: 'Arial',
      align: 'right'
    });

    // Add Speaker Notes to Slide
    slide.addNotes(s.speakerNotes);
  }

  // Trigger browser download of presentation
  await pptx.writeFile({ fileName: 'NeuroLearn_9_Page_Presentation.pptx' });
}
