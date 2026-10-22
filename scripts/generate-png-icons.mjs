import fs from 'node:fs';
import zlib from 'node:zlib';
import path from 'node:path';

// Minimal PNG generator without external dependencies
function createPng(width, height, r, g, b) {
  // Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // 8-bit depth
  ihdrData.writeUInt8(2, 9); // Color type 2 (Truecolor RGB)
  ihdrData.writeUInt8(0, 10); // Compression method
  ihdrData.writeUInt8(0, 11); // Filter method
  ihdrData.writeUInt8(0, 12); // Interlace method

  const ihdr = makeChunk('IHDR', ihdrData);

  // Raw image data with filter byte 0 at start of each line
  const rawData = Buffer.alloc(height * (1 + width * 3));
  let offset = 0;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = width * 0.38;

  for (let y = 0; y < height; y++) {
    rawData.writeUInt8(0, offset++); // Filter byte for scanline
    for (let x = 0; x < width; x++) {
      const dx = x - centerX;
      const dy = y - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < radius) {
        // School badge symbol color (white/bright)
        if (Math.abs(dx) < radius * 0.5 && Math.abs(dy) < radius * 0.6) {
          rawData.writeUInt8(255, offset++);
          rawData.writeUInt8(255, offset++);
          rawData.writeUInt8(255, offset++);
        } else {
          rawData.writeUInt8(Math.min(255, r + 30), offset++);
          rawData.writeUInt8(Math.min(255, g + 40), offset++);
          rawData.writeUInt8(Math.min(255, b + 20), offset++);
        }
      } else {
        // Background
        rawData.writeUInt8(Math.min(255, r), offset++);
        rawData.writeUInt8(Math.min(255, g), offset++);
        rawData.writeUInt8(Math.min(255, b), offset++);
      }
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idat = makeChunk('IDAT', compressedData);
  const iend = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

function makeChunk(type, data) {
  const length = data.length;
  const buffer = Buffer.alloc(8 + length + 4);
  buffer.writeUInt32BE(length, 0);
  buffer.write(type, 4, 4, 'ascii');
  data.copy(buffer, 8);

  // CRC-32
  const crc = crc32(buffer.subarray(4, 8 + length));
  buffer.writeUInt32BE(crc, 8 + length);
  return buffer;
}

// Standard CRC32 table
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
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

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate PNGs
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPng(192, 192, 30, 58, 138));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPng(512, 512, 30, 58, 138));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPng(512, 512, 37, 99, 235));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPng(180, 180, 30, 58, 138));

console.log('Successfully generated PWA PNG icons!');
