# MPC.exe – Hệ Điều Hành Mô Phỏng Giới Thiệu MPClub

<p align="center">
  <img src="assets/icons/logo.png" alt="MPClub Logo" width="96" height="96" />
</p>

<p align="center">
  <strong>Trang thông tin tương tác giới thiệu Câu lạc bộ Lập trình trên thiết bị di động (MPClub)</strong><br>
  <em>Khoa Công nghệ Thông tin – Trường Đại học Mở TP.HCM</em>
</p>

<p align="center">
  <a href="#gi%E1%BA%A5y-ph%C3%A9p-license"><img src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square" alt="License: MIT" /></a>
  <a href="https://www.mpclub.dev"><img src="https://img.shields.io/badge/Version-2026.1.0-brightgreen.svg?style=flat-square" alt="Version" /></a>
  <a href="#"><img src="https://img.shields.io/badge/Platform-Web%20(Pure%20Vanilla)-orange.svg?style=flat-square" alt="Platform: Pure Vanilla" /></a>
  <a href="#"><img src="https://img.shields.io/badge/Build-Passing-success.svg?style=flat-square" alt="Build Status" /></a>
  <a href="#"><img src="https://img.shields.io/badge/Dependencies-Zero-lightgrey.svg?style=flat-square" alt="Zero Dependencies" /></a>
</p>

---

## 📖 Tổng Quan (Overview)

**MPC.exe** là một hệ thống web tương tác mô phỏng hệ điều hành kinh điển **Windows XP Luna**, được xây dựng để giới thiệu toàn diện về **Câu lạc bộ Lập trình trên thiết bị di động (MPClub – Khoa CNTT, Trường ĐH Mở TP.HCM)**. 

Thay vì sử dụng landing page truyền thống, dự án đưa người xem trải nghiệm một hệ điều hành máy tính retro chân thực: từ màn hình BIOS, chuỗi khởi động âm thanh, màn hình đăng nhập, cho tới môi trường Desktop đa nhiệm với hệ thống cửa sổ, trình quản lý tệp ảo (VFS) và các ứng dụng thông tin chuyên môn.

Dự án phục vụ sinh viên tìm hiểu về định hướng đào tạo công nghệ, các ban chuyên môn, các cuộc thi thường niên (Web Design, Robocode), cũng như thực hiện đăng ký tuyển thành viên mới thông qua biểu mẫu thông minh tích hợp tham số Google Forms.

---

## ✨ Tính Năng Nổi Bật (Key Features)

- 🖥️ **Mô Phỏng Windows XP Luna Hoàn Chỉnh**: Trình quản lý cửa sổ (`WindowManager`) hỗ trợ kéo thả tự do, phóng to, thu nhỏ, ghim thanh tác vụ (Taskbar), hover xem trước thumbnail, và xử lý phân lớp z-index mượt mà.
- 📁 **Hệ Thống Tệp Ảo Bền Vững (Virtual File System - VFS)**: Mô phỏng ổ đĩa cục bộ C: (25.12 GB trống / 201.5 GB), duyệt thư mục, tạo mới, đổi tên, xóa vào Thùng rác (Recycle Bin), đồng bộ dữ liệu người dùng qua `localStorage`.
- 💻 **Dòng Lệnh Tương Tác (`cmd.exe`)**: Terminal retro hỗ trợ các câu lệnh chuẩn: `dir`, `cd`, `type`, `cat`, `cls`, `tree`, `date`, `whoami`, `ver`, `exit` và lưu trữ lịch sử lệnh gõ.
- 🌐 **Hệ Thống Ứng Dụng Chuyên Môn**:
  - **`ABOUT_MPC`**: Giới thiệu định danh, sứ mệnh, giá trị cốt lõi và lộ trình đào tạo kỹ thuật 4 giai đoạn.
  - **`OUR_TEAMS`**: Sơ đồ 4 ban chuyên môn (Lập trình, Truyền thông, Hậu cần) và danh sách Ban Chủ nhiệm nhiệm kỳ 2025–2026.
  - **`ACTIVITIES`**: Kho hoạt động nội bộ, dã ngoại, workshop học thuật và thư viện hình ảnh tương tác kèm Lightbox.
  - **`EVENTS`**: Bảng tin các giải đấu tiêu biểu (Web Design, Robocode) và bảng vàng vinh danh Olympic Tin học SV.
  - **`DIARY` & `FAQ`**: Nhật ký hoạt động hơn 10 năm và trung tâm giải đáp thắc mắc thường gặp.
