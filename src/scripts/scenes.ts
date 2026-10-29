// Scrollytelling: the scene crossing the middle of the viewport picks the phone shown on the sticky stage.
document.querySelectorAll<HTMLElement>('[data-scenes]').forEach((root) => {
  const scenes = [...root.querySelectorAll<HTMLElement>('[data-scene]')];
  const frames = [...root.querySelectorAll<HTMLElement>('[data-frame]')];
  const activate = (i: number) => {
    scenes.forEach((s, n) => s.toggleAttribute('data-active', n === i));
    frames.forEach((f, n) => f.toggleAttribute('data-active', n === i));
  };
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => { if (e.isIntersecting) activate(Number((e.target as HTMLElement).dataset.scene)); }),
    { rootMargin: '-45% 0px -45% 0px' },
  );
  scenes.forEach((s) => io.observe(s));
  activate(0);
});

export {};
