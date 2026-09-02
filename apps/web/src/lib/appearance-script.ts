/**
 * appearanceScript
 *
 * A blocking IIFE injected into <head> via dangerouslySetInnerHTML in
 * apps/web/src/app/layout.tsx. It runs synchronously before the browser
 * paints the first pixel — before React, before any CSS transitions.
 *
 * Responsibilities:
 *  1. Add `dark` class to <html> from localStorage if user prefers dark theme
 *  2. Add `data-privacy="on"` attribute to <html> if privacy mode is enabled
 *  3. Add `density-compact` to <body> if compact density is saved
 *  4. Add `finai-no-transition` class for the first frame so the dark-class
 *     toggle is instant (no colour-animation flash on sidebar active item),
 *     then remove it via double requestAnimationFrame after first paint.
 *
 * IMPORTANT: This is a plain string — no TypeScript syntax, no imports,
 * no modern JS that might not run on older browsers. Keep it minimal.
 */
export const appearanceScript = `
(function () {
  try {
    var root = document.documentElement;

    // Suppress ALL CSS transitions for the first paint so the dark class
    // change is instant — no colour-animation flash on sidebar active items.
    root.classList.add('finai-no-transition');

    var raw = localStorage.getItem('finai_appearance');
    var prefs = raw ? JSON.parse(raw) : {};

    // 1. Theme — apply dark class before paint
    var theme = prefs.theme || 'System';
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var isDark = theme === 'Dark' || (theme === 'System' && prefersDark);
    if (isDark) {
      root.classList.add('dark');
    }

    // 2. Privacy mode — set data attribute before paint
    var privacyOn = prefs.privacyMode === true || prefs.privacyMode === 'Yes';
    if (privacyOn) {
      root.setAttribute('data-privacy', 'on');
    }

    // 3. Density
    if (prefs.density === 'Compact') {
      document.body && document.body.classList.add('density-compact');
    }

    // Remove the no-transition class after the first frame has been painted.
    // Double rAF guarantees the browser has committed at least one frame.
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        root.classList.remove('finai-no-transition');
      });
    });
  } catch (e) {}
})();
`;
