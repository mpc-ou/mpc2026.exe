/**
 * js/apps/settings.js
 * Unified System Settings (Control Panel / Settings)
 * Replaces and extends Regional & Language Options into a full-featured Windows XP Control Panel:
 * 1. Language & Region (Tiếng Việt & English with instant sync)
 * 2. Display & Wallpaper (IndexedDB-backed custom image upload, presets, CRT monitor preview)
 * 3. About & Contributors (Auto-fetches from assets/data/contributors.json)
 */

(function () {
  const PRESET_WALLPAPERS = [
    { name: 'Bliss (Mặc định)', url: 'assets/backgrounds/bg.jpg' },
    { name: 'Royal Blue Gradient', url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="%231b5cb8"/><stop offset="50%" stop-color="%232989d8"/><stop offset="100%" stop-color="%237db9e8"/></linearGradient></defs><rect width="800" height="600" fill="url(%23g)"/></svg>' },
    { name: 'Dark Cyber Night', url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80' },
    { name: 'Deep Space Galaxy', url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80' }
  ];

  function registerSettings(appId, isPrimary = false) {
    AppRegistry.register({
      id: appId,
      title: 'Cài đặt hệ thống',
      desktopLabel: 'Settings',
      i18nTitleKey: 'settings.title',
      i18nLabelKey: 'settings.label',
      iconUrl: 'assets/icons/network.svg',
      width: 500,
      height: 480,
      showOnDesktop: false,
      showInStartMenu: isPrimary,
      render: (container, win) => {
        let activeTab = 'tab-lang';
        let pendingLang = window.I18n ? I18n.getLanguage() : 'vi';
        let contributorsData = null;

        function renderUI() {
          const isVi = pendingLang === 'vi';
          const curWallpaper = window.WallpaperManager ? WallpaperManager.getCurrent() : { url: 'assets/backgrounds/bg.jpg', name: 'Bliss' };

          container.innerHTML = `
            <div class="xp-settings-layout" style="display: flex; flex-direction: column; height: 100%; background: #ece9d8; font-family: Tahoma, 'Segoe UI', sans-serif; font-size: 11px; padding: 10px 12px 10px 12px; box-sizing: border-box; user-select: none;">
              
              <!-- Property Sheet Tabs -->
              <div style="display: flex; gap: 2px; border-bottom: 1px solid #7f9db9; padding-left: 6px; margin-bottom: 0; flex-shrink: 0;">
                <button class="xp-prop-tab ${activeTab === 'tab-lang' ? 'active' : ''}" data-tab="tab-lang" style="padding: 4px 12px; background: ${activeTab === 'tab-lang' ? '#fff' : 'linear-gradient(180deg, #fbfaf6 0%, #ece8d8 100%)'}; border: 1px solid #7f9db9; border-bottom: ${activeTab === 'tab-lang' ? '1px solid #fff' : 'none'}; border-radius: 3px 3px 0 0; font-size: 11px; cursor: pointer; position: relative; top: 1px; font-weight: ${activeTab === 'tab-lang' ? 'bold' : 'normal'}; color: #003399;">
                  <i class="bi bi-translate"></i> ${isVi ? 'Ngôn ngữ & Vùng' : 'Language & Region'}
                </button>
                <button class="xp-prop-tab ${activeTab === 'tab-display' ? 'active' : ''}" data-tab="tab-display" style="padding: 4px 12px; background: ${activeTab === 'tab-display' ? '#fff' : 'linear-gradient(180deg, #fbfaf6 0%, #ece8d8 100%)'}; border: 1px solid #7f9db9; border-bottom: ${activeTab === 'tab-display' ? '1px solid #fff' : 'none'}; border-radius: 3px 3px 0 0; font-size: 11px; cursor: pointer; position: relative; top: 1px; font-weight: ${activeTab === 'tab-display' ? 'bold' : 'normal'}; color: #003399;">
                  <i class="bi bi-display"></i> ${isVi ? 'Màn hình nền' : 'Display'}
                </button>
                <button class="xp-prop-tab ${activeTab === 'tab-about' ? 'active' : ''}" data-tab="tab-about" style="padding: 4px 12px; background: ${activeTab === 'tab-about' ? '#fff' : 'linear-gradient(180deg, #fbfaf6 0%, #ece8d8 100%)'}; border: 1px solid #7f9db9; border-bottom: ${activeTab === 'tab-about' ? '1px solid #fff' : 'none'}; border-radius: 3px 3px 0 0; font-size: 11px; cursor: pointer; position: relative; top: 1px; font-weight: ${activeTab === 'tab-about' ? 'bold' : 'normal'}; color: #003399;">
                  <i class="bi bi-info-circle-fill"></i> ${isVi ? 'Giới thiệu & Ghi công' : 'About & Credits'}
                </button>
              </div>

              <!-- Main Sheet Workspace -->
              <div style="flex: 1; background: #ffffff; border: 1px solid #7f9db9; border-top: none; padding: 14px; overflow-y: auto; box-shadow: inset 1px 1px 2px rgba(0,0,0,0.05);">
                
                <!-- TAB 1: LANGUAGE & REGION -->
                <div class="tab-pane" style="display: ${activeTab === 'tab-lang' ? 'block' : 'none'};">
                  <div style="font-weight: bold; color: #003399; margin-bottom: 8px; font-size: 11.5px;">
                    <i class="bi bi-globe"></i> ${isVi ? 'Tùy chọn ngôn ngữ giao diện (System Interface Language)' : 'System Interface Language'}
                  </div>

                  <div style="border: 1px solid #b5c4d8; padding: 10px 12px; background: #fbfcfe; border-radius: 3px; margin-bottom: 12px;">
                    <label style="display: block; font-weight: bold; margin-bottom: 6px; color: #222;">
                      ${isVi ? 'Chọn ngôn ngữ hiển thị:' : 'Select interface language:'}
                    </label>
                    <select id="setting-lang-dropdown" style="width: 100%; height: 25px; font-family: Tahoma, sans-serif; font-size: 11px; padding: 2px 6px; border: 1px solid #7f9db9; background: #fff;">
                      <option value="vi" ${pendingLang === 'vi' ? 'selected' : ''}>🇻🇳 Tiếng Việt (Vietnamese) - Mặc định</option>
                      <option value="en" ${pendingLang === 'en' ? 'selected' : ''}>🇺🇸 English (United States)</option>
                    </select>
                    <div style="margin-top: 6px; font-size: 10.5px; color: #666; line-height: 1.4;">
                      ${isVi 
                        ? 'Đồng bộ tức thời toàn bộ thanh tác vụ, bảng ứng dụng, cửa sổ và tham số URL ?lang=' 
                        : 'Synchronizes taskbar, start menu, desktop apps, and URL ?lang= parameter instantly.'}
                    </div>
                  </div>

                  <!-- Format Samples Preview -->
                  <div style="border: 1px solid #b5c4d8; padding: 10px 12px; background: #fafafa; border-radius: 3px;">
                    <div style="font-weight: bold; margin-bottom: 6px; color: #003399;">
                      <i class="bi bi-calendar3"></i> ${isVi ? 'Xem trước định dạng mẫu (Sample Format):' : 'Sample Formats:'}
                    </div>
                    <div style="display: grid; grid-template-columns: 85px 1fr; gap: 5px; font-size: 11px;">
                      <div style="color: #555;">${isVi ? 'Thời gian:' : 'Time:'}</div>
                      <b>${new Date().toLocaleTimeString(isVi ? 'vi-VN' : 'en-US')}</b>
                      <div style="color: #555;">${isVi ? 'Ngày tháng:' : 'Date:'}</div>
                      <b>${new Date().toLocaleDateString(isVi ? 'vi-VN' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</b>
                      <div style="color: #555;">${isVi ? 'Dung lượng:' : 'Storage:'}</div>
                      <b>25.12 GB / 201.5 GB</b>
                    </div>
                  </div>
                </div>

                <!-- TAB 2: DISPLAY & WALLPAPER -->
                <div class="tab-pane" style="display: ${activeTab === 'tab-display' ? 'block' : 'none'};">
                  
                  <!-- CRT Monitor Screen Preview -->
                  <div style="display: flex; flex-direction: column; align-items: center; margin-bottom: 12px;">
                    <div style="width: 170px; height: 112px; background: #2f2f2f; border: 5px solid #d4d0c8; border-radius: 6px 6px 2px 2px; box-shadow: 0 2px 5px rgba(0,0,0,0.3); padding: 4px; box-sizing: border-box; display: flex; flex-direction: column;">
                      <div id="monitor-screen-preview" style="flex: 1; background-image: url('${curWallpaper.url}'); background-size: cover; background-position: center; border-radius: 2px; border: 1px solid #000; position: relative;">
                        <!-- Mini taskbar mockup inside monitor -->
                        <div style="position: absolute; bottom: 0; left: 0; right: 0; height: 8px; background: #245edb; border-top: 1px solid #3d80df; display: flex; align-items: center; padding-left: 2px;">
                          <div style="width: 12px; height: 6px; background: #388e3c; border-radius: 1px;"></div>
                        </div>
                      </div>
                    </div>
                    <!-- Monitor Stand -->
                    <div style="width: 32px; height: 10px; background: #b8b4a8; border: 1px solid #8e8a7f; border-top: none;"></div>
                    <div style="width: 70px; height: 6px; background: #d4d0c8; border-radius: 3px 3px 0 0; border: 1px solid #8e8a7f; border-bottom: none;"></div>
                  </div>

                  <!-- Wallpaper Selection Box -->
                  <div style="border: 1px solid #b5c4d8; padding: 10px 12px; background: #fbfcfe; border-radius: 3px; margin-bottom: 10px;">
                    <div style="font-weight: bold; margin-bottom: 6px; color: #003399;">
                      <i class="bi bi-images"></i> ${isVi ? 'Chọn hình nền máy tính:' : 'Select desktop background:'}
                    </div>

                    <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 8px;">
                      <select id="preset-wallpaper-dropdown" style="flex: 1; height: 25px; font-family: Tahoma, sans-serif; font-size: 11px; padding: 2px 6px; border: 1px solid #7f9db9;">
                        ${PRESET_WALLPAPERS.map(p => `
                          <option value="${p.url}" ${curWallpaper.url === p.url ? 'selected' : ''}>${p.name}</option>
                        `).join('')}
                        ${curWallpaper.type === 'custom' ? `<option value="${curWallpaper.url}" selected>📷 ${curWallpaper.name} (${isVi ? 'Ảnh của bạn' : 'Custom Image'})</option>` : ''}
                      </select>
                    </div>

                    <!-- Upload & Reset Buttons -->
                    <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                      <input type="file" id="wallpaper-file-input" accept="image/*" style="display: none;" />
                      <button id="btn-browse-wallpaper" style="height: 24px; padding: 0 10px; background: #ece9d8; border: 1px solid #716f64; border-radius: 2px; cursor: pointer; font-size: 11px; display: inline-flex; align-items: center; gap: 4px;">
                        <i class="bi bi-folder2-open" style="color: #d9a300;"></i> ${isVi ? 'Tải ảnh từ máy... (Upload)' : 'Browse Image...'}
                      </button>
                      <button id="btn-reset-wallpaper" style="height: 24px; padding: 0 10px; background: #ece9d8; border: 1px solid #716f64; border-radius: 2px; cursor: pointer; font-size: 11px; display: inline-flex; align-items: center; gap: 4px;">
                        <i class="bi bi-arrow-counterclockwise"></i> ${isVi ? 'Đặt lại Bliss mặc định' : 'Reset to Bliss'}
                      </button>
                    </div>

                    <div style="margin-top: 8px; font-size: 10.5px; color: #008800; display: flex; align-items: center; gap: 4px;">
                      <i class="bi bi-shield-check"></i> ${isVi ? 'Hình nền được lưu trữ bền vững trong IndexedDB trình duyệt.' : 'Wallpapers are persistently stored in browser IndexedDB.'}
                    </div>
                  </div>
                </div>

                <!-- TAB 3: ABOUT & CONTRIBUTORS -->
                <div class="tab-pane" style="display: ${activeTab === 'tab-about' ? 'block' : 'none'};">
                  <!-- System Identity -->
                  <div style="display: flex; gap: 12px; align-items: center; border-bottom: 1px solid #dde6f2; padding-bottom: 10px; margin-bottom: 10px;">
                    <img src="assets/icons/logo.png" style="width: 48px; height: 48px; aspect-ratio: 1/1; object-fit: contain; border: 1px solid #b5c4d8; padding: 3px; background: #fff; border-radius: 4px;" alt="Logo" />
                    <div>
                      <div style="font-weight: bold; font-size: 13px; color: #003399;">MPCrosoft Windows XP Professional</div>
                      <div style="font-size: 11px; color: #444;">MPClub Recruitment Edition (v2026.1.0)</div>
                      <div style="font-size: 10.5px; color: #666;">Khoa Công nghệ Thông tin – Trường ĐH Mở TP.HCM</div>
                    </div>
                  </div>

                  <!-- Contributors Section (Fetched from CI/CD JSON) -->
                  <div>
                    <div style="font-weight: bold; color: #003399; margin-bottom: 6px; display: flex; justify-content: space-between; align-items: center;">
                      <span><i class="bi bi-people-fill"></i> ${isVi ? 'Đội ngũ phát triển & Ghi công (Contributors):' : 'Project Contributors:'}</span>
                      <span id="contributors-count" style="font-size: 10px; background: #e1edff; color: #0055ea; padding: 1px 6px; border-radius: 10px;"></span>
                    </div>

                    <div id="contributors-list-box" style="border: 1px solid #b5c4d8; background: #fafafa; border-radius: 3px; max-height: 165px; overflow-y: auto; padding: 6px;">
                      <div style="padding: 12px; text-align: center; color: #777;">
                        <i class="bi bi-arrow-repeat" style="animation: spin 1s infinite linear;"></i> ${isVi ? 'Đang tải danh sách contributors...' : 'Loading contributors...'}
                      </div>
                    </div>

                    <div style="margin-top: 8px; font-size: 10px; color: #666; display: flex; justify-content: space-between; align-items: center;">
                      <span>${isVi ? 'Dữ liệu tự động đồng bộ từ Git log qua GitHub Actions CI/CD' : 'Auto-synchronized from Git log via GitHub Actions CI/CD'}</span>
                      <a href="https://github.com/mpc-ou/mpc2026.exe" target="_blank" rel="noopener" style="color: #0055ea; text-decoration: none; font-weight: bold;">
                        <i class="bi bi-github"></i> GitHub
                      </a>
                    </div>
                  </div>
                </div>

              </div>

              <!-- Dialog Bottom Buttons -->
              <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 10px; flex-shrink: 0; flex-wrap: wrap;">
                <button id="setting-btn-ok" style="min-width: 72px; height: 26px; white-space: nowrap; background: #ece9d8; border: 1px solid #716f64; border-radius: 2px; cursor: pointer; font-weight: bold; font-family: Tahoma, sans-serif; font-size: 11px;">
                  ${isVi ? 'Đồng ý' : 'OK'}
                </button>
                <button id="setting-btn-cancel" style="min-width: 72px; height: 26px; white-space: nowrap; background: #ece9d8; border: 1px solid #716f64; border-radius: 2px; cursor: pointer; font-family: Tahoma, sans-serif; font-size: 11px;">
                  ${isVi ? 'Hủy bỏ' : 'Cancel'}
                </button>
                <button id="setting-btn-apply" style="min-width: 72px; height: 26px; white-space: nowrap; background: #ece9d8; border: 1px solid #716f64; border-radius: 2px; cursor: pointer; font-family: Tahoma, sans-serif; font-size: 11px;">
                  ${isVi ? 'Áp dụng' : 'Apply'}
                </button>
              </div>

            </div>
          `;

          // Bind Tab Switches
          container.querySelectorAll('.xp-prop-tab').forEach(btn => {
            btn.addEventListener('click', () => {
              activeTab = btn.getAttribute('data-tab');
              renderUI();
              if (activeTab === 'tab-about') loadContributors();
            });
          });

          // Bind Language dropdown
          const langDropdown = container.querySelector('#setting-lang-dropdown');
          if (langDropdown) {
            langDropdown.addEventListener('change', (e) => {
              pendingLang = e.target.value;
            });
          }

          // Bind Preset Wallpaper dropdown
          const presetDropdown = container.querySelector('#preset-wallpaper-dropdown');
          if (presetDropdown) {
            presetDropdown.addEventListener('change', async (e) => {
              const selectedUrl = e.target.value;
              const selectedName = e.target.options[e.target.selectedIndex].text;
              if (window.WallpaperManager) {
                await WallpaperManager.setPreset(selectedUrl, selectedName);
                renderUI();
              }
            });
          }

          // Bind Upload Wallpaper
          const fileInput = container.querySelector('#wallpaper-file-input');
          const btnBrowse = container.querySelector('#btn-browse-wallpaper');
          if (btnBrowse && fileInput) {
            btnBrowse.addEventListener('click', () => fileInput.click());
            fileInput.addEventListener('change', async (e) => {
              const file = e.target.files[0];
              if (file && window.WallpaperManager) {
                try {
                  await WallpaperManager.setCustomFile(file);
                  renderUI();
                } catch (err) {
                  alert(err.message || 'Lỗi khi tải ảnh nền.');
                }
              }
            });
          }

          // Bind Reset Wallpaper
          const btnReset = container.querySelector('#btn-reset-wallpaper');
          if (btnReset) {
            btnReset.addEventListener('click', async () => {
              if (window.WallpaperManager) {
                await WallpaperManager.resetDefault();
                renderUI();
              }
            });
          }

          // Bottom Action Buttons
          const btnOk = container.querySelector('#setting-btn-ok');
          const btnCancel = container.querySelector('#setting-btn-cancel');
          const btnApply = container.querySelector('#setting-btn-apply');

          if (btnApply) {
            btnApply.addEventListener('click', () => {
              if (window.I18n && pendingLang !== I18n.getLanguage()) {
                I18n.setLanguage(pendingLang);
              }
              renderUI();
            });
          }

          if (btnOk) {
            btnOk.addEventListener('click', () => {
              if (window.I18n && pendingLang !== I18n.getLanguage()) {
                I18n.setLanguage(pendingLang);
              }
              win.close();
            });
          }

          if (btnCancel) {
            btnCancel.addEventListener('click', () => win.close());
          }

          if (activeTab === 'tab-about') {
            loadContributors();
          }
        }

        async function loadContributors() {
          const listBox = container.querySelector('#contributors-list-box');
          const countBox = container.querySelector('#contributors-count');
          if (!listBox) return;

          if (contributorsData) {
            renderContributorsList(contributorsData, listBox, countBox);
            return;
          }

          const knownRoles = {
            'pgiahuy': { name: 'Phan Gia Huy', role: 'Lead Architect & Developer' },
            'konnn04': { name: 'Nguyễn Thanh Triều', role: 'Trưởng Ban Lập Trình (BLT)' }
          };

          // 1. Fetch live from GitHub API (https://api.github.com/repos/mpc-ou/mpc2026.exe/contributors)
          try {
            const apiRes = await fetch('https://api.github.com/repos/mpc-ou/mpc2026.exe/contributors', {
              headers: { Accept: 'application/vnd.github.v3+json' }
            });
            if (apiRes.ok) {
              const apiData = await apiRes.json();
              if (Array.isArray(apiData) && apiData.length > 0) {
                contributorsData = apiData.map(c => {
                  const meta = knownRoles[c.login.toLowerCase()] || {};
                  return {
                    name: meta.name || c.login,
                    username: c.login,
                    avatar: c.avatar_url,
                    commits: c.contributions,
                    role: meta.role || 'Contributor',
                    profile: c.html_url || `https://github.com/${c.login}`
                  };
                });
                renderContributorsList(contributorsData, listBox, countBox);
                return;
              }
            }
          } catch (e) {
            // Live API failed or rate-limited, fall through to static JSON
          }

          // 2. Fallback to local CI/CD synchronized JSON
          try {
            const resp = await fetch('assets/data/contributors.json');
            if (!resp.ok) throw new Error('Cannot fetch contributors.json');
            contributorsData = await resp.json();
            renderContributorsList(contributorsData, listBox, countBox);
            return;
          } catch (e) {
            // 3. Fallback list if offline or running via file://
            contributorsData = [
              {
                name: 'Phan Gia Huy',
                username: 'pgiahuy',
                avatar: 'https://avatars.githubusercontent.com/u/152808787?v=4',
                commits: 6,
                role: 'Lead Architect & Developer',
                profile: 'https://github.com/pgiahuy'
              },
              {
                name: 'Nguyễn Thanh Triều',
                username: 'konnn04',
                avatar: 'https://avatars.githubusercontent.com/u/85620049?v=4',
                commits: 1,
                role: 'Trưởng Ban Lập Trình (BLT)',
                profile: 'https://github.com/konnn04'
              }
            ];
            renderContributorsList(contributorsData, listBox, countBox);
          }
        }

        function renderContributorsList(list, listBox, countBox) {
          const isVi = pendingLang === 'vi';
          if (countBox) countBox.textContent = `${list.length} ${isVi ? 'thành viên' : 'members'}`;

          listBox.innerHTML = list.map(c => `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 5px 8px; background: #fff; border: 1px solid #e1e9f5; border-radius: 2px; margin-bottom: 4px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <img src="${c.avatar}" style="width: 28px; height: 28px; border-radius: 50%; border: 1px solid #b5c4d8; object-fit: cover;" alt="${c.name}" onerror="this.src='assets/icons/ou-it.svg'" />
                <div>
                  <div style="font-weight: bold; color: #003399;">${c.name} <span style="font-weight: normal; color: #777; font-size: 10px;">(@${c.username})</span></div>
                  <div style="font-size: 10px; color: #555;">${c.role}</div>
                </div>
              </div>
              <div style="text-align: right;">
                <span style="background: #e8f5e9; color: #2e7d32; font-size: 9.5px; font-weight: bold; padding: 2px 6px; border-radius: 10px;">
                  ${c.commits} ${isVi ? 'commits' : 'commits'}
                </span>
              </div>
            </div>
          `).join('');
        }

        renderUI();
      }
    });
  }

  // Register under primary ID 'settings' and legacy alias 'language-settings'
  registerSettings('settings', true);
  registerSettings('language-settings', false);
})();
