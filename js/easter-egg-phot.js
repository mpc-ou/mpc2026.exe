/**
 * ============================================================================
 * Easter Egg: PHỐT_MPC.txt & Mascot NPC (Fox) Defense
 * ============================================================================
 * - Pure JS hover detection via document mousemove (no CSS/mouseenter loop).
 * - Attempts 1, 2, 3, 4:
 *   1. When mouse enters the bounding box of PHỐT_MPC.txt:
 *      Fox leaps over the icon instantly to cover it.
 *   2. Fox speaks a random warning prohibiting viewing.
 *   3. PHỐT_MPC.txt immediately moves to a random empty slot on Desktop.
 *   4. Fox stays in position covering the mouse until user moves cursor away from Fox.
 *   5. When cursor leaves Fox: Fox closes speech bubble and smoothly glides back home!
 * - Attempt 5 (Automated Trash Disposal):
 *   1. When mouse hovers into PHỐT_MPC.txt for the 5th time:
 *   2. Fox covers it and says: "Hết chịu nổi rồi! Thôi đem vứt thùng rác luôn cho an toàn!"
 *   3. Fox carries the file icon to the Recycle Bin.
 *   4. File drops inside with scale down & spin; Recycle Bin icon turns into full trash.
 *   5. Fox says: "Để mở thùng rác ra dọn dẹp sạch sẽ nào..."
 *   6. Fox simulates opening the Recycle Bin window (WindowManager.open('RECYCLE_BIN')).
 *   7. Fox glides over the "Dọn sạch thùng rác" button and clicks it (paper crumple sound, bin empties).
 *   8. Fox says: "Xong! Đã tiêu hủy sạch sẽ rồi nhé!", closes the window, and walks back home!
 *   9. File is permanently deleted.
 */