- 📝 **Cổng Đăng Ký Tuyển Thành Viên (`JOIN_MPC.exe`)**:
  - Hướng dẫn quy trình 4 vòng tuyển chọn thành viên.
  - Tích hợp biểu mẫu nội bộ (`JOIN_MPC_FORM.exe`) với logic tự động tiền điền tham số (pre-fill URL params) chuyển sang Google Form chính thức, hỗ trợ kiểm tra không trùng lặp nguyện vọng ban và ưu tiên tài khoản Google `@ou.edu.vn`.
- 🌐 **Hỗ Trợ Song Ngữ Toàn Diện (Bilingual i18n)**: Chuyển đổi ngôn ngữ tức thì giữa **Tiếng Việt** và **English** từ khay hệ thống hoặc qua tham số URL (`?lang=vi` / `?lang=en`).
- 🦊 **Linh Vật Tương Tác Thông Minh (Fox NPC)**: Chú cáo mascot xuất hiện với các câu chào theo thời gian thực, gợi ý ngữ cảnh và phản hồi sống động khi mở các ứng dụng.
- 🎮 **Phụ Kiện Retro Đi Kèm**: Windows Media Player (`wmplayer.exe`), Paint (`mspaint.exe`), Máy tính (`calc.exe`), Dò mìn (`winmine.exe`), và Trình quản lý tác vụ (`taskmgr.exe`).

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

Dự án được xây dựng với triết lý **Zero External Dependencies** nhằm tối ưu tốc độ tải trang, tính ổn định và khả năng triển khai tức thì:

| Hạng mục | Công nghệ |
| :--- | :--- |
| **Giao diện (Frontend)** | HTML5 Semantic, CSS3 (Modern Flexbox, CSS Grid, Custom Properties, Backdrop Filters) |
| **Logic & Kiến trúc** | Vanilla JavaScript (ES6+ Modular Architecture, Object-Oriented Event Bus) |
| **Âm thanh (Audio Engine)**| HTML5 Audio API & Web Audio API (Tạo tiếng bíp BIOS và hiệu ứng âm thanh cổ điển) |
| **Lưu trữ dữ liệu** | Web Storage API (`localStorage`) |
| **Biểu tượng (Iconography)** | Vector SVG tùy chỉnh chuẩn Windows XP & Bootstrap Icons |
| **Phông chữ (Typography)** | `Tahoma`, `Segoe UI`, `MS Sans Serif` |

---

## 📂 Cấu Trúc Thư Mục (Project Structure)

