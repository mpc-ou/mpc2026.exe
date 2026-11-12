# MPC.exe – Hệ Thống Desktop Retro MPClub (Recruitment 2026)

> **Đơn vị thực hiện:** Ban Lập trình (BLT) – MPClub  
> **Trực thuộc:** Khoa Công Nghệ Thông Tin – Trường Đại học Mở TP.HCM (OU IT)  
> **Loại sản phẩm:** Website tĩnh tương tác (Static Interactive Website - Zero Dependencies)  
> **Công nghệ:** HTML5, CSS3, Vanilla JavaScript (Modular Architecture)  
> **Phong cách thiết kế:** Retro Windows XP Luna (MPCrosoft Edition) kết hợp Pixel Art & Y2K Aesthetic  

---

## ⚡ Bắt Đầu Nhanh (Quick Start)

Dự án là một **website tĩnh thuần 100%**, không sử dụng `node_modules`, không yêu cầu `npm install` hay cài đặt môi trường phức tạp:

1. **Cách 1 (Khuyên dùng):** Mở thư mục dự án bằng **VS Code** ➜ Click chuột phải vào file `index.html` ➜ Chọn **Open with Live Server**.
2. **Cách 2:** Mở trực tiếp file `index.html` bằng bất kỳ trình duyệt nào (Chrome, Edge, Firefox, Brave...).

> **Mẹo cho Developer:** Chuỗi boot chỉ chạy ở lần truy cập đầu tiên (~2 giây; bấm phím bất kỳ, chạm màn hình hoặc nút **`Bỏ qua ⏭`** để vào Desktop ngay). Các lần sau vào thẳng Desktop. Muốn xem lại boot: thêm `?boot=1` vào URL, hoặc chọn Restart trong Start menu.

---

## 🌟 Tổng Quan Tính Năng Đã Hoàn Thiện

1. **Chuỗi khởi động sống động (Animated Boot Sequence)**:
   - **Màn hình BIOS động (`js/boot.js`)**: Hiệu ứng máy đánh chữ in từng dòng thông số RAM, ổ cứng và phát âm thanh POST Beep 8-bit (`assets/sounds/bios_boot.wav`).
   - **Bootscreen MPCrosoft XP**: Hiển thị logo chính thức `assets/icons/logo.png`, dòng chữ *MPCrosoft MPC xp* cùng thanh chạy 3 khối xanh nguyên bản.
   - **Màn hình Welcome / Login**: Tài khoản duy nhất **"OU IT"** (Avatar sinh viên IT). Khi nhấn vào phát âm thanh `logon.mp3`, hiển thị trạng thái `Logging on...` và chuyển mượt mà vào Desktop kèm nhạc `startup.mp3`.
2. **Giao diện Desktop & Window Manager**:
   - Hình nền chính thức `assets/backgrounds/bg.jpg`.
   - Chuột phải trên Desktop mở **Context Menu** chuẩn Windows XP (`Refresh` có hiệu ứng nháy màn hình, sắp xếp icon).
   - Kéo chuột chọn nhiều icon (Rubber-band Marquee Selection).
   - Hỗ trợ di chuyển cửa sổ kéo thả mượt mà (tự động khóa `pointer-events: none` trên iframe để không bị khựng chuột), phóng to, thu nhỏ xuống Taskbar và đóng.
3. **Cửa sổ tắt máy (Turn Off Computer Modal)**:
   - Chọn *Turn Off Computer* từ Start Menu hoặc Login: Toàn bộ nền chuyển sang **hiệu ứng xám dần (Grayscale Desaturation)**.
   - Hộp thoại 3 nút kinh điển:
     - ⏳ **Stand By (Vàng)**: Chế độ chờ, click chuột để đánh thức.
     - ⏻ **Turn Off (Đỏ)**: Phát âm thanh `shut-down.mp3`, hiện màn hình *"MPCrosoft Windows is shutting down..."* rồi chuyển sang màn hình cổ điển *"It is now safe to turn off your computer"*.
     - 🔄 **Restart (Xanh)**: Khởi động lại toàn bộ chu trình máy.
4. **Hệ thống Cây Thư Mục Ảo (Virtual File System - VFS)**:
   - Cấu trúc thư mục tại `js/vfs.js`.
   - **My Computer & Ổ đĩa C: (Local Disk C:)**:
     - Thanh dung lượng trực quan: **15.6 GB free of 19.90 GB** *(Easter egg: Ngày thành lập Trường ĐH Mở TP.HCM - 15/06/1990)*.
     - Duyệt thư mục như máy thật: `Program Files`, `WINDOWS/system32`, `My Documents/My Pictures`, `My Videos`...
5. **Command Prompt (`cmd.exe`)**:
   - Terminal tương tác thực tế với các lệnh: `dir`, `cd`, `type`, `cat`, `cls`, `tree`, `date`, `whoami`, `ver`, `secret`, `exit`.
   - Lưu lịch sử lệnh gõ bằng phím mũi tên Lên/Xuống.