const PhotEasterEgg = (function () {
  const DELETED_KEY = 'mpc_phot_deleted_v1';
  let _state = 'IDLE'; // 'IDLE' | 'COVERING' | 'ANIMATING_TRASH'
  let _attemptCount = 0;
  let _isAnimatingMove = false;

  const RANDOM_LINES = [
    'Đây là bí mật, bạn k nên đụng vào!',
    'Không được nhìn! Bí mật nội bộ CLB đấy!',
    'Đã bảo là bí mật rồi mà, đừng tò mò nữa!',
    'Này này, tính xem trộm phốt của CLB hả? Không có đâu!',
    'Cấm đụng vào! Tò mò là không tốt đâu nha!',
    'Úi chà, suýt nữa thì bị bạn mở rồi! Đi chỗ khác ngay!',
    'Dừng lại ngay! Tài liệu tuyệt mật cấp độ tối cao!',
    'Bạn không có quyền truy cập vào file này đâu nhé!'
  ];

  function isDeleted() {
    return localStorage.getItem(DELETED_KEY) === '1';
  }

  function init() {
    if (isDeleted()) return;

    // Track mouse movement globally to avoid CSS / mouseenter layering loops
    document.addEventListener('mousemove', onGlobalMouseMove, { passive: true });
  }

  function onGlobalMouseMove(e) {
    if (isDeleted() || _state === 'ANIMATING_TRASH') return;

    const mouseX = e.clientX;
    const mouseY = e.clientY;

    if (_state === 'IDLE') {
      const photIcon = document.querySelector('.desktop-icon[data-vfs-name="PHỐT_MPC.txt"]');
      if (!photIcon) return;
      const rect = photIcon.getBoundingClientRect();

      // Check if mouse entered the bounding box of PHỐT_MPC.txt
      if (mouseX >= rect.left && mouseX <= rect.right && mouseY >= rect.top && mouseY <= rect.bottom) {
        triggerCoverSequence();
      }
    } else if (_state === 'COVERING') {
      if (_isAnimatingMove) return;

      const npcRoot = document.getElementById('npc');
      if (!npcRoot) return;
      const foxRect = npcRoot.getBoundingClientRect();

      // Check if mouse is still hovering over the fox (with 25px leeway)
      const isOverFox = (
        mouseX >= foxRect.left - 25 && mouseX <= foxRect.right + 25 &&
        mouseY >= foxRect.top - 25 && mouseY <= foxRect.bottom + 25
      );

      // When mouse leaves the fox, release and return home!
      if (!isOverFox) {
        triggerReleaseSequence();
      }
    }
  }

  function triggerCoverSequence() {
    _state = 'COVERING';
    _isAnimatingMove = true;
    _attemptCount++;

    if (_attemptCount >= 5) {
      handleFinalTrashAutomation();
      return;
    }

    // Attempt 1, 2, 3, 4:
    const photIcon = document.querySelector('.desktop-icon[data-vfs-name="PHỐT_MPC.txt"]');
    if (!photIcon || !window.NPC) {
      _state = 'IDLE';
      _isAnimatingMove = false;
      return;
    }

    const rect = photIcon.getBoundingClientRect();
    const targetX = Math.max(10, Math.min(window.innerWidth - 180, rect.left + rect.width / 2 - 85));
    const targetY = Math.max(10, Math.min(window.innerHeight - 200, rect.top + rect.height / 2 - 95));

    // 1. Fox glides smoothly (420ms) to cover the file
    NPC.moveTo(targetX, targetY, 420);

    // 2. Fox speaks a random warning dialogue
    const line = RANDOM_LINES[Math.floor(Math.random() * RANDOM_LINES.length)];
    NPC.sayCustom(line, { autoClose: false });

    // 3. Shuffle file to another random empty position on desktop as Fox arrives!
    setTimeout(() => {
      if (window.Desktop && typeof Desktop.moveItemToRandomEmptySlot === 'function') {
        Desktop.moveItemToRandomEmptySlot('vfs_PHỐT_MPC.txt');
      }
      setTimeout(() => {
        _isAnimatingMove = false;
      }, 180);
    }, 360);
  }

  function triggerReleaseSequence() {
    _state = 'IDLE';
    if (window.NPC) {
      if (typeof NPC.closeBubble === 'function') {
        NPC.closeBubble();
      }
      NPC.returnHome(480);
    }
  }

  function handleFinalTrashAutomation() {
    _state = 'ANIMATING_TRASH';
    const photIcon = document.querySelector('.desktop-icon[data-vfs-name="PHỐT_MPC.txt"]');
    const trashIcon = document.querySelector('.desktop-icon[data-app-id="RECYCLE_BIN"]');
    if (!photIcon || !trashIcon || !window.NPC) return;

    const rect = photIcon.getBoundingClientRect();
    const targetX = Math.max(10, Math.min(window.innerWidth - 180, rect.left + rect.width / 2 - 85));
    const targetY = Math.max(10, Math.min(window.innerHeight - 200, rect.top + rect.height / 2 - 95));

    // 1. Fox glides smoothly over file
    NPC.moveTo(targetX, targetY, 420);
    NPC.sayCustom('Hết chịu nổi rồi! Thôi đem vứt thùng rác luôn cho an toàn!', { autoClose: false });
    if (window.CursorManager) {
      CursorManager.shrinkElement(photIcon, 250);
    }

    // 2. Fox grabs icon and glides together to Recycle Bin
    setTimeout(() => {
      const trashRect = trashIcon.getBoundingClientRect();
      photIcon.style.transition = 'left 0.85s cubic-bezier(0.2, 0.9, 0.3, 1), top 0.85s cubic-bezier(0.2, 0.9, 0.3, 1)';
      photIcon.style.zIndex = '9998';
      photIcon.style.left = `${trashRect.left + 5}px`;
      photIcon.style.top = `${trashRect.top + 5}px`;

      NPC.moveTo(trashRect.left - 45, trashRect.top - 65, 850);

      setTimeout(() => {
        // Icon drops into the bin (spin & vanish)
        photIcon.style.transition = 'transform 0.35s ease-in, opacity 0.35s ease-in';
        photIcon.style.transform = 'scale(0.05) rotate(360deg)';
        photIcon.style.opacity = '0';

        if (window.CursorManager) {
          CursorManager.shrinkElement(trashIcon, 300);
        }

        // Delete from VFS -> turns Recycle Bin to FULL (trash-full.svg)
        if (window.VFS) {
          VFS.deleteNode(VFS.getDesktopPath() + '\\PHỐT_MPC.txt');
        }
        localStorage.setItem(DELETED_KEY, '1');

        setTimeout(() => {
          photIcon.remove();

          // 3. Fox automates opening the Recycle Bin window
          NPC.sayCustom('Để mở thùng rác ra dọn dẹp sạch sẽ nào...', { autoClose: false });

          if (window.CursorManager) {
            CursorManager.shrinkElement(trashIcon, 200);
          }

          setTimeout(() => {
            if (window.WindowManager) {
              WindowManager.open('RECYCLE_BIN');
            }

            // 4. Fox glides over the "Dọn sạch thùng rác" button
            setTimeout(() => {
              const emptyBtn = document.getElementById('btn-empty-recycle-bin');
              if (emptyBtn) {
                const btnRect = emptyBtn.getBoundingClientRect();
                NPC.moveTo(btnRect.left - 30, btnRect.top - 85, 500);

                setTimeout(() => {
                  NPC.sayCustom('Bấm dọn sạch thùng rác...', { autoClose: false });

                  // Simulated Windows XP mouse cursor glides from fox to button and shrinks button 1 -> 0.95!
                  const startX = btnRect.left - 15;
                  const startY = btnRect.top - 30;
                  const targetBtnX = btnRect.left + btnRect.width / 2;
                  const targetBtnY = btnRect.top + btnRect.height / 2;

                  setTimeout(() => {
                    if (window.CursorManager && typeof CursorManager.simulateCursorMove === 'function') {
                      CursorManager.simulateCursorMove(startX, startY, targetBtnX, targetBtnY, 450, () => {
                        emptyBtn.click();
                      }, emptyBtn);
                    } else if (emptyBtn) {
                      emptyBtn.click();
                    } else if (window.VFS && VFS.emptyTrash) {
                      VFS.emptyTrash();
                    }

                    // 5. Trash is empty! Fox finishes up, closes window, and walks back home
                    setTimeout(() => {
                      NPC.sayCustom('Xong! Đã tiêu hủy sạch sẽ rồi nhé!', { autoClose: false });

                      setTimeout(() => {
                        if (window.WindowManager) {
                          WindowManager.close('RECYCLE_BIN');
                        }

                        setTimeout(() => {
                          if (typeof NPC.closeBubble === 'function') NPC.closeBubble();
                          NPC.returnHome(500);
                          _state = 'IDLE';
                        }, 800);
                      }, 1200);
                    }, 800);
                  }, 650);
                }, 600);
              }
            }, 600);
          }, 800);
        }, 400);
      }, 900);
    }, 1500);
  }

  // Auto-init
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return {
    init
  };
})();

window.PhotEasterEgg = PhotEasterEgg;
