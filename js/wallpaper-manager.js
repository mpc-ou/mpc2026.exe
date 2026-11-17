/**
 * js/wallpaper-manager.js
 * Manages Desktop Wallpaper persistence using IndexedDB (with LocalStorage fallback).
 * Allows uploading custom high-resolution wallpapers, choosing presets, and resetting to Bliss.
 */

const WallpaperManager = (function () {
  const DB_NAME = 'mpc_settings_db';
  const DB_VERSION = 1;
  const STORE_NAME = 'wallpapers';
  const KEY_NAME = 'current_wallpaper';
  const DEFAULT_WALLPAPER_URL = 'assets/backgrounds/bg.jpg';

  let _db = null;
  const _listeners = [];
  let _currentWallpaper = {
    type: 'preset',
    url: DEFAULT_WALLPAPER_URL,
    name: 'Bliss (Mặc định)'
  };

  function openDB() {
    return new Promise((resolve, reject) => {
      if (_db) return resolve(_db);
      if (!window.indexedDB) {
        return reject(new Error('IndexedDB not supported'));
      }

      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };

      req.onsuccess = (e) => {
        _db = e.target.result;
        resolve(_db);
      };

      req.onerror = (e) => {
        reject(e.target.error);
      };
    });
  }

  function applyToDesktop(imageUrl) {
    const desktop = document.getElementById('desktop');
    if (!desktop) return;

    if (!imageUrl || imageUrl === DEFAULT_WALLPAPER_URL) {
      // Restore default bliss gradient + bg.jpg
      desktop.style.backgroundImage = '';
      desktop.style.backgroundColor = '';
    } else {
      // Custom image or preset
      desktop.style.backgroundImage = `
        linear-gradient(to right, rgba(0, 0, 0, 0.18) 0, rgba(0, 0, 0, 0.08) 120px, transparent 180px),
        url('${imageUrl}')
      `;
      desktop.style.backgroundPosition = 'left top, center center';
      desktop.style.backgroundSize = '100% 100%, cover';
      desktop.style.backgroundRepeat = 'no-repeat';
    }
  }

  async function loadSavedWallpaper() {
    try {
      const db = await openDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(KEY_NAME);

        req.onsuccess = () => {
          if (req.result && req.result.url) {
            _currentWallpaper = req.result;
            applyToDesktop(_currentWallpaper.url);
          } else {
            loadFromLocalStorage();
          }
          resolve(_currentWallpaper);
        };

        req.onerror = () => {
          loadFromLocalStorage();
          resolve(_currentWallpaper);
        };
      });
    } catch (e) {
      loadFromLocalStorage();
      return _currentWallpaper;
    }
  }

  function loadFromLocalStorage() {
    try {
      const raw = localStorage.getItem('mpc_wallpaper_fallback');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.url) {
          _currentWallpaper = parsed;
          applyToDesktop(_currentWallpaper.url);
        }
      }
    } catch (e) {}
  }

  async function saveWallpaper(wallpaperObj) {
    _currentWallpaper = wallpaperObj;
    applyToDesktop(wallpaperObj.url);
    notifyListeners();

    try {
      const db = await openDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put(wallpaperObj, KEY_NAME);
    } catch (e) {
      // Fallback: only save smaller presets or metadata to localStorage
      try {
        if (wallpaperObj.url.length < 500000) {
          localStorage.setItem('mpc_wallpaper_fallback', JSON.stringify(wallpaperObj));
        }
      } catch (err) {}
    }
  }

  function notifyListeners() {
    _listeners.forEach((fn) => {
      try { fn(_currentWallpaper); } catch (e) { console.error(e); }
    });
  }

  return {
    async init() {
      await loadSavedWallpaper();
    },

    getCurrent() {
      return { ..._currentWallpaper };
    },

    async setCustomFile(file) {
      return new Promise((resolve, reject) => {
        if (!file || !file.type.startsWith('image/')) {
          return reject(new Error('Vui lòng chọn tệp hình ảnh hợp lệ (.jpg, .png, .webp).'));
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
          const dataUrl = e.target.result;
          const wallpaperObj = {
            type: 'custom',
            url: dataUrl,
            name: file.name || 'Custom Wallpaper',
            updatedAt: Date.now()
          };

          await saveWallpaper(wallpaperObj);
          resolve(wallpaperObj);
        };

        reader.onerror = (e) => reject(e);
        reader.readAsDataURL(file);
      });
    },

    async setPreset(url, name) {
      const wallpaperObj = {
        type: 'preset',
        url: url || DEFAULT_WALLPAPER_URL,
        name: name || 'Preset',
        updatedAt: Date.now()
      };
      await saveWallpaper(wallpaperObj);
      return wallpaperObj;
    },

    async resetDefault() {
      const wallpaperObj = {
        type: 'preset',
        url: DEFAULT_WALLPAPER_URL,
        name: 'Bliss (Mặc định)',
        updatedAt: Date.now()
      };
      await saveWallpaper(wallpaperObj);

      try {
        const db = await openDB();
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).delete(KEY_NAME);
        localStorage.removeItem('mpc_wallpaper_fallback');
      } catch (e) {}

      return wallpaperObj;
    },

    onChange(fn) {
      if (typeof fn === 'function') _listeners.push(fn);
    }
  };
})();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => WallpaperManager.init());
} else {
  WallpaperManager.init();
}
