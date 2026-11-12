/**
 * ============================================================================
 * Windows Media Player (Classic XP Skin) - Genuine Local Video Player
 * ============================================================================
 * - Strict object-fit: contain !important; (zero cropping, zero zoom/cut)
 * - Zero vertical/horizontal scrollbars
 * - Plays local assets/videos/intro.mp4
 * - Plays local user-selected video files or videos launched from Explorer
 */

(function () {
  let _activeVideoEl = null;
  let _currentTitle = 'intro.mp4';
  let _currentSrc = 'assets/videos/intro.mp4';

  const MediaPlayer = {
    /**
     * Play a specific video file (called when double clicking a video file in Explorer)
     */
    play(videoSrc, videoTitle) {
      _currentSrc = videoSrc || 'assets/videos/intro.mp4';
      _currentTitle = videoTitle || 'intro.mp4';

      const existingWin = WindowManager.get('wmplayer.exe');
      if (existingWin) {
        if (existingWin.isMinimized) existingWin.restore();
        existingWin.bringToFront();
        if (_activeVideoEl) {
          _activeVideoEl.src = _currentSrc;
          _activeVideoEl.play().catch(e => console.log('Autoplay deferred'));
        }
        const titleEl = document.getElementById('wmp-title');
        if (titleEl) titleEl.textContent = `Now Playing: ${_currentTitle}`;
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
    width: 720,
    height: 500,
    showOnDesktop: true,
    showInStartMenu: true,
    onClose: () => {
      if (_activeVideoEl) {
        _activeVideoEl.pause();
        _activeVideoEl.src = '';
      }
    },
    render: (container, win) => {
      // Force container to be strictly non-scrolling
      container.style.overflow = 'hidden';
      container.style.display = 'flex';
      container.style.flexDirection = 'column';
      container.style.height = '100%';
      container.style.minHeight = '0';

      container.innerHTML = `
        <div class="wmp-container">
          <!-- WMP Classic Dark Header -->
          <div class="wmp-header">
            <span class="wmp-now-playing-title" id="wmp-title">Now Playing: ${_currentTitle}</span>
            <div style="display: flex; align-items: center; gap: 8px;">
              <button class="wmp-open-file-btn" id="wmp-open-btn" title="Open video from computer">
                <i class="bi bi-folder2-open" style="margin-right: 4px;"></i> Open File...
              </button>
              <input type="file" id="wmp-file-input" accept="video/*" style="display: none;" />
              <span class="wmp-mode-badge">Visualizations</span>
            </div>
          </div>

          <!-- Video Display Area: strictly contain, absolute positioning, zero scroll -->
          <div class="wmp-screen-area" id="wmp-screen">
            <video 
              id="wmp-video-tag" 
              src="${_currentSrc}" 
              style="position: absolute; top: 0; left: 0; width: 100% !important; height: 100% !important; object-fit: contain !important; display: block; background-color: #000000;" 
              playsinline 
              autoplay>
            </video>
          </div>

          <!-- Playlist & Controls Bar -->
          <div class="wmp-controls-panel">
            <!-- Progress Bar -->
            <div class="wmp-timeline-row">
              <span class="wmp-time-text" id="wmp-cur-time">00:00</span>
              <div class="wmp-timeline-track" id="wmp-track">
                <div class="wmp-timeline-progress" id="wmp-progress" style="width: 0%;"></div>
              </div>
              <span class="wmp-time-text" id="wmp-dur-time">00:00</span>
            </div>

            <!-- Buttons Controls -->
            <div class="wmp-buttons-row">
              <div class="wmp-btns-left">
                <button class="wmp-btn" id="wmp-btn-stop" title="Stop"><i class="bi bi-stop-fill"></i></button>
                <button class="wmp-btn wmp-btn-play" id="wmp-play-pause" title="Play / Pause"><i class="bi bi-pause-fill"></i></button>
              </div>

              <!-- Volume Slider -->
              <div class="wmp-vol-wrapper">
                <span id="wmp-vol-icon" style="cursor: pointer; display: flex; align-items: center;"><i class="bi bi-volume-up-fill"></i></span>
                <input type="range" min="0" max="100" value="80" class="wmp-vol-slider" id="wmp-vol-slider" />
              </div>

              <!-- Playlist Selector -->
              <div class="wmp-playlist-select-wrapper">
                <select class="wmp-playlist-select" id="wmp-playlist-picker">
                  <option value="assets/videos/intro.mp4" selected>
                    intro.mp4 (MPClub Video)
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>
      `;

      const video = container.querySelector('#wmp-video-tag');
      _activeVideoEl = video;

      const titleEl = container.querySelector('#wmp-title');
      const playBtn = container.querySelector('#wmp-play-pause');
      const stopBtn = container.querySelector('#wmp-btn-stop');
      const curTimeEl = container.querySelector('#wmp-cur-time');
      const durTimeEl = container.querySelector('#wmp-dur-time');
      const progressEl = container.querySelector('#wmp-progress');
      const trackEl = container.querySelector('#wmp-track');
      const volSlider = container.querySelector('#wmp-vol-slider');
      const volIcon = container.querySelector('#wmp-vol-icon');
      const playlistPicker = container.querySelector('#wmp-playlist-picker');
      const openBtn = container.querySelector('#wmp-open-btn');
      const fileInput = container.querySelector('#wmp-file-input');

      function fmt(sec) {
        if (!sec || isNaN(sec)) return '00:00';
        const m = Math.floor(sec / 60);
        const s = Math.floor(sec % 60);
        return `${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
      }

      video.addEventListener('timeupdate', () => {
        curTimeEl.textContent = fmt(video.currentTime);
        durTimeEl.textContent = fmt(video.duration);
        const pct = (video.currentTime / (video.duration || 1)) * 100;
        progressEl.style.width = `${pct}%`;
      });

      video.addEventListener('play', () => {
        playBtn.innerHTML = '<i class="bi bi-pause-fill"></i>';
      });

      video.addEventListener('pause', () => {
        playBtn.innerHTML = '<i class="bi bi-play-fill"></i>';
      });

      playBtn.addEventListener('click', () => {
        if (video.paused) {
          video.play();
        } else {
          video.pause();
        }
      });

      stopBtn.addEventListener('click', () => {
        video.pause();
        video.currentTime = 0;
      });

      trackEl.addEventListener('click', (e) => {
        const rect = trackEl.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        video.currentTime = pos * video.duration;
      });

      volSlider.addEventListener('input', (e) => {
        video.volume = e.target.value / 100;
      });

      volIcon.addEventListener('click', () => {
        video.muted = !video.muted;
        volIcon.innerHTML = video.muted ? '<i class="bi bi-volume-mute-fill"></i>' : '<i class="bi bi-volume-up-fill"></i>';
      });

      playlistPicker.addEventListener('change', (e) => {
        const src = e.target.value;
        const optText = e.target.options[e.target.selectedIndex].text;
        _currentSrc = src;
        _currentTitle = optText;
        video.src = src;
        video.play().catch(e => console.log('Autoplay deferred'));
        titleEl.textContent = `Now Playing: ${_currentTitle}`;
      });

      openBtn.addEventListener('click', () => {
        fileInput.click();
      });

      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const fileUrl = URL.createObjectURL(file);
          _currentSrc = fileUrl;
          _currentTitle = file.name;
          video.src = fileUrl;
          video.play().catch(err => console.log('Autoplay deferred'));
          titleEl.textContent = `Now Playing: ${file.name}`;
        }
      });

      video.play().catch(err => {
        console.log('Video autoplay deferred');
      });
    }
  });
})();