6. **Trình duyệt MPCrosoft Explorer (`iexplore.exe`)**:
   - Giao diện Tab Windows XP Luna: Tab bo tròn bóng bẩy, nút **`+`** tạo tab mới.
   - Nút Back / Forward hình tròn xanh lá cây, nút Refresh và nút Home **`🏠`**.
   - **Tải website thật trực tuyến**: Trang mặc định là website chính thức **`https://www.mpclub.dev`**, Tab 2 là trang Khoa CNTT **`https://it.ou.edu.vn`**.
   - Hỗ trợ tìm kiếm Google thật và nhập URL trực tiếp.
7. **Windows Media Player (`wmplayer.exe`)**:
   - Phát video ngoại tuyến `assets/videos/intro.mp4`.
   - Hiển thị theo chuẩn `object-fit: contain !important;`, không cắt xén, không sinh thanh cuộn, thanh controller (Play, Pause, Progress, Volume) luôn ghim cố định dưới đáy.
   - Hỗ trợ mở bất kỳ video nào từ máy tính cá nhân qua nút `Open File...`.
8. **Khay hệ thống (System Tray) đa chức năng**:
   - 🔊 **Âm lượng**: Điều chỉnh âm lượng toàn hệ thống và checkbox Mute.
   - 📶 **Mạng**: Trạng thái kết nối `OU_CAMPUS_5G`, IP `192.168.15.6`.
   - 🕒 **Đồng hồ kim & Lịch tháng**: Đồng hồ kim Analog chạy thời gian thực kết hợp bảng lịch tự động tính theo ngày hiện tại.
   - 🌐 **Nút đổi ngôn ngữ `VI` / `EN`**: Chuyển đổi ngôn ngữ song ngữ tức thì.
9. **Game & Ứng dụng phụ**:
   - 🧮 **Calculator (`calc.exe`)**: Máy tính Windows XP Luna tính toán thực tế.
   - 💣 **Minesweeper (`winmine.exe`)**: Game dò mìn cổ điển với bộ đếm số 7-segment và nút mặt cười tương tác.

---

## 📁 Cấu Trúc Thư Mục Dự Án

```
mpc2026.exe/
│
├── index.html                       # File HTML chính khởi chạy toàn bộ Desktop OS
├── README.md                        # Tài liệu hướng dẫn dự án & Hướng dẫn Contributor
│
├── apps/                            # CHỨA TOÀN BỘ CÁC APP CON ĐỘC LẬP
│   ├── about_mpc/                   # Giới thiệu MPClub
│   │   └── index.html
│   ├── our_teams/                   # Các Ban Chuyên Môn (BLT, BTK, BTT, BSK)
│   │   ├── index.html
│   │   └── teams.json               # Dữ liệu nội dung các ban
│   ├── activities/                  # Thư viện ảnh hoạt động & workshop
│   │   └── index.html
│   ├── events/                      # Các sự kiện & giải đấu lớn
│   │   └── index.html
│   ├── diary/                       # Nhật ký & Hậu trường thành viên
│   │   ├── index.html
│   │   └── stories.json             # Dữ liệu các mẩu chuyện hậu trường
│   ├── faq/                         # Câu hỏi thường gặp tuyển quân 2026
│   │   ├── index.html
│   │   └── data.json                # Dữ liệu câu hỏi & câu trả lời
│   ├── join_mpc/                    # Form ứng tuyển chính thức
│   │   └── index.html
│   ├── calculator/                  # Máy tính Windows XP
│   │   └── index.html
│   ├── minesweeper/                 # Game dò mìn kinh điển
│   │   └── index.html
│   └── mpclub_dev/                  # Trang web retro nội bộ
│       └── index.html
│
├── assets/                          # TÀI NGUYÊN TĨNH (STATIC ASSETS)
│   ├── backgrounds/
│   │   └── bg.jpg                   # Hình nền Desktop chính thức
│   ├── fonts/
│   │   └── bootstrap-icons/         # Font & CSS Bootstrap Icons tải sẵn offline
│   ├── icons/                       # Toàn bộ icon hệ thống (SVG + PNG)
│   ├── images/
│   │   └── the-open-clubs/          # Kho ảnh hoạt động thực tế của CLB
│   ├── sounds/                      # Âm thanh hệ thống (wav, mp3)
│   └── videos/
│       └── intro.mp4                # Video giới thiệu MPClub
│
├── css/                             # STYLESHEET HỆ THỐNG DESKTOP
│   ├── main.css                     # Reset, biến Luna XP, font chữ
│   ├── boot.css                     # BIOS động & Bootscreen
│   ├── login.css                    # Welcome / Login screen (OU IT)
│   ├── desktop.css                  # Màn hình Desktop, chuột phải, chọn vùng
│   ├── window.css                   # Quản lý cửa sổ (drag, resize, titlebar)
│   ├── taskbar.css                  # Taskbar, Start Menu, System Tray, Shutdown Modal
│   ├── applications.css             # Style Explorer, Terminal, IE, WMP
│   └── responsive.css              # Tối ưu giao diện cho Mobile & Tablet
│
└── js/                              # JAVASCRIPT HỆ THỐNG LÕI (CORE OS)
    ├── i18n.js                      # Bộ quản lý đa ngôn ngữ (Tiếng Việt / English)
    ├── vfs.js                       # Cây thư mục ảo (Virtual File System)
    ├── app-registry.js              # Hệ sinh thái đăng ký App (App Registry)
    ├── window-manager.js            # Quản lý đa cửa sổ, phân tầng z-index
    ├── applications.js              # Khai báo danh sách các app trong hệ thống
    ├── desktop.js                   # Xử lý icon màn hình, quét chuột, menu chuột phải
    ├── taskbar.js                   # Xử lý Start Menu, Tray Widget, Đồng hồ
    ├── boot.js                      # Điều khiển chu trình boot và âm thanh
    ├── main.js                      # Điểm khởi chạy chính
    └── apps/                        # Các app hệ thống đặc biệt
        ├── explorer-browser.js      # Trình duyệt web
        ├── media-player.js          # Trình phát video WMP
        ├── my-computer.js           # Quản lý ổ đĩa & tập tin
        ├── terminal.js              # Cửa sổ dòng lệnh CMD
        └── language-settings.js     # Hộp thoại đổi ngôn ngữ
```