```text
mpc2026.exe/
├── index.html                 # Trang chủ: BIOS, Bootscreen, Login và Desktop chính
├── LICENSE                    # Giấy phép mã nguồn mở MIT
├── README.md                  # Tài liệu hướng dẫn dự án
├── CONTRIBUTING.md           # Hướng dẫn đóng góp mã nguồn
├── apps/                      # Các ứng dụng nội bộ (Sub-applications)
│   ├── about_mpc/             # Giới thiệu CLB MPClub (Hồ sơ định danh, lộ trình đào tạo)
│   ├── activities/            # Hoạt động nội bộ, đối ngoại và thư viện ảnh
│   ├── calculator/            # Máy tính bỏ túi (calc.exe)
│   ├── diary/                 # Nhật ký sự kiện và bài viết kỷ niệm
│   ├── events/                # Cuộc thi Web Design, Robocode và Bảng vàng thành tích
│   ├── faq/                   # Câu hỏi thường gặp
│   ├── join_mpc/              # Chương trình đăng ký ứng tuyển & form pre-fill params
│   ├── minesweeper/           # Game Dò mìn (winmine.exe)
│   ├── mpclub_dev/            # Trình duyệt nhúng trang chủ CLB
│   ├── our_teams/             # Cơ cấu 4 ban và Ban Chủ nhiệm 2025–2026
│   ├── paint/                 # Trình vẽ đồ họa pixel (mspaint.exe)
│   └── _shared/               # CSS đáp ứng và thư viện đa ngôn ngữ dùng chung
├── assets/                    # Tài nguyên hình ảnh, biểu tượng, video, âm thanh
│   ├── backgrounds/           # Hình nền desktop (Bliss XP)
│   ├── icons/                 # Bộ biểu tượng Windows XP và logo MPClub (.svg, .png)
│   ├── npc/                   # Hình ảnh linh vật cáo MPC
│   ├── sounds/                # Hiệu ứng âm thanh BIOS, Startup, Logon, Error...
│   └── videos/                # Video giới thiệu câu lạc bộ
├── css/                       # Hệ thống bảng mã định kiểu giao diện
│   ├── applications.css       # Định kiểu cửa sổ ứng dụng
│   ├── boot.css               # Định kiểu BIOS và màn hình khởi động XP
│   ├── desktop.css            # Định kiểu màn hình nền Desktop và lưới icon
│   ├── login.css              # Định kiểu màn hình Welcome / Đăng nhập
│   ├── taskbar.css            # Định kiểu thanh tác vụ, Start Menu và khay hệ thống
│   └── window.css             # Định kiểu khung cửa sổ, thanh tiêu đề và nút điều khiển
└── js/                        # Hệ thống mô-đun mã nguồn JavaScript
    ├── app-registry.js        # Đăng ký và quản lý thông tin các ứng dụng
    ├── applications.js        # Khởi tạo danh mục ứng dụng hệ thống
    ├── boot.js                # Điều khiển luồng khởi động BIOS, Boot và Welcome
    ├── config.js              # Cấu hình liên kết biểu mẫu và tham số form tuyển sinh
    ├── desktop.js             # Quản lý tương tác màn hình nền, lưới icon, marquee selection
    ├── i18n.js                # Bộ từ điển song ngữ (Tiếng Việt và English)
    ├── npc.js                 # Điều khiển hành vi linh vật cáo MPC
    ├── taskbar.js             # Quản lý Start Menu, Taskbar buttons, khay hệ thống
    ├── vfs.js                 # Hệ thống tệp ảo Virtual File System
    ├── window-manager.js      # Bộ điều phối cửa sổ (Di chuyển, thay đổi kích thước, phân lớp)
    └── apps/                  # Logic chi tiết các ứng dụng lõi
        ├── explorer-browser.js# Trình duyệt web MPCrosoft Explorer
        ├── image-viewer.js    # Trình xem hình ảnh Windows Picture Viewer
        ├── language-settings.js# Bảng điều khiển cài đặt ngôn ngữ
        ├── media-player.js    # Trình phát đa phương tiện Windows Media Player
        ├── my-computer.js     # Trình khám phá ổ đĩa C: và My Computer
        ├── task-manager.js    # Trình quản lý tiến trình Windows Task Manager
        └── terminal.js        # Trình thông dịch dòng lệnh Command Prompt
```

---

## 🚀 Hướng Dẫn Cài Đặt (Getting Started)

### Yêu Cầu Hệ Thống (Prerequisites)
- Dự án là web tĩnh thuần túy, tương thích hoàn toàn với mọi trình duyệt hiện đại (Google Chrome, Microsoft Edge, Mozilla Firefox, Apple Safari, Brave, Opera).
- Không yêu cầu cài đặt Node.js, npm, cơ sở dữ liệu hay runtime bên ngoài.

