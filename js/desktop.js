/**
 * ============================================================================
 * Desktop - Desktop Icons, Right-Click Context Menu & Bilingual Support
 * ============================================================================
 */

const Desktop = (function () {
  let _iconsContainer = null;
  let _selectedIcon = null;
  let _contextMenu = null;

  function init() {
    _iconsContainer = document.getElementById('desktop-icons');
    _contextMenu = document.getElementById('desktop-context-menu');
    if (!_iconsContainer) return;

    renderIcons();

    AppRegistry.onRegister(() => {
      renderIcons();
    });

    // Reactive re-render on language change
    if (window.I18n) {
      window.I18n.onChange(() => {
        renderIcons();
        updateContextMenuText();
      });
    }

    // Deselect icons when clicking on desktop background
    document.getElementById('desktop').addEventListener('mousedown', (e) => {
      if (!e.target.closest('.desktop-icon') && !e.target.closest('.window-container') && !e.target.closest('.taskbar-container') && !e.target.closest('#desktop-context-menu')) {
        clearSelection();
        closeContextMenu();
      }
    });

    setupContextMenu();
    setupRubberBandSelection();
  }

  function clearSelection() {
    if (_selectedIcon) {
      _selectedIcon.classList.remove('selected');
      _selectedIcon = null;
    }
  }

  function renderIcons() {
    if (!_iconsContainer) return;
    _iconsContainer.innerHTML = '';

    const apps = AppRegistry.getAll().filter(app => app.showOnDesktop !== false);

    apps.forEach(app => {
      const iconEl = document.createElement('div');
      iconEl.className = 'desktop-icon';
      iconEl.dataset.appId = app.id;

      if (app.featured) {
        iconEl.classList.add('featured-join');
      }

      const iconGraphic = app.iconUrl
        ? `<img src="${app.iconUrl}" class="desktop-icon-img-file" alt="${app.title}" />`
        : (app.iconSvg ? app.iconSvg : '📁');

      // Resolve translated label if available
      let label = app.desktopLabel || app.title;
      if (window.I18n) {
        if (app.i18nLabelKey) label = I18n.t(app.i18nLabelKey);
        else if (I18n.t(`app.${app.id.toLowerCase()}.label`) !== `app.${app.id.toLowerCase()}.label`) {
          label = I18n.t(`app.${app.id.toLowerCase()}.label`);
        }
      }

      iconEl.innerHTML = `
        <div class="desktop-icon-img">${iconGraphic}</div>
        <div class="desktop-icon-label">${String(label).replace(/([_.])/g, '$1<wbr>')}</div>
      `;

      iconEl.addEventListener('click', (e) => {
        e.stopPropagation();
        closeContextMenu();
        clearSelection();
        _selectedIcon = iconEl;
        iconEl.classList.add('selected');
      });

      iconEl.addEventListener('dblclick', () => {
        WindowManager.open(app.id);
      });

      // Touch: a single tap opens the app; a finger that moved > 10px was scrolling.
      let touchStart = null;
      iconEl.addEventListener('touchstart', (e) => {
        const t = e.touches[0];
        touchStart = { x: t.clientX, y: t.clientY };
      }, { passive: true });

      iconEl.addEventListener('touchend', (e) => {
        if (!touchStart) return;
        const t = e.changedTouches[0];
        const moved = Math.hypot(t.clientX - touchStart.x, t.clientY - touchStart.y);
        touchStart = null;
        if (moved > 10) return;
        e.preventDefault(); // stop the synthetic click/dblclick that would follow
        closeContextMenu();
        clearSelection();
        _selectedIcon = iconEl;
        iconEl.classList.add('selected');
        WindowManager.open(app.id);
      });

      _iconsContainer.appendChild(iconEl);
    });
  }

  function setupContextMenu() {
    const desktop = document.getElementById('desktop');
    if (!desktop || !_contextMenu) return;

    desktop.addEventListener('contextmenu', (e) => {
      if (e.target.closest('.window-container') || e.target.closest('.taskbar-container')) {
        return;
      }
      e.preventDefault();

      let x = e.clientX;
      let y = e.clientY;

      if (x + 160 > window.innerWidth) x = window.innerWidth - 165;
      if (y + 200 > window.innerHeight) y = window.innerHeight - 205;

      _contextMenu.style.left = `${x}px`;
      _contextMenu.style.top = `${y}px`;
      _contextMenu.classList.remove('hidden');
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('#desktop-context-menu')) {
        closeContextMenu();
      }
    });

    document.getElementById('ctx-refresh')?.addEventListener('click', () => {
      closeContextMenu();
      triggerRefreshAnimation();
    });

    document.getElementById('ctx-new-folder')?.addEventListener('click', () => {
      closeContextMenu();
      alert(I18n.getLanguage() === 'vi' ? 'Đã tạo thư mục mới trên Desktop!' : 'New Folder created on Desktop!');
    });

    document.getElementById('ctx-properties')?.addEventListener('click', () => {
      closeContextMenu();
      showDisplayProperties();
    });

    updateContextMenuText();
  }

  function updateContextMenuText() {
    if (!window.I18n) return;
    document.querySelectorAll('#desktop-context-menu [data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (key) el.textContent = I18n.t(key);
    });
  }

  function closeContextMenu() {
    _contextMenu?.classList.add('hidden');
  }

  function triggerRefreshAnimation() {
    const desktop = document.getElementById('desktop');
    desktop.classList.add('desktop-refreshing');
    renderIcons();
    setTimeout(() => {
      desktop.classList.remove('desktop-refreshing');
    }, 250);
  }

  function showDisplayProperties() {
    const isVi = I18n.getLanguage() === 'vi';
    WindowManager.open({
      id: 'display-properties',
      title: isVi ? 'Thuộc tính Màn hình' : 'Display Properties',
      iconUrl: 'assets/icons/my-computer.svg',
      width: 440,
      height: 380,
      showOnDesktop: false,
      showInStartMenu: false,
      render: (c) => {
        c.innerHTML = `
          <div style="padding: 16px; font-family: Tahoma, sans-serif; font-size: 11px;">
            <div style="border: 1px solid #7f9db9; padding: 12px; background: #fff; margin-bottom: 12px; text-align: center;">
              <img src="assets/backgrounds/bg.jpg" style="width: 140px; height: 90px; object-fit: cover; border: 2px solid #333;" alt="Wallpaper Preview" />
              <div style="margin-top: 6px; font-weight: bold;">Bliss - MPCrosoft XP Edition</div>
            </div>
            <div style="display: flex; flex-direction: column; gap: 6px;">
              <div><b>${isVi ? 'Giao diện:' : 'Theme:'}</b> Windows XP Luna Blue</div>
              <div><b>${isVi ? 'Độ phân giải:' : 'Resolution:'}</b> ${window.innerWidth} x ${window.innerHeight}</div>
              <div><b>${isVi ? 'Chất lượng màu:' : 'Color Quality:'}</b> Highest (32 bit)</div>
              <div><b>${isVi ? 'Hình nền:' : 'Background:'}</b> assets/backgrounds/bg.jpg</div>
            </div>
          </div>
        `;
      }
    });
  }

  function setupRubberBandSelection() {
    const desktop = document.getElementById('desktop');
    const box = document.getElementById('selection-box');
    if (!desktop || !box) return;

    let isSelecting = false;
    let startX = 0, startY = 0;

    desktop.addEventListener('mousedown', (e) => {
      if (e.target !== desktop && !e.target.classList.contains('desktop-grid-overlay')) return;
      if (e.button !== 0) return;

      isSelecting = true;
      startX = e.clientX;
      startY = e.clientY;
      box.style.left = `${startX}px`;
      box.style.top = `${startY}px`;
      box.style.width = '0px';
      box.style.height = '0px';
      box.style.display = 'block';
    });

    window.addEventListener('mousemove', (e) => {
      if (!isSelecting) return;
      const currentX = e.clientX;
      const currentY = e.clientY;

      const left = Math.min(startX, currentX);
      const top = Math.min(startY, currentY);
      const width = Math.abs(currentX - startX);
      const height = Math.abs(currentY - startY);

      box.style.left = `${left}px`;
      box.style.top = `${top}px`;
      box.style.width = `${width}px`;
      box.style.height = `${height}px`;
    });

    window.addEventListener('mouseup', () => {
      if (isSelecting) {
        isSelecting = false;
        box.style.display = 'none';
      }
    });
  }

  return {
    init,
    renderIcons,
    clearSelection
  };
})();

window.Desktop = Desktop;