---

## 👥 HƯỚNG DẪN DÀNH CHO CONTRIBUTOR (LÀM APP MỚI)

Dự án được xây dựng theo mô hình **Folder-per-App (Mỗi app là một thư mục riêng biệt)**.  
Bạn có thể tự do sáng tạo, viết code HTML, CSS, JS, hoặc lưu trữ dữ liệu JSON trong thư mục riêng của mình mà **hoàn toàn không sợ ảnh hưởng hay xung đột với các app khác và Core OS**.

### 1. Quy Chuẩn Tổ Chức File Trong App (Conventions)

Khi bạn tạo một app mới trong `apps/<tên_app>/`:

| File | Mục đích | Hướng dẫn sử dụng |
| :--- | :--- | :--- |
| **`index.html`** *(Bắt buộc)* | **Giao diện chính** | Điểm bắt đầu của app khi được nhúng vào cửa sổ hệ điều hành. |
| **`data.json`** *(Khuyên dùng)* | **Dữ liệu nội dung** | Tách nội dung văn bản (danh sách bài viết, câu hỏi, điểm số, thông tin) ra file JSON. File JS sẽ dùng `fetch('./data.json')` để render. Sau này ai muốn sửa bài viết chỉ cần sửa file JSON mà không sợ hỏng code giao diện. |
| **`style.css`** *(Tùy chọn)* | **Phong cách giao diện** | Tách CSS riêng nếu app có giao diện dài, hoặc viết trực tiếp trong thẻ `<style>` của `index.html`. |
| **`script.js`** *(Tùy chọn)* | **Logic tương tác** | Tách Javascript riêng nếu app có nhiều tính toán, game loop hoặc viết trực tiếp trong thẻ `<script>` của `index.html`. |
| **`README.md`** *(Tùy chọn)* | **Mô tả app** | Ghi chú luật chơi, hướng dẫn sử dụng app cho đồng đội xem. |

---

### 2. Quy Trình 2 Bước Để Tạo Và Đăng Ký App Mới

#### 📌 Bước 1: Tạo thư mục của bạn trong `apps/`
Ví dụ bạn muốn làm game Caro, Flappy Bird, hoặc App xem Portfolio cá nhân:
Tạo thư mục: `apps/my_game/` với file chính `apps/my_game/index.html`:

```html
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Game</title>
  <!-- Nhúng font icon nếu cần (lưu ý đường dẫn lùi 2 cấp: ../../assets) -->
  <link rel="stylesheet" href="../../assets/fonts/bootstrap-icons/bootstrap-icons.min.css">
  <style>
    body {
      margin: 0;
      padding: 16px;
      font-family: Tahoma, Arial, sans-serif;
      background: #f4f6fa;
      color: #333;
    }
    .card {
      background: #fff;
      border: 1px solid #d0d7de;
      border-radius: 6px;
      padding: 16px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.05);
    }
    .btn-primary {
      background: #0055ea;
      color: #fff;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="card">
    <h2>🎮 Chào mừng bạn đến với App mới!</h2>
    <p>App này được tải hoàn toàn độc lập bên trong hệ điều hành MPC.exe.</p>
    <button class="btn-primary" id="btn-action">Nhấn thử</button>
  </div>

  <script>
    document.getElementById('btn-action').addEventListener('click', () => {
      alert('Xin chào từ app con!');

      // Giao tiếp với Core OS: Mở một app khác (Ví dụ: mở form ứng tuyển)
      if (window.parent && window.parent.WindowManager) {
        window.parent.WindowManager.open('JOIN_MPC.exe');
      }
    });
  </script>
</body>
</html>
```

