const VERSION = 5;
const SIZE = 17 + VERSION * 4;
const DATA_CODEWORDS = 108;
const EC_CODEWORDS = 26;
const FORMAT_XOR = 0x5412;
const FORMAT_POLY = 0x537;
const PRIMITIVE = 0x11d;

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function getBit(value, bit) {
  return ((value >>> bit) & 1) !== 0;
}

function pushBits(bits, value, length) {
  for (let i = length - 1; i >= 0; i -= 1) {
    bits.push((value >>> i) & 1);
  }
}

function toDataCodewords(text) {
  const bytes = new TextEncoder().encode(text);
  if (bytes.length > 106) {
    throw new Error("QR payload is too long for this QR code version.");
  }

  const bits = [];
  pushBits(bits, 0x4, 4);
  pushBits(bits, bytes.length, 8);
  for (const byte of bytes) pushBits(bits, byte, 8);
  const capacityBits = DATA_CODEWORDS * 8;
  const terminator = Math.min(4, capacityBits - bits.length);
  for (let i = 0; i < terminator; i += 1) bits.push(0);
  while (bits.length % 8 !== 0) bits.push(0);

  const codewords = [];
  for (let i = 0; i < bits.length; i += 8) {
    let value = 0;
    for (let j = 0; j < 8; j += 1) value = (value << 1) | bits[i + j];
    codewords.push(value);
  }
  for (let pad = 0xec; codewords.length < DATA_CODEWORDS; pad ^= 0xec ^ 0x11) {
    codewords.push(pad);
  }
  return codewords;
}

function gfTables() {
  const exp = Array(512).fill(0);
  const log = Array(256).fill(0);
  let value = 1;
  for (let i = 0; i < 255; i += 1) {
    exp[i] = value;
    log[value] = i;
    value <<= 1;
    if (value & 0x100) value ^= PRIMITIVE;
  }
  for (let i = 255; i < 512; i += 1) exp[i] = exp[i - 255];
  return { exp, log };
}

const GF = gfTables();

function gfMultiply(a, b) {
  if (!a || !b) return 0;
  return GF.exp[GF.log[a] + GF.log[b]];
}

function reedSolomonGenerator(degree) {
  let poly = [1];
  for (let i = 0; i < degree; i += 1) {
    const next = Array(poly.length + 1).fill(0);
    for (let j = 0; j < poly.length; j += 1) {
      next[j] ^= gfMultiply(poly[j], GF.exp[i]);
      next[j + 1] ^= poly[j];
    }
    poly = next;
  }
  return poly;
}

function reedSolomonRemainder(data, degree) {
  const generator = reedSolomonGenerator(degree);
  const result = Array(degree).fill(0);
  for (const byte of data) {
    const factor = byte ^ result.shift();
    result.push(0);
    for (let i = 0; i < degree; i += 1) {
      result[i] ^= gfMultiply(generator[i], factor);
    }
  }
  return result;
}

function blankMatrix() {
  return {
    modules: Array.from({ length: SIZE }, () => Array(SIZE).fill(null)),
    functionModules: Array.from({ length: SIZE }, () => Array(SIZE).fill(false)),
  };
}

function setFunction(matrix, x, y, dark) {
  if (x < 0 || y < 0 || x >= SIZE || y >= SIZE) return;
  matrix.modules[y][x] = Boolean(dark);
  matrix.functionModules[y][x] = true;
}

function drawFinder(matrix, x, y) {
  for (let dy = -1; dy <= 7; dy += 1) {
    for (let dx = -1; dx <= 7; dx += 1) {
      const xx = x + dx;
      const yy = y + dy;
      if (xx < 0 || yy < 0 || xx >= SIZE || yy >= SIZE) continue;
      const dark = dx >= 0 && dx <= 6 && dy >= 0 && dy <= 6
        && (dx === 0 || dx === 6 || dy === 0 || dy === 6 || (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4));
      setFunction(matrix, xx, yy, dark);
    }
  }
}

