/**
 * ============================================================================
 * BootManager - Animated BIOS, XP Bootscreen, OU IT Login & Real Sound FX
 * ============================================================================
 */

const BootManager = (function () {
  let _biosEl = null;
  let _xpBootEl = null;
  let _loginEl = null;
  let _desktopEl = null;
  let _devSkipBtn = null;
  let _globalVolume = 0.8;

  // Real Audio Controller with user's assets/sounds
  const SoundFX = {
    sounds: {
      bios_boot: new Audio('assets/sounds/bios_boot.wav'),
      startup: new Audio('assets/sounds/startup.mp3'),
      logon: new Audio('assets/sounds/logon.mp3'),
      logoff: new Audio('assets/sounds/logoff.mp3'),
      shutdown: new Audio('assets/sounds/shut-down.mp3'),
      error: new Audio('assets/sounds/error.mp3')
    },

    play(name) {
      try {
        const sound = this.sounds[name];
        if (sound) {
          sound.currentTime = 0;
          sound.volume = _globalVolume;
          sound.play().catch(e => {
            console.warn(`[Audio Autoplay] Browser prevented sound '${name}'. User interaction needed.`);
          });
        }
      } catch (err) {
        console.error('Sound play error:', err);
      }
    },

    // 8-bit synthetic beep backup using Web Audio API
    beep(freq = 920, duration = 0.25) {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(_globalVolume * 0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + duration);
      } catch (e) {
        // audio context not yet active
      }
    }
  };

  function setVolume(val) {
    _globalVolume = Math.max(0, Math.min(1, val));
    Object.values(SoundFX.sounds).forEach(audio => {
      audio.volume = _globalVolume;
    });
  }

  function init() {
    _biosEl = document.getElementById('screen-bios');
    _xpBootEl = document.getElementById('screen-xp-boot');
    _loginEl = document.getElementById('screen-login');
    _desktopEl = document.getElementById('desktop');
    _devSkipBtn = document.getElementById('dev-skip-btn');

    if (_devSkipBtn) {
      _devSkipBtn.addEventListener('click', skipToDesktop);
    }

    // Single User "OU IT" login card
    const userCard = document.getElementById('user-ouit');
    if (userCard) {
      userCard.addEventListener('click', () => {
        handleUserLogin(userCard);
      });
    }

    // Power button on Login screen
    const loginPowerBtn = document.getElementById('login-power-btn');
    if (loginPowerBtn) {
      loginPowerBtn.addEventListener('click', () => {
        Taskbar.showShutdownModal();
      });
    }

    // Start Phase 1: Animated BIOS with line-by-line printing
    startBiosSequence();
  }

  /**
   * Phase 1: Animated Typewriter BIOS Sequence
   */
  function startBiosSequence() {
    _biosEl.classList.remove('hidden');
    _xpBootEl.classList.add('hidden');
    _loginEl.classList.add('hidden');

    // Play 8-bit BIOS boot sound
    SoundFX.play('bios_boot');
    SoundFX.beep(950, 0.28);

    const biosLines = [
      { text: "MPC ROM BIOS (C) 2026 MPClub Inc.", highlight: false, delay: 100 },
      { text: "MPC-ACPI BIOS Version 2.026 - Khoa CNTT Trường ĐH Mở TP.HCM", highlight: false, delay: 150 },
      { text: "CPU: Intel Core-OU IT @ 4.20 GHz", highlight: false, delay: 200 },
      { text: "Memory Test: 2048576KB OK", highlight: true, delay: 250 },
      { text: "Detecting Primary Master   ... MPC_DRIVE_15061990 (19.90 GB)", highlight: false, delay: 300 },
      { text: "Detecting Primary Slave    ... NONE", highlight: false, delay: 200 },
      { text: "Detecting Secondary Master ... CD-ROM MPC_RECRUITMENT_2026", highlight: false, delay: 250 },
      { text: "Initializing Plug and Play Cards...", highlight: false, delay: 300 },
      { text: "Loading MPCrosoft Operating System Kernel...", highlight: true, delay: 400 }
    ];

    const bodyEl = document.getElementById('bios-dynamic-body');
    if (!bodyEl) return;
    bodyEl.innerHTML = '';

    let lineIndex = 0;
    let isSkipped = false;

    function printNextLine() {
      if (isSkipped) return;
      if (lineIndex < biosLines.length) {
        const item = biosLines[lineIndex];
        const lineEl = document.createElement('div');
        lineEl.className = 'bios-line';
        if (item.highlight) {
          lineEl.innerHTML = `<span class="bios-highlight">${item.text}</span>`;
        } else {
          lineEl.textContent = item.text;
        }
        bodyEl.appendChild(lineEl);
        lineIndex++;
        setTimeout(printNextLine, item.delay);
      } else {
        // Cursor blink then start XP bootscreen
        const cursorEl = document.createElement('span');
        cursorEl.className = 'bios-cursor';
        cursorEl.textContent = '_';
        bodyEl.appendChild(cursorEl);

        setTimeout(() => {
          if (!isSkipped) {
            isSkipped = true;
            startXPBootSequence();
          }
        }, 1200);
      }
    }

    printNextLine();

    // Click anywhere on BIOS screen to immediately skip to XP Boot
    _biosEl.addEventListener('click', () => {
      if (!isSkipped) {
        isSkipped = true;
        startXPBootSequence();
      }
    }, { once: true });
  }

  /**
   * Phase 2: Windows XP Boot Screen (MPCrosoft + Logo + 3 Blue Blocks)
   */
  function startXPBootSequence() {
    _biosEl.classList.add('hidden');
    _xpBootEl.classList.remove('hidden');
    _loginEl.classList.add('hidden');

    // XP boot loading animation lasts 2.8 seconds
    setTimeout(() => {
      startLoginSequence();
    }, 2800);
  }

  /**
   * Phase 3: Windows XP Login Screen (User: OU IT)
   */
  function startLoginSequence() {
    _xpBootEl.classList.add('hidden');
    _loginEl.classList.remove('hidden');
    _loginEl.classList.add('fade-in');
  }

  /**
   * User logs into desktop
   */
  function handleUserLogin(cardElement) {
    const statusText = cardElement.querySelector('.user-status');
    if (statusText) {
      statusText.textContent = 'Logging on...';
      statusText.classList.add('user-logging-in');
    }

    // Play real Windows XP logon sound
    SoundFX.play('logon');

    setTimeout(() => {
      _loginEl.classList.add('fade-out');
      setTimeout(() => {
        _loginEl.classList.add('hidden');
        _loginEl.classList.remove('fade-out', 'fade-in');
        if (statusText) {
          statusText.textContent = 'Click to start session';
          statusText.classList.remove('user-logging-in');
        }
        if (_devSkipBtn) {
          _devSkipBtn.style.display = 'none';
        }

        // Play Windows XP startup sound when entering desktop!
        setTimeout(() => {
          SoundFX.play('startup');
        }, 300);
      }, 400);
    }, 700);
  }

  /**
   * Dev Skip helper
   */
  function skipToDesktop() {
    if (_biosEl) _biosEl.classList.add('hidden');
    if (_xpBootEl) _xpBootEl.classList.add('hidden');
    if (_loginEl) _loginEl.classList.add('hidden');
    if (_devSkipBtn) _devSkipBtn.style.display = 'none';
    SoundFX.play('startup');
  }

  /**
   * Log off (Return to Login Screen)
   */
  function goToLogin() {
    SoundFX.play('logoff');
    _loginEl.classList.remove('hidden');
    _loginEl.classList.add('fade-in');
  }

  /**
   * Shutdown (Play shutdown sound -> shutting down animation -> black safe screen)
   */
  function goToShutdown() {
    SoundFX.play('shutdown');

    // Fullscreen Shutting down screen
    const shutdownScreen = document.createElement('div');
    shutdownScreen.className = 'xp-shutting-down-screen';
    shutdownScreen.innerHTML = `
      <div class="xp-shutting-down-content">
        <img src="assets/icons/logo.png" style="width: 56px; height: 56px; margin-bottom: 12px; object-fit: contain;" alt="" />
        <div style="font-size: 24px; font-weight: bold; color: #fff; margin-bottom: 6px;">
          MPCrosoft Windows <span style="color: #ff6600; font-style: italic;">xp</span>
        </div>
        <div style="font-size: 14px; color: #a4c2f4;">${window.I18n ? I18n.t('shutdown.closing') : 'MPCrosoft Windows is shutting down...'}</div>
      </div>
    `;
    document.body.appendChild(shutdownScreen);

    setTimeout(() => {
      shutdownScreen.remove();
      _loginEl.classList.add('hidden');
      _biosEl.classList.remove('hidden');
      const safeText = window.I18n ? I18n.t('shutdown.safe') : 'It is now safe to turn off your computer.';
      const rebootHint = window.I18n ? I18n.t('shutdown.reboot_hint') : '(Click anywhere to restart MPCrosoft Windows XP)';
      _biosEl.innerHTML = `
        <div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #ff6600; font-family: monospace; font-size: 20px; text-shadow: 0 0 10px #ff3300;">
          <p style="margin-bottom: 14px; font-weight: bold;">${safeText}</p>
          <p style="font-size: 13px; color: #888;">${rebootHint}</p>
        </div>
      `;
      _biosEl.addEventListener('click', () => {
        window.location.reload();
      }, { once: true });
    }, 2400);
  }

  return {
    init,
    startBiosSequence,
    startXPBootSequence,
    startLoginSequence,
    skipToDesktop,
    goToLogin,
    goToShutdown,
    setVolume,
    SoundFX
  };
})();

window.BootManager = BootManager;
