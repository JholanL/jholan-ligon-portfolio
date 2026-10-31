// "Ask about Jholan": a search assistant over /assistant.json (see src/data/knowledge.ts).
// It is not an AI model: it ranks pre-written, verified answers. Nothing typed leaves the browser.
type Link = { label: string; href: string };
type Entry = { id: string; title: string; keywords: string[]; project?: string; aspect?: string; answer: string; links?: Link[] };
type KB = { projectNames: Record<string, string[]>; entries: Entry[] };

const MAX_LEN = 300;
const STOP = new Set('a an the is are was were be been of to in on for and or with at by from as it its this that these those does do did has have had can could would should will i me my you your we us please tell show give know about what whats which who whom how much many any some there their them they he she his her jholan jholans ligon'.split(' '));
// Words that appear in many questions count for less than specific ones ("backend", "independently").
const GENERIC = new Set(['project', 'work', 'built', 'build', 'made', 'creat', 'develop', 'development', 'experience', 'use', 'know', 'app', 'application']);
const ASPECT_WORDS: Record<string, string[]> = {
  contribution: ['contribute', 'contribution', 'contributed', 'role', 'part', 'responsible', 'responsibilit', 'did', 'work on', 'own'],
  tech: ['tech', 'stack', 'built with', 'language', 'framework', 'tool', 'database', 'built using', 'made with'],
  status: ['status', 'finished', 'complete', 'deployed', 'live', 'published'],
};

const norm = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’']/g, '').replace(/[^a-z0-9+#.\s-]/g, ' ').replace(/\s+/g, ' ').trim();
const stem = (t: string) => (t.length > 4 ? t.replace(/(ies)$/, 'y').replace(/(ing|ed|es|s)$/, '') : t);
const tokens = (s: string) => norm(s).split(/[\s-]+/).filter((t) => t && !STOP.has(t)).map(stem);

function search(kb: KB, q: string): { best?: Entry; score: number; project?: string } {
  const nq = ` ${norm(q)} `;
  const qt = new Set(tokens(q));
  const project = Object.entries(kb.projectNames).find(([, names]) => names.some((n) => nq.includes(` ${n} `) || nq.includes(` ${n}`)))?.[0];
  const aspect = Object.entries(ASPECT_WORDS).find(([, ws]) => ws.some((w) => nq.includes(w)))?.[0];
  let best: Entry | undefined;
  let bestScore = 0;
  for (const e of kb.entries) {
    let s = 0;
    const kwTokens = new Set<string>();
    for (const k of e.keywords) {
      if (k.includes(' ') && nq.includes(` ${k} `)) s += 3;
      tokens(k).forEach((t) => kwTokens.add(t));
    }
    qt.forEach((t) => { if (kwTokens.has(t)) s += GENERIC.has(t) ? 1 : 2; });
    tokens(e.title).forEach((t) => { if (qt.has(t)) s += 1; });
    if (project) {
      if (e.project === project) s += 4 + (e.aspect === (aspect ?? 'overview') ? 3 : 0);
      else if (e.project) s -= 10;
    } else if (e.project) {
      s -= 3; // project-specific answers need the project named
    }
    if (s > bestScore) { bestScore = s; best = e; }
  }
  return { best: bestScore >= 3 ? best : undefined, score: bestScore, project };
}

