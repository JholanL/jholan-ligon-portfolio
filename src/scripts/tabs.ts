// Accessible tabs: [data-tabs] wraps [role=tab] buttons whose aria-controls point at [role=tabpanel]s.
document.querySelectorAll<HTMLElement>('[data-tabs]').forEach((root) => {
  const tabs = [...root.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
  const select = (tab: HTMLButtonElement, focus = false) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      const panel = document.getElementById(t.getAttribute('aria-controls')!);
      if (panel) {
        panel.hidden = !on;
        panel.toggleAttribute('data-active', on);
      }
    });
    root.style.setProperty('--tab-i', String(tabs.indexOf(tab)));
    if (focus) tab.focus();
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(t));
    t.addEventListener('keydown', (e) => {
      const n = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : null;
      if (n === null) return;
      e.preventDefault();
      select(tabs[(n + tabs.length) % tabs.length], true);
    });
  });
});

export {};