#### 📌 Bước 2: Đăng ký app vào hệ thống tại `js/applications.js`
Mở file `js/applications.js` và thêm đoạn khai báo:

```javascript
AppRegistry.register({
  id: 'my_game.exe',                           // ID duy nhất của ứng dụng
  title: 'My Game - Trò Chơi Mini',            // Tiêu đề hiển thị trên thanh Titlebar của cửa sổ
  desktopLabel: 'My Game',                     // Tên hiển thị dưới Icon ngoài Desktop
  iconSvg: '<i class="bi bi-controller"></i>',  // Icon: dùng Bootstrap Icons hoặc iconUrl: 'assets/icons/...'
  width: 680,                                  // Chiều rộng khởi tạo cửa sổ (px)
  height: 480,                                 // Chiều cao khởi tạo cửa sổ (px)
  showOnDesktop: true,                         // Hiện icon ngoài màn hình Desktop
  showInStartMenu: true,                       // Hiện ứng dụng trong Start Menu
  url: 'apps/my_game/index.html'               // 👈 Đường dẫn tới file HTML của bạn
});
```

👉 **Sau khi xong 2 bước này:**
- Icon của bạn sẽ tự động xuất hiện ngoài Desktop và trong Start Menu.
- Cửa sổ Windows XP sẽ tự động mở app của bạn với đầy đủ thanh tiêu đề, menu, nút thu nhỏ/phóng to/đóng, kéo thả và thanh Taskbar phía dưới!

---

### 3. Giao Tiếp Giữa App Con (Iframe) Và Core OS

Từ bên trong file `index.html` của app con, bạn có thể tương tác với hệ điều hành cha thông qua đối tượng `window.parent`:

```javascript
// 1. Mở một ứng dụng khác của hệ điều hành
window.parent.WindowManager.open('JOIN_MPC.exe');

// 2. Mở trình phát Media Player để phát một video cụ thể
window.parent.MediaPlayer.play('assets/videos/intro.mp4', 'Tên video');

// 3. Lấy ngôn ngữ hiện tại của hệ thống ('vi' hoặc 'en')
const currentLang = window.parent.I18n ? window.parent.I18n.getLanguage() : 'vi';

// 4. Phát âm thanh hệ thống (ví dụ: tiếng beep hoặc tiếng lỗi)
window.parent.BootManager.SoundFX.beep(880, 0.2);
```

---

### 4. Đóng Góp Thêm File Vào Cây Thư Mục Ảo (VFS)

Nếu bạn muốn thêm tập tin để hiển thị trong **My Computer**, **Ổ đĩa C:** hay có thể đọc được bằng lệnh `dir`, `type` trong **Command Prompt (`cmd.exe`)**:

Mở file `js/vfs.js`, tìm đến thư mục bạn muốn thêm vào cây `_fs`:
```javascript
'My Documents': {
  type: 'dir',
  children: {
    'thong_tin_moi.txt': {
      type: 'file',
      size: 512,
      content: 'Nội dung file này sẽ hiển thị khi mở trong Notepad hoặc gõ lệnh TYPE trong Command Prompt!'
    }
  }
}
```

---

### 5. Cập Nhật Link Ứng Tuyển Google Forms (`JOIN_MPC.exe`)

Mở file `apps/join_mpc/index.html`, tìm đến phần xử lý nút bấm `btn-submit` để thay thế URL form thực tế:
```javascript
const formUrl = `https://forms.gle/link-form-chinh-thuc-cua-mpclub`;
window.open(formUrl, '_blank');
```

---

## 🛠 Tiêu Chuẩn Commit & Đóng Góp (Git Guidelines)

Khi tạo Pull Request (PR) đóng góp app hoặc tính năng mới:
- Đặt tên branch rõ ràng: `feature/app-<ten_app>` hoặc `fix/<ten_loi>`.
- Đảm bảo **không commit** thư mục `node_modules` hay file rác.
- Mọi tài nguyên ảnh hoặc font nên dùng đường dẫn tương đối `../../assets/...` để đảm bảo chạy mượt mà trên môi trường tĩnh.
- Kiểm tra tính tương thích trên cả máy tính lẫn màn hình điện thoại trước khi gửi PR.

---

**Ban Lập Trình (BLT) – MPClub 2026**  
*Chúc các bạn có những trải nghiệm lập trình thú vị và sáng tạo cùng MPC.exe!*
