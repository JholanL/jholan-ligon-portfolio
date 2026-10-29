import { getCollection, type CollectionEntry } from 'astro:content';

export type Project = CollectionEntry<'projects'>;
export type Theme = Project['data']['theme'];

export async function getProjects(): Promise<Project[]> {
  const all = await getCollection('projects');
  return all.sort((a, b) => a.data.order - b.data.order);
}

/** Inline CSS custom properties that turn an element with `.themed` into a product room. */
export function themeVars(t: Theme): string {
  return [
    `--t-bg:${t.bg}`,
    `--t-surface:${t.surface}`,
    `--t-ink:${t.ink}`,
    `--t-muted:${t.muted}`,
    `--t-line:${t.line}`,
    `--t-accent:${t.accent}`,
    `--t-accent-text:${t.accentText}`,
    `--t-on-accent:${t.onAccent}`,
    t.highlight ? `--t-hl:${t.highlight}` : '',
    `--t-font:${t.font}`,
  ]
    .filter(Boolean)
    .join(';');
}

export function formatTime(sec: number): string {
  const s = Math.max(0, Math.round(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export const pad = (n: number) => String(n).padStart(2, '0');
