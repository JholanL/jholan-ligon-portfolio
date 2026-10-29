// Site-wide behaviour: reveals, the header that takes on each room's lighting, and cover morphs.

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Reveal on scroll ------------------------------------------------------ */
const revealables = document.querySelectorAll<HTMLElement>('[data-reveal]');
if (reduced || !('IntersectionObserver' in window)) {
  revealables.forEach((el) => el.classList.add('is-in'));
} else {
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    }),
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
  );
  revealables.forEach((el) => io.observe(el));
}

/* Header: lighting follows the room under it --------------------------- */
const hdr = document.querySelector<HTMLElement>('[data-hdr]');
if (hdr) {
  const rooms = [...document.querySelectorAll<HTMLElement>('[data-room], [data-header-theme]')];
  const apply = (el: HTMLElement | null) => {
    const cs = el ? getComputedStyle(el) : null;
    const pick = (v: string, fallback: string) => (cs?.getPropertyValue(v).trim() || fallback);
    hdr.style.setProperty('--hdr-bg', pick('--bg', '#0e0d0f'));
    hdr.style.setProperty('--hdr-fg', pick('--fg', '#eee8e1'));
  };
  // The room crossing a thin line just under the header wins.
  const line = new IntersectionObserver(
    (entries) => {
      const hit = entries.filter((e) => e.isIntersecting).map((e) => e.target as HTMLElement);
      if (hit.length) apply(hit[hit.length - 1]);
    },
    { rootMargin: `-${32}px 0px -${Math.max(0, innerHeight - 34)}px 0px` },
  );
  rooms.forEach((r) => line.observe(r));
  apply(null);

  let lastY = scrollY;
  let ticking = false;
  addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = scrollY;
      hdr.toggleAttribute('data-scrolled', y > 24);
      // Step out of the way when reading downwards; come back on any upward scroll.
      if (!document.querySelector('dialog[open]')) hdr.toggleAttribute('data-hidden', y > 480 && y > lastY + 4);
      if (y < lastY - 4 || y < 480) hdr.removeAttribute('data-hidden');
      lastY = y;
      ticking = false;
    });
  }, { passive: true });
}

/* Cover morph between pages -------------------------------------------- */
// Links with data-vt="<name>" give the matching [data-vt-src="<name>"] element a
// view-transition-name just before navigating, so it morphs into the next page's hero.
document.addEventListener('click', (e) => {
  const a = (e.target as Element).closest<HTMLAnchorElement>('a[data-vt]');
  if (!a) return;
  document.querySelectorAll<HTMLElement>('[style*="view-transition-name"]').forEach((el) => {
    if (el.dataset.vtSrc) el.style.viewTransitionName = '';
  });
  const src = a.closest('[data-vt-scope]')?.querySelector<HTMLElement>(`[data-vt-src="${a.dataset.vt}"]`)
    ?? document.querySelector<HTMLElement>(`[data-vt-src="${a.dataset.vt}"]`);
  if (src) src.style.viewTransitionName = a.dataset.vt!;
});
// Restore from bfcache without stale names.
addEventListener('pageshow', (e) => {
  if ((e as PageTransitionEvent).persisted) document.querySelectorAll<HTMLElement>('[data-vt-src]').forEach((el) => (el.style.viewTransitionName = ''));
});

export {};
