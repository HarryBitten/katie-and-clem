// Buildings, landmarks and props, all drawn in code.
let _seed = 7;
function rnd() { _seed = (_seed * 16807) % 2147483647; return _seed / 2147483647; }
const CREAM = '#f4f1e8';

function bricks(r, x, y, w, h, base) {
  r(x, y, w, h, base);
  const d = shade(base, -0.13);
  for (let j = 0; j < h; j += 3) r(x, y + j, w, 1, d);
  for (let j = 0, k = 0; j < h; j += 3, k++) for (let i = (k % 2 ? 0 : 3); i < w; i += 6) r(x + i, y + j + 1, 1, Math.min(2, h - j - 1), d);
}
function win(r, x, y, w, h, glass) {
  glass = glass || '#8fc4e8';
  r(x - 1, y - 1, w + 2, h + 2, CREAM); r(x, y, w, h, glass); r(x, y, w, 1, shade(glass, -0.2));
  r(x + (w >> 1), y, 1, h, CREAM); r(x, y + (h >> 1), w, 1, CREAM);
}
function door(r, x, y, w, h, c) {
  r(x - 1, y - 1, w + 2, h + 1, CREAM); r(x, y, w, h, c);
  r(x + 1, y + 1, w - 2, (h >> 1) - 2, shade(c, -0.18)); r(x + 1, y + (h >> 1) + 1, w - 2, (h >> 1) - 2, shade(c, -0.18));
  r(x + w - 2, y + (h >> 1), 1, 1, '#ffd93d');
}
function sign(text, o) {
  o = Object.assign({ bg: CREAM, fg: '#2b2b33', post: 10, edge: '#2b2b33' }, o);
  const w = textWidth(text) + 8;
  return mk(w, 13 + o.post, (r, g) => {
    if (o.post) { r(3, 12, 2, o.post + 1, '#6b4a2f'); r(w - 5, 12, 2, o.post + 1, '#6b4a2f'); }
    r(0, 0, w, 13, o.edge); r(1, 1, w - 2, 11, o.bg);
    drawText(g, text, 4, 3, o.fg);
  });
}
function house(o) {
  o = Object.assign({ wall: '#a8553a', roof: '#4d4f5c', door: '#2e6fb5', w: 58 }, o);
  const w = o.w;
  return mk(w, 60, (r) => {
    r(w - 17, 2, 6, 10, shade(o.wall, -0.2)); r(w - 18, 1, 8, 2, '#3a3a44');
    for (let i = 0; i < 10; i++) r(10 - i, 8 + i, w - 20 + 2 * i, 1, i % 3 === 2 ? shade(o.roof, -0.15) : o.roof);
    bricks(r, 3, 18, w - 6, 42, o.wall); r(2, 18, w - 4, 1, CREAM);
    win(r, 8, 23, 11, 9); win(r, w - 19, 23, 11, 9); win(r, (w >> 1) - 4, 23, 8, 9);
    win(r, 7, 41, 13, 11, o.glass); win(r, w - 20, 41, 13, 11);
    door(r, (w >> 1) - 4, 41, 9, 19, o.door);
    if (o.extra) o.extra(r);
  });
}
function tree(o) {
  o = Object.assign({ leaf: '#3f9a4a', dots: null }, o);
  return mk(26, 34, (r) => {
    r(11, 20, 4, 14, '#7a5230'); r(11, 20, 1, 14, '#5e3d22');
    disc(r, 13, 12, 10, shade(o.leaf, -0.15)); disc(r, 12, 10, 8, o.leaf); disc(r, 9, 7, 3, shade(o.leaf, 0.2));
    if (o.dots) for (let i = 0; i < 12; i++) r(4 + (rnd() * 18 | 0), 3 + (rnd() * 16 | 0), 2, 2, o.dots[i % o.dots.length]);
  });
}
function palm() {
  return mk(30, 42, (r) => {
    for (let y = 12; y < 42; y++) { const x = 13 + Math.round(Math.sin((y - 12) / 9) * 2); r(x, y, 3, 1, y % 4 === 0 ? '#6b4a2f' : '#8a6238'); }
    const g1 = '#2f9a4f', g2 = '#3fb563';
    [[2, 9], [0, 17], [27, 8], [29, 16], [6, 2], [23, 2], [14, 0]].forEach((p, i) => pline(r, 14, 11, p[0], p[1], i % 2 ? g1 : g2, 2));
    [[1, 13], [28, 12], [9, 4], [20, 4]].forEach(p => pline(r, 14, 11, p[0], p[1], g1, 1));
    r(13, 11, 2, 2, '#5e3d22'); r(16, 12, 2, 2, '#5e3d22');
  });
}
function arch(text, col) {
  return mk(70, 48, (r, g) => {
    r(2, 10, 4, 38, '#d9d9de'); r(64, 10, 4, 38, '#d9d9de'); r(2, 10, 1, 38, '#aaaab4'); r(64, 10, 1, 38, '#aaaab4');
    r(0, 0, 70, 13, col); r(0, 12, 70, 1, shade(col, -0.3));
    drawText(g, text, 35 - (textWidth(text) >> 1), 3, '#ffffff');
  });
}

