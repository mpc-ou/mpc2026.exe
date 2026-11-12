/**
 * ============================================================================
 * My Computer & Drive C: Explorer (15.6 GB of 19.90 GB - OU Founding Date)
 * ============================================================================
 * Bilingual Support: Vietnamese & English
 */

(function () {
  AppRegistry.register({
    id: 'my-computer',
    title: 'My Computer',
    desktopLabel: 'My Computer',
    iconUrl: 'assets/icons/my-computer.svg',
    width: 680,
    height: 460,
    showOnDesktop: true,
    showInStartMenu: true,
    render: (container, win) => {
      let currentView = 'root';
      let historyStack = ['root'];
      let historyIndex = 0;

      function renderView() {
        const isVi = window.I18n ? I18n.getLanguage() === 'vi' : true;

        container.innerHTML = `
          <div class="explorer-window-layout">
            <!-- XP Explorer Toolbar -->
            <div class="explorer-toolbar">
              <button class="exp-tool-btn" id="btn-back" ${historyIndex === 0 ? 'disabled' : ''}>
                <i class="bi bi-arrow-left"></i> ${isVi ? 'Quay lại' : 'Back'}
              </button>
              <button class="exp-tool-btn" id="btn-fwd" ${historyIndex >= historyStack.length - 1 ? 'disabled' : ''}>
                <i class="bi bi-arrow-right"></i>
              </button>
              <button class="exp-tool-btn" id="btn-up" ${currentView === 'root' ? 'disabled' : ''}>
                <i class="bi bi-arrow-up"></i> ${isVi ? 'Lên trên' : 'Up'}
              </button>
              <div class="exp-tool-divider"></div>
              <button class="exp-tool-btn" id="btn-refresh">
                <i class="bi bi-arrow-clockwise"></i>
              </button>
              <div class="exp-address-bar-row">
                <span class="exp-address-label">${isVi ? 'Địa chỉ' : 'Address'}</span>
                <input type="text" class="exp-address-input" id="exp-address" value="${currentView === 'root' ? 'My Computer' : currentView}" readonly />
                <button class="exp-go-btn" id="btn-go">${isVi ? 'Đi' : 'Go'}</button>
              </div>
            </div>

            <!-- Main Explorer Body -->
            <div class="explorer-body-split">
              <!-- Left Classic XP Task Pane -->
              <div class="explorer-sidebar-pane">
                <div class="exp-sidebar-section">
                  <div class="exp-section-header">${isVi ? 'Tác vụ hệ thống' : 'System Tasks'}</div>
                  <div class="exp-section-body">
                    <div class="exp-task-link" id="link-view-sys-info"><i class="bi bi-info-circle" style="margin-right: 4px;"></i>${isVi ? 'Xem thông tin hệ thống' : 'View system info'}</div>
                    <div class="exp-task-link" onclick="WindowManager.open('cmd.exe')"><i class="bi bi-terminal" style="margin-right: 4px;"></i>${isVi ? 'Mở Dòng lệnh' : 'Open Command Prompt'}</div>
                  </div>
                </div>

                <div class="exp-sidebar-section">
                  <div class="exp-section-header">${isVi ? 'Vị trí khác' : 'Other Places'}</div>
                  <div class="exp-section-body">
                    <div class="exp-task-link" id="link-my-network"><i class="bi bi-globe" style="margin-right: 4px;"></i>${isVi ? 'Kết nối mạng' : 'My Network Places'}</div>
                    <div class="exp-task-link" id="link-my-docs"><i class="bi bi-folder-fill" style="margin-right: 4px; color: #f5b041;"></i>${isVi ? 'Tài liệu của tôi' : 'My Documents'}</div>
                  </div>
                </div>

                <div class="exp-sidebar-section">
                  <div class="exp-section-header">${isVi ? 'Chi tiết' : 'Details'}</div>
                  <div class="exp-section-body" id="exp-details-box">
                    <b>${currentView === 'root' ? 'My Computer' : currentView}</b><br>
                    ${currentView === 'root' ? (isVi ? 'Thư mục hệ thống' : 'System Folder') : 'Local Drive NTFS'}
                  </div>
                </div>
              </div>

              <!-- Right Files & Drives Area -->
              <div class="explorer-files-pane" id="exp-files-grid">
                <!-- Content dynamically rendered below -->
              </div>
            </div>

            <!-- Statusbar -->
            <div class="window-statusbar">
              <span id="exp-status-left">${isVi ? 'Sẵn sàng' : 'Ready'}</span>
              <span>15.6 GB of 19.90 GB ${isVi ? 'trống' : 'free'} (OU 15/06/1990)</span>
            </div>
          </div>
        `;

        container.querySelector('#btn-back')?.addEventListener('click', () => {
          if (historyIndex > 0) {
            historyIndex--;
            currentView = historyStack[historyIndex];
            renderView();
          }
        });

        container.querySelector('#btn-fwd')?.addEventListener('click', () => {
          if (historyIndex < historyStack.length - 1) {
            historyIndex++;
            currentView = historyStack[historyIndex];
            renderView();
          }
        });

        container.querySelector('#btn-up')?.addEventListener('click', () => {
          if (currentView === 'root') return;
          if (currentView === 'C:' || currentView === 'C:\\') {
            navigateTo('root');
          } else {
            const parent = currentView.substring(0, currentView.lastIndexOf('\\'));
            navigateTo(parent && parent !== 'C:' ? parent : 'C:\\');
          }
        });

        container.querySelector('#btn-refresh')?.addEventListener('click', () => {
          renderView();
        });

        container.querySelector('#link-my-docs')?.addEventListener('click', () => {
          navigateTo('C:\\Documents and Settings\\OU_IT\\My Documents');
        });

        const grid = container.querySelector('#exp-files-grid');

        if (currentView === 'root') {
          grid.innerHTML = `
            <div class="exp-group-title">${isVi ? 'Ổ đĩa cứng' : 'Hard Disk Drives'}</div>
            <div class="exp-drives-row">
              <div class="exp-item exp-drive-card" id="drive-c-item">
                <img src="assets/icons/drive-c.svg" class="exp-item-icon" alt="" />
                <div class="exp-drive-info">
                  <div class="exp-drive-name"><b>${isVi ? 'Ổ đĩa cục bộ (C:)' : 'Local Disk (C:)'}</b></div>
                  <div class="exp-drive-bar-bg">
                    <div class="exp-drive-bar-fill" style="width: 21.6%;"></div>
                  </div>
                  <div class="exp-drive-stats">
                    <span class="ou-easter-text">15.6 GB ${isVi ? 'trống' : 'free'}</span> of 19.90 GB
                  </div>
                  <div class="ou-badge-hint" title="15/06/1990: Ngày thành lập trường ĐH Mở TP.HCM">🎓 ${isVi ? 'Ngày thành lập OU: 15/06/1990' : 'OU Foundation: 15/06/1990'}</div>
                </div>
              </div>
            </div>

            <div class="exp-group-title" style="margin-top: 16px;">${isVi ? 'Thiết bị lưu trữ ngoài' : 'Devices with Removable Storage'}</div>
            <div class="exp-drives-row">
              <div class="exp-item exp-drive-card" style="opacity: 0.7;">
                <img src="assets/icons/drive-c.svg" class="exp-item-icon" alt="" style="filter: grayscale(1);" />
                <div class="exp-drive-info">
                  <div class="exp-drive-name">3½ Floppy (A:)</div>
                  <div class="exp-drive-stats">Removable Disk</div>
                </div>
              </div>

              <div class="exp-item exp-drive-card">
                <img src="assets/icons/wmp.svg" class="exp-item-icon" alt="" />
                <div class="exp-drive-info">
                  <div class="exp-drive-name">CD Drive (D:) MPC_2026</div>
                  <div class="exp-drive-stats">Compact Disc</div>
                </div>
              </div>
            </div>
          `;

          grid.querySelector('#drive-c-item')?.addEventListener('dblclick', () => {
            navigateTo('C:\\');
          });

        } else {
          const items = VFS.listDir(currentView);
          if (!items) {
            grid.innerHTML = `<div style="padding: 20px; color: red;">${isVi ? 'Không thể mở thư mục:' : 'Cannot open folder:'} ${currentView}</div>`;
            return;
          }

          let itemsHtml = '<div class="exp-items-grid">';
          items.forEach(item => {
            let iconSrc = 'assets/icons/folder.svg';
            if (item.type === 'file') iconSrc = 'assets/icons/notepad.svg';
            else if (item.type === 'exe') iconSrc = 'assets/icons/exe.svg';
            else if (item.type === 'img') iconSrc = 'assets/icons/folder.svg';
            else if (item.type === 'video') iconSrc = 'assets/icons/wmp.svg';

            itemsHtml += `
              <div class="exp-file-item" data-name="${item.name}" data-type="${item.type}">
                <img src="${iconSrc}" class="exp-file-icon" alt="" />
                <div class="exp-file-name">${item.name}</div>
              </div>
            `;
          });
          itemsHtml += '</div>';
          grid.innerHTML = itemsHtml;

          grid.querySelectorAll('.exp-file-item').forEach(itemEl => {
            const name = itemEl.dataset.name;
            const type = itemEl.dataset.type;

            itemEl.addEventListener('dblclick', () => {
              if (type === 'dir') {
                const newPath = currentView === 'C:' || currentView === 'C:\\'
                  ? `C:\\${name}`
                  : `${currentView}\\${name}`;
                navigateTo(newPath);
              } else if (type === 'file') {
                const fullPath = `${currentView}\\${name}`;
                const text = VFS.readFile(fullPath);
                AppRegistry.get('ABOUT_MPC') && WindowManager.open({
                  id: `notepad-${name}`,
                  title: `${name} - Notepad`,
                  iconUrl: 'assets/icons/notepad.svg',
                  width: 540,
                  height: 380,
                  render: (c) => {
                    c.innerHTML = `<textarea class="app-notepad-view" readonly>${text}</textarea>`;
                  }
                });
              } else if (name === 'JOIN_MPC.exe') {
                WindowManager.open('JOIN_MPC.exe');
              } else if (type === 'video' || name.endsWith('.mp4')) {
                const fullPath = `${currentView}\\${name}`;
                const node = VFS.getNode(fullPath);
                const videoUrl = node?.url || 'assets/videos/intro.mp4';
                if (window.MediaPlayer) {
                  window.MediaPlayer.play(videoUrl, name);
                } else {
                  WindowManager.open('wmplayer.exe');
                }
              }
            });
          });
        }
      }

      function navigateTo(path) {
        currentView = path;
        historyStack = historyStack.slice(0, historyIndex + 1);
        historyStack.push(path);
        historyIndex = historyStack.length - 1;
        renderView();
      }

      renderView();
      if (window.I18n) {
        I18n.onChange(() => renderView());
      }
    }
  });
})();
