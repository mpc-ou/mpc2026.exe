/**
 * ============================================================================
 * MPCrosoft Explorer (Internet Explorer XP) - Real Web Browser
 * ============================================================================
 * - Default homepage: Live Web https://www.mpclub.dev
 * - Stacked multi-iframe architecture: Each tab has its own independent <iframe>
 *   kept alive in the DOM (hidden/shown on tab switch, never reloaded)
 * - Scaled iframe viewport: 85% zoom ratio (transform: scale(0.85))
 * - Round green navigation buttons, search bar, and retro bookmarks
 */

(function () {
  const HOME_URL = 'https://www.mpclub.dev';
  const HOME_DISPLAY = 'https://www.mpclub.dev';

  let _tabs = [
    {
      id: 1,
      title: 'MPClub – CLB Lập Trình Trên Thiết Bị Di Động',
      url: HOME_URL,
      displayUrl: HOME_DISPLAY
    },
    {
      id: 2,
      title: 'Khoa CNTT – Trường ĐH Mở TP.HCM',
      url: 'https://it.ou.edu.vn',
      displayUrl: 'https://it.ou.edu.vn'
    }
  ];
  let _activeTabId = 1;
  let _nextTabId = 3;

  function resolveUrl(input) {
    let raw = (input || '').trim();
    if (!raw) return { iframeUrl: HOME_URL, displayUrl: HOME_DISPLAY, title: 'MPClub' };

    // Explicit mpclub & it.ou.edu.vn domains
    const lower = raw.toLowerCase();
    if (lower === 'mpclub.dev' || lower === 'www.mpclub.dev' || lower === 'https://mpclub.dev' || lower === 'http://mpclub.dev' || lower === 'https://www.mpclub.dev') {
      return { iframeUrl: 'https://www.mpclub.dev', displayUrl: 'https://www.mpclub.dev', title: 'MPClub' };
    }
    if (lower === 'it.ou.edu.vn' || lower === 'https://it.ou.edu.vn' || lower === 'http://it.ou.edu.vn') {
      return { iframeUrl: 'https://it.ou.edu.vn', displayUrl: 'https://it.ou.edu.vn', title: 'Khoa CNTT - OU' };
    }

    // If internal local app requested
    if (raw.startsWith('app:') || raw.startsWith('apps/')) {
      const clean = raw.replace(/^app:\/?\/?/, 'apps/');
      return { iframeUrl: clean, displayUrl: raw, title: raw };
    }

    // If searching (no dots and not starting with http)
    const isSearch = !raw.includes('.') && !raw.startsWith('http://') && !raw.startsWith('https://') && !raw.startsWith('localhost');
    if (isSearch) {
      return {
        iframeUrl: `https://www.google.com/search?igu=1&q=${encodeURIComponent(raw)}`,
        displayUrl: `https://www.google.com/search?q=${encodeURIComponent(raw)}`,
        title: `${raw} - Google`
      };
    }

    // Real URL
    let fullUrl = raw;
    if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
      fullUrl = 'https://' + fullUrl;
    }

    let domain = fullUrl;
    try {
      domain = new URL(fullUrl).hostname;
    } catch (e) {}

    return { iframeUrl: fullUrl, displayUrl: fullUrl, title: domain };
  }

  AppRegistry.register({
    id: 'iexplore.exe',
    title: 'MPCrosoft Explorer',
    desktopLabel: 'Explorer',
    iconUrl: 'assets/icons/ie.svg',
    width: 880,
    height: 600,
    showOnDesktop: true,
    showInStartMenu: false, // already in the Start menu's right column
    render: (container, win) => {
      container.style.overflow = 'hidden';
      container.style.display = 'flex';
      container.style.flexDirection = 'column';

      container.innerHTML = `
        <div class="xp-browser-wrapper">
          <!-- 1. TOP TABS BAR (Luna XP Styling) -->
          <div class="browser-tabs-bar" id="br-tabs-bar">
            <div class="browser-tabs-left-btn" title="Menu">
              <i class="bi bi-chevron-down"></i>
            </div>

            <div class="browser-tabs-list" id="br-tabs-list">
              <!-- Rendered dynamically -->
            </div>
          </div>

          <!-- 2. NAVIGATION & SEARCH BAR -->
          <div class="browser-nav-toolbar">
            <!-- Round Glossy Green Back/Forward Buttons -->
            <button class="nav-circle-btn btn-green" id="br-back" title="Back">
              <i class="bi bi-arrow-left-short"></i>
            </button>
            <button class="nav-circle-btn btn-green" id="br-forward" title="Forward">
              <i class="bi bi-arrow-right-short"></i>
            </button>
            <button class="nav-circle-btn btn-refresh" id="br-refresh" title="Refresh">
              <i class="bi bi-arrow-clockwise"></i>
            </button>
            <button class="nav-circle-btn btn-refresh" id="br-home" title="Trang chủ www.mpclub.dev">
              <i class="bi bi-house-door-fill"></i>
            </button>

            <!-- Search / Address Bar with Globe Icon -->
            <div class="browser-search-pill">
              <span class="google-g-icon"><i class="bi bi-lock-fill" style="color: #008800; font-size: 11px;"></i></span>
              <input 
                type="text" 
                class="browser-search-input" 
                id="browser-url-input" 
                value="" 
                placeholder="Nhập địa chỉ web hoặc tìm kiếm..."
                spellcheck="false" 
              />
              <button class="browser-search-go-btn" id="br-go-btn" title="Đi đến / Tìm kiếm">
                <i class="bi bi-arrow-return-left"></i>
              </button>
            </div>

            <!-- Open In External Tab Shortcut -->
            <button class="nav-external-btn" id="br-open-external" title="Mở trang hiện tại trên tab ngoài trình duyệt">
              <i class="bi bi-box-arrow-up-right"></i>
            </button>

            <!-- Retro MPC Spinner Throbber -->
            <div class="browser-throbber" id="br-throbber" title="Internet Explorer XP">
              <img src="assets/icons/logo.png" alt="MPC" />
            </div>
          </div>

          <!-- 3. REAL BOOKMARKS ROW -->
          <div class="browser-bookmarks-bar">
            <span class="bookmark-grid-icon"><i class="bi bi-grid-fill"></i></span>
            <div class="bookmark-item" data-url="https://www.mpclub.dev" data-display="https://www.mpclub.dev" data-title="www.mpclub.dev">
              <i class="bi bi-stars" style="color: #ff9900;"></i> www.mpclub.dev
            </div>
            <div class="bookmark-item" data-url="https://it.ou.edu.vn" data-display="https://it.ou.edu.vn" data-title="Khoa CNTT – Trường ĐH Mở TP.HCM">
              <i class="bi bi-mortarboard-fill" style="color: #003399;"></i> it.ou.edu.vn (Khoa CNTT)
            </div>
            <div class="bookmark-item" data-url="https://www.google.com/search?igu=1" data-display="https://www.google.com" data-title="Google">
              <i class="bi bi-google" style="color: #4285f4;"></i> Google
            </div>
            <div class="bookmark-item" data-url="https://ou.edu.vn" data-display="https://ou.edu.vn" data-title="Trường ĐH Mở TP.HCM">
              <i class="bi bi-buildings-fill" style="color: #2e7d32;"></i> Trường ĐH Mở TP.HCM
            </div>
            <div class="bookmark-item" data-url="https://vi.wikipedia.org/wiki/Trang_Ch%C3%ADnh" data-display="https://vi.wikipedia.org" data-title="Wikipedia">
              <i class="bi bi-book-half" style="color: #333;"></i> Wikipedia
            </div>
            <div class="bookmark-item" data-url="https://github.com" data-display="https://github.com" data-title="GitHub">
              <i class="bi bi-github" style="color: #111;"></i> GitHub
            </div>
          </div>

          <!-- 4. REAL WEB MULTI-IFRAME VIEWPORT STACK (85% ZOOM RATIO) -->
          <div class="browser-viewport-area">
            <div class="browser-iframes-stack" id="browser-iframes-stack">
              <!-- Iframes for each tab will live here without re-rendering -->
            </div>
          </div>

          <!-- 5. BROWSER STATUSBAR -->
          <div class="browser-bottom-statusbar">
            <div class="sb-left"><i class="bi bi-shield-check" style="color: #00aa00; margin-right: 4px;"></i> Done</div>
            <div class="sb-right"><i class="bi bi-globe2" style="margin-right: 4px;"></i> Internet | Protected Mode: Off</div>
          </div>
        </div>
      `;

      const tabsListEl = container.querySelector('#br-tabs-list');
      const iframesStackEl = container.querySelector('#browser-iframes-stack');
      const urlInput = container.querySelector('#browser-url-input');
      const goBtn = container.querySelector('#br-go-btn');
      const refreshBtn = container.querySelector('#br-refresh');
      const backBtn = container.querySelector('#br-back');
      const forwardBtn = container.querySelector('#br-forward');
      const homeBtn = container.querySelector('#br-home');
      const openExtBtn = container.querySelector('#br-open-external');

      function syncUI() {
        const activeTab = _tabs.find(t => t.id === _activeTabId) || _tabs[0];
        if (!activeTab) return;

        urlInput.value = activeTab.displayUrl;

        // Render tab strips
        let tabsHtml = '';
        _tabs.forEach(tab => {
          const isActive = tab.id === _activeTabId;
          tabsHtml += `
            <div class="browser-tab-item ${isActive ? 'active' : ''}" data-tab-id="${tab.id}">
              <i class="bi bi-globe2 tab-folder-icon" style="color: #ff9900;"></i>
              <span class="tab-label" title="${tab.title}">${tab.title}</span>
              <button class="tab-close-btn" data-close-tab="${tab.id}" title="Close tab">&times;</button>
            </div>
          `;
        });

        tabsHtml += `
          <button class="browser-new-tab-btn" id="btn-new-tab" title="New Tab">
            <i class="bi bi-plus-lg"></i>
          </button>
        `;

        tabsListEl.innerHTML = tabsHtml;

        // Bind tab clicks & drag-and-drop reordering
        tabsListEl.querySelectorAll('.browser-tab-item').forEach(el => {
          el.setAttribute('draggable', 'true');

          el.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', el.dataset.tabId);
            el.style.opacity = '0.5';
          });

          el.addEventListener('dragend', () => {
            el.style.opacity = '';
          });

          el.addEventListener('dragover', (e) => {
            e.preventDefault();
            el.style.borderLeft = '2px solid #ff9900';
          });

          el.addEventListener('dragleave', () => {
            el.style.borderLeft = '';
          });

          el.addEventListener('drop', (e) => {
            e.preventDefault();
            el.style.borderLeft = '';
            const srcId = parseInt(e.dataTransfer.getData('text/plain'), 10);
            const targetId = parseInt(el.dataset.tabId, 10);
            if (srcId && targetId && srcId !== targetId) {
              const srcIdx = _tabs.findIndex(t => t.id === srcId);
              const targetIdx = _tabs.findIndex(t => t.id === targetId);
              if (srcIdx !== -1 && targetIdx !== -1) {
                const [movedTab] = _tabs.splice(srcIdx, 1);
                _tabs.splice(targetIdx, 0, movedTab);
                syncUI();
              }
            }
          });

          el.addEventListener('click', (e) => {
            if (e.target.closest('.tab-close-btn')) return;
            const tid = parseInt(el.dataset.tabId, 10);
            switchTab(tid);
          });
        });

        // Bind tab close
        tabsListEl.querySelectorAll('.tab-close-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const tid = parseInt(btn.dataset.closeTab, 10);
            closeTab(tid);
          });
        });

        // Bind new tab
        tabsListEl.querySelector('#btn-new-tab')?.addEventListener('click', () => {
          createNewTab();
        });

        // Ensure each tab has an iframe in the stack
        _tabs.forEach(tab => {
          let iframeEl = iframesStackEl.querySelector(`#tab-iframe-${tab.id}`);
          if (!iframeEl) {
            iframeEl = document.createElement('iframe');
            iframeEl.id = `tab-iframe-${tab.id}`;
            iframeEl.className = 'browser-viewport-iframe';
            iframeEl.src = tab.url;
            iframeEl.title = tab.title;
            iframeEl.allow = 'autoplay; fullscreen; encrypted-media; geolocation; camera; microphone';
            iframesStackEl.appendChild(iframeEl);
          }

          if (tab.id === _activeTabId) {
            iframeEl.classList.remove('tab-hidden');
          } else {
            iframeEl.classList.add('tab-hidden');
          }
        });
      }

      function switchTab(tabId) {
        _activeTabId = tabId;
        syncUI();
      }

      function closeTab(tabId) {
        if (_tabs.length <= 1) return;
        const iframeEl = iframesStackEl.querySelector(`#tab-iframe-${tabId}`);
        if (iframeEl) iframeEl.remove();

        _tabs = _tabs.filter(t => t.id !== tabId);
        if (_activeTabId === tabId) {
          _activeTabId = _tabs[_tabs.length - 1].id;
        }
        syncUI();
      }

      function createNewTab() {
        const newId = _nextTabId++;
        _tabs.push({
          id: newId,
          title: 'MPClub - CLB Đa Nền Tảng',
          url: HOME_URL,
          displayUrl: HOME_DISPLAY
        });
        _activeTabId = newId;
        syncUI();
      }

      function navigateTo(resolved) {
        const activeTab = _tabs.find(t => t.id === _activeTabId);
        if (!activeTab) return;

        activeTab.url = resolved.iframeUrl;
        activeTab.displayUrl = resolved.displayUrl;
        activeTab.title = resolved.title;

        const iframeEl = iframesStackEl.querySelector(`#tab-iframe-${activeTab.id}`);
        if (iframeEl) {
          iframeEl.src = resolved.iframeUrl;
        }
        syncUI();
      }

      // Address bar enter & Go button
      function onGo() {
        const resolved = resolveUrl(urlInput.value);
        navigateTo(resolved);
      }

      urlInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') onGo();
      });

      goBtn.addEventListener('click', onGo);

      refreshBtn.addEventListener('click', () => {
        const activeTab = _tabs.find(t => t.id === _activeTabId);
        if (activeTab) {
          const iframeEl = iframesStackEl.querySelector(`#tab-iframe-${activeTab.id}`);
          if (iframeEl) iframeEl.src = iframeEl.src;
        }
      });

      homeBtn.addEventListener('click', () => {
        navigateTo({
          iframeUrl: HOME_URL,
          displayUrl: HOME_DISPLAY,
          title: 'MPClub - CLB Đa Nền Tảng'
        });
      });

      openExtBtn.addEventListener('click', () => {
        const activeTab = _tabs.find(t => t.id === _activeTabId);
        const target = activeTab ? activeTab.displayUrl : HOME_DISPLAY;
        window.open(target, '_blank');
      });

      backBtn.addEventListener('click', () => {
        const activeTab = _tabs.find(t => t.id === _activeTabId);
        if (activeTab) {
          const iframeEl = iframesStackEl.querySelector(`#tab-iframe-${activeTab.id}`);
          try {
            iframeEl.contentWindow.history.back();
          } catch (e) {}
        }
      });

      forwardBtn.addEventListener('click', () => {
        const activeTab = _tabs.find(t => t.id === _activeTabId);
        if (activeTab) {
          const iframeEl = iframesStackEl.querySelector(`#tab-iframe-${activeTab.id}`);
          try {
            iframeEl.contentWindow.history.forward();
          } catch (e) {}
        }
      });

      // Bookmarks draggable reorder & click
      const bmBar = container.querySelector('.browser-bookmarks-bar');
      let draggedBm = null;

      bmBar?.querySelectorAll('.bookmark-item').forEach(bm => {
        bm.setAttribute('draggable', 'true');
        bm.style.cursor = 'grab';

        bm.addEventListener('dragstart', (e) => {
          draggedBm = bm;
          e.dataTransfer.setData('text/plain', bm.dataset.url || '');
          bm.style.opacity = '0.5';
        });

        bm.addEventListener('dragend', () => {
          draggedBm = null;
          bm.style.opacity = '';
        });

        bm.addEventListener('dragover', (e) => {
          e.preventDefault();
          bm.style.borderLeft = '2px solid #0055ea';
        });

        bm.addEventListener('dragleave', () => {
          bm.style.borderLeft = '';
        });

        bm.addEventListener('drop', (e) => {
          e.preventDefault();
          bm.style.borderLeft = '';
          if (draggedBm && draggedBm !== bm) {
            bmBar.insertBefore(draggedBm, bm);
          }
        });

        bm.addEventListener('click', () => {
          const url = bm.getAttribute('data-url');
          const display = bm.getAttribute('data-display');
          const title = bm.getAttribute('data-title');
          navigateTo({
            iframeUrl: url,
            displayUrl: display,
            title: title || display
          });
        });
      });

      syncUI();
    }
  });
})();
