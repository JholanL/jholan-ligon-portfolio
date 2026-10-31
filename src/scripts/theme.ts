// Light / Dark / System theme. The inline script in Base.astro applies the stored choice before
// first paint; this module handles the toggles, persistence and following the OS in "system".
type Pref = 'light' | 'dark' | 'system';
const KEY = 'theme';
const root = document.documentElement;
const media = matchMedia('(prefers-color-scheme: light)');

const read = (): Pref => {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'light' || v === 'dark' ? v : 'system';
  } catch {
    return 'system';
  }
};
const resolve = (p: Pref) => (p === 'system' ? (media.matches ? 'light' : 'dark') : p);

const apply = (pref: Pref, animate: boolean) => {
  const theme = resolve(pref);
  const changed = root.dataset.theme !== theme;
  if (animate && changed && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    root.classList.add('theme-switching');
    setTimeout(() => root.classList.remove('theme-switching'), 320);
  }
  root.dataset.theme = theme;
  root.dataset.themePref = pref;
  root.style.colorScheme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'light' ? '#f6f2ec' : '#0e0d0f');
  document.querySelectorAll<HTMLButtonElement>('[data-theme-set]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.themeSet === pref)));
  if (changed) dispatchEvent(new CustomEvent('themechange', { detail: { theme, pref } }));
};

document.addEventListener('click', (e) => {
  const b = (e.target as Element).closest<HTMLButtonElement>('[data-theme-set]');
  if (!b) return;
  const pref = b.dataset.themeSet as Pref;
  try {
    if (pref === 'system') localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, pref);
  } catch {
    /* storage blocked: the choice still applies for this page */
  }
  apply(pref, true);
});

// In "system", follow the OS live.
media.addEventListener('change', () => { if (read() === 'system') apply('system', true); });
// Another tab changed the choice.
addEventListener('storage', (e) => { if (e.key === KEY) apply(read(), true); });

apply(read(), false);

export {};
