/**
 * ============================================================================
 * Desktop - Icons Draggable & Snapped to Grid, VFS Persistence, Context Menus
 * ============================================================================
 * Features:
 * - Icons can be freely dragged with mouse/touch and snap to grid (86px x 92px)
 * - Saved positions persistent across reboots via localStorage ('mpc_desktop_positions')
 * - Right-click context menu on icons: Open, Cut, Copy, Delete, Rename, Properties
 * - Right-click context menu on desktop: Refresh, Paste, New (Folder, Text, Image), Properties
 * - Rubber-band multi-selection box
 */

const Desktop = (function () {
  const POSITIONS_KEY = 'mpc_desktop_positions_v2';
  const GRID_W = 86;
  const GRID_H = 92;
  const OFFSET_X = 14;
  const OFFSET_Y = 14;

  let _iconsContainer = null;
  let _selectedIcon = null;
  let _contextMenu = null;
  let _iconContextMenu = null;
  let _newSubmenu = null;
  let _sortSubmenu = null;
  let _activeContextItem = null; // { type: 'app'|'vfs', id: string, vfsPath?: string, name?: string }
  let _savedPositions = {};

  function init() {
    _iconsContainer = document.getElementById('desktop-icons');
    _contextMenu = document.getElementById('desktop-context-menu');
    _iconContextMenu = document.getElementById('icon-context-menu');
    _newSubmenu = document.getElementById('desktop-new-submenu');
    _sortSubmenu = document.getElementById('desktop-sort-submenu');
    if (!_iconsContainer) return;

    loadSavedPositions();
    renderIcons();

    AppRegistry.onRegister(() => {
      renderIcons();
    });

    if (window.VFS && VFS.onChange) {
      VFS.onChange(() => {
        renderIcons();
      });
    }

    if (window.I18n) {
      window.I18n.onChange(() => {
        renderIcons();
        updateContextMenuText();
      });
    }

    // Deselect icons when clicking on desktop background
    document.getElementById('desktop').addEventListener('mousedown', (e) => {
      if (!e.target.closest('.desktop-icon') && !e.target.closest('.window-container') && 
          !e.target.closest('.taskbar-container') && !e.target.closest('#desktop-context-menu') &&
          !e.target.closest('#icon-context-menu') && !e.target.closest('#desktop-new-submenu') && !e.target.closest('#desktop-sort-submenu')) {
        clearSelection();
        closeAllContextMenus();
      }
    });

    setupDesktopContextMenu();
    setupIconContextMenu();
    setupRubberBandSelection();

    // Auto re-sort icons when window is resized
    let resizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (document.body.classList.contains('window-is-dragging')) return;
        autoArrangeIcons('default');
      }, 80);
    });

    // F5 refresh desktop icons shortcut
    window.addEventListener('keydown', (e) => {
      if (e.key === 'F5') {
        const active = document.activeElement;
        const isInput = active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable);
        if (!isInput) {
          e.preventDefault();
          triggerRefreshAnimation();
        }
      }
    });
  }

  function loadSavedPositions() {
    try {
      const data = localStorage.getItem(POSITIONS_KEY);
      if (data) {
        _savedPositions = JSON.parse(data) || {};
      }
    } catch (e) {
      _savedPositions = {};
    }
  }

  function savePositions() {
    try {
      localStorage.setItem(POSITIONS_KEY, JSON.stringify(_savedPositions));
    } catch (e) {}
  }

  function clearSelection() {
    if (_selectedIcon) {
      _selectedIcon.classList.remove('selected');
      _selectedIcon = null;
    }
  }

  function closeAllContextMenus() {
    _contextMenu?.classList.add('hidden');
    _iconContextMenu?.classList.add('hidden');
    _newSubmenu?.classList.add('hidden');
    _sortSubmenu?.classList.add('hidden');
  }

  function getAppOrder(appId) {
    if (!appId) return 999;
    switch (appId) {
      case 'my-computer': return 1;
      case 'RECYCLE_BIN': return 2;
      case 'iexplore.exe': return 3;
      case 'JOIN_MPC.exe': return 4;
      case 'ABOUT_MPC': return 5;
      case 'OUR_TEAMS': return 6;
      case 'ACTIVITIES': return 7;
      case 'EVENTS': return 8;
      case 'DIARY': return 9;
      case 'FAQ.txt': return 10;
      case 'wmplayer.exe': return 11;
      case 'mspaint.exe': return 12;
      case 'calc.exe': return 13;
      case 'winmine.exe': return 14;
      default: return 50;
    }
  }

  function renderIcons() {
    if (!_iconsContainer) return;
    _iconsContainer.innerHTML = '';

    const areaH = window.innerHeight - 50;
    const rowsPerCol = Math.max(1, Math.floor((areaH - OFFSET_Y) / GRID_H));
    const maxLeft = Math.max(OFFSET_X, window.innerWidth - GRID_W - 10);
    const maxTop = Math.max(OFFSET_Y, window.innerHeight - 50 - GRID_H);

    // 1. Registered Apps with showOnDesktop !== false (Sorted: My Computer -> Recycle Bin -> Others)
    const apps = AppRegistry.getAll()
      .filter(app => app.showOnDesktop !== false)
      .sort((a, b) => getAppOrder(a.id) - getAppOrder(b.id));

    // 2. Custom VFS files located in Desktop folder
    const desktopFiles = (window.VFS && VFS.listDir(VFS.getDesktopPath())) || [];
    const customDesktopFiles = desktopFiles.filter(f => f.userCreated);

    // Track occupied cells to guarantee no icon ever overlaps an existing one
    const occupiedCells = new Set();

    function getCellKey(left, top) {
      const col = Math.max(0, Math.round((left - OFFSET_X) / GRID_W));
      const row = Math.max(0, Math.round((top - OFFSET_Y) / GRID_H));
      return `${col},${row}`;
    }

    // Step 1: Pre-assign and reserve existing saved positions (if in-bounds and unique)
    apps.forEach(app => {
      const iconKey = `app_${app.id}`;
      const saved = _savedPositions[iconKey];
      if (saved && typeof saved.left === 'number' && typeof saved.top === 'number') {
        if (saved.left <= maxLeft && saved.top <= maxTop) {
          const key = getCellKey(saved.left, saved.top);
          if (!occupiedCells.has(key)) {
            occupiedCells.add(key);
            app._pos = { left: saved.left, top: saved.top };
          }
        }
      }
    });

    customDesktopFiles.forEach(file => {
      const iconKey = `vfs_${file.name}`;
      const saved = _savedPositions[iconKey];
      if (saved && typeof saved.left === 'number' && typeof saved.top === 'number') {
        if (saved.left <= maxLeft && saved.top <= maxTop) {
          const key = getCellKey(saved.left, saved.top);
          if (!occupiedCells.has(key)) {
            occupiedCells.add(key);
            file._pos = { left: saved.left, top: saved.top };
          }
        }
      }
    });

    // Helper: Find first truly empty grid slot
    function findFirstEmptySlot() {
      let slotIdx = 0;
      while (slotIdx < 2000) {
        const col = Math.floor(slotIdx / rowsPerCol);
        const row = slotIdx % rowsPerCol;
        const key = `${col},${row}`;
        if (!occupiedCells.has(key)) {
          occupiedCells.add(key);
          return {
            left: OFFSET_X + col * GRID_W,
            top: OFFSET_Y + row * GRID_H
          };
        }
        slotIdx++;
      }
      return { left: OFFSET_X, top: OFFSET_Y };
    }

    let positionsChanged = false;

    // Step 2: Assign empty slots to unpositioned apps
    apps.forEach(app => {
      const iconKey = `app_${app.id}`;
      if (!app._pos) {
        app._pos = findFirstEmptySlot();
        _savedPositions[iconKey] = app._pos;
        positionsChanged = true;
      }
    });

    // Step 3: Assign empty slots to unpositioned VFS files (newly created files, drawings, folders)
    customDesktopFiles.forEach(file => {
      const iconKey = `vfs_${file.name}`;
      if (!file._pos) {
        file._pos = findFirstEmptySlot();
        _savedPositions[iconKey] = file._pos;
        positionsChanged = true;
      }
    });

    if (positionsChanged) {
      savePositions();
    }

    // Render registered apps
    apps.forEach(app => {
      const iconKey = `app_${app.id}`;
      const pos = app._pos;

      const iconEl = document.createElement('div');
      iconEl.className = 'desktop-icon';
      iconEl.dataset.iconKey = iconKey;
      iconEl.dataset.appId = app.id;
      iconEl.style.left = `${pos.left}px`;
      iconEl.style.top = `${pos.top}px`;

      if (app.featured) {
        iconEl.classList.add('featured-join');
      }

      let iconGraphic = app.iconUrl
        ? `<img src="${app.iconUrl}" class="desktop-icon-img-file" alt="${app.title}" />`
        : (app.iconSvg ? app.iconSvg : '📁');
      if (app.id === 'RECYCLE_BIN') {
        const isFull = window.VFS && VFS.isTrashFull && VFS.isTrashFull();
        const trashUrl = isFull ? 'assets/icons/trash-full.svg' : 'assets/icons/trash.svg';
        iconGraphic = `<img src="${trashUrl}" class="desktop-icon-img-file" alt="${app.title}" />`;
      }

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

      bindIconEvents(iconEl, {
        type: 'app',
        id: app.id,
        title: label,
        iconKey: iconKey
      });

      _iconsContainer.appendChild(iconEl);
    });

    // Render user-created Desktop files & folders from VFS
    customDesktopFiles.forEach(file => {
      const iconKey = `vfs_${file.name}`;
      const pos = file._pos;

      const iconEl = document.createElement('div');
      iconEl.className = 'desktop-icon';
      iconEl.dataset.iconKey = iconKey;
      iconEl.dataset.vfsName = file.name;
      iconEl.style.left = `${pos.left}px`;
      iconEl.style.top = `${pos.top}px`;

      let iconGraphic = '<i class="bi bi-folder-fill" style="color: #ffaa00; font-size: 32px;"></i>';
      if (file.name === 'PHỐT_MPC.txt') {
        iconGraphic = '<div style="position:relative;display:inline-block;"><i class="bi bi-file-earmark-lock2-fill" style="color: #d13438; font-size: 34px;"></i><span style="position:absolute;bottom:-2px;right:-4px;background:#ff0000;color:#fff;font-size:9px;font-weight:bold;padding:1px 3px;border-radius:3px;box-shadow:0 1px 3px rgba(0,0,0,0.5);">HOT</span></div>';
      } else if (file.type === 'file' || file.name.endsWith('.txt')) {
        iconGraphic = '<i class="bi bi-file-earmark-text-fill" style="color: #0055ea; font-size: 32px;"></i>';
      } else if (file.type === 'img' || file.name.endsWith('.png') || file.name.endsWith('.jpg') || file.name.endsWith('.bmp')) {
        iconGraphic = file.url 
          ? `<img src="${file.url}" class="desktop-icon-img-file" style="object-fit: cover; border-radius: 2px;" alt="" />`
          : `<img src="assets/icons/image-viewer.svg" class="desktop-icon-img-file" alt="" />`;
      }

      iconEl.innerHTML = `
        <div class="desktop-icon-img">${iconGraphic}</div>
        <div class="desktop-icon-label">${String(file.name).replace(/([_.])/g, '$1<wbr>')}</div>
      `;

      bindIconEvents(iconEl, {
        type: 'vfs',
        vfsPath: `${VFS.getDesktopPath()}\\${file.name}`,
        name: file.name,
        fileType: file.type,
        iconKey: iconKey
      });

      _iconsContainer.appendChild(iconEl);
    });
  }

    function bindIconEvents(iconEl, itemData) {
    let isDragging = false;
    let hasMoved = false;
    let startX = 0, startY = 0;
    let origLeft = 0, origTop = 0;

    function openItem() {
      if (itemData.name === 'PHỐT_MPC.txt') {
        if (window.NPC && typeof NPC.sayCustom === 'function') {
          NPC.sayCustom('Đây là bí mật, bạn k nên đụng vào!');
        }
        return;
      }
      if (itemData.type === 'app') {
        WindowManager.open(itemData.id);
      } else if (itemData.type === 'vfs') {
        if (itemData.fileType === 'dir') {
          WindowManager.open('my-computer');
        } else if (itemData.fileType === 'file' || itemData.name.endsWith('.txt')) {
          const content = VFS.readFile(itemData.vfsPath);
          WindowManager.open({
            id: `notepad-${itemData.name}`,
            title: `${itemData.name} - Notepad`,
            iconUrl: 'assets/icons/notepad.svg',
            width: 520,
            height: 380,
            render: (c) => {
              c.innerHTML = `<textarea class="app-notepad-view" style="width:100%;height:100%;border:none;outline:none;font-family:monospace;padding:8px;">${content}</textarea>`;
            }
          });
        } else if (itemData.fileType === 'img' || itemData.name.endsWith('.png') || itemData.name.endsWith('.jpg') || itemData.name.endsWith('.bmp')) {
          if (window.ImageViewer && typeof ImageViewer.open === 'function') {
            ImageViewer.open(itemData.vfsPath);
          } else {
            WindowManager.open('mspaint.exe');
          }
        }
      }
    }



    // Double click to open
    iconEl.addEventListener('dblclick', () => {
      openItem();
    });

    // Right click on icon
    iconEl.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeAllContextMenus();
      clearSelection();
      _selectedIcon = iconEl;
      iconEl.classList.add('selected');
      _activeContextItem = itemData;

      let x = e.clientX;
      let y = e.clientY;
      if (x + 160 > window.innerWidth) x = window.innerWidth - 165;
      if (y + 180 > window.innerHeight) y = window.innerHeight - 185;

      if (_iconContextMenu) {
        const isTrash = itemData.id === 'RECYCLE_BIN';
        const isPhot = itemData.name === 'PHỐT_MPC.txt';
        const emptyTrashItem = document.getElementById('ctx-icon-empty-trash');
        const cutItem = document.getElementById('ctx-icon-cut');
        const copyItem = document.getElementById('ctx-icon-copy');
        const delItem = document.getElementById('ctx-icon-delete');
        const renItem = document.getElementById('ctx-icon-rename');

        if (emptyTrashItem) {
          emptyTrashItem.style.display = isTrash ? 'flex' : 'none';
          const hasTrash = window.VFS && VFS.isTrashFull && VFS.isTrashFull();
          emptyTrashItem.classList.toggle('disabled', !hasTrash);
        }
        if (cutItem) cutItem.style.display = (isTrash || isPhot) ? 'none' : 'flex';
        if (copyItem) copyItem.style.display = (isTrash || isPhot) ? 'none' : 'flex';
        if (delItem) delItem.style.display = (isTrash || isPhot) ? 'none' : 'flex';
        if (renItem) renItem.style.display = (isTrash || isPhot) ? 'none' : 'flex';

        _iconContextMenu.style.left = `${x}px`;
        _iconContextMenu.style.top = `${y}px`;
        _iconContextMenu.classList.remove('hidden');
      }
    });

    // Drag and Snap to Grid logic (Mouse)
    iconEl.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      e.stopPropagation();
      closeAllContextMenus();
      clearSelection();
      _selectedIcon = iconEl;
      iconEl.classList.add('selected');

      isDragging = true;
      hasMoved = false;
      startX = e.clientX;
      startY = e.clientY;
      origLeft = iconEl.offsetLeft;
      origTop = iconEl.offsetTop;
      iconEl.style.zIndex = 100;

      function onMouseMove(moveEv) {
        if (!isDragging) return;
        const dx = moveEv.clientX - startX;
        const dy = moveEv.clientY - startY;
        if (Math.hypot(dx, dy) > 4) {
          hasMoved = true;
          document.body.classList.add('window-is-dragging');
          const curL = origLeft + dx;
          const curT = origTop + dy;
          iconEl.style.left = `${curL}px`;
          iconEl.style.top = `${curT}px`;

          // Live hover indication on target swap icon
          const targetCol = Math.max(0, Math.round((curL - OFFSET_X) / GRID_W));
          const targetRow = Math.max(0, Math.round((curT - OFFSET_Y) / GRID_H));

          const allIcons = _iconsContainer.querySelectorAll('.desktop-icon');
          allIcons.forEach(other => {
            if (other === iconEl) return;
            const otherCol = Math.max(0, Math.round((other.offsetLeft - OFFSET_X) / GRID_W));
            const otherRow = Math.max(0, Math.round((other.offsetTop - OFFSET_Y) / GRID_H));
            if (otherCol === targetCol && otherRow === targetRow) {
              other.classList.add('drag-swap-hover');
            } else {
              other.classList.remove('drag-swap-hover');
            }
          });
        }
      }

      function onMouseUp(upEv) {
        if (!isDragging) return;
        isDragging = false;
        document.body.classList.remove('window-is-dragging');
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
        iconEl.style.zIndex = '';

        _iconsContainer.querySelectorAll('.desktop-icon.drag-swap-hover').forEach(el => {
          el.classList.remove('drag-swap-hover');
        });

        if (hasMoved) {
          snapIconToGrid(iconEl, itemData.iconKey, origLeft, origTop);
        }
      }

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    });

    // Touch support
    let touchStart = null;
    iconEl.addEventListener('touchstart', (e) => {
      const t = e.touches[0];
      touchStart = { x: t.clientX, y: t.clientY, origL: iconEl.offsetLeft, origT: iconEl.offsetTop };
      hasMoved = false;
      clearSelection();
      _selectedIcon = iconEl;
      iconEl.classList.add('selected');
    }, { passive: true });

    iconEl.addEventListener('touchmove', (e) => {
      if (!touchStart) return;
      const t = e.touches[0];
      const dx = t.clientX - touchStart.x;
      const dy = t.clientY - touchStart.y;
      if (Math.hypot(dx, dy) > 8) {
        hasMoved = true;
        iconEl.style.left = `${touchStart.origL + dx}px`;
        iconEl.style.top = `${touchStart.origT + dy}px`;
      }
    }, { passive: true });

    iconEl.addEventListener('touchend', () => {
      if (!touchStart) return;
      const { origL, origT } = touchStart;
      touchStart = null;
      if (hasMoved) {
        snapIconToGrid(iconEl, itemData.iconKey, origL, origT);
      } else {
        openItem();
      }
    });
  }

  function snapIconToGrid(iconEl, iconKey, origLeft = iconEl.offsetLeft, origTop = iconEl.offsetTop) {
    const currentLeft = iconEl.offsetLeft;
    const currentTop = iconEl.offsetTop;

    const col = Math.max(0, Math.round((currentLeft - OFFSET_X) / GRID_W));
    const row = Math.max(0, Math.round((currentTop - OFFSET_Y) / GRID_H));

    const maxLeft = window.innerWidth - GRID_W - 10;
    const maxTop = window.innerHeight - 50 - GRID_H;

    const snappedLeft = Math.min(OFFSET_X + col * GRID_W, maxLeft);
    const snappedTop = Math.min(OFFSET_Y + row * GRID_H, maxTop);

    // Calculate clean snapped original slot
    const origCol = Math.max(0, Math.round((origLeft - OFFSET_X) / GRID_W));
    const origRow = Math.max(0, Math.round((origTop - OFFSET_Y) / GRID_H));
    const cleanOrigLeft = Math.min(OFFSET_X + origCol * GRID_W, maxLeft);
    const cleanOrigTop = Math.min(OFFSET_Y + origRow * GRID_H, maxTop);

    // Collision detection: check if another icon occupies this target cell!
    const allIcons = Array.from(_iconsContainer.querySelectorAll('.desktop-icon'));
    const overlapping = allIcons.find(other => {
      if (other === iconEl) return false;
      const otherCol = Math.max(0, Math.round((other.offsetLeft - OFFSET_X) / GRID_W));
      const otherRow = Math.max(0, Math.round((other.offsetTop - OFFSET_Y) / GRID_H));
      return otherCol === col && otherRow === row;
    });

    if (overlapping && (cleanOrigLeft !== snappedLeft || cleanOrigTop !== snappedTop)) {
      // SWAP POSITIONS! The displaced icon smoothly takes the dragged icon's original slot
      const otherKey = overlapping.dataset.iconKey;
      overlapping.style.transition = 'left 0.25s cubic-bezier(0.2, 0.9, 0.3, 1), top 0.25s cubic-bezier(0.2, 0.9, 0.3, 1)';
      overlapping.style.left = `${cleanOrigLeft}px`;
      overlapping.style.top = `${cleanOrigTop}px`;
      setTimeout(() => {
        overlapping.style.transition = '';
      }, 260);

      if (otherKey) {
        _savedPositions[otherKey] = { left: cleanOrigLeft, top: cleanOrigTop };
      }
    }

    // Snap the dragged icon into target slot with transition
    iconEl.style.transition = 'left 0.2s cubic-bezier(0.2, 0.9, 0.3, 1), top 0.2s cubic-bezier(0.2, 0.9, 0.3, 1)';
    iconEl.style.left = `${snappedLeft}px`;
    iconEl.style.top = `${snappedTop}px`;
    setTimeout(() => {
      iconEl.style.transition = '';
    }, 210);

    _savedPositions[iconKey] = { left: snappedLeft, top: snappedTop };
    savePositions();
  }

  function autoArrangeIcons(criteria = 'default') {
    const allIcons = Array.from(_iconsContainer.querySelectorAll('.desktop-icon'));
    if (allIcons.length === 0) return;

    if (criteria === 'name') {
      allIcons.sort((a, b) => {
        const textA = a.querySelector('.desktop-icon-label')?.textContent.trim() || '';
        const textB = b.querySelector('.desktop-icon-label')?.textContent.trim() || '';
        return textA.localeCompare(textB);
      });
    } else if (criteria === 'type') {
      allIcons.sort((a, b) => {
        const isAppA = !a.dataset.vfsName;
        const isAppB = !b.dataset.vfsName;
        if (isAppA !== isAppB) return isAppA ? -1 : 1;
        const textA = a.querySelector('.desktop-icon-label')?.textContent.trim() || '';
        const textB = b.querySelector('.desktop-icon-label')?.textContent.trim() || '';
        return textA.localeCompare(textB);
      });
    } else {
      // Default: My Computer -> Recycle Bin -> other apps -> user-created VFS files
      allIcons.sort((a, b) => {
        const idA = a.dataset.appId;
        const idB = b.dataset.appId;
        if (idA && !idB) return -1;
        if (!idA && idB) return 1;
        if (idA && idB) return getAppOrder(idA) - getAppOrder(idB);
        const nameA = a.dataset.vfsName || '';
        const nameB = b.dataset.vfsName || '';
        return nameA.localeCompare(nameB);
      });
    }

    const areaH = window.innerHeight - 50;
    const rowsPerCol = Math.max(1, Math.floor((areaH - OFFSET_Y) / GRID_H));

    _savedPositions = {};

    allIcons.forEach((iconEl, index) => {
      const col = Math.floor(index / rowsPerCol);
      const row = index % rowsPerCol;
      const targetLeft = OFFSET_X + col * GRID_W;
      const targetTop = OFFSET_Y + row * GRID_H;

      iconEl.style.transition = 'left 0.25s cubic-bezier(0.2, 0.9, 0.3, 1), top 0.25s cubic-bezier(0.2, 0.9, 0.3, 1)';
      iconEl.style.left = `${targetLeft}px`;
      iconEl.style.top = `${targetTop}px`;
      setTimeout(() => {
        iconEl.style.transition = '';
      }, 260);

      const key = iconEl.dataset.iconKey;
      if (key) {
        _savedPositions[key] = { left: targetLeft, top: targetTop };
      }
    });

    savePositions();
  }

  function setupDesktopContextMenu() {
    const desktop = document.getElementById('desktop');
    if (!desktop || !_contextMenu) return;

    desktop.addEventListener('contextmenu', (e) => {
      if (e.target.closest('.window-container') || e.target.closest('.taskbar-container') || e.target.closest('.desktop-icon')) {
        return;
      }
      e.preventDefault();
      closeAllContextMenus();

      // Check paste enabled status
      const btnPaste = document.getElementById('ctx-paste');
      if (btnPaste) {
        const canPaste = !!(window.VFS && VFS.getClipboard());
        btnPaste.classList.toggle('disabled', !canPaste);
      }

      let x = e.clientX;
      let y = e.clientY;

      if (x + 175 > window.innerWidth) x = window.innerWidth - 180;
      if (y + 220 > window.innerHeight) y = window.innerHeight - 225;

      _contextMenu.style.left = `${x}px`;
      _contextMenu.style.top = `${y}px`;
      _contextMenu.classList.remove('hidden');
    });

    // Submenu Hover for 'Sort By'
    const sortMenuItem = document.getElementById('ctx-sort-menu');
    sortMenuItem?.addEventListener('mouseenter', () => {
      if (!_sortSubmenu) return;
      _newSubmenu?.classList.add('hidden');
      const rect = sortMenuItem.getBoundingClientRect();
      _sortSubmenu.style.left = `${rect.right}px`;
      _sortSubmenu.style.top = `${rect.top}px`;
      _sortSubmenu.classList.remove('hidden');
    });

    // Submenu Hover for 'New'
    const newMenuItem = document.getElementById('ctx-new-menu');
    newMenuItem?.addEventListener('mouseenter', () => {
      if (!_newSubmenu) return;
      _sortSubmenu?.classList.add('hidden');
      const rect = newMenuItem.getBoundingClientRect();
      _newSubmenu.style.left = `${rect.right}px`;
      _newSubmenu.style.top = `${rect.top}px`;
      _newSubmenu.classList.remove('hidden');
    });

    _contextMenu.addEventListener('mouseleave', (e) => {
      if (!e.relatedTarget || (!e.relatedTarget.closest('#desktop-new-submenu') && !e.relatedTarget.closest('#desktop-sort-submenu'))) {
        _newSubmenu?.classList.add('hidden');
        _sortSubmenu?.classList.add('hidden');
      }
    });

    // Sort By click actions
    document.getElementById('ctx-sort-name')?.addEventListener('click', () => {
      closeAllContextMenus();
      autoArrangeIcons('name');
    });

    document.getElementById('ctx-sort-type')?.addEventListener('click', () => {
      closeAllContextMenus();
      autoArrangeIcons('type');
    });

    document.getElementById('ctx-sort-auto')?.addEventListener('click', () => {
      closeAllContextMenus();
      autoArrangeIcons('default');
    });

    document.getElementById('ctx-refresh')?.addEventListener('click', () => {
      closeAllContextMenus();
      triggerRefreshAnimation();
    });

    document.getElementById('ctx-paste')?.addEventListener('click', () => {
      closeAllContextMenus();
      if (window.VFS && VFS.pasteClipboard) {
        VFS.pasteClipboard(VFS.getDesktopPath());
      }
    });

    // New Folder
    document.getElementById('ctx-new-folder')?.addEventListener('click', () => {
      closeAllContextMenus();
      if (window.VFS) {
        VFS.createDir(VFS.getDesktopPath(), 'New Folder');
      }
    });

    // New Text Document
    document.getElementById('ctx-new-txt')?.addEventListener('click', () => {
      closeAllContextMenus();
      if (window.VFS) {
        VFS.createFile(VFS.getDesktopPath(), 'New Text Document.txt', '');
      }
    });

    // New Paint Image
    document.getElementById('ctx-new-img')?.addEventListener('click', () => {
      closeAllContextMenus();
      if (window.VFS) {
        VFS.createFile(VFS.getDesktopPath(), 'New Drawing.png', '', 'img');
      }
    });

    document.getElementById('ctx-properties')?.addEventListener('click', () => {
      closeAllContextMenus();
      showDisplayProperties();
    });

    updateContextMenuText();
  }

  function setupIconContextMenu() {
    if (!_iconContextMenu) return;

    // Empty Recycle Bin from icon context menu
    document.getElementById('ctx-icon-empty-trash')?.addEventListener('click', () => {
      closeAllContextMenus();
      if (window.VFS && VFS.emptyTrash) {
        VFS.emptyTrash();
      }
    });

    // Open
    document.getElementById('ctx-icon-open')?.addEventListener('click', () => {
      closeAllContextMenus();
      if (!_activeContextItem) return;
      if (_activeContextItem.type === 'app') {
        WindowManager.open(_activeContextItem.id);
      } else if (_activeContextItem.type === 'vfs') {
        if (_activeContextItem.fileType === 'dir') WindowManager.open('my-computer');
        else if (_activeContextItem.name.endsWith('.txt')) {
          const content = VFS.readFile(_activeContextItem.vfsPath);
          WindowManager.open({
            id: `notepad-${_activeContextItem.name}`,
            title: `${_activeContextItem.name} - Notepad`,
            iconUrl: 'assets/icons/notepad.svg',
            render: (c) => { c.innerHTML = `<textarea class="app-notepad-view">${content}</textarea>`; }
          });
        } else {
          if (window.ImageViewer && typeof ImageViewer.open === 'function') {
            ImageViewer.open(_activeContextItem.vfsPath);
          } else {
            WindowManager.open('mspaint.exe');
          }
        }
      }
    });

    // Cut
    document.getElementById('ctx-icon-cut')?.addEventListener('click', () => {
      closeAllContextMenus();
      if (_activeContextItem && _activeContextItem.vfsPath && window.VFS) {
        VFS.setClipboard('cut', _activeContextItem.vfsPath);
      }
    });

    // Copy
    document.getElementById('ctx-icon-copy')?.addEventListener('click', () => {
      closeAllContextMenus();
      if (_activeContextItem && _activeContextItem.vfsPath && window.VFS) {
        VFS.setClipboard('copy', _activeContextItem.vfsPath);
      }
    });

    // Delete
    document.getElementById('ctx-icon-delete')?.addEventListener('click', async () => {
      closeAllContextMenus();
      if (!_activeContextItem) return;
      const isVi = window.I18n && I18n.getLanguage() === 'vi';
      if (_activeContextItem.type === 'vfs' && _activeContextItem.vfsPath) {
        const ok = await XPDialog.confirm(
          isVi ? `Bạn có chắc chắn muốn xóa "${_activeContextItem.name}" không?` : `Are you sure you want to delete "${_activeContextItem.name}"?`,
          isVi ? 'Xác nhận xóa tệp' : 'Confirm File Delete',
          { icon: 'warning' }
        );
        if (ok) {
          VFS.deleteNode(_activeContextItem.vfsPath);
          delete _savedPositions[_activeContextItem.iconKey];
          savePositions();
        }
      } else {
        XPDialog.alert(
          isVi ? 'Không thể xóa biểu tượng ứng dụng hệ thống!' : 'Cannot delete system application shortcuts!',
          isVi ? 'Lỗi' : 'Error',
          { icon: 'error' }
        );
      }
    });

    // Rename
    document.getElementById('ctx-icon-rename')?.addEventListener('click', async () => {
      closeAllContextMenus();
      if (!_activeContextItem) return;
      const isVi = window.I18n && I18n.getLanguage() === 'vi';
      if (_activeContextItem.type === 'vfs' && _activeContextItem.vfsPath) {
        const newName = await XPDialog.prompt(
          isVi ? 'Nhập tên mới:' : 'Enter new name:',
          _activeContextItem.name,
          isVi ? 'Đổi tên' : 'Rename'
        );
        if (newName && newName.trim() && newName.trim() !== _activeContextItem.name) {
          VFS.renameNode(_activeContextItem.vfsPath, newName.trim());
          delete _savedPositions[_activeContextItem.iconKey];
          savePositions();
        }
      } else {
        XPDialog.alert(
          isVi ? 'Không thể đổi tên ứng dụng hệ thống!' : 'Cannot rename system applications!',
          isVi ? 'Lỗi' : 'Error',
          { icon: 'error' }
        );
      }
    });

    // Properties
    document.getElementById('ctx-icon-properties')?.addEventListener('click', () => {
      closeAllContextMenus();
      if (!_activeContextItem) return;
      const isVi = window.I18n && I18n.getLanguage() === 'vi';
      const name = _activeContextItem.name || _activeContextItem.id;
      WindowManager.open({
        id: `props-${name}`,
        title: `${name} Properties`,
        iconUrl: 'assets/icons/my-computer.svg',
        width: 380,
        height: 320,
        showOnDesktop: false,
        showInStartMenu: false,
        render: (c) => {
          c.innerHTML = `
            <div style="padding: 16px; font-family: Tahoma, sans-serif; font-size: 11px;">
              <div style="display: flex; align-items: center; gap: 12px; border-bottom: 1px solid #999; padding-bottom: 12px; margin-bottom: 12px;">
                <i class="bi bi-file-earmark-code" style="font-size: 32px; color: #0055ea;"></i>
                <div>
                  <b>${name}</b><br>
                  <span style="color: #666;">${_activeContextItem.type === 'app' ? 'Application' : 'VFS File'}</span>
                </div>
              </div>
              <p><b>${isVi ? 'Vị trí:' : 'Location:'}</b> ${_activeContextItem.vfsPath || 'C:\\Program Files\\MPC'}</p>
              <p style="margin-top: 6px;"><b>${isVi ? 'Dung lượng:' : 'Size:'}</b> 202.6 KB</p>
              <p style="margin-top: 6px;"><b>${isVi ? 'Bản quyền:' : 'Copyright:'}</b> MPClub - Khoa CNTT OU</p>
            </div>
          `;
        }
      });
    });
  }

  function updateContextMenuText() {
    if (!window.I18n) return;
    document.querySelectorAll('#desktop-context-menu [data-i18n], #desktop-new-submenu [data-i18n], #desktop-sort-submenu [data-i18n], #icon-context-menu [data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (key) el.textContent = I18n.t(key);
    });
  }

  function triggerRefreshAnimation() {
    if (!_iconsContainer) return;
    // Classic Windows XP icon flicker: icons disappear instantly for 0.05s (50ms) and reappear
    _iconsContainer.style.visibility = 'hidden';
    setTimeout(() => {
      renderIcons();
      _iconsContainer.style.visibility = 'visible';
    }, 50);
  }

  function showDisplayProperties() {
    WindowManager.open('settings');
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

  function moveItemToRandomEmptySlot(iconKey) {
    const iconEl = _iconsContainer.querySelector(`.desktop-icon[data-icon-key="${iconKey}"]`);
    if (!iconEl) return;

    const areaH = window.innerHeight - 50;
    const rowsPerCol = Math.max(1, Math.floor((areaH - OFFSET_Y) / GRID_H));
    const maxCols = Math.max(1, Math.floor((window.innerWidth - 100) / GRID_W));

    // Find all occupied cells
    const allIcons = Array.from(_iconsContainer.querySelectorAll('.desktop-icon'));
    const occupied = new Set();
    allIcons.forEach(other => {
      if (other === iconEl) return;
      const col = Math.max(0, Math.round((other.offsetLeft - OFFSET_X) / GRID_W));
      const row = Math.max(0, Math.round((other.offsetTop - OFFSET_Y) / GRID_H));
      occupied.add(`${col},${row}`);
    });

    const emptySlots = [];
    for (let c = 0; c < maxCols; c++) {
      for (let r = 0; r < rowsPerCol; r++) {
        if (!occupied.has(`${c},${r}`)) {
          emptySlots.push({ left: OFFSET_X + c * GRID_W, top: OFFSET_Y + r * GRID_H });
        }
      }
    }

    if (emptySlots.length > 0) {
      const chosen = emptySlots[Math.floor(Math.random() * emptySlots.length)];
      iconEl.style.transition = 'left 0.45s cubic-bezier(0.2, 0.9, 0.3, 1), top 0.45s cubic-bezier(0.2, 0.9, 0.3, 1)';
      iconEl.style.left = `${chosen.left}px`;
      iconEl.style.top = `${chosen.top}px`;
      _savedPositions[iconKey] = chosen;
      savePositions();
      setTimeout(() => {
        iconEl.style.transition = '';
      }, 470);
    }
  }

  return {
    init,
    renderIcons,
    clearSelection,
    moveItemToRandomEmptySlot
  };
})();

window.Desktop = Desktop;
