// Shared theme helper for SSSuite
(function(){
  const KEY = 'appTheme';
  let currentTheme = null;
  let listenersBound = false;

  function _notify(theme) {
    try {
      const ev = new CustomEvent('sssuite-theme-changed', { detail: { theme } });
      window.dispatchEvent(ev);
    } catch (_) {}
    try {
      if (typeof window.SSSuiteTheme === 'object' && typeof window.SSSuiteTheme.onChange === 'function') {
        window.SSSuiteTheme.onChange(theme);
      }
    } catch (_) {}
  }

  function setTheme(theme) {
    const themeValue = (theme === 'dark') ? 'dark' : 'light';
    const hasChanged = themeValue !== currentTheme;
    currentTheme = themeValue;

    try { document.documentElement.setAttribute('data-theme', themeValue); } catch(_) {}
    // Maintain legacy compatibility: many pages use body.dark-mode
    try { document.body.classList.toggle('dark-mode', themeValue === 'dark'); } catch(_) {}

    // Update modern toggles if present
    try { document.querySelectorAll('#themeToggle').forEach(t => { t.checked = (themeValue === 'dark'); }); } catch(_) {}
    try { document.querySelectorAll('#themeText').forEach(l => { l.textContent = (themeValue === 'dark') ? 'Dark Mode' : 'Light Mode'; }); } catch(_) {}

    // Update legacy Allocation Buddy toggle elements if present
    try {
      const toggleSwitch = document.getElementById('toggleSwitch');
      if (toggleSwitch) toggleSwitch.classList.toggle('active', themeValue === 'dark');
      const modeIcon = document.getElementById('modeIcon');
      if (modeIcon) modeIcon.textContent = themeValue === 'dark' ? 'dYOT' : '�~?�,?';
    } catch(_) {}

    // Update any standardized switch knobs across pages (sun/moon emoji)
    try {
      document.querySelectorAll('.switch-knob').forEach(k => {
        try { k.textContent = (themeValue === 'dark') ? 'dYOT' : '�~?�,?'; } catch(_) {}
      });
    } catch(_) {}

    try { localStorage.setItem(KEY, themeValue); } catch(_) {}
    if (hasChanged) _notify(themeValue);
  }

  function toggleTheme() {
    const current = currentTheme ?? document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    setTheme(next);
  }

  function initTheme() {
    let themeToApply = 'dark';
    try {
      const saved = localStorage.getItem(KEY);
      if (saved) {
        themeToApply = saved;
      }
    } catch (_) {}

    setTheme(themeToApply);

    if (listenersBound) {
      return;
    }
    listenersBound = true;

    // Attach listeners to modern toggles: set theme based on the checkbox state (checked => dark)
    try {
      document.querySelectorAll('#themeToggle').forEach(el => {
        el.addEventListener('change', (e) => {
          try { setTheme(e.target.checked ? 'dark' : 'light'); } catch(_) {}
        });
      });
    } catch(_) {}

    // Attach to legacy Allocation Buddy toggle element: toggle theme and sync modern checkboxes
    try {
      const ts = document.getElementById('toggleSwitch');
      if (ts) {
        ts.addEventListener('click', () => {
          try {
            toggleTheme();
            document.querySelectorAll('#themeToggle').forEach(t => {
              t.checked = document.documentElement.getAttribute('data-theme') === 'dark';
            });
          } catch(_) {}
        });
      }
    } catch(_) {}
  }

  // Utility: read CSS custom property value
  function cssVar(name, fallback) {
    try {
      const v = getComputedStyle(document.documentElement).getPropertyValue(name);
      return (v || '').toString().trim() || (fallback || '');
    } catch (_) { return (fallback || ''); }
  }

  // Utility: convert a hex color (or a resolved css var) to rgba string with alpha
  function hexToRgba(hex, alpha = 1) {
    try {
      if (!hex) return `rgba(0,0,0,${alpha})`;
      hex = String(hex).trim();
      // Resolve css var token strings like 'var(--accent)'
      if (hex.startsWith('var(')) {
        const inner = hex.slice(4, -1).trim();
        hex = cssVar(inner, '');
      }
      if (hex[0] === '#') {
        let h = hex.slice(1);
        if (h.length === 3) h = h.split('').map(c => c + c).join('');
        if (h.length !== 6) return `rgba(0,0,0,${alpha})`;
        const int = parseInt(h, 16);
        const r = (int >> 16) & 255;
        const g = (int >> 8) & 255;
        const b = int & 255;
        return `rgba(${r}, ${g}, ${b}, ${Number(alpha)})`;
      }
      // If already an rgba/hsla/keyword, return as-is
      return hex;
    } catch (_) { return `rgba(0,0,0,${alpha})`; }
  }

  // Expose minimal API and a simple hook (include helpers)
  window.SSSuiteTheme = { setTheme, toggleTheme, initTheme, cssVar, hexToRgba, onChange: null };

  // Backwards-compatible global helper aliases (many pages call cssVar() directly)
  try {
    window.cssVar = cssVar;
    window.hexToRgba = hexToRgba;
    window.setTheme = setTheme;
    window.toggleTheme = toggleTheme;
  } catch (_) {}

  // Auto-init on DOMContentLoaded
  window.addEventListener('DOMContentLoaded', initTheme);
})();
