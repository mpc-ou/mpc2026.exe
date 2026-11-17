/**
 * ============================================================================
 * Taskbar - XP Luna Taskbar, Bilingual Switcher (VI/EN) & Start Menu
 * ============================================================================
 */

const Taskbar = (function () {
  let _startBtn = null;
  let _startMenu = null;
  let _tasksArea = null;
  let _clockEl = null;

  // System Tray Popups
  let _volumePopup = null;
  let _networkPopup = null;
  let _calendarPopup = null;
  let _shutdownModal = null;
  let _langBtn = null;

  function init() {
    _startBtn = document.getElementById('start-button');
    _startMenu = document.getElementById('start-menu');
    _tasksArea = document.getElementById('taskbar-tasks');
    _clockEl = document.getElementById('system-clock');
    _langBtn = document.getElementById('tray-lang-btn');

    _volumePopup = document.getElementById('tray-volume-popup');
    _networkPopup = document.getElementById('tray-network-popup');
    _calendarPopup = document.getElementById('tray-calendar-popup');
    _shutdownModal = document.getElementById('xp-shutdown-modal');

    setupClock();
    setupStartMenu();
    setupSystemTrayWidgets();
    setupShutdownModal();
    setupTaskbarContextMenu();
    setupWindowManagerListener();

    // Listen for language changes
    if (window.I18n) {
      window.I18n.onChange(() => {
        updateTranslations();
        renderStartMenuItems();
        renderMonthlyCalendar();
      });
      updateTranslations();
    }
  }

  function setupClock() {
    function update() {
      if (!_clockEl) return;
      const now = new Date();
      let hours = now.getHours();
      let minutes = now.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      const strMinutes = minutes < 10 ? '0' + minutes : minutes;
      _clockEl.textContent = `${hours}:${strMinutes} ${ampm}`;

      updateAnalogClock(now);
    }
    update();
    setInterval(update, 1000);
  }

  function setupSystemTrayWidgets() {
    const volIcon = document.getElementById('tray-vol-icon');
    const netIcon = document.getElementById('tray-net-icon');
    const clockTray = document.getElementById('system-clock');

    function closeTrayPopups() {
      _volumePopup?.classList.add('hidden');
      _networkPopup?.classList.add('hidden');
      _calendarPopup?.classList.add('hidden');
    }

    // Language switcher toggle (VI <-> EN)
    _langBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      window.I18n?.toggleLanguage();
    });

    volIcon?.addEventListener('click', (e) => {
      e.stopPropagation();
      const isClosed = _volumePopup.classList.contains('hidden');
      closeTrayPopups();
      if (isClosed) {
        if (window.MasterVolume) {
          if (volSlider) volSlider.value = String(Math.round(MasterVolume.get() * 100));
          if (volMute) volMute.checked = MasterVolume.isMuted();
        }
        _volumePopup.classList.remove('hidden');
      }
    });

    const volSlider = document.getElementById('tray-vol-slider');
    const volMute = document.getElementById('tray-vol-mute');
    volSlider?.addEventListener('input', (e) => {
      const vol = e.target.value / 100;
      if (window.MasterVolume) {
        window.MasterVolume.set(vol);
      } else if (window.BootManager && window.BootManager.setVolume) {
        window.BootManager.setVolume(volMute?.checked ? 0 : vol);
      }
    });

    volMute?.addEventListener('change', (e) => {
      if (window.MasterVolume) {
        window.MasterVolume.setMuted(e.target.checked);
      } else if (window.BootManager && window.BootManager.setVolume) {
        const vol = volSlider ? volSlider.value / 100 : 0.8;
        window.BootManager.setVolume(e.target.checked ? 0 : vol);
      }
    });

    netIcon?.addEventListener('click', (e) => {
      e.stopPropagation();
      const isClosed = _networkPopup.classList.contains('hidden');
      closeTrayPopups();
      if (isClosed) _networkPopup.classList.remove('hidden');
    });

    clockTray?.addEventListener('click', (e) => {
      e.stopPropagation();
      const isClosed = _calendarPopup.classList.contains('hidden');
      closeTrayPopups();
      if (isClosed) {
        _calendarPopup.classList.remove('hidden');
        renderMonthlyCalendar();
      }
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.tray-popup') && !e.target.closest('.system-tray')) {
        closeTrayPopups();
      }
    });
  }

  function updateTranslations() {
    if (!window.I18n) return;
    const isVi = I18n.getLanguage() === 'vi';

    // Start button text
    const startTextEl = _startBtn?.querySelector('span');
    if (startTextEl) {
      startTextEl.textContent = isVi ? 'bắt đầu' : 'start';
    }

    // Language Pill
    if (_langBtn) {
      _langBtn.innerHTML = `<i class="bi bi-translate" style="font-size: 11px; margin-right: 3px;"></i>${I18n.getLanguage().toUpperCase()}`;
    }

    // Apply all data-i18n tags inside taskbar and start menu
    I18n.applyDOMTranslations();
  }

  function updateAnalogClock(now) {
    const hourHand = document.getElementById('analog-hour');
    const minHand = document.getElementById('analog-min');
    const secHand = document.getElementById('analog-sec');
    if (!hourHand || !minHand || !secHand) return;

    const s = now.getSeconds();
    const m = now.getMinutes() + s / 60;
    const h = (now.getHours() % 12) + m / 60;

    secHand.style.transform = `rotate(${s * 6}deg)`;
    minHand.style.transform = `rotate(${m * 6}deg)`;
    hourHand.style.transform = `rotate(${h * 30}deg)`;
  }

  function renderMonthlyCalendar() {
    const calEl = document.getElementById('calendar-grid');
    const monthTitle = document.getElementById('cal-month-title');
    if (!calEl || !monthTitle) return;

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const today = now.getDate();
    const isVi = window.I18n ? I18n.getLanguage() === 'vi' : true;

    monthTitle.textContent = isVi
      ? `Tháng ${month + 1}, ${year}`
      : now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    let html = '';
    const weekdays = isVi 
      ? ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
      : ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    weekdays.forEach(day => {
      html += `<div class="cal-day-header">${day}</div>`;
    });

    for (let i = 0; i < firstDayIndex; i++) {
      html += `<div class="cal-day-cell cal-empty"></div>`;
    }

    for (let d = 1; d <= totalDays; d++) {
      const isToday = d === today;
      html += `<div class="cal-day-cell ${isToday ? 'cal-today' : ''}">${d}</div>`;
    }

    calEl.innerHTML = html;
  }

  function setupStartMenu() {
    if (!_startBtn || !_startMenu) return;

    _startBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isVisible = !_startMenu.classList.contains('hidden');
      if (isVisible) closeStartMenu();
      else openStartMenu();
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('#start-menu') && !e.target.closest('#start-button')) {
        closeStartMenu();
      }
    });

    renderStartMenuItems();
    AppRegistry.onRegister(() => renderStartMenuItems());

    document.getElementById('start-logoff')?.addEventListener('click', () => {
      closeStartMenu();
      window.BootManager?.goToLogin();
    });

    document.getElementById('start-shutdown')?.addEventListener('click', () => {
      closeStartMenu();
      showShutdownModal();
    });
  }

  function setupShutdownModal() {
    if (!_shutdownModal) return;

    const btnStandBy = document.getElementById('btn-standby');
    const btnTurnOff = document.getElementById('btn-turnoff');
    const btnRestart = document.getElementById('btn-restart');
    const btnCancel = document.getElementById('btn-cancel-shutdown');

    btnCancel?.addEventListener('click', hideShutdownModal);

    btnStandBy?.addEventListener('click', () => {
      hideShutdownModal();
      const sleepOverlay = document.createElement('div');
      sleepOverlay.className = 'xp-sleep-overlay';
      const hint = window.I18n ? I18n.t('shutdown.sleep_hint') : '[Computer in Stand By Mode - Click anywhere to wake up]';
      sleepOverlay.innerHTML = `<div style="color: #666; font-size: 13px;">${hint}</div>`;
      document.body.appendChild(sleepOverlay);
      sleepOverlay.addEventListener('click', () => sleepOverlay.remove());
    });

    btnTurnOff?.addEventListener('click', () => {
      hideShutdownModal();
      window.BootManager?.goToShutdown();
    });

    btnRestart?.addEventListener('click', () => {
      hideShutdownModal();
      if (window.BootManager) window.BootManager.restart();
      else window.location.reload();
    });
  }

  function showShutdownModal() {
    _shutdownModal?.classList.remove('hidden');
    document.getElementById('desktop')?.classList.add('desktop-desaturated');
  }

  function hideShutdownModal() {
    _shutdownModal?.classList.add('hidden');
    document.getElementById('desktop')?.classList.remove('desktop-desaturated');
  }

  function openStartMenu() {
    _startMenu.classList.remove('hidden');
    _startBtn.classList.add('active');
  }

  function closeStartMenu() {
    _startMenu.classList.add('hidden');
    _startBtn.classList.remove('active');
  }

  function renderStartMenuItems() {
    const leftCol = document.getElementById('start-left-items');
    if (!leftCol) return;
    leftCol.innerHTML = '';

    const apps = AppRegistry.getAll().filter(app => app.showInStartMenu !== false);

    apps.forEach(app => {
      const item = document.createElement('div');
      item.className = 'start-item';

      const iconGraphic = app.iconUrl
        ? `<img src="${app.iconUrl}" class="start-item-icon-img" alt="" />`
        : (app.iconSvg ? app.iconSvg : '📁');

      let title = app.title;
      if (window.I18n) {
        if (app.i18nTitleKey) title = I18n.t(app.i18nTitleKey);
        else if (I18n.t(`app.${app.id.toLowerCase()}.title`) !== `app.${app.id.toLowerCase()}.title`) {
          title = I18n.t(`app.${app.id.toLowerCase()}.title`);
        }
      }

      // "ABOUT_MPC.txt - Giới thiệu MPClub" -> name "ABOUT_MPC.txt", description "Giới thiệu MPClub"
      const dash = title.indexOf(' - ');
      const name = dash > 0 ? title.slice(0, dash) : title;
      const desc = dash > 0 ? title.slice(dash + 3) : app.id;

      item.innerHTML = `
        <div class="start-item-icon">${iconGraphic}</div>
        <div class="start-item-text">
          <span class="start-item-title">${name}</span>
          <span class="start-item-desc">${desc}</span>
        </div>
      `;

      item.addEventListener('click', () => {
        closeStartMenu();
        WindowManager.open(app.id);
      });

      leftCol.appendChild(item);
    });
  }

  let _hoverPreviewTimer = null;
  let _currentHoveredAppId = null;
  let _activeContextAppId = null;

  function closeAllTaskbarMenus() {
    document.getElementById('taskbar-context-menu')?.classList.add('hidden');
    document.getElementById('task-item-context-menu')?.classList.add('hidden');
    hideTaskPreview();
  }

  function hideTaskPreview() {
    const tooltip = document.getElementById('task-preview-tooltip');
    if (tooltip) tooltip.classList.add('hidden');
    _currentHoveredAppId = null;
  }

  function setupTaskbarContextMenu() {
    const taskbar = document.getElementById('taskbar');
    const tbCtx = document.getElementById('taskbar-context-menu');
    const taskCtx = document.getElementById('task-item-context-menu');
    const previewTooltip = document.getElementById('task-preview-tooltip');

    if (!taskbar || !tbCtx) return;

    // Right-click on empty taskbar area
    taskbar.addEventListener('contextmenu', (e) => {
      if (e.target.closest('.task-item') || e.target.closest('#start-button') || e.target.closest('.system-tray')) {
        return;
      }
      e.preventDefault();
      closeAllTaskbarMenus();

      let x = e.clientX;
      let y = e.clientY - 210;
      if (x + 190 > window.innerWidth) x = window.innerWidth - 195;
      if (y < 10) y = 10;

      tbCtx.style.left = `${x}px`;
      tbCtx.style.top = `${y}px`;
      tbCtx.classList.remove('hidden');
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#taskbar-context-menu') && !e.target.closest('#task-item-context-menu')) {
        closeAllTaskbarMenus();
      }
    });

    // Taskbar context menu action buttons
    document.getElementById('tb-ctx-cascade')?.addEventListener('click', () => {
      closeAllTaskbarMenus();
      WindowManager.cascade();
    });

    document.getElementById('tb-ctx-tile-h')?.addEventListener('click', () => {
      closeAllTaskbarMenus();
      WindowManager.tileHorizontally();
    });

    document.getElementById('tb-ctx-tile-v')?.addEventListener('click', () => {
      closeAllTaskbarMenus();
      WindowManager.tileVertically();
    });

    document.getElementById('tb-ctx-show-desktop')?.addEventListener('click', () => {
      closeAllTaskbarMenus();
      WindowManager.minimizeAll();
    });

    document.getElementById('tb-ctx-taskmgr')?.addEventListener('click', () => {
      closeAllTaskbarMenus();
      WindowManager.open('taskmgr.exe');
    });

    document.getElementById('tb-ctx-properties')?.addEventListener('click', () => {
      closeAllTaskbarMenus();
      const isVi = window.I18n && I18n.getLanguage() === 'vi';
      XPDialog.alert(
        isVi 
          ? 'Thuộc tính Thanh tác vụ (Taskbar Properties)\n- Khóa thanh tác vụ: Đã bật\n- Tự động ẩn: Tắt\n- Hiển thị đồng hồ: Bật' 
          : 'Taskbar and Start Menu Properties\n- Lock the taskbar: Enabled\n- Auto-hide taskbar: Disabled\n- Show the clock: Enabled',
        isVi ? 'Thuộc tính Taskbar' : 'Taskbar Properties',
        { icon: 'info' }
      );
    });

    // Task item context menu actions
    document.getElementById('task-ctx-restore')?.addEventListener('click', () => {
      if (_activeContextAppId) {
        const win = WindowManager.get(_activeContextAppId);
        if (win) win.restore();
      }
      closeAllTaskbarMenus();
    });

    document.getElementById('task-ctx-minimize')?.addEventListener('click', () => {
      if (_activeContextAppId) {
        const win = WindowManager.get(_activeContextAppId);
        if (win) win.minimize();
      }
      closeAllTaskbarMenus();
    });

    document.getElementById('task-ctx-maximize')?.addEventListener('click', () => {
      if (_activeContextAppId) {
        const win = WindowManager.get(_activeContextAppId);
        if (win) win.toggleMaximize();
      }
      closeAllTaskbarMenus();
    });

    document.getElementById('task-ctx-close')?.addEventListener('click', () => {
      if (_activeContextAppId) {
        WindowManager.close(_activeContextAppId);
      }
      closeAllTaskbarMenus();
    });

    // Preview tooltip close button
    document.getElementById('task-preview-close-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (_currentHoveredAppId) {
        WindowManager.close(_currentHoveredAppId);
        hideTaskPreview();
      }
    });

    previewTooltip?.addEventListener('mouseenter', () => {
      if (_hoverPreviewTimer) clearTimeout(_hoverPreviewTimer);
    });

    previewTooltip?.addEventListener('mouseleave', () => {
      hideTaskPreview();
    });
  }

  function setupWindowManagerListener() {
    WindowManager.onChange((windowsList) => {
      if (!_tasksArea) return;
      _tasksArea.innerHTML = '';

      const taskCtx = document.getElementById('task-item-context-menu');
      const previewTooltip = document.getElementById('task-preview-tooltip');
      const previewTitle = document.getElementById('task-preview-title');
      const previewThumb = document.getElementById('task-preview-thumb');

      windowsList.forEach(win => {
        const taskBtn = document.createElement('button');
        taskBtn.className = 'task-item';
        taskBtn.dataset.appId = win.appId;
        if (win.isActive && !win.isMinimized) {
          taskBtn.classList.add('active');
        }

        const iconGraphic = win.iconUrl
          ? `<img src="${win.iconUrl}" style="width: 16px; height: 16px;" alt="" />`
          : (win.iconSvg ? win.iconSvg : '📁');

        taskBtn.innerHTML = `
          <div class="task-item-icon">${iconGraphic}</div>
          <span class="task-item-title">${win.title}</span>
        `;

        taskBtn.addEventListener('click', () => {
          hideTaskPreview();
          WindowManager.toggleFromTaskbar(win.appId);
        });

        // Hover Preview Tooltip
        taskBtn.addEventListener('mouseenter', () => {
          if (_hoverPreviewTimer) clearTimeout(_hoverPreviewTimer);
          _hoverPreviewTimer = setTimeout(() => {
            if (!previewTooltip) return;
            _currentHoveredAppId = win.appId;
            if (previewTitle) previewTitle.textContent = win.title;
            
            // Generate snapshot representation
            if (previewThumb) {
              previewThumb.innerHTML = `
                <div style="font-size: 24px; margin-bottom: 4px;">${iconGraphic}</div>
                <div style="font-weight: bold; color: #003399; font-size: 11px;">${win.title}</div>
                <div style="color: #666; font-size: 9px;">${win.isMinimized ? 'Minimized' : 'Running'} • MPC.exe</div>
              `;
            }

            const btnRect = taskBtn.getBoundingClientRect();
            let left = btnRect.left + (btnRect.width / 2) - 95;
            if (left < 10) left = 10;
            if (left + 190 > window.innerWidth) left = window.innerWidth - 195;

            previewTooltip.style.left = `${left}px`;
            previewTooltip.classList.remove('hidden');
          }, 300);
        });

        taskBtn.addEventListener('mouseleave', () => {
          if (_hoverPreviewTimer) clearTimeout(_hoverPreviewTimer);
          _hoverPreviewTimer = setTimeout(() => {
            hideTaskPreview();
          }, 250);
        });

        // Right click on task button
        taskBtn.addEventListener('contextmenu', (e) => {
          e.preventDefault();
          e.stopPropagation();
          hideTaskPreview();
          closeAllTaskbarMenus();

          _activeContextAppId = win.appId;

          // Update menu items enabled/disabled state
          const btnRestore = document.getElementById('task-ctx-restore');
          const btnMin = document.getElementById('task-ctx-minimize');
          const btnMax = document.getElementById('task-ctx-maximize');

          if (btnRestore) {
            btnRestore.classList.toggle('disabled', !win.isMinimized);
          }
          if (btnMin) {
            btnMin.classList.toggle('disabled', win.isMinimized);
          }
          if (btnMax) {
            btnMax.querySelector('span').textContent = win.isMaximized ? 'Restore' : 'Maximize';
          }

          let x = e.clientX;
          let y = e.clientY - 170;
          if (x + 160 > window.innerWidth) x = window.innerWidth - 165;
          if (y < 10) y = 10;

          if (taskCtx) {
            taskCtx.style.left = `${x}px`;
            taskCtx.style.top = `${y}px`;
            taskCtx.classList.remove('hidden');
          }
        });

        _tasksArea.appendChild(taskBtn);
      });
    });
  }

  return {
    init,
    openStartMenu,
    closeStartMenu,
    showShutdownModal,
    hideShutdownModal,
    updateTranslations
  };
})();

window.Taskbar = Taskbar;
