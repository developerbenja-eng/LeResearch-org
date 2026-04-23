import part0 from '../../../../scripts/rethinking-podcast/transcripts/part-0.json';
import part1 from '../../../../scripts/rethinking-podcast/transcripts/part-1.json';
import part2 from '../../../../scripts/rethinking-podcast/transcripts/part-2.json';
import part3 from '../../../../scripts/rethinking-podcast/transcripts/part-3.json';
import part4 from '../../../../scripts/rethinking-podcast/transcripts/part-4.json';
import part5 from '../../../../scripts/rethinking-podcast/transcripts/part-5.json';
import part6 from '../../../../scripts/rethinking-podcast/transcripts/part-6.json';
import part7 from '../../../../scripts/rethinking-podcast/transcripts/part-7.json';
import part8 from '../../../../scripts/rethinking-podcast/transcripts/part-8.json';

export interface TranscriptLine {
  speaker: 'Rain' | 'Flow' | string;
  text: string;
}

export interface Transcript {
  id: string;
  title: string;
  lines: TranscriptLine[];
}

const ALL: Transcript[] = [part0, part1, part2, part3, part4, part5, part6, part7, part8] as Transcript[];

export const TRANSCRIPTS: Record<string, Transcript> = Object.fromEntries(
  ALL.map((t) => [t.id, t]),
);

export function getTranscript(id: string): Transcript | undefined {
  return TRANSCRIPTS[id];
}
