/**
 * ============================================================================
 * SubAppI18n - Shared URL Parameter (?lang=vi|en) & Live OS Language Sync
 * ============================================================================
 * - Reads ?lang=vi or ?lang=en from URL query parameters.
 * - Falls back to window.parent.I18n.getLanguage() or localStorage('mpc_lang_2026').
 * - Keeps URL query parameter ?lang=... synchronized via history.replaceState.
 * - Automatically translates elements with [data-vi] / [data-en],
 *   [data-html-vi] / [data-html-en], and [data-placeholder-vi] / [data-placeholder-en].
 * - Listens to parent OS I18n changes, postMessage('mpc:lang-change'), and storage events.
 */

const SubAppI18n = (function () {
  const STORAGE_KEY = 'mpc_lang_2026';
  const _listeners = [];

  function detectLang() {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlLang = (params.get('lang') || '').toLowerCase();
      if (urlLang === 'vi' || urlLang === 'en') return urlLang;
    } catch (e) {}

    try {
      if (window.parent && window.parent !== window && window.parent.I18n) {
        const pLang = window.parent.I18n.getLanguage();
        if (pLang === 'vi' || pLang === 'en') return pLang;
      }
    } catch (e) {}

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'vi' || saved === 'en') return saved;
    } catch (e) {}

    return 'vi';
  }

  let _lang = detectLang();

  function updateUrlParam(lang) {
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.get('lang') !== lang) {
        url.searchParams.set('lang', lang);
        window.history.replaceState(null, '', url.toString());
      }
    } catch (e) {}
  }

  function applyDOM(lang) {
    const isVi = lang === 'vi';
    document.documentElement.lang = lang;

    document.querySelectorAll('[data-vi][data-en]').forEach(el => {
      el.textContent = isVi ? el.getAttribute('data-vi') : el.getAttribute('data-en');
    });

    document.querySelectorAll('[data-html-vi][data-html-en]').forEach(el => {
      el.innerHTML = isVi ? el.getAttribute('data-html-vi') : el.getAttribute('data-html-en');
    });

    document.querySelectorAll('[data-placeholder-vi][data-placeholder-en]').forEach(el => {
      el.setAttribute('placeholder', isVi ? el.getAttribute('data-placeholder-vi') : el.getAttribute('data-placeholder-en'));
    });
  }

  function setLang(lang, notifyParent = false) {
    if (lang !== 'vi' && lang !== 'en') return;
    _lang = lang;
    updateUrlParam(lang);
    applyDOM(lang);

    _listeners.forEach(fn => {
      try { fn(lang, lang === 'vi'); } catch (e) {}
    });

    if (notifyParent) {
      try {
        if (window.parent && window.parent !== window && window.parent.I18n && window.parent.I18n.getLanguage() !== lang) {
          window.parent.I18n.setLanguage(lang);
        }
      } catch (e) {}
    }
  }

  function getLang() {
    return _lang;
  }

  function isVi() {
    return _lang === 'vi';
  }

  function onChange(fn) {
    if (typeof fn === 'function') {
      _listeners.push(fn);
    }
  }

  function init() {
    _lang = detectLang();
    updateUrlParam(_lang);
    applyDOM(_lang);

    // 1. Subscribe to parent I18n if accessible
    try {
      if (window.parent && window.parent !== window && window.parent.I18n) {
        window.parent.I18n.onChange(newLang => {
          if (newLang !== _lang) setLang(newLang, false);
        });
      }
    } catch (e) {}

    // 2. Listen for postMessage from WindowManager
    window.addEventListener('message', e => {
      if (e.data && e.data.type === 'mpc:lang-change' && e.data.lang) {
        if (e.data.lang !== _lang) setLang(e.data.lang, false);
      }
    });

    // 3. Listen for localStorage changes
    window.addEventListener('storage', e => {
      if (e.key === STORAGE_KEY && (e.newValue === 'vi' || e.newValue === 'en')) {
        if (e.newValue !== _lang) setLang(e.newValue, false);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return { getLang, isVi, setLang, onChange, applyDOM };
})();

window.SubAppI18n = SubAppI18n;

// Expose centralized MPC_CONFIG from parent window (or load fallback if opened standalone)
try {
  if (!window.MPC_CONFIG && window.parent && window.parent.MPC_CONFIG) {
    window.MPC_CONFIG = window.parent.MPC_CONFIG;
  }
} catch (e) {}
if (!window.MPC_CONFIG) {
  const s = document.createElement('script');
  s.src = '../../js/config.js';
  document.head.appendChild(s);
}

