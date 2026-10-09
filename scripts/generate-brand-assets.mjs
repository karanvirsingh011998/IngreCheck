import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const assetsDir = path.join(root, 'assets');

const GREEN = [23, 76, 60, 255];
const MINT = [232, 244, 236, 255];
const FRESH = [61, 139, 99, 255];
const WHITE = [255, 255, 255, 255];

function crc32(buffer) {
  let crc = ~0;
  for (let index = 0; index < buffer.length; index += 1) {
    crc ^= buffer[index];
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return ~crc >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const typeBuffer = Buffer.from(type);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])));
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function encodePng(width, height, pixels) {
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y += 1) {
    const start = y * (stride + 1);
    raw[start] = 0;
    pixels.copy(raw, start + 1, y * stride, (y + 1) * stride);
  }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 6;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', header),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function roundRectDistance(x, y, left, top, width, height, radius) {
  const centerX = left + width / 2;
  const centerY = top + height / 2;
  const dx = Math.abs(x - centerX) - width / 2 + radius;
  const dy = Math.abs(y - centerY) - height / 2 + radius;
  const outsideX = Math.max(dx, 0);
  const outsideY = Math.max(dy, 0);
  return Math.min(Math.max(dx, dy), 0) + Math.hypot(outsideX, outsideY) - radius;
}

function ellipse(x, y, cx, cy, rx, ry) {
  const dx = (x - cx) / rx;
  const dy = (y - cy) / ry;
  return dx * dx + dy * dy <= 1;
}

function paintMark(size, { background, monochrome }) {
  const pixels = Buffer.alloc(size * size * 4);
  const frame = size * 0.18;
  const stroke = Math.max(4, size * 0.045);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const offset = (y * size + x) * 4;
      let color = background ? GREEN : [0, 0, 0, 0];
      const frameDistance = roundRectDistance(
        x + 0.5,
        y + 0.5,
        frame,
        frame,
        size - frame * 2,
        size - frame * 2,
        size * 0.12,
      );
      const onFrame = frameDistance > -stroke && frameDistance < 0;
      const leafA = ellipse(x, y, size * 0.46, size * 0.56, size * 0.16, size * 0.24);
      const leafB = ellipse(x, y, size * 0.58, size * 0.46, size * 0.14, size * 0.2);
      if (onFrame) {
        color = monochrome ? WHITE : MINT;
      } else if (leafA || leafB) {
        color = monochrome ? WHITE : FRESH;
      }
      pixels[offset] = color[0];
      pixels[offset + 1] = color[1];
      pixels[offset + 2] = color[2];
      pixels[offset + 3] = color[3];
    }
  }
  return pixels;
}

function writeAsset(name, size, options) {
  const file = path.join(assetsDir, name);
  fs.writeFileSync(file, encodePng(size, size, paintMark(size, options)));
}

fs.mkdirSync(assetsDir, { recursive: true });
writeAsset('icon.png', 1024, { background: true, monochrome: false });
writeAsset('splash-icon.png', 512, { background: false, monochrome: false });
writeAsset('android-icon-foreground.png', 1024, { background: false, monochrome: false });
writeAsset('android-icon-monochrome.png', 1024, { background: false, monochrome: true });
writeAsset('favicon.png', 48, { background: true, monochrome: false });

const background = Buffer.alloc(512 * 512 * 4);
for (let index = 0; index < 512 * 512; index += 1) {
  background[index * 4] = GREEN[0];
  background[index * 4 + 1] = GREEN[1];
  background[index * 4 + 2] = GREEN[2];
  background[index * 4 + 3] = 255;
}
fs.writeFileSync(path.join(assetsDir, 'android-icon-background.png'), encodePng(512, 512, background));
