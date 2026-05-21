function md5(input: string): string {
  function rotateLeft(n: number, s: number): number {
    return (n << s) | (n >>> (32 - s));
  }

  function toHex(val: number): string {
    let hex = '';
    for (let i = 0; i < 4; i++) {
      hex += ((val >> (i * 8)) & 0xff).toString(16).padStart(2, '0');
    }
    return hex;
  }

  const bytes: number[] = [];
  for (let i = 0; i < input.length; i++) {
    bytes.push(input.charCodeAt(i) & 0xff);
  }

  const origLen = bytes.length * 8;
  bytes.push(0x80);
  while (bytes.length % 64 !== 56) {
    bytes.push(0);
  }

  for (let i = 0; i < 8; i++) {
    bytes.push((origLen >>> (i * 8)) & 0xff);
  }

  let a = 0x67452301, b = 0xefcdab89, c = 0x98badcfe, d = 0x10325476;

  const S = [
    7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
    5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
    4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
    6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
  ];

  const K = [
    0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee,
    0xf57c0faf, 0x4787c62a, 0xa8304613, 0xfd469501,
    0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be,
    0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821,
    0xf61e2562, 0xc040b340, 0x265e5a51, 0xe9b6c7aa,
    0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8,
    0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed,
    0xa9e3e905, 0xfcefa3f8, 0x676f02d9, 0x8d2a4c8a,
    0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c,
    0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70,
    0x289b7ec6, 0xeaa127fa, 0xd4ef3085, 0x04881d05,
    0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665,
    0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039,
    0x655b59c3, 0x8f0ccc92, 0xffeff47d, 0x85845dd1,
    0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1,
    0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391,
  ];

  for (let blockStart = 0; blockStart < bytes.length; blockStart += 64) {
    const M: number[] = [];
    for (let i = 0; i < 16; i++) {
      M[i] = bytes[blockStart + i * 4]! |
        (bytes[blockStart + i * 4 + 1]! << 8) |
        (bytes[blockStart + i * 4 + 2]! << 16) |
        (bytes[blockStart + i * 4 + 3]! << 24);
    }

    let A = a, B = b, C = c, D = d;

    for (let i = 0; i < 64; i++) {
      let f: number, g: number;
      if (i < 16) {
        f = (B & C) | (~B & D);
        g = i;
      } else if (i < 32) {
        f = (D & B) | (~D & C);
        g = (5 * i + 1) % 16;
      } else if (i < 48) {
        f = B ^ C ^ D;
        g = (3 * i + 5) % 16;
      } else {
        f = C ^ (B | ~D);
        g = (7 * i) % 16;
      }
      f = (f + A + K[i]! + M[g]!) >>> 0;
      A = D; D = C; C = B;
      B = (B + rotateLeft(f, S[i]!)) >>> 0;
    }

    a = (a + A) >>> 0;
    b = (b + B) >>> 0;
    c = (c + C) >>> 0;
    d = (d + D) >>> 0;
  }

  return toHex(a) + toHex(b) + toHex(c) + toHex(d);
}

export const COROS_BASE_URLS: Record<'cn' | 'eu' | 'us' | 'asia', string> = {
  cn: 'https://teamapi.coros.com',
  eu: 'https://teameuapi.coros.com',
  us: 'https://teamusapi.coros.com',
  asia: 'https://teamapapi.coros.com',
};

export function buildHeaders(accessToken: string): HeadersInit {
  return {
    'accessToken': accessToken,
    'Content-Type': 'application/json',
  };
}
