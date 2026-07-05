// Generates placeholder PWA icons (barber-pole-style mark) as PNGs using only
// Node built-ins. Run: node scripts/generate-icons.mjs
// Replace public/icons/*.png with real branded icons before launch.
import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";

const NAVY = [10, 15, 30];
const GOLD = [245, 185, 66];
const CREAM = [247, 243, 234];
const CORAL = [248, 113, 113];
const TEAL = [45, 212, 168];

function crc32(buf) {
  let table = crc32.table;
  if (!table) {
    table = crc32.table = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[n] = c;
    }
  }
  let crc = -1;
  for (const b of buf) crc = (crc >>> 8) ^ table[(crc ^ b) & 0xff];
  return (crc ^ -1) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

function png(size, pixelFn) {
  // Raw RGBA rows, each prefixed with filter byte 0.
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    const rowStart = y * (size * 4 + 1);
    raw[rowStart] = 0;
    for (let x = 0; x < size; x++) {
      const [r, g, b] = pixelFn(x, y, size);
      const i = rowStart + 1 + x * 4;
      raw[i] = r;
      raw[i + 1] = g;
      raw[i + 2] = b;
      raw[i + 3] = 255;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// Barber-pole ball: navy field, gold ring, diagonal cream/coral/teal stripes.
function pixel(x, y, size) {
  const c = size / 2;
  const dx = x - c;
  const dy = y - c;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const outer = size * 0.42;
  const inner = size * 0.36;
  if (dist > outer) return NAVY;
  if (dist > inner) return GOLD;
  const stripe = Math.floor(((x + y) / size) * 6) % 3;
  return stripe === 0 ? CORAL : stripe === 1 ? CREAM : TEAL;
}

mkdirSync("public/icons", { recursive: true });
for (const size of [192, 512]) {
  writeFileSync(`public/icons/icon-${size}.png`, png(size, pixel));
  console.log(`wrote public/icons/icon-${size}.png`);
}
