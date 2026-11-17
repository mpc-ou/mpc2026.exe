const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Ensure assets/cursors directory exists
const outDir = path.join(__dirname, '..', 'assets', 'cursors');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Simple CRC32 table
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createPNG(width, height, rgbaBuffer) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8 bits per channel
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0; // deflate
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // no interlace

  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // Scanlines with filter byte 0
  const scanlines = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    const rowOffset = y * (1 + width * 4);
    scanlines[rowOffset] = 0; // filter type None
    rgbaBuffer.copy(scanlines, rowOffset + 1, y * width * 4, (y + 1) * width * 4);
  }

  const compressedData = zlib.deflateSync(scanlines);
  const idatChunk = makeChunk('IDAT', compressedData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(4 + 4 + len + 4);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const typeAndData = chunk.slice(4, 8 + len);
  chunk.writeUInt32BE(crc32(typeAndData), 8 + len);
  return chunk;
}

// Helper to set pixel on 32x32 canvas
function setPixel(buf, w, x, y, r, g, b, a) {
  if (x < 0 || x >= w || y < 0 || y >= w) return;
  const idx = (y * w + x) * 4;
  buf[idx] = r;
  buf[idx + 1] = g;
  buf[idx + 2] = b;
  buf[idx + 3] = a;
}

// -------------------------------------------------------------
// 1. Windows XP Default Arrow Cursor (32x32)
// -------------------------------------------------------------
function generateDefaultCursor() {
  const W = 32;
  const buf = Buffer.alloc(W * W * 4); // all zeros / transparent

  // Standard Windows XP 3D-shadowed Arrow bitmap:
  // . = white, # = black outline, S = soft shadow
  const art = [
    "#               ",
    "##              ",
    "#.#             ",
    "#..#            ",
    "#...#           ",
    "#....#          ",
    "#.....#         ",
    "#......#        ",
    "#.......#       ",
    "#........#      ",
    "#.....#####     ",
    "#..#..#         ",
    "#.# #..#        ",
    "##  #..#        ",
    "#    #..#       ",
    "     #..#       ",
    "      ##        ",
    "                "
  ];

  // Draw shadow first (shifted +1, +1 or +2, +1)
  for (let y = 0; y < art.length; y++) {
    for (let x = 0; x < art[y].length; x++) {
      if (art[y][x] === '#' || art[y][x] === '.') {
        // Drop shadow with gradient
        for (let dy = 1; dy <= 2; dy++) {
          for (let dx = 1; dx <= 2; dx++) {
            const sx = x + dx;
            const sy = y + dy;
            const alpha = (dx === 2 && dy === 2) ? 60 : 110;
            const idx = (sy * W + sx) * 4;
            if (buf[idx + 3] < alpha) {
              setPixel(buf, W, sx, sy, 0, 0, 0, alpha);
            }
          }
        }
      }
    }
  }

  // Draw arrow body and outline
  for (let y = 0; y < art.length; y++) {
    for (let x = 0; x < art[y].length; x++) {
      const c = art[y][x];
      if (c === '#') {
        setPixel(buf, W, x, y, 0, 0, 0, 255);
      } else if (c === '.') {
        setPixel(buf, W, x, y, 255, 255, 255, 255);
      }
    }
  }

  fs.writeFileSync(path.join(outDir, 'default.png'), createPNG(W, W, buf));

  // Also write SVG version
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <defs>
    <filter id="xp-shadow" x="-20%" y="-20%" width="150%" height="150%">
      <feDropShadow dx="1.5" dy="1.5" stdDeviation="1" flood-color="#000" flood-opacity="0.45"/>
    </filter>
  </defs>
  <path filter="url(#xp-shadow)" fill="#FFFFFF" stroke="#000000" stroke-width="1.2" stroke-linejoin="round" d="M 1,1 L 1,17.5 L 5.5,13.5 L 9,21 L 11.5,19.8 L 8,12.3 L 13.5,12.3 Z"/>
</svg>`;
  fs.writeFileSync(path.join(outDir, 'default.svg'), svg, 'utf8');
}

// -------------------------------------------------------------
// 2. Windows XP Pointer / Link Hand Cursor (32x32)
// -------------------------------------------------------------
function generatePointerCursor() {
  const W = 32;
  const buf = Buffer.alloc(W * W * 4);

  // Classic Windows XP Hand Cursor:
  const art = [
    "      #         ",
    "     #.#        ",
    "     #.#        ",
    "     #.#        ",
    "     #.#   #    ",
    "     #.#  #.#   ",
    " #   #.#  #.#   ",
    "#.#  #.#  #.# # ",
    "#.#  #.#  #.# #.",
    "#.#  #.#  #.# #.",
    " #.# #.#  #.# #.",
    " #.# #.#  #.# #.",
    "  #.####..#.# #.",
    "  #...........#.",
    "  #...........#.",
    "   #..........# ",
    "   #..........# ",
    "    #........#  ",
    "    #........#  ",
    "     #......#   ",
    "     ########   "
  ];

  // Draw shadow
  for (let y = 0; y < art.length; y++) {
    for (let x = 0; x < art[y].length; x++) {
      if (art[y][x] !== ' ') {
        for (let dy = 1; dy <= 2; dy++) {
          for (let dx = 1; dx <= 2; dx++) {
            const sx = x + dx;
            const sy = y + dy;
            const alpha = (dx === 2 && dy === 2) ? 60 : 110;
            const idx = (sy * W + sx) * 4;
            if (buf[idx + 3] < alpha) {
              setPixel(buf, W, sx, sy, 0, 0, 0, alpha);
            }
          }
        }
      }
    }
  }

  // Draw hand body and outline
  for (let y = 0; y < art.length; y++) {
    for (let x = 0; x < art[y].length; x++) {
      const c = art[y][x];
      if (c === '#') {
        setPixel(buf, W, x, y, 0, 0, 0, 255);
      } else if (c === '.') {
        setPixel(buf, W, x, y, 255, 255, 255, 255);
      }
    }
  }

  fs.writeFileSync(path.join(outDir, 'pointer.png'), createPNG(W, W, buf));

  // Also write SVG version
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <defs>
    <filter id="xp-shadow" x="-20%" y="-20%" width="150%" height="150%">
      <feDropShadow dx="1.5" dy="1.5" stdDeviation="1" flood-color="#000" flood-opacity="0.45"/>
    </filter>
  </defs>
  <path filter="url(#xp-shadow)" fill="#FFFFFF" stroke="#000000" stroke-width="1.2" stroke-linejoin="round" d="M 6.5,1.5 C 5.5,1.5 5.5,3 5.5,10 C 4.5,9.5 3.5,8 2.5,8 C 1.5,8 1,9 1.5,11 C 2.5,14 4.5,17 6,19 C 7,20.5 8,21.5 10,21.5 C 13,21.5 15,21.5 15,21.5 C 16.5,21 17.5,19 17.5,16.5 C 17.5,14 17.5,11 17.5,10 C 17.5,9 16.5,9 16,9.5 C 16,8.5 15,8 14,8.5 C 14,7.5 13,7 12,7.5 C 12,5 12,2 10,2 C 9,2 8.5,3.5 8.5,5.5 L 8.5,10 L 8.5,1.5 C 8.5,1 7.5,0.5 6.5,1.5 Z"/>
</svg>`;
  fs.writeFileSync(path.join(outDir, 'pointer.svg'), svg, 'utf8');
}

