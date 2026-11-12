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
      this.width = Math.min(appConfig.width || 600, window.innerWidth - 30);
      this.height = Math.min(appConfig.height || 420, window.innerHeight - 70);
      this.isMinimized = false;
      this.isMaximized = false;
      this.prevRect = null;
      this.appConfig = appConfig;

      // Position cascade calculation
      const offset = (_openWindows.size * 26) % 180;
      this.posX = Math.max(30, Math.min(80 + offset, window.innerWidth - this.width - 20));
      this.posY = Math.max(30, Math.min(50 + offset, window.innerHeight - this.height - 60));

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

  return {
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
})();

window.WindowManager = WindowManager;
