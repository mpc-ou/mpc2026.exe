/**
 * ============================================================================
 * Windows Media Player 9/10 Series (Classic Windows XP Luna Blue & Silver Skin)
 * ============================================================================
 * Matches authentic Windows XP layout from user reference photo:
 * - Left curved royal blue pane: Now Playing, Media Guide, Copy from CD, Media Library,
 *   Radio Tuner, Copy to CD or Device, Skin Chooser + 4-color XP flag branding.
 * - Center screen: Track artist/title banner, Video viewport with STRICT object-fit: contain,
 *   retro visualization canvas (Cosmic Tunnel/Water Ambience), and Ambience/Album bar.
 * - Right dock: Sample Playlist dropdown and tracks list with playing indicators.
 * - Bottom deck: Glossy 3D circular blue Play/Pause button, chrome buttons, glowing green seeker,
 *   green digital LCD clock, and volume slider.
 */

(function () {
  let _activeVideoEl = null;
  let _activeVizCanvas = null;
  let _vizAnimId = null;
  let _activeVizMode = 'Cosmic Tunnel'; // or 'Water Ambience'

  const PLAYLIST_DATA = [
    {
      id: 1,
      title: 'intro.mp4',
      artist: 'MPClub • Khoa CNTT – Trường ĐH Mở TP.HCM',
      album: 'None',
      src: 'assets/videos/intro.mp4',
      duration: '0:65',
      isVideo: true
    }
  ];

  let _currentTrackIndex = 0;
  let _isPlaying = false;

  const MediaPlayer = {
    play(videoSrc, videoTitle) {
      const existingWin = WindowManager.get('wmplayer.exe');
      if (existingWin) {
        if (existingWin.isMinimized) existingWin.restore();
        existingWin.bringToFront();
        if (_activeVideoEl) {
          _activeVideoEl.src = videoSrc || 'assets/videos/intro.mp4';
          _activeVideoEl.play().catch(() => {});
        }
      } else {
        WindowManager.open('wmplayer.exe');
      }
    }
  };

  window.MediaPlayer = MediaPlayer;

  AppRegistry.register({
    id: 'wmplayer.exe',
    title: 'Windows Media Player',
    desktopLabel: 'Media Player',
    iconUrl: 'assets/icons/wmp.svg',
    width: 780,
    height: 540,
    showOnDesktop: true,
    showInStartMenu: false, // Already in Start menu right column
    noMenubar: true, // We have authentic WMP menubar built inside
    onClose: () => {
      if (_activeVideoEl) {
        _activeVideoEl.pause();
        _activeVideoEl.src = '';
      }
      if (_vizAnimId) {
        cancelAnimationFrame(_vizAnimId);
        _vizAnimId = null;
      }
    },
    render: (container, win) => {
      container.style.overflow = 'hidden';
      container.style.display = 'flex';
      container.style.flexDirection = 'column';
      container.style.height = '100%';
      container.style.minHeight = '0';

      const track = PLAYLIST_DATA[_currentTrackIndex];

      container.innerHTML = `
        <div class="wmp-container">
          <!-- Top Classical XP Menubar -->
          <div class="wmp-top-menubar">
            <span class="wmp-menu-btn" id="wmp-m-file">File</span>
            <span class="wmp-menu-btn" id="wmp-m-view">View</span>
            <span class="wmp-menu-btn" id="wmp-m-play">Play</span>
            <span class="wmp-menu-btn" id="wmp-m-tools">Tools</span>
            <span class="wmp-menu-btn" id="wmp-m-help">Help</span>
            <div style="flex: 1;"></div>
            <button class="wmp-open-file-btn" id="wmp-open-file-btn" style="background:#2062dc;color:#fff;border:1px solid #7f9db9;padding:1px 6px;font-size:10px;cursor:pointer;white-space:nowrap;">
              <i class="bi bi-folder2-open"></i> Open File...
            </button>
            <input type="file" id="wmp-hidden-file-input" accept="video/*,audio/*" style="display:none;" />
          </div>

          <!-- Main Split View: Left Navigation, Center Player, Right Playlist -->
          <div class="wmp-body-split">
            <!-- Left Curved Royal Blue Navigation Column -->
            <div class="wmp-left-nav">
              <div class="wmp-nav-tabs-group">
                <div class="wmp-nav-tab active" data-tab="now-playing">Now Playing</div>
                <div class="wmp-nav-tab" data-tab="media-guide">Media Guide</div>
                <div class="wmp-nav-tab" data-tab="copy-cd">Copy from CD</div>
                <div class="wmp-nav-tab" data-tab="library">Media Library</div>
                <div class="wmp-nav-tab" data-tab="radio">Radio Tuner</div>
                <div class="wmp-nav-tab" data-tab="copy-dev">Copy to CD or Device</div>
                <div class="wmp-nav-tab" data-tab="skins">Skin Chooser</div>
              </div>

              <!-- Left Bottom XP Flag Logo Branding -->
              <div class="wmp-left-brand">
                <div class="wmp-xp-flag">
                  <div class="wmp-flag-dot" style="background: #f25022;"></div>
                  <div class="wmp-flag-dot" style="background: #7fba00;"></div>
                  <div class="wmp-flag-dot" style="background: #00a4ef;"></div>
                  <div class="wmp-flag-dot" style="background: #ffb900;"></div>
                </div>
                <div class="wmp-brand-text">
                  Windows<br>Media Player
                </div>
              </div>
            </div>

            <!-- Center Screen Player Area -->
            <div class="wmp-center-display">
              <!-- Header Now Playing Title Banner -->
              <div class="wmp-now-playing-banner">
                <div class="wmp-artist-name" id="wmp-artist">${track.artist}</div>
                <div class="wmp-track-title" id="wmp-title">${track.title}</div>
              </div>

              <!-- Video / Visualization Screen Area -->
              <div class="wmp-viewport-screen" id="wmp-screen-box">
                <video 
                  id="wmp-video" 
                  class="wmp-video-elem" 
                  src="${track.src}" 
                  playsinline 
                  autoplay>
                </video>
                <canvas id="wmp-viz-canvas" class="wmp-viz-canvas" width="400" height="260"></canvas>
              </div>

              <!-- Viewport Bottom Status Bar: Ambience & Album Banner -->
              <div class="wmp-viewport-bottom-bar">
                <div class="wmp-ambience-selector">
                  <button class="wmp-amb-btn" id="wmp-amb-prev">&lt;</button>
                  <button class="wmp-amb-btn" id="wmp-amb-next">&gt;</button>
                  <span id="wmp-amb-label">Ambience: Water</span>
                </div>
                <div class="wmp-album-tag" id="wmp-album-text">${track.album}</div>
              </div>
            </div>

            <!-- Right Playlist Sidebar (Docked) -->
            <div class="wmp-playlist-sidebar" id="wmp-playlist-panel">
              <div class="wmp-playlist-dropdown-header">
                <span><i class="bi bi-file-earmark-music-fill" style="margin-right: 4px; color: #0055ea;"></i> Sample Playlist</span>
                <i class="bi bi-chevron-down" style="font-size: 10px;"></i>
              </div>

              <div class="wmp-playlist-list" id="wmp-playlist-items">
                ${PLAYLIST_DATA.map((item, idx) => `
                  <div class="wmp-playlist-item ${idx === _currentTrackIndex ? 'active' : ''}" data-index="${idx}">
                    <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                      ${idx === _currentTrackIndex ? '<span class="wmp-pl-dot">●</span>' : ''}
                      ${item.title}
                    </span>
                    <span style="font-size: 9px; opacity: 0.7; margin-left: 4px;">${item.duration}</span>
                  </div>
                `).join('')}
              </div>

              <div class="wmp-playlist-footer" id="wmp-pl-footer">
                Total Time: 8:41
              </div>
            </div>
          </div>

          <!-- Bottom Glossy Silver-Blue Curved Pill Control Deck -->
          <div class="wmp-bottom-deck">
            <!-- Circular 3D Glossy Blue Play/Pause Button -->
            <button class="wmp-circle-play-btn" id="wmp-btn-play" title="Play / Pause">
              <i class="bi bi-pause-fill"></i>
            </button>

            <!-- Chrome Secondary Buttons: Stop, Previous, Next -->
            <div class="wmp-deck-btns">
              <button class="wmp-chrome-btn" id="wmp-btn-stop" title="Stop">
                <i class="bi bi-stop-fill"></i>
              </button>
              <button class="wmp-chrome-btn" id="wmp-btn-prev" title="Previous Track">
                <i class="bi bi-skip-start-fill"></i>
              </button>
              <button class="wmp-chrome-btn" id="wmp-btn-next" title="Next Track">
                <i class="bi bi-skip-end-fill"></i>
              </button>
              <button class="wmp-chrome-btn" id="wmp-btn-toggle-viz" title="Toggle Visualizations">
                <i class="bi bi-disc"></i>
              </button>
            </div>

            <!-- Green Glowing Seeker Track -->
            <div class="wmp-seeker-container">
              <div class="wmp-seeker-groove" id="wmp-seeker">
                <div class="wmp-seeker-fill" id="wmp-seeker-fill" style="width: 0%;"></div>
              </div>
            </div>

            <!-- Bright Green Digital LCD Clock -->
            <div class="wmp-green-lcd-time" id="wmp-lcd-clock">00:00</div>

            <!-- Volume Slider in Deck -->
            <div class="wmp-volume-deck">
              <button class="wmp-chrome-btn" id="wmp-vol-mute-btn" title="Mute Volume">
                <i class="bi bi-volume-up-fill"></i>
              </button>
              <input type="range" min="0" max="100" value="85" class="wmp-vol-range" id="wmp-vol-slider" />
            </div>

            <!-- Toggle Playlist Button -->
            <button class="wmp-chrome-btn" id="wmp-btn-toggle-pl" title="Toggle Playlist">
              <i class="bi bi-layout-sidebar-reverse"></i>
            </button>
          </div>
        </div>
      `;

      const video = container.querySelector('#wmp-video');
      _activeVideoEl = video;

      const vizCanvas = container.querySelector('#wmp-viz-canvas');
      _activeVizCanvas = vizCanvas;

      const playBtn = container.querySelector('#wmp-btn-play');
      const stopBtn = container.querySelector('#wmp-btn-stop');
      const prevBtn = container.querySelector('#wmp-btn-prev');
      const nextBtn = container.querySelector('#wmp-btn-next');
      const toggleVizBtn = container.querySelector('#wmp-btn-toggle-viz');
      const seekerGroove = container.querySelector('#wmp-seeker');
      const seekerFill = container.querySelector('#wmp-seeker-fill');
      const lcdClock = container.querySelector('#wmp-lcd-clock');
      const volSlider = container.querySelector('#wmp-vol-slider');
      const volBtn = container.querySelector('#wmp-vol-mute-btn');
      const playlistPanel = container.querySelector('#wmp-playlist-panel');
      const togglePlBtn = container.querySelector('#wmp-btn-toggle-pl');

      const artistEl = container.querySelector('#wmp-artist');
      const titleEl = container.querySelector('#wmp-title');
      const albumEl = container.querySelector('#wmp-album-text');
      const ambLabel = container.querySelector('#wmp-amb-label');
      const openFileBtn = container.querySelector('#wmp-open-file-btn');
      const fileInput = container.querySelector('#wmp-hidden-file-input');

      function formatTime(seconds) {
        if (!seconds || isNaN(seconds)) return '00:00';
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
      }

      function loadTrack(idx) {
        _currentTrackIndex = idx;
        const current = PLAYLIST_DATA[idx];
        artistEl.textContent = current.artist;
        titleEl.textContent = current.title;
        albumEl.textContent = current.album;

        // Update active class in playlist list
        container.querySelectorAll('.wmp-playlist-item').forEach(el => {
          const itemIdx = parseInt(el.dataset.index, 10);
          if (itemIdx === idx) {
            el.classList.add('active');
            if (!el.querySelector('.wmp-pl-dot')) {
              el.querySelector('span').insertAdjacentHTML('afterbegin', '<span class="wmp-pl-dot">●</span> ');
            }
          } else {
            el.classList.remove('active');
            el.querySelector('.wmp-pl-dot')?.remove();
          }
        });

        if (current.isVideo) {
          video.style.display = 'block';
          vizCanvas.style.display = 'none';
        } else {
          // Audio track: show visualization
          video.style.display = 'none';
          vizCanvas.style.display = 'block';
          startVisualization();
        }

        video.src = current.src;
        video.play().then(() => {
          _isPlaying = true;
          playBtn.innerHTML = '<i class="bi bi-pause-fill"></i>';
        }).catch(() => {
          _isPlaying = false;
          playBtn.innerHTML = '<i class="bi bi-play-fill"></i>';
        });
      }

      video.addEventListener('timeupdate', () => {
        lcdClock.textContent = formatTime(video.currentTime);
        const pct = (video.currentTime / (video.duration || 1)) * 100;
        seekerFill.style.width = `${pct}%`;
      });

      video.addEventListener('ended', () => {
        loadTrack((_currentTrackIndex + 1) % PLAYLIST_DATA.length);
      });

      playBtn.addEventListener('click', () => {
        if (video.paused) {
          video.play().then(() => {
            _isPlaying = true;
            playBtn.innerHTML = '<i class="bi bi-pause-fill"></i>';
          }).catch(() => {});
        } else {
          video.pause();
          _isPlaying = false;
          playBtn.innerHTML = '<i class="bi bi-play-fill"></i>';
        }
      });

      stopBtn.addEventListener('click', () => {
        video.pause();
        video.currentTime = 0;
        _isPlaying = false;
        playBtn.innerHTML = '<i class="bi bi-play-fill"></i>';
        seekerFill.style.width = '0%';
        lcdClock.textContent = '00:00';
      });

      prevBtn.addEventListener('click', () => {
        const prevIdx = (_currentTrackIndex - 1 + PLAYLIST_DATA.length) % PLAYLIST_DATA.length;
        loadTrack(prevIdx);
      });

      nextBtn.addEventListener('click', () => {
        const nextIdx = (_currentTrackIndex + 1) % PLAYLIST_DATA.length;
        loadTrack(nextIdx);
      });

      seekerGroove.addEventListener('click', (e) => {
        const rect = seekerGroove.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        if (video.duration) {
          video.currentTime = pos * video.duration;
        }
      });

      // Synchronize with Global MasterVolume
      if (window.MasterVolume) {
        video.volume = MasterVolume.getEffectiveVolume();
        volSlider.value = String(Math.round(MasterVolume.get() * 100));
        volBtn.innerHTML = MasterVolume.isMuted() ? '<i class="bi bi-volume-mute-fill"></i>' : '<i class="bi bi-volume-up-fill"></i>';

        const unbindVol = MasterVolume.onChange((effVol, rawVol, isMuted) => {
          video.volume = effVol;
          volSlider.value = String(Math.round(rawVol * 100));
          volBtn.innerHTML = isMuted ? '<i class="bi bi-volume-mute-fill"></i>' : '<i class="bi bi-volume-up-fill"></i>';
        });

        const origOnClose = win.onClose;
        win.onClose = () => {
          unbindVol();
          if (typeof origOnClose === 'function') origOnClose();
        };
      }

      volSlider.addEventListener('input', (e) => {
        const val = e.target.value / 100;
        if (window.MasterVolume) {
          window.MasterVolume.set(val);
        } else {
          video.volume = val;
        }
      });

      volBtn.addEventListener('click', () => {
        if (window.MasterVolume) {
          window.MasterVolume.toggleMute();
        } else {
          video.muted = !video.muted;
          volBtn.innerHTML = video.muted ? '<i class="bi bi-volume-mute-fill"></i>' : '<i class="bi bi-volume-up-fill"></i>';
        }
      });

      // Toggle Playlist Sidebar
      togglePlBtn.addEventListener('click', () => {
        const computedDisplay = window.getComputedStyle(playlistPanel).display;
        const isHidden = computedDisplay === 'none';
        playlistPanel.style.display = isHidden ? 'flex' : 'none';
      });

      // Toggle Visualization Button
      toggleVizBtn.addEventListener('click', () => {
        if (vizCanvas.style.display === 'block') {
          vizCanvas.style.display = 'none';
          video.style.display = 'block';
        } else {
          vizCanvas.style.display = 'block';
          video.style.display = 'none';
          startVisualization();
        }
      });

      // Playlist Item Clicks
      container.querySelectorAll('.wmp-playlist-item').forEach(itemEl => {
        itemEl.addEventListener('click', () => {
          const idx = parseInt(itemEl.dataset.index, 10);
          loadTrack(idx);
        });
      });

      // Ambience Prev / Next
      container.querySelector('#wmp-amb-prev')?.addEventListener('click', () => {
        _activeVizMode = _activeVizMode === 'Cosmic Tunnel' ? 'Water Ambience' : 'Cosmic Tunnel';
        ambLabel.textContent = `Ambience: ${_activeVizMode}`;
      });

      container.querySelector('#wmp-amb-next')?.addEventListener('click', () => {
        _activeVizMode = _activeVizMode === 'Cosmic Tunnel' ? 'Water Ambience' : 'Cosmic Tunnel';
        ambLabel.textContent = `Ambience: ${_activeVizMode}`;
      });

      // Open Custom File
      openFileBtn.addEventListener('click', () => {
        fileInput.click();
      });

      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const fileUrl = URL.createObjectURL(file);
          PLAYLIST_DATA.push({
            id: PLAYLIST_DATA.length + 1,
            title: file.name,
            artist: 'Local Media File',
            album: 'Album: My Media',
            src: fileUrl,
            duration: '--:--',
            isVideo: file.type.startsWith('video')
          });
          loadTrack(PLAYLIST_DATA.length - 1);
        }
      });

      // Left Nav Tabs
      container.querySelectorAll('.wmp-nav-tab').forEach(tab => {
        tab.addEventListener('click', () => {
          container.querySelectorAll('.wmp-nav-tab').forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
        });
      });

      // Retro Cosmic Tunnel / Water Ambience Canvas Animation
      function startVisualization() {
        if (_vizAnimId) return;
        const ctx = vizCanvas.getContext('2d');
        let angle = 0;

        function animate() {
          if (vizCanvas.style.display !== 'block' || !container.contains(vizCanvas)) {
            _vizAnimId = null;
            return;
          }

          ctx.fillStyle = 'rgba(0, 5, 20, 0.2)';
          ctx.fillRect(0, 0, vizCanvas.width, vizCanvas.height);

          const cx = vizCanvas.width / 2;
          const cy = vizCanvas.height / 2;

          if (_activeVizMode === 'Cosmic Tunnel') {
            for (let r = 10; r < 140; r += 14) {
              const currentR = (r + (angle * 2) % 14);
              ctx.beginPath();
              ctx.strokeStyle = `hsl(${(angle * 30 + r * 2) % 360}, 100%, 60%)`;
              ctx.lineWidth = 2;
              ctx.arc(cx, cy, currentR, 0, Math.PI * 2);
              ctx.stroke();
            }
          } else {
            // Water ambience
            for (let i = 0; i < 20; i++) {
              const waveY = cy + Math.sin(angle + i * 0.3) * 30;
              ctx.beginPath();
              ctx.strokeStyle = `rgba(80, 160, 255, ${0.4 + Math.sin(angle + i) * 0.3})`;
              ctx.lineWidth = 1.5;
              ctx.arc(cx + (i - 10) * 15, waveY, 20 + Math.sin(angle) * 10, 0, Math.PI * 2);
              ctx.stroke();
            }
          }

          angle += 0.05;
          _vizAnimId = requestAnimationFrame(animate);
        }
        _vizAnimId = requestAnimationFrame(animate);
      }

      video.play().catch(() => {
        console.log('Autoplay deferred until user interaction');
      });
    }
  });
})();
