/**
 * ============================================================================
 * Windows Picture and Fax Viewer (shimgvw.dll / ImageViewer)
 * ============================================================================
 * Authentic Windows XP built-in image viewer for .png, .jpg, .bmp, .gif files:
 * - Classic blue-gray canvas viewport (#eef2f8) with pan & mouse-wheel zoom
 * - Authentic centered bottom control toolbar:
 *   Previous / Next image in folder | Best Fit / Actual Size / Slideshow |
 *   Zoom In / Zoom Out | Rotate Left / Rotate Right | Delete / Save / Edit in Paint
 */

const ImageViewer = (function () {
  function isImageItem(item) {
    if (!item) return false;
    if (item.type === 'img') return true;
    const n = (item.name || '').toLowerCase();
    return n.endsWith('.png') || n.endsWith('.jpg') || n.endsWith('.jpeg') || n.endsWith('.bmp') || n.endsWith('.gif') || n.endsWith('.svg');
  }

  function createBlankCanvasDataUrl(label) {
    const c = document.createElement('canvas');
    c.width = 560;
    c.height = 380;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.strokeStyle = '#d0dceb';
    ctx.lineWidth = 2;
    ctx.strokeRect(12, 12, c.width - 24, c.height - 24);
    ctx.fillStyle = '#003399';
    ctx.font = 'bold 16px Tahoma, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label || 'New Drawing.png', c.width / 2, c.height / 2 - 10);
    ctx.fillStyle = '#666666';
    ctx.font = '12px Tahoma, sans-serif';
    ctx.fillText('Nhấn nút "Chỉnh sửa trong Paint" (biểu tượng bảng màu ở thanh dưới) để vẽ!', c.width / 2, c.height / 2 + 18);
    return c.toDataURL('image/png');
  }

  function resolveImageSrc(node, fileName) {
    if (!node) return createBlankCanvasDataUrl(fileName);
    if (node.url && node.url.trim()) return node.url;
    if (node.content && node.content.startsWith('data:image/')) return node.content;
    return createBlankCanvasDataUrl(fileName);
  }

  function open(vfsPath) {
    const normPath = VFS.normalizePath(vfsPath || 'C:\\Documents and Settings\\OU_IT\\My Documents\\My Pictures\\contest-0.jpg');
    const lastSlash = normPath.lastIndexOf('\\');
    const parentDir = lastSlash <= 2 ? 'C:\\' : normPath.slice(0, lastSlash);
    const initialName = normPath.slice(lastSlash + 1);

    const winId = `imgviewer-${normPath}`;

    // If already open, focus it
    const existing = WindowManager.get(winId);
    if (existing) {
      if (existing.isMinimized) existing.restore();
      else existing.bringToFront();
      return existing;
    }

    const isVi = () => (window.I18n ? I18n.getLanguage() === 'vi' : true);
    const viewerSuffix = () => (isVi() ? 'Trình xem Ảnh và Fax Windows' : 'Windows Picture and Fax Viewer');

    return WindowManager.open({
      id: winId,
      title: `${initialName} - ${viewerSuffix()}`,
      iconUrl: 'assets/icons/image-viewer.svg',
      width: 680,
      height: 500,
      noMenubar: true,
      render: (container, winInstance) => {
        let currentDir = parentDir;
        let currentName = initialName;
        let zoom = 1;
        let fitMode = true; // true = Best Fit, false = custom zoom / 1:1
        let rotation = 0;
        let panX = 0;
        let panY = 0;
        let isDragging = false;
        let dragStartX = 0;
        let dragStartY = 0;
        let slideTimer = null;

        function getSiblingImages() {
          const list = VFS.listDir(currentDir) || [];
          return list.filter(isImageItem);
        }

        function stopSlideshow() {
          if (slideTimer) {
            clearInterval(slideTimer);
            slideTimer = null;
            const btnSlide = container.querySelector('#iv-btn-slide');
            if (btnSlide) btnSlide.classList.remove('active');
          }
        }

        function renderViewer() {
          const vi = isVi();
          const fullPath = `${currentDir}\\${currentName}`;
          const node = VFS.getNode(fullPath);
          const imgSrc = resolveImageSrc(node, currentName);
          const siblings = getSiblingImages();
          const currentIndex = siblings.findIndex(item => item.name === currentName);

          // Update window title
          winInstance.title = `${currentName} - ${viewerSuffix()}`;
          const titleEl = winInstance.element.querySelector('.window-title');
          if (titleEl) titleEl.textContent = winInstance.title;

          container.innerHTML = `
            <style>
              .xp-iv-root {
                display: flex;
                flex-direction: column;
                width: 100%;
                height: 100%;
                background: #eef2f8;
                font-family: Tahoma, sans-serif;
                user-select: none;
                overflow: hidden;
              }
              .xp-iv-canvas {
                flex: 1;
                position: relative;
                overflow: hidden;
                display: flex;
                align-items: center;
                justify-content: center;
                background: radial-gradient(circle, #f7f9fc 0%, #dee6f2 100%);
                border-bottom: 1px solid #b5c4d8;
                padding: 14px;
              }
              .xp-iv-img {
                max-width: 100%;
                max-height: 100%;
                object-fit: contain;
                box-shadow: 0 3px 12px rgba(0, 0, 0, 0.28);
                border: 1px solid #8fa3bf;
                background: #ffffff;
                transition: transform 0.14s ease-out;
                transform-origin: center center;
                pointer-events: none;
              }
              .xp-iv-info-pill {
                position: absolute;
                top: 8px;
                left: 10px;
                background: rgba(255, 255, 255, 0.88);
                border: 1px solid #9ab0cc;
                color: #003399;
                padding: 2px 8px;
                border-radius: 2px;
                font-size: 11px;
                font-weight: bold;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
              }
              .xp-iv-zoom-pill {
                position: absolute;
                top: 8px;
                right: 10px;
                background: rgba(255, 255, 255, 0.88);
                border: 1px solid #9ab0cc;
                color: #333;
                padding: 2px 8px;
                border-radius: 2px;
                font-size: 11px;
              }
              .xp-iv-bottombar {
                height: 42px;
                background: linear-gradient(180deg, #faf9f4 0%, #ece9d8 100%);
                border-top: 1px solid #ffffff;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 4px;
                padding: 0 10px;
                flex-shrink: 0;
              }
              .xp-iv-btn {
                width: 28px;
                height: 26px;
                border: 1px solid transparent;
                border-radius: 3px;
                background: transparent;
                color: #003399;
                font-size: 14px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
              }
              .xp-iv-btn:hover {
                background: #f5f4ea;
                border-color: #7f9db9;
                box-shadow: inset 1px 1px 0 #fff;
              }
              .xp-iv-btn.active {
                background: #d6e4f8;
                border-color: #316ac5;
              }
              .xp-iv-btn:disabled {
                opacity: 0.4;
                pointer-events: none;
              }
              .xp-iv-sep {
                width: 1px;
                height: 20px;
                background: #aca899;
                border-right: 1px solid #ffffff;
                margin: 0 4px;
              }
            </style>

            <div class="xp-iv-root">
              <div class="xp-iv-canvas" id="iv-canvas">
                <div class="xp-iv-info-pill">
                  <i class="bi bi-image" style="margin-right:4px;"></i>${currentName}
                  ${siblings.length > 1 ? `<span style="color:#555; font-weight:normal;">(${currentIndex + 1}/${siblings.length})</span>` : ''}
                </div>
                <div class="xp-iv-zoom-pill" id="iv-zoom-label">
                  ${fitMode ? (vi ? 'Vừa cửa sổ' : 'Best Fit') : `${Math.round(zoom * 100)}%`}
                </div>
                <img src="${imgSrc}" class="xp-iv-img" id="iv-img" alt="${currentName}" />
              </div>

              <!-- Classic Windows XP Picture and Fax Viewer Bottom Control Strip -->
              <div class="xp-iv-bottombar">
                <button class="xp-iv-btn" id="iv-btn-prev" ${siblings.length <= 1 ? 'disabled' : ''} title="${vi ? 'Ảnh trước (Phím mũi tên trái)' : 'Previous Image (Left Arrow)'}">
                  <i class="bi bi-skip-backward-fill"></i>
                </button>
                <button class="xp-iv-btn" id="iv-btn-next" ${siblings.length <= 1 ? 'disabled' : ''} title="${vi ? 'Ảnh tiếp theo (Phím mũi tên phải)' : 'Next Image (Right Arrow)'}">
                  <i class="bi bi-skip-forward-fill"></i>
                </button>

                <div class="xp-iv-sep"></div>

                <button class="xp-iv-btn ${fitMode ? 'active' : ''}" id="iv-btn-fit" title="${vi ? 'Vừa khung cửa sổ (Best Fit)' : 'Best Fit to Window'}">
                  <i class="bi bi-aspect-ratio"></i>
                </button>
                <button class="xp-iv-btn ${!fitMode && zoom === 1 ? 'active' : ''}" id="iv-btn-actual" title="${vi ? 'Kích thước thật (Actual Size 1:1)' : 'Actual Size (1:1)'}">
                  <i class="bi bi-fullscreen"></i>
                </button>
                <button class="xp-iv-btn ${slideTimer ? 'active' : ''}" id="iv-btn-slide" ${siblings.length <= 1 ? 'disabled' : ''} title="${vi ? 'Trình chiếu tự động (Slideshow)' : 'Start Slideshow'}">
                  <i class="bi bi-play-btn-fill" style="color:#2e7d32;"></i>
                </button>

                <div class="xp-iv-sep"></div>

                <button class="xp-iv-btn" id="iv-btn-zoomin" title="${vi ? 'Phóng to (+)' : 'Zoom In (+)'}">
                  <i class="bi bi-zoom-in"></i>
                </button>
                <button class="xp-iv-btn" id="iv-btn-zoomout" title="${vi ? 'Thu nhỏ (-)' : 'Zoom Out (-)'}">
                  <i class="bi bi-zoom-out"></i>
                </button>

                <div class="xp-iv-sep"></div>

                <button class="xp-iv-btn" id="iv-btn-rotleft" title="${vi ? 'Xoay ngược chiều kim đồng hồ (90°)' : 'Rotate Counter-Clockwise'}">
                  <i class="bi bi-arrow-counterclockwise"></i>
                </button>
                <button class="xp-iv-btn" id="iv-btn-rotright" title="${vi ? 'Xoay cùng chiều kim đồng hồ (90°)' : 'Rotate Clockwise'}">
                  <i class="bi bi-arrow-clockwise"></i>
                </button>

                <div class="xp-iv-sep"></div>

                <button class="xp-iv-btn" id="iv-btn-delete" title="${vi ? 'Xóa ảnh (Delete)' : 'Delete (Del)'}">
                  <i class="bi bi-x-octagon-fill" style="color:#d13438;"></i>
                </button>
                <button class="xp-iv-btn" id="iv-btn-save" title="${vi ? 'Lưu ảnh về máy (Save Copy)' : 'Save a Copy'}">
                  <i class="bi bi-floppy-fill" style="color:#0055ea;"></i>
                </button>
                <button class="xp-iv-btn" id="iv-btn-edit" title="${vi ? 'Đóng trình xem và mở ảnh trong Paint để vẽ (Edit in Paint)' : 'Close and open image for editing in Paint'}">
                  <i class="bi bi-palette-fill" style="color:#e65c00;"></i>
                </button>
              </div>
            </div>
          `;

          const imgEl = container.querySelector('#iv-img');
          const canvasEl = container.querySelector('#iv-canvas');
          const zoomLabel = container.querySelector('#iv-zoom-label');

          function applyTransform() {
            if (!imgEl) return;
            if (fitMode) {
              imgEl.style.maxWidth = '100%';
              imgEl.style.maxHeight = '100%';
              imgEl.style.transform = `rotate(${rotation}deg) scale(1)`;
              canvasEl.style.cursor = 'default';
              if (zoomLabel) zoomLabel.textContent = isVi() ? 'Vừa cửa sổ' : 'Best Fit';
            } else {
              imgEl.style.maxWidth = 'none';
              imgEl.style.maxHeight = 'none';
              imgEl.style.transform = `translate(${panX}px, ${panY}px) rotate(${rotation}deg) scale(${zoom})`;
              canvasEl.style.cursor = 'grab';
              if (zoomLabel) zoomLabel.textContent = `${Math.round(zoom * 100)}%`;
            }
          }

          applyTransform();

          function goToOffset(delta) {
            const list = getSiblingImages();
            if (list.length <= 1) return;
            const idx = list.findIndex(item => item.name === currentName);
            const nextIdx = (idx + delta + list.length) % list.length;
            currentName = list[nextIdx].name;
            rotation = 0;
            zoom = 1;
            panX = 0;
            panY = 0;
            fitMode = true;
            renderViewer();
          }

          container.querySelector('#iv-btn-prev')?.addEventListener('click', () => {
            stopSlideshow();
            goToOffset(-1);
          });

          container.querySelector('#iv-btn-next')?.addEventListener('click', () => {
            stopSlideshow();
            goToOffset(1);
          });

          container.querySelector('#iv-btn-fit')?.addEventListener('click', () => {
            fitMode = true;
            zoom = 1;
            panX = 0;
            panY = 0;
            renderViewer();
          });

          container.querySelector('#iv-btn-actual')?.addEventListener('click', () => {
            fitMode = false;
            zoom = 1;
            panX = 0;
            panY = 0;
            renderViewer();
          });

          container.querySelector('#iv-btn-slide')?.addEventListener('click', () => {
            if (slideTimer) {
              stopSlideshow();
            } else {
              slideTimer = setInterval(() => goToOffset(1), 2500);
              container.querySelector('#iv-btn-slide')?.classList.add('active');
            }
          });

          container.querySelector('#iv-btn-zoomin')?.addEventListener('click', () => {
            fitMode = false;
            zoom = Math.min(4, +(zoom + 0.25).toFixed(2));
            applyTransform();
          });

          container.querySelector('#iv-btn-zoomout')?.addEventListener('click', () => {
            fitMode = false;
            zoom = Math.max(0.25, +(zoom - 0.25).toFixed(2));
            applyTransform();
          });

          container.querySelector('#iv-btn-rotleft')?.addEventListener('click', () => {
            rotation = (rotation - 90) % 360;
            applyTransform();
          });

          container.querySelector('#iv-btn-rotright')?.addEventListener('click', () => {
            rotation = (rotation + 90) % 360;
            applyTransform();
          });

          container.querySelector('#iv-btn-delete')?.addEventListener('click', async () => {
            stopSlideshow();
            const ok = await XPDialog.confirm(
              vi ? `Bạn có chắc chắn muốn chuyển "${currentName}" vào Thùng rác không?` : `Are you sure you want to send "${currentName}" to the Recycle Bin?`,
              vi ? 'Xác nhận xóa tệp' : 'Confirm File Delete',
              { icon: 'warning' }
            );
            if (!ok) return;
            const listBefore = getSiblingImages();
            const idx = listBefore.findIndex(i => i.name === currentName);
            VFS.deleteNode(`${currentDir}\\${currentName}`);
            const listAfter = getSiblingImages();
            if (listAfter.length === 0) {
              winInstance.close();
            } else {
              currentName = listAfter[idx % listAfter.length].name;
              renderViewer();
            }
          });

          container.querySelector('#iv-btn-save')?.addEventListener('click', () => {
            const a = document.createElement('a');
            a.href = imgSrc;
            a.download = currentName;
            a.click();
          });

          container.querySelector('#iv-btn-edit')?.addEventListener('click', () => {
            stopSlideshow();
            const targetPath = `${currentDir}\\${currentName}`;
            window._paintEditTarget = {
              vfsPath: targetPath,
              fileName: currentName,
              imgSrc: imgSrc
            };
            winInstance.close();
            // Open Paint (if already open, close & reopen so it loads the file)
            if (WindowManager.get('mspaint.exe')) {
              WindowManager.close('mspaint.exe');
            }
            WindowManager.open('mspaint.exe');
          });

          // Mouse wheel zoom
          canvasEl.addEventListener('wheel', e => {
            e.preventDefault();
            fitMode = false;
            const delta = e.deltaY < 0 ? 0.15 : -0.15;
            zoom = Math.max(0.25, Math.min(4, +(zoom + delta).toFixed(2)));
            applyTransform();
          }, { passive: false });

          // Panning when zoomed
          canvasEl.addEventListener('mousedown', e => {
            if (fitMode) return;
            isDragging = true;
            dragStartX = e.clientX - panX;
            dragStartY = e.clientY - panY;
            canvasEl.style.cursor = 'grabbing';
          });
          window.addEventListener('mousemove', e => {
            if (!isDragging) return;
            panX = e.clientX - dragStartX;
            panY = e.clientY - dragStartY;
            applyTransform();
          });
          window.addEventListener('mouseup', () => {
            if (isDragging) {
              isDragging = false;
              canvasEl.style.cursor = fitMode ? 'default' : 'grab';
            }
          });
        }

        renderViewer();

        if (window.I18n) {
          I18n.onChange(() => renderViewer());
        }
      }
    });
  }

  // Register in AppRegistry so it can also be launched from Run / Start if needed
  AppRegistry.register({
    id: 'shimgvw.exe',
    title: 'Windows Picture and Fax Viewer',
    desktopLabel: 'Picture Viewer',
    iconUrl: 'assets/icons/image-viewer.svg',
    width: 680,
    height: 500,
    noMenubar: true,
    showOnDesktop: false,
    showInStartMenu: false,
    render: (container, win) => {
      win.close();
      open('C:\\Documents and Settings\\OU_IT\\My Documents\\My Pictures\\contest-0.jpg');
    }
  });

  return { open };
})();

window.ImageViewer = ImageViewer;
