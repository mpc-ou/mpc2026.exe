/**
 * ============================================================================
 * I18n - Centralized Bilingual Translation System (Vietnamese / English)
 * ============================================================================
 * Default Language: 'vi' (Tiếng Việt)
 * Secondary: 'en' (English)
 * Provides reactive re-translation without reloading the page.
 */

const I18n = (function () {
  const STORAGE_KEY = 'mpc_lang_2026';
  let _currentLang = localStorage.getItem(STORAGE_KEY) || 'vi';
  const _listeners = [];

  const translations = {
    vi: {
      // General
      'system.title': 'MPC.exe – MPCrosoft Windows XP (OU IT - Tuyển Thành Viên 2026)',
      'system.ready': 'Sẵn sàng',
      'system.version': 'MPC.exe v2026',
      'skip.btn': '⚡ Nhảy tới Desktop',

      // BIOS
      'bios.title': 'MPC ROM BIOS (C) 2026 MPClub Inc.',
      'bios.sub': 'MPC-ACPI BIOS Version 2.026 - Khoa CNTT Trường ĐH Mở TP.HCM',
      'bios.cpu': 'CPU: Intel Core-OU IT @ 4.20 GHz',
      'bios.memory': 'Kiểm tra bộ nhớ: 2048576KB OK',
      'bios.drive_master': 'Nhận diện ổ chính   ... MPC_DRIVE_15061990 (19.90 GB)',
      'bios.drive_slave': 'Nhận diện ổ phụ     ... KHÔNG CÓ',
      'bios.drive_cd': 'Nhận diện ổ CD-ROM  ... CD-ROM MPC_RECRUITMENT_2026',
      'bios.pnp': 'Đang khởi tạo các thiết bị Plug and Play...',
      'bios.loading': 'Đang nạp nhân hệ điều hành MPCrosoft...',
      'bios.footer_setup': 'Nhấn DEL để vào SETUP | F11 để chọn Menu Khởi động',
      'bios.footer_click': 'Nhấp chuột bất kỳ đâu để vào hệ điều hành ngay',

      // Bootscreen
      'boot.recruitment_edition': 'Khoa CNTT - ĐH Mở TP.HCM • Tuyển Thành Viên 2026',
      'boot.copyright': 'Bản quyền © 2026 Ban Lập Trình (BLT) – MPClub',

      // Login Screen
      'login.sub': 'Đợt tuyển thành viên MPClub 2026',
      'login.welcome': 'Chào mừng',
      'login.instruction': 'Để bắt đầu, hãy nhấp vào tên người dùng của bạn để vào môi trường Desktop MPC.',
      'login.status_ready': 'Nhấp để bắt đầu phiên làm việc',
      'login.status_logging_in': 'Đang đăng nhập...',
      'login.turn_off': 'Tắt máy tính',
      'login.badge': '🚀 Tuyển Thành Viên MPC 2026: Genesis',

      // Desktop Watermark
      'desktop.watermark_sub': 'MPClub • Khoa CNTT - ĐH Mở TP.HCM',

      // Context Menu
      'ctx.view': 'Xem',
      'ctx.sort_by': 'Sắp xếp theo',
      'ctx.refresh': 'Làm mới',
      'ctx.paste': 'Dán',
      'ctx.paste_shortcut': 'Dán lối tắt',
      'ctx.new_folder': 'Thư mục mới',
      'ctx.properties': 'Thuộc tính',

      // Taskbar
      'taskbar.start': 'bắt đầu',
      'taskbar.vol_title': 'Âm lượng',
      'taskbar.mute': 'Tắt tiếng',
      'taskbar.net_title': 'Kết nối mạng nội bộ OU IT',
      'taskbar.net_status': 'Trạng thái:',
      'taskbar.net_connected': 'Đã kết nối',
      'taskbar.net_speed': 'Tốc độ:',
      'taskbar.net_ip': 'Địa chỉ IP:',
      'taskbar.cal_title': 'Lịch & Đồng hồ MPC',

      // Start Menu
      'start.user': 'OU IT',
      'start.my_computer': 'My Computer',
      'start.explorer': 'Trình duyệt Web',
      'start.terminal': 'Dòng lệnh (cmd.exe)',
      'start.media_player': 'Windows Media Player',
      'start.my_docs': 'Tài liệu của tôi',
      'start.my_pics': 'Hình ảnh của tôi',
      'start.my_videos': 'Video của tôi',
      'start.language_settings': 'Cài đặt ngôn ngữ',
      'start.recruit': 'Tuyển thành viên 2026',
      'start.logoff': 'Đăng xuất',
      'start.shutdown': 'Tắt máy tính',

      // Shutdown Dialog
      'shutdown.title': 'Tắt máy tính',
      'shutdown.standby': 'Chế độ chờ',
      'shutdown.turnoff': 'Tắt máy',
      'shutdown.restart': 'Khởi động lại',
      'shutdown.cancel': 'Hủy bỏ',
      'shutdown.closing': 'MPCrosoft Windows đang tắt...',
      'shutdown.safe': 'Bây giờ bạn có thể tắt máy tính an toàn.',
      'shutdown.reboot_hint': '(Nhấp bất kỳ đâu để khởi động lại MPCrosoft Windows XP)',
      'shutdown.sleep_hint': '[Máy tính đang ở chế độ chờ - Nhấp chuột để đánh thức]',

      // Window Controls
      'win.min': 'Thu nhỏ',
      'win.max': 'Phóng to',
      'win.close': 'Đóng',
      'win.file': 'Tệp',
      'win.edit': 'Chỉnh sửa',
      'win.view': 'Xem',
      'win.help': 'Trợ giúp',

      // Default Apps
      'app.about.title': 'ABOUT_MPC.txt - Giới thiệu MPClub',
      'app.about.label': 'ABOUT_MPC',
      'app.teams.title': 'OUR_TEAMS - Các Ban Chuyên Môn MPClub',
      'app.teams.label': 'OUR_TEAMS',
      'app.activities.title': 'ACTIVITIES - Hoạt Động & Workshop',
      'app.activities.label': 'ACTIVITIES',
      'app.events.title': 'EVENTS - Sự Kiện & Giải Đấu Lớn',
      'app.events.label': 'EVENTS',
      'app.diary.title': 'DIARY.txt - Nhật Ký & Kỷ Niệm',
      'app.diary.label': 'DIARY',
      'app.faq.title': 'FAQ.txt - Câu Hỏi Thường Gặp',
      'app.faq.label': 'FAQ.txt',
      'app.join.title': 'JOIN_MPC.exe - Đăng Ký Tuyển Thành Viên 2026',
      'app.join.label': 'JOIN_MPC.exe',
      'app.join.heading': 'TUYỂN THÀNH VIÊN MPCLUB 2026',
      'app.join.desc': 'Cánh cửa gia nhập đại gia đình MPClub đang rộng mở đón chào bạn. Hãy nhấn nút bên dưới để điền form ứng tuyển ngay!',
      'app.join.btn': '🚀 ĐIỀN ĐƠN ỨNG TUYỂN NGAY',
      'app.recycle.title': 'Thùng rác',
      'app.recycle.label': 'Thùng rác',
      'app.recycle.empty': 'Thùng rác trống rỗng.',
      'app.recycle.hint': '(Không có bug nào bị bỏ lại ở đây!)',

      // My Computer
      'exp.back': 'Quay lại',
      'exp.forward': 'Tiến tới',
      'exp.up': 'Lên trên',
      'exp.address': 'Địa chỉ',
      'exp.sys_tasks': 'Tác vụ hệ thống',
      'exp.view_sys_info': 'ℹ Xem thông tin hệ thống',
      'exp.open_cmd': '💻 Mở Dòng lệnh',
      'exp.other_places': 'Vị trí khác',
      'exp.my_network': '🌐 Kết nối mạng',
      'exp.details': 'Chi tiết',
      'exp.drives_group': 'Ổ đĩa cứng',
      'exp.removable_group': 'Thiết bị lưu trữ ngoài',
      'exp.drive_c_label': 'Ổ đĩa cục bộ (C:)',
      'exp.drive_free_suffix': 'trống',
      'exp.ou_easter': '🎓 Ngày thành lập OU: 15/06/1990',

      // Language Settings Window
      'lang_win.title': 'Tùy chọn Vùng và Ngôn ngữ',
      'lang_win.label': 'Cài đặt Ngôn ngữ',
      'lang_win.heading': 'Tiêu chuẩn và định dạng ngôn ngữ',
      'lang_win.sub': 'Chọn ngôn ngữ giao diện cho hệ thống MPCrosoft Windows XP:',
      'lang_win.apply': 'Áp dụng',
      'lang_win.ok': 'Đồng ý',
      'lang_win.cancel': 'Hủy bỏ'
    },

    en: {
      // General
      'system.title': 'MPC.exe – MPCrosoft Windows XP (OU IT - Recruitment 2026)',
      'system.ready': 'Ready',
      'system.version': 'MPC.exe v2026',
      'skip.btn': '⚡ Skip to Desktop',

      // BIOS
      'bios.title': 'MPC ROM BIOS (C) 2026 MPClub Inc.',
      'bios.sub': 'MPC-ACPI BIOS Version 2.026 - OU Faculty of IT',
      'bios.cpu': 'CPU: Intel Core-OU IT @ 4.20 GHz',
      'bios.memory': 'Memory Test: 2048576KB OK',
      'bios.drive_master': 'Detecting Primary Master   ... MPC_DRIVE_15061990 (19.90 GB)',
      'bios.drive_slave': 'Detecting Primary Slave    ... NONE',
      'bios.drive_cd': 'Detecting Secondary Master ... CD-ROM MPC_RECRUITMENT_2026',
      'bios.pnp': 'Initializing Plug and Play Cards...',
      'bios.loading': 'Loading MPCrosoft Operating System Kernel...',
      'bios.footer_setup': 'Press DEL to enter SETUP | F11 to Boot Menu',
      'bios.footer_click': 'Click anywhere to start OS immediately',

      // Bootscreen
      'boot.recruitment_edition': 'Faculty of IT - Open University • Recruitment 2026',
      'boot.copyright': 'Copyright © 2026 Ban Lập Trình (BLT) – MPClub',

      // Login Screen
      'login.sub': 'MPClub Member Recruitment 2026',
      'login.welcome': 'Welcome',
      'login.instruction': 'To begin, click your user name to log on to the MPC Desktop environment.',
      'login.status_ready': 'Click to start session',
      'login.status_logging_in': 'Logging on...',
      'login.turn_off': 'Turn off computer',
      'login.badge': '🚀 MPC Recruitment 2026: Genesis',

      // Desktop Watermark
      'desktop.watermark_sub': 'MPClub • Faculty of IT - Open University',

      // Context Menu
      'ctx.view': 'View',
      'ctx.sort_by': 'Sort by',
      'ctx.refresh': 'Refresh',
      'ctx.paste': 'Paste',
      'ctx.paste_shortcut': 'Paste Shortcut',
      'ctx.new_folder': 'New Folder',
      'ctx.properties': 'Properties',

      // Taskbar
      'taskbar.start': 'start',
      'taskbar.vol_title': 'Volume',
      'taskbar.mute': 'Mute',
      'taskbar.net_title': 'OU IT Local Area Connection',
      'taskbar.net_status': 'Status:',
      'taskbar.net_connected': 'Connected',
      'taskbar.net_speed': 'Speed:',
      'taskbar.net_ip': 'IP Address:',
      'taskbar.cal_title': 'MPC Date & Time',

      // Start Menu
      'start.user': 'OU IT',
      'start.my_computer': 'My Computer',
      'start.explorer': 'Internet Explorer',
      'start.terminal': 'Command Prompt',
      'start.media_player': 'Windows Media Player',
      'start.my_docs': 'My Documents',
      'start.my_pics': 'My Pictures',
      'start.my_videos': 'My Videos',
      'start.language_settings': 'Language Settings',
      'start.recruit': 'Recruitment 2026',
      'start.logoff': 'Log Off',
      'start.shutdown': 'Turn Off Computer',

      // Shutdown Dialog
      'shutdown.title': 'Turn off computer',
      'shutdown.standby': 'Stand By',
      'shutdown.turnoff': 'Turn Off',
      'shutdown.restart': 'Restart',
      'shutdown.cancel': 'Cancel',
      'shutdown.closing': 'MPCrosoft Windows is shutting down...',
      'shutdown.safe': 'It is now safe to turn off your computer.',
      'shutdown.reboot_hint': '(Click anywhere to restart MPCrosoft Windows XP)',
      'shutdown.sleep_hint': '[Computer in Stand By Mode - Click anywhere to wake up]',

      // Window Controls
      'win.min': 'Minimize',
      'win.max': 'Maximize',
      'win.close': 'Close',
      'win.file': 'File',
      'win.edit': 'Edit',
      'win.view': 'View',
      'win.help': 'Help',

      // Default Apps
      'app.about.title': 'ABOUT_MPC.txt - About MPClub',
      'app.about.label': 'ABOUT_MPC',
      'app.teams.title': 'OUR_TEAMS - MPClub Departments',
      'app.teams.label': 'OUR_TEAMS',
      'app.activities.title': 'ACTIVITIES - Workshops & Activities',
      'app.activities.label': 'ACTIVITIES',
      'app.events.title': 'EVENTS - Tournaments & Competitions',
      'app.events.label': 'EVENTS',
      'app.diary.title': 'DIARY.txt - Diary & Memories',
      'app.diary.label': 'DIARY',
      'app.faq.title': 'FAQ.txt - Frequently Asked Questions',
      'app.faq.label': 'FAQ.txt',
      'app.join.title': 'JOIN_MPC.exe - Recruitment Form 2026',
      'app.join.label': 'JOIN_MPC.exe',
      'app.join.heading': 'MPCLUB RECRUITMENT 2026',
      'app.join.desc': 'The door to the MPClub family is wide open for you. Click the button below to complete the recruitment application!',
      'app.join.btn': '🚀 APPLY NOW',
      'app.recycle.title': 'Recycle Bin',
      'app.recycle.label': 'Recycle Bin',
      'app.recycle.empty': 'Recycle Bin is Empty.',
      'app.recycle.hint': '(No bugs left behind here!)',

      // My Computer
      'exp.back': 'Back',
      'exp.forward': 'Forward',
      'exp.up': 'Up',
      'exp.address': 'Address',
      'exp.sys_tasks': 'System Tasks',
      'exp.view_sys_info': 'ℹ View system info',
      'exp.open_cmd': '💻 Open Command Prompt',
      'exp.other_places': 'Other Places',
      'exp.my_network': '🌐 My Network Places',
      'exp.details': 'Details',
      'exp.drives_group': 'Hard Disk Drives',
      'exp.removable_group': 'Devices with Removable Storage',
      'exp.drive_c_label': 'Local Disk (C:)',
      'exp.drive_free_suffix': 'free',
      'exp.ou_easter': '🎓 OU Foundation: 15/06/1990',

      // Language Settings Window
      'lang_win.title': 'Regional and Language Options',
      'lang_win.label': 'Language Settings',
      'lang_win.heading': 'Standards and formats',
      'lang_win.sub': 'Select the interface language for MPCrosoft Windows XP:',
      'lang_win.apply': 'Apply',
      'lang_win.ok': 'OK',
      'lang_win.cancel': 'Cancel'
    }
  };

  function t(key) {
    const langDict = translations[_currentLang] || translations.vi;
    return langDict[key] || translations.vi[key] || key;
  }

  function applyDOMTranslations() {
    // 1. Text elements with data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (key) {
        el.textContent = t(key);
      }
    });

    // 2. Titles/Tooltips with data-i18n-title
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      if (key) {
        el.setAttribute('title', t(key));
      }
    });

    // 3. Values with data-i18n-val
    document.querySelectorAll('[data-i18n-val]').forEach(el => {
      const key = el.getAttribute('data-i18n-val');
      if (key) {
        el.value = t(key);
      }
    });

    // 4. Update Language switcher pill in taskbar
    const langBtn = document.getElementById('tray-lang-btn');
    if (langBtn) {
      langBtn.innerHTML = `<i class="bi bi-translate" style="font-size: 11px; margin-right: 3px;"></i>${_currentLang.toUpperCase()}`;
      langBtn.setAttribute('title', _currentLang === 'vi' ? 'Ngôn ngữ: Tiếng Việt (Bấm để chuyển sang English)' : 'Language: English (Click to switch to Tiếng Việt)');
    }

    // 5. Update HTML lang attribute and page title
    document.documentElement.lang = _currentLang;
    document.title = t('system.title');
  }

  function setLanguage(lang) {
    if (lang !== 'vi' && lang !== 'en') return;
    _currentLang = lang;
    localStorage.setItem(STORAGE_KEY, lang);
    applyDOMTranslations();

    // Notify registered listeners
    _listeners.forEach(fn => {
      try { fn(lang); } catch (e) { console.error('i18n listener error:', e); }
    });
  }

  function toggleLanguage() {
    setLanguage(_currentLang === 'vi' ? 'en' : 'vi');
  }

  function getLanguage() {
    return _currentLang;
  }

  function onChange(callback) {
    if (typeof callback === 'function') {
      _listeners.push(callback);
    }
  }

  return {
    t,
    setLanguage,
    toggleLanguage,
    getLanguage,
    applyDOMTranslations,
    onChange
  };
})();

window.I18n = I18n;
