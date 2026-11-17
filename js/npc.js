/**
 * ============================================================================
 * NPC - MPC fox mascot with a thought cloud
 * ============================================================================
 * - Appears once the desktop is ready (BootManager fires 'mpc:desktop-ready').
 * - Two poses: fox-think.png when quiet, fox-idea.png while talking (the clouds drawn
 *   in both were removed, the small thought dots kept); the line shows in a plain box.
 * - Greets by time of day; the first visit also points to JOIN_MPC.exe.
 * - Lines are typed out letter by letter; the desktop icon a line talks about pulses.
 * - Click the fox for the next tip; opening an app gets a reaction line.
 * - Idle on the desktop for a while: up to two nudges per visit, the last one to JOIN.
 * - Sits above app windows; while an app is open it shrinks to a small corner fox.
 * - Tapping anywhere else (also inside an app) closes the bubble, so it never blocks icons.
 * - "Ẩn mình đi" collapses it to a small tab (remembered); the tab brings it back.
 * Lines live in js/i18n.js under the "npc." keys.
 */

const NPC = (function () {
  const GREETED_KEY = 'mpc-npc-greeted';
  const HIDDEN_KEY = 'mpc-npc-hidden';
  const AUTO_CLOSE_MS = 8000;
  const AUTO_CLOSE_COMPACT_MS = 5000; // over an open app: get out of the way sooner
  const TYPE_MS = 22;            // per character
  const IDLE_MS = 40000;         // quiet time on the desktop before a nudge
  const HIGHLIGHT_MS = 4000;
  const TIPS = ['npc.tip1', 'npc.tip2', 'npc.tip3', 'npc.tip4'];
  const NUDGES = ['npc.nudge1', 'npc.nudge2'];

  // Which desktop icon each line talks about
  const POINTS_AT = {
    'npc.greet_first': 'JOIN_MPC.exe',
    'npc.tip1': 'OUR_TEAMS',
    'npc.tip2': 'FAQ.txt',
    'npc.tip3': 'cmd.exe',
    'npc.tip4': 'JOIN_MPC.exe',
    'npc.react.ABOUT_MPC': 'OUR_TEAMS',
    'npc.nudge1': 'FAQ.txt',
    'npc.nudge2': 'JOIN_MPC.exe'
  };
  const WITH_CTA = ['npc.greet_first', 'npc.tip4', 'npc.nudge2'];

  const POSE_IDLE = 'assets/npc/fox-think.png';
  const POSE_TALK = 'assets/npc/fox-idea.png';

  let _root, _bubble, _text, _sr, _cta, _peek, _desktop, _fox, _closeBtn;
  let _started = false;
  let _paused = false;           // logged off: the login screen covers the desktop
  let _lineKeys = null;
  let _tipIndex = 0;
  let _nudgeCount = 0;
  let _joinOpened = false;
  let _closeTimer = null;
  let _typeTimer = null;
  let _idleTimer = null;
  let _highlightTimer = null;
  let _openApps = new Set();
  let _windows = [];
  let _currentX = null;
  let _currentY = null;

  const reducedMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

  function timeOfDayKey() {
    const h = new Date().getHours();
    if (h >= 5 && h < 11) return 'npc.time.morning';
    if (h >= 11 && h < 13) return 'npc.time.noon';
    if (h >= 13 && h < 18) return 'npc.time.afternoon';
    if (h >= 18 && h < 23) return 'npc.time.evening';
    return 'npc.time.late';
  }

  function updateBubbleOrientation(destX, destY) {
    if (!_root || !_bubble) return;

    let foxLeft, foxTop, foxWidth, foxHeight;
    if (typeof destX === 'number' && typeof destY === 'number') {
      foxLeft = destX;
      foxTop = destY;
      foxWidth = _root.offsetWidth || 170;
      foxHeight = _root.offsetHeight || 196;
    } else if (typeof _currentX === 'number' && typeof _currentY === 'number') {
      foxLeft = _currentX;
      foxTop = _currentY;
      foxWidth = _root.offsetWidth || 170;
      foxHeight = _root.offsetHeight || 196;
    } else {
      const r = _root.getBoundingClientRect();
      foxLeft = r.left;
      foxTop = r.top;
      foxWidth = r.width;
      foxHeight = r.height;
    }

    const isCompact = _root.classList.contains('compact');
    const bubbleWidth = _bubble.offsetWidth || 240;
    const bubbleHeight = _bubble.offsetHeight || 80;

    // Normal position (unflipped to the left):
    // In normal mode: right: 67% means bubble right edge is at foxLeft + (foxWidth * 0.33)
    // In compact mode: right: calc(100% + 14px) means right edge is at foxLeft - 14
    const normalRightEdge = isCompact ? (foxLeft - 14) : (foxLeft + foxWidth * 0.33);
    const normalLeftEdge = normalRightEdge - bubbleWidth;

    // Flipped position (to the right):
    // In normal mode: left: 65% means left edge is at foxLeft + (foxWidth * 0.65)
    // In compact mode: left: calc(100% + 14px) means left edge is at foxLeft + foxWidth + 14
    const flippedLeftEdge = isCompact ? (foxLeft + foxWidth + 14) : (foxLeft + foxWidth * 0.65);
    const flippedRightEdge = flippedLeftEdge + bubbleWidth;

    // Check horizontal flip:
    // If placing on the left overflows the viewport (< 10px):
    let shouldFlipX = false;
    if (normalLeftEdge < 10) {
      if (flippedRightEdge <= window.innerWidth - 10 || (window.innerWidth - flippedLeftEdge > normalRightEdge)) {
        shouldFlipX = true;
      }
    }

    // Check vertical flip:
    // In normal mode: bottom: 72% means bottom edge is at foxTop + (foxHeight * 0.28)
    // In compact mode: bottom: 6px
    const normalTopEdge = isCompact
      ? (foxTop + foxHeight - 6 - bubbleHeight)
      : (foxTop + foxHeight * 0.28 - bubbleHeight);

    let shouldFlipY = false;
    if (normalTopEdge < 10) {
      shouldFlipY = true;
    }

    _root.classList.toggle('bubble-flip-x', shouldFlipX);
    _root.classList.toggle('bubble-flip-y', shouldFlipY);
  }

  // Size the bubble for the whole line first, so it does not grow while typing.
  // min-height (not height): if a font loads late and the text gets taller, the
  // bubble can still grow.
  function fit(text) {
    _bubble.style.width = '';
    _bubble.style.minHeight = '';
    _text.textContent = text;
    updateBubbleOrientation();
    _bubble.style.width = `${_bubble.offsetWidth}px`;
    _bubble.style.minHeight = `${_bubble.offsetHeight}px`;
    updateBubbleOrientation();
  }

  function typeOut(text) {
    clearTimeout(_typeTimer);
    fit(text);
    _sr.textContent = text;
    if (reducedMotion()) return;
    const chars = Array.from(text); // whole code points, so emoji are never cut in half
    let i = 0;
    _text.textContent = '';
    (function next() {
      i += 1;
      _text.textContent = chars.slice(0, i).join('');
      if (i < chars.length) _typeTimer = setTimeout(next, TYPE_MS);
    })();
  }

  const currentLine = () => _lineKeys.map(t).join(' ');

  // Re-measure the open bubble for the new screen or language, showing the whole line.
  function refit() {
    clearTimeout(_typeTimer);
    if (_lineKeys) {
      fit(currentLine());
    } else if (_bubble && !_bubble.classList.contains('hidden') && _text && _text.textContent) {
      fit(_text.textContent);
    } else {
      updateBubbleOrientation();
    }
  }

  function highlight(appId) {
    clearTimeout(_highlightTimer);
    document.querySelectorAll('.desktop-icon.npc-highlight').forEach(el => el.classList.remove('npc-highlight'));
    if (!appId) return;
    const icon = document.querySelector(`.desktop-icon[data-app-id="${appId}"]`);
    if (!icon) return;
    icon.classList.add('npc-highlight');
    _highlightTimer = setTimeout(() => icon.classList.remove('npc-highlight'), HIGHLIGHT_MS);
  }

  // keys: one i18n key or several joined with a space (e.g. time greeting + line)
  function say(keys, { autoClose = true } = {}) {
    const list = [].concat(keys);
    const main = list[list.length - 1];
    _lineKeys = list;
    _cta.classList.toggle('hidden', !WITH_CTA.includes(main));
    _bubble.classList.remove('hidden');
    typeOut(list.map(t).join(' '));
    _fox.src = POSE_TALK;
    _root.dataset.pose = 'talk';
    highlight(POINTS_AT[main]);

    _root.classList.remove('waving');
    void _root.offsetWidth; // restart the hop animation
    _root.classList.add('waving');

    clearTimeout(_closeTimer);
    if (autoClose) {
      const ms = _root.classList.contains('compact') ? AUTO_CLOSE_COMPACT_MS : AUTO_CLOSE_MS;
      _closeTimer = setTimeout(closeBubble, ms);
    }
  }

  function closeBubble() {
    clearTimeout(_closeTimer);
    clearTimeout(_typeTimer);
    _bubble.classList.add('hidden');
    _fox.src = POSE_IDLE;
    _root.dataset.pose = 'think';
    _lineKeys = null;
    _root.classList.remove('bubble-flip-x', 'bubble-flip-y');
  }

  function isHidden() {
    return _root.classList.contains('hidden');
  }

  function show() {
    _root.classList.remove('hidden');
    _peek.classList.add('hidden');
    _desktop.classList.add('npc-on');
    resetIdle();
  }

  function hide() {
    closeBubble();
    highlight(null);
    clearTimeout(_idleTimer);
    _root.classList.add('hidden');
    _peek.classList.remove('hidden');
    _desktop.classList.remove('npc-on');
    store('set', HIDDEN_KEY, '1');
  }

  // Nudge only while the visitor sits on the bare desktop: clicks inside an app's
  // iframe are invisible here, so an open window counts as "busy reading".
  function resetIdle() {
    clearTimeout(_idleTimer);
    if (!_started || _paused || isHidden() || _joinOpened || _nudgeCount >= NUDGES.length) return;
    _idleTimer = setTimeout(() => {
      const busy = _windows.some(w => !w.isMinimized);
      if (!busy && _bubble.classList.contains('hidden')) {
        say(NUDGES[_nudgeCount]);
        _nudgeCount += 1;
      }
      resetIdle();
    }, IDLE_MS);
  }

  function start() {
    _closeBtn.setAttribute('aria-label', I18n.t('win.close'));
    if (_started) { // logged back in after Log off
      _paused = false;
      resetIdle();
      return;
    }
    _started = true;

    if (store('get', HIDDEN_KEY)) {
      _peek.classList.remove('hidden');
      return;
    }
    show();
    setTimeout(() => {
      if (!store('get', GREETED_KEY)) {
        store('set', GREETED_KEY, '1');
        say([timeOfDayKey(), 'npc.greet_first'], { autoClose: false });
      } else {
        say([timeOfDayKey(), 'npc.greet_back']);
      }
    }, 600);
  }

  function pause() {
    _paused = true;
    closeBubble();
    highlight(null);
    clearTimeout(_idleTimer);
  }

  // React to apps the visitor opens (only newly opened ones).
  function onWindowsChange(list) {
    _windows = list;
    // An open app gets the screen: the fox shrinks into the corner above it
    _root.classList.toggle('compact', list.some(w => !w.isMinimized));
    refit(); // the bubble changes size between normal and compact
    const now = new Set(list.map(w => w.appId));
    const opened = [...now].filter(id => !_openApps.has(id));
    _openApps = now;
    if (opened.includes('JOIN_MPC.exe')) _joinOpened = true;
    if (!_started || isHidden() || opened.length === 0) return;

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
    _fox = document.getElementById('npc-fox');
    _sr = document.getElementById('npc-sr');
    _closeBtn = document.getElementById('npc-bubble-close');
    new Image().src = POSE_TALK; // preload, so the first swap does not flicker

    document.getElementById('npc-body').addEventListener('click', () => {
      say(TIPS[_tipIndex]);
      _tipIndex = (_tipIndex + 1) % TIPS.length;
    });
    // Clicking the bubble while it types shows the whole line at once
    _text.addEventListener('click', () => {
      if (_lineKeys) {
        clearTimeout(_typeTimer);
        _text.textContent = currentLine();
      }
    });
    _closeBtn.addEventListener('click', closeBubble);
    document.getElementById('npc-hide').addEventListener('click', hide);
    _cta.addEventListener('click', () => {
      closeBubble();
      WindowManager.open('JOIN_MPC.exe');
    });
    _peek.addEventListener('click', () => {
      store('remove', HIDDEN_KEY);
      show();
      say([timeOfDayKey(), 'npc.greet_back']);
    });

    ['pointerdown', 'keydown'].forEach(type => document.addEventListener(type, resetIdle, { passive: true }));
    // A tap anywhere else closes the bubble (and still reaches what was tapped). Taps
    // inside an app's iframe never reach this document; the page losing focus does.
    document.addEventListener('pointerdown', e => {
      if (_lineKeys && !_root.contains(e.target)) closeBubble();
    }, { capture: true, passive: true });
    window.addEventListener('blur', () => {
      if (_lineKeys && document.activeElement && document.activeElement.tagName === 'IFRAME') closeBubble();
    });
    window.addEventListener('resize', refit);
    WindowManager.onChange(onWindowsChange);
    I18n.onChange(() => {
      _closeBtn.setAttribute('aria-label', I18n.t('win.close'));
      refit();
    });

    document.addEventListener('mpc:desktop-ready', start);
    document.addEventListener('mpc:logoff', pause);

    _root.addEventListener('transitionend', e => {
      if (e.target === _root && !_bubble.classList.contains('hidden')) {
        updateBubbleOrientation();
      }
    });
  }

  function sayCustom(rawText, { autoClose = true, ms = 4000 } = {}) {
    _lineKeys = null;
    _cta?.classList.add('hidden');
    _bubble?.classList.remove('hidden');
    typeOut(rawText);
    _fox.src = POSE_TALK;
    _root.dataset.pose = 'talk';

    _root.classList.remove('waving');
    void _root.offsetWidth;
    _root.classList.add('waving');

    clearTimeout(_closeTimer);
    if (autoClose) {
      _closeTimer = setTimeout(closeBubble, ms);
    }
  }

  let _homeTimer = null;

  function moveTo(x, y, duration = 420) {
    if (!_root) return;
    clearTimeout(_homeTimer);

    // Lock current rendered coordinates in px if currently anchored by right/bottom (left is auto)
    if (!_root.style.left || _root.style.left === 'auto') {
      const rect = _root.getBoundingClientRect();
      _root.style.transition = 'none';
      _root.style.right = 'auto';
      _root.style.bottom = 'auto';
      _root.style.left = `${rect.left}px`;
      _root.style.top = `${rect.top}px`;
      void _root.offsetWidth; // Force reflow so browser transitions from current px to target px
    }

    _currentX = x;
    _currentY = y;
    _root.style.transition = `left ${duration}ms cubic-bezier(0.22, 1, 0.36, 1), top ${duration}ms cubic-bezier(0.22, 1, 0.36, 1)`;
    _root.style.left = `${x}px`;
    _root.style.top = `${y}px`;
    _root.style.zIndex = '9999';
    updateBubbleOrientation(x, y);
  }

  function returnHome(duration = 480) {
    if (!_root) return;
    clearTimeout(_homeTimer);
    _currentX = null;
    _currentY = null;

    const rect = _root.getBoundingClientRect();
    if (!_root.style.left || _root.style.left === 'auto') {
      _root.style.transition = 'none';
      _root.style.right = 'auto';
      _root.style.bottom = 'auto';
      _root.style.left = `${rect.left}px`;
      _root.style.top = `${rect.top}px`;
      void _root.offsetWidth;
    }

    const taskbarH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--taskbar-height'), 10) || 36;
    const homeX = Math.max(0, window.innerWidth - rect.width - 16);
    const homeY = Math.max(0, window.innerHeight - taskbarH - 8 - rect.height);

    _root.style.transition = `left ${duration}ms cubic-bezier(0.22, 1, 0.36, 1), top ${duration}ms cubic-bezier(0.22, 1, 0.36, 1)`;
    _root.style.left = `${homeX}px`;
    _root.style.top = `${homeY}px`;
    _root.classList.remove('bubble-flip-x', 'bubble-flip-y');

    _homeTimer = setTimeout(() => {
      if (_currentX === null && _root) {
        _root.style.transition = 'none';
        _root.style.left = '';
        _root.style.top = '';
        _root.style.right = '16px';
        _root.style.bottom = 'calc(var(--taskbar-height) + 8px)';
        _root.style.zIndex = '';
      }
    }, duration + 20);
  }

  function getRoot() {
    return _root;
  }

  return { init, say, sayCustom, closeBubble, hide, show, moveTo, returnHome, getRoot };
})();

window.NPC = NPC;
