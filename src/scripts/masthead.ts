// The name responds to the pointer: letters nearest the cursor narrow and lighten,
// like type under a magnifier. Desktop pointers only; off for reduced motion.
const word = document.querySelector<HTMLElement>('[data-vf]');
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

if (word && fine && !reduced) {
  const chars = [...word.querySelectorAll<HTMLElement>('.mast__ch')];
  const state = chars.map(() => ({ w: 125, g: 800 }));
  let px = -9999, py = -9999, raf = 0, active = false;

  // Wait for the entrance animation to finish before taking over.
  setTimeout(() => {
    chars.forEach((c) => (c.style.animation = 'none'));
    active = true;
  }, 1900);

  const tick = () => {
    let moving = false;
    chars.forEach((c, i) => {
      const r = c.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const d = Math.hypot(px - cx, (py - cy) * 1.4);
      const f = Math.max(0, 1 - d / 420); // 0 far … 1 on top
      const tw = 125 - f * 55, tg = 800 - f * 520;
      const s = state[i];
      s.w += (tw - s.w) * 0.12;
      s.g += (tg - s.g) * 0.12;
      if (Math.abs(tw - s.w) > 0.3 || Math.abs(tg - s.g) > 1) moving = true;
      c.style.setProperty('--w', s.w.toFixed(1));
      c.style.setProperty('--g', s.g.toFixed(0));
    });
    raf = moving ? requestAnimationFrame(tick) : 0;
  };
  const kick = () => { if (active && !raf) raf = requestAnimationFrame(tick); };

  addEventListener('pointermove', (e) => { px = e.clientX; py = e.clientY; kick(); }, { passive: true });
  document.documentElement.addEventListener('pointerleave', () => { px = py = -9999; kick(); });
  addEventListener('scroll', kick, { passive: true });
}

export {};
