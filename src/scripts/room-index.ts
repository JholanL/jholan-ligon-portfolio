// Room index: hovering or focusing a row lights it and switches the projector to that product.
// Preview loops are real footage; they load only on first hover and never on reduced motion / Save-Data.
const list = document.querySelector<HTMLElement>('[data-idx]');
const projector = document.querySelector<HTMLElement>('[data-projector]');

if (list && projector) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
  const slides = new Map([...projector.querySelectorAll<HTMLElement>('[data-slide]')].map((s) => [s.dataset.slide!, s]));
  let current = '';

  const light = (id: string) => {
    if (id === current) return;
    current = id;
    list.querySelectorAll<HTMLElement>('[data-idx-row]').forEach((r) => r.toggleAttribute('data-lit', r.dataset.idxRow === id));
    slides.forEach((s, key) => {
      const on = key === id;
      s.toggleAttribute('data-active', on);
      const v = s.querySelector<HTMLVideoElement>('video');
      if (!v) return;
      if (on && !reduced && !saveData) {
        if (!v.src) v.src = v.dataset.src!;
        v.play().then(() => v.setAttribute('data-playing', '')).catch(() => {});
      } else {
        v.pause();
      }
    });
  };

  list.querySelectorAll<HTMLElement>('[data-idx-row]').forEach((row) => {
    const id = row.dataset.idxRow!;
    row.addEventListener('pointerenter', () => light(id));
    row.addEventListener('focusin', () => light(id));
  });
  list.addEventListener('pointerleave', () => {
    list.querySelectorAll('[data-lit]').forEach((r) => r.removeAttribute('data-lit'));
    projector.querySelectorAll('video').forEach((v) => v.pause());
    current = '';
  });

  // Stop the projector when it scrolls away.
  new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) projector.querySelectorAll('video').forEach((v) => v.pause());
  }).observe(projector);
}

export {};
