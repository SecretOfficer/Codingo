/* Generates build/icon.png (512x512) with no image libraries: the artwork is drawn
   with signed-distance maths into an RGBA buffer, then encoded as a PNG by hand.
   Run with `npm run icon` after changing anything here. */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const SIZE = 512;
const BG = [20, 17, 15];        // warm ink, matching --bg
const PLATE = [28, 24, 21];     // --bg-2
const GREEN = [127, 166, 80];   // moss, --green
const BLUE = [106, 156, 176];   // slate, --blue

/* ------------------------------------------------------------ geometry */

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

// Distance from point to a line segment, used to draw stroked shapes.
function segDist(px, py, ax, ay, bx, by) {
  const vx = bx - ax, vy = by - ay;
  const wx = px - ax, wy = py - ay;
  const len2 = vx * vx + vy * vy;
  const t = len2 ? clamp((wx * vx + wy * vy) / len2, 0, 1) : 0;
  const dx = px - (ax + t * vx), dy = py - (ay + t * vy);
  return Math.sqrt(dx * dx + dy * dy);
}

// Rounded rectangle distance: negative inside, positive outside.
function roundRectDist(px, py, cx, cy, halfW, halfH, r) {
  const qx = Math.abs(px - cx) - (halfW - r);
  const qy = Math.abs(py - cy) - (halfH - r);
  const outside = Math.hypot(Math.max(qx, 0), Math.max(qy, 0));
  return outside + Math.min(Math.max(qx, qy), 0) - r;
}

function mix(dst, colour, alpha) {
  dst[0] = dst[0] * (1 - alpha) + colour[0] * alpha;
  dst[1] = dst[1] * (1 - alpha) + colour[1] * alpha;
  dst[2] = dst[2] * (1 - alpha) + colour[2] * alpha;
}

// Coverage from a distance field, giving a one-pixel antialiased edge.
function cover(d) { return clamp(0.5 - d, 0, 1); }

/* --------------------------------------------------------------- paint */

function render() {
  const px = new Float64Array(SIZE * SIZE * 3);
  const alpha = new Float64Array(SIZE * SIZE);

  const c = SIZE / 2;
  const plateHalf = SIZE * 0.44;
  const plateR = SIZE * 0.17;

  // stroke geometry for the </> mark
  const w = SIZE * 0.055;                 // stroke half width
  const left = [
    [c - SIZE * 0.10, c - SIZE * 0.13, c - SIZE * 0.235, c],
    [c - SIZE * 0.235, c, c - SIZE * 0.10, c + SIZE * 0.13]
  ];
  const right = [
    [c + SIZE * 0.10, c - SIZE * 0.13, c + SIZE * 0.235, c],
    [c + SIZE * 0.235, c, c + SIZE * 0.10, c + SIZE * 0.13]
  ];
  const slash = [c + SIZE * 0.045, c - SIZE * 0.20, c - SIZE * 0.045, c + SIZE * 0.20];

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const i = y * SIZE + x;
      const p = [BG[0], BG[1], BG[2]];
      const sx = x + 0.5, sy = y + 0.5;

      const dPlate = roundRectDist(sx, sy, c, c, plateHalf, plateHalf, plateR);
      const aPlate = cover(dPlate);
      if (aPlate <= 0) { alpha[i] = 0; continue; }

      // plate with a soft diagonal gradient so it does not read as flat
      const g = clamp((sx + sy) / (SIZE * 2), 0, 1);
      const plate = [
        PLATE[0] + g * 10,
        PLATE[1] + g * 14,
        PLATE[2] + g * 22
      ];
      mix(p, plate, 1);

      // inner ring hint
      const ring = Math.abs(roundRectDist(sx, sy, c, c, plateHalf - SIZE * 0.035, plateHalf - SIZE * 0.035, plateR * 0.8)) - 1.5;
      mix(p, [58, 50, 42], cover(ring) * 0.9);

      // chevrons in green, slash in blue
      let dMark = Infinity;
      left.concat(right).forEach((s) => {
        dMark = Math.min(dMark, segDist(sx, sy, s[0], s[1], s[2], s[3]) - w);
      });
      mix(p, GREEN, cover(dMark));

      const dSlash = segDist(sx, sy, slash[0], slash[1], slash[2], slash[3]) - w * 0.82;
      mix(p, BLUE, cover(dSlash));

      px[i * 3] = p[0];
      px[i * 3 + 1] = p[1];
      px[i * 3 + 2] = p[2];
      alpha[i] = aPlate;
    }
  }

  const out = Buffer.alloc(SIZE * SIZE * 4);
  for (let i = 0; i < SIZE * SIZE; i++) {
    out[i * 4] = Math.round(clamp(px[i * 3], 0, 255));
    out[i * 4 + 1] = Math.round(clamp(px[i * 3 + 1], 0, 255));
    out[i * 4 + 2] = Math.round(clamp(px[i * 3 + 2], 0, 255));
    out[i * 4 + 3] = Math.round(clamp(alpha[i] * 255, 0, 255));
  }
  return out;
}

/* ----------------------------------------------------------- png encode */

const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

function encodePng(rgba, size) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;    // bit depth
  ihdr[9] = 6;    // colour type RGBA
  ihdr[10] = 0;   // deflate
  ihdr[11] = 0;   // adaptive filtering
  ihdr[12] = 0;   // no interlace

  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0;   // filter: none
    rgba.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  }

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

/* ------------------------------------------------------------------ run */

const target = path.join(__dirname, '..', 'build', 'icon.png');
fs.mkdirSync(path.dirname(target), { recursive: true });
fs.writeFileSync(target, encodePng(render(), SIZE));
console.log('wrote ' + target + ' (' + SIZE + 'x' + SIZE + ', ' + fs.statSync(target).size + ' bytes)');
