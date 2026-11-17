/**
 * ============================================================================
 * XPDialog - Authentic Windows XP Modal MessageBox System
 * ============================================================================
 * Replaces native browser alert(), confirm(), prompt() with pixel-perfect
 * Windows XP Luna dialogs matching reference photo:
 * - Luna Blue gradient titlebar with XP icon & close button
 * - Inset beveled message frame with warning, error, info, question icons
 * - Draggable by titlebar
 * - Sound effect on display
 * - Returns Promises for clean async/await syntax
 */

const XPDialog = (function () {
  const ICONS = {
    warning: `<svg width="34" height="34" viewBox="0 0 34 34" fill="none" style="flex-shrink:0;">
      <polygon points="17,3 32,30 2,30" fill="#ffd400" stroke="#b8860b" stroke-width="2" stroke-linejoin="round"/>
      <polygon points="17,6 29,28 5,28" fill="#ffe54c"/>
      <rect x="15.5" y="12" width="3" height="8" rx="1.5" fill="#000000"/>
      <circle cx="17" cy="24" r="1.8" fill="#000000"/>
    </svg>`,
    error: `<svg width="34" height="34" viewBox="0 0 34 34" fill="none" style="flex-shrink:0;">
      <circle cx="17" cy="17" r="15" fill="#d13438" stroke="#8a1c20" stroke-width="2"/>
      <circle cx="17" cy="17" r="12" fill="#e81123"/>
      <line x1="11" y1="11" x2="23" y2="23" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round"/>
      <line x1="23" y1="11" x2="11" y2="23" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round"/>
    </svg>`,
    info: `<svg width="34" height="34" viewBox="0 0 34 34" fill="none" style="flex-shrink:0;">
      <circle cx="17" cy="17" r="15" fill="#0055ea" stroke="#003399" stroke-width="2"/>
      <circle cx="17" cy="17" r="12" fill="#2572fe"/>
      <circle cx="17" cy="11" r="2" fill="#ffffff"/>
      <rect x="15" y="15" width="4" height="9" rx="1.5" fill="#ffffff"/>
    </svg>`,
    question: `<svg width="34" height="34" viewBox="0 0 34 34" fill="none" style="flex-shrink:0;">
      <circle cx="17" cy="17" r="15" fill="#0055ea" stroke="#003399" stroke-width="2"/>
      <circle cx="17" cy="17" r="12" fill="#2572fe"/>
      <path d="M13,12 C13,9 21,9 21,12 C21,15 17,15.5 17,18.5" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" fill="none"/>
      <circle cx="17" cy="23" r="1.6" fill="#ffffff"/>
    </svg>`
  };

  function playAlertSound() {
    try {
      const audio = new Audio('assets/sounds/error.mp3');
      const eff = window.MasterVolume ? window.MasterVolume.getEffectiveVolume() : 0.8;
      audio.volume = Math.min(1, eff * 0.6);
      audio.play().catch(() => {});
    } catch (e) {}
  }

  function showDialog({
    type = 'alert', // 'alert' | 'confirm' | 'prompt'
    title = 'Windows',
    message = '',
    icon = 'warning',
    defaultValue = '',
    okText = 'OK',
    cancelText = 'Cancel',
    showCheckbox = false,
    checkboxText = "Don't show this message again"
  }) {
    return new Promise((resolve) => {
      playAlertSound();

      // Overlay
      const overlay = document.createElement('div');
      overlay.className = 'xp-dialog-backdrop';

      // Dialog container
      const dialog = document.createElement('div');
      dialog.className = 'xp-dialog-box';

      // Titlebar icon (4-color XP flag)
      const flagIcon = `
        <div style="display:grid; grid-template-columns: 6px 6px; gap: 1px; margin-right: 6px; flex-shrink: 0;">
          <div style="width:6px;height:6px;background:#f25022;border-radius:1px;"></div>
          <div style="width:6px;height:6px;background:#7fba00;border-radius:1px;"></div>
          <div style="width:6px;height:6px;background:#00a4ef;border-radius:1px;"></div>
          <div style="width:6px;height:6px;background:#ffb900;border-radius:1px;"></div>
        </div>
      `;

      const iconSvg = ICONS[icon] || ICONS.warning;

      dialog.innerHTML = `
        <div class="xp-dialog-titlebar">
          <div class="xp-dialog-title-left">
            ${flagIcon}
            <span class="xp-dialog-title-text">${title}</span>
          </div>
          <button class="xp-dialog-close-btn" title="Close">&times;</button>
        </div>

        <div class="xp-dialog-panel">
          <div class="xp-dialog-icon-col">
            ${iconSvg}
          </div>
          <div class="xp-dialog-content-col">
            <div class="xp-dialog-message">${String(message).replace(/\n/g, '<br>')}</div>
            ${type === 'prompt' ? `<input type="text" class="xp-dialog-input" value="${defaultValue}" spellcheck="false" />` : ''}
            ${showCheckbox ? `
              <label class="xp-dialog-checkbox-label">
                <input type="checkbox" id="xp-dialog-chk" />
                <span>${checkboxText}</span>
              </label>
            ` : ''}
          </div>
        </div>

        <div class="xp-dialog-button-row">
          <button class="xp-dialog-button primary" id="xp-dialog-btn-ok">${okText}</button>
          ${type !== 'alert' ? `<button class="xp-dialog-button" id="xp-dialog-btn-cancel">${cancelText}</button>` : ''}
        </div>
      `;

      overlay.appendChild(dialog);
      document.body.appendChild(overlay);

      const btnOk = dialog.querySelector('#xp-dialog-btn-ok');
      const btnCancel = dialog.querySelector('#xp-dialog-btn-cancel');
      const btnClose = dialog.querySelector('.xp-dialog-close-btn');
      const inputEl = dialog.querySelector('.xp-dialog-input');
      const titlebar = dialog.querySelector('.xp-dialog-titlebar');

      if (inputEl) {
        inputEl.focus();
        inputEl.select();
      } else {
        btnOk.focus();
      }

      function cleanup(result) {
        overlay.remove();
        resolve(result);
      }

      btnOk.addEventListener('click', () => {
        if (type === 'prompt') {
          cleanup(inputEl ? inputEl.value : '');
        } else if (type === 'confirm') {
          cleanup(true);
        } else {
          cleanup(true);
        }
      });

      btnCancel?.addEventListener('click', () => {
        if (type === 'prompt') cleanup(null);
        else cleanup(false);
      });

      btnClose.addEventListener('click', () => {
        if (type === 'prompt') cleanup(null);
        else if (type === 'confirm') cleanup(false);
        else cleanup(true);
      });

      // Keyboard support
      function onKeyDown(e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          btnOk.click();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          if (btnCancel) btnCancel.click();
          else btnClose.click();
        }
      }
      dialog.addEventListener('keydown', onKeyDown);

      // Dragging dialog
      let isDragging = false;
      let startX, startY, origX, origY;
      titlebar.addEventListener('mousedown', (e) => {
        if (e.target.closest('.xp-dialog-close-btn')) return;
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        const rect = dialog.getBoundingClientRect();
        origX = rect.left;
        origY = rect.top;

        function onMouseMove(moveEv) {
          if (!isDragging) return;
          const dx = moveEv.clientX - startX;
          const dy = moveEv.clientY - startY;
          dialog.style.position = 'fixed';
          dialog.style.left = `${origX + dx}px`;
          dialog.style.top = `${origY + dy}px`;
          dialog.style.margin = '0';
        }

        function onMouseUp() {
          isDragging = false;
          window.removeEventListener('mousemove', onMouseMove);
          window.removeEventListener('mouseup', onMouseUp);
        }

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
      });
    });
  }

  // Override window.alert globally
  window.alert = function (message) {
    return XPDialog.alert(message);
  };

  return {
    alert(message, title = 'Windows', options = {}) {
      return showDialog({
        type: 'alert',
        title,
        message,
        icon: options.icon || 'warning',
        okText: options.okText || 'OK',
        ...options
      });
    },

    confirm(message, title = 'Windows', options = {}) {
      return showDialog({
        type: 'confirm',
        title,
        message,
        icon: options.icon || 'warning',
        okText: options.okText || (window.I18n && I18n.getLanguage() === 'vi' ? 'Đồng ý' : 'OK'),
        cancelText: options.cancelText || (window.I18n && I18n.getLanguage() === 'vi' ? 'Hủy bỏ' : 'Cancel'),
        ...options
      });
    },

    prompt(message, defaultValue = '', title = 'Windows', options = {}) {
      return showDialog({
        type: 'prompt',
        title,
        message,
        defaultValue,
        icon: options.icon || 'question',
        okText: options.okText || 'OK',
        cancelText: options.cancelText || (window.I18n && I18n.getLanguage() === 'vi' ? 'Hủy bỏ' : 'Cancel'),
        ...options
      });
    }
  };
})();

window.XPDialog = XPDialog;
