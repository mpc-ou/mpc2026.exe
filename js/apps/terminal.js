/**
 * ============================================================================
 * Terminal (Command Prompt / cmd.exe)
 * ============================================================================
 * Interactive retro terminal with Virtual File System exploration!
 */

(function () {
  let currentDir = 'C:\\Documents and Settings\\OU_IT';

  AppRegistry.register({
    id: 'cmd.exe',
    title: 'Command Prompt',
    desktopLabel: 'cmd.exe',
    iconUrl: 'assets/icons/cmd.svg',
    width: 640,
    height: 400,
    showOnDesktop: false,
    showInStartMenu: false, // already in the Start menu's right column
    render: (container, win) => {
      container.innerHTML = `
        <div class="terminal-container" id="terminal-screen-${win.appId}">
          <div class="terminal-output" id="term-output">
MPCrosoft(R) Windows XP [Version 5.1.2600]
(C) Copyright 1985-2001 MPCrosoft Corp.
Câu lạc bộ Lập trình trên thiết bị di động (MPClub)

Type 'help' to view available commands.
          </div>
          <div class="terminal-input-row">
            <span class="terminal-prompt" id="term-prompt">${currentDir}&gt;</span>
            <input type="text" class="terminal-input" id="term-input" spellcheck="false" autocomplete="off" />
          </div>
        </div>
      `;

      const outputEl = container.querySelector('#term-output');
      const inputEl = container.querySelector('#term-input');
      const promptEl = container.querySelector('#term-prompt');
      const terminalScreen = container.querySelector('.terminal-container');

      const history = [];
      let historyIdx = -1;

      // Focus input when clicking anywhere in terminal
      terminalScreen.addEventListener('click', () => {
        inputEl.focus();
      });

      function print(text, isError = false) {
        const div = document.createElement('div');
        div.className = isError ? 'term-line term-error' : 'term-line';
        div.textContent = text;
        outputEl.appendChild(div);
        terminalScreen.scrollTop = terminalScreen.scrollHeight;
      }

      function executeCommand(rawCmd) {
        const trimmed = rawCmd.trim();
        if (!trimmed) return;

        history.push(trimmed);
        historyIdx = history.length;

        // Print command with prompt
        print(`${currentDir}> ${trimmed}`);

        const tokens = trimmed.split(/\s+/);
        const cmd = tokens[0].toLowerCase();
        const args = tokens.slice(1);

        switch (cmd) {
          case 'help':
            print(`Available commands in MPC Command Processor:`);
            print(`  HELP        Provides help information for commands.`);
            print(`  ABOUT       Displays official MPClub identity & history.`);
            print(`  TEAMS       Displays the 4 departments & 2026 Executive Board.`);
            print(`  WEBDESIGN   Displays Web Design 2025 & 2026 competition results.`);
            print(`  PROJECTS    Displays MPC Extension & tech products.`);
            print(`  AWARDS      Displays Hall of Fame & academic achievements.`);
            print(`  DIR         Displays a list of files and subdirectories.`);
            print(`  CD          Displays the name of or changes the current directory.`);
            print(`  TYPE / CAT  Displays the contents of a text file.`);
            print(`  CLS         Clears the terminal screen.`);
            print(`  TREE        Graphically displays the directory structure.`);
            print(`  WHOAMI      Displays current user information.`);
            print(`  VER         Displays the MPCrosoft Windows version.`);
            print(`  DATE        Displays the current system date.`);
            print(`  EXIT        Quits the CMD.EXE program.`);
            break;

          case 'about':
            print(`=======================================================`);
            print(`CÂU LẠC BỘ LẬP TRÌNH TRÊN THIẾT BỊ DI ĐỘNG (MPC / MPClub)`);
            print(`• Tên tiếng Anh: Mobile Programming Club`);
            print(`• Thành lập: 24/12/2015 (Kỷ niệm 10 năm: 24/12/2025)`);
            print(`• Đơn vị: Khoa Công nghệ Thông tin – Trường ĐH Mở TP.HCM`);
            print(`• Slogan: "Ở đâu có bug, ở đó có MPC!"`);
            print(`• Website: https://www.mpclub.dev`);
            print(`• Email: it.mpclub@ou.edu.vn`);
            print(`=======================================================`);
            break;

          case 'teams':
            print(`[CƠ CẤU 4 BỘ PHẬN & BAN CHỦ NHIỆM 2025 – 2026]`);
            print(`1. Ban Chủ nhiệm: Nguyễn Thị Kim Oanh (Chủ nhiệm), Phạm Đức Thắng & Cao Đỗ Huyền Trân (Phó CN)`);
            print(`2. Ban Lập trình: Nguyễn Thanh Triều (Trưởng ban)`);
            print(`3. Ban Truyền thông: Lê Nguyễn Vân Anh (Trưởng ban)`);
            print(`4. Ban Hậu cần: Trần Võ Thị Thu Uyên (Trưởng ban)`);
            break;

          case 'webdesign':
            print(`[WEB DESIGN 2026 – CHỦ ĐỀ: WHITE LABEL FOR BUSINESSES (18/10/2026)]`);
            print(`🥇 Giải Nhất: Đội ClauKi (Local Travel Services Portal)`);
            print(`🥈 Giải Nhì:  Đội 404 Not Found (Battery Device Recycling Solution)`);
            print(`🥉 Giải Ba:   Đội TopBotDev (WWL System for Real Estate)`);
            print(`✨ Vào vòng triển khai: VieCodie, KTV, CHẠY DEADLINE CHO VUI`);
            print(`[WEB DESIGN 2025 – KỶ NIỆM 35 NĂM TRƯỜNG ĐH MỞ TP.HCM]: NTK, THETHREE, Stack Lifo, Future`);
            break;

          case 'projects':
            print(`[DỰ ÁN TIÊU BIỂU: MPC EXTENSION (03/2024 – HIỆN TẠI)]`);
            print(`• Loại: Browser Extension cho hệ thống sis.ou.edu.vn (Trường ĐH Mở TP.HCM)`);
            print(`• Công nghệ: WXT, React, TypeScript`);
            print(`• Tính năng: Xem kết quả học tập, Tính GPA, Lập kế hoạch điểm, Lịch học, Lịch thi, Học phí`);
            print(`• Đội ngũ: Trịnh Quốc Đạt, Phan Thị Khánh An, Phan Lê Hồ, Tsàn Quý Thành (+4 thành viên)`);
            break;

          case 'awards':
            print(`[BẢNG VÀNG HALL OF FAME & THÀNH TÍCH HỌC THUẬT]`);
            print(`• Giải pháp phần mềm 2025 (20/10/2025): Nguyễn Thị Kim Oanh (Giải Ba Olympic), Phan Gia Huy (Giải Ba Đối kháng - NPJF)`);
            print(`• Giải pháp phần mềm 2024 (07/11/2024): Phan Gia Huy (Giải Ba - DFBP), Lê Gia Huy & Nguyễn Thái Bảo (Giải KK), Trần An Tiến, Võ Quốc Huy, Trương Bùi Anh Tuấn (Giải Thuyết trình ấn tượng)`);
            print(`• Olympic Tin học SV Việt Nam lần thứ 31 (2022): Tsàn Quý Thành (Giải Khuyến khích Khối Chuyên tin)`);
            break;

          case 'cls':
            outputEl.innerHTML = '';
            break;

          case 'ver':
            print(`MPCrosoft Windows XP [Version 5.1.2600.2026]`);
            print(`Custom Edition by Mobile Programming Club (MPC) – Khoa CNTT – Trường ĐH Mở TP.HCM`);
            break;

          case 'whoami':
            print(`OU-IT\\Administrator`);
            print(`Club: Câu lạc bộ Lập trình trên thiết bị di động (MPC) – Trường ĐH Mở TP.HCM`);
            print(`Slogan: "Ở đâu có bug, ở đó có MPC!"`);
            break;

          case 'date':
            print(`Current date is: ${new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`);
            break;

          case 'secret':
            print(`=======================================================`);
            print(`CÂU LẠC BỘ LẬP TRÌNH TRÊN THIẾT BỊ DI ĐỘNG (MPCLUB)`);
            print(`• Thành lập: 24/12/2015 – Khoa CNTT, Trường ĐH Mở TP.HCM`);
            print(`• Slogan: "Ở đâu có bug, ở đó có MPC!"`);
            print(`• Trang chủ chính thức: https://www.mpclub.dev`);
            print(`• Ứng tuyển thành viên mới qua shortcut JOIN_MPC.exe trên Desktop.`);
            print(`=======================================================`);
            break;

          case 'dir':
            const items = VFS.listDir(currentDir);
            if (!items) {
              print(`The system cannot find the path specified.`, true);
              break;
            }
            print(` Volume in drive C is MPC_SYSTEM`);
            print(` Volume Serial Number is 2412-2015`);
            print(` Directory of ${currentDir}\n`);
            print(`24/12/2015  08:00 AM    <DIR>          .`);
            print(`24/12/2015  08:00 AM    <DIR>          ..`);

            let fileCount = 0;
            let dirCount = 2;
            let totalBytes = 0;

            items.forEach(item => {
              const isDir = item.type === 'dir';
              if (isDir) dirCount++;
              else {
                fileCount++;
                totalBytes += item.size;
              }
              const typeStr = isDir ? '<DIR>         ' : String(item.size).padStart(14, ' ');
              print(`12/11/2026  02:30 PM    ${typeStr} ${item.name}`);
            });

            print(`              ${fileCount} File(s)    ${totalBytes.toLocaleString()} bytes`);
            print(`              ${dirCount} Dir(s)     26,971,947,008 bytes free (25.12 GB)`);
            break;

          case 'cd':
            if (args.length === 0) {
              print(currentDir);
              break;
            }
            const target = args.join(' ');
            let targetPath = '';
            if (target === '..') {
              const parent = currentDir.substring(0, currentDir.lastIndexOf('\\'));
              targetPath = parent && parent !== 'C:' ? parent : 'C:\\';
            } else if (target === '\\' || target === '/') {
              targetPath = 'C:\\';
            } else if (target.startsWith('C:') || target.startsWith('c:')) {
              targetPath = VFS.normalizePath(target);
            } else {
              targetPath = VFS.normalizePath(currentDir + '\\' + target);
            }

            const node = VFS.getNode(targetPath);
            if (node && node.type === 'dir') {
              currentDir = targetPath;
              promptEl.textContent = `${currentDir}>`;
            } else {
              print(`The system cannot find the path specified: ${target}`, true);
            }
            break;

          case 'type':
          case 'cat':
            if (args.length === 0) {
              print(`The syntax of the command is incorrect. Usage: TYPE <filename>`, true);
              break;
            }
            const filePath = VFS.normalizePath(currentDir + '\\' + args.join(' '));
            const content = VFS.readFile(filePath);
            if (content !== null) {
              print(content);
            } else {
              print(`The system cannot find the file specified.`, true);
            }
            break;

          case 'tree':
            print(currentDir);
            print(`├── Program Files`);
            print(`│   ├── MPCrosoft Explorer`);
            print(`│   └── Windows Media Player`);
            print(`├── WINDOWS`);
            print(`│   └── system32`);
            print(`└── Documents and Settings`);
            print(`    └── OU_IT`);
            print(`        ├── Desktop`);
            print(`        └── My Documents`);
            break;

          case 'exit':
            win.close();
            break;

          default:
            print(`'${cmd}' is not recognized as an internal or external command,`);
            print(`operable program or batch file. Type 'help' for instructions.`, true);
            break;
        }
      }

      inputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const val = inputEl.value;
          inputEl.value = '';
          executeCommand(val);
        } else if (e.key === 'ArrowUp') {
          if (history.length > 0 && historyIdx > 0) {
            historyIdx--;
            inputEl.value = history[historyIdx];
          }
          e.preventDefault();
        } else if (e.key === 'ArrowDown') {
          if (historyIdx < history.length - 1) {
            historyIdx++;
            inputEl.value = history[historyIdx];
          } else {
            historyIdx = history.length;
            inputEl.value = '';
          }
          e.preventDefault();
        }
      });

      // Auto-focus on start
      setTimeout(() => inputEl.focus(), 100);
    }
  });
})();
