// Horizontal galleries: arrow buttons, a progress bar, and mouse drag-to-scroll.
// Touch swipe and keyboard scrolling (focus the track, use arrow keys) are native.
document.querySelectorAll<HTMLElement>('[data-rail]').forEach((rail) => {
  const track = rail.querySelector<HTMLElement>('[data-rail-track]')!;
  const prev = rail.querySelector<HTMLButtonElement>('[data-rail-prev]')!;
  const next = rail.querySelector<HTMLButtonElement>('[data-rail-next]')!;
  const bar = rail.querySelector<HTMLElement>('[data-rail-progress]')!;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const step = () => {
    const item = track.querySelector<HTMLElement>('.rail__item');
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    return item ? item.offsetWidth + gap : track.clientWidth * 0.8;
  };
  const update = () => {
    const max = track.scrollWidth - track.clientWidth;
    const p = max > 0 ? track.scrollLeft / max : 1;
    const visible = track.scrollWidth > 0 ? track.clientWidth / track.scrollWidth : 1;
    bar.style.setProperty('--p', String(Math.min(1, visible + p * (1 - visible))));
    prev.disabled = track.scrollLeft < 4;
    next.disabled = track.scrollLeft > max - 4;
  };
  const go = (dir: number) => track.scrollBy({ left: dir * step(), behavior: reduced ? 'auto' : 'smooth' });

  prev.addEventListener('click', () => go(-1));
  next.addEventListener('click', () => go(1));
  track.addEventListener('scroll', update, { passive: true });
  addEventListener('resize', update);
  update();

  // Mouse drag. A drag of more than a few pixels does not count as a click.
  let down = false, startX = 0, startLeft = 0, moved = 0;
  track.addEventListener('pointerdown', (e) => {
    moved = 0;
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    down = true; startX = e.clientX; startLeft = track.scrollLeft;
  });
  addEventListener('pointermove', (e) => {
    if (!down) return;
    const dx = e.clientX - startX;
    moved = Math.max(moved, Math.abs(dx));
    if (moved > 6) {
      track.dataset.dragging = '';
      track.scrollLeft = startLeft - dx;
    }
  });
  addEventListener('pointerup', () => {
    if (!down) return;
    down = false;
    if (track.dataset.dragging !== undefined) {
      delete track.dataset.dragging;
      // Let snap settle on the nearest item.
      const s = step();
      track.scrollTo({ left: Math.round(track.scrollLeft / s) * s, behavior: reduced ? 'auto' : 'smooth' });
    }
  });
  track.addEventListener('click', (e) => { if (moved > 6) { e.preventDefault(); e.stopPropagation(); } }, true);
});

export {};
