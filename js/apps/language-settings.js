/**
 * ============================================================================
 * Language Settings App (Regional and Language Options - intl.cpl)
 * ============================================================================
 * Allows switching the system interface between Vietnamese and English!
 */

(function () {
  AppRegistry.register({
    id: 'language-settings',
    title: 'Regional and Language Options',
    desktopLabel: 'Cài đặt Ngôn ngữ',
    iconUrl: 'assets/icons/network.svg',
    width: 440,
    height: 380,
    showOnDesktop: false,
    showInStartMenu: true,
    render: (container, win) => {
      function renderUI() {
        const curLang = I18n.getLanguage();
        const isVi = curLang === 'vi';

        container.innerHTML = `
          <div style="padding: 16px; font-family: Tahoma, sans-serif; font-size: 11px; background-color: #ece9d8; height: 100%; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <!-- Tab Header -->
              <div style="border-bottom: 1px solid #7f9db9; padding-bottom: 4px; margin-bottom: 12px; font-weight: bold; color: #003399;">
                <i class="bi bi-translate" style="margin-right: 4px;"></i> ${isVi ? 'Tùy chọn Vùng và Ngôn ngữ' : 'Regional and Language Options'}
              </div>

              <!-- Language Selection Box -->
              <div style="border: 1px solid #d0ccb8; padding: 12px; background: #ffffff; border-radius: 3px; margin-bottom: 14px;">
                <label style="display: block; font-weight: bold; margin-bottom: 6px;">
                  ${isVi ? 'Ngôn ngữ giao diện hệ thống (System Interface Language):' : 'System Interface Language:'}
                </label>
                <select id="lang-selector-dropdown" style="width: 100%; height: 24px; font-family: Tahoma, sans-serif; font-size: 11px; padding: 2px 4px; border: 1px solid #7f9db9;">
                  <option value="vi" ${isVi ? 'selected' : ''}>🇻🇳 Tiếng Việt (Vietnamese) - Mặc định</option>
                  <option value="en" ${!isVi ? 'selected' : ''}>🇺🇸 English (United States)</option>
                </select>
                <div style="margin-top: 8px; font-size: 10px; color: #666; line-height: 1.4;">
                  ${isVi 
                    ? 'Thay đổi này sẽ cập nhật toàn bộ thanh tác vụ, menu, các ứng dụng và màn hình khởi động ngay lập tức.' 
                    : 'This setting changes all menus, dialogs, desktop icons, and taskbar language instantly.'}
                </div>
              </div>

              <!-- Format Samples Preview -->
              <div style="border: 1px solid #d0ccb8; padding: 10px; background: #fafafa; border-radius: 3px;">
                <div style="font-weight: bold; margin-bottom: 6px; color: #444;">
                  ${isVi ? 'Xem trước định dạng:' : 'Format Samples:'}
                </div>
                <div style="display: grid; grid-template-columns: 80px 1fr; gap: 4px; font-size: 11px;">
                  <div>${isVi ? 'Thời gian:' : 'Time:'}</div>
                  <b>${new Date().toLocaleTimeString(isVi ? 'vi-VN' : 'en-US')}</b>
                  <div>${isVi ? 'Ngày tháng:' : 'Date:'}</div>
                  <b>${new Date().toLocaleDateString(isVi ? 'vi-VN' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</b>
                  <div>${isVi ? 'Dung lượng:' : 'Storage:'}</div>
                  <b>15.6 GB / 19.90 GB</b>
                </div>
              </div>
            </div>

            <!-- Buttons Row -->
            <div style="display: flex; justify-content: flex-end; gap: 8px; border-top: 1px solid #d0ccb8; padding-top: 10px;">
              <button id="lang-btn-ok" style="min-width: 70px; height: 23px; background: #ece9d8; border: 1px solid #716f64; border-radius: 2px; cursor: pointer; font-weight: bold;">
                ${isVi ? 'Đồng ý' : 'OK'}
              </button>
              <button id="lang-btn-cancel" style="min-width: 70px; height: 23px; background: #ece9d8; border: 1px solid #716f64; border-radius: 2px; cursor: pointer;">
                ${isVi ? 'Hủy bỏ' : 'Cancel'}
              </button>
              <button id="lang-btn-apply" style="min-width: 70px; height: 23px; background: #ece9d8; border: 1px solid #716f64; border-radius: 2px; cursor: pointer;">
                ${isVi ? 'Áp dụng' : 'Apply'}
              </button>
            </div>
          </div>
        `;

        const dropdown = container.querySelector('#lang-selector-dropdown');
        const btnOk = container.querySelector('#lang-btn-ok');
        const btnCancel = container.querySelector('#lang-btn-cancel');
        const btnApply = container.querySelector('#lang-btn-apply');

        btnApply.addEventListener('click', () => {
          I18n.setLanguage(dropdown.value);
          renderUI();
        });

        btnOk.addEventListener('click', () => {
          I18n.setLanguage(dropdown.value);
          win.close();
        });

        btnCancel.addEventListener('click', () => {
          win.close();
        });
      }

      renderUI();
      I18n.onChange(() => renderUI());
    }
  });
})();
