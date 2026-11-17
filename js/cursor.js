/**
 * ============================================================================
 * CursorManager - Windows XP Cursors & Tactile Click Shrink Feedback (1 -> 0.95)
 * ============================================================================
 * - Replaces browser cursor with authentic Windows XP mouse cursors.
 * - Tactile click feedback: clicked icons/buttons scale down from 1 to 0.95.
 * - Simulated cursor animations with element shrinking (for automated NPC actions).
 */

const CursorManager = (function () {
  let _cursorEl = null;

  /**
   * Triggers the 1 -> 0.95 tactile shrink animation on a target element
   */
  function shrinkElement(element, duration = 160) {
    if (!element) return;
    element.classList.remove('clicking-pop');
    void element.offsetWidth; // re-trigger animation
    element.classList.add('clicking-pop');
    setTimeout(() => {
      element.classList.remove('clicking-pop');
    }, duration);
  }

  /**
   * Simulates an automated mouse movement and click (used by NPC Mascot)
   */
  function simulateCursorMove(startX, startY, targetX, targetY, duration = 400, onComplete, targetElement) {
    if (!_cursorEl) {
      _cursorEl = document.createElement('div');
      _cursorEl.id = 'npc-simulated-cursor';
      _cursorEl.className = 'npc-simulated-cursor';
      document.body.appendChild(_cursorEl);
    }

    _cursorEl.style.display = 'block';
    _cursorEl.style.transition = 'none';
    _cursorEl.style.left = `${startX}px`;
    _cursorEl.style.top = `${startY}px`;
    _cursorEl.style.opacity = '1';

    // Force layout reflow so the transition starts smoothly
    void _cursorEl.offsetWidth;

    // Glide smoothly to target
    _cursorEl.style.transition = `left ${duration}ms cubic-bezier(0.25, 0.9, 0.35, 1), top ${duration}ms cubic-bezier(0.25, 0.9, 0.35, 1), transform 0.12s ease`;
    _cursorEl.style.left = `${targetX}px`;
    _cursorEl.style.top = `${targetY}px`;

    setTimeout(() => {
      // Press down (cursor presses down, target element shrinks from 1 to 0.95)
      _cursorEl.classList.add('active-click');
      if (targetElement) {
        targetElement.classList.add('clicking');
      }

      setTimeout(() => {
        _cursorEl.classList.remove('active-click');
        if (targetElement) {
          targetElement.classList.remove('clicking');
        }

        if (typeof onComplete === 'function') {
          onComplete();
        }

        setTimeout(() => {
          _cursorEl.style.opacity = '0';
          setTimeout(() => {
            _cursorEl.style.display = 'none';
          }, 250);
        }, 300);
      }, 160);
    }, duration);
  }

  function handleClickFeedback(e) {
    const target = e.target.closest(
      '.desktop-icon, .desktop-icon-img, button, .taskbar-item, .taskbar-quick-launch-icon, .start-button, .window-ctrl-btn, .xp-dialog-button, .btn-xp, .npc-btn-primary, .npc-peek, .clickable'
    );
    if (target) {
      shrinkElement(target, 160);
    }
  }

  function attachToIframe(iframe) {
    try {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc || doc._cursorAttached) return;
      doc._cursorAttached = true;

      // Inject cursor stylesheet if not present
      if (!doc.querySelector('link[href*="cursor.css"]')) {
        const link = doc.createElement('link');
        link.rel = 'stylesheet';
        link.href = new URL('css/cursor.css', window.location.href).href;
        doc.head?.appendChild(link);
      }

      // Capture clicks inside iframe to trigger shrink feedback
      doc.addEventListener('pointerdown', handleClickFeedback, { capture: true, passive: true });
    } catch (err) {
      // Cross-origin iframe, safely ignored
    }
  }

  function init() {
    // Listen for global clicks to trigger 1 -> 0.95 shrink feedback
    document.addEventListener('pointerdown', handleClickFeedback, { capture: true, passive: true });

    // Monitor for newly added iframes in windows
    const observer = new MutationObserver(mutations => {
      for (const m of mutations) {
        for (const node of m.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.tagName === 'IFRAME') {
              node.addEventListener('load', () => attachToIframe(node));
              attachToIframe(node);
            } else {
              const iframes = node.querySelectorAll?.('iframe');
              if (iframes) {
                iframes.forEach(f => {
                  f.addEventListener('load', () => attachToIframe(f));
                  attachToIframe(f);
                });
              }
            }
          }
        }
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Attach to any existing iframes
    document.querySelectorAll('iframe').forEach(f => {
      f.addEventListener('load', () => attachToIframe(f));
      attachToIframe(f);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return {
    init,
    shrinkElement,
    simulateCursorMove,
    attachToIframe
  };
})();

window.CursorManager = CursorManager;
