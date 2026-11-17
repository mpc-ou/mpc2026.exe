/**
 * ============================================================================
 * MasterVolume - Global Audio & Media Synchronizer (Windows XP System Volume)
 * ============================================================================
 * Exposed globally on `window`:
 * - window.MasterVolume (API with get, set, isMuted, setMuted, syncAll, onChange)
 * - window.masterVolume (getter/setter: 0.0 - 1.0)
 * - window.masterMuted (getter/setter: boolean)
 *
 * Automatically synchronizes in real-time:
 * 1. All <audio> and <video> tags in the main document
 * 2. Same-origin iframes (Explorer browser, custom user apps, etc.)
 * 3. Cross-origin iframes via window.postMessage
 * 4. System sounds (BootManager / SoundFX / XPDialog error chimes)
 * 5. Taskbar tray volume slider & mute checkbox
 * 6. Windows Media Player (video element, deck slider, mute icon)
 * 7. Persists in localStorage ('mpc_master_volume_v1')
 */

const MasterVolume = (function () {
  const STORAGE_KEY = 'mpc_master_volume_v1';
  let _volume = 0.8; // 0.0 to 1.0
  let _muted = false;
  const _listeners = new Set();

  function loadSettings() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (typeof parsed.volume === 'number') {
          _volume = Math.max(0, Math.min(1, parsed.volume));
        }
        if (typeof parsed.muted === 'boolean') {
          _muted = parsed.muted;
        }
      }
    } catch (e) {}
  }

  function saveSettings() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        volume: _volume,
        muted: _muted
      }));
    } catch (e) {}
  }

  function get() {
    return _volume;
  }

  function isMuted() {
    return _muted;
  }

  function getEffectiveVolume() {
    return _muted ? 0 : _volume;
  }

  function set(val) {
    if (typeof val !== 'number' || isNaN(val)) return;
    _volume = Math.max(0, Math.min(1, val));
    saveSettings();
    syncAll();
    notifyListeners();
  }

  function setMuted(bool) {
    _muted = !!bool;
    saveSettings();
    syncAll();
    notifyListeners();
  }

  function toggleMute() {
    setMuted(!_muted);
  }

  function onChange(callback) {
    if (typeof callback === 'function') {
      _listeners.add(callback);
      // Immediately call with current state
      try {
        callback(getEffectiveVolume(), _volume, _muted);
      } catch (e) {}
    }
    return () => _listeners.delete(callback);
  }

  function notifyListeners() {
    const eff = getEffectiveVolume();
    _listeners.forEach(fn => {
      try {
        fn(eff, _volume, _muted);
      } catch (e) {}
    });

    // Also dispatch DOM events for external components
    try {
      window.dispatchEvent(new CustomEvent('mpc:volume-change', {
        detail: { effectiveVolume: eff, volume: _volume, muted: _muted }
      }));
    } catch (e) {}
  }

  /**
   * Synchronize all media elements across the main page and all iframes
   */
  function syncAll() {
    const eff = getEffectiveVolume();

    // 1. Synchronize system sound effects in BootManager
    if (window.BootManager && typeof window.BootManager.setVolume === 'function') {
      try {
        window.BootManager.setVolume(eff);
      } catch (e) {}
    }

    // 2. Synchronize main window <audio> and <video> elements
    document.querySelectorAll('audio, video').forEach(el => {
      try {
        el.volume = eff;
      } catch (e) {}
    });

    // 3. Synchronize all <iframe> elements (same-origin & postMessage)
    document.querySelectorAll('iframe').forEach(iframe => {
      // A. Direct DOM synchronization for same-origin iframes
      try {
        if (iframe.contentDocument) {
          iframe.contentDocument.querySelectorAll('audio, video').forEach(el => {
            try {
              el.volume = eff;
            } catch (e) {}
          });
        }
      } catch (e) {
        // Cross-origin: handled via postMessage below
      }

      // B. postMessage for cross-origin or iframe applications
      try {
        if (iframe.contentWindow) {
          iframe.contentWindow.postMessage({
            type: 'MPC_MASTER_VOLUME_CHANGE',
            volume: eff,
            rawVolume: _volume,
            muted: _muted
          }, '*');
          iframe.contentWindow.postMessage({
            type: 'SET_VOLUME',
            volume: eff
          }, '*');
        }
      } catch (e) {}
    });

    // 4. Update Taskbar volume popup controls
    const traySlider = document.getElementById('tray-vol-slider');
    if (traySlider) {
      const targetVal = String(Math.round(_volume * 100));
      if (traySlider.value !== targetVal) traySlider.value = targetVal;
    }

    const trayMute = document.getElementById('tray-vol-mute');
    if (trayMute) {
      if (trayMute.checked !== _muted) trayMute.checked = _muted;
    }
  }

  // Observe DOM for newly inserted media elements or iframes
  function setupDomObserver() {
    if (typeof MutationObserver === 'undefined') return;
    const observer = new MutationObserver((mutations) => {
      let shouldSync = false;
      for (const m of mutations) {
        for (const node of m.addedNodes) {
          if (node.nodeType === 1) {
            const tag = node.tagName.toLowerCase();
            if (tag === 'audio' || tag === 'video' || tag === 'iframe' ||
                node.querySelector?.('audio, video, iframe')) {
              shouldSync = true;
              break;
            }
          }
        }
        if (shouldSync) break;
      }
      if (shouldSync) {
        setTimeout(syncAll, 30);
      }
    });

    observer.observe(document.documentElement || document.body, {
      childList: true,
      subtree: true
    });
  }

  function init() {
    loadSettings();
    setupDomObserver();

    // Listen to iframe requests to get volume
    window.addEventListener('message', (e) => {
      if (e.data && e.data.type === 'MPC_GET_MASTER_VOLUME' && e.source) {
        try {
          e.source.postMessage({
            type: 'MPC_MASTER_VOLUME_RESPONSE',
            volume: getEffectiveVolume(),
            rawVolume: _volume,
            muted: _muted
          }, '*');
        } catch (err) {}
      }
    });

    // Initial sync
    setTimeout(syncAll, 50);
  }

  // Auto-init on script load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return {
    get,
    set,
    isMuted,
    setMuted,
    toggleMute,
    getEffectiveVolume,
    syncAll,
    onChange
  };
})();

// Define direct variable access on window: window.masterVolume & window.masterMuted
Object.defineProperty(window, 'masterVolume', {
  get() {
    return MasterVolume.get();
  },
  set(val) {
    MasterVolume.set(val);
  },
  configurable: true,
  enumerable: true
});

Object.defineProperty(window, 'masterMuted', {
  get() {
    return MasterVolume.isMuted();
  },
  set(val) {
    MasterVolume.setMuted(val);
  },
  configurable: true,
  enumerable: true
});

window.MasterVolume = MasterVolume;
