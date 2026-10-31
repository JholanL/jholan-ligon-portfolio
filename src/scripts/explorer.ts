// Selected Work explorer: hover, focus or arrow keys choose which project the preview shows.
// Only the active preview loop plays, and only when the stage is on screen and motion is allowed.
const ex = document.querySelector<HTMLElement>('[data-explorer]');
if (ex) {
  const items = [...ex.querySelectorAll<HTMLElement>('[data-ex-item]')];
  const slides = new Map([...ex.querySelectorAll<HTMLElement>('[data-ex-slide]')].map((s) => [s.dataset.exSlide!, s]));
  const stage = ex.querySelector<HTMLElement>('[data-ex-stage]')!;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
  const desktop = matchMedia('(min-width: 901px)');
  let current = items[0]?.dataset.exItem ?? '';
  let onScreen = false;

  const sync = () => {
    slides.forEach((s, id) => {
      const on = id === current;
      s.toggleAttribute('data-active', on);
      s.inert = !on;
      const v = s.querySelector<HTMLVideoElement>('video');
      if (!v) return;
      if (on && onScreen && desktop.matches && !reduced && !saveData) {
        if (!v.src) v.src = v.dataset.src!;
        v.play().then(() => v.setAttribute('data-playing', '')).catch(() => {});
      } else {
        v.pause();
      }
    });
  };
  const activate = (id: string) => {
    if (id === current) return;
    current = id;
    items.forEach((it) => it.toggleAttribute('data-active', it.dataset.exItem === id));
    sync();
  };

  items.forEach((it, i) => {
    const id = it.dataset.exItem!;
    const a = it.querySelector<HTMLAnchorElement>('a')!;
    it.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') activate(id); });
    a.addEventListener('focus', () => activate(id));
    a.addEventListener('keydown', (e) => {
      const n = e.key === 'ArrowDown' ? i + 1 : e.key === 'ArrowUp' ? i - 1 : null;
      if (n === null || !desktop.matches) return;
      e.preventDefault();
      items[(n + items.length) % items.length].querySelector('a')!.focus();
    });
  });

  new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; sync(); }, { threshold: 0.35 }).observe(stage);
  desktop.addEventListener('change', sync);
}

export {};
