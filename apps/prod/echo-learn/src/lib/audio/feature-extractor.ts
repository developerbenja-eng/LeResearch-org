import type { StemName } from '@/types/visualizer';
import type {
  SpectralProfile,
  FrequencyBands,
  EnergyTimeline,
  AudioFeatures,
} from '@/types/music-patterns';

// Frequency band boundaries in Hz
const BANDS = {
  subBass: { min: 20, max: 60 },
  bass: { min: 60, max: 250 },
  lowMids: { min: 250, max: 1000 },
  highMids: { min: 1000, max: 4000 },
  treble: { min: 4000, max: 10000 },
  air: { min: 10000, max: 20000 },
} as const;

/**
 * Extract frequency band distribution from an AnalyserNode.
 * Reads a single FFT snapshot and maps bins to named bands.
 */
function extractBands(analyser: AnalyserNode): FrequencyBands {
  const bufferLength = analyser.frequencyBinCount;
  const data = new Uint8Array(bufferLength);
  analyser.getByteFrequencyData(data);

  const sampleRate = analyser.context.sampleRate;
  const binWidth = sampleRate / (analyser.fftSize);

  const bands: Record<string, number> = {};

  for (const [bandName, range] of Object.entries(BANDS)) {
    const startBin = Math.floor(range.min / binWidth);
    const endBin = Math.min(Math.ceil(range.max / binWidth), bufferLength);
    let sum = 0;
    let count = 0;

    for (let i = startBin; i < endBin; i++) {
      sum += data[i];
      count++;
    }

    bands[bandName] = count > 0 ? sum / count / 255 : 0;
  }

  return bands as unknown as FrequencyBands;
}

/**
 * Extract spectral profile from all stem analysers + master.
 * Call this during playback (analysers need active audio to produce data).
 *
 * For more accuracy, call multiple times over a few seconds and average.
 */
export function extractSpectralProfile(
  stemAnalysers: Map<StemName, AnalyserNode>,
  masterAnalyser: AnalyserNode | null,
): SpectralProfile {
  const stems = {} as Record<StemName, FrequencyBands>;

  for (const [name, analyser] of stemAnalysers) {
    stems[name] = extractBands(analyser);
  }

  const master = masterAnalyser
    ? extractBands(masterAnalyser)
    : { subBass: 0, bass: 0, lowMids: 0, highMids: 0, treble: 0, air: 0 };

  return { stems, master };
}

/**
 * Compute averaged spectral profile over multiple frames.
 * Returns a promise that resolves after sampling `frameCount` frames
 * spaced `intervalMs` apart during playback.
 */
export function extractAveragedSpectralProfile(
  stemAnalysers: Map<StemName, AnalyserNode>,
  masterAnalyser: AnalyserNode | null,
  frameCount = 10,
  intervalMs = 200,
): Promise<SpectralProfile> {
  return new Promise((resolve) => {
    const samples: SpectralProfile[] = [];
    let collected = 0;

    const interval = setInterval(() => {
      samples.push(extractSpectralProfile(stemAnalysers, masterAnalyser));
      collected++;

      if (collected >= frameCount) {
        clearInterval(interval);
        resolve(averageProfiles(samples));
      }
    }, intervalMs);
  });
}

function averageProfiles(profiles: SpectralProfile[]): SpectralProfile {
  const n = profiles.length;
  if (n === 0) {
    const empty: FrequencyBands = { subBass: 0, bass: 0, lowMids: 0, highMids: 0, treble: 0, air: 0 };
    return { stems: { vocals: empty, drums: empty, bass: empty, other: empty }, master: empty };
  }

  const avgBands = (getBands: (p: SpectralProfile) => FrequencyBands): FrequencyBands => {
    const keys: (keyof FrequencyBands)[] = ['subBass', 'bass', 'lowMids', 'highMids', 'treble', 'air'];
    const result = {} as Record<string, number>;
    for (const key of keys) {
      result[key] = profiles.reduce((sum, p) => sum + getBands(p)[key], 0) / n;
    }
    return result as unknown as FrequencyBands;
  };

  return {
    stems: {
      vocals: avgBands((p) => p.stems.vocals),
      drums: avgBands((p) => p.stems.drums),
      bass: avgBands((p) => p.stems.bass),
      other: avgBands((p) => p.stems.other),
    },
    master: avgBands((p) => p.master),
  };
}

/**
 * Extract energy timeline from pre-computed waveform data.
 * The engine provides 300 samples per stem — we smooth to ~30 points.
 */
export function extractEnergyTimeline(
  waveformData: Map<StemName, number[]>,
): EnergyTimeline {
  const windowSize = 10;

  const smooth = (data: number[]): Array<{ position: number; value: number }> => {
    const result: Array<{ position: number; value: number }> = [];
    for (let i = 0; i < data.length; i += windowSize) {
      const window = data.slice(i, i + windowSize);
      const avg = window.reduce((s, v) => s + v, 0) / window.length;
      result.push({ position: i / data.length, value: avg });
    }
    return result;
  };

  const perStem = {} as Record<StemName, Array<{ position: number; value: number }>>;
  const allValues: number[] = [];

  for (const [name, data] of waveformData) {
    perStem[name] = smooth(data);
    data.forEach((v) => allValues.push(v));
  }

  // Compute overall by averaging all stems per sample position
  const stemNames = Array.from(waveformData.keys());
  const sampleCount = waveformData.values().next().value?.length || 0;
  const overallData: number[] = [];
  for (let i = 0; i < sampleCount; i++) {
    let sum = 0;
    for (const name of stemNames) {
      sum += (waveformData.get(name)?.[i] || 0);
    }
    overallData.push(sum / stemNames.length);
  }

  return {
    overall: smooth(overallData),
    perStem: perStem as Record<StemName, Array<{ position: number; value: number }>>,
  };
}

/**
 * Extract all audio features from the current engine state.
 * Call during playback when stems are loaded.
 */
export async function extractAllFeatures(
  stemAnalysers: Map<StemName, AnalyserNode>,
  masterAnalyser: AnalyserNode | null,
  waveformData: Map<StemName, number[]>,
): Promise<AudioFeatures> {
  const spectralProfile = await extractAveragedSpectralProfile(
    stemAnalysers,
    masterAnalyser,
    10,
    200,
  );

  const energyTimeline = extractEnergyTimeline(waveformData);

  return { spectralProfile, energyTimeline };
}
