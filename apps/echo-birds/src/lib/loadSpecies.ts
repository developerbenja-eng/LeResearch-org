import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import type { Species } from './types';

const SPECIES_DIR = path.join(process.cwd(), 'content/species');

function markdownToBasicHtml(md: string): string {
  // Minimal MD→HTML for body text. Headings, bold, italic, lists, links.
  // Full markdown rendering is handled by react-markdown on the client.
  return md
    .replace(/^### (.*)$/gm, '<h3>$1</h3>')
    .replace(/^## (.*)$/gm, '<h2>$1</h2>')
    .replace(/^# (.*)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>');
}

let _cache: Species[] | null = null;

export function loadAllSpecies(): Species[] {
  if (_cache) return _cache;

  if (!fs.existsSync(SPECIES_DIR)) {
    console.warn(`[birds] Species directory not found: ${SPECIES_DIR}`);
    return [];
  }

  const files = fs
    .readdirSync(SPECIES_DIR)
    .filter((f) => f.endsWith('.md'));

  const species: Species[] = files.map((filename) => {
    const filePath = path.join(SPECIES_DIR, filename);
    const raw = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(raw);
    const slug = filename.replace(/\.md$/, '');

    return {
      id: data.id ?? slug,
      slug,
      commonName: data.commonName ?? slug,
      scientificName: data.scientificName ?? '',
      family: data.family ?? '',
      aliases: data.aliases ?? [],
      status: data.status ?? 'year-round',
      memphisMonths: data.memphisMonths ?? [],
      peakMonths: data.peakMonths ?? [],
      arrivalWeek: data.arrivalWeek ?? null,
      departureWeek: data.departureWeek ?? null,
      abundance: data.abundance ?? 'common',
      sizeInches: data.sizeInches ?? 0,
      sizeReference: data.sizeReference ?? 'sparrow',
      dimorphic: data.dimorphic ?? false,
      habitats: data.habitats ?? [],
      memphisHotspots: data.memphisHotspots ?? [],
      diet: data.diet ?? [],
      feederFavorites: data.feederFavorites,
      similarSpecies: data.similarSpecies ?? [],
      tags: data.tags ?? [],
      photoUrl: data.photoUrl,
      audioSongUrl: data.audioSongUrl,
      audioCallUrl: data.audioCallUrl,
      contentHtml: markdownToBasicHtml(content),
      contentMarkdown: content,
    };
  });

  species.sort((a, b) => a.commonName.localeCompare(b.commonName));
  _cache = species;
  return species;
}

export function getSpeciesBySlug(slug: string): Species | undefined {
  return loadAllSpecies().find((s) => s.slug === slug);
}

export function getSpeciesByIds(ids: string[]): Species[] {
  const all = loadAllSpecies();
  return ids
    .map((id) => all.find((s) => s.id === id || s.slug === id))
    .filter((s): s is Species => Boolean(s));
}
