/**
 * ============================================================================
 * Applications Definition (Appendix #1 - MPC.exe)
 * ============================================================================
 * Architecture:
 * Every contributor app is loaded as an isolated standalone HTML file from apps/
 * containing HTML + CSS + JS in a single file via <iframe>.
 */

// 1. ABOUT_MPC
AppRegistry.register({
  id: 'ABOUT_MPC',
  title: 'ABOUT_MPC.txt - Giới thiệu câu lạc bộ MPClub',
  desktopLabel: 'ABOUT_MPC',
  i18nTitleKey: 'app.about.title',
  i18nLabelKey: 'app.about.label',
  iconUrl: 'assets/icons/notepad.svg',
  width: 620,
  height: 460,
  url: 'apps/about_mpc/index.html'
});

// 2. OUR_TEAMS
AppRegistry.register({
  id: 'OUR_TEAMS',
  title: 'OUR_TEAMS - Cơ cấu tổ chức và các ban chuyên môn',
  desktopLabel: 'OUR_TEAMS',
  i18nTitleKey: 'app.teams.title',
  i18nLabelKey: 'app.teams.label',
  iconUrl: 'assets/icons/folder.svg',
  width: 700,
  height: 480,
  url: 'apps/our_teams/index.html'
});

// 3. ACTIVITIES
AppRegistry.register({
  id: 'ACTIVITIES',
  title: 'ACTIVITIES - Hoạt động và đào tạo',
  desktopLabel: 'ACTIVITIES',
  i18nTitleKey: 'app.activities.title',
  i18nLabelKey: 'app.activities.label',
  iconUrl: 'assets/icons/folder.svg',
  width: 720,
  height: 500,
  url: 'apps/activities/index.html'
});

// 4. EVENTS
AppRegistry.register({
  id: 'EVENTS',
  title: 'EVENTS - Sự kiện và bảng vàng thành tích',
  desktopLabel: 'EVENTS',
  i18nTitleKey: 'app.events.title',
  i18nLabelKey: 'app.events.label',
  iconUrl: 'assets/icons/folder.svg',
  width: 680,
  height: 460,
  url: 'apps/events/index.html'
});

// 5. DIARY
AppRegistry.register({
  id: 'DIARY',
  title: 'DIARY.txt - Nhật ký hoạt động và kỷ niệm',
  desktopLabel: 'DIARY',
  i18nTitleKey: 'app.diary.title',
  i18nLabelKey: 'app.diary.label',
  iconUrl: 'assets/icons/notepad.svg',
  width: 620,
  height: 450,
  url: 'apps/diary/index.html'
});

// 6. FAQ.txt
AppRegistry.register({
  id: 'FAQ.txt',
  title: 'FAQ.txt - Câu hỏi thường gặp',
  desktopLabel: 'FAQ.txt',
  i18nTitleKey: 'app.faq.title',
  i18nLabelKey: 'app.faq.label',
  iconUrl: 'assets/icons/notepad.svg',
  width: 640,
  height: 460,
  url: 'apps/faq/index.html'
});

// 7. JOIN_MPC.exe (Featured Shortcut)
AppRegistry.register({
  id: 'JOIN_MPC.exe',
  title: 'JOIN_MPC.exe - Đăng ký tham gia câu lạc bộ',
  desktopLabel: 'JOIN_MPC.exe',
  i18nTitleKey: 'app.join.title',
  i18nLabelKey: 'app.join.label',
  iconUrl: 'assets/icons/exe.svg',
  featured: true,
  width: 680,
  height: 460,
  url: 'apps/join_mpc/index.html'
});

// 7b. JOIN_MPC_FORM.exe (Hidden Window - Only opened from JOIN_MPC.exe)
AppRegistry.register({
  id: 'JOIN_MPC_FORM.exe',
  title: 'Biểu mẫu đăng ký phỏng vấn tuyển thành viên CLB MPC khóa K26',
  desktopLabel: 'MPC_FORM.exe',
  i18nTitleKey: 'app.join_form.title',
  i18nLabelKey: 'app.join_form.label',
  iconUrl: 'assets/icons/exe.svg',
  showOnDesktop: false,
  showInStartMenu: false,
  width: 740,
  height: 550,
  url: 'apps/join_mpc/form.html'
});

// 8. Calculator (Accessories)
AppRegistry.register({
  id: 'calc.exe',
  title: 'Calculator',
  desktopLabel: 'Calculator',
  iconSvg: '<i class="bi bi-calculator-fill" style="color: #003399; font-size: 26px;"></i>',
  width: 260,
  height: 250,
  noMenubar: true,
  noStatusbar: true,
  showOnDesktop: false,
  showInStartMenu: true,
  url: 'apps/calculator/index.html'
});

