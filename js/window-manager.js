/**
 * ============================================================================
 * WindowManager - Desktop Window Management System (Windows XP Luna)
 * ============================================================================
 * Handles:
 * - Window instantiation & rendering
 * - Drag & drop moving
 * - Resizing
 * - Minimize / Maximize / Restore / Close
 * - Z-index stack management & active focus
 * - Duplicate instance prevention
 * - Sync with Taskbar
 */

const WindowManager = (function () {
  const _openWindows = new Map(); // appId -> WindowInstance
  let _topZIndex = 100;
  let _activeWindow = null;
  const _listeners = {
    change: []
  };

  const EDGE = 16;        // min gap between a window and the screen edge
  const CASCADE = 28;    // offset for each extra open window

  // Free area for windows: the viewport minus the taskbar.
  function workArea() {
    const taskbar = document.querySelector('.taskbar-container');
    return { w: window.innerWidth, h: window.innerHeight - (taskbar ? taskbar.offsetHeight : 36) };
  }

  /**
   * Opening size and position: fit the screen, then center in the space right of the
   * desktop icon column (or the whole screen if it does not fit there), cascading
   * a little for each window already open. Phones (<=768px) are fullscreen via CSS.
   */
  function initialRect(appConfig, openCount) {
    const area = workArea();
    const tablet = area.w <= 1024;
    const wantW = appConfig.width || 600;
    const wantH = appConfig.height || 420;
    // Content apps grow with the screen; small tools (calc, minesweeper) keep their size.
    const big = area.w >= 1440;
    const content = wantW >= 400 && wantH >= 300;
    const scaleW = content ? (tablet ? 0.9 : big ? 0.58 : 0.68) : 0;
    const scaleH = content ? (tablet ? 0.85 : big ? 0.8 : 0.84) : 0;
    const width = Math.round(Math.min(Math.max(wantW, area.w * scaleW), area.w - EDGE * 2));
    const height = Math.round(Math.min(Math.max(wantH, area.h * scaleH), area.h - EDGE * 2));

    const icons = document.getElementById('desktop-icons');
    const iconsRight = icons && !tablet ? icons.getBoundingClientRect().right : 0;
    const left0 = area.w - iconsRight - EDGE * 2 >= width ? iconsRight + EDGE : EDGE;
    const spanW = area.w - left0 - EDGE;

    const step = (openCount % 6) * CASCADE;
    const x = left0 + Math.max(0, (spanW - width) / 2) + step;
    const y = EDGE + Math.max(0, (area.h - EDGE * 2 - height) / 2) + step;
    return {
      width, height,
      x: Math.round(Math.min(x, area.w - width - EDGE)),
      y: Math.round(Math.max(EDGE, Math.min(y, area.h - height - EDGE)))
    };
  }

  // After the viewport changes (rotate phone, resize browser) keep every window on screen.
  window.addEventListener('resize', () => {
    const area = workArea();
    _openWindows.forEach(win => {
      if (win.isMaximized) return;
      const el = win.element;
      const w = Math.min(el.offsetWidth, area.w - EDGE * 2);
      const h = Math.min(el.offsetHeight, area.h - EDGE * 2);
      el.style.width = `${w}px`;
      el.style.height = `${h}px`;
      el.style.left = `${Math.max(EDGE, Math.min(el.offsetLeft, area.w - w - EDGE))}px`;
      el.style.top = `${Math.max(0, Math.min(el.offsetTop, area.h - h - EDGE))}px`;
    });
  });

  /**
   * Helper to notify taskbar and external observers of window state changes
   */
  function notifyChange() {
    const list = Array.from(_openWindows.values()).map(win => ({
      appId: win.appId,
      title: win.title,
      iconSvg: win.iconSvg,
      iconUrl: win.iconUrl,
      isMinimized: win.isMinimized,
      isMaximized: win.isMaximized,
      isActive: _activeWindow === win
    }));
    _listeners.change.forEach(fn => fn(list, _activeWindow?.appId || null));
  }

  class WindowInstance {
    constructor(appConfig) {
      this.appId = appConfig.id;
      this.title = appConfig.title || appConfig.id;
      this.iconSvg = appConfig.iconSvg || '';
      this.iconUrl = appConfig.iconUrl || '';
      const rect = initialRect(appConfig, _openWindows.size);
      this.width = rect.width;
      this.height = rect.height;
      this.isMinimized = false;
      this.isMaximized = false;
      this.prevRect = null;
      this.appConfig = appConfig;

      this.posX = rect.x;
      this.posY = rect.y;

      this.element = this._createDOM();
      this._bindEvents();
      this.bringToFront();

      // Render inner content from app definition or external standalone HTML file
      const bodyEl = this.element.querySelector('.window-body');
      if (appConfig.url) {
        const lang = window.I18n ? I18n.getLanguage() : 'vi';
        const separator = appConfig.url.includes('?') ? '&' : '?';
        const iframeUrl = `${appConfig.url}${separator}lang=${lang}`;
        bodyEl.innerHTML = `<iframe class="window-iframe" src="${iframeUrl}" title="${this.title}" allow="autoplay; fullscreen"></iframe>`;
      } else if (typeof appConfig.render === 'function') {
        appConfig.render(bodyEl, this);
      }

      if (typeof appConfig.onOpen === 'function') {
        appConfig.onOpen(this);
      }
    }

    _createDOM() {
      const win = document.createElement('div');
      win.className = 'window-container';
      win.id = `win-${this.appId}`;
      win.style.width = `${this.width}px`;
      win.style.height = `${this.height}px`;
      win.style.left = `${this.posX}px`;
      win.style.top = `${this.posY}px`;

      const iconMarkup = this.iconSvg 
        ? this.iconSvg 
        : (this.iconUrl ? `<img src="${this.iconUrl}" alt="" />` : '📁');

      const menubarHtml = this.appConfig.noMenubar ? '' : `
        <div class="window-menubar">
          <span class="menu-item">${window.I18n ? I18n.t('win.file') : 'File'}</span>
          <span class="menu-item">${window.I18n ? I18n.t('win.edit') : 'Edit'}</span>
          <span class="menu-item">${window.I18n ? I18n.t('win.view') : 'View'}</span>
          <span class="menu-item">${window.I18n ? I18n.t('win.help') : 'Help'}</span>
        </div>
      `;

      const statusbarHtml = this.appConfig.noStatusbar ? '' : `
        <div class="window-statusbar">
          <span>${window.I18n ? I18n.t('system.ready') : 'Ready'}</span>
          <span>MPC.exe v2026</span>
        </div>
      `;

      win.innerHTML = `
        <div class="window-titlebar">
          <div class="window-titlebar-left">
            <div class="window-app-icon">${iconMarkup}</div>
            <div class="window-title">${this.title}</div>
          </div>
          <div class="window-controls">
            <button class="window-btn btn-minimize" title="${window.I18n ? I18n.t('win.min') : 'Minimize'}"><i class="bi bi-dash"></i></button>
            <button class="window-btn btn-maximize" title="${window.I18n ? I18n.t('win.max') : 'Maximize'}"><i class="bi bi-square" style="font-size: 8px;"></i></button>
            <button class="window-btn btn-close" title="${window.I18n ? I18n.t('win.close') : 'Close'}"><i class="bi bi-x-lg" style="font-size: 10px;"></i></button>
          </div>
        </div>
        ${menubarHtml}
        <div class="window-body"></div>
        ${statusbarHtml}
        <div class="window-resizer"></div>
      `;

      document.getElementById('windows-container').appendChild(win);
      return win;
    }

    _bindEvents() {
      const titlebar = this.element.querySelector('.window-titlebar');
      const btnMin = this.element.querySelector('.btn-minimize');
      const btnMax = this.element.querySelector('.btn-maximize');
      const btnClose = this.element.querySelector('.btn-close');
      const resizer = this.element.querySelector('.window-resizer');

      // Click to focus
      this.element.addEventListener('mousedown', () => {
        this.bringToFront();
      });

      // Controls
      btnMin.addEventListener('click', (e) => {
        e.stopPropagation();
        this.minimize();
      });

      btnMax.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleMaximize();
      });

      btnClose.addEventListener('click', (e) => {
        e.stopPropagation();
        this.close();
      });

      // Dragging Window
      this._setupDrag(titlebar);

      // Resizing Window
      this._setupResize(resizer);
    }

    _setupDrag(handle) {
      let isDragging = false;
      let startX, startY, initialX, initialY;

      const onMouseDown = (e) => {
        if (this.isMaximized) return; // Don't drag if maximized
        if (e.target.closest('.window-btn')) return;

        isDragging = true;
        this.bringToFront();
        document.body.classList.add('window-is-dragging');
        startX = e.clientX;
        startY = e.clientY;
        initialX = this.element.offsetLeft;
        initialY = this.element.offsetTop;

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        e.preventDefault();
      };

      const onMouseMove = (e) => {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        let newX = initialX + dx;
        let newY = initialY + dy;

        // Constrain within viewport bounds
        newY = Math.max(0, Math.min(newY, window.innerHeight - 40));
        newX = Math.max(-this.width + 100, Math.min(newX, window.innerWidth - 100));

        this.posX = newX;
        this.posY = newY;
        this.element.style.left = `${newX}px`;
        this.element.style.top = `${newY}px`;
      };

      const onMouseUp = () => {
        if (!isDragging) return;
        isDragging = false;
        document.body.classList.remove('window-is-dragging');
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };

      handle.addEventListener('mousedown', onMouseDown);
    }

    _setupResize(resizer) {
      let isResizing = false;
      let startX, startY, startW, startH;

      const onMouseDown = (e) => {
        if (this.isMaximized) return;
        isResizing = true;
        this.bringToFront();
        document.body.classList.add('window-is-resizing');
        startX = e.clientX;
        startY = e.clientY;
        startW = parseInt(document.defaultView.getComputedStyle(this.element).width, 10);
        startH = parseInt(document.defaultView.getComputedStyle(this.element).height, 10);

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        e.stopPropagation();
        e.preventDefault();
      };

      const onMouseMove = (e) => {
        if (!isResizing) return;
        const newW = Math.max(this.appConfig.minWidth || 220, startW + (e.clientX - startX));
        const newH = Math.max(this.appConfig.minHeight || 160, startH + (e.clientY - startY));

        this.width = newW;
        this.height = newH;
        this.element.style.width = `${newW}px`;
        this.element.style.height = `${newH}px`;
      };

      const onMouseUp = () => {
        if (!isResizing) return;
        isResizing = false;
        document.body.classList.remove('window-is-resizing');
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };

      resizer.addEventListener('mousedown', onMouseDown);
    }

    bringToFront() {
      _topZIndex += 1;
      this.element.style.zIndex = _topZIndex;

      // Update active state CSS across windows
      document.querySelectorAll('.window-container').forEach(w => w.classList.add('inactive'));
      this.element.classList.remove('inactive');

      _activeWindow = this;
      notifyChange();
    }

    minimize() {
      this.isMinimized = true;
      this.element.classList.add('minimized');

      // Pick next active window
      const remaining = Array.from(_openWindows.values()).filter(w => !w.isMinimized && w !== this);
      if (remaining.length > 0) {
        remaining[remaining.length - 1].bringToFront();
      } else {
        _activeWindow = null;
      }
      notifyChange();
    }

    restore() {
      this.isMinimized = false;
      this.element.classList.remove('minimized');
      this.bringToFront();
    }

    toggleMaximize() {
      if (this.isMaximized) {
        // Restore
        this.element.classList.remove('maximized');
        this.element.style.left = `${this.prevRect.left}px`;
        this.element.style.top = `${this.prevRect.top}px`;
        this.element.style.width = `${this.prevRect.width}px`;
        this.element.style.height = `${this.prevRect.height}px`;
        this.isMaximized = false;
      } else {
        // Maximize
        this.prevRect = {
          left: this.element.offsetLeft,
          top: this.element.offsetTop,
          width: this.element.offsetWidth,
          height: this.element.offsetHeight
        };
        this.element.classList.add('maximized');
        this.isMaximized = true;
      }
      notifyChange();
    }

    close() {
      if (typeof this.appConfig.onClose === 'function') {
        this.appConfig.onClose(this);
      }

      this.element.remove();
      _openWindows.delete(this.appId);

      // Focus next top window
      const remaining = Array.from(_openWindows.values()).filter(w => !w.isMinimized);
      if (remaining.length > 0) {
        remaining[remaining.length - 1].bringToFront();
      } else {
        _activeWindow = null;
      }
      notifyChange();
    }
  }

  const api = {
    /**
     * Open an app window by App ID or App Config
     * If window already open, restore and focus it (prevent duplicates)
     */
    open(appIdOrConfig) {
      const config = typeof appIdOrConfig === 'string' 
        ? AppRegistry.get(appIdOrConfig) 
        : appIdOrConfig;

      if (!config) {
        console.error(`[WindowManager] App '${appIdOrConfig}' not found in AppRegistry.`);
        return null;
      }

      // Check if instance already open
      if (_openWindows.has(config.id)) {
        const existingWin = _openWindows.get(config.id);
        if (existingWin.isMinimized) {
          existingWin.restore();
        } else {
          existingWin.bringToFront();
        }
        return existingWin;
      }

      // Create new instance
      const win = new WindowInstance(config);
      _openWindows.set(config.id, win);
      notifyChange();
      return win;
    },

    /**
     * Get open window instance by app ID
     */
    get(appId) {
      return _openWindows.get(appId) || null;
    },

    /**
     * Get all open windows
     */
    getAll() {
      return Array.from(_openWindows.values());
    },

    /**
     * Minimize all windows (Show Desktop toggle)
     */
    minimizeAll() {
      const wins = Array.from(_openWindows.values());
      const anyVisible = wins.some(w => !w.isMinimized);
      wins.forEach(w => {
        if (anyVisible) {
          if (!w.isMinimized) w.minimize();
        } else {
          w.restore();
        }
      });
    },

    /**
     * Cascade windows (classic Windows XP cascade)
     */
    cascade() {
      const wins = Array.from(_openWindows.values()).filter(w => !w.isMinimized);
      const area = workArea();
      const step = 28;
      wins.forEach((w, idx) => {
        if (w.isMaximized) w.toggleMaximize();
        w.element.style.width = `${Math.min(640, area.w - 100)}px`;
        w.element.style.height = `${Math.min(460, area.h - 100)}px`;
        w.element.style.left = `${Math.min(30 + idx * step, area.w - 200)}px`;
        w.element.style.top = `${Math.min(30 + idx * step, area.h - 200)}px`;
        w.bringToFront();
      });
    },

    /**
     * Tile windows horizontally
     */
    tileHorizontally() {
      const wins = Array.from(_openWindows.values()).filter(w => !w.isMinimized);
      if (wins.length === 0) return;
      const area = workArea();
      const h = Math.floor(area.h / wins.length);
      wins.forEach((w, idx) => {
        if (w.isMaximized) w.toggleMaximize();
        w.element.style.left = '0px';
        w.element.style.top = `${idx * h}px`;
        w.element.style.width = `${area.w}px`;
        w.element.style.height = `${h}px`;
        w.bringToFront();
      });
    },

    /**
     * Tile windows vertically
     */
    tileVertically() {
      const wins = Array.from(_openWindows.values()).filter(w => !w.isMinimized);
      if (wins.length === 0) return;
      const area = workArea();
      const w = Math.floor(area.w / wins.length);
      wins.forEach((win, idx) => {
        if (win.isMaximized) win.toggleMaximize();
        win.element.style.left = `${idx * w}px`;
        win.element.style.top = '0px';
        win.element.style.width = `${w}px`;
        win.element.style.height = `${area.h}px`;
        win.bringToFront();
      });
    },

    /**
     * Close a window
     */
    close(appId) {
      const win = _openWindows.get(appId);
      if (win) win.close();
    },

    /**
     * Toggle minimize / restore from taskbar
     */
    toggleFromTaskbar(appId) {
      const win = _openWindows.get(appId);
      if (!win) return;

      if (win.isMinimized) {
        win.restore();
      } else if (_activeWindow === win) {
        win.minimize();
      } else {
        win.bringToFront();
      }
    },

    /**
     * Listen for window state changes (for taskbar, etc.)
     */
    onChange(callback) {
      if (typeof callback === 'function') {
        _listeners.change.push(callback);
      }
    }
  };

  // Sync open windows and child iframes when system language changes
  if (window.I18n && typeof I18n.onChange === 'function') {
    I18n.onChange((lang) => {
      _openWindows.forEach(win => {
        if (win.appConfig && win.appConfig.i18nTitleKey) {
          win.title = I18n.t(win.appConfig.i18nTitleKey);
          const titleEl = win.element.querySelector('.window-title');
          if (titleEl) titleEl.textContent = win.title;
        }
        const menuItems = win.element.querySelectorAll('.window-menubar .menu-item');
        if (menuItems.length === 4) {
          menuItems[0].textContent = I18n.t('win.file');
          menuItems[1].textContent = I18n.t('win.edit');
          menuItems[2].textContent = I18n.t('win.view');
          menuItems[3].textContent = I18n.t('win.help');
        }
        const statusSpans = win.element.querySelectorAll('.window-statusbar span');
        if (statusSpans.length >= 1) {
          statusSpans[0].textContent = I18n.t('system.ready');
        }
      });

      document.querySelectorAll('iframe').forEach(iframe => {
        try {
          iframe.contentWindow?.postMessage({ type: 'mpc:lang-change', lang }, '*');
        } catch (e) {}
      });

      notifyChange();
    });
  }

  return api;
})();

window.WindowManager = WindowManager;
