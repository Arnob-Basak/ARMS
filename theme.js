// Run before the stylesheet so the saved theme is applied before the first paint.
(() => {
  const key = 'arms-theme';
  const system = window.matchMedia('(prefers-color-scheme: dark)');
  let preference = null;
  try { const saved = localStorage.getItem(key); if (saved === 'dark' || saved === 'light') preference = saved; } catch { /* Theme still works when storage is unavailable. */ }
  function updateControls() {
    const dark = document.documentElement.dataset.theme === 'dark';
    document.querySelectorAll('[data-theme-toggle]').forEach(button => {
      const label = `Switch to ${dark ? 'light' : 'dark'} mode`;
      button.setAttribute('aria-label', label);
      button.setAttribute('aria-pressed', String(dark));
      button.title = label;
      const text = button.querySelector('.theme-label');
      if (text) text.textContent = dark ? 'Light' : 'Dark';
    });
  }
  function apply() {
    const theme = preference || (system.matches ? 'dark' : 'light');
    document.documentElement.dataset.theme = theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = theme === 'dark' ? '#0c1721' : '#edf2f5';
    updateControls();
  }
  apply();
  document.addEventListener('DOMContentLoaded', updateControls);
  document.addEventListener('click', event => {
    if (!event.target.closest('[data-theme-toggle]')) return;
    preference = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem(key, preference); } catch { /* Keep the selected mode for this page. */ }
    apply();
  });
  system.addEventListener('change', () => { if (!preference) apply(); });
  window.addEventListener('storage', event => {
    if (event.key !== key && event.key !== null) return;
    preference = event.newValue === 'light' || event.newValue === 'dark' ? event.newValue : null;
    apply();
  });
})();
