// Custom film player. The markup ships with native controls; this swaps in the custom UI.
// Other parts of the page can drive a player with:
//   <button data-film-play="#player-id" data-t="12">   (scrolls to it, seeks, plays)

type Player = { root: HTMLElement; video: HTMLVideoElement; play: (t?: number) => void };
const players = new Map<HTMLElement, Player>();

const fmt = (s: number) => {
  s = Math.max(0, Math.floor(s || 0));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

function init(root: HTMLElement): Player {
  const existing = players.get(root);
  if (existing) return existing;

  const $ = <T extends Element>(s: string) => root.querySelector<T>(s)!;
  const video = $<HTMLVideoElement>('[data-film-video]');
  const stage = $<HTMLElement>('[data-film-stage]');
  const big = $<HTMLButtonElement>('[data-film-big]');
  const ui = $<HTMLElement>('[data-film-ui]');
  const toggle = $<HTMLButtonElement>('[data-film-toggle]');
  const seek = $<HTMLInputElement>('[data-film-seek]');
  const fill = $<HTMLElement>('[data-film-fill]');
  const buf = $<HTMLElement>('[data-film-buf]');
  const cur = $<HTMLElement>('[data-film-cur]');
  const mute = $<HTMLButtonElement>('[data-film-mute]');
  const vol = $<HTMLInputElement>('[data-film-vol]');
  const fs = $<HTMLButtonElement>('[data-film-fs]');
  const chapterBtns = [...root.querySelectorAll<HTMLButtonElement>('[data-film-seekto]')];
  const duration = () => (Number.isFinite(video.duration) ? video.duration : Number(seek.max));

  // Enhance: hide native controls, show ours.
  video.controls = false;
  big.hidden = false;
  ui.hidden = false;
  root.dataset.ready = '';
  ui.style.opacity = '0';
  ui.style.pointerEvents = 'none';

  const started = () => {
    big.style.opacity = '0';
    big.style.pointerEvents = 'none';
    big.tabIndex = -1;
    ui.style.opacity = '';
    ui.style.pointerEvents = '';
  };

  const play = (t?: number) => {
    if (typeof t === 'number') video.currentTime = t;
    // Pause any other film first.
    players.forEach((p) => p.video !== video && p.video.pause());
    started();
    void video.play().catch(() => {});
  };

  const render = () => {
    const d = duration() || 1;
    const p = (video.currentTime / d) * 100;
    fill.style.width = `${p}%`;
    if (document.activeElement !== seek) seek.value = String(video.currentTime);
    seek.setAttribute('aria-valuetext', `${fmt(video.currentTime)} of ${fmt(d)}`);
    cur.textContent = fmt(video.currentTime);
    let active = -1;
    chapterBtns.forEach((b, i) => { if (video.currentTime + 0.25 >= Number(b.dataset.filmSeekto)) active = i; });
    chapterBtns.forEach((b, i) => b.setAttribute('aria-current', String(i === active && (video.currentTime > 0 || !video.paused))));
  };

  video.addEventListener('timeupdate', render);
  video.addEventListener('progress', () => {
    if (video.buffered.length) buf.style.width = `${(video.buffered.end(video.buffered.length - 1) / (duration() || 1)) * 100}%`;
  });
  video.addEventListener('loadedmetadata', () => { seek.max = String(video.duration); render(); });
  video.addEventListener('play', () => { root.dataset.playing = ''; toggle.setAttribute('aria-label', 'Pause (Space)'); started(); wake(); });
  video.addEventListener('pause', () => { delete root.dataset.playing; delete root.dataset.idle; toggle.setAttribute('aria-label', 'Play (Space)'); });
  video.addEventListener('ended', () => { delete root.dataset.idle; });
  video.addEventListener('volumechange', () => {
    root.toggleAttribute('data-muted', video.muted || video.volume === 0);
    mute.setAttribute('aria-label', video.muted ? 'Unmute (M)' : 'Mute (M)');
    vol.value = String(video.muted ? 0 : video.volume);
  });

  big.addEventListener('click', () => play());
  toggle.addEventListener('click', () => (video.paused ? play() : video.pause()));
  video.addEventListener('click', () => (video.paused ? play() : video.pause()));
  seek.addEventListener('input', () => {
    video.currentTime = Number(seek.value);
    if (video.paused && video.readyState === 0) started();
    render();
  });
  mute.addEventListener('click', () => { video.muted = !video.muted; if (!video.muted && video.volume === 0) video.volume = 0.6; });
  vol.addEventListener('input', () => { video.volume = Number(vol.value); video.muted = video.volume === 0; });

  const toggleFs = () => {
    if (document.fullscreenElement) return void document.exitFullscreen();
    if (stage.requestFullscreen) return void stage.requestFullscreen().catch(() => {});
    const v = video as HTMLVideoElement & { webkitEnterFullscreen?: () => void };
    v.webkitEnterFullscreen?.(); // iOS Safari
  };
  fs.addEventListener('click', toggleFs);
  video.addEventListener('dblclick', toggleFs);

  chapterBtns.forEach((b) => b.addEventListener('click', () => play(Number(b.dataset.filmSeekto))));

  root.addEventListener('keydown', (e) => {
    const t = e.target as HTMLElement;
    if (t.closest('[data-film-chapters]') || (t instanceof HTMLInputElement && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key))) return;
    const k = e.key.toLowerCase();
    if (k === ' ' || k === 'k') { if (t.tagName === 'BUTTON' && k === ' ') return; e.preventDefault(); video.paused ? play() : video.pause(); }
    else if (k === 'arrowright' || k === 'l') { e.preventDefault(); video.currentTime = Math.min(duration(), video.currentTime + 5); }
    else if (k === 'arrowleft' || k === 'j') { e.preventDefault(); video.currentTime = Math.max(0, video.currentTime - 5); }
    else if (k === 'm') video.muted = !video.muted;
    else if (k === 'f') toggleFs();
    wake();
  });

  // Hide the controls while watching; any movement or focus brings them back.
  let idleTimer = 0;
  const wake = () => {
    delete root.dataset.idle;
    clearTimeout(idleTimer);
    if (!video.paused) idleTimer = window.setTimeout(() => {
      if (!root.matches(':focus-within') || document.activeElement === video) root.dataset.idle = '';
    }, 2600);
  };
  stage.addEventListener('pointermove', wake);
  stage.addEventListener('focusin', wake);

  const player = { root, video, play };
  players.set(root, player);
  return player;
}

document.querySelectorAll<HTMLElement>('[data-film]').forEach(init);

// Anything with data-film-play="#id" drives a player (storyboards, "play film" buttons).
document.addEventListener('click', (e) => {
  const trigger = (e.target as Element).closest<HTMLElement>('[data-film-play]');
  if (!trigger) return;
  const root = document.querySelector<HTMLElement>(trigger.dataset.filmPlay!);
  if (!root) return;
  e.preventDefault();
  const player = init(root);
  const dialog = root.closest('dialog');
  if (dialog && !dialog.open) dialog.showModal();
  else root.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
  player.play(trigger.dataset.t ? Number(trigger.dataset.t) : undefined);
  root.querySelector<HTMLElement>('[data-film-toggle]')?.focus({ preventScroll: true });
});

// Films stop when their dialog closes or when scrolled far out of view.
document.querySelectorAll('dialog').forEach((d) =>
  d.addEventListener('close', () => d.querySelectorAll('video').forEach((v) => v.pause())),
);
const offscreen = new IntersectionObserver((entries) => {
  entries.forEach((en) => { if (!en.isIntersecting) (en.target as HTMLVideoElement).pause(); });
});
players.forEach((p) => { if (!p.root.closest('dialog')) offscreen.observe(p.video); });

export {};
