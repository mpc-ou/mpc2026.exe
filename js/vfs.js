/**
 * ============================================================================
 * VFS - Virtual File System for MPC.exe (with LocalStorage Persistence)
 * ============================================================================
 * Simulates real Windows XP file system for:
 * - My Computer & Drive C: Explorer (25.12 GB of 201.5 GB)
 * - Desktop files & folders (persistent via localStorage)
 * - File operations: Create, Delete, Rename, Cut, Copy, Paste
 * - Command Prompt (dir, cd, type, tree, cat, etc.)
 * - File associations (.txt -> Notepad, .png/.bmp -> Paint/Viewer, .exe -> Run)
 */

const VFS = (function () {
  const STORAGE_KEY = 'mpc_vfs_storage_v1';

  const DRIVE_INFO = {
    label: 'Local Disk (C:)',
    freeSpaceGB: 25.12,
    totalSpaceGB: 201.5,
    fileSystem: 'NTFS'
  };

  const _defaultFs = {
    type: 'dir',
    name: 'C:',
    children: {
      'WINDOWS': {
        type: 'dir',
        children: {
          'system32': {
            type: 'dir',
            children: {
              'cmd.exe': { type: 'exe', size: 389120, desc: 'Windows Command Processor' },
              'notepad.exe': { type: 'exe', size: 69120, desc: 'Notepad Text Editor' },
              'calc.exe': { type: 'exe', size: 114688, desc: 'Calculator' },
              'mspaint.exe': { type: 'exe', size: 345088, desc: 'Paint Drawing Editor' },
              'taskmgr.exe': { type: 'exe', size: 215040, desc: 'Windows Task Manager' }
            }
          },
          'mpc_os.sys': { type: 'sys', size: 202600, desc: 'MPClub Operating System Core' }
        }
      },
      'Program Files': {
        type: 'dir',
        children: {
          'MPCrosoft Explorer': {
            type: 'dir',
            children: {
              'iexplore.exe': { type: 'exe', size: 91136, desc: 'MPCrosoft Explorer Browser' }
            }
          },
          'Windows Media Player': {
            type: 'dir',
            children: {
              'wmplayer.exe': { type: 'exe', size: 154624, desc: 'Windows Media Player' }
            }
          }
        }
      },
      'Documents and Settings': {
        type: 'dir',
        children: {
          'OU_IT': {
            type: 'dir',
            children: {
              'Desktop': {
                type: 'dir',
                children: {
                  'ABOUT_MPC.txt': {
                    type: 'file',
                    size: 1640,
                    content: `=====================================================
   CÂU LẠC BỘ LẬP TRÌNH TRÊN THIẾT BỊ DI ĐỘNG (MPC)
=====================================================
• Tên tiếng Anh: Mobile Programming Club (MPC / MPClub)
• Ngày thành lập: 24/12/2015 (Kỷ niệm 10 năm: 24/12/2025)
• Đơn vị trực thuộc: Khoa Công nghệ Thông tin – Trường ĐH Mở TP.HCM
• Slogan: "Ở đâu có bug, ở đó có MPC!"
• Website: https://www.mpclub.dev
• Email: it.mpclub@ou.edu.vn | Fanpage: CLB Lập Trình Trên Thiết Bị Di Động
• Cơ cấu: Ban Chủ nhiệm, Ban Lập trình, Ban Truyền thông, Ban Hậu cần.`
                  },
                  'FAQ.txt': {
                    type: 'file',
                    size: 1280,
                    content: `Q: Chưa biết lập trình có tham gia MPC được không?
A: Được! MPC không yêu cầu biết lập trình trước, CLB đào tạo bài bản từ nền tảng và có Mentoring 1-1.

Q: Sinh viên ngành khác tại Trường ĐH Mở TP.HCM có tham gia được không?
A: Hoàn toàn được! Nếu bạn đam mê công nghệ, thiết kế, truyền thông hoặc tổ chức sự kiện.

Q: Quy trình ứng tuyển gồm mấy bước?
A: 4 bước: Đăng ký form -> Làm test trắc nghiệm online -> Test trực tiếp (Ban Lập trình sẽ có thêm test coding) -> Có kết quả Onboard.`
                  },
                  'JOIN_MPC.exe': {
                    type: 'exe',
                    size: 202600,
                    desc: 'Đăng ký tham gia câu lạc bộ MPClub'
                  }
                }
              },
              'My Documents': {
                type: 'dir',
                children: {
                  'My Pictures': {
                    type: 'dir',
                    children: {
                      'contest-0.jpg': { type: 'img', url: 'assets/images/the-open-clubs/contest-0.jpg', size: 194199 },
                      'training-1.jpg': { type: 'img', url: 'assets/images/the-open-clubs/training-1.jpg', size: 67121 },
                      'members-4.jpg': { type: 'img', url: 'assets/images/the-open-clubs/members-4.jpg', size: 229356 },
                      'webdesign-1.jpg': { type: 'img', url: 'assets/images/the-open-clubs/webdesign-1.jpg', size: 240856 }
                    }
                  },
                  'My Videos': {
                    type: 'dir',
                    children: {
                      'intro.mp4': { 
                        type: 'video', 
                        url: 'assets/videos/intro.mp4', 
                        size: 17076168, 
                        desc: 'Video giới thiệu câu lạc bộ MPClub' 
                      }
                    }
                  },
                  'Ho_So_MPClub_2026.txt': {
                    type: 'file',
                    size: 2480,
                    content: `[HỒ SƠ TỔNG QUAN MPCLUB – CẬP NHẬT 17/11/2026]
1. ĐỊNH DANH: Câu lạc bộ Lập trình trên thiết bị di động (Mobile Programming Club – MPC)
   Trực thuộc Khoa Công nghệ Thông tin – Trường ĐH Mở TP.HCM (Thành lập: 24/12/2015).
2. BAN CHỦ NHIỆM & CÁN SỰ (2025 – 2026):
   - Chủ nhiệm CLB: Nguyễn Thị Kim Oanh
   - Phó chủ nhiệm: Phạm Đức Thắng, Cao Đỗ Huyền Trân
   - Trưởng ban Lập trình: Nguyễn Thanh Triều
   - Trưởng ban Truyền thông: Lê Nguyễn Vân Anh
   - Trưởng ban Hậu cần: Trần Võ Thị Thu Uyên
3. DỰ ÁN TIÊU BIỂU: MPC Extension (WXT, React, TypeScript) hỗ trợ sinh viên Trường ĐH Mở TP.HCM trên sis.ou.edu.vn.
4. WEB DESIGN 2026 (White Label for Businesses – 18/10/2026):
   - Giải Nhất: ClauKi | Giải Nhì: 404 Not Found | Giải Ba: TopBotDev.`
                  },
                  'Nhat_Ky_BLT.txt': {
                    type: 'file',
                    size: 612,
                    content: `[Ghi chép Ban Lập Trình – Câu lạc bộ Lập trình trên thiết bị di động (MPC)]
"Ở đâu có bug, ở đó có MPC!" – Mỗi dòng code đều chứa đựng đam mê của sinh viên Khoa CNTT – Trường ĐH Mở TP.HCM.`
                  }
                }
              }
            }
          }
        }
      }
    }
  };

  let _fs = JSON.parse(JSON.stringify(_defaultFs));
  const _listeners = [];
  let _clipboard = null; // { action: 'copy'|'cut', path: string, node: object }
  const TRASH_KEY = 'mpc_vfs_trash_v1';
  let _trash = [];

  function loadTrash() {
    try {
      const data = localStorage.getItem(TRASH_KEY);
      _trash = data ? JSON.parse(data) : [];
    } catch (e) {
      _trash = [];
    }
  }

  function saveTrash() {
    try {
      localStorage.setItem(TRASH_KEY, JSON.stringify(_trash));
    } catch (e) {}
  }

  function playTrashSound() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const bufferSize = Math.floor(ctx.sampleRate * 0.35);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        const envelope = Math.exp(-i / (ctx.sampleRate * 0.08));
        const crackle = Math.random() < 0.18 ? (Math.random() * 2 - 1) : (Math.random() * 0.4 - 0.2);
        data[i] = crackle * envelope;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1100;
      filter.Q.value = 1.6;

      const gain = ctx.createGain();
      const eff = window.MasterVolume ? window.MasterVolume.getEffectiveVolume() : 0.8;
      gain.gain.setValueAtTime(eff * 0.7, ctx.currentTime);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
    } catch (e) {}
  }

  // Load persisted user filesystem from LocalStorage
  function loadPersistedFs() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.children) {
          // Remove obsolete easter egg if present in legacy storage
          if (parsed.children['OU_EASTER_EGG']) {
            delete parsed.children['OU_EASTER_EGG'];
          }
          // Merge custom items into _fs recursively
          mergeTree(_fs, parsed);
        }
      }
    } catch (e) {
      console.warn('[VFS] Could not load localStorage VFS:', e);
    }
  }

  function mergeTree(target, source) {
    if (!source || !source.children) return;
    if (!target.children) target.children = {};
    for (const key of Object.keys(source.children)) {
      const srcNode = source.children[key];
      if (target.children[key] && target.children[key].type === 'dir' && srcNode.type === 'dir') {
        mergeTree(target.children[key], srcNode);
      } else {
        target.children[key] = srcNode;
      }
    }
  }

  function saveFs() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(_fs));
    } catch (e) {
      console.warn('[VFS] Storage save failed:', e);
    }
    notifyListeners();
  }

  function notifyListeners() {
    _listeners.forEach(fn => {
      try { fn(); } catch (e) { console.error(e); }
    });
  }

  // Initialize
  loadTrash();
  loadPersistedFs();

  // Ensure PHỐT_MPC.txt exists on Desktop if not destroyed by the Easter Egg
  try {
    const desk = getNode('C:\\Documents and Settings\\OU_IT\\Desktop');
    if (desk && desk.children && localStorage.getItem('mpc_phot_deleted_v1') !== '1') {
      if (!desk.children['PHỐT_MPC.txt']) {
        desk.children['PHỐT_MPC.txt'] = {
          type: 'file',
          size: 2048,
          userCreated: true,
          content: 'Tài liệu tối mật CLB MPClub 2026. Tuyệt đối không mở!',
          secretEgg: true
        };
      }
    }
  } catch (e) {}

  /**
   * Normalize path (e.g. "C:\WINDOWS\system32\..\system32" -> "C:\WINDOWS\system32")
   */
  function normalizePath(rawPath) {
    if (!rawPath) return 'C:\\';
    let path = rawPath.replace(/\//g, '\\').trim();
    if (!path.startsWith('C:')) {
      path = 'C:\\' + path.replace(/^\\+/, '');
    }
    const parts = path.split('\\').filter(p => p.length > 0 && p !== '.');
    const stack = [];
    for (const part of parts) {
      if (part === '..') {
        if (stack.length > 1) stack.pop();
      } else {
        stack.push(part);
      }
    }
    if (stack.length === 1 && stack[0] === 'C:') return 'C:\\';
    return stack.join('\\');
  }

  /**
   * Traverse VFS to find node
   */
  function getNode(pathStr) {
    const norm = normalizePath(pathStr);
    if (norm === 'C:' || norm === 'C:\\') return _fs;

    const parts = norm.split('\\').filter(p => p.length > 0 && p !== 'C:');
    let curr = _fs;
    for (const part of parts) {
      if (!curr.children || !curr.children[part]) {
        return null;
      }
      curr = curr.children[part];
    }
    return curr;
  }

  /**
   * Get parent directory node and node name
   */
  function getParentAndName(pathStr) {
    const norm = normalizePath(pathStr);
    if (norm === 'C:' || norm === 'C:\\') return null;
    const lastSlash = norm.lastIndexOf('\\');
    const parentPath = lastSlash <= 2 ? 'C:\\' : norm.slice(0, lastSlash);
    const name = norm.slice(lastSlash + 1);
    const parentNode = getNode(parentPath);
    return { parentPath, parentNode, name };
  }

  return {
    DRIVE_INFO,
    normalizePath,
    getNode,

    onChange(fn) {
      if (typeof fn === 'function') _listeners.push(fn);
    },

    /**
     * Read directory contents
     */
    listDir(pathStr) {
      const node = getNode(pathStr);
      if (!node || node.type !== 'dir') return null;

      return Object.keys(node.children || {}).map(name => {
        const item = node.children[name];
        return {
          name,
          type: item.type,
          size: item.size || 0,
          desc: item.desc || '',
          url: item.url || '',
          content: item.content || '',
          userCreated: !!item.userCreated
        };
      });
    },

    /**
     * Read text file content
     */
    readFile(pathStr) {
      const node = getNode(pathStr);
      if (!node) return null;
      if (node.type !== 'file') return `[Error: '${pathStr}' is not a text file]`;
      return node.content || '';
    },

    /**
     * Check if path exists
     */
    exists(pathStr) {
      return getNode(pathStr) !== null;
    },

    /**
     * Create a file in a directory
     */
    createFile(dirPath, fileName, content = '', type = 'file', extraProps = {}) {
      const dirNode = getNode(dirPath);
      if (!dirNode || dirNode.type !== 'dir') return false;
      if (!dirNode.children) dirNode.children = {};

      let finalName = fileName;
      let counter = 1;
      const dotIdx = fileName.lastIndexOf('.');
      const base = dotIdx > 0 ? fileName.slice(0, dotIdx) : fileName;
      const ext = dotIdx > 0 ? fileName.slice(dotIdx) : '';

      while (dirNode.children[finalName]) {
        finalName = `${base} (${counter})${ext}`;
        counter++;
      }

      dirNode.children[finalName] = {
        type: type,
        size: content.length || 1024,
        content: content,
        userCreated: true,
        ...extraProps
      };

      saveFs();
      return finalName;
    },

    /**
     * Update / overwrite an existing file in VFS
     */
    writeFile(pathStr, content = '', extraProps = {}) {
      const node = getNode(pathStr);
      if (!node) return false;
      node.content = content;
      node.size = content.length || 1024;
      Object.assign(node, extraProps);
      saveFs();
      return true;
    },

    /**
     * Create a directory in a directory
     */
    createDir(dirPath, dirName = 'New Folder') {
      const parentNode = getNode(dirPath);
      if (!parentNode || parentNode.type !== 'dir') return false;
      if (!parentNode.children) parentNode.children = {};

      let finalName = dirName;
      let counter = 1;
      while (parentNode.children[finalName]) {
        finalName = `${dirName} (${counter})`;
        counter++;
      }

      parentNode.children[finalName] = {
        type: 'dir',
        children: {},
        userCreated: true
      };

      saveFs();
      return finalName;
    },

    /**
     * Delete a file or directory
     */
    deleteNode(pathStr) {
      const res = getParentAndName(pathStr);
      if (!res || !res.parentNode || !res.parentNode.children) return false;
      if (res.parentNode.children[res.name]) {
        const deletedNode = res.parentNode.children[res.name];
        _trash.push({
          name: res.name,
          path: pathStr,
          type: deletedNode.type || 'file',
          deletedAt: new Date().toLocaleTimeString()
        });
        saveTrash();
        delete res.parentNode.children[res.name];
        saveFs();
        return true;
      }
      return false;
    },

    /**
     * Rename a file or directory
     */
    renameNode(pathStr, newName) {
      if (!newName || !newName.trim()) return false;
      const cleanName = newName.trim();
      const res = getParentAndName(pathStr);
      if (!res || !res.parentNode || !res.parentNode.children) return false;
      if (!res.parentNode.children[res.name]) return false;
      if (res.parentNode.children[cleanName] && cleanName !== res.name) return false;

      const node = res.parentNode.children[res.name];
      delete res.parentNode.children[res.name];
      res.parentNode.children[cleanName] = node;
      saveFs();
      return true;
    },

    /**
     * Copy node to clipboard
     */
    setClipboard(action, pathStr) {
      const node = getNode(pathStr);
      if (!node) return false;
      const norm = normalizePath(pathStr);
      const name = norm.slice(norm.lastIndexOf('\\') + 1);
      _clipboard = {
        action: action, // 'copy' or 'cut'
        srcPath: norm,
        name: name,
        node: JSON.parse(JSON.stringify(node))
      };
      return true;
    },

    getClipboard() {
      return _clipboard;
    },

    /**
     * Paste clipboard contents into destination folder
     */
    pasteClipboard(destDirPath) {
      if (!_clipboard) return false;
      const destNode = getNode(destDirPath);
      if (!destNode || destNode.type !== 'dir') return false;
      if (!destNode.children) destNode.children = {};

      let targetName = _clipboard.name;
      let counter = 1;
      const dotIdx = targetName.lastIndexOf('.');
      const base = dotIdx > 0 ? targetName.slice(0, dotIdx) : targetName;
      const ext = dotIdx > 0 ? targetName.slice(dotIdx) : '';

      while (destNode.children[targetName]) {
        targetName = `${base} - Copy (${counter})${ext}`;
        counter++;
      }

      destNode.children[targetName] = JSON.parse(JSON.stringify(_clipboard.node));
      destNode.children[targetName].userCreated = true;

      // If it was a cut operation, delete original
      if (_clipboard.action === 'cut') {
        const srcRes = getParentAndName(_clipboard.srcPath);
        if (srcRes && srcRes.parentNode && srcRes.parentNode.children) {
          delete srcRes.parentNode.children[srcRes.name];
        }
        _clipboard = null; // Clear cut clipboard
      }

      saveFs();
      return true;
    },

    /**
     * Helper to get desktop path
     */
    getDesktopPath() {
      return 'C:\\Documents and Settings\\OU_IT\\Desktop';
    },

    getTrash() {
      return [..._trash];
    },

    isTrashFull() {
      return _trash.length > 0;
    },

    emptyTrash() {
      _trash = [];
      saveTrash();
      playTrashSound();
      notifyListeners();
      return true;
    },

    playTrashSound
  };
})();

window.VFS = VFS;
