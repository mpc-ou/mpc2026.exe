/**
 * ============================================================================
 * NPC - MPC fox mascot with a speech bubble
 * ============================================================================
 * - Appears once the desktop is ready (BootManager fires 'mpc:desktop-ready').
 * - First visit: a greeting that points to JOIN_MPC.exe. Later visits: a short hello.
 * - Click the fox for the next tip; opening an app gets a reaction line.
 * - "Ẩn mình đi" collapses it to a small tab (remembered); the tab brings it back.
 * Lines live in js/i18n.js under the "npc." keys.
 */

const NPC = (function () {
  const GREETED_KEY = 'mpc-npc-greeted';
  const HIDDEN_KEY = 'mpc-npc-hidden';
  const AUTO_CLOSE_MS = 7000;
  const TIPS = ['npc.tip1', 'npc.tip2', 'npc.tip3', 'npc.tip4'];

  let _root, _bubble, _text, _cta, _peek, _desktop;
  let _started = false;
  let _lineKey = null;
  let _tipIndex = 0;
  let _closeTimer = null;
  let _openApps = new Set();

  function store(method, key, value) {
    try {
      return method === 'get' ? localStorage.getItem(key)
        : method === 'set' ? localStorage.setItem(key, value)
        : localStorage.removeItem(key);
    } catch (e) {
      return null; // storage blocked: the fox just forgets
    }
  }

  // Touch screens open icons with one tap, mice with a double click.
  function t(key) {
    const coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    const touchKey = `${key}.touch`;
    if (coarse && I18n.t(touchKey) !== touchKey) return I18n.t(touchKey);
    return I18n.t(key);
  }

  function say(key, { cta = false, autoClose = true } = {}) {
    _lineKey = key;
    _text.textContent = t(key);
    _cta.classList.toggle('hidden', !cta);
    _bubble.classList.remove('hidden');

    _root.classList.remove('waving');
    void _root.offsetWidth; // restart the wave animation
    _root.classList.add('waving');

    clearTimeout(_closeTimer);
    if (autoClose) _closeTimer = setTimeout(closeBubble, AUTO_CLOSE_MS);
  }

  function closeBubble() {
    clearTimeout(_closeTimer);
    _bubble.classList.add('hidden');
    _lineKey = null;
  }

  function show() {
    _root.classList.remove('hidden');
    _peek.classList.add('hidden');
    _desktop.classList.add('npc-on');
  }

  function hide() {
    closeBubble();
    _root.classList.add('hidden');
    _peek.classList.remove('hidden');
    _desktop.classList.remove('npc-on');
    store('set', HIDDEN_KEY, '1');
  }

  function start() {
    if (_started) return;
    _started = true;

    if (store('get', HIDDEN_KEY)) {
      _peek.classList.remove('hidden');
      return;
    }
    show();
    setTimeout(() => {
      if (!store('get', GREETED_KEY)) {
        store('set', GREETED_KEY, '1');
        say('npc.greet_first', { cta: true, autoClose: false });
      } else {
        say('npc.greet_back');
      }
    }, 600);
  }

  // React to apps the visitor opens (only newly opened ones).
  function onWindowsChange(list) {
    const now = new Set(list.map(w => w.appId));
    const opened = [...now].filter(id => !_openApps.has(id));
    _openApps = now;
    if (!_started || _root.classList.contains('hidden') || opened.length === 0) return;

    const key = `npc.react.${opened[opened.length - 1]}`;
    if (I18n.t(key) !== key) say(key);
  }

  function init() {
    _root = document.getElementById('npc');
    _desktop = document.getElementById('desktop');
    if (!_root || !_desktop) return;
    _bubble = _root.querySelector('.npc-bubble');
    _text = document.getElementById('npc-text');
    _cta = document.getElementById('npc-cta');
    _peek = document.getElementById('npc-peek');

    document.getElementById('npc-body').addEventListener('click', () => {
      say(TIPS[_tipIndex], { cta: TIPS[_tipIndex] === 'npc.tip4' });
      _tipIndex = (_tipIndex + 1) % TIPS.length;
    });
    document.getElementById('npc-bubble-close').addEventListener('click', closeBubble);
    document.getElementById('npc-hide').addEventListener('click', hide);
    _cta.addEventListener('click', () => {
      closeBubble();
      WindowManager.open('JOIN_MPC.exe');
    });
    _peek.addEventListener('click', () => {
      store('remove', HIDDEN_KEY);
      show();
      say('npc.greet_back');
    });

    WindowManager.onChange(onWindowsChange);
    I18n.onChange(() => {
      if (_lineKey) _text.textContent = t(_lineKey);
    });

    document.addEventListener('mpc:desktop-ready', start);
  }

  return { init, say, hide, show };
})();

window.NPC = NPC;