// -------------------------------------------------------------
// 3. Windows XP Wait / Hourglass Cursor (32x32)
// -------------------------------------------------------------
function generateWaitCursor() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <defs>
    <filter id="xp-shadow" x="-20%" y="-20%" width="150%" height="150%">
      <feDropShadow dx="1.5" dy="1.5" stdDeviation="1" flood-color="#000" flood-opacity="0.45"/>
    </filter>
    <linearGradient id="sand-grad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#3aa0ff"/>
      <stop offset="100%" stop-color="#0055ea"/>
    </linearGradient>
  </defs>
  <g filter="url(#xp-shadow)">
    <!-- Frame -->
    <rect x="7" y="4" width="18" height="3" fill="#2d528f" stroke="#000" stroke-width="1"/>
    <rect x="7" y="25" width="18" height="3" fill="#2d528f" stroke="#000" stroke-width="1"/>
    <!-- Glass body -->
    <path d="M 8.5,7 L 23.5,7 L 17.5,16 L 23.5,25 L 8.5,25 L 14.5,16 Z" fill="#e8f4fc" stroke="#000" stroke-width="1.2" opacity="0.95"/>
    <!-- Sand Top -->
    <path d="M 10,8.5 L 22,8.5 L 16.5,15.5 L 15.5,15.5 Z" fill="url(#sand-grad)"/>
    <!-- Sand Stream -->
    <line x1="16" y1="15.5" x2="16" y2="23" stroke="#0055ea" stroke-width="1.5"/>
    <!-- Sand Bottom -->
    <path d="M 11,24 L 21,24 L 18,20 L 14,20 Z" fill="url(#sand-grad)"/>
    <!-- Glass reflection highlight -->
    <path d="M 10,9 L 12,9 L 14.8,14.5 L 13.8,14.5 Z" fill="#ffffff" opacity="0.75"/>
  </g>
</svg>`;
  fs.writeFileSync(path.join(outDir, 'wait.svg'), svg, 'utf8');
}

// -------------------------------------------------------------
// 4. Windows XP Text I-Beam Cursor (32x32)
// -------------------------------------------------------------
function generateTextCursor() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
  <defs>
    <filter id="xp-shadow" x="-20%" y="-20%" width="150%" height="150%">
      <feDropShadow dx="1" dy="1" stdDeviation="0.8" flood-color="#000" flood-opacity="0.4"/>
    </filter>
  </defs>
  <g filter="url(#xp-shadow)" stroke="#000000" stroke-width="1" fill="#000000">
    <!-- Top serif -->
    <path d="M 4,4 L 12,4 M 4,5 L 12,5"/>
    <!-- Bottom serif -->
    <path d="M 4,20 L 12,20 M 4,19 L 12,19"/>
    <!-- Vertical stem -->
    <path d="M 8,4 L 8,20" stroke-width="1.6"/>
  </g>
</svg>`;
  fs.writeFileSync(path.join(outDir, 'text.svg'), svg, 'utf8');
}

generateDefaultCursor();
generatePointerCursor();
generateWaitCursor();
generateTextCursor();
console.log('Successfully generated Windows XP cursors in assets/cursors!');
