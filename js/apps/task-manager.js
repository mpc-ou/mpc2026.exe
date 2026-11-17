/**
 * ============================================================================
 * Windows Task Manager (taskmgr.exe) - Real XP Task & Process Manager
 * ============================================================================
 * Features:
 * - Applications Tab: Real-time list of open windows, End Task, Switch To, New Task
 * - Processes Tab: List of system & user processes with PID, CPU, Memory
 * - Performance Tab: Live animated CPU & Memory usage graphs with retro green grid
 * - Easter Egg: Ending critical system processes (system, csrss.exe, explorer.exe)
 *   triggers the authentic Windows XP BSOD (Blue Screen of Death) & auto-reboots!
 */

(function () {
  let _activeTab = 'applications';
  let _selectedAppId = null;
  let _selectedProcess = null;
  let _perfInterval = null;

  // Static + dynamic process list
  const SYSTEM_PROCESSES = [
    { name: 'system', pid: 4, cpu: 0, mem: '216 K', critical: true, desc: 'NT Kernel & System' },
    { name: 'csrss.exe', pid: 512, cpu: 0, mem: '1,840 K', critical: true, desc: 'Client Server Runtime Subsystem' },
    { name: 'explorer.exe', pid: 1420, cpu: 1, mem: '14,280 K', critical: true, desc: 'Windows Explorer Shell' },
    { name: 'svchost.exe', pid: 884, cpu: 0, mem: '4,920 K', critical: false, desc: 'Generic Host Process' },
    { name: 'taskmgr.exe', pid: 2026, cpu: 1, mem: '3,112 K', critical: false, desc: 'Windows Task Manager' }
  ];

  function triggerBSOD(processName) {
    // Play error sound if available
    try {
      const audio = new Audio('assets/sounds/error.mp3');
      audio.play().catch(() => {});
    } catch (e) {}

    let bsod = document.getElementById('xp-bsod-screen');
    if (!bsod) {
      bsod = document.createElement('div');
      bsod.id = 'xp-bsod-screen';
      bsod.className = 'xp-bsod-overlay';
      document.body.appendChild(bsod);
    }

    const stopCode = processName === 'system' ? '0x000000F4' : (processName === 'csrss.exe' ? '0x000000C5' : '0x0000007A');

    bsod.innerHTML = `
      <div class="bsod-content">
        <p>A problem has been detected and Windows has been shut down to prevent damage to your computer.</p>
        <br>
        <p><strong>CRITICAL_PROCESS_DIED: ${processName.toUpperCase()}</strong></p>
        <br>
        <p>If this is the first time you've seen this stop error screen, restart your computer. If this screen appears again, follow these steps:</p>
        <br>
        <p>Check to make sure any new hardware or software is properly installed. If this is a new installation, ask your hardware or software manufacturer for any Windows updates you might need.</p>
        <br>
        <p>If problems continue, disable or remove any newly installed hardware or software. Disable BIOS memory options such as caching or shadowing. If you need to use Safe Mode to remove or disable components, restart your computer, press F8 to select Advanced Startup Options, and then select Safe Mode.</p>
        <br>
        <p>Technical information:</p>
        <p>*** STOP: ${stopCode} (0x00000003, 0x86395DA0, 0x86395F14, 0x805C76CC)</p>
        <p>*** ${processName} - Address 805C76CC base at 804D7000, DateStamp 41107eb0</p>
        <br>
        <p>Beginning dump of physical memory...</p>
        <p>Physical memory dump complete.</p>
        <p style="color: #ffff00; font-weight: bold; margin-top: 15px;">
          Hệ thống sẽ tự động khởi động lại sau <span id="bsod-countdown">5</span> giây...
        </p>
      </div>
    `;

    bsod.style.display = 'block';

    let countdown = 5;
    let rebooted = false;

    function doReboot() {
      if (rebooted) return;
      rebooted = true;
      clearInterval(timer);
      document.removeEventListener('keydown', onAnyKey);
      bsod.removeEventListener('click', doReboot);
      bsod.style.display = 'none';
      window.location.reload();
    }

    function onAnyKey() {
      doReboot();
    }

    document.addEventListener('keydown', onAnyKey);
    bsod.addEventListener('click', doReboot);

    const timer = setInterval(() => {
      countdown--;
      const countEl = document.getElementById('bsod-countdown');
      if (countEl) countEl.textContent = countdown;
      if (countdown <= 0) {
        doReboot();
      }
    }, 1000);
  }

  AppRegistry.register({
    id: 'taskmgr.exe',
    title: 'Windows Task Manager',
    desktopLabel: 'Task Manager',
    iconSvg: '<i class="bi bi-cpu-fill" style="color: #00aa00; font-size: 24px;"></i>',
    width: 480,
    height: 440,
    showOnDesktop: false, // Opened via taskbar context menu or Start menu
    showInStartMenu: true,
    noMenubar: false,
    noStatusbar: true,
    onClose: () => {
      if (_perfInterval) {
        clearInterval(_perfInterval);
        _perfInterval = null;
      }
    },
    render: (container, win) => {
      container.style.overflow = 'hidden';
      container.style.display = 'flex';
      container.style.flexDirection = 'column';
      container.style.height = '100%';

      function renderApp() {
        container.innerHTML = `
          <div class="taskmgr-wrapper">
            <!-- Tabs Bar -->
            <div class="taskmgr-tabs-bar">
              <button class="taskmgr-tab-btn ${_activeTab === 'applications' ? 'active' : ''}" data-tab="applications">
                ${window.I18n && I18n.getLanguage() === 'vi' ? 'Ứng dụng' : 'Applications'}
              </button>
              <button class="taskmgr-tab-btn ${_activeTab === 'processes' ? 'active' : ''}" data-tab="processes">
                ${window.I18n && I18n.getLanguage() === 'vi' ? 'Tiến trình' : 'Processes'}
              </button>
              <button class="taskmgr-tab-btn ${_activeTab === 'performance' ? 'active' : ''}" data-tab="performance">
                ${window.I18n && I18n.getLanguage() === 'vi' ? 'Hiệu suất' : 'Performance'}
              </button>
            </div>

            <!-- Tab Content Body -->
            <div class="taskmgr-body-panel" id="taskmgr-panel-content">
              <!-- Dynamically populated -->
            </div>

            <!-- Taskmgr Status Footer -->
            <div class="taskmgr-statusbar">
              <span id="tm-stat-procs">Processes: 18</span>
              <span id="tm-stat-cpu">CPU Usage: 4%</span>
              <span id="tm-stat-mem">Commit Charge: 184M / 2048M</span>
            </div>
          </div>
        `;

        // Tab click handling
        container.querySelectorAll('.taskmgr-tab-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            _activeTab = btn.dataset.tab;
            renderApp();
          });
        });

        const panel = container.querySelector('#taskmgr-panel-content');
        if (_activeTab === 'applications') {
          renderApplicationsTab(panel);
        } else if (_activeTab === 'processes') {
          renderProcessesTab(panel);
        } else if (_activeTab === 'performance') {
          renderPerformanceTab(panel);
        }
      }

      function renderApplicationsTab(panel) {
        const openWindows = WindowManager.getAll();
        panel.innerHTML = `
          <div class="tm-tab-view">
            <div class="tm-table-header">
              <div class="tm-col col-task">${window.I18n && I18n.getLanguage() === 'vi' ? 'Tác vụ' : 'Task'}</div>
              <div class="tm-col col-status">${window.I18n && I18n.getLanguage() === 'vi' ? 'Trạng thái' : 'Status'}</div>
            </div>
            <div class="tm-list-box" id="tm-apps-list">
              ${openWindows.length === 0 ? `<div class="tm-empty-row">${window.I18n && I18n.getLanguage() === 'vi' ? 'Không có cửa sổ nào đang mở' : 'No active applications'}</div>` : ''}
              ${openWindows.map(w => `
                <div class="tm-row-item ${w.appId === _selectedAppId ? 'selected' : ''}" data-app-id="${w.appId}">
                  <div class="tm-col col-task">
                    ${w.iconUrl ? `<img src="${w.iconUrl}" class="tm-icon-img" />` : (w.iconSvg ? w.iconSvg : '📁')}
                    <span>${w.title}</span>
                  </div>
                  <div class="tm-col col-status">
                    ${w.isMinimized ? (window.I18n && I18n.getLanguage() === 'vi' ? 'Thu nhỏ' : 'Minimized') : (window.I18n && I18n.getLanguage() === 'vi' ? 'Đang chạy' : 'Running')}
                  </div>
                </div>
              `).join('')}
            </div>
            <div class="tm-btn-actions">
              <button class="xp-dialog-btn" id="tm-btn-endtask" ${_selectedAppId ? '' : 'disabled'}>
                ${window.I18n && I18n.getLanguage() === 'vi' ? 'Đóng tác vụ' : 'End Task'}
              </button>
              <button class="xp-dialog-btn" id="tm-btn-switchto" ${_selectedAppId ? '' : 'disabled'}>
                ${window.I18n && I18n.getLanguage() === 'vi' ? 'Chuyển đến' : 'Switch To'}
              </button>
              <button class="xp-dialog-btn" id="tm-btn-newtask">
                ${window.I18n && I18n.getLanguage() === 'vi' ? 'Tác vụ mới...' : 'New Task...'}
              </button>
            </div>
          </div>
        `;

        // Row clicks
        panel.querySelectorAll('.tm-row-item').forEach(row => {
          row.addEventListener('click', () => {
            _selectedAppId = row.dataset.appId;
            renderApplicationsTab(panel);
          });
          row.addEventListener('dblclick', () => {
            WindowManager.open(row.dataset.appId);
          });
        });

        panel.querySelector('#tm-btn-endtask')?.addEventListener('click', () => {
          if (_selectedAppId) {
            WindowManager.close(_selectedAppId);
            _selectedAppId = null;
            renderApplicationsTab(panel);
          }
        });

        panel.querySelector('#tm-btn-switchto')?.addEventListener('click', () => {
          if (_selectedAppId) {
            const winInst = WindowManager.get(_selectedAppId);
            if (winInst) {
              if (winInst.isMinimized) winInst.restore();
              else winInst.bringToFront();
            }
          }
        });

        panel.querySelector('#tm-btn-newtask')?.addEventListener('click', async () => {
          const isVi = window.I18n && I18n.getLanguage() === 'vi';
          const appId = await XPDialog.prompt(
            isVi ? 'Nhập tên ứng dụng hoặc file cần mở (ví dụ: iexplore.exe, wmplayer.exe, mspaint.exe, cmd.exe):' : 'Type the name of a program or file to open:',
            'iexplore.exe',
            isVi ? 'Tạo tác vụ mới' : 'Create New Task'
          );
          if (appId) WindowManager.open(appId.trim());
        });
      }

      function renderProcessesTab(panel) {
        // Build processes list including active windows
        const activeWins = WindowManager.getAll();
        const winProcesses = activeWins.map((w, idx) => ({
          name: w.appId.endsWith('.exe') ? w.appId : `${w.appId.toLowerCase()}.exe`,
          pid: 3000 + idx * 4,
          cpu: Math.floor(Math.random() * 3),
          mem: `${(Math.floor(Math.random() * 15000) + 4000).toLocaleString()} K`,
          critical: false,
          appId: w.appId
        }));

        const allProcs = [...SYSTEM_PROCESSES, ...winProcesses];

        panel.innerHTML = `
          <div class="tm-tab-view">
            <div class="tm-table-header">
              <div class="tm-col col-proc-name">Image Name</div>
              <div class="tm-col col-proc-pid">PID</div>
              <div class="tm-col col-proc-cpu">CPU</div>
              <div class="tm-col col-proc-mem">Mem Usage</div>
            </div>
            <div class="tm-list-box" id="tm-procs-list">
              ${allProcs.map(p => `
                <div class="tm-row-item ${p.name === _selectedProcess ? 'selected' : ''}" data-proc="${p.name}" data-critical="${!!p.critical}" data-app-id="${p.appId || ''}">
                  <div class="tm-col col-proc-name">
                    ${p.critical ? '<i class="bi bi-shield-fill-exclamation" style="color:#d13438;margin-right:4px;"></i>' : '<i class="bi bi-gear" style="color:#666;margin-right:4px;"></i>'}
                    <span>${p.name}</span>
                  </div>
                  <div class="tm-col col-proc-pid">${p.pid}</div>
                  <div class="tm-col col-proc-cpu">${p.cpu}</div>
                  <div class="tm-col col-proc-mem">${p.mem}</div>
                </div>
              `).join('')}
            </div>
            <div class="tm-btn-actions" style="justify-content: flex-end;">
              <button class="xp-dialog-btn" id="tm-btn-endprocess" ${_selectedProcess ? '' : 'disabled'}>
                ${window.I18n && I18n.getLanguage() === 'vi' ? 'Dừng tiến trình' : 'End Process'}
              </button>
            </div>
          </div>
        `;

        panel.querySelectorAll('.tm-row-item').forEach(row => {
          row.addEventListener('click', () => {
            _selectedProcess = row.dataset.proc;
            renderProcessesTab(panel);
          });
        });

        panel.querySelector('#tm-btn-endprocess')?.addEventListener('click', async () => {
          if (!_selectedProcess) return;
          const proc = allProcs.find(p => p.name === _selectedProcess);
          if (!proc) return;

          const isVi = window.I18n && I18n.getLanguage() === 'vi';
          const confirmMsg = isVi 
            ? `CẢNH BÁO: Dừng tiến trình hệ thống "${proc.name}" có thể gây mất dữ liệu và khiến hệ thống không ổn định.\nBạn có chắc chắn muốn dừng không?`
            : `WARNING: Terminating a process can cause undesirable results including loss of data and system instability.\nAre you sure you want to terminate "${proc.name}"?`;

          const ok = await XPDialog.confirm(confirmMsg, 'Task Manager Warning', {
            icon: 'warning',
            okText: isVi ? 'Có (Yes)' : 'Yes',
            cancelText: isVi ? 'Không (No)' : 'No'
          });

          if (ok) {
            if (proc.critical) {
              // Trigger BSOD Easter Egg!
              triggerBSOD(proc.name);
            } else if (proc.appId) {
              WindowManager.close(proc.appId);
              _selectedProcess = null;
              renderProcessesTab(panel);
            } else {
              await XPDialog.alert(
                isVi ? `Đã dừng tiến trình ${proc.name}` : `Terminated process ${proc.name}`,
                'Windows Task Manager',
                { icon: 'info' }
              );
              _selectedProcess = null;
              renderProcessesTab(panel);
            }
          }
        });
      }

      function renderPerformanceTab(panel) {
        panel.innerHTML = `
          <div class="tm-perf-view">
            <div class="tm-perf-grid">
              <!-- CPU Box -->
              <div class="tm-perf-box">
                <div class="tm-perf-title">CPU Usage</div>
                <div class="tm-gauge-row">
                  <div class="tm-cpu-bar-container">
                    <div class="tm-cpu-bar-fill" id="tm-cpu-fill" style="height: 12%;"></div>
                  </div>
                  <div class="tm-cpu-val" id="tm-cpu-pct">12 %</div>
                </div>
              </div>

              <!-- CPU History Graph -->
              <div class="tm-perf-box" style="flex: 2;">
                <div class="tm-perf-title">CPU Usage History</div>
                <canvas id="tm-cpu-canvas" width="220" height="75" class="tm-graph-canvas"></canvas>
              </div>
            </div>

            <div class="tm-perf-grid" style="margin-top: 8px;">
              <!-- PF Usage Box -->
              <div class="tm-perf-box">
                <div class="tm-perf-title">PF Usage</div>
                <div class="tm-gauge-row">
                  <div class="tm-cpu-bar-container">
                    <div class="tm-cpu-bar-fill" id="tm-mem-fill" style="height: 28%;"></div>
                  </div>
                  <div class="tm-cpu-val" id="tm-mem-mb">184 MB</div>
                </div>
              </div>

              <!-- Memory History Graph -->
              <div class="tm-perf-box" style="flex: 2;">
                <div class="tm-perf-title">Page File Usage History</div>
                <canvas id="tm-mem-canvas" width="220" height="75" class="tm-graph-canvas"></canvas>
              </div>
            </div>

            <!-- Stats table -->
            <div class="tm-stats-row">
              <div class="tm-stat-col">
                <fieldset class="tm-fieldset">
                  <legend>Totals</legend>
                  <div>Handles: <b>5,420</b></div>
                  <div>Threads: <b>312</b></div>
                  <div>Processes: <b>18</b></div>
                </fieldset>
              </div>
              <div class="tm-stat-col">
                <fieldset class="tm-fieldset">
                  <legend>Physical Memory (K)</legend>
                  <div>Total: <b>2,097,152</b></div>
                  <div>Available: <b>1,842,912</b></div>
                  <div>System Cache: <b>412,180</b></div>
                </fieldset>
              </div>
            </div>
          </div>
        `;

        const cpuCanvas = panel.querySelector('#tm-cpu-canvas');
        const memCanvas = panel.querySelector('#tm-mem-canvas');
        if (!cpuCanvas || !memCanvas) return;

        const cpuCtx = cpuCanvas.getContext('2d');
        const memCtx = memCanvas.getContext('2d');
        const cpuHistory = new Array(30).fill(10);
        const memHistory = new Array(30).fill(25);

        function drawGraph(ctx, history, color = '#00ff00') {
          ctx.fillStyle = '#000000';
          ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

          // Grid lines
          ctx.strokeStyle = '#003300';
          ctx.lineWidth = 1;
          for (let x = 0; x < ctx.canvas.width; x += 15) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, ctx.canvas.height);
            ctx.stroke();
          }
          for (let y = 0; y < ctx.canvas.height; y += 15) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(ctx.canvas.width, y);
            ctx.stroke();
          }

          // Waveform
          ctx.strokeStyle = color;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          const step = ctx.canvas.width / (history.length - 1);
          history.forEach((val, i) => {
            const px = i * step;
            const py = ctx.canvas.height - (val / 100) * ctx.canvas.height;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          });
          ctx.stroke();
        }

        if (_perfInterval) clearInterval(_perfInterval);
        _perfInterval = setInterval(() => {
          if (!document.getElementById('taskmgr-panel-content')) {
            clearInterval(_perfInterval);
            return;
          }
          const nextCpu = Math.floor(Math.random() * 20) + 3;
          const nextMem = 25 + Math.floor(Math.random() * 5);
          cpuHistory.shift();
          cpuHistory.push(nextCpu);
          memHistory.shift();
          memHistory.push(nextMem);

          drawGraph(cpuCtx, cpuHistory, '#00ff00');
          drawGraph(memCtx, memHistory, '#00d000');

          const cpuFill = panel.querySelector('#tm-cpu-fill');
          const cpuPct = panel.querySelector('#tm-cpu-pct');
          if (cpuFill && cpuPct) {
            cpuFill.style.height = `${nextCpu}%`;
            cpuPct.textContent = `${nextCpu} %`;
          }

          const memFill = panel.querySelector('#tm-mem-fill');
          const memMb = panel.querySelector('#tm-mem-mb');
          if (memFill && memMb) {
            memFill.style.height = `${nextMem}%`;
            memMb.textContent = `${Math.round(nextMem * 7.2)} MB`;
          }
        }, 1000);

        drawGraph(cpuCtx, cpuHistory, '#00ff00');
        drawGraph(memCtx, memHistory, '#00d000');
      }

      renderApp();

      // Listen for window changes to update list live
      WindowManager.onChange(() => {
        if (_activeTab === 'applications') {
          const panel = container.querySelector('#taskmgr-panel-content');
          if (panel) renderApplicationsTab(panel);
        }
      });
    }
  });

  window.Taskmgr = { triggerBSOD };
})();
