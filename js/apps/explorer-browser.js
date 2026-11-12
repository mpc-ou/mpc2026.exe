/**
 * ============================================================================
 * MPCrosoft Explorer (Internet Explorer XP) - Real Web Browser
 * ============================================================================
 * - Default homepage: Live Web https://www.mpclub.dev
 * - Full web browsing, searching and tab management
 * - Round green navigation buttons, search bar, and retro bookmarks
 */

(function () {
  const HOME_URL = 'https://www.mpclub.dev';
  const HOME_DISPLAY = 'https://www.mpclub.dev';

  let _tabs = [
    {
      id: 1,
      title: 'MPClub - CLB Đa Nền Tảng',
      url: HOME_URL,
      displayUrl: HOME_DISPLAY
    },
    {
      id: 2,
      title: 'Khoa CNTT - ĐH Mở TP.HCM',
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
    if (raw.toLowerCase() === 'mpclub.dev' || raw.toLowerCase() === 'www.mpclub.dev' || raw.toLowerCase() === 'https://mpclub.dev' || raw.toLowerCase() === 'http://mpclub.dev' || raw.toLowerCase() === 'https://www.mpclub.dev') {
      return { iframeUrl: 'https://www.mpclub.dev', displayUrl: 'https://www.mpclub.dev', title: 'MPClub' };
    }
    if (raw.toLowerCase() === 'it.ou.edu.vn' || raw.toLowerCase() === 'https://it.ou.edu.vn' || raw.toLowerCase() === 'http://it.ou.edu.vn') {
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
    showInStartMenu: true,
    render: (container, win) => {
      container.style.overflow = 'hidden';
      container.style.display = 'flex';
      container.style.flexDirection = 'column';

      function renderBrowser() {
        const activeTab = _tabs.find(t => t.id === _activeTabId) || _tabs[0];

        container.innerHTML = `
          <div class="xp-browser-wrapper">
            <!-- 1. TOP TABS BAR (Luna XP Styling) -->
            <div class="browser-tabs-bar">
              <div class="browser-tabs-left-btn" title="Menu">
                <i class="bi bi-chevron-down"></i>
              </div>

              <div class="browser-tabs-list">
                ${_tabs.map(tab => `
                  <div class="browser-tab-item ${tab.id === _activeTabId ? 'active' : ''}" data-tab-id="${tab.id}">
                    <i class="bi bi-globe2 tab-folder-icon" style="color: #ff9900;"></i>
                    <span class="tab-label" title="${tab.title}">${tab.title}</span>
                    <button class="tab-close-btn" data-close-tab="${tab.id}" title="Close tab">&times;</button>
                  </div>
                `).join('')}

                <!-- New Tab '+' Button -->
                <button class="browser-new-tab-btn" id="btn-new-tab" title="New Tab">
                  <i class="bi bi-plus-lg"></i>
                </button>
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
                  value="${activeTab.displayUrl}" 
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
              <div class="bookmark-item" data-url="https://it.ou.edu.vn" data-display="https://it.ou.edu.vn" data-title="Khoa CNTT - ĐH Mở TP.HCM">
                <i class="bi bi-mortarboard-fill" style="color: #003399;"></i> it.ou.edu.vn (Khoa CNTT)
              </div>
              <div class="bookmark-item" data-url="https://www.google.com/search?igu=1" data-display="https://www.google.com" data-title="Google">
                <i class="bi bi-google" style="color: #4285f4;"></i> Google
              </div>
              <div class="bookmark-item" data-url="https://ou.edu.vn" data-display="https://ou.edu.vn" data-title="ĐH Mở TP.HCM">
                <i class="bi bi-buildings-fill" style="color: #2e7d32;"></i> ĐH Mở (OU)
              </div>
              <div class="bookmark-item" data-url="https://vi.wikipedia.org/wiki/Trang_Ch%C3%ADnh" data-display="https://vi.wikipedia.org" data-title="Wikipedia">
                <i class="bi bi-book-half" style="color: #333;"></i> Wikipedia
              </div>
              <div class="bookmark-item" data-url="https://github.com" data-display="https://github.com" data-title="GitHub">
                <i class="bi bi-github" style="color: #111;"></i> GitHub
              </div>
            </div>

            <!-- 4. REAL WEB IFRAME VIEWPORT -->
            <div class="browser-viewport-area">
              <iframe 
                id="browser-viewport-iframe" 
                class="browser-viewport-iframe" 
                src="${activeTab.url}" 
                title="Real Web Content"
                allow="autoplay; fullscreen; encrypted-media; geolocation; camera; microphone">
              </iframe>
            </div>

            <!-- 5. BROWSER STATUSBAR -->
            <div class="browser-bottom-statusbar">
              <div class="sb-left"><i class="bi bi-shield-check" style="color: #00aa00; margin-right: 4px;"></i> Done</div>
              <div class="sb-right"><i class="bi bi-globe2" style="margin-right: 4px;"></i> Internet | Protected Mode: Off</div>
            </div>
          </div>
        `;

        bindEvents();
      }

      function bindEvents() {
        const urlInput = container.querySelector('#browser-url-input');
        const iframe = container.querySelector('#browser-viewport-iframe');
        const goBtn = container.querySelector('#br-go-btn');
        const refreshBtn = container.querySelector('#br-refresh');
        const backBtn = container.querySelector('#br-back');
        const forwardBtn = container.querySelector('#br-forward');
        const homeBtn = container.querySelector('#br-home');
        const newTabBtn = container.querySelector('#btn-new-tab');
        const openExtBtn = container.querySelector('#br-open-external');

        function navigate() {
          const resolved = resolveUrl(urlInput.value);
          const activeTab = _tabs.find(t => t.id === _activeTabId);
          if (activeTab) {
            activeTab.url = resolved.iframeUrl;
            activeTab.displayUrl = resolved.displayUrl;
            activeTab.title = resolved.title;
          }
          if (iframe) iframe.src = resolved.iframeUrl;
          renderBrowser();
        }

        urlInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') navigate();
        });

        goBtn.addEventListener('click', navigate);

        refreshBtn.addEventListener('click', () => {
          if (iframe) iframe.src = iframe.src;
        });

        homeBtn.addEventListener('click', () => {
          const activeTab = _tabs.find(t => t.id === _activeTabId);
          if (activeTab) {
            activeTab.url = HOME_URL;
            activeTab.displayUrl = HOME_DISPLAY;
            activeTab.title = 'MPClub - CLB Đa Nền Tảng';
          }
          renderBrowser();
        });

        openExtBtn.addEventListener('click', () => {
          const activeTab = _tabs.find(t => t.id === _activeTabId);
          const target = activeTab ? activeTab.displayUrl : HOME_DISPLAY;
          window.open(target, '_blank');
        });

        backBtn.addEventListener('click', () => {
          try {
            iframe.contentWindow.history.back();
          } catch (e) {
            console.log('Cross-origin navigation handled');
          }
        });

        forwardBtn.addEventListener('click', () => {
          try {
            iframe.contentWindow.history.forward();
          } catch (e) {
            console.log('Cross-origin navigation handled');
          }
        });

        // Tab click
        container.querySelectorAll('.browser-tab-item').forEach(tabEl => {
          tabEl.addEventListener('click', (e) => {
            if (e.target.closest('.tab-close-btn')) return;
            const tabId = parseInt(tabEl.getAttribute('data-tab-id'), 10);
            _activeTabId = tabId;
            renderBrowser();
          });
        });

        // Tab close
        container.querySelectorAll('.tab-close-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const tabId = parseInt(btn.getAttribute('data-close-tab'), 10);
            if (_tabs.length <= 1) return;
            _tabs = _tabs.filter(t => t.id !== tabId);
            if (_activeTabId === tabId) {
              _activeTabId = _tabs[_tabs.length - 1].id;
            }
            renderBrowser();
          });
        });

        // New tab
        newTabBtn.addEventListener('click', () => {
          const newId = _nextTabId++;
          _tabs.push({
            id: newId,
            title: 'MPClub - CLB Đa Nền Tảng',
            url: HOME_URL,
            displayUrl: HOME_DISPLAY
          });
          _activeTabId = newId;
          renderBrowser();
        });

        // Bookmarks click
        container.querySelectorAll('.bookmark-item').forEach(bm => {
          bm.addEventListener('click', () => {
            const url = bm.getAttribute('data-url');
            const display = bm.getAttribute('data-display');
            const title = bm.getAttribute('data-title');
            const activeTab = _tabs.find(t => t.id === _activeTabId);
            if (activeTab) {
              activeTab.url = url;
              activeTab.displayUrl = display;
              activeTab.title = title || display;
            }
            renderBrowser();
          });
        });
      }

      renderBrowser();
    }
  });
})();
