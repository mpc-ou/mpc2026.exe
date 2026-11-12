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
  title: 'ABOUT_MPC.txt - Giới thiệu MPClub',
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
  title: 'OUR_TEAMS - Các Ban Chuyên Môn MPClub',
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
  title: 'ACTIVITIES - Hoạt Động & Workshop',
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
  title: 'EVENTS - Sự Kiện & Giải Đấu Lớn',
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
  title: 'DIARY.txt - Nhật Ký & Kỷ Niệm',
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
  title: 'FAQ.txt - Câu Hỏi Thường Gặp',
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
  title: 'JOIN_MPC.exe - Đăng Ký Tuyển Thành Viên 2026',
  desktopLabel: 'JOIN_MPC.exe',
  i18nTitleKey: 'app.join.title',
  i18nLabelKey: 'app.join.label',
  iconUrl: 'assets/icons/exe.svg',
  featured: true,
  width: 520,
  height: 420,
  url: 'apps/join_mpc/index.html'
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
  showOnDesktop: true,
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
  showOnDesktop: true,
  showInStartMenu: true,
  url: 'apps/minesweeper/index.html'
});

// 10. RECYCLE_BIN
AppRegistry.register({
  id: 'RECYCLE_BIN',
  title: 'Thùng rác',
  desktopLabel: 'Thùng rác',
  i18nTitleKey: 'app.recycle.title',
  i18nLabelKey: 'app.recycle.label',
  iconUrl: 'assets/icons/trash.svg',
  width: 500,
  height: 340,
  render: (container) => {
    function renderContent() {
      container.innerHTML = `
        <div class="app-content" style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #666;">
          <img src="assets/icons/trash.svg" style="width: 54px; height: 54px; margin-bottom: 12px;" alt="" />
          <p style="font-size: 13px; font-weight: bold;" data-i18n="app.recycle.empty">${I18n.t('app.recycle.empty')}</p>
          <p style="font-size: 11px; margin-top: 4px; color: #888;" data-i18n="app.recycle.hint">${I18n.t('app.recycle.hint')}</p>
        </div>
      `;
    }
    renderContent();
    I18n.onChange(() => renderContent());
  }
});
