/**
 * ============================================================================
 * AppRegistry - Modular Application Registration System for MPC.exe
 * ============================================================================
 * Allows team members to independently develop and register their own apps
 * without modifying WindowManager or Desktop core code!
 * 
 * Example usage for team members:
 * 
 * AppRegistry.register({
 *   id: 'ABOUT_MPC',
 *   title: 'ABOUT_MPC - Giới thiệu CLB',
 *   iconSvg: '<svg>...</svg>', // or iconUrl: 'assets/icons/about.png'
 *   desktopLabel: 'ABOUT_MPC',
 *   width: 620,
 *   height: 420,
 *   showOnDesktop: true,
 *   showInStartMenu: true,
 *   render: (container, win) => {
 *     container.innerHTML = `<h1>Hello from my app</h1>`;
 *   }
 * });
 */

const AppRegistry = (function () {
  const _apps = new Map();
  const _listeners = [];

  return {
    /**
     * Register a new application
     * @param {Object} config - App configuration
     */
    register(config) {
      if (!config.id) {
        console.error('App registration failed: "id" is required.', config);
        return;
      }

      const appData = {
        id: config.id,
        title: config.title || config.id,
        desktopLabel: config.desktopLabel || config.title || config.id,
        iconSvg: config.iconSvg || null,
        iconUrl: config.iconUrl || null,
        width: config.width || 600,
        height: config.height || 400,
        minWidth: config.minWidth || 280,
        minHeight: config.minHeight || 180,
        showOnDesktop: config.showOnDesktop !== false,
        showInStartMenu: config.showInStartMenu !== false,
        isShortcut: config.isShortcut || false,
        featured: config.featured || false,
        onOpen: config.onOpen || null,
        onClose: config.onClose || null,
        render: config.render || function (container) {
          container.innerHTML = `
            <div style="padding: 20px; font-family: Tahoma, sans-serif;">
              <h3>${config.title || config.id}</h3>
              <p style="margin-top: 10px; color: #666;">
                Nội dung ứng dụng đang được phát triển bởi thành viên BLT.
              </p>
            </div>
          `;
        }
      };

      _apps.set(config.id, appData);
      console.log(`[AppRegistry] Registered app: ${config.id}`);

      // Notify any listeners (desktop, start menu)
      _listeners.forEach(fn => fn(appData));
    },

    /**
     * Get app by ID
     * @param {string} id 
     * @returns {Object|null}
     */
    get(id) {
      return _apps.get(id) || null;
    },

    /**
     * Get all registered apps as an array
     * @returns {Array<Object>}
     */
    getAll() {
      return Array.from(_apps.values());
    },

    /**
     * Listen for new app registrations
     * @param {Function} callback 
     */
    onRegister(callback) {
      if (typeof callback === 'function') {
        _listeners.push(callback);
      }
    }
  };
})();

// Export globally
window.AppRegistry = AppRegistry;