### Các Bước Cài Đặt (Installation)

1. **Sao chép mã nguồn về máy tính cá nhân**:
   ```bash
   git clone https://github.com/mpc-ou/mpc2026.exe.git
   cd mpc2026.exe
   ```

2. **Khởi chạy ứng dụng**:
   - **Cách 1: Khởi chạy bằng Live Server (Khuyên dùng trong môi trường phát triển)**:
     Mở thư mục dự án bằng **Visual Studio Code**, nhấp chuột phải vào tệp `index.html` và chọn **Open with Live Server**.
   
   - **Cách 2: Khởi chạy bằng máy chủ HTTP nhẹ**:
     Sử dụng Python (đã có sẵn trên hầu hết các máy tính):
     ```bash
     # Dành cho Python 3.x
     python -m http.server 8080
     ```
     Sau đó truy cập địa chỉ `http://localhost:8080` trên trình duyệt.

   - **Cách 3: Mở trực tiếp**:
     Nhấp đúp chuột vào tệp `index.html` để mở trực tiếp trong trình duyệt web của bạn.

---

## 💡 Hướng Dẫn Sử Dụng (Usage)

### Tham Số Đường Dẫn (URL Parameters)
Hệ thống hỗ trợ các tham số URL hữu ích phục vụ việc điều hướng và kiểm thử:
- `?lang=en`: Khởi chạy trực tiếp với ngôn ngữ hiển thị Tiếng Anh (mặc định là `vi`).
- `?lang=vi`: Khởi chạy trực tiếp với ngôn ngữ hiển thị Tiếng Việt.
- `?boot=1`: Buộc hệ thống chạy lại chuỗi khởi động BIOS và màn hình Boot (mặc định sau lần truy cập đầu tiên, hệ thống sẽ bỏ qua để vào thẳng Desktop).

### Cấu Hình Biểu Mẫu Tuyển Thành Viên (`js/config.js`)
Để cập nhật đường dẫn Google Form tuyển quân hoặc mã trường tham số câu hỏi (`entry.ID`), quản trị viên chỉ cần chỉnh sửa tệp `js/config.js`:
```javascript
const MPC_CONFIG = {
  form: {
    baseUrl: "https://docs.google.com/forms/d/e/.../viewform",
    fields: {
      fullName: "entry.2122493310",
      mssv: "entry.651214934",
      universityEmail: "entry.1828045910",
      // ...
    }
  }
};
```

---

## 🤝 Đóng Góp (Contributing)

Mọi đóng góp nhằm hoàn thiện giao diện, bổ sung tính năng hoặc tối ưu hiệu năng đều được trân trọng. Vui lòng tham khảo chi tiết tại tệp [CONTRIBUTING.md](CONTRIBUTING.md).

Quy trình tóm tắt:
1. Fork repository này về tài khoản GitHub của bạn.
2. Tạo nhánh tính năng mới (`git checkout -b feat/tinh-nang-moi`).
3. Commit các thay đổi với thông điệp rõ ràng (`git commit -m 'feat: them tinh nang XYZ'`).
4. Đẩy mã nguồn lên nhánh của bạn (`git push origin feat/tinh-nang-moi`).
5. Tạo một **Pull Request** mới hướng về nhánh `main` để được xét duyệt.

---

## 📜 Giấy Phép (License)

Dự án được phân phối dưới giấy phép mã nguồn mở **MIT License**. Thông tin chi tiết xem tại tệp [LICENSE](LICENSE).

---

<p align="center">
  <strong>Câu lạc bộ Lập trình trên thiết bị di động (MPClub)</strong><br>
  Khoa Công nghệ Thông tin – Trường Đại học Mở TP.HCM<br>
  Website: <a href="https://www.mpclub.dev">www.mpclub.dev</a> • Email: <a href="mailto:it.mpclub@ou.edu.vn">it.mpclub@ou.edu.vn</a><br>
  <em>"Ở đâu có bug, ở đó có MPC!"</em>
</p>
