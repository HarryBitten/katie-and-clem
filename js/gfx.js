// Drawing helpers and the character sprites. Everything is drawn in code.
function mk(w, h, fn) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d');
  const r = (x, y, w2, h2, col) => { g.fillStyle = col; g.fillRect(x, y, w2, h2); };
  fn(r, g, c);
  return c;
}
function flipX(c) {
  return mk(c.width, c.height, (r, g) => { g.translate(c.width, 0); g.scale(-1, 1); g.drawImage(c, 0, 0); });
}
function pline(r, x0, y0, x1, y1, col, t = 1) {
  let dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1, err = dx - dy;
  for (;;) {
    r(x0, y0, t, t, col);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 > -dy) { err -= dy; x0 += sx; }
    if (e2 < dx) { err += dx; y0 += sy; }
  }
}
function disc(r, cx, cy, rad, col) {
  for (let y = -rad; y <= rad; y++) {
    const w = Math.floor(Math.sqrt(rad * rad - y * y + rad * 0.8));
    r(cx - w, cy + y, w * 2 + 1, 1, col);
  }
}
function ring(r, cx, cy, rad, col) {
  for (let a = 0; a < 64; a++) {
    const t = a / 64 * Math.PI * 2;
    r(Math.round(cx + Math.cos(t) * rad), Math.round(cy + Math.sin(t) * rad), 1, 1, col);
  }
}
function hex2rgb(h) { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
function rgb(a) { return 'rgb(' + (a[0] | 0) + ',' + (a[1] | 0) + ',' + (a[2] | 0) + ')'; }
function mix(a, b, t) { const x = hex2rgb(a), y = hex2rgb(b); return rgb([x[0] + (y[0] - x[0]) * t, x[1] + (y[1] - x[1]) * t, x[2] + (y[2] - x[2]) * t]); }
function shade(h, amt) { return amt < 0 ? mix(h, '#000000', -amt) : mix(h, '#ffffff', amt); }
function hash(n) { n = Math.sin(n * 127.1 + 311.7) * 43758.5453; return n - Math.floor(n); }

const SKIN = '#f3c9a3', SKIN_D = '#dba882';

// A little person facing right. Returns [stand, stride, pass] frames.
function person(o) {
  o = Object.assign({ skin: SKIN, hair: '#6b4423', style: 'short', top: '#c0392b', bottom: '#34495e', shoes: '#2b2b33', body: 7, legs: 6 }, o);
  const y0 = o.hat ? 6 : 3, yb = y0 + 6, yl = yb + o.body, ys = yl + o.legs, ox = 7;
  const topD = shade(o.top, -0.22), hairD = shade(o.hair, -0.18);
  const frames = [];
  for (let f = 0; f < 3; f++) frames.push(mk(20, ys + 1, (r) => {
    // things behind the body
    if (o.veil) { r(ox - 3, y0 - 1, 3, 3, '#ffffff'); r(ox - 4, y0 + 2, 4, o.body + 5, 'rgba(255,255,255,.8)'); }
    if (o.style === 'long') { r(ox - 2, y0, 3, 4, o.hair); r(ox - 2, y0 + 4, 3, o.long || 5, hairD); }
    if (o.style === 'pony') { r(ox - 3, y0 + 1, 3, 2, o.hair); r(ox - 4, y0 + 2, 2, 5, hairD); }
    if (o.backpack) { r(ox - 4, yb, 4, 7, o.backpack); r(ox - 4, yb + 2, 4, 1, shade(o.backpack, -0.25)); r(ox - 3, yb - 2, 3, 2, shade(o.backpack, 0.2)); }
    // head
    r(ox, y0, 6, 6, o.skin); r(ox, y0 + 5, 1, 1, SKIN_D);
    if (o.style !== 'bald') {
      r(ox, y0 - 1, 6, 2, o.hair); r(ox - 1, y0, 2, 4, o.hair); r(ox + 5, y0 + 1, 1, 1, o.hair);
      if (o.style === 'bob') r(ox - 1, y0, 2, 6, o.hair);
      if (o.style === 'bun') r(ox - 2, y0 - 2, 3, 3, o.hair);
      if (o.style === 'long' || o.style === 'pony') r(ox - 1, y0, 2, 5, o.hair);
    } else {
      r(ox + 1, y0, 2, 1, shade(o.skin, 0.35)); r(ox + 1, y0 + 3, 1, 1, SKIN_D);
    }
    r(ox + 4, y0 + 2, 1, 2, '#2b2b33');
    if (o.blush) r(ox + 5, y0 + 4, 1, 1, '#f0a0a0');
    if (o.glasses) { r(ox + 3, y0 + 2, 3, 1, '#444'); }
    if (o.beard) r(ox + 3, y0 + 4, 3, 2, o.beard);
    if (o.helmet) { r(ox - 1, y0 - 2, 7, 3, o.helmet); r(ox + 5, y0, 2, 1, shade(o.helmet, -0.3)); r(ox + 1, y0 - 1, 3, 1, shade(o.helmet, 0.4)); }
    if (o.hat) { r(ox, y0 - 5, 6, 5, '#23232b'); r(ox - 1, y0 - 1, 8, 1, '#23232b'); r(ox, y0 - 2, 6, 1, '#c8324b'); }
    if (o.mask) r(ox + 3, y0 + 3, 3, 3, '#bfe3f2');
    // body
    r(ox, yb, 6, o.body, o.top);
    if (o.collar) r(ox + 2, yb, 4, 1, o.collar);
    if (o.tie) r(ox + 4, yb + 1, 1, 3, o.tie);
    if (o.bowtie) r(ox + 4, yb, 2, 1, o.bowtie);
    if (o.bump) { r(ox + 6, yb + 2, 1, o.body - 2, o.top); r(ox + 7, yb + 3, 1, o.body - 4, o.top); }
    if (o.bib) { r(ox + 2, yb + 2, 4, 3, '#ffffff'); r(ox + 3, yb + 3, 2, 1, '#444'); }
    if (o.apron) r(ox + 3, yb + 2, 3, o.body - 2, o.apron);
    // arm
    const ax = ox + 2 + [0, 1, -1][f];
    if (o.wave) { r(ox + 4, yb - 2 - (f === 1 ? 1 : 0), 2, 4, topD); r(ox + 4, yb - 4 - (f === 1 ? 1 : 0), 2, 2, o.skin); }
    else { r(ax, yb + 1, 2, o.body - 3, topD); r(ax, yb + o.body - 2, 2, 1, o.skin); }
    if (o.bouquet) { r(ax + 2, yb + 2, 4, 3, '#ef7fb0'); r(ax + 3, yb + 2, 1, 1, '#ffffff'); r(ax + 5, yb + 3, 1, 1, '#ffd93d'); r(ax + 3, yb + 5, 2, 2, '#3c8d40'); }
    // legs
    if (o.gown) {
      const gd = shade(o.gown, -0.12);
      r(ox, yl, 6, 1, o.gown); r(ox - 1, yl + 1, 8, 2, o.gown); r(ox - 2, yl + 3, 10, o.legs - 2, o.gown);
      r(ox - 5, ys - 1, 4, 2, o.gown); r(ox - 2, ys, 10, 1, gd); r(ox + 1, yl + 2, 1, o.legs - 2, gd); r(ox + 4, yl + 3, 1, o.legs - 3, gd);
      if (o.bump) r(ox + 6, yl, 1, 1, o.gown);
    } else {
      const lc = (o.skirt || o.shorts) ? o.skin : o.bottom, ld = shade(lc.startsWith('#') ? lc : '#888888', -0.15);
      if (f === 0) { r(ox + 1, yl, 2, o.legs, lc); r(ox + 3, yl, 2, o.legs, ld); r(ox + 1, ys, 2, 1, o.shoes); r(ox + 3, ys, 3, 1, o.shoes); }
      if (f === 1) { r(ox + 1, yl, 4, 1, lc); r(ox, yl + 1, 2, o.legs - 1, ld); r(ox + 4, yl + 1, 2, o.legs - 1, lc); r(ox, ys, 2, 1, o.shoes); r(ox + 4, ys, 3, 1, o.shoes); }
      if (f === 2) { r(ox + 2, yl, 2, o.legs, lc); r(ox + 2, ys, 3, 1, o.shoes); }
      if (o.skirt) { r(ox, yl, 6, 1, o.skirt); r(ox - 1, yl + 1, 8, Math.min(3, o.legs - 1), o.skirt); }
      if (o.shorts) r(ox + 1, yl, 4, 2, o.shorts);
    }
  }));
  return frames;
}

// Someone on a bike, facing right. Returns 2 frames.
function rider(o) {
  o = Object.assign({ skin: SKIN, hair: '#6b4423', top: '#e67e22', bottom: '#23232b', shoes: '#eeeeee', bike: '#d63b3b', style: 'short' }, o);
  const topD = shade(o.top, -0.22);
  const frames = [];
  for (let f = 0; f < 2; f++) frames.push(mk(32, 34, (r) => {
    const wy = 28;
    for (const cx of [7, 24]) {
      ring(r, cx, wy, 5, '#23232b');
      if (f === 0) { pline(r, cx - 3, wy, cx + 3, wy, '#9aa0aa'); pline(r, cx, wy - 3, cx, wy + 3, '#9aa0aa'); }
      else { pline(r, cx - 2, wy - 2, cx + 2, wy + 2, '#9aa0aa'); pline(r, cx - 2, wy + 2, cx + 2, wy - 2, '#9aa0aa'); }
      r(cx, wy, 1, 1, '#555');
    }
    // far leg
    const bd = shade(o.bottom.startsWith('#') ? o.bottom : '#333333', 0.18);
    if (f === 0) { pline(r, 13, 18, 15, 22, bd, 2); pline(r, 15, 22, 13, 25, bd, 2); }
    else { pline(r, 13, 18, 17, 23, bd, 2); pline(r, 17, 23, 17, 29, bd, 2); }
    // frame
    pline(r, 7, 28, 12, 19, o.bike); pline(r, 12, 19, 15, 28, o.bike); pline(r, 15, 28, 22, 19, o.bike);
    pline(r, 12, 20, 22, 19, o.bike); pline(r, 22, 18, 24, 28, o.bike); pline(r, 22, 15, 22, 19, '#555');
    r(22, 15, 3, 1, '#23232b'); r(10, 18, 4, 1, '#23232b');
    // long hair behind
    if (o.style === 'long' || o.style === 'pony') { r(13, 5, 3, 3, o.hair); r(12, 7, 3, 5, shade(o.hair, -0.18)); }
    // torso
    pline(r, 11, 15, 16, 10, o.top, 3); r(12, 16, 3, 2, o.bottom);
    // near leg
    if (f === 0) { pline(r, 13, 17, 17, 22, o.bottom, 2); pline(r, 17, 22, 17, 29, o.bottom, 2); r(17, 30, 3, 1, o.shoes); }
    else { pline(r, 13, 17, 16, 21, o.bottom, 2); pline(r, 16, 21, 13, 25, o.bottom, 2); r(13, 26, 3, 1, o.shoes); }
    // arm
    pline(r, 18, 11, 22, 14, topD, 2); r(22, 14, 2, 1, o.skin);
    // head
    r(16, 3, 6, 6, o.skin);
    if (o.style !== 'bald') { r(16, 2, 6, 2, o.hair); r(15, 3, 2, 4, o.hair); }
    else r(17, 3, 2, 1, shade(o.skin, 0.35));
    r(20, 5, 1, 2, '#2b2b33');
    if (o.blush) r(21, 7, 1, 1, '#f0a0a0');
    if (o.helmet) { r(15, 1, 7, 3, o.helmet); r(21, 3, 2, 1, shade(o.helmet, -0.3)); r(17, 2, 3, 1, shade(o.helmet, 0.4)); }
    if (o.hat) { r(16, 0, 6, 3, '#23232b'); r(15, 3, 8, 1, '#23232b'); r(16, 2, 6, 1, '#c8324b'); }
    if (o.bowtie) r(18, 9, 2, 1, o.bowtie);
  }));
  return frames;
}

// Stanley the Yorkshire terrier. 2 frames.
function yorkie(bow) {
  const tan = '#cf8f45', tanD = '#a86d2c', coat = '#56657a', coatD = '#3f4c5e';
  const frames = [];
  for (let f = 0; f < 2; f++) frames.push(mk(14, 10, (r) => {
    r(2, 4, 8, 3, coat); r(2, 6, 8, 1, coatD); r(3, 3, 6, 1, coat);
    r(1, 1, 1, 3, tan); r(0, 1, 1, 1, tanD);                         // tail
    r(8, 1, 5, 4, tan); r(8, 0, 1, 1, tanD); r(11, 0, 1, 1, tanD);   // head + ears
    r(9, 1, 2, 1, '#e3ab63');                                        // fringe
    r(11, 2, 1, 1, '#1d1d22'); r(13, 3, 1, 1, '#1d1d22'); r(12, 3, 1, 2, tan); r(9, 5, 2, 2, tan);
    if (f === 0) { r(2, 7, 1, 3, tan); r(4, 7, 1, 2, tanD); r(8, 7, 1, 2, tanD); r(10, 7, 1, 3, tan); }
    else { r(3, 7, 1, 3, tan); r(5, 7, 1, 2, tanD); r(7, 7, 1, 2, tanD); r(9, 7, 1, 3, tan); }
    if (bow) { r(8, 5, 3, 1, '#c8324b'); }
  }));
  return frames;
}
