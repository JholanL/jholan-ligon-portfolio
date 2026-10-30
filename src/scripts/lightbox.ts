// Shared image viewer. Links marked data-lightbox="<group>" open here; without JS they open the image directly.
const dlg = document.querySelector<HTMLDialogElement>('[data-lb]');

if (dlg) {
  const img = dlg.querySelector<HTMLImageElement>('[data-lb-img]')!;
  const stage = dlg.querySelector<HTMLElement>('[data-lb-stage]')!;
  const count = dlg.querySelector<HTMLElement>('[data-lb-count]')!;
  const title = dlg.querySelector<HTMLElement>('[data-lb-title]')!;
  const caption = dlg.querySelector<HTMLElement>('[data-lb-caption]')!;
  const orig = dlg.querySelector<HTMLAnchorElement>('[data-lb-orig]')!;
  const prev = dlg.querySelector<HTMLButtonElement>('[data-lb-prev]')!;
  const next = dlg.querySelector<HTMLButtonElement>('[data-lb-next]')!;

  let items: HTMLAnchorElement[] = [];
  let index = 0;
  let opener: HTMLElement | null = null;

  const show = (i: number) => {
    index = (i + items.length) % items.length;
    const a = items[index];
    const thumb = a.querySelector('img');
    delete dlg.dataset.zoom;
    dlg.dataset.loading = '';
    img.classList.add('is-loading');
    img.alt = thumb?.alt ?? '';
    img.width = Number(a.dataset.w) || 0;
    img.height = Number(a.dataset.h) || 0;
    img.onload = () => {
      delete dlg.dataset.loading;
      img.classList.remove('is-loading');
    };
    img.src = a.href;
    title.textContent = a.dataset.title ?? '';
    caption.textContent = a.dataset.caption ?? (a.dataset.title ? '' : img.alt);
    count.textContent = items.length > 1 ? `${index + 1} / ${items.length}` : '';
    orig.href = a.href;
    prev.disabled = next.disabled = items.length < 2;
    // Warm the neighbours so arrowing through feels instant.
    [index - 1, index + 1].forEach((n) => {
      const nb = items[(n + items.length) % items.length];
      if (nb && nb !== a) new Image().src = nb.href;
    });
  };

  document.addEventListener('click', (e) => {
    const a = (e.target as Element).closest<HTMLAnchorElement>('a[data-lightbox]');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    const group = a.dataset.lightbox;
    // Only items that are rendered count (hidden tab panels are skipped).
    items = [...document.querySelectorAll<HTMLAnchorElement>(`a[data-lightbox="${group}"]`)].filter((el) => el.offsetParent !== null || el === a);
    opener = a;
    dlg.showModal();
    show(items.indexOf(a));
  });

  // A separate control can open an image: <a href="full.jpg" data-lb-open="#preview-link-id">.
  document.addEventListener('click', (e) => {
    const t = (e.target as Element).closest<HTMLElement>('[data-lb-open]');
    if (!t || (e as MouseEvent).metaKey || (e as MouseEvent).ctrlKey) return;
    const target = document.querySelector<HTMLAnchorElement>(t.dataset.lbOpen!);
    if (!target) return;
    e.preventDefault();
    target.click();
  });

  prev.addEventListener('click', () => show(index - 1));
  next.addEventListener('click', () => show(index + 1));
  dlg.querySelector('[data-lb-close]')!.addEventListener('click', () => dlg.close());
  dlg.addEventListener('close', () => {
    img.removeAttribute('src');
    opener?.focus({ preventScroll: true });
  });
  // Click on the dark area closes; click on the image toggles actual size.
  stage.addEventListener('click', (e) => {
    if (e.target === stage) dlg.close();
  });
  img.addEventListener('click', (e) => {
    if (img.naturalWidth <= stage.clientWidth && img.naturalHeight <= stage.clientHeight) return;
    if (dlg.dataset.zoom !== undefined) {
      delete dlg.dataset.zoom;
      return;
    }
    const r = img.getBoundingClientRect();
    const fx = (e.clientX - r.left) / r.width;
    const fy = (e.clientY - r.top) / r.height;
    dlg.dataset.zoom = '';
    requestAnimationFrame(() => {
      stage.scrollLeft = fx * img.scrollWidth - stage.clientWidth / 2;
      stage.scrollTop = fy * img.scrollHeight - stage.clientHeight / 2;
    });
  });
  dlg.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); show(index - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); show(index + 1); }
  });

  // Swipe between images on touch screens.
  let sx = 0, sy = 0, tracking = false;
  stage.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' || dlg.dataset.zoom !== undefined) return;
    tracking = true; sx = e.clientX; sy = e.clientY;
  });
  stage.addEventListener('pointerup', (e) => {
    if (!tracking) return;
    tracking = false;
    const dx = e.clientX - sx, dy = e.clientY - sy;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4) show(index + (dx < 0 ? 1 : -1));
  });
  stage.addEventListener('pointercancel', () => (tracking = false));
}

export {};
