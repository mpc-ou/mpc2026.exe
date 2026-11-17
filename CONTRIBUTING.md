# Quy Trình Đóng Góp (Contributing Guidelines)

Cảm ơn bạn đã quan tâm và muốn đóng góp cho dự án **MPC.exe**! Mọi sự đóng góp từ cộng đồng sinh viên và nhà phát triển đều được hoan nghênh nhằm giúp dự án hoàn thiện hơn.

---

## 🛠️ Nguyên Tắc Chung

1. **Zero External Dependencies**: Dự án chạy trên nền Web thuần (Vanilla HTML5, CSS3, Vanilla JS ES6+). Vui lòng **không** cài đặt thêm các thư viện hay framework cồng kềnh (React, Vue, npm packages, jQuery...) vào phần lõi nếu không có thảo luận và thống nhất trước.
2. **Phong cách thiết kế**: Giữ đúng nhận diện hoài niệm **Windows XP Luna** (màu xanh dương đặc trưng, viền bo tròn 3D, thanh tiêu đề gradient, font chữ `Tahoma` / `Segoe UI`).
3. **Tiêu chuẩn mã nguồn**:
   - Tách biệt rõ ràng giữa logic giao diện (`css/`), logic ứng dụng (`js/`), và tài nguyên (`assets/`).
   - Đảm bảo tính tương thích song ngữ (`vi` và `en`) qua module `I18n` và file `js/i18n.js`.
   - Kiểm tra cú pháp JavaScript không lỗi: `node -c <file.js>`.

---

## 🚀 Các Bước Đóng Góp (Pull Request Workflow)

1. **Fork Kho Lưu Trữ**:
   - Bấm nút **Fork** ở góc phải trên giao diện GitHub của repo.
2. **Clone Kho Lưu Trữ Của Bạn**:
   ```bash
   git clone https://github.com/<your-username>/mpc2026.exe.git
   cd mpc2026.exe
   ```
3. **Tạo Nhánh Mới (Feature Branch)**:
   ```bash
   git checkout -b feat/ten-tinh-nang-moi
   # hoặc: git checkout -b fix/ten-loi-can-sua
   ```
4. **Phát Triển & Kiểm Thử Cục Bộ**:
   - Sử dụng VS Code Live Server hoặc mở trực tiếp `index.html`.
   - Kiểm tra trên các kích thước màn hình (Desktop, Tablet, Mobile).
   - Kiểm tra cả 2 chế độ ngôn ngữ Tiếng Việt và English.
5. **Commit Mã Nguồn Theo Quy Chuẩn**:
   - Đặt commit message rõ ràng theo quy chuẩn [Conventional Commits](https://www.conventionalcommits.org/):
     - `feat:` Thêm tính năng mới (ví dụ: `feat: add sound effect for calculator buttons`)
     - `fix:` Sửa lỗi (ví dụ: `fix: prevent window overflow on resize`)
     - `docs:` Cập nhật tài liệu (ví dụ: `docs: update getting started guide`)
     - `style:` Tinh chỉnh giao diện CSS (ví dụ: `style: refine taskbar button hover gradient`)
6. **Tạo Pull Request**:
   - Đẩy nhánh lên fork của bạn:
     ```bash
     git push origin feat/ten-tinh-nang-moi
     ```
   - Mở Pull Request hướng về nhánh `main` của repository gốc.
   - Mô tả chi tiết vấn đề được giải quyết, ảnh chụp màn hình hoặc GIF minh họa kết quả.

---

## 🐛 Báo Cáo Sự Cố (Bug Reports)

Nếu bạn phát hiện lỗi hoặc hành vi bất thường, vui lòng mở một **Issue** mới với thông tin:
- Trình duyệt và hệ điều hành bạn đang sử dụng.
- Các bước tái hiện lỗi cụ thể.
- Ảnh chụp màn hình hoặc log console (nếu có).

---

## 📜 Giấy Phép
Bằng việc gửi đóng góp cho dự án này, bạn đồng ý rằng mã nguồn đóng góp của bạn sẽ được phát hành theo giấy phép [MIT License](LICENSE).
