import type { Meta, StoryObj } from "@storybook/react";
import { SpectrogramRenderer } from "./App";
import type { SpectrogramContent } from "./schema";

const meta = {
  title: "Views/Spectrogram",
  component: SpectrogramRenderer,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  decorators: [(Story) => <div style={{ height: "600px" }}><Story /></div>],
} satisfies Meta<typeof SpectrogramRenderer>;

export default meta;
type Story = StoryObj<typeof meta>;

/* ------------------------------------------------------------------ */
/*  Helper: generate synthetic magnitude arrays                       */
/* ------------------------------------------------------------------ */

function generateSpeechMagnitudes(
  frames: number,
  bins: number,
): number[][] {
  const magnitudes: number[][] = [];

  /* Simulate formant frequencies as Gaussian bumps */
  const formants = [
    { center: 0.08, width: 0.03, amplitude: 0.9 }, /* ~300 Hz */
    { center: 0.2, width: 0.04, amplitude: 0.7 },  /* ~800 Hz */
    { center: 0.45, width: 0.06, amplitude: 0.5 },  /* ~1800 Hz */
    { center: 0.65, width: 0.05, amplitude: 0.3 },  /* ~2600 Hz */
  ];

  for (let f = 0; f < frames; f++) {
    const row: number[] = [];
    /* Simulate voiced/unvoiced alternation (syllable pattern) */
    const syllablePhase = Math.sin((f / frames) * Math.PI * 8);
    const voicing = Math.max(0, syllablePhase) * 0.6 + 0.2;

    for (let b = 0; b < bins; b++) {
      const binNorm = b / bins;
      let val = 0;

      /* Add formant energy */
      for (const formant of formants) {
        const dist = (binNorm - formant.center) / formant.width;
        val += formant.amplitude * Math.exp(-0.5 * dist * dist) * voicing;
      }

      /* Add broadband noise floor */
      val += 0.05 + Math.random() * 0.03;

      /* Add harmonics (pitch ~150 Hz) */
      const harmonicSpacing = 0.04;
      const harmonicPhase = (binNorm % harmonicSpacing) / harmonicSpacing;
      if (harmonicPhase < 0.15 && binNorm < 0.5) {
        val += 0.15 * voicing * (1 - binNorm);
      }

      row.push(Math.min(1, Math.max(0, val)));
    }
    magnitudes.push(row);
  }

  return magnitudes;
}

function generateMusicMagnitudes(
  frames: number,
  bins: number,
): number[][] {
  const magnitudes: number[][] = [];

  /* Fundamental and harmonic overtones for a chord progression */
  const chords = [
    [0.05, 0.10, 0.15, 0.20],   /* C major-ish */
    [0.06, 0.12, 0.18, 0.24],   /* D major-ish */
    [0.045, 0.09, 0.135, 0.18], /* Bb major-ish */
    [0.05, 0.10, 0.15, 0.20],   /* Back to C */
  ];

  for (let f = 0; f < frames; f++) {
    const row: number[] = [];
    const chordIdx = Math.floor((f / frames) * chords.length) % chords.length;
    const chord = chords[chordIdx];

    /* Transition blending */
    const chordProgress = ((f / frames) * chords.length) % 1;
    const blend = chordProgress < 0.1 ? chordProgress / 0.1 : 1;

    for (let b = 0; b < bins; b++) {
      const binNorm = b / bins;
      let val = 0;

      /* Add harmonic overtone series for each note in the chord */
      for (const fundamental of chord) {
        for (let h = 1; h <= 8; h++) {
          const freq = fundamental * h;
          const dist = Math.abs(binNorm - freq);
          if (dist < 0.015) {
            const amplitude = (0.8 / h) * blend;
            val += amplitude * (1 - dist / 0.015);
          }
        }
      }

      /* Add some percussive transients */
      if (f % 25 < 2 && binNorm > 0.3) {
        val += 0.3 * Math.exp(-binNorm * 3) * Math.random();
      }

      /* Noise floor */
      val += 0.02 + Math.random() * 0.015;

      row.push(Math.min(1, Math.max(0, val)));
    }
    magnitudes.push(row);
  }

  return magnitudes;
}

/* ------------------------------------------------------------------ */
/*  SpeechSpectrogram: Simulated speech pattern with formants         */
/* ------------------------------------------------------------------ */

const speechMags = generateSpeechMagnitudes(100, 128);

export const SpeechSpectrogram: Story = {
  args: {
    data: {
      type: "spectrogram",
      version: "1.0",
      title: "Speech Signal — Vowel Formants",
      data: {
        sampleRate: 16000,
        fftSize: 256,
        hopSize: 128,
        magnitudes: speechMags,
      },
      frequencyRange: { min: 0, max: 8000 },
      colorMap: "viridis",
      showFrequencyAxis: true,
      showTimeAxis: true,
    } satisfies SpectrogramContent,
  },
};

/* ------------------------------------------------------------------ */
/*  MusicSpectrogram: Simulated music with harmonic overtones         */
/* ------------------------------------------------------------------ */

const musicMags = generateMusicMagnitudes(100, 128);

export const MusicSpectrogram: Story = {
  args: {
    data: {
      type: "spectrogram",
      version: "1.0",
      title: "Music — Chord Progression with Harmonics",
      data: {
        sampleRate: 44100,
        fftSize: 1024,
        hopSize: 512,
        magnitudes: musicMags,
      },
      frequencyRange: { min: 0, max: 22050 },
      colorMap: "inferno",
      showFrequencyAxis: true,
      showTimeAxis: true,
    } satisfies SpectrogramContent,
  },
};

/* ------------------------------------------------------------------ */
/*  GrayscaleTheme: Same speech data with grayscale colormap          */
/* ------------------------------------------------------------------ */

export const GrayscaleTheme: Story = {
  args: {
    data: {
      type: "spectrogram",
      version: "1.0",
      title: "Speech Signal — Grayscale",
      data: {
        sampleRate: 16000,
        fftSize: 256,
        hopSize: 128,
        magnitudes: speechMags,
      },
      frequencyRange: { min: 0, max: 8000 },
      colorMap: "grayscale",
      showFrequencyAxis: true,
      showTimeAxis: true,
    } satisfies SpectrogramContent,
  },
};

/* ------------------------------------------------------------------ */
/*  MagmaTheme: Same music data with magma colormap                   */
/* ------------------------------------------------------------------ */

export const MagmaTheme: Story = {
  args: {
    data: {
      type: "spectrogram",
      version: "1.0",
      title: "Music — Magma Colormap",
      data: {
        sampleRate: 44100,
        fftSize: 1024,
        hopSize: 512,
        magnitudes: musicMags,
      },
      frequencyRange: { min: 0, max: 22050 },
      colorMap: "magma",
      showFrequencyAxis: true,
      showTimeAxis: true,
    } satisfies SpectrogramContent,
  },
};