const root = document.querySelector<HTMLElement>('[data-ask]');
if (root) {
  const fab = root.querySelector<HTMLButtonElement>('[data-ask-open]')!;
  const panel = root.querySelector<HTMLElement>('#ask-panel')!;
  const log = root.querySelector<HTMLElement>('[data-ask-log]')!;
  const form = root.querySelector<HTMLFormElement>('[data-ask-form]')!;
  const input = root.querySelector<HTMLInputElement>('#ask-input')!;
  const suggest = root.querySelector<HTMLElement>('[data-ask-suggest]')!;
  const status = root.querySelector<HTMLElement>('[data-ask-status]')!;
  const mobile = matchMedia('(max-width: 640px)');
  let kb: KB | null = null;
  let loading: Promise<KB | null> | null = null;

  const load = () =>
    (loading ??= fetch('/assistant.json', { headers: { Accept: 'application/json' } })
      .then((r) => (r.ok ? (r.json() as Promise<KB>) : Promise.reject(new Error(String(r.status)))))
      .then((d) => (kb = d))
      .catch(() => { loading = null; return null; }));

  const scrollEnd = () => log.scrollTo({ top: log.scrollHeight, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });

  const bubble = (who: 'you' | 'bot', text: string, extra?: { links?: Link[]; source?: string; followups?: string[] }) => {
    const m = document.createElement('div');
    m.className = `ask__msg ask__msg--${who}`;
    const label = document.createElement('p');
    label.className = 'visually-hidden';
    label.textContent = who === 'you' ? 'You asked:' : 'Answer:';
    m.append(label);
    text.split('\n').forEach((line) => {
      const p = document.createElement('p');
      p.textContent = line;
      if (line.startsWith('• ')) p.className = 'ask__li';
      m.append(p);
    });
    if (extra?.links?.length) {
      const ul = document.createElement('ul');
      ul.className = 'ask__links';
      ul.setAttribute('role', 'list');
      for (const l of extra.links) {
        if (!/^(\/|mailto:|https:\/\/)/.test(l.href)) continue;
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = l.href;
        a.textContent = l.label;
        if (l.href.startsWith('https://') || l.href.endsWith('.pdf')) { a.target = '_blank'; a.rel = 'noopener'; }
        li.append(a);
        ul.append(li);
      }
      m.append(ul);
    }
    if (extra?.source) {
      const s = document.createElement('p');
      s.className = 'ask__source';
      s.textContent = `Matched: ${extra.source}`;
      m.append(s);
    }
    log.append(m);
    while (log.children.length > 40) log.firstElementChild?.remove();
    if (extra?.followups) setSuggestions(extra.followups);
    scrollEnd();
  };

  const setSuggestions = (qs: string[]) => {
    suggest.replaceChildren(...qs.map((q) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'ask__chip';
      b.textContent = q;
      b.addEventListener('click', () => ask(q));
      return b;
    }));
  };
  const DEFAULT_SUGGESTIONS = [...suggest.querySelectorAll('button')].map((b) => b.textContent ?? '');
  suggest.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => ask(b.textContent ?? '')));

  const followupsFor = (e: Entry, project?: string): string[] => {
    if (e.project || project) {
      const p = e.project ?? project!;
      const name = kb!.entries.find((x) => x.id === `${p}-overview`)?.title ?? p;
      const all = [`What did Jholan contribute to ${name}?`, `What technology does ${name} use?`, `Tell me about ${name}`];
      return all.filter((q) => !q.toLowerCase().includes(e.aspect === 'contribution' ? 'contribute' : e.aspect === 'tech' ? 'technology' : 'tell me')).concat('How can I contact Jholan?');
    }
    return DEFAULT_SUGGESTIONS.filter((q) => !q.toLowerCase().includes(e.title.toLowerCase().split(' ')[0])).slice(0, 4);
  };

  async function ask(raw: string) {
    const q = raw.replace(/\s+/g, ' ').trim().slice(0, MAX_LEN);
    if (!q) return;
    bubble('you', q);
    input.value = '';
    const data = kb ?? (await load());
    if (!data) {
      bubble('bot', `I couldn't load the answers just now. Please try again, or use the Contact section: ${'ligonjholan04@gmail.com'}.`, { links: [{ label: 'Contact section', href: '/#contact' }] });
      return;
    }
    const nq = norm(q);
    if (/^(hi|hello|hey|good (morning|afternoon|evening)|kumusta|kamusta|yo)\b/.test(nq) && nq.split(' ').length <= 4) {
      bubble('bot', 'Hello! Ask me about Jholan’s projects, skills, education, certificates, internship availability or contact details.', { followups: DEFAULT_SUGGESTIONS });
      return;
    }
    if (/^(thanks|thank you|ty|salamat)\b/.test(nq)) {
      bubble('bot', 'You’re welcome. You can also reach Jholan directly from the Contact section.', { links: [{ label: 'Contact section', href: '/#contact' }] });
      return;
    }
    const { best, project } = search(data, q);
    if (!best) {
      bubble('bot', 'I don’t have verified information about that, so I won’t guess. I can answer questions about Jholan’s projects and contributions, skills, education and honors, certificates, internship availability and contact details.', { followups: DEFAULT_SUGGESTIONS });
      return;
    }
    bubble('bot', best.answer, { links: best.links, source: best.title, followups: followupsFor(best, project) });
  }

  form.addEventListener('submit', (e) => { e.preventDefault(); void ask(input.value); });

  /* Open / close ------------------------------------------------------- */
  const fitViewport = () => {
    if (!mobile.matches || panel.hidden || !window.visualViewport) { panel.style.removeProperty('height'); panel.style.removeProperty('top'); return; }
    const vv = window.visualViewport;
    panel.style.height = `${vv.height}px`;
    panel.style.top = `${vv.offsetTop}px`;
  };
  const open = () => {
    panel.hidden = false;
    root.dataset.open = '';
    fab.setAttribute('aria-expanded', 'true');
    void load().then((d) => { status.textContent = d ? '' : 'Answers are unavailable right now.'; });
    fitViewport();
    requestAnimationFrame(() => input.focus({ preventScroll: true }));
  };
  const close = () => {
    panel.hidden = true;
    delete root.dataset.open;
    fab.setAttribute('aria-expanded', 'false');
    fitViewport();
    fab.focus({ preventScroll: true });
  };
  fab.addEventListener('click', () => (panel.hidden ? open() : close()));
  root.querySelector('[data-ask-close]')!.addEventListener('click', close);
  panel.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.preventDefault(); close(); } });
  window.visualViewport?.addEventListener('resize', fitViewport);
  window.visualViewport?.addEventListener('scroll', fitViewport);
  // Compact trigger once the visitor scrolls past the first screen.
  const compact = () => root.toggleAttribute('data-compact', scrollY > innerHeight * 0.6);
  addEventListener('scroll', compact, { passive: true });
  compact();
  // Other links can open it: <a href="#ask" data-ask-trigger>
  document.addEventListener('click', (e) => {
    const t = (e.target as Element).closest('[data-ask-trigger]');
    if (!t) return;
    e.preventDefault();
    open();
  });
}

export {};
