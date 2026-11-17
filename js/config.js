/**
 * ============================================================================
 * MPC_CONFIG - Tập tin cấu hình tham số tập trung (Centralized Configuration)
 * ============================================================================
 * Dùng để cấu hình:
 * 1. Đường dẫn Google Form & tên các tham số `entry.xxxxx` để tạo link Pre-fill tự động
 * 2. Các tuỳ chọn (options) chuẩn khớp 100% với Google Form Tuyển Thành Viên CLB MPC K26
 * 3. Các liên kết chính thức của CLB (mpclub.dev, fanpage, email, trường, khoa)
 */

const MPC_CONFIG = {
  // 1. Liên kết hệ thống & CLB
  links: {
    website: 'https://www.mpclub.dev',
    eventsVi: 'https://www.mpclub.dev/vi/events',
    eventsEn: 'https://www.mpclub.dev/en/events',
    membersVi: 'https://www.mpclub.dev/vi/members',
    membersEn: 'https://www.mpclub.dev/en/members',
    activitiesVi: 'https://www.mpclub.dev/vi/activities',
    activitiesEn: 'https://www.mpclub.dev/en/activities',
    achievementsVi: 'https://www.mpclub.dev/vi/achievements',
    achievementsEn: 'https://www.mpclub.dev/en/achievements',
    webDesignArchiveVi: 'https://www.mpclub.dev/vi/web-design/exhibitions',
    webDesignArchiveEn: 'https://www.mpclub.dev/en/web-design/exhibitions',
    fanpage: 'https://fb.com/CLBLapTrinhTrenThietBiDiDong',
    email: 'it.mpclub@ou.edu.vn',
    university: 'https://ou.edu.vn',
    faculty: 'https://it.ou.edu.vn'
  },

  // 2. Cấu hình Google Form Pre-fill (ĐĂNG KÝ PHỎNG VẤN TUYỂN THÀNH VIÊN CLB MPC K26)
  googleForm: {
    // Link viewform của Google Form (Sử dụng /a/ou.edu.vn/ để Google tự động ưu tiên tài khoản @ou.edu.vn đang đăng nhập)
    baseUrl: 'https://docs.google.com/a/ou.edu.vn/forms/d/e/1FAIpQLSdSIN01Kc9bZURnb5tCcBSqejQMt7p3x_tOFydyk5vnSvFDVQ/viewform',

    // Tên miền Google Workspace ưu tiên khi chuyển hướng
    preferDomain: 'ou.edu.vn',

    // Ánh xạ tên trường dữ liệu trên web -> mã tham số entry.<id> của Google Form
    params: {
      fullName: 'entry.2122493310',                       // Họ tên của bạn ?
      studentId: 'entry.651214934',                       // MSSV
      schoolEmail: 'entry.1828045910',                    // Email do trường cấp ?
      faculty: 'entry.149535161',                         // Bạn đến từ khoa nào ?
      facultyOther: 'entry.149535161.other_option_response',
      phone: 'entry.986440216',                           // SĐT liên lạc
      facebookUrl: 'entry.1279982109',                    // Link Facebook của bạn?
      choice1: 'entry.319474904',                         // Nguyện vọng 1 của bạn ?
      choice2: 'entry.33636831',                          // Nguyện vọng 2 của bạn ? ( nếu có )
      knowClubFrom: 'entry.612975854',                    // Bạn biết đến CLB MPC chúng mình từ đâu ?
      knowClubFromOther: 'entry.612975854.other_option_response',
      knowRecruitFrom: 'entry.1050486977',                // Bạn biết bài tuyển thành viên này từ đâu?
      knowRecruitFromOther: 'entry.1050486977.other_option_response',
      firstImpression: 'entry.1606398816',                // Ấn tượng đầu tiên khi biết đến CLB?
      prevClubExp: 'entry.719467644',                     // Bạn đã từng tham gia CLB nào hay chưa?
      prevClubRole: 'entry.1079859863',                    // Nếu có bạn giữ vai trò gì & hoạt động nào?
      strengths: 'entry.279215183',                       // Ưu điểm của bạn?
      weaknesses: 'entry.1525654999',                     // Khuyết điểm của bạn?
      reasonToJoin: 'entry.579587818',                    // Lý do muốn tham gia CLB?
      contribution: 'entry.1813422362',                   // Đóng góp được gì cho CLB & ban đã chọn?
      whyChooseYou: 'entry.1746300625',                   // Lý do để CLB chọn bạn?
      interviewSlot: 'entry.703900341',                   // Khung giờ phỏng vấn
      questionsForClub: 'entry.1506184401'                // Câu hỏi dành cho CLB
    },

    // Các giá trị tuỳ chọn khớp chính xác với Google Form
    options: {
      faculty: [
        'Khoa Công nghệ thông tin',
        'Khoa Đào tạo đặc biệt'
      ],
      departments: [
        'Ban lập trình 💻',
        'Ban truyền thông 📸',
        'Ban hậu cần 🛠️'
      ],
      knowClubFrom: [
        'Từ các trang mạng xã hội gợi ý',
        'Từ các buổi sinh hoạt công dân, web khoa, sổ tay sinh viên,...',
        'Từ các sự kiện mà CLB tham gia, tổ chức'
      ],
      knowRecruitFrom: [
        'Từ chính page CLB',
        'Bạn bè chia sẻ',
        'Thầy cô giới thiệu'
      ],
      interviewSlot: [
        'Offline 8h30 --> 11h  ngày 22/11',
        'Offline 13h --> 16h ngày 22/11'
      ]
    },

    // Giá trị mặc định điền sẵn (nếu muốn set cố định một số param)
    defaultValues: {}
  },

  /**
   * Tạo URL Google Form có đính kèm sẵn các tham số pre-fill (?usp=pp_url&entry.xxx=...)
   * Hỗ trợ tự động __other_option__ cho các câu hỏi trắc nghiệm có mục "Mục khác:"
   * @param {Object} formValues - Dữ liệu người dùng nhập trên web
   * @returns {string} URL Google Form đã điền sẵn tham số
   */
  buildGoogleFormUrl(formValues = {}) {
    let base = this.googleForm.baseUrl;
    const domain = (this.googleForm.preferDomain || '').trim();

    // Nếu cấu hình preferDomain (VD: ou.edu.vn), tự động chèn /a/ou.edu.vn/ vào URL Google Docs/Forms
    // để trình duyệt tự động nhảy sang tài khoản @ou.edu.vn đang đăng nhập (thay vì kẹt ở Gmail mặc định u/0)
    if (domain && base.includes('docs.google.com/forms/')) {
      base = base.replace('docs.google.com/forms/', `docs.google.com/a/${domain}/forms/`);
    }

    const query = new URLSearchParams();
    query.set('usp', 'pp_url');

    const merged = Object.assign({}, this.googleForm.defaultValues, formValues);
    const map = this.googleForm.params || {};

    // Nếu người dùng đã nhập email trường (@ou.edu.vn), truyền thêm authuser=<email>
    // để Google chuyển thẳng sang đúng tài khoản đó
    const emailCandidate = String(merged.schoolEmail || merged.email || '').trim();
    if (emailCandidate && (!domain || emailCandidate.toLowerCase().endsWith('@' + domain.toLowerCase()))) {
      query.set('authuser', emailCandidate);
    }

    Object.keys(merged).forEach(key => {
      const val = merged[key];
      if (val === undefined || val === null || String(val).trim() === '') return;
      const entryId = key.startsWith('entry.') ? key : (map[key] || key);
      query.set(entryId, String(val));
    });

    return `${base}?${query.toString()}`;
  }
};

window.MPC_CONFIG = MPC_CONFIG;
