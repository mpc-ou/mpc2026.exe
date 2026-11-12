/**
 * ============================================================================
 * MPC.exe - Main Entry Point
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  console.log('[MPC.exe] Initializing System...');

  // Initialize Bilingual i18n
  if (window.I18n) {
    window.I18n.applyDOMTranslations();
  }

  // Initialize Desktop
  if (window.Desktop) {
    window.Desktop.init();
  }

  // Initialize Taskbar & System Tray
  if (window.Taskbar) {
    window.Taskbar.init();
  }

  // Initialize Boot & Login Sequence
  if (window.BootManager) {
    window.BootManager.init();
  }

  console.log('[MPC.exe] System Ready.');
});