// 9. Minesweeper (Games)
AppRegistry.register({
  id: 'winmine.exe',
  title: 'Minesweeper',
  desktopLabel: 'Minesweeper',
  iconSvg: '<i class="bi bi-controller" style="color: #003399; font-size: 26px;"></i>',
  width: 215,
  height: 275,
  noMenubar: true,
  noStatusbar: true,
  showOnDesktop: false,
  showInStartMenu: true,
  url: 'apps/minesweeper/index.html'
});

// 10. Paint (Accessories)
AppRegistry.register({
  id: 'mspaint.exe',
  title: 'Paint',
  desktopLabel: 'Paint',
  iconSvg: '<i class="bi bi-palette-fill" style="color: #d13438; font-size: 26px;"></i>',
  width: 720,
  height: 520,
  noMenubar: true,
  noStatusbar: true,
  showOnDesktop: false,
  showInStartMenu: true,
  url: 'apps/paint/index.html'
});

// 11. RECYCLE_BIN
AppRegistry.register({
  id: 'RECYCLE_BIN',
  title: 'Thùng rác',
  desktopLabel: 'Thùng rác',
  i18nTitleKey: 'app.recycle.title',
  i18nLabelKey: 'app.recycle.label',
  iconUrl: 'assets/icons/trash.svg',
  showInStartMenu: false, // desktop only, like Windows XP
  width: 520,
  height: 360,
  render: (container) => {
    function renderContent() {
      const isVi = window.I18n ? I18n.getLanguage() === 'vi' : true;
      const trash = (window.VFS && VFS.getTrash) ? VFS.getTrash() : [];

      if (trash.length === 0) {
        container.innerHTML = `
          <div class="app-content" style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #666;">
            <img src="assets/icons/trash.svg" style="width: 56px; height: 56px; margin-bottom: 12px;" alt="" />
            <p style="font-size: 13px; font-weight: bold;">${isVi ? 'Thùng rác trống rỗng.' : 'Recycle Bin is empty.'}</p>
            <p style="font-size: 11px; margin-top: 4px; color: #888;">${isVi ? '(Không có mục nào bị bỏ lại ở đây)' : '(No items in Recycle Bin)'}</p>
          </div>
        `;
      } else {
        let itemsHtml = '';
        trash.forEach(item => {
          itemsHtml += `
            <div style="display: flex; align-items: center; gap: 8px; padding: 6px 8px; border-bottom: 1px solid #f0f0f0;">
              <i class="bi bi-file-earmark-text" style="color: #666; font-size: 18px;"></i>
              <div style="flex: 1; font-size: 12px;">
                <b>${item.name}</b>
                <span style="color: #888; font-size: 10px; margin-left: 8px;">${item.path || ''}</span>
              </div>
              <span style="color: #999; font-size: 11px;">${item.deletedAt || ''}</span>
            </div>
          `;
        });

        container.innerHTML = `
          <div style="display: flex; flex-direction: column; height: 100%; font-family: Tahoma, sans-serif;">
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: #ece9d8; border-bottom: 1px solid #999; flex-wrap: wrap; gap: 6px;">
              <span style="font-size: 12px; white-space: nowrap;"><img src="assets/icons/trash-full.svg" style="width: 20px; height: 20px; vertical-align: middle; margin-right: 6px;" alt="" /><b>${isVi ? 'Thùng rác' : 'Recycle Bin'}</b> (${trash.length} ${isVi ? 'mục đã xóa' : 'items'})</span>
              <button class="xp-dialog-button" id="btn-empty-recycle-bin" style="padding: 3px 12px; font-size: 11px; cursor: pointer; white-space: nowrap;">
                <i class="bi bi-trash-fill" style="color: #d13438; margin-right: 4px;"></i>${isVi ? 'Dọn sạch thùng rác' : 'Empty Recycle Bin'}
              </button>
            </div>
            <div style="flex: 1; overflow-y: auto; background: #fff; padding: 8px;">
              ${itemsHtml}
            </div>
          </div>
        `;

        container.querySelector('#btn-empty-recycle-bin')?.addEventListener('click', () => {
          if (window.VFS && VFS.emptyTrash) {
            VFS.emptyTrash();
            renderContent();
          }
        });
      }
    }

    renderContent();
    if (window.I18n) I18n.onChange(() => renderContent());
    if (window.VFS && VFS.onChange) VFS.onChange(() => renderContent());
  }
});
