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
    showOnDesktop: true,
    showInStartMenu: false, // already in the Start menu's right column
    render: (container, win) => {
      container.innerHTML = `
        <div class="terminal-container" id="terminal-screen-${win.appId}">
          <div class="terminal-output" id="term-output">
MPCrosoft(R) Windows XP [Version 5.1.2600]
(C) Copyright 1985-2001 MPCrosoft Corp.
Ban Lập Trình (BLT) - MPClub Recruitment 2026

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
            print(`  DIR         Displays a list of files and subdirectories.`);
            print(`  CD          Displays the name of or changes the current directory.`);
            print(`  TYPE / CAT  Displays the contents of a text file.`);
            print(`  CLS         Clears the terminal screen.`);
            print(`  TREE        Graphically displays the directory structure.`);
            print(`  WHOAMI      Displays current user information.`);
            print(`  VER         Displays the MPCrosoft Windows version.`);
            print(`  DATE        Displays the current system date.`);
            print(`  SECRET      Reveals a secret easter egg!`);
            print(`  EXIT        Quits the CMD.EXE program.`);
            break;

          case 'cls':
            outputEl.innerHTML = '';
            break;

          case 'ver':
            print(`MPCrosoft Windows XP [Version 5.1.2600.2026]`);
            print(`Custom Edition by MPClub - OU IT Department`);
            break;

          case 'whoami':
            print(`OU-IT\\Administrator`);
            print(`Group: MPClub / Ban Lap Trinh / Recruitment 2026`);
            break;

          case 'date':
            print(`Current date is: ${new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`);
            break;

          case 'secret':
            print(`=======================================================`);
            print(`⭐ BẬT MÍ EASTER EGG CHO TÂN SINH VIÊN OU IT:`);
            print(`- Thử mở 'My Computer' -> Ổ cứng C: bạn sẽ thấy 15.6 GB of 19.90 GB`);
            print(`- Đó chính là ngày thành lập Trường ĐH Mở TP.HCM: 15/06/1990!`);
            print(`- Đừng quên ứng tuyển MPClub qua shortcut JOIN_MPC.exe nhé!`);
            print(`=======================================================`);
            break;

          case 'dir':
            const items = VFS.listDir(currentDir);
            if (!items) {
              print(`The system cannot find the path specified.`, true);
              break;
            }
            print(` Volume in drive C is MPC_SYSTEM`);
            print(` Volume Serial Number is 1506-1990`);
            print(` Directory of ${currentDir}\n`);
            print(`15/06/1990  08:00 AM    <DIR>          .`);
            print(`15/06/1990  08:00 AM    <DIR>          ..`);

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
            print(`              ${dirCount} Dir(s)     16,750,372,864 bytes free (15.6 GB)`);
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
            print(`├── Documents and Settings`);
            print(`│   └── OU_IT`);
            print(`│       ├── Desktop`);
            print(`│       └── My Documents`);
            print(`└── OU_EASTER_EGG (15_06_1990)`);
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
