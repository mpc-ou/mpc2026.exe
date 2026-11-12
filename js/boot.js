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

  // The full boot runs on the first visit only; later visits land on the desktop.
  // ?boot=1 forces it, and so does Restart (it sets FORCE_BOOT_KEY before reloading).
  const BOOT_SEEN_KEY = 'mpc-booted';
  const FORCE_BOOT_KEY = 'mpc-force-boot';
  let _booting = false;
  let _timers = [];

  function later(fn, ms) {
    _timers.push(setTimeout(fn, ms));
  }

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
      // Browsers block sound until the visitor clicks, taps or presses a key; skip quietly until then.
      if (_globalVolume === 0 || navigator.userActivation?.hasBeenActive === false) return;
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
      if (_globalVolume === 0 || navigator.userActivation?.hasBeenActive === false) return;
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

  // iOS Safari only lets an <audio> play later if it was first started inside a gesture,
  // so on the first click/tap/key, start every sound muted and stop it again.
  function unlockAudio() {
    Object.values(SoundFX.sounds).forEach(audio => {
      audio.muted = true;
      audio.play().then(() => {
        audio.pause();
        audio.currentTime = 0;
        audio.muted = false;
      }).catch(() => { audio.muted = false; });
    });
  }

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

    document.addEventListener('pointerdown', unlockAudio, { once: true, capture: true });
    document.addEventListener('keydown', unlockAudio, { once: true, capture: true });

    if (_devSkipBtn) {
      _devSkipBtn.addEventListener('click', skipToDesktop);
    }

    // Single User "OU IT" login card
    const userCard = document.getElementById('user-ouit');
    if (userCard) {
      userCard.addEventListener('click', () => {
        if (_booting || _loginEl.classList.contains('hidden')) return;
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

    if (!shouldRunBoot()) {
      skipToDesktop();
      return;
    }

    // Any key, or a tap on a boot screen, jumps straight to the desktop.
    _booting = true;
    document.addEventListener('keydown', onBootInterrupt);
    [_biosEl, _xpBootEl, _loginEl].forEach(el => el?.addEventListener('pointerdown', onBootInterrupt));

    // Start Phase 1: Animated BIOS with line-by-line printing
    startBiosSequence();
  }

  function shouldRunBoot() {
    try {
      if (new URLSearchParams(location.search).get('boot') === '1') return true;
      if (sessionStorage.getItem(FORCE_BOOT_KEY)) {
        sessionStorage.removeItem(FORCE_BOOT_KEY);
        return true;
      }
      if (localStorage.getItem(BOOT_SEEN_KEY)) return false;
      localStorage.setItem(BOOT_SEEN_KEY, '1');
    } catch (e) {
      // Storage blocked (private mode): just run the boot.
    }
    return true;
  }

  // On the BIOS screen a tap/key means "continue" (and lets the browser play sound);
  // on the later screens it skips to the desktop.
  function onBootInterrupt(e) {
    if (!_booting) return;
    if (e.target === _devSkipBtn) return;
    if (!_biosEl.classList.contains('hidden')) continueFromBios();
    else skipToDesktop();
  }

  function continueFromBios() {
    _timers.forEach(clearTimeout);
    _timers = [];
    SoundFX.play('bios_boot');
    SoundFX.beep(950, 0.28);
    startXPBootSequence();
  }

  /**
   * Phase 1: Animated Typewriter BIOS Sequence
   */
  function startBiosSequence() {
    _biosEl.classList.remove('hidden');
    _xpBootEl.classList.add('hidden');
    _loginEl.classList.add('hidden');

    const biosLines = [
      { text: "MPC ROM BIOS (C) 2026 MPClub Inc.", highlight: false, delay: 60 },
      { text: "MPC-ACPI BIOS Version 2.026 - Khoa CNTT Trường ĐH Mở TP.HCM", highlight: false, delay: 60 },
      { text: "CPU: Intel Core-OU IT @ 4.20 GHz", highlight: false, delay: 60 },
      { text: "Memory Test: 2048576KB OK", highlight: true, delay: 60 },
      { text: "Detecting Primary Master   ... MPC_DRIVE_15061990 (19.90 GB)", highlight: false, delay: 60 },
      { text: "Detecting Primary Slave    ... NONE", highlight: false, delay: 60 },
      { text: "Detecting Secondary Master ... CD-ROM MPC_RECRUITMENT_2026", highlight: false, delay: 60 },
      { text: "Initializing Plug and Play Cards...", highlight: false, delay: 60 },
      { text: "Loading MPCrosoft Operating System Kernel...", highlight: true, delay: 60 }
    ];

    const bodyEl = document.getElementById('bios-dynamic-body');
    if (!bodyEl) return;
    bodyEl.innerHTML = '';

    let lineIndex = 0;

    function printNextLine() {
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
        later(printNextLine, item.delay);
      } else {
        // Wait for a key or tap, like "Press any key to continue". That gesture is also
        // what allows the browser to play the boot sounds.
        const promptEl = document.createElement('div');
        promptEl.className = 'bios-line';
        promptEl.style.marginTop = '12px';
        promptEl.innerHTML = `<span class="bios-highlight">${window.I18n ? I18n.t('bios.press_any_key') : 'Press any key or tap the screen to continue . . .'}</span><span class="bios-cursor">_</span>`;
        bodyEl.appendChild(promptEl);
      }
    }

    printNextLine();
  }

  /**
   * Phase 2: Windows XP Boot Screen (MPCrosoft + Logo + 3 Blue Blocks)
   */
  function startXPBootSequence() {
    _biosEl.classList.add('hidden');
    _xpBootEl.classList.remove('hidden');
    _loginEl.classList.add('hidden');

    later(() => {
      startLoginSequence();
    }, 700);
  }

  /**
   * Phase 3: Windows XP Login Screen (User: OU IT)
   */
  function startLoginSequence() {
    _xpBootEl.classList.add('hidden');
    _loginEl.classList.remove('hidden');
    _loginEl.classList.add('fade-in');

    // During the first boot "OU IT" logs itself in; after Log off the visitor clicks.
    if (_booting) {
      const card = document.getElementById('user-ouit');
      later(() => handleUserLogin(card, true), 1000);
    }
  }

  /**
   * User logs into desktop (auto = part of the first boot, so it runs faster)
   */
  function handleUserLogin(cardElement, auto = false) {
    const wait = auto ? 250 : 700;
    const fade = auto ? 250 : 400;
    const statusText = cardElement.querySelector('.user-status');
    if (statusText) {
      statusText.textContent = 'Logging on...';
      statusText.classList.add('user-logging-in');
    }

    // Play real Windows XP logon sound
    SoundFX.play('logon');

    const step = auto ? later : setTimeout;
    step(() => {
      _loginEl.classList.add('fade-out');
      step(() => {
        _loginEl.classList.add('hidden');
        _loginEl.classList.remove('fade-out', 'fade-in');
        resetLoginCard();
        if (auto) endBoot();

        // Play Windows XP startup sound when entering desktop!
        setTimeout(() => {
          SoundFX.play('startup');
        }, 300);
      }, fade);
    }, wait);
  }

  // Put the "OU IT" card back to its ready state, for the next Log off.
  function resetLoginCard() {
    const statusText = document.querySelector('#user-ouit .user-status');
    if (!statusText) return;
    statusText.textContent = window.I18n ? I18n.t('login.status_ready') : 'Click to start session';
    statusText.classList.remove('user-logging-in');
  }

  function endBoot() {
    _booting = false;
    _timers.forEach(clearTimeout);
    _timers = [];
    document.removeEventListener('keydown', onBootInterrupt);
    if (_devSkipBtn) _devSkipBtn.style.display = 'none';
  }

  /**
   * Dev Skip helper
   */
  function skipToDesktop() {
    endBoot();
    if (_biosEl) _biosEl.classList.add('hidden');
    if (_xpBootEl) _xpBootEl.classList.add('hidden');
    if (_loginEl) {
      _loginEl.classList.add('hidden');
      _loginEl.classList.remove('fade-in', 'fade-out');
    }
    resetLoginCard();
    SoundFX.play('startup');
  }

  /**
   * Restart: reload and play the full boot again.
   */
  function restart() {
    try {
      sessionStorage.setItem(FORCE_BOOT_KEY, '1');
    } catch (e) {
      // Storage blocked: the reload will still boot, because nothing was remembered.
    }
    window.location.reload();
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
      _biosEl.addEventListener('click', restart, { once: true });
    }, 2400);
  }

  return {
    init,
    startBiosSequence,
    startXPBootSequence,
    startLoginSequence,
    skipToDesktop,
    restart,
    goToLogin,
    goToShutdown,
    setVolume,
    SoundFX
  };
})();

window.BootManager = BootManager;