function buildScenery() {
  const S = {};
  _seed = 7;
  // ---------- generic ----------
  S.tree = tree(); S.tree2 = tree({ leaf: '#2f8a5a' }); S.blossom = tree({ leaf: '#f2a7c3' });
  S.orange = tree({ leaf: '#3f9a4a', dots: ['#ff9f1c'] }); S.jungle = tree({ leaf: '#1f7a3f', dots: ['#2fa35a', '#17602f'] });
  S.autumn = tree({ leaf: '#e08a3c' });
  S.palm = palm();
  S.bush = mk(16, 9, (r) => { disc(r, 5, 5, 4, '#3f9a4a'); disc(r, 10, 5, 4, '#358a40'); r(4, 2, 2, 1, '#6fc27a'); });
  S.lamp = mk(8, 30, (r) => { r(3, 6, 2, 24, '#3a3a44'); r(1, 2, 6, 5, '#3a3a44'); r(2, 3, 4, 3, '#ffe9a6'); r(2, 29, 4, 1, '#3a3a44'); });
  S.postbox = mk(8, 14, (r) => { r(1, 1, 6, 13, '#c8324b'); r(0, 0, 8, 2, '#a3273c'); r(2, 4, 4, 1, '#2b2b33'); r(1, 12, 6, 2, '#2b2b33'); });
  S.bench = mk(20, 10, (r) => { r(1, 2, 18, 2, '#8a6238'); r(0, 5, 20, 2, '#8a6238'); r(2, 7, 2, 3, '#3a3a44'); r(16, 7, 2, 3, '#3a3a44'); });
  S.bucket = (cols) => mk(10, 12, (r) => {
    r(2, 7, 6, 5, '#9aa0aa'); r(1, 6, 8, 1, '#c3c8d0');
    for (let i = 0; i < 4; i++) { r(1 + i * 2, 3 + (i % 2), 1, 4, '#3c8d40'); r(1 + i * 2 - (i % 2 ? 0 : 0), 1 + (i % 2), 2, 2, cols[i % cols.length]); }
  });
  S.cloud = mk(30, 11, (r) => { disc(r, 8, 6, 4, '#ffffff'); disc(r, 15, 5, 5, '#ffffff'); disc(r, 22, 6, 4, '#ffffff'); r(4, 8, 22, 3, '#ffffff'); });
  S.heart = mk(7, 6, (r) => { r(1, 0, 2, 1, '#ff4f79'); r(4, 0, 2, 1, '#ff4f79'); r(0, 1, 7, 2, '#ff4f79'); r(1, 3, 5, 1, '#ff4f79'); r(2, 4, 3, 1, '#ff4f79'); r(3, 5, 1, 1, '#ff4f79'); r(1, 1, 1, 1, '#ffc2d1'); });
  S.note = mk(6, 8, (r) => { r(2, 0, 1, 6, '#ffffff'); r(3, 0, 3, 2, '#ffffff'); r(0, 5, 3, 3, '#ffffff'); });
  S.spark = mk(5, 5, (r) => { r(2, 0, 1, 5, '#fff7b0'); r(0, 2, 5, 1, '#fff7b0'); });

  // ---------- home & schools ----------
  S.home = house({ wall: '#a8553a', door: '#2e6fb5' });
  S.neighbour = house({ wall: '#b06045', door: '#3c8d40', w: 52 });
  S.churchfields = mk(100, 62, (r) => {
    r(0, 22, 100, 5, '#5a4a42');
    bricks(r, 2, 26, 96, 36, '#b0563c');
    for (let i = 0; i < 16; i++) r(50 - i - 2, 8 + i, (i + 2) * 2, 1, '#bd6347');
    bricks(r, 32, 24, 36, 38, '#bd6347'); r(31, 23, 38, 1, CREAM);
    r(46, 0, 8, 8, CREAM); r(45, 0, 10, 2, '#5a4a42'); r(49, 3, 2, 4, '#ffd93d');
    for (const x of [7, 19, 73, 85]) win(r, x, 32, 8, 16);
    win(r, 44, 14, 12, 9); door(r, 43, 42, 14, 20, '#2d7d5a'); r(50, 42, 1, 20, CREAM);
    r(38, 33, 24, 6, '#1f3a5f'); r(40, 35, 20, 1, '#ffd93d'); r(43, 37, 14, 1, '#ffd93d');
  });
  S.swing = mk(22, 22, (r) => { pline(r, 1, 21, 5, 1, '#c8324b'); pline(r, 21, 21, 17, 1, '#c8324b'); r(4, 0, 15, 2, '#c8324b'); r(8, 2, 1, 12, '#888'); r(14, 2, 1, 12, '#888'); r(7, 14, 9, 2, '#2e6fb5'); });
  S.ball = mk(6, 6, (r) => { disc(r, 3, 3, 2, '#ffd93d'); r(2, 2, 2, 1, '#c8324b'); });
  S.desk = mk(28, 22, (r) => {
    r(0, 12, 28, 2, '#8a6238'); r(2, 14, 2, 8, '#6b4a2f'); r(24, 14, 2, 8, '#6b4a2f');
    r(3, 9, 9, 3, '#2e6fb5'); r(4, 6, 8, 3, '#c8324b'); r(3, 3, 8, 3, '#3c8d40'); r(5, 0, 7, 3, '#ffd93d');
    r(20, 11, 5, 1, '#3a3a44'); r(22, 4, 1, 7, '#3a3a44'); r(18, 2, 6, 3, '#ff9f1c'); r(15, 10, 4, 2, '#ffffff');
  });
  S.books = mk(14, 20, (r) => {
    const c = ['#2e6fb5', '#c8324b', '#3c8d40', '#ffd93d', '#8e5bb5', '#ff9f1c'];
    for (let i = 0; i < 6; i++) { r(1 + (i % 2), 17 - i * 3, 12 - (i % 3), 3, c[i]); r(2 + (i % 2), 18 - i * 3, 1, 1, '#ffffff'); }
  });
  S.letter = mk(15, 11, (r) => { r(0, 0, 15, 11, '#ffffff'); pline(r, 0, 0, 7, 5, '#c3c8d0'); pline(r, 14, 0, 7, 5, '#c3c8d0'); r(0, 10, 15, 1, '#c3c8d0'); r(6, 4, 3, 3, '#c8324b'); });
  S.woodford = mk(124, 68, (r) => {
    const wall = '#efe3c4', wd = '#d9caa3';
    for (let i = 0; i < 8; i++) r(10 - i, 12 + i, 104 + 2 * i, 1, i % 3 === 2 ? '#454754' : '#555866');
    r(4, 20, 116, 44, wall); r(4, 20, 116, 1, wd); r(4, 40, 116, 1, wd);
    for (const x of [10, 23, 36, 82, 95, 108]) { win(r, x, 26, 7, 10); win(r, x, 46, 7, 12); }
    r(42, 18, 40, 46, '#f7eed6');
    for (let i = 0; i < 12; i++) r(62 - (i + 1) * 2 + 0, 6 + i, (i + 1) * 4, 1, i === 11 ? wd : '#f7eed6');
    disc(r, 62, 13, 3, '#ffffff'); r(62, 11, 1, 3, '#2b2b33'); r(62, 13, 2, 1, '#2b2b33');
    for (const x of [45, 54, 67, 76]) { r(x, 22, 3, 42, '#ffffff'); r(x, 22, 1, 42, '#ddd6c4'); r(x - 1, 21, 5, 2, '#ffffff'); }
    door(r, 58, 44, 8, 20, '#1f5a3f'); win(r, 58, 28, 8, 9);
    r(38, 64, 48, 4, '#b9bcc4'); r(40, 64, 44, 1, '#d3d6dc');
    r(0, 64, 38, 4, '#3f9a4a'); r(86, 64, 38, 4, '#3f9a4a');
  });
  S.examdesk = mk(16, 13, (r) => { r(0, 5, 16, 2, '#b98a55'); r(1, 7, 2, 6, '#6b4a2f'); r(13, 7, 2, 6, '#6b4a2f'); r(4, 3, 7, 2, '#ffffff'); r(5, 4, 5, 1, '#c3c8d0'); r(12, 2, 1, 3, '#2e6fb5'); });
  S.flowershop = mk(64, 54, (r, g) => {
    r(2, 4, 60, 50, '#f7d9c4'); r(0, 2, 64, 3, '#8a6238'); r(2, 5, 60, 1, shade('#f7d9c4', -0.12));
    r(6, 7, 52, 11, '#2d7d5a'); drawText(g, 'NEEDHAMS', 32 - (textWidth('NEEDHAMS') >> 1), 9, CREAM);
    for (let i = 0; i < 12; i++) r(2 + i * 5, 20, 5, 6, i % 2 ? '#ffffff' : '#ef7fb0');
    for (let i = 0; i < 12; i++) r(2 + i * 5 + 1, 26, 3, 1, i % 2 ? '#ffffff' : '#ef7fb0');
    r(5, 29, 32, 17, CREAM); r(6, 30, 30, 15, '#bfe3f2');
    const c = ['#ff6b9d', '#ffd93d', '#ffffff', '#c77dff', '#ff9f1c'];
    for (let i = 0; i < 9; i++) { r(8 + i * 3, 38 + (i % 2), 1, 7 - (i % 2), '#3c8d40'); r(7 + i * 3, 35 + (i % 3), 3, 3, c[i % 5]); }
    door(r, 43, 30, 12, 24, '#2d7d5a'); r(45, 33, 8, 8, '#bfe3f2');
    r(4, 46, 34, 8, '#e8c3aa');
  });

  // ---------- Bristol ----------
  S.bridge = mk(176, 74, (r) => {
    const st = '#cdb596', sd = '#b39a7a';
    for (let x = 42; x <= 134; x++) { const t = (x - 88) / 46, y = Math.round(42 - t * t * 32); r(x, y, 1, 1, '#f1f1f1'); if (x % 5 === 0) r(x, y, 1, 48 - y, 'rgba(255,255,255,.55)'); }
    for (let x = 0; x < 32; x++) { const y = Math.round(10 + (31 - x) * 1.15); r(x, y, 1, 1, '#f1f1f1'); r(175 - x, y, 1, 1, '#f1f1f1'); }
    r(0, 48, 176, 3, '#8a4f3f'); r(0, 51, 176, 1, '#6b3a2f');
    for (const tx of [31, 134]) { r(tx, 8, 11, 42, st); r(tx, 8, 2, 42, sd); r(tx - 1, 6, 13, 3, sd); r(tx + 3, 34, 5, 14, '#7b6a58'); r(tx + 4, 33, 3, 1, '#7b6a58'); }
    for (let y = 52; y < 74; y++) { const w = 30 + ((y - 52) * 0.6 | 0); r(0, y, w, 1, y % 5 === 0 ? '#5f8560' : '#6f9a6f'); r(176 - w, y, w, 1, y % 5 === 0 ? '#5f8560' : '#6f9a6f'); }
    r(0, 52, 30, 2, '#9a8f80'); r(146, 52, 30, 2, '#9a8f80');
    r(40, 70, 96, 4, '#5aa9d6');
  });
  S.terraces = mk(104, 36, (r) => {
    const c = ['#f7a8b8', '#a8d8f0', '#fbe38e', '#b8e0b0', '#f4b183', '#c9b6e8', '#8fd3c8', '#f29e9e'];
    for (let i = 0; i < 8; i++) {
      const x = i * 13, h = (i % 3) * 2;
      r(x, 8 - h, 13, 28 + h, c[i]); r(x, 5 - h, 13, 3, '#555866'); r(x + 12, 8 - h, 1, 28 + h, shade(c[i], -0.2));
      r(x + 2, 12 - h, 3, 4, '#ffffff'); r(x + 7, 12 - h, 3, 4, '#ffffff'); r(x + 2, 21, 3, 4, '#ffffff'); r(x + 7, 24, 3, 12, shade(c[i], -0.4));
    }
  });
  S.wills = mk(48, 94, (r) => {
    const st = '#dccba2', sd = '#c2b088', dk = '#6b5a4a';
    r(0, 60, 48, 34, st); r(0, 58, 48, 3, sd);
    for (const x of [3, 9, 35, 41]) { r(x, 66, 3, 10, dk); r(x, 82, 3, 8, dk); }
    r(13, 18, 22, 76, st); r(13, 18, 3, 76, sd);
    r(11, 10, 26, 10, st); r(11, 19, 26, 1, sd);
    for (const x of [11, 34]) { r(x, 3, 3, 8, st); r(x + 1, 1, 1, 2, st); }
    r(21, 0, 6, 11, st); r(23, 0, 2, 2, sd);
    for (const x of [15, 20, 25, 30]) r(x, 12, 3, 6, dk);
    r(18, 24, 4, 14, dk); r(26, 24, 4, 14, dk); r(18, 44, 12, 10, dk); r(23, 44, 2, 10, st);
    r(19, 74, 10, 20, '#5e3d22'); r(20, 73, 8, 1, '#5e3d22'); r(24, 74, 1, 20, '#3f2814');
  });
  S.party = [0, 1].map(f => mk(60, 46, (r) => {
    r(0, 8, 60, 38, '#3a3350'); r(0, 4, 60, 5, '#23202f');
    const c = ['#ff4f79', '#ffd93d', '#5ad6ff', '#8cff7a', '#c77dff'];
    let k = f * 2;
    for (const y of [13, 29]) for (const x of [5, 19, 33, 47]) { if (y === 29 && x === 19) continue; r(x - 1, y - 1, 10, 11, '#23202f'); r(x, y, 8, 9, c[(k++) % 5]); }
    r(18, 27, 11, 19, '#23202f'); r(19, 28, 9, 18, '#ffb347');
  }));
  S.disco = mk(11, 20, (r) => { r(5, 0, 1, 9, '#888'); disc(r, 5, 13, 5, '#c3c8d0'); for (let i = 0; i < 10; i++) r(1 + (rnd() * 9 | 0), 9 + (rnd() * 8 | 0), 2, 2, ['#ffffff', '#5ad6ff', '#ff4f79', '#ffd93d'][i % 4]); });
  S.speaker = mk(11, 16, (r) => { r(0, 0, 11, 16, '#23232b'); disc(r, 5, 5, 2, '#555866'); disc(r, 5, 11, 3, '#555866'); r(5, 11, 1, 1, '#aaa'); });
  S.balloon = (a, b) => mk(18, 28, (r) => {
    disc(r, 9, 9, 8, a); for (let y = 1; y < 18; y++) { r(5, y, 2, 1, b); r(11, y, 2, 1, b); }
    disc(r, 9, 9, 8, 'rgba(0,0,0,0)'); pline(r, 4, 16, 7, 23, '#6b4a2f'); pline(r, 14, 16, 11, 23, '#6b4a2f'); r(7, 23, 5, 4, '#8a6238');
    r(0, 0, 3, 3, 'rgba(0,0,0,0)');
  });
  S.plane = mk(30, 12, (r) => {
    r(4, 5, 22, 4, '#ffffff'); r(26, 6, 2, 2, '#ffffff'); r(2, 2, 4, 5, '#2e6fb5'); r(12, 8, 8, 2, '#c3c8d0'); r(10, 9, 6, 2, '#c3c8d0');
    for (let i = 0; i < 5; i++) r(10 + i * 3, 6, 1, 1, '#5aa9d6'); r(4, 9, 22, 1, '#d6dae0');
  });

  // ---------- travels ----------
  S.cactus = mk(15, 26, (r) => {
    const g1 = '#3f9a5a', g2 = '#2f7a45';
    r(6, 2, 4, 24, g1); r(6, 2, 1, 24, g2); r(1, 9, 2, 7, g1); r(1, 14, 6, 2, g1); r(12, 6, 2, 8, g1); r(9, 12, 5, 2, g1); r(7, 1, 2, 1, g1); r(8, 5, 1, 1, '#ff6b9d');
  });
  S.mesa = mk(110, 60, (r) => {
    const a = '#c9653a', b = '#b35530', c = '#de7d4b';
    const blk = (x, y, w, h) => { r(x, y, w, h, a); r(x, y, w, 2, c); for (let j = 6; j < h; j += 7) r(x, y + j, w, 1, b); r(x, y, 2, h, b); };
    blk(0, 40, 110, 20); blk(16, 8, 36, 34); blk(52, 20, 22, 22); blk(84, 12, 8, 30); blk(10, 30, 8, 12); blk(96, 30, 8, 12);
  });
  S.peak = mk(140, 96, (r) => {
    for (let y = 26; y < 96; y++) { const hw = Math.min(40, (y - 26) * 0.7 + 2); r(28 - hw, y, hw * 2, 1, y % 6 === 0 ? '#3f8a55' : '#4a9a62'); }
    for (let y = 2; y < 96; y++) { const hw = Math.min(54, (y - 2) * 0.62 + 2 + 2 * hash(y)); r(84 - hw, y, hw * 2, 1, y < 14 ? '#8a8f86' : (y % 5 === 0 ? '#2f7a45' : '#3f9a5a')); }
    for (let k = 0; k < 5; k++) { r(46 + k * 3, 66 + k * 6, 76 - k * 4, 2, '#c9c2ac'); r(46 + k * 3, 68 + k * 6, 76 - k * 4, 1, '#8f8a78'); }
    for (const p of [[56, 60], [70, 59], [88, 60], [100, 61]]) { r(p[0], p[1], 7, 6, '#b8b09a'); r(p[0] + 2, p[1] + 2, 2, 4, '#5e5a4e'); }
  });
  S.llama = mk(18, 20, (r) => {
    const w = '#f1e6d0', d = '#d9c9a8';
    r(3, 9, 10, 6, w); r(11, 2, 3, 9, w); r(11, 1, 5, 4, w); r(12, 0, 1, 1, d); r(14, 0, 1, 1, d); r(14, 2, 1, 1, '#2b2b33'); r(16, 3, 1, 1, '#2b2b33');
    r(4, 15, 2, 5, d); r(10, 15, 2, 5, w); r(2, 9, 1, 3, d);
    r(5, 8, 6, 4, '#c8324b'); r(5, 9, 6, 1, '#ffd93d'); r(5, 11, 6, 1, '#2e6fb5');
  });
  S.pagoda = mk(56, 68, (r) => {
    const red = '#b33a2b', gold = '#f2c14e', dark = '#3a2a2a';
    const roof = (y, w) => { r(28 - w / 2, y, w, 3, dark); r(28 - w / 2 - 2, y - 1, 3, 2, dark); r(28 + w / 2 - 1, y - 1, 3, 2, dark); r(28 - w / 2, y + 3, w, 1, gold); };
    r(27, 0, 2, 12, gold); r(26, 4, 4, 1, gold);
    r(20, 14, 16, 12, red); roof(11, 22);
    r(15, 30, 26, 14, red); roof(26, 34);
    r(9, 48, 38, 20, red); roof(44, 48);
    r(24, 54, 8, 14, gold); r(25, 55, 6, 13, dark); r(23, 18, 3, 5, gold); r(30, 18, 3, 5, gold); r(19, 34, 4, 6, gold); r(33, 34, 4, 6, gold);
    r(12, 52, 6, 8, gold); r(38, 52, 6, 8, gold);
  });
  S.boat = mk(40, 16, (r) => {
    pline(r, 2, 8, 34, 10, '#7a5230', 2); r(4, 9, 28, 4, '#8a6238'); r(6, 13, 24, 1, '#5e3d22');
    pline(r, 34, 10, 39, 1, '#7a5230', 2); r(37, 1, 2, 2, '#ff4f79'); r(36, 3, 2, 2, '#ffd93d'); r(37, 5, 2, 2, '#5ad6ff');
    r(12, 4, 12, 5, '#3ba7c9'); r(11, 3, 14, 1, '#ffffff');
  });
  S.lanterns = mk(46, 16, (r) => {
    r(0, 0, 1, 16, '#6b4a2f'); r(45, 0, 1, 16, '#6b4a2f');
    for (let x = 1; x < 45; x++) { const y = Math.round(1 + Math.sin(x / 44 * Math.PI) * 4); r(x, y, 1, 1, '#3a2a2a'); if (x % 8 === 4) { r(x - 1, y + 1, 3, 4, x % 16 === 4 ? '#ff4f4f' : '#ffb347'); r(x, y + 5, 1, 1, '#f2c14e'); } }
  });
  S.taj = mk(136, 80, (r) => {
    const w = '#fbf6ea', d = '#e3d9c4', dk = '#8f8674';
    r(0, 68, 136, 12, d); r(0, 68, 136, 1, w);
    for (const x of [6, 24, 108, 126]) { r(x, 18, 4, 50, w); r(x, 18, 1, 50, d); r(x - 1, 30, 6, 1, d); r(x - 1, 46, 6, 1, d); disc(r, x + 2, 15, 2, w); r(x + 2, 10, 1, 3, d); }
    r(38, 36, 60, 32, w); r(38, 36, 2, 32, d); r(36, 34, 64, 2, d);
    disc(r, 68, 24, 14, w); r(54, 30, 28, 6, w); r(67, 4, 2, 8, '#f2c14e'); r(57, 16, 2, 10, d);
    disc(r, 46, 30, 5, w); disc(r, 90, 30, 5, w); r(46, 22, 1, 3, '#f2c14e'); r(90, 22, 1, 3, '#f2c14e');
    r(61, 46, 14, 22, dk); r(63, 43, 10, 3, dk); r(65, 41, 6, 2, dk); r(64, 50, 8, 18, '#5e5a4e');
    for (const x of [43, 52, 80, 89]) { r(x, 42, 5, 8, dk); r(x + 1, 41, 3, 1, dk); r(x, 56, 5, 8, dk); r(x + 1, 55, 3, 1, dk); }
  });
  S.elephant = mk(34, 26, (r) => {
    const g1 = '#8f96a3', g2 = '#737a87';
    r(5, 6, 20, 13, g1); r(4, 8, 1, 8, g1); r(3, 9, 1, 5, g2);
    r(23, 3, 9, 11, g1); r(21, 5, 5, 8, g2); r(31, 8, 2, 11, g1); r(30, 18, 2, 2, g1); r(29, 13, 2, 1, '#ffffff');
    r(28, 6, 1, 1, '#2b2b33'); r(6, 19, 5, 7, g2); r(18, 19, 5, 7, g1); r(6, 25, 5, 1, '#5e6470'); r(18, 25, 5, 1, '#5e6470');
    r(9, 5, 11, 9, '#c8324b'); r(9, 5, 11, 1, '#f2c14e'); r(9, 13, 11, 1, '#f2c14e'); r(13, 8, 3, 3, '#f2c14e'); r(24, 2, 6, 2, '#f2c14e');
  });
  S.rickshaw = mk(28, 20, (r) => {
    r(4, 5, 18, 9, '#ffd23f'); r(3, 2, 20, 4, '#23232b'); r(22, 6, 3, 8, '#ffd23f'); r(24, 9, 2, 5, '#ffd23f');
    r(4, 12, 22, 3, '#2d9a4f'); r(8, 6, 6, 5, '#bfe3f2'); r(17, 6, 5, 5, '#bfe3f2');
    disc(r, 8, 16, 2, '#23232b'); disc(r, 21, 16, 2, '#23232b'); r(8, 16, 1, 1, '#aaa'); r(21, 16, 1, 1, '#aaa');
  });
  S.garland = mk(50, 26, (r) => {
    r(0, 0, 2, 26, '#8a6238'); r(48, 0, 2, 26, '#8a6238');
    for (let x = 2; x < 48; x++) { const y = Math.round(2 + Math.sin((x - 2) / 46 * Math.PI) * 8); r(x, y, 1, 2, x % 2 ? '#ff9f1c' : '#ffd23f'); if (x % 9 === 5) r(x, y + 2, 1, 4, '#ff6b3d'); }
  });
  S.stall = mk(30, 26, (r) => {
    for (let i = 0; i < 6; i++) r(i * 5, 0, 5, 5, i % 2 ? '#ffffff' : '#ff6b3d'); r(1, 5, 1, 21, '#6b4a2f'); r(28, 5, 1, 21, '#6b4a2f');
    r(0, 15, 30, 3, '#8a6238'); r(2, 18, 26, 8, '#a87a4a');
    const c = ['#ff9f1c', '#c8324b', '#ffd23f', '#8a5a2b', '#3c8d40'];
    for (let i = 0; i < 5; i++) { r(2 + i * 5.5 | 0, 12, 5, 3, c[i]); r((3 + i * 5.5) | 0, 11, 3, 1, c[i]); }
  });

  // ---------- work, dog, covid ----------
  S.aid = mk(80, 50, (r) => {
    r(2, 12, 76, 38, '#f1f1f4'); r(0, 8, 80, 5, '#2d6fb5'); r(2, 13, 76, 1, '#d6dae0'); r(2, 44, 76, 6, '#d6dae0');
    disc(r, 40, 23, 6, '#5aa9d6'); r(36, 20, 4, 3, '#6fc27a'); r(41, 23, 4, 4, '#6fc27a'); r(38, 26, 2, 2, '#6fc27a');
    r(38, 21, 2, 1, '#ff4f79'); r(41, 21, 2, 1, '#ff4f79'); r(37, 22, 7, 2, '#ff4f79'); r(38, 24, 5, 1, '#ff4f79'); r(39, 25, 3, 1, '#ff4f79'); r(40, 26, 1, 1, '#ff4f79');
    win(r, 8, 22, 12, 12); win(r, 60, 22, 12, 12); door(r, 35, 32, 10, 18, '#2d6fb5');
  });
  S.crate = mk(12, 11, (r) => { r(0, 0, 12, 11, '#b98a55'); r(0, 0, 12, 1, '#8a6238'); r(0, 10, 12, 1, '#8a6238'); r(0, 0, 1, 11, '#8a6238'); r(11, 0, 1, 11, '#8a6238'); r(4, 3, 1, 1, '#ff4f79'); r(6, 3, 1, 1, '#ff4f79'); r(3, 4, 5, 2, '#ff4f79'); r(4, 6, 3, 1, '#ff4f79'); r(5, 7, 1, 1, '#ff4f79'); });
  S.basket = mk(20, 9, (r) => { r(1, 3, 18, 6, '#a87a4a'); r(0, 2, 20, 2, '#8a6238'); r(3, 1, 14, 3, '#f29e9e'); for (let i = 0; i < 6; i++) r(2 + i * 3, 5, 1, 3, '#8a6238'); });
  S.bone = mk(8, 4, (r) => { r(1, 1, 6, 2, '#ffffff'); r(0, 0, 2, 4, '#ffffff'); r(6, 0, 2, 4, '#ffffff'); });
  S.virus = mk(11, 11, (r) => {
    disc(r, 5, 5, 3, '#7bc96f'); r(4, 4, 1, 1, '#4f9a45'); r(6, 6, 1, 1, '#4f9a45');
    for (const p of [[5, 0], [5, 10], [0, 5], [10, 5], [1, 1], [9, 1], [1, 9], [9, 9]]) r(p[0], p[1], 1, 1, '#ff4f4f');
    for (const p of [[5, 1], [5, 9], [1, 5], [9, 5], [2, 2], [8, 2], [2, 8], [8, 8]]) r(p[0], p[1], 1, 1, '#4f9a45');
  });
  S.loo = mk(14, 12, (r) => { for (const p of [[0, 6], [5, 6], [10, 6], [2, 0], [8, 0]]) { r(p[0], p[1], 4, 6, '#ffffff'); r(p[0] + 1, p[1] + 1, 2, 1, '#c3c8d0'); r(p[0], p[1] + 5, 4, 1, '#d6dae0'); } });
  const rainbowWin = (r) => { const c = ['#ff4f4f', '#ffb347', '#ffd93d', '#6fc27a', '#5aa9d6']; for (let i = 0; i < 5; i++) { r(40 + i, 44 + i, 9 - 2 * i, 1, c[i]); r(40 + i, 44 + i, 1, 6 - i, c[i]); r(48 - i, 44 + i, 1, 6 - i, c[i]); } };
  S.granny = house({ wall: '#d8c9a8', roof: '#6b4a42', door: '#7a3b8f', w: 60 });
  S.grannyIn = house({
    wall: '#d8c9a8', roof: '#6b4a42', door: '#7a3b8f', w: 60, glass: '#ffe9a6', extra: (r) => {
      r(8, 46, 4, 4, SKIN); r(8, 45, 4, 2, '#d9d9de'); r(7, 45, 2, 2, '#d9d9de'); r(8, 50, 5, 2, '#b784c9');
      r(15, 46, 4, 4, SKIN); r(15, 45, 4, 2, '#f2d15c'); r(14, 45, 2, 5, '#f2d15c'); r(15, 50, 5, 2, '#e8607a');
      rainbowWin(r);
    }
  });
  S.grannyAfter = house({ wall: '#d8c9a8', roof: '#6b4a42', door: '#7a3b8f', w: 60, extra: rainbowWin });
  S.rainbow = mk(120, 60, (r) => {
    const c = ['#ff6b6b', '#ffb347', '#ffe066', '#7bd389', '#6ab7ff', '#b28dff'];
    for (let i = 0; i < 6; i++) for (let a = 0; a <= 200; a++) { const t = Math.PI * a / 200, rad = 58 - i * 2; r(Math.round(60 + Math.cos(t) * rad), Math.round(60 - Math.sin(t) * rad), 2, 2, c[i]); }
  });

  // ---------- York ----------
  S.minster = mk(136, 104, (r) => {
    const st = '#e6dab6', sd = '#cdbf96', dk = '#6f6a5a', gl = '#5a6a8a';
    r(52, 8, 32, 40, sd); for (let i = 0; i < 6; i++) r(52 + i * 6, 5, 3, 4, sd); r(60, 16, 4, 16, dk); r(72, 16, 4, 16, dk);
    for (const x of [18, 94]) {
      r(x, 22, 24, 82, st); r(x, 22, 3, 82, sd); r(x - 1, 20, 26, 3, sd);
      r(x, 10, 3, 11, st); r(x + 21, 10, 3, 11, st); r(x + 10, 12, 4, 9, st); r(x + 1, 8, 1, 2, st); r(x + 22, 8, 1, 2, st);
      r(x + 6, 28, 4, 18, dk); r(x + 14, 28, 4, 18, dk); r(x + 7, 27, 2, 1, dk); r(x + 15, 27, 2, 1, dk);
      r(x + 6, 54, 12, 16, gl); r(x + 11, 54, 2, 16, st); r(x + 8, 52, 8, 2, gl);
      r(x + 8, 84, 8, 20, '#5e3d22'); r(x + 9, 83, 6, 1, '#5e3d22');
    }
    r(42, 44, 52, 60, st);
    for (let i = 0; i < 14; i++) r(68 - (i + 1) * 2, 30 + i, (i + 1) * 4, 1, st);
    r(67, 24, 2, 7, sd);
    r(58, 52, 20, 28, gl); r(60, 49, 16, 3, gl); r(63, 47, 10, 2, gl);
    for (const x of [62, 67, 72]) r(x, 49, 1, 31, st); r(58, 62, 20, 1, st);
    r(62, 86, 12, 18, '#5e3d22'); r(63, 85, 10, 1, '#5e3d22'); r(67, 86, 1, 18, '#3f2814');
  });
  S.bar = mk(76, 46, (r) => {
    const st = '#d9cba6', sd = '#bfb08a';
    r(0, 22, 76, 24, st); for (let i = 0; i < 10; i++) r(i * 8, 18, 5, 4, st); r(0, 26, 76, 1, sd); for (let i = 0; i < 12; i++) r(i * 7 + 2, 32 + (i % 2) * 6, 4, 1, sd);
    r(26, 6, 24, 40, st); r(26, 6, 2, 40, sd); r(24, 0, 6, 10, st); r(46, 0, 6, 10, st); r(31, 3, 4, 3, st); r(39, 3, 4, 3, st); r(36, 2, 4, 4, st);
    r(32, 26, 12, 20, '#4a4238'); r(34, 23, 8, 3, '#4a4238'); r(36, 12, 4, 6, '#4a4238'); r(36, 10, 4, 1, '#c8324b');
  });
  S.yorkHome = house({ wall: '#b5683f', roof: '#5b4a40', door: '#c8324b', w: 58 });
  S.windmill = [0, 1].map(f => mk(40, 50, (r) => {
    for (let y = 20; y < 50; y++) { const hw = 5 + ((y - 20) / 8 | 0); r(20 - hw, y, hw * 2, 1, '#fbf6ea'); r(20 - hw, y, 2, 1, '#e3d9c4'); }
    r(15, 15, 10, 6, '#2e6fb5'); r(18, 40, 4, 10, '#6b4a2f'); r(18, 28, 3, 4, '#5a6a8a');
    const pts = f ? [[6, 4], [34, 32], [34, 4], [6, 32]] : [[20, 0], [20, 36], [2, 18], [38, 18]];
    pline(r, pts[0][0], pts[0][1], pts[1][0], pts[1][1], '#8a6238', 2); pline(r, pts[2][0], pts[2][1], pts[3][0], pts[3][1], '#8a6238', 2);
    r(19, 17, 3, 3, '#3a3a44');
  }));

  // ---------- marathon, baby, wedding ----------
  S.startArch = arch('START', '#2e9a5a'); S.finishArch = arch('FINISH', '#c8324b');
  S.barrier = mk(24, 10, (r) => { r(0, 1, 24, 6, '#2e6fb5'); r(0, 1, 24, 1, '#c3c8d0'); r(2, 7, 1, 3, '#888'); r(21, 7, 1, 3, '#888'); r(4, 3, 16, 2, '#ffffff'); });
  S.water = mk(20, 14, (r) => { r(0, 5, 20, 2, '#ffffff'); r(1, 7, 18, 7, '#5aa9d6'); for (let i = 0; i < 5; i++) { r(2 + i * 4, 2, 2, 3, '#bfe3f2'); } });
  S.bunting = mk(64, 12, (r) => {
    const c = ['#ff4f79', '#ffd93d', '#5ad6ff', '#8cff7a', '#ffffff'];
    for (let x = 0; x < 64; x++) { const y = Math.round(Math.sin(x / 63 * Math.PI) * 4); r(x, y, 1, 1, '#ffffff'); }
    for (let i = 0; i < 8; i++) { const x = 2 + i * 8, y = Math.round(Math.sin((x + 2) / 63 * Math.PI) * 4) + 1; r(x, y, 5, 1, c[i % 5]); r(x + 1, y + 1, 3, 2, c[i % 5]); r(x + 2, y + 3, 1, 1, c[i % 5]); }
  });
  S.medal = mk(7, 10, (r) => { r(1, 0, 2, 5, '#2e6fb5'); r(4, 0, 2, 5, '#c8324b'); disc(r, 3, 7, 2, '#ffd23f'); r(3, 7, 1, 1, '#fff7b0'); });
  S.washing = mk(58, 30, (r) => {
    r(1, 0, 2, 30, '#8a6238'); r(55, 0, 2, 30, '#8a6238');
    for (let x = 3; x < 55; x++) r(x, Math.round(2 + Math.sin((x - 3) / 52 * Math.PI) * 3), 1, 1, '#ffffff');
    r(10, 5, 7, 5, '#fff7d6'); r(8, 5, 2, 3, '#fff7d6'); r(17, 5, 2, 3, '#fff7d6'); r(10, 10, 3, 3, '#fff7d6'); r(14, 10, 3, 3, '#fff7d6'); r(13, 7, 1, 1, '#ffd93d');
    r(24, 6, 3, 5, '#bfe3f2'); r(26, 9, 3, 2, '#bfe3f2'); r(31, 6, 3, 5, '#bfe3f2'); r(33, 9, 3, 2, '#bfe3f2');
    r(40, 5, 8, 4, '#ffc2d1'); r(42, 9, 4, 2, '#ffc2d1'); r(43, 5, 2, 1, '#ffffff');
  });
  S.pram = mk(20, 18, (r, g) => {
    disc(r, 8, 8, 6, '#2e4a7a'); g.clearRect(0, 8, 20, 10);
    r(2, 8, 13, 5, '#3a5fa0'); r(2, 8, 13, 1, '#ffffff'); pline(r, 15, 9, 19, 3, '#888'); r(17, 3, 3, 1, '#23232b');
    disc(r, 4, 15, 2, '#23232b'); disc(r, 13, 15, 2, '#23232b'); r(4, 15, 1, 1, '#aaa'); r(13, 15, 1, 1, '#aaa');
  });
  S.teddy = mk(9, 10, (r) => { const b = '#b98a55'; r(2, 1, 5, 4, b); r(1, 0, 2, 2, b); r(6, 0, 2, 2, b); r(2, 5, 5, 4, b); r(0, 5, 2, 2, b); r(7, 5, 2, 2, b); r(1, 8, 2, 2, b); r(6, 8, 2, 2, b); r(3, 2, 1, 1, '#2b2b33'); r(5, 2, 1, 1, '#2b2b33'); r(4, 6, 1, 2, '#e3c79a'); });
  S.flowerArch = mk(48, 60, (r) => {
    const c = ['#ff8fb3', '#ffffff', '#ffd93d', '#ffc2d1', '#f2a7c3'];
    for (let a = 0; a <= 120; a++) { const t = Math.PI * a / 120; for (let k = 0; k < 4; k++) r(Math.round(24 + Math.cos(t) * (19 + k)), Math.round(24 - Math.sin(t) * (19 + k)), 1, 1, k % 2 ? '#3c8d40' : '#4fae56'); }
    r(2, 24, 4, 36, '#4fae56'); r(42, 24, 4, 36, '#4fae56'); r(2, 24, 1, 36, '#3c8d40'); r(42, 24, 1, 36, '#3c8d40');
    for (let i = 0; i < 26; i++) { const t = Math.PI * rnd(), rad = 19 + rnd() * 3; r(Math.round(23 + Math.cos(t) * rad), Math.round(23 - Math.sin(t) * rad), 2, 2, c[i % 5]); }
    for (let i = 0; i < 14; i++) { r(1 + (rnd() * 4 | 0), 26 + (rnd() * 32 | 0), 2, 2, c[i % 5]); r(41 + (rnd() * 4 | 0), 26 + (rnd() * 32 | 0), 2, 2, c[(i + 2) % 5]); }
  });
  S.church = mk(92, 108, (r) => {
    const st = '#ddd0b5', sd = '#c2b494', dk = '#6b5a4a';
    r(26, 56, 66, 52, st);
    for (let i = 0; i < 18; i++) r(59 - (i + 1) * 2 + 1, 38 + i, (i + 1) * 4 - 2, 1, '#6b4a42');
    r(0, 30, 26, 78, st); r(0, 30, 3, 78, sd); r(0, 28, 26, 3, sd);
    for (let i = 0; i < 22; i++) r(13 - (i >> 1) - 1, 28 - 22 + i, (i >> 1) * 2 + 2, 1, '#5b5d6b');
    r(12, 0, 2, 7, '#f2c14e'); r(10, 2, 6, 2, '#f2c14e');
    disc(r, 13, 42, 4, '#ffffff'); r(13, 39, 1, 4, dk); r(13, 42, 3, 1, dk);
    r(9, 54, 8, 14, dk); r(10, 53, 6, 1, dk); r(10, 56, 6, 5, '#f2c14e');
    disc(r, 59, 66, 5, '#7aa5d6'); r(59, 61, 1, 11, st); r(54, 66, 11, 1, st);
    r(52, 82, 14, 26, '#6b3f2a'); r(54, 79, 10, 3, '#6b3f2a'); r(59, 82, 1, 26, '#4a2a1a');
    r(32, 76, 6, 16, '#7aa5d6'); r(33, 75, 4, 1, '#7aa5d6'); r(80, 76, 6, 16, '#7aa5d6'); r(81, 75, 4, 1, '#7aa5d6');
  });
  S.pew = mk(12, 12, (r) => { r(0, 0, 2, 12, '#ffffff'); r(0, 6, 12, 2, '#ffffff'); r(10, 8, 2, 4, '#ffffff'); r(0, 1, 3, 2, '#ff8fb3'); });
  S.stand = mk(10, 20, (r) => { r(3, 9, 4, 11, '#ffffff'); r(2, 8, 6, 2, '#e3d9c4'); r(1, 19, 8, 1, '#e3d9c4'); disc(r, 5, 4, 4, '#4fae56'); r(2, 2, 2, 2, '#ff8fb3'); r(6, 1, 2, 2, '#ffffff'); r(4, 5, 2, 2, '#ffd93d'); r(7, 5, 2, 2, '#ffc2d1'); r(1, 6, 2, 2, '#ffffff'); });
  return S;
}
