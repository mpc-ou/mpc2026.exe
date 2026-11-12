/**
 * ============================================================================
 * VFS - Virtual File System for MPC.exe
 * ============================================================================
 * Simulates real Windows XP file system for:
 * - My Computer & Drive C: Explorer (15.6 GB of 19.90 GB - Easter egg OU 15/6/1990)
 * - Command Prompt (dir, cd, type, tree, cat, etc.)
 * - File associations (.txt -> Notepad, .jpg -> Picture Viewer, .exe -> Run)
 */

const VFS = (function () {
  // Easter egg: 15.6 GB free of 19.90 GB (OU Founding Date: 15/06/1990)
  const DRIVE_INFO = {
    label: 'Local Disk (C:)',
    freeSpaceGB: 15.6,
    totalSpaceGB: 19.90,
    fileSystem: 'NTFS',
    easterEgg: 'Trường Đại học Mở TP.HCM thành lập ngày 15/6/1990'
  };

  const _fs = {
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
              'calc.exe': { type: 'exe', size: 114688, desc: 'Calculator' }
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
                    size: 1024,
                    content: `=====================================================
            CHÀO MỪNG ĐẾN VỚI MPCLUB 2026
=====================================================
MPClub (Multi-Platform Club) là CLB học thuật & công nghệ thuộc Khoa CNTT - Trường ĐH Mở TP.HCM.
- Nơi nuôi dưỡng đam mê Lập trình, AI, Web, Mobile và Công nghệ mới.
- Kết nối các thế hệ sinh viên OU IT thực chiến dự án thực tế.`
                  },
                  'FAQ.txt': {
                    type: 'file',
                    size: 850,
                    content: `Q: Chưa biết lập trình có tham gia Ban Lập Trình được không?
A: Được! MPC luôn có lộ trình training bài bản từ con số 0.

Q: Thời gian sinh hoạt CLB thế nào?
A: Sinh hoạt linh hoạt kết hợp Online và Offline cuối tuần.`
                  },
                  'JOIN_MPC.exe': {
                    type: 'exe',
                    size: 202600,
                    desc: 'Đăng Ký Tuyển Thành Viên MPClub 2026'
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
                        desc: 'MPClub Intro Video (Recruitment 2026)' 
                      }
                    }
                  },
                  'Nhat_Ky_BLT.txt': {
                    type: 'file',
                    size: 612,
                    content: `[Ghi chép Ban Lập Trình - Đêm code MPC.exe]
Mỗi dòng code đều chứa đựng đam mê của sinh viên OU IT. Chúc các ứng viên 2026 tự tin tỏa sáng!`
                  }
                }
              }
            }
          }
        }
      },
      'OU_EASTER_EGG': {
        type: 'dir',
        children: {
          '15_06_1990.txt': {
            type: 'file',
            size: 420,
            content: `🎉 CHÚC MỪNG BẠN ĐÃ TÌM THẤY EASTER EGG!
Dung lượng ổ C: "15.6 GB of 19.90 GB" chính là ngày thành lập của
TRƯỜNG ĐẠI HỌC MỞ THÀNH PHỐ HỒ CHÍ MINH (15/06/1990)!
Khoa Công Nghệ Thông Tin tự hào là cái nôi công nghệ của OU!`
          }
        }
      }
    }
  };

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

  return {
    DRIVE_INFO,
    normalizePath,
    getNode,

    /**
     * Read directory contents
     */
    listDir(pathStr) {
      const node = getNode(pathStr);
      if (!node || node.type !== 'dir') return null;

      return Object.keys(node.children).map(name => {
        const item = node.children[name];
        return {
          name,
          type: item.type,
          size: item.size || 0,
          desc: item.desc || '',
          url: item.url || ''
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
    }
  };
})();

window.VFS = VFS;