function drawAlignment(matrix, centerX, centerY) {
  for (let dy = -2; dy <= 2; dy += 1) {
    for (let dx = -2; dx <= 2; dx += 1) {
      setFunction(
        matrix,
        centerX + dx,
        centerY + dy,
        Math.max(Math.abs(dx), Math.abs(dy)) === 2 || (dx === 0 && dy === 0),
      );
    }
  }
}

function formatBits(mask) {
  let data = (0b01 << 3) | mask;
  let bits = data << 10;
  for (let i = 14; i >= 10; i -= 1) {
    if (((bits >>> i) & 1) !== 0) bits ^= FORMAT_POLY << (i - 10);
  }
  return ((data << 10) | bits) ^ FORMAT_XOR;
}

function drawFormatBits(matrix, mask) {
  const bits = formatBits(mask);
  for (let i = 0; i <= 5; i += 1) setFunction(matrix, 8, i, getBit(bits, i));
  setFunction(matrix, 8, 7, getBit(bits, 6));
  setFunction(matrix, 8, 8, getBit(bits, 7));
  setFunction(matrix, 7, 8, getBit(bits, 8));
  for (let i = 9; i < 15; i += 1) setFunction(matrix, 14 - i, 8, getBit(bits, i));
  for (let i = 0; i < 8; i += 1) setFunction(matrix, SIZE - 1 - i, 8, getBit(bits, i));
  for (let i = 8; i < 15; i += 1) setFunction(matrix, 8, SIZE - 15 + i, getBit(bits, i));
  setFunction(matrix, 8, SIZE - 8, true);
}

function drawFunctionPatterns(matrix) {
  drawFinder(matrix, 0, 0);
  drawFinder(matrix, SIZE - 7, 0);
  drawFinder(matrix, 0, SIZE - 7);
  drawAlignment(matrix, 30, 30);
  for (let i = 8; i < SIZE - 8; i += 1) {
    setFunction(matrix, 6, i, i % 2 === 0);
    setFunction(matrix, i, 6, i % 2 === 0);
  }
  setFunction(matrix, 8, 4 * VERSION + 9, true);
  drawFormatBits(matrix, 0);
}

function maskBit(x, y) {
  return (x + y) % 2 === 0;
}

function drawCodewords(matrix, codewords) {
  let bitIndex = 0;
  let upward = true;
  for (let right = SIZE - 1; right >= 1; right -= 2) {
    if (right === 6) right -= 1;
    for (let vert = 0; vert < SIZE; vert += 1) {
      const y = upward ? SIZE - 1 - vert : vert;
      for (let x = right; x >= right - 1; x -= 1) {
        if (matrix.modules[y][x] !== null) continue;
        const byte = codewords[Math.floor(bitIndex / 8)] || 0;
        const bit = ((byte >>> (7 - (bitIndex % 8))) & 1) !== 0;
        matrix.modules[y][x] = bit !== maskBit(x, y);
        bitIndex += 1;
      }
    }
    upward = !upward;
  }
  for (let y = 0; y < SIZE; y += 1) {
    for (let x = 0; x < SIZE; x += 1) {
      if (matrix.modules[y][x] === null) matrix.modules[y][x] = false;
    }
  }
}

function qrMatrix(text) {
  const data = toDataCodewords(text);
  const ec = reedSolomonRemainder(data, EC_CODEWORDS);
  const matrix = blankMatrix();
  drawFunctionPatterns(matrix);
  drawCodewords(matrix, [...data, ...ec]);
  return matrix.modules;
}

export function qrSvg(text, options = {}) {
  const border = Number(options.border ?? 4);
  const scale = Number(options.scale ?? 6);
  const modules = qrMatrix(text);
  const width = (SIZE + border * 2) * scale;
  const cells = [];
  for (let y = 0; y < SIZE; y += 1) {
    for (let x = 0; x < SIZE; x += 1) {
      if (modules[y][x]) cells.push(`M${x + border},${y + border}h1v1h-1z`);
    }
  }
  const title = escapeXml(`QR for ${text}`);
  return `<svg xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${title}" viewBox="0 0 ${SIZE + border * 2} ${SIZE + border * 2}" width="${width}" height="${width}"><title>${title}</title><rect width="100%" height="100%" fill="#fff"/><path d="${cells.join("")}" fill="#000"/></svg>`;
}
