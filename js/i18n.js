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
      'system.title': 'MPCrosoft Windows XP – MPClub',
      'system.ready': 'Sẵn sàng',
      'system.version': 'MPC.exe v2026',
      'skip.btn': 'Bỏ qua ⏭',
      'npc.cta': 'Mở JOIN_MPC.exe',
      'npc.hide': 'Ẩn mình đi',
      'npc.show': 'Gọi linh vật',
      'npc.time.morning': 'Chào buổi sáng ☀️',
      'npc.time.noon': 'Trưa rồi, ăn cơm chưa? 🍚',
      'npc.time.afternoon': 'Chào buổi chiều!',
      'npc.time.evening': 'Chào buổi tối 🌆',
      'npc.time.late': 'Khuya rồi mà vẫn lướt web à? 🌙',
      'npc.greet_first': 'Mình là cáo MPC 🦊 Nhấp đúp vào các thư mục để khám phá CLB, sẵn sàng rồi thì mở JOIN_MPC.exe để đăng ký nhé!',
      'npc.greet_first.touch': 'Mình là cáo MPC 🦊 Chạm vào các thư mục để khám phá CLB, sẵn sàng rồi thì mở JOIN_MPC.exe để đăng ký nhé!',
      'npc.greet_back': 'Bạn quay lại rồi! Bấm vào mình nếu cần gợi ý nha.',
      'npc.nudge1': 'Còn phân vân à? Mở FAQ.txt xem thử nhé!',
      'npc.nudge2': 'Thấy hợp thì đăng ký luôn nha, chỉ khoảng 5 phút thôi! 🦊',
      'npc.tip1': 'Mở OUR_TEAMS để xem các ban và chọn ban hợp với bạn.',
      'npc.tip2': 'Có thắc mắc? FAQ.txt có sẵn câu trả lời đó.',
      'npc.tip3': 'Thử khám phá Start menu và cmd.exe xem, biết đâu có bí mật...',
      'npc.tip4': 'Sẵn sàng chưa? Đăng ký chỉ mất khoảng 5 phút thôi!',
      'npc.react.ABOUT_MPC': 'Đọc xong nhớ ghé OUR_TEAMS xem các ban nha!',
      'npc.react.OUR_TEAMS': 'Bạn thấy mình hợp ban nào nhất?',
      'npc.react.ACTIVITIES': 'Bấm vào ảnh để xem to hơn nha 📸',
      'npc.react.EVENTS': 'Sự kiện nào làm bạn tò mò nhất?',
      'npc.react.DIARY': 'Hậu trường vui lắm, đọc thử đi!',
      'npc.react.FAQ.txt': 'Chưa thấy câu trả lời? Nhắn fanpage CLB nhé!',
      'npc.react.JOIN_MPC.exe': 'Yay! Chúc bạn điền form thuận lợi 🦊',
      'npc.react.calc.exe': 'Tính GPA hả? 😆',
      'npc.react.winmine.exe': 'Cẩn thận mìn đó! 💣',
      'npc.react.cmd.exe': 'Gõ help thử xem...',
      'bios.press_any_key': 'Nhấn phím bất kỳ hoặc chạm màn hình để tiếp tục . . .',

      // BIOS
      'bios.title': 'MPC ROM BIOS (C) 2026 MPClub Inc.',
      'bios.sub': 'MPC-ACPI BIOS Version 2.026',
      'bios.cpu': 'CPU: Intel Core-OU IT @ 4.20 GHz',
      'bios.memory': 'Kiểm tra bộ nhớ: 2048576KB OK',
      'bios.drive_master': 'Nhận diện ổ chính   ... MPC_DRIVE_25122015 (201.5 GB)',
      'bios.drive_slave': 'Nhận diện ổ phụ     ... KHÔNG CÓ',
      'bios.drive_cd': 'Nhận diện ổ CD-ROM  ... CD-ROM DRIVE',
      'bios.pnp': 'Đang khởi tạo các thiết bị Plug and Play...',
      'bios.loading': 'Đang nạp nhân hệ điều hành MPCrosoft...',
      'bios.footer_setup': 'Nhấn DEL để vào SETUP | F11 để chọn Menu Khởi động',
      'bios.footer_click': 'Nhấp chuột bất kỳ đâu để vào hệ điều hành ngay',

      // Bootscreen
      'boot.recruitment_edition': 'Professional',
      'boot.copyright': 'Copyright © 2026 MPClub',

      // Login Screen
      'login.sub': '',
      'login.welcome': 'Chào mừng',
      'login.instruction': 'Nhấp vào tên người dùng để bắt đầu.',
      'login.status_ready': '',
      'login.status_logging_in': 'Đang đăng nhập...',
      'login.turn_off': 'Tắt máy tính',
      'login.badge': '',

      // Desktop Watermark
      'desktop.watermark_sub': 'Professional',

      // Context Menu
      'ctx.view': 'Xem',
      'ctx.sort_by': 'Sắp xếp theo',
      'ctx.sort_name': 'Tên',
      'ctx.sort_type': 'Loại',
      'ctx.sort_auto': 'Tự động sắp xếp',
      'ctx.refresh': 'Làm mới',
      'ctx.paste': 'Dán',
      'ctx.paste_shortcut': 'Dán lối tắt',
      'ctx.new': 'Mới',
      'ctx.new_folder': 'Thư mục mới',
      'ctx.new_txt': 'Tài liệu văn bản (.txt)',
      'ctx.new_img': 'Bản vẽ Paint (.png)',
      'ctx.open': 'Mở',
      'ctx.cut': 'Cắt',
      'ctx.copy': 'Sao chép',
      'ctx.delete': 'Xóa',
      'ctx.rename': 'Đổi tên',
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
      'start.language_settings': 'Cài đặt hệ thống',
      'start.settings': 'Cài đặt hệ thống',
      'start.recruit': 'Đăng ký thành viên',
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
      'app.about.title': 'ABOUT_MPC.txt - Giới thiệu câu lạc bộ MPClub',
      'app.about.label': 'ABOUT_MPC',
      'app.teams.title': 'OUR_TEAMS - Cơ cấu tổ chức và các ban chuyên môn',
      'app.teams.label': 'OUR_TEAMS',
      'app.activities.title': 'ACTIVITIES - Hoạt động và đào tạo',
      'app.activities.label': 'ACTIVITIES',
      'app.events.title': 'EVENTS - Sự kiện và bảng vàng thành tích',
      'app.events.label': 'EVENTS',
      'app.diary.title': 'DIARY.txt - Nhật ký hoạt động và kỷ niệm',
      'app.diary.label': 'DIARY',
      'app.faq.title': 'FAQ.txt - Câu hỏi thường gặp',
      'app.faq.label': 'FAQ.txt',
      'app.join.title': 'JOIN_MPC.exe - Đăng ký tham gia câu lạc bộ',
      'app.join.label': 'JOIN_MPC.exe',
      'app.join_form.title': 'Biểu mẫu đăng ký phỏng vấn tuyển thành viên CLB MPC khóa K26',
      'app.join_form.label': 'MPC_FORM.exe',
      'app.join.heading': 'THÔNG TIN TUYỂN THÀNH VIÊN MPCLUB',
      'app.join.desc': 'Cánh cửa gia nhập đại gia đình MPClub luôn rộng mở chào đón bạn. Hãy nhấn nút bên dưới để điền form đăng ký ứng tuyển!',
      'app.join.btn': '📝 ĐIỀN ĐƠN ỨNG TUYỂN NGAY',
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

      // Settings & Control Panel Window
      'settings.title': 'Cài đặt hệ thống (Control Panel)',
      'settings.label': 'Cài đặt',
      'lang_win.title': 'Cài đặt hệ thống (Control Panel)',
      'lang_win.label': 'Cài đặt hệ thống',
      'lang_win.heading': 'Tiêu chuẩn và định dạng ngôn ngữ',
      'lang_win.sub': 'Chọn ngôn ngữ giao diện cho hệ thống MPCrosoft Windows XP:',
      'lang_win.apply': 'Áp dụng',
      'lang_win.ok': 'Đồng ý',
      'lang_win.cancel': 'Hủy bỏ'
    },

    en: {
      // General
      'system.title': 'MPCrosoft Windows XP – MPClub',
      'system.ready': 'Ready',
      'system.version': 'MPC.exe v2026',
      'skip.btn': 'Skip ⏭',
      'npc.cta': 'Open JOIN_MPC.exe',
      'npc.hide': 'Hide me',
      'npc.show': 'Call the mascot',
      'npc.time.morning': 'Good morning ☀️',
      'npc.time.noon': 'Lunchtime! Eaten yet? 🍚',
      'npc.time.afternoon': 'Good afternoon!',
      'npc.time.evening': 'Good evening 🌆',
      'npc.time.late': 'Still browsing this late? 🌙',
      'npc.greet_first': "I'm the MPC fox 🦊 Double-click the folders to explore the club, and open JOIN_MPC.exe when you're ready to apply!",
      'npc.greet_first.touch': "I'm the MPC fox 🦊 Tap the folders to explore the club, and open JOIN_MPC.exe when you're ready to apply!",
      'npc.greet_back': "You're back! Click me if you need a hint.",
      'npc.nudge1': 'Still deciding? Have a look at FAQ.txt!',
      'npc.nudge2': 'If it feels right, apply now, it only takes about 5 minutes! 🦊',
      'npc.tip1': 'Open OUR_TEAMS to see the teams and pick the one for you.',
      'npc.tip2': 'Got questions? FAQ.txt has answers.',
      'npc.tip3': 'Poke around the Start menu and cmd.exe, there may be secrets...',
      'npc.tip4': 'Ready? Applying takes only about 5 minutes!',
      'npc.react.ABOUT_MPC': 'When you are done, check out OUR_TEAMS!',
      'npc.react.OUR_TEAMS': 'Which team fits you best?',
      'npc.react.ACTIVITIES': 'Click a photo to see it bigger 📸',
      'npc.react.EVENTS': 'Which event are you most curious about?',
      'npc.react.DIARY': 'The behind-the-scenes stories are fun, give them a read!',
      'npc.react.FAQ.txt': "Can't find your answer? Message the club fanpage!",
      'npc.react.JOIN_MPC.exe': 'Yay! Good luck with the form 🦊',
      'npc.react.calc.exe': 'Calculating your GPA? 😆',
      'npc.react.winmine.exe': 'Watch out for mines! 💣',
      'npc.react.cmd.exe': 'Try typing help...',
      'bios.press_any_key': 'Press any key or tap the screen to continue . . .',

      // BIOS
      'bios.title': 'MPC ROM BIOS (C) 2026 MPClub Inc.',
      'bios.sub': 'MPC-ACPI BIOS Version 2.026',
      'bios.cpu': 'CPU: Intel Core-OU IT @ 4.20 GHz',
      'bios.memory': 'Memory Test: 2048576KB OK',
      'bios.drive_master': 'Detecting Primary Master   ... MPC_DRIVE_25122015 (201.5 GB)',
      'bios.drive_slave': 'Detecting Primary Slave    ... NONE',
      'bios.drive_cd': 'Detecting Secondary Master ... CD-ROM DRIVE',
      'bios.pnp': 'Initializing Plug and Play Cards...',
      'bios.loading': 'Loading MPCrosoft Operating System Kernel...',
      'bios.footer_setup': 'Press DEL to enter SETUP | F11 to Boot Menu',
      'bios.footer_click': 'Click anywhere to start OS immediately',

      // Bootscreen
      'boot.recruitment_edition': 'Professional',
      'boot.copyright': 'Copyright © 2026 MPClub',

      // Login Screen
      'login.sub': '',
      'login.welcome': 'Welcome',
      'login.instruction': 'To begin, click your user name.',
      'login.status_ready': '',
      'login.status_logging_in': 'Logging on...',
      'login.turn_off': 'Turn off computer',
      'login.badge': '',

      // Desktop Watermark
      'desktop.watermark_sub': 'Professional',

      // Context Menu
      'ctx.view': 'View',
      'ctx.sort_by': 'Sort by',
      'ctx.sort_name': 'Name',
      'ctx.sort_type': 'Type',
      'ctx.sort_auto': 'Auto Arrange',
      'ctx.refresh': 'Refresh',
      'ctx.paste': 'Paste',
      'ctx.paste_shortcut': 'Paste Shortcut',
      'ctx.new': 'New',
      'ctx.new_folder': 'New Folder',
      'ctx.new_txt': 'Text Document (.txt)',
      'ctx.new_img': 'Paint Drawing (.png)',
      'ctx.open': 'Open',
      'ctx.cut': 'Cut',
      'ctx.copy': 'Copy',
      'ctx.delete': 'Delete',
      'ctx.rename': 'Rename',
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
      'start.language_settings': 'Control Panel',
      'start.settings': 'Control Panel',
      'start.recruit': 'Join MPClub',
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
      'app.join.title': 'JOIN_MPC.exe - Club Application',
      'app.join.label': 'JOIN_MPC.exe',
      'app.join_form.title': 'MPC K26 MEMBER INTERVIEW REGISTRATION FORM',
      'app.join_form.label': 'MPC_FORM.exe',
      'app.join.heading': 'MPCLUB RECRUITMENT INFORMATION',
      'app.join.desc': 'The door to the MPClub family is open to welcome you. Click the button below to complete the application form!',
      'app.join.btn': '📝 APPLY NOW',
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

      // Settings & Control Panel Window
      'settings.title': 'Control Panel (Settings)',
      'settings.label': 'Settings',
      'lang_win.title': 'Control Panel (Settings)',
      'lang_win.label': 'System Settings',
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
