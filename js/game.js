// Katie & Clem: a walk around the world, one life stage at a time.
(() => {
  const W = 384, H = 216, R = 540, GY = 150, CX = W / 2, CY = GY + R;
  const cv = document.getElementById('game'), ctx = cv.getContext('2d');
  let K = 3;
  function resize() {
    const sc = Math.max(1, Math.floor(Math.min(innerWidth / W, innerHeight / H)));
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    K = sc * dpr;
    cv.width = W * K; cv.height = H * K;
    cv.style.width = W * sc + 'px'; cv.style.height = H * sc + 'px';
  }
  addEventListener('resize', resize); resize();
  const params = new URLSearchParams(location.search);
  const DEBUG = params.has('debug');

  // ------------------------------------------------------------------ zones
  const GRASS = { top: ['#5cb85c', '#52ad52'], mid: '#3d8b3d', soil: '#7a5230', speck: '#5e3d22', deco: 'grass' };
  const FLOWERS = Object.assign({}, GRASS, { deco: 'flowers' });
  const DARKG = { top: ['#2f6a4a', '#2a6044'], mid: '#1f4a35', soil: '#3f2f2a', speck: '#2a1f1c', deco: 'grass' };
  const DESERT = { top: ['#e2a85f', '#d99a50'], mid: '#c4813d', soil: '#a5642c', speck: '#8a4f20', deco: 'sand' };
  const LUSH = { top: ['#3fa34d', '#34913f'], mid: '#2a7a35', soil: '#6b4a2a', speck: '#4f361d', deco: 'grass' };
  const BEACH = { top: ['#f2dc9b', '#ead08a'], mid: '#d9bb70', soil: '#b89655', speck: '#9a7a40', deco: 'sand' };
  const DUST = { top: ['#dba56a', '#d0985c'], mid: '#b87f47', soil: '#8f5f35', speck: '#734a27', deco: 'sand' };
  const PAVE = { top: ['#b9bcc4', '#b0b3bc'], mid: '#8e919b', soil: '#6b5a4a', speck: '#54463a', deco: 'paving' };
  const GREY = { top: ['#7f9a7f', '#748f74'], mid: '#5f7a62', soil: '#5e4a3a', speck: '#4a3a2e', deco: 'grass' };
  const ROAD = { top: ['#6f747e', '#6a6f79'], mid: '#c9b27a', soil: '#b0935a', speck: '#8f7645', deco: 'road' };
  const ROAD2 = { top: ['#6f747e', '#6a6f79'], mid: '#3d8b3d', soil: '#7a5230', speck: '#5e3d22', deco: 'road' };
  const CARPET = { top: ['#c8324b', '#c02f47'], mid: '#3d8b3d', soil: '#7a5230', speck: '#5e3d22', deco: 'carpet' };

  const Z = [];
  function zone(id, len, o) { const x0 = Z.length ? Z[Z.length - 1].x1 : 0; Z.push(Object.assign({ id, x0, x1: x0 + len, night: 0 }, o)); }
  zone('home', 420, { sky: ['#7ec8f0', '#d6f0ff'], ground: GRASS, far: ['city', '#b4cfe0'] });
  zone('church', 480, { sky: ['#7ec8f0', '#d6f0ff'], ground: GRASS, far: ['hills', '#a5d6ae'] });
  zone('study', 350, { sky: ['#f39a62', '#fde3b0'], ground: GRASS, far: ['hills', '#e0a67c'] });
  zone('woodford', 600, { sky: ['#6fb7ee', '#cfeaff'], ground: GRASS, far: ['trees', '#93cc9e'] });
  zone('flower', 400, { sky: ['#8fd3f4', '#e8f8ff'], ground: FLOWERS, far: ['hills', '#a9dcb2'] });
  zone('bristol', 380, { sky: ['#74b9e8', '#dff3ff'], ground: GRASS, far: ['hills', '#a2cfa6'] });
  zone('party', 370, { sky: ['#17153a', '#3a2a6b'], ground: DARKG, far: ['city', '#2a2455'], night: 1 });
  zone('usa', 500, { sky: ['#f5a65b', '#fde0a8'], ground: DESERT, far: ['mesa', '#de8c58'] });
  zone('sa', 500, { sky: ['#69b7e6', '#d4f1e4'], ground: LUSH, far: ['mountains', '#86b5a2'] });
  zone('sea', 500, { sky: ['#5ec8e8', '#f6f0c8'], ground: BEACH, far: ['sea', '#3ba7c9'] });
  zone('india', 800, { sky: ['#ff9a6b', '#ffe1a6'], ground: DUST, far: ['domes', '#e89a78'] });
  zone('aid', 600, { sky: ['#7ec8f0', '#e3f5ff'], ground: PAVE, far: ['city', '#adc3d9'] });
  zone('stanley', 400, { sky: ['#7ec8f0', '#e3f5ff'], ground: GRASS, far: ['trees', '#93cc9e'] });
  zone('covid', 420, { sky: ['#7d8794', '#b7bec6'], ground: GREY, far: ['city', '#8f99a6'] });
  zone('after', 180, { sky: ['#6fc0f2', '#e6f8ff'], ground: FLOWERS, far: ['hills', '#a5d6ae'] });
  zone('york', 600, { sky: ['#86c5ee', '#e6f6ff'], ground: GRASS, far: ['hills', '#a9cfa4'] });
  zone('mallorca', 600, { sky: ['#39a9f0', '#c9efff'], ground: ROAD, far: ['sea', '#2f9ad0'] });
  zone('marathon', 600, { sky: ['#86c5ee', '#e6f6ff'], ground: ROAD2, far: ['city', '#adc3d9'] });
  zone('baby', 400, { sky: ['#f4a9c0', '#ffeeda'], ground: FLOWERS, far: ['hills', '#e3b7c0'] });
  zone('wedpath', 200, { sky: ['#8fc8ff', '#ffe4ec'], ground: FLOWERS, far: ['hills', '#b5dcb6'] });
  zone('aisle', 420, { sky: ['#8fc8ff', '#ffe4ec'], ground: CARPET, far: ['hills', '#b5dcb6'] });
  Z.forEach(z => { z.skyN = z.sky.map(hex2rgb); });
  const zi = {}; Z.forEach((z, i) => { zi[z.id] = i; });
  const zx = (id, off) => Z[zi[id]].x0 + (off || 0);
  const END_X = zx('aisle', 248), ALTAR_X = zx('aisle', 272);
  function zoneAt(x) { for (let i = 0; i < Z.length; i++) if (x < Z[i].x1) return Z[i]; return Z[Z.length - 1]; }

  // ------------------------------------------------------------------ sprites
  const S = buildScenery();
  const pset = (o) => { const f = person(o); return { r: f, l: f.map(flipX) }; };
  const rset = (o) => { const f = rider(o); return { r: f, l: f.map(flipX) }; };
  const oneset = (s) => ({ r: [s], l: [flipX(s)] });
  const BLONDE = '#f2d15c';
  const KT = { hair: BLONDE, style: 'long', blush: true };
  const Katie = {
    child: pset(Object.assign({}, KT, { top: '#e8607a', bottom: '#3a4a7a', body: 5, legs: 3, long: 3 })),
    teen: pset(Object.assign({}, KT, { top: '#2e4a7a', skirt: '#3a3a44', collar: '#ffffff', body: 6, legs: 5, long: 4 })),
    adult: pset(Object.assign({}, KT, { top: '#2bb3a3', bottom: '#3a5fa0' })),
    mask: pset(Object.assign({}, KT, { top: '#2bb3a3', bottom: '#3a5fa0', mask: true })),
    travel: pset(Object.assign({}, KT, { top: '#fff7d6', shorts: '#b08a55', backpack: '#ff7f3f', shoes: '#6b4a2f' })),
    run: pset(Object.assign({}, KT, { style: 'pony', top: '#ff5fa2', shorts: '#23232b', bib: true, shoes: '#5ad6ff' })),
    preg: pset(Object.assign({}, KT, { top: '#f29e9e', bottom: '#4a4a66', bump: true })),
    bride: pset(Object.assign({}, KT, { top: '#ffffff', gown: '#ffffff', veil: true, bouquet: true, bump: true })),
    bike: rset({ hair: BLONDE, style: 'long', blush: true, helmet: '#ff5fa2', top: '#2bb3a3', bike: '#8e5bb5' }),
  };
  const SPEED = { child: 52, teen: 56, adult: 60, mask: 54, travel: 62, bike: 108, run: 90, preg: 50, bride: 34 };
  const ClemS = {
    normal: rset({ hair: '#4a3423', helmet: '#2e6fb5', top: '#ffd23f', bike: '#d63b3b' }),
    groom: rset({ hair: '#4a3423', hat: true, bowtie: '#c8324b', top: '#3a3a44', bottom: '#3a3a44', shoes: '#23232b', bike: '#d63b3b' }),
  };
  const StanS = { normal: (() => { const f = yorkie(false); return { r: f, l: f.map(flipX) }; })(), bow: (() => { const f = yorkie(true); return { r: f, l: f.map(flipX) }; })() };
  const P = {
    dad: pset({ style: 'bald', top: '#3c6e9a', bottom: '#4a4a55' }),
    mum: pset({ hair: '#5a3520', style: 'bob', top: '#8e5bb5', bottom: '#3a3a55', blush: true }),
    sis: pset({ hair: '#7a4a28', style: 'long', top: '#ffb347', bottom: '#3a5fa0', body: 6, legs: 5, long: 4, blush: true }),
    bro1: pset({ hair: '#8a5a2b', top: '#3c9a5a', bottom: '#3a4a7a', body: 4, legs: 2 }),
    bro2: pset({ hair: '#8a5a2b', top: '#2e8fd0', bottom: '#4a4a55', body: 4, legs: 2 }),
    kid1: pset({ hair: '#23232b', style: 'bob', skin: '#c68e63', top: '#ffd23f', bottom: '#3a4a7a', body: 5, legs: 3 }),
    kid2: pset({ hair: '#c8552b', style: 'pony', top: '#5ad6a0', bottom: '#3a4a7a', body: 5, legs: 3, blush: true }),
    kid3: pset({ hair: '#5a3520', top: '#5a9ae8', bottom: '#4a4a55', body: 5, legs: 3 }),
    teen1: pset({ hair: '#23232b', style: 'long', skin: '#b87c52', top: '#2e4a7a', skirt: '#3a3a44', collar: '#ffffff', body: 6, legs: 5, long: 4 }),
    teen2: pset({ hair: '#c8552b', style: 'pony', top: '#2e4a7a', skirt: '#3a3a44', collar: '#ffffff', body: 6, legs: 5, blush: true }),
    teen3: pset({ hair: '#6b4423', style: 'bob', skin: '#e3b28a', top: '#2e4a7a', skirt: '#3a3a44', collar: '#ffffff', body: 6, legs: 5 }),
    uni1: pset({ hair: '#23232b', top: '#ff4f79', bottom: '#23232b', skin: '#8f5a3a' }),
    uni2: pset({ hair: '#e8c35a', style: 'bun', top: '#5ad6ff', skirt: '#8e5bb5', blush: true }),
    uni3: pset({ hair: '#6b4423', top: '#8cff7a', bottom: '#3a5fa0', beard: '#6b4423' }),
    uni4: pset({ hair: '#c8552b', style: 'long', top: '#ffd23f', skirt: '#ff4f79' }),
    granny: pset({ hair: '#dcdce2', style: 'bun', top: '#b784c9', skirt: '#6b5b7b', body: 6, legs: 4, glasses: true }),
    grannyW: pset({ hair: '#dcdce2', style: 'bun', top: '#b784c9', skirt: '#6b5b7b', body: 6, legs: 4, glasses: true, wave: true }),
    fan1: pset({ hair: '#23232b', top: '#ff9f1c', bottom: '#3a5fa0', wave: true, skin: '#c68e63' }),
    fan2: pset({ hair: '#e8c35a', style: 'long', top: '#5ad6ff', bottom: '#4a4a55', wave: true }),
    fan3: pset({ hair: '#6b4423', top: '#8cff7a', bottom: '#3a3a44', wave: true, beard: '#6b4423' }),
    fan4: pset({ hair: '#c8552b', style: 'bob', top: '#ff4f79', bottom: '#3a5fa0', wave: true }),
    // wedding guests
    wDad: pset({ style: 'bald', top: '#3a3a44', bottom: '#3a3a44', collar: '#ffffff', tie: '#c8324b' }),
    wMum: pset({ hair: '#5a3520', style: 'bob', top: '#c77dff', skirt: '#c77dff', blush: true }),
    wSis: pset({ hair: '#7a4a28', style: 'long', top: '#ffb347', skirt: '#ffb347', blush: true }),
    wBro1: pset({ hair: '#8a5a2b', top: '#2e4a7a', bottom: '#2e4a7a', collar: '#ffffff', bowtie: '#3c9a5a' }),
    wBro2: pset({ hair: '#8a5a2b', top: '#4a4a66', bottom: '#4a4a66', collar: '#ffffff', bowtie: '#2e8fd0' }),
    wF1: pset({ hair: '#23232b', style: 'long', skin: '#b87c52', top: '#5ad6a0', skirt: '#5ad6a0' }),
    wF2: pset({ hair: '#c8552b', style: 'pony', top: '#ff8fb3', skirt: '#ff8fb3', blush: true }),
    wF3: pset({ hair: '#6b4423', style: 'bob', skin: '#e3b28a', top: '#6ab7ff', skirt: '#6ab7ff' }),
    llama: oneset(S.llama), elephant: oneset(S.elephant),
    rDad: rset({ style: 'bald', helmet: '#ffffff', top: '#ff7f3f', bike: '#2e6fb5' }),
    rBro: rset({ hair: '#8a5a2b', helmet: '#3c9a5a', top: '#5ad6ff', bike: '#23232b' }),
  };
  const SIGN = {
    woodford: sign('SOUTH WOODFORD'), church: sign('CHURCHFIELDS SCHOOL', { bg: '#1f3a5f', fg: '#ffffff' }),
    wchs1: sign('WOODFORD COUNTY', { bg: '#1f5a3f', fg: '#ffffff', post: 0 }), wchs2: sign('HIGH SCHOOL', { bg: '#1f5a3f', fg: '#ffffff', post: 8 }),
    bristol: sign('BRISTOL'), uni: sign('UNIVERSITY OF BRISTOL', { bg: '#8a1f2b', fg: '#ffffff' }), history: sign('HISTORY', { bg: '#f7eed6', post: 6 }),
    dep: sign('DEPARTURES >', { bg: '#ffd23f' }), usa: sign('USA', { bg: '#2e4a9a', fg: '#ffffff' }), sa: sign('SOUTH AMERICA', { bg: '#2d9a4f', fg: '#ffffff' }),
    sea: sign('SOUTH EAST ASIA', { bg: '#e8607a', fg: '#ffffff' }), india: sign('INDIA', { bg: '#ff9f1c', fg: '#ffffff' }),
    aid: sign('HUMANITARIAN AID', { bg: '#2d6fb5', fg: '#ffffff' }), stay: sign('STAY HOME', { bg: '#c8324b', fg: '#ffffff' }),
    two: sign('< 2 METRES >', { bg: '#ffd23f' }), north: sign('THE NORTH >', { bg: '#2d6fb5', fg: '#ffffff' }), york: sign('YORK'),
    sale: sign('FOR SALE', { bg: '#2e9a5a', fg: '#ffffff' }), sold: sign('SOLD!', { bg: '#c8324b', fg: '#ffffff' }),
    mallorca: sign('MALLORCA', { bg: '#ff9f1c', fg: '#ffffff' }), miles: sign('26.2 MILES', { bg: '#ffffff' }),
    baby: sign('BABY ON BOARD', { bg: '#ffd23f' }), wed: sign('KATIE ~ CLEM', { bg: '#ffd9e4', fg: '#c8324b', edge: '#c8324b' }),
  };

  // ------------------------------------------------------------------ keepsakes
  const stamp = (col, fn) => mk(9, 9, (r) => { r(0, 0, 9, 9, '#ffffff'); r(1, 1, 7, 7, col); for (let i = 0; i < 9; i += 2) { r(i, 0, 1, 1, col); r(i, 8, 1, 1, col); r(0, i, 1, 1, col); r(8, i, 1, 1, col); } fn(r); });
  const ITEMS = [
    { id: 'flower', spr: mk(9, 9, (r) => { r(4, 4, 1, 5, '#3c8d40'); r(5, 6, 2, 1, '#3c8d40'); r(3, 0, 3, 5, '#ff6b9d'); r(2, 1, 5, 3, '#ff6b9d'); r(4, 2, 1, 1, '#ffd93d'); }) },
    { id: 'usa', spr: stamp('#2e4a9a', (r) => { r(4, 2, 1, 5, '#ffffff'); r(2, 4, 5, 1, '#ffffff'); r(3, 3, 3, 3, '#ffffff'); }) },
    { id: 'sa', spr: stamp('#2d9a4f', (r) => { r(4, 2, 1, 1, '#ffffff'); r(3, 3, 3, 1, '#ffffff'); r(2, 4, 5, 3, '#ffffff'); r(3, 5, 1, 1, '#2d9a4f'); }) },
    { id: 'sea', spr: stamp('#e8607a', (r) => { r(4, 1, 1, 1, '#ffffff'); r(3, 2, 3, 1, '#ffffff'); r(2, 4, 5, 1, '#ffffff'); r(3, 3, 3, 1, '#ffffff'); r(3, 5, 3, 2, '#ffffff'); }) },
    { id: 'india', spr: stamp('#ff9f1c', (r) => { r(4, 1, 1, 1, '#ffffff'); r(3, 2, 3, 2, '#ffffff'); r(2, 4, 5, 3, '#ffffff'); r(1, 3, 1, 4, '#ffffff'); r(7, 3, 1, 4, '#ffffff'); r(4, 5, 1, 2, '#ff9f1c'); }) },
    { id: 'key', spr: mk(9, 9, (r) => { r(0, 2, 4, 5, '#ffd23f'); r(1, 3, 2, 3, '#b8860b'); r(4, 4, 5, 1, '#ffd23f'); r(6, 5, 1, 2, '#ffd23f'); r(8, 5, 1, 2, '#ffd23f'); }) },
    { id: 'medal', spr: mk(9, 9, (r) => { r(2, 0, 2, 4, '#2e6fb5'); r(5, 0, 2, 4, '#c8324b'); disc(r, 4, 6, 2, '#ffd23f'); r(4, 6, 1, 1, '#fff7b0'); }) },
  ];
  const itemBy = {}; ITEMS.forEach(it => { itemBy[it.id] = it; });

  // ------------------------------------------------------------------ world
  const objs = [], npcs = [];
  function add(spr, x, layer, o) {
    const ob = Object.assign({ x, layer: layer || 0, sink: layer ? 0 : 3, lift: 0 }, o);
    if (Array.isArray(spr)) { ob.frames = spr; ob.spr = spr[0]; ob.rate = ob.rate || 3; } else ob.spr = spr;
    objs.push(ob); return ob;
  }
  function npc(set, x, o) { const n = Object.assign({ set, x, face: -1, mode: 'greet', ph: hash(x) * 6, y: 0 }, o); npcs.push(n); return n; }
  const ref = {};
  (function buildWorld() {
    let x = zx('home');
    add(S.neighbour, x + 22); add(S.home, x + 112); add(S.tree, x + 232); add(S.tree2, x + 350);
    add(SIGN.woodford, x + 196, 1); add(S.postbox, x + 268, 1); add(S.lamp, x + 304, 1); add(S.bush, x + 385, 1);
    npc(P.mum, x + 124, { face: 1 }); npc(P.dad, x + 138, { face: 1 }); npc(P.sis, x + 76, { face: 1 }); npc(P.bro1, x + 158); npc(P.bro2, x + 170);

    x = zx('church');
    add(S.tree, x + 30); add(S.churchfields, x + 230); add(S.tree2, x + 390); add(S.tree, x + 440);
    add(SIGN.church, x + 110, 1); add(S.swing, x + 320, 1); add(S.ball, x + 196, 1); add(S.bush, x + 60, 1); add(S.lamp, x + 462, 1);
    npc(P.kid1, x + 186); npc(P.kid2, x + 206); npc(P.kid3, x + 290);

    x = zx('study');
    add(S.autumn, x + 30); add(S.autumn, x + 250);
    add(S.desk, x + 70, 1); add(S.books, x + 104, 1); add(S.books, x + 130, 1); add(S.desk, x + 180, 1); add(S.books, x + 214, 1);
    ref.letter = add(S.letter, x + 290, 1, { lift: 12, bob: 1 });

    x = zx('woodford');
    add(S.tree2, x + 30); add(S.woodford, x + 220); add(S.tree, x + 330); add(S.blossom, x + 560);
    add(SIGN.wchs2, x + 96, 1); add(SIGN.wchs1, x + 96, 1, { lift: SIGN.wchs2.height - 1 });
    npc(P.teen1, x + 150); npc(P.teen2, x + 168); npc(P.teen3, x + 186);
    for (const d of [390, 440, 490]) add(S.examdesk, x + d, 1);
    add(S.bush, x + 530, 1);

    x = zx('flower');
    add(S.blossom, x + 40); add(S.flowershop, x + 170); add(S.blossom, x + 300); add(S.tree, x + 370);
    const fc = [['#ff6b9d', '#ffd93d', '#ffffff'], ['#c77dff', '#ffffff', '#ff9f1c'], ['#ffd93d', '#ff6b9d', '#c77dff']];
    [110, 122, 214, 226, 238].forEach((d, i) => add(S.bucket(fc[i % 3]), x + d, 1));
    add(S.bench, x + 330, 1);

    x = zx('bristol');
    add(S.bridge, x + 150, 0, { sink: 8 }); add(S.wills, x + 310);
    add(SIGN.bristol, x + 26, 1); add(SIGN.uni, x + 236, 1); add(S.books, x + 345, 1); add(SIGN.history, x + 364, 1);
    add(S.balloon('#ff6b6b', '#ffd93d'), x + 70, 0, { lift: 78, bob: 2 }); add(S.balloon('#5aa9d6', '#ffffff'), x + 190, 0, { lift: 100, bob: 2 }); add(S.balloon('#8e5bb5', '#ff9f1c'), x + 290, 0, { lift: 88, bob: 2 });

    x = zx('party');
    add(S.terraces, x + 70); add(S.party, x + 200, 0, { rate: 4 }); add(S.terraces, x + 320);
    add(S.disco, x + 200, 0, { lift: 46 });
    add(S.speaker, x + 160, 1); add(S.speaker, x + 242, 1); add(S.lamp, x + 110, 1); add(S.lamp, x + 300, 1);
    npc(P.uni1, x + 176, { mode: 'dance' }); npc(P.uni2, x + 192, { mode: 'dance' }); npc(P.uni3, x + 212, { mode: 'dance' }); npc(P.uni4, x + 228, { mode: 'dance' });

    x = zx('usa');
    add(S.mesa, x + 250, 0, { sink: 5 }); add(S.mesa, x + 440, 0, { sink: 18 });
    add(SIGN.dep, x + 24, 1); add(SIGN.usa, x + 84, 1);
    for (const d of [130, 178, 330, 372, 470]) add(S.cactus, x + d, 1);

    x = zx('sa');
    add(S.jungle, x + 70); add(S.jungle, x + 96); add(S.peak, x + 260, 0, { sink: 6 }); add(S.jungle, x + 420); add(S.palm, x + 462);
    add(SIGN.sa, x + 34, 1);
    npc(P.llama, x + 150); npc(P.llama, x + 370, { face: 1 });

    x = zx('sea');
    add(S.palm, x + 96); add(S.pagoda, x + 250); add(S.palm, x + 400); add(S.palm, x + 440);
    add(S.lanterns, x + 180, 0, { lift: 12 }); add(S.lanterns, x + 320, 0, { lift: 12 });
    add(SIGN.sea, x + 40, 1); add(S.palm, x + 130, 1); add(S.boat, x + 348, 1, { sink: 4 }); add(S.palm, x + 476, 1);

    x = zx('india');
    add(S.garland, x + 110, 0, { lift: 4 }); add(S.palm, x + 290); add(S.taj, x + 430, 0, { sink: 4 }); add(S.garland, x + 630, 0, { lift: 4 }); add(S.palm, x + 770);
    add(SIGN.india, x + 36, 1); add(S.stall, x + 170, 1); add(S.rickshaw, x + 250, 1); add(S.stall, x + 690, 1); add(S.rickshaw, x + 735, 1);
    npc(P.elephant, x + 570);

    x = zx('aid');
    add(S.aid, x + 170); add(S.tree, x + 290); add(S.tree2, x + 520);
    add(SIGN.aid, x + 80, 1); add(S.crate, x + 228, 1); add(S.crate, x + 241, 1); add(S.crate, x + 234, 1, { lift: 11 });
    add(S.bench, x + 460, 1); add(S.lamp, x + 560, 1);

    x = zx('stanley');
    add(S.tree, x + 30); add(S.tree2, x + 300); add(S.tree, x + 370);
    add(S.bone, x + 150, 1); add(S.basket, x + 180, 1); add(S.ball, x + 215, 1); add(S.bush, x + 100, 1); add(S.bush, x + 262, 1);

    x = zx('covid');
    ref.gran = add(S.granny, x + 300); add(S.autumn, x + 380);
    add(SIGN.stay, x + 70, 1); add(S.loo, x + 120, 1); add(SIGN.two, x + 190, 1); add(S.lamp, x + 244, 1);
    ref.granny = npc(P.granny, x + 322);
    ref.virus = [];
    for (let i = 0; i < 9; i++) ref.virus.push(add(S.virus, x + 30 + i * 46, 0, { lift: 34 + hash(i) * 46, bob: 3, ph: i }));
    ref.door = x + 300;

    x = zx('after');
    add(S.rainbow, x + 90, 0, { lift: 2, sink: 0 }); add(S.tree, x + 40); add(S.blossom, x + 150);
    add(SIGN.north, x + 112, 1);

    x = zx('york');
    add(S.bar, x + 90); add(S.minster, x + 240, 0, { sink: 4 }); ref.yhome = add(S.yorkHome, x + 430); add(S.tree, x + 520);
    add(SIGN.york, x + 34, 1); ref.sale = add(SIGN.sale, x + 380, 1); add(S.lamp, x + 480, 1); add(S.bush, x + 560, 1);
    ref.saleX = x + 380;

    x = zx('mallorca');
    add(S.palm, x + 120); add(S.windmill, x + 210, 0, { rate: 5 }); add(S.orange, x + 290); add(S.palm, x + 350); add(S.orange, x + 410); add(S.windmill, x + 500, 0, { rate: 5 });
    add(SIGN.mallorca, x + 66, 1);

    x = zx('marathon');
    add(S.startArch, x + 100); add(S.tree, x + 220); add(S.tree2, x + 480); add(S.finishArch, x + 545);
    add(S.bunting, x + 170, 0, { lift: 30 }); add(S.bunting, x + 330, 0, { lift: 30 }); add(S.bunting, x + 470, 0, { lift: 30 });
    const fans = [P.fan1, P.fan2, P.fan3, P.fan4];
    [150, 166, 182, 310, 326, 342, 358, 440, 456, 500].forEach((d, i) => npc(fans[i % 4], x + d, { mode: 'cheer', face: i % 2 ? 1 : -1 }));
    for (const d of [166, 334, 448]) add(S.barrier, x + d, 1);
    add(S.water, x + 262, 1); add(SIGN.miles, x + 400, 1);

    x = zx('baby');
    add(S.blossom, x + 50); add(S.washing, x + 170); add(S.blossom, x + 340);
    add(SIGN.baby, x + 96, 1); add(S.pram, x + 232, 1); add(S.teddy, x + 252, 1); add(S.bench, x + 296, 1);

    x = zx('wedpath');
    add(S.blossom, x + 30); add(S.blossom, x + 150);
    add(S.bunting, x + 90, 0, { lift: 34 }); add(SIGN.wed, x + 86, 1); add(S.stand, x + 176, 1); add(S.stand, x + 196, 1);

    x = zx('aisle');
    add(S.church, x + 338, 0, { sink: 4 }); add(S.flowerArch, ALTAR_X - 6, 0, { sink: 1 });
    add(S.bunting, x + 60, 0, { lift: 38 }); add(S.bunting, x + 124, 0, { lift: 38 }); add(S.bunting, x + 188, 0, { lift: 38 });
    const guests = [P.wF1, P.wF2, P.wF3, P.wBro1, P.wBro2, P.wSis, P.granny, P.wMum, P.wDad];
    guests.forEach((g, i) => { add(S.pew, x + 36 + i * 22 - 5, 1); npc(g, x + 36 + i * 22, { mode: 'guest', face: 1 }); });
    add(S.stand, x + 14, 1); add(S.stand, x + 232, 1);
  })();
  ITEMS.forEach(it => { it.x = { flower: zx('flower', 206), usa: zx('usa', 300), sa: zx('sa', 310), sea: zx('sea', 296), india: zx('india', 476), key: zx('york', 426), medal: zx('marathon', 548) }[it.id]; it.obj = add(it.spr, it.x, 1, { lift: 16, bob: 1.5 }); });
  ref.ball = add(S.ball, zx('york', 505), 1);
  objs.sort((a, b) => a.layer - b.layer);

  // ------------------------------------------------------------------ state
  const keys = {};
  const st = {
    mode: 'title', t: 0, cam: 96,
    katie: { x: 96, face: 1, walk: 0, form: 'child', moving: false, hidden: false },
    clem: { x: zx('aid', 400), active: false, face: -1, anim: 0, hidden: false },
    stan: { x: zx('stanley', 180), active: false, face: -1, anim: 0, hidden: false },
    cap: { title: '', text: '', t: 0 }, parts: [], bubbles: [], fired: {}, plane: null, pop: null, lock: null, endT: 0,
    covidOver: false, hint: 0, got: {},
  };
  if (params.has('x')) { st.katie.x = +params.get('x'); st.mode = 'play'; if (st.katie.x > zx('aid', 380)) st.clem.active = true; if (st.katie.x > zx('stanley', 180)) st.stan.active = true; if (st.katie.x > ref.door + 20) st.covidOver = true; }

  function say(title, text) { st.cap = { title, text, t: 0 }; sfx('blip'); }
  function bubble(target, text, dur, lift) { st.bubbles.push({ target, text, t: 0, dur: dur || 3.5, lift: lift || 30 }); }
  function part(o) { st.parts.push(Object.assign({ age: 0, life: 1.2, vx: 0, vh: 0, grav: 0, h: 10 }, o)); }
  function hearts(x, n, h) { for (let i = 0; i < n; i++) part({ x: x + (Math.random() - 0.5) * 16, h: (h || 22) + Math.random() * 8, vx: (Math.random() - 0.5) * 14, vh: 14 + Math.random() * 14, life: 1.3 + Math.random() * 0.6, spr: S.heart }); sfx('heart'); }
  function sparkle(x, n, h) { for (let i = 0; i < n; i++) part({ x: x + (Math.random() - 0.5) * 18, h: (h || 4) + Math.random() * 22, vx: (Math.random() - 0.5) * 20, vh: 6 + Math.random() * 20, life: 0.5 + Math.random() * 0.5, spr: S.spark }); }
  function floatText(x, h, text, col) { part({ x, h, vh: 16, life: 1.8, text, col: col || '#ffd23f' }); }
  function confetti(x, n, spread, cols) { for (let i = 0; i < n; i++) part({ x: x + (Math.random() - 0.5) * spread, h: 60 + Math.random() * 60, vx: (Math.random() - 0.5) * 20, vh: -10 - Math.random() * 16, grav: 6, life: 3 + Math.random() * 2, col: cols[i % cols.length], size: 2, floor: true }); }
  function puff(x, col, n) { for (let i = 0; i < n; i++) part({ x: x + (Math.random() - 0.5) * 10, h: 4 + Math.random() * 6, vx: (Math.random() - 0.5) * 40, vh: 20 + Math.random() * 45, grav: 60, life: 0.9 + Math.random() * 0.6, col, size: 2 + (Math.random() * 2 | 0), floor: true }); }

  // ------------------------------------------------------------------ story triggers
  const trig = [];
  const on = (x, fn) => trig.push({ x, fn, done: false });
  let x0;
  on(0, () => say('SOUTH WOODFORD, LONDON', 'Once upon a time, in a house in South Woodford, there lived a girl called Katie...'));
  on(180, () => say('SOUTH WOODFORD, LONDON', '...with her mum, her dad, her big sister and her two little brothers.'));
  x0 = zx('church');
  on(x0 + 20, () => say('CHURCHFIELDS SCHOOL', 'First stop: Churchfields, where Katie makes her very first friends.'));
  x0 = zx('study');
  on(x0 + 10, () => say('HOMEWORK TIME', 'Then she studies hard. Really, really hard.'));
  on(x0 + 284, () => { ref.letter.hidden = true; sparkle(x0 + 290, 10, 10); floatText(x0 + 290, 30, "YOU'RE IN!"); sfx('win'); say('HOMEWORK TIME', '...and it pays off. Woodford County High School, here she comes!'); });
  x0 = zx('woodford');
  on(x0 + 60, () => say('WOODFORD COUNTY HIGH SCHOOL', 'Here Katie makes friends for life...'));
  on(x0 + 350, () => say('WOODFORD COUNTY HIGH SCHOOL', '...and aces every single one of her exams. Obviously.'));
  [390, 440, 490].forEach((d, i) => on(zx('woodford') + d, () => { floatText(zx('woodford') + d, 26, 'A*'); sparkle(zx('woodford') + d, 5, 12); sfx('coin', i); }));
  x0 = zx('flower');
  on(x0 + 30, () => say('NEEDHAMS', 'A brief but beautifully scented career at Needhams, the flower shop.'));
  x0 = zx('bristol');
  on(x0 + 10, () => say('BRISTOL', 'Next, off to university in Bristol to study History!'));
  x0 = zx('party');
  on(x0 + 10, () => say('BRISTOL (AFTER DARK)', '...although mainly she just makes friends and goes to parties.'));
  x0 = zx('usa');
  on(x0 + 6, () => { st.plane = { t: 0 }; say('TIME TO SEE THE WORLD', 'Backpack on. Next stop: everywhere!'); });
  on(x0 + 110, () => say('USA', 'Across the deserts of America...'));
  on(zx('sa') + 20, () => say('SOUTH AMERICA', '...over the mountains of South America...'));
  on(zx('sea') + 20, () => say('SOUTH EAST ASIA', '...past the temples and beaches of South East Asia...'));
  x0 = zx('india');
  on(x0 + 20, () => say('INDIA', '...and, best of all, India.'));
  on(x0 + 330, () => say('INDIA', 'So much colour. So much to see. She absolutely loves it.'));
  x0 = zx('aid');
  on(x0 + 6, () => { st.plane = { t: 0 }; say('A PROPER JOB', 'Back home, Katie gets a job in humanitarian aid, helping people all over the world.'); });
  on(x0 + 300, () => say('A PROPER JOB', 'And then, one day, somebody cycles into her life...'));
  on(x0 + 372, () => { st.clem.active = true; hearts(st.clem.x - 10, 6, 28); bubble(st.clem, "Hi, I'm Clem. I like bikes.", 4, 38); say('KATIE & CLEM', 'This is Clem. He loves cycling. He REALLY loves cycling.'); });
  x0 = zx('stanley');
  on(x0 + 20, () => say('STANLEY', 'Then along comes somebody very small and very important...'));
  on(x0 + 168, () => { st.stan.active = true; hearts(st.stan.x, 4, 14); bubble(st.stan, 'Woof!', 2.5, 16); sfx('bark'); say('STANLEY', 'Stanley! The best little Yorkshire terrier in the world.'); });
  x0 = zx('covid');
  on(x0 + 10, () => say('2020', 'And then... COVID HITS!'));
  on(x0 + 70, () => { bubble(st.stan, 'Grrrr!', 2.5, 16); sfx('bark'); });
  on(x0 + 170, () => say('2020', 'Everybody stays indoors. Katie heads to Granny\'s in London.'));
  on(ref.door - 8, () => { if (!st.covidOver) startLock(); });
  on(zx('after') + 40, () => say('FREEDOM!', 'Time for a fresh start. Katie and Clem head north...'));
  x0 = zx('york');
  on(x0 + 20, () => say('YORK', '...all the way up to York, where they buy their very own house together.'));
  on(ref.saleX + 6, () => { ref.sale.spr = SIGN.sold; sparkle(ref.saleX, 12, 10); hearts(ref.saleX + 50, 5, 40); sfx('win'); say('HOME SWEET HOME', 'Sold! To Katie, Clem and Stanley.'); });
  x0 = zx('mallorca');
  on(x0 + 4, () => { st.plane = { t: 0 }; say('MALLORCA', 'Katie goes on a big cycling trip in Mallorca with her dad and her brother.'); });
  on(x0 + 90, () => { st.pop = { t: 0 }; sfx('pop'); });
  x0 = zx('marathon');
  on(x0 + 6, () => { st.plane = { t: 0 }; say('THE MARATHON', 'Next challenge: Katie runs a marathon. A whole one! 26.2 miles!'); });
  on(x0 + 236, () => bubble(st.clem, 'Water? Banana? Gel?', 3.5, 38));
  on(x0 + 300, () => say('THE MARATHON', 'Keep going, Katie! Nearly there!'));
  on(x0 + 420, () => bubble(st.clem, 'Want a backie?', 3, 38));
  on(x0 + 548, () => { floatText(x0 + 548, 34, 'FINISHED!'); confetti(x0 + 548, 40, 80, ['#ff4f79', '#ffd93d', '#5ad6ff', '#8cff7a']); sfx('win'); say('THE MARATHON', 'She smashes it. Medal well and truly earned.'); });
  x0 = zx('baby');
  on(x0 + 20, () => { hearts(st.katie.x, 5, 26); say('A LITTLE SURPRISE', 'And then... some very exciting news. There\'s a baby on the way!'); });
  x0 = zx('wedpath');
  on(x0 + 10, () => { say('THE BIG DAY', 'Which brings us to the big day itself.'); bubble(st.clem, 'See you at the altar!', 3, 38); });
  on(zx('aisle') - 20, () => { say('THE BIG DAY', 'Here comes the bride...'); });
  on(zx('aisle') + 60, () => { bubble(st.stan, 'I have the rings!', 3.5, 16); sfx('bark'); });
  on(zx('york') + 452, () => { st.stan.dashT = 3; bubble(st.stan, 'BALL!', 2, 16); });
  trig.sort((a, b) => a.x - b.x);
  // when jumping in with ?x=, mark earlier triggers as done
  if (params.has('x')) { trig.forEach(t => { if (t.x < st.katie.x - 2) t.done = true; }); if (st.katie.x > ref.saleX + 6) ref.sale.spr = SIGN.sold; }

  ITEMS.forEach(it => on(it.x - 4, () => collect(it.id)));
  trig.sort((a, b) => a.x - b.x);
  if (params.has('x')) { trig.forEach(t => { if (t.x < st.katie.x - 2) t.done = true; }); ITEMS.forEach(it => { if (it.x - 4 < st.katie.x - 2) { st.got[it.id] = -9; it.obj.hidden = true; } }); }
  function collect(id) {
    const it = itemBy[id]; st.got[id] = st.t; it.obj.hidden = true;
    sparkle(it.x, 8, 12); part({ x: it.x, h: 18, vh: 22, life: 1.2, spr: it.spr }); sfx('coin', 2);
  }
  function startLock() {
    st.mode = 'lock'; st.lock = { t: 0, step: 0 };
    st.katie.hidden = true; st.stan.hidden = true; ref.granny.hidden = true; ref.gran.spr = S.grannyIn;
    say("LOCKDOWN AT GRANNY'S", 'Katie stays with Granny in London while the whole world shuts its doors.');
  }
  function endLock() {
    st.mode = 'play'; st.lock = null; st.covidOver = true;
    st.katie.hidden = false; st.stan.hidden = false; st.katie.x = ref.door + 14; st.stan.x = ref.door + 2;
    ref.gran.spr = S.grannyAfter; ref.granny.hidden = false; ref.granny.set = P.grannyW; ref.granny.mode = 'cheer'; ref.granny.x = ref.door + 4; ref.granny.face = 1;
    const cz = Z[zi.covid]; cz.sky = ['#6fc0f2', '#e6f8ff']; cz.skyN = cz.sky.map(hex2rgb); cz.far = ['city', '#adc3d9']; cz.ground = GRASS;
    sparkle(st.katie.x, 10, 6); sfx('win');
    say('AT LAST!', "And then, finally, it's over. Thank you for having me, Granny!");
  }

  // ------------------------------------------------------------------ audio
  const AU = { ctx: null, muted: false, theme: '', loopEnd: 0, gain: null };
  const NOTE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  function nf(n, tr) { const m = /^([A-G])(#?)(\d)$/.exec(n); return 440 * Math.pow(2, (NOTE[m[1]] + (m[2] ? 1 : 0) + (m[3] - 4) * 12 - 9 + (tr || 0)) / 12); }
  const MAIN = {
    mel: 'E5 1,G5 1,A5 1,G5 1,E5 1,D5 1,C5 2,D5 1,E5 1,G5 1,E5 1,D5 3,- 1,E5 1,G5 1,C6 1,A5 1,G5 1,E5 1,D5 2,C5 1,D5 1,E5 1,G5 1,C5 3,- 1',
    bass: 'C3 1,G3 1,E3 1,G3 1,A2 1,E3 1,C3 1,E3 1,F2 1,C3 1,A2 1,C3 1,G2 1,D3 1,B2 1,D3 1,C3 1,G3 1,E3 1,G3 1,A2 1,E3 1,C3 1,E3 1,F2 1,C3 1,G2 1,D3 1,C3 1,G3 1,C3 2',
  };
  const THEMES = {
    main: Object.assign({ bpm: 116, tr: 0 }, MAIN), party: Object.assign({ bpm: 156, tr: 2 }, MAIN), covid: Object.assign({ bpm: 66, tr: -7 }, MAIN),
    wedding: {
      bpm: 84, tr: 0,
      mel: 'G4 1,C5 .75,C5 .25,C5 2,G4 1,D5 .75,B4 .25,C5 2,G4 1,C5 .75,F5 .25,F5 1,E5 .75,D5 .25,C5 1,B4 .75,C5 .25,D5 2,G4 1,C5 .75,C5 .25,C5 2,G4 1,D5 .75,B4 .25,C5 2,G4 1,C5 .75,E5 .25,G5 1,E5 .75,C5 .25,A4 1,D5 .75,B4 .25,C5 2',
      bass: 'C3 2,E3 2,G2 2,C3 2,C3 2,F3 2,C3 2,G2 2,G2 2,C3 2,E3 2,G2 2,C3 2,C3 2,E3 2,F3 2,G2 2,C3 2',
    },
  };
  function parseSeq(s) { return s.split(',').map(p => { const a = p.trim().split(' '); return [a[0], parseFloat(a[1])]; }); }
  for (const k in THEMES) { const t = THEMES[k]; t.m = parseSeq(t.mel); t.b = parseSeq(t.bass); t.len = t.m.reduce((a, n) => a + n[1], 0); }
  function tone(f, t0, dur, type, vol, dest) {
    const o = AU.ctx.createOscillator(), g = AU.ctx.createGain();
    o.type = type; o.frequency.value = f;
    g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(vol, t0 + 0.012); g.gain.linearRampToValueAtTime(vol * 0.6, t0 + dur * 0.5); g.gain.linearRampToValueAtTime(0, t0 + dur * 0.95);
    o.connect(g); g.connect(dest); o.start(t0); o.stop(t0 + dur);
  }
  function scheduleLoop(t0) {
    const th = THEMES[AU.theme], beat = 60 / th.bpm;
    let t = t0; for (const [n, b] of th.m) { if (n !== '-') tone(nf(n, th.tr), t, b * beat, 'square', 0.045, AU.gain); t += b * beat; }
    t = t0; for (const [n, b] of th.b) { if (n !== '-') tone(nf(n, th.tr), t, b * beat, 'triangle', 0.09, AU.gain); t += b * beat; }
    AU.loopEnd = t0 + th.len * beat;
  }
  function setTheme(name) {
    if (!AU.ctx || AU.theme === name) return;
    if (AU.gain) { const g = AU.gain; g.gain.setValueAtTime(g.gain.value, AU.ctx.currentTime); g.gain.linearRampToValueAtTime(0, AU.ctx.currentTime + 0.25); setTimeout(() => g.disconnect(), 400); }
    AU.gain = AU.ctx.createGain(); AU.gain.gain.value = 1; AU.gain.connect(AU.master);
    AU.theme = name; scheduleLoop(AU.ctx.currentTime + 0.15);
  }
  function audioStart() {
    if (AU.ctx) { if (AU.ctx.state === 'suspended') AU.ctx.resume(); return; }
    try {
      AU.ctx = new (window.AudioContext || window.webkitAudioContext)();
      AU.master = AU.ctx.createGain(); AU.master.gain.value = AU.muted ? 0 : 1; AU.master.connect(AU.ctx.destination);
      setTheme('main');
    } catch (e) { AU.ctx = null; }
  }
  function audioTick() {
    if (!AU.ctx) return;
    if (AU.ctx.currentTime > AU.loopEnd - 0.25) scheduleLoop(AU.loopEnd);
    const x = st.katie.x; let th = 'main';
    if (x >= zx('party') && x < zx('usa')) th = 'party';
    if (x >= zx('covid') && !st.covidOver) th = 'covid';
    if (x >= zx('aisle') - 20) th = 'wedding';
    setTheme(th);
  }
  function sfx(kind, i) {
    if (!AU.ctx) return;
    const t = AU.ctx.currentTime, d = AU.master;
    if (kind === 'blip') tone(660, t, 0.06, 'square', 0.03, d);
    if (kind === 'heart') { tone(880, t, 0.09, 'triangle', 0.08, d); tone(1320, t + 0.09, 0.14, 'triangle', 0.08, d); }
    if (kind === 'coin') { tone(988 + (i || 0) * 120, t, 0.07, 'square', 0.04, d); tone(1319 + (i || 0) * 120, t + 0.07, 0.2, 'square', 0.04, d); }
    if (kind === 'win') [523, 659, 784, 1047].forEach((f, k) => tone(f, t + k * 0.09, 0.16, 'square', 0.04, d));
    if (kind === 'bark') { tone(520, t, 0.07, 'sawtooth', 0.06, d); tone(420, t + 0.1, 0.09, 'sawtooth', 0.06, d); }
    if (kind === 'pop') { tone(300, t, 0.08, 'square', 0.05, d); tone(450, t + 0.08, 0.12, 'square', 0.05, d); }
    if (kind === 'bell') [1047, 1319, 1568, 2093].forEach((f, k) => tone(f, t + k * 0.22, 0.9, 'sine', 0.07, d));
  }

  // ------------------------------------------------------------------ input
  addEventListener('keydown', (e) => {
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(e.key)) e.preventDefault();
    keys[e.key.length === 1 ? e.key.toLowerCase() : e.key] = true;
    audioStart();
    if (st.mode === 'title' && ['ArrowRight', 'd', 'Enter', ' '].includes(e.key.length === 1 ? e.key.toLowerCase() : e.key)) { st.mode = 'play'; st.hint = 0; }
    if (e.key.toLowerCase() === 'm') { AU.muted = !AU.muted; if (AU.master) AU.master.gain.value = AU.muted ? 0 : 1; }
    if (e.key.toLowerCase() === 'r' && st.mode === 'end' && st.endT > 4) location.reload();
  });
  addEventListener('keyup', (e) => { keys[e.key.length === 1 ? e.key.toLowerCase() : e.key] = false; });
  addEventListener('blur', () => { for (const k in keys) keys[k] = false; });
  cv.addEventListener('mousedown', () => { audioStart(); if (st.mode === 'title') st.mode = 'play'; });

  // ------------------------------------------------------------------ update
  function formAt(x) {
    if (x < zx('woodford')) return 'child';
    if (x < zx('flower')) return 'teen';
    if (x < zx('usa')) return 'adult';
    if (x < zx('aid')) return 'travel';
    if (x >= zx('covid') && x < zx('after') && !st.covidOver) return 'mask';
    if (x < zx('mallorca')) return 'adult';
    if (x < zx('marathon')) return 'bike';
    if (x < zx('baby')) return 'run';
    if (x < zx('wedpath')) return 'preg';
    return 'bride';
  }
  function follow(f, target, dt, maxV) {
    const dx = target - f.x;
    if (Math.abs(dx) > 260) { f.x = target; return; }
    const v = Math.max(-maxV, Math.min(maxV, dx * 5));
    if (Math.abs(dx) > 1.5) { f.x += v * dt; f.anim += Math.abs(v) * dt; f.face = v > 0 ? 1 : -1; }
  }
  function update(dt) {
    st.t += dt;
    const k = st.katie;
    audioTick();
    if (st.mode === 'play') {
      let dir = 0;
      if (keys.ArrowRight || keys.d) dir += 1;
      if (keys.ArrowLeft || keys.a) dir -= 1;
      const sp = SPEED[k.form] * (DEBUG && keys.Shift ? 6 : 1);
      k.moving = dir !== 0;
      if (dir) { k.x += dir * sp * dt; k.face = dir; k.walk += sp * dt; st.hint += dt; }
      k.x = Math.max(40, Math.min(END_X, k.x));
      const f = formAt(k.x);
      if (f !== k.form) { k.form = f; sparkle(k.x, 12, 2); sfx('coin', 1); }
      for (const t of trig) if (!t.done && k.x >= t.x) { t.done = true; t.fn(); }
      if (k.x >= END_X) { st.mode = 'end'; st.endT = 0; k.moving = false; k.face = 1; st.cap.text = ''; st.cap.title = ''; hearts(k.x + 12, 10, 30); sfx('bell'); }
    } else if (st.mode === 'lock') {
      const L = st.lock; L.t += dt;
      if (L.step === 0 && L.t > 3.6) { L.step = 1; say("LOCKDOWN AT GRANNY'S", 'Days go by. Then weeks. Then months...'); }
      if (L.step === 1 && L.t > 6.8) { L.step = 2; bubble(st.clem, 'Lap 400!', 3, 38); say("LOCKDOWN AT GRANNY'S", 'Meanwhile, Clem goes out for his one bike ride of the day. Again.'); }
      if (L.t > 10.5) endLock();
    } else if (st.mode === 'end') {
      st.endT += dt;
      if (st.endT > 0.6 && !st.e1) { st.e1 = true; bubble(k, 'I do!', 1.9, 30); }
      if (st.endT > 1.3 && !st.e2) { st.e2 = true; bubble(st.clem, 'Ding ding!', 1.9, 40); sfx('coin', 3); }
      if (Math.random() < dt * 3) hearts(k.x + 12 + (Math.random() - 0.5) * 30, 1, 30);
      if (Math.random() < dt * 14) confetti(k.x + 10, 2, 300, ['#ff8fb3', '#ffffff', '#ffd93d', '#ffc2d1', '#b28dff']);
    }
    st.cam += (k.x - st.cam) * Math.min(1, dt * 10);
    st.cap.t += dt;

    // Clem
    const c = st.clem;
    if (c.active) {
      if (st.mode === 'lock') { const nx = ref.door - 30 + Math.sin(st.lock.t * 1.4) * 70; c.face = nx > c.x ? 1 : -1; c.anim += Math.abs(nx - c.x); c.x = nx; }
      else {
        let target, maxV = 150;
        if (k.x >= zx('wedpath') + 10) { target = ALTAR_X; maxV = 190; }
        else if (k.x >= zx('mallorca') && k.x < zx('mallorca') + 200) target = Math.min(k.x - 34, zx('mallorca') - 30);
        else if (k.x >= zx('mallorca') + 200 && k.x < zx('marathon') + 60) target = zx('marathon') + 34;
        else target = k.x - 34;
        follow(c, target, dt, maxV);
        if (Math.abs(target - c.x) < 2) c.face = (target === ALTAR_X || target > k.x) ? -1 : 1;
      }
    }
    // Stanley
    const s = st.stan;
    if (s.active && st.mode !== 'lock') {
      let target;
      if (k.x >= zx('mallorca') && k.x < zx('mallorca') + 200) target = Math.min(k.x - 14, zx('mallorca') - 14);
      else if (k.x >= zx('mallorca') + 200 && k.x < zx('marathon') + 60) target = zx('marathon') + 50;
      else target = k.x - 15;
      if (s.dashT > 0) { s.dashT -= dt; if (!ref.ball.hidden) { target = ref.ball.x; if (Math.abs(s.x - ref.ball.x) < 3) { ref.ball.hidden = true; sparkle(ref.ball.x, 6, 4); bubble(s, 'Woof!', 2, 16); sfx('bark'); } } }
      follow(s, target, dt, 170);
      if (Math.abs(target - s.x) < 2) s.face = target > k.x ? -1 : 1;
    }
    // Mallorca riding companions
    const mz = Z[zi.mallorca];
    for (const r2 of riders) {
      const t2 = Math.max(mz.x0 + r2.home, Math.min(mz.x1 - 70 + r2.home, k.x - r2.off));
      follow(r2, t2, dt, 130);
    }
    // ambient particles
    const zid = zoneAt(k.x).id;
    if (zid === 'flower' && Math.random() < dt * 5) part({ x: k.x + (Math.random() - 0.5) * 380, h: 90, vx: -8, vh: -16, life: 6, col: ['#ffc2d1', '#ffffff', '#ff8fb3'][Math.random() * 3 | 0], size: 1, floor: true });
    if (zid === 'party' && Math.random() < dt * 4) part({ x: zx('party') + 150 + Math.random() * 100, h: 20 + Math.random() * 10, vx: (Math.random() - 0.5) * 12, vh: 18, life: 1.6, spr: S.note });
    if (zid === 'india' && k.moving && k.x > zx('india') + 300 && k.x < zx('india') + 560 && Math.random() < dt * 9) puff(k.x + 20 + Math.random() * 60, ['#ff4f79', '#ffd23f', '#5ad6ff', '#8cff7a', '#c77dff', '#ff9f1c'][Math.random() * 6 | 0], 7);
    if ((zid === 'aisle' || zid === 'wedpath') && Math.random() < dt * 6) part({ x: k.x + (Math.random() - 0.5) * 380, h: 100, vx: -6, vh: -14, life: 7, col: ['#ffc2d1', '#ffffff', '#ff8fb3'][Math.random() * 3 | 0], size: 1, floor: true });
    if (zid === 'usa' && Math.random() < dt * 0.5) part({ x: k.x + 220, h: 3, vx: -50, vh: 0, life: 9, spr: tumble });
    // particles
    for (const p of st.parts) { p.age += dt; p.x += p.vx * dt; p.h += p.vh * dt; p.vh -= p.grav * dt; if (p.floor && p.h < 0) { p.h = 0; p.vx = 0; p.vh = 0; } }
    st.parts = st.parts.filter(p => p.age < p.life);
    for (const b of st.bubbles) b.t += dt;
    st.bubbles = st.bubbles.filter(b => b.t < b.dur);
    if (st.plane) { st.plane.t += dt; if (st.plane.t > 5) st.plane = null; }
    if (st.pop) { st.pop.t += dt; if (st.pop.t > 4.6) st.pop = null; }
    if (st.covidOver) for (const v of ref.virus) { v.lift += dt * 60; if (v.lift > 300) v.hidden = true; }
  }
  const tumble = mk(9, 9, (r) => { ring(r, 4, 4, 4, '#a87a4a'); ring(r, 4, 4, 2, '#8a6238'); pline(r, 1, 1, 7, 7, '#8a6238'); pline(r, 7, 1, 1, 7, '#a87a4a'); });
  const riders = [
    { set: P.rDad, x: zx('mallorca') + 44, off: -30, home: 44, face: 1, anim: 0 },
    { set: P.rBro, x: zx('mallorca') + 18, off: 32, home: 18, face: 1, anim: 0 },
  ];

  // ------------------------------------------------------------------ render
  const stars = []; for (let i = 0; i < 60; i++) stars.push([hash(i) * W, hash(i + 99) * 130, hash(i + 7) > 0.8 ? 2 : 1]);
  const clouds = []; for (let i = 0; i < 6; i++) clouds.push({ x: hash(i + 3) * 500, y: 46 + hash(i + 40) * 50, v: 3 + hash(i + 12) * 4 });
  const colTh = new Float32Array(W), colY = new Int16Array(W), colWx = new Float32Array(W);
  function skyMix() {
    const cam = st.cam, i = zi[zoneAt(cam).id], z = Z[i];
    let a = z, b = z, t = 0;
    const d0 = cam - z.x0, d1 = z.x1 - cam, Bw = 70;
    if (d0 < Bw && i > 0) { a = Z[i - 1]; b = z; t = 0.5 + d0 / (2 * Bw); }
    else if (d1 < Bw && i < Z.length - 1) { a = z; b = Z[i + 1]; t = 0.5 - d1 / (2 * Bw); }
    const L = (p, q) => [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t, p[2] + (q[2] - p[2]) * t];
    return { top: L(a.skyN[0], b.skyN[0]), bot: L(a.skyN[1], b.skyN[1]), night: a.night + (b.night - a.night) * t, grey: (a.id === 'covid' ? 1 - t : 0) + (b.id === 'covid' && a !== b ? t : 0) };
  }
  function farH(type, fx) {
    switch (type) {
      case 'hills': return 12 + 8 * Math.sin(fx / 37) + 5 * Math.sin(fx / 13 + 1);
      case 'trees': return 13 + 5 * Math.sin(fx / 6) + 4 * Math.sin(fx / 2.3) + 4 * Math.sin(fx / 31);
      case 'city': { const b = Math.floor(fx / 9); return hash(b) < 0.2 ? 5 : 8 + hash(b + 50) * 24; }
      case 'mesa': return Math.sin(fx / 46) > 0.25 ? 26 + 3 * Math.floor(Math.sin(fx / 9) * 1.5) : 6 + 2 * Math.sin(fx / 7);
      case 'mountains': { const tri = (v) => Math.abs((v % 2 + 2) % 2 - 1); return 8 + 34 * tri(fx / 55) + 12 * tri(fx / 17 + 0.4); }
      case 'domes': { const m = ((fx % 60) + 60) % 60; return m < 22 ? 8 + Math.sqrt(Math.max(0, 121 - (m - 11) * (m - 11))) : (m > 40 && m < 44 ? 24 : 7 + 2 * Math.sin(fx / 5)); }
      case 'sea': return 9;
    }
    return 0;
  }
  function drawW(spr, wx, lift, sink) {
    const th = (wx - st.cam) / R;
    if (Math.abs(th) > 0.4 + spr.width / (2 * R)) return;
    ctx.save();
    ctx.translate(CX + Math.sin(th) * R, CY - Math.cos(th) * R); ctx.rotate(th);
    ctx.drawImage(spr, -Math.round(spr.width / 2), -spr.height - (lift || 0) + (sink || 0));
    ctx.restore();
  }
  function scr(wx, lift) { const th = (wx - st.cam) / R; return [CX + Math.sin(th) * (R + lift), CY - Math.cos(th) * (R + lift)]; }
  function fr(x, y, w, h, c) { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); }
  function box(x, y, w, h, bg, edge) { fr(x + 1, y, w - 2, h, edge); fr(x, y + 1, w, h - 2, edge); fr(x + 1, y + 1, w - 2, h - 2, bg); }
  function textC(s, cx, y, col, sc) { drawText(ctx, s, Math.round(cx - textWidth(s, sc || 1) / 2), y, col, sc || 1); }
  function textS(s, x, y, col, sc) { drawText(ctx, s, x + (sc || 1), y + (sc || 1), 'rgba(0,0,0,.55)', sc || 1); drawText(ctx, s, x, y, col, sc || 1); }

  function render() {
    ctx.setTransform(K, 0, 0, K, 0, 0); ctx.imageSmoothingEnabled = false;
    const t = st.t, k = st.katie, cam = st.cam;
    // sky
    const sm = skyMix();
    let lockDark = 0;
    if (st.mode === 'lock') lockDark = Math.max(0, Math.sin(st.lock.t * 2.2 - 1)) * 0.6;
    for (let i = 0; i < 12; i++) { const u = i / 11; fr(0, i * 13, W, i === 11 ? H : 13, rgb([sm.top[0] + (sm.bot[0] - sm.top[0]) * u, sm.top[1] + (sm.bot[1] - sm.top[1]) * u, sm.top[2] + (sm.bot[2] - sm.top[2]) * u])); }
    const night = Math.max(sm.night, lockDark);
    if (night > 0.05) { ctx.globalAlpha = night; for (const s2 of stars) fr(s2[0] | 0, s2[1] | 0, s2[2], s2[2], (Math.sin(t * 3 + s2[0]) > 0.6) ? '#ffffff' : '#c9c9ff'); disc(fr, 318, 62, 9, '#f4f1d8'); disc(fr, 322, 59, 7, rgb(sm.top)); ctx.globalAlpha = 1; }
    if (night < 0.95) { ctx.globalAlpha = (1 - night) * (1 - sm.grey * 0.8); disc(fr, 318, 64, 10, '#fff3a6'); disc(fr, 318, 64, 8, '#ffe066'); ctx.globalAlpha = 1; }
    ctx.globalAlpha = (1 - night * 0.85) * 0.9;
    for (const c of clouds) { const x = ((c.x + t * c.v - cam * 0.08) % 460 + 460) % 460 - 40; ctx.drawImage(S.cloud, x | 0, c.y | 0); }
    ctx.globalAlpha = 1;
    if (st.plane) { const pt = st.plane.t / 5; ctx.drawImage(S.plane, Math.round(-40 + pt * (W + 80)), Math.round(58 - Math.sin(pt * Math.PI) * 14)); }

    // column geometry
    for (let i = 0; i < W; i++) { const th = Math.asin((i + 0.5 - CX) / R); colTh[i] = th; colWx[i] = cam + R * th; colY[i] = Math.round(CY - R * Math.cos(th)); }
    // far silhouettes
    for (let i = 0; i < W; i++) {
      const wx = colWx[i], z = zoneAt(wx), y = colY[i];
      const edge = Math.min(1, Math.min(wx - z.x0, z.x1 - wx) / 50);
      const fx = cam * 0.45 + R * colTh[i];
      const h = Math.round(farH(z.far[0], fx) * Math.max(0, edge));
      if (h > 0) {
        fr(i, y - h, 1, h + 2, z.far[1]);
        if (z.far[0] === 'sea') { fr(i, y - h, 1, 1, '#d9f4ff'); if (hash(Math.floor(fx) + Math.floor(t * 2) * 7) < 0.06) fr(i, y - h + 2 + (hash(i) * 5 | 0), 1, 1, '#d9f4ff'); }
        if (z.far[0] === 'city' && z.night && h > 9 && hash(Math.floor(fx / 3)) < 0.35) fr(i, y - h + 3 + (hash(Math.floor(fx / 3) + 5) * (h - 6) | 0), 1, 1, '#ffe9a6');
      }
    }
    // objects behind the ground
    drawObjs(0);
    // ground
    for (let i = 0; i < W; i++) {
      const wx = colWx[i], wi = Math.floor(wx), hs = hash(wi), y = colY[i];
      const z = zoneAt(wx + (hs - 0.5) * 18), g = z.ground;
      fr(i, y, 1, 3, g.top[hs < 0.5 ? 0 : 1]); fr(i, y + 3, 1, 3, g.mid); fr(i, y + 6, 1, H - y - 6, zoneAt(wx).ground.soil);
      const h2 = hash(wi + 1000);
      if (h2 < 0.3) fr(i, y + 8 + (hash(wi + 2000) * 46 | 0), 1, 1 + (h2 < 0.1 ? 1 : 0), zoneAt(wx).ground.speck);
      if (g.deco === 'grass') { if (h2 > 0.82) fr(i, y - 1, 1, 1, g.top[0]); }
      else if (g.deco === 'flowers') { if (h2 > 0.84) { fr(i, y - 1, 1, 1, g.top[1]); fr(i, y - 2, 1, 1, ['#ff6b9d', '#ffd93d', '#ffffff', '#c77dff'][(h2 * 1000 | 0) % 4]); } else if (h2 > 0.7) fr(i, y - 1, 1, 1, g.top[0]); }
      else if (g.deco === 'sand') { if (h2 > 0.9) fr(i, y + 1, 1, 1, g.mid); }
      else if (g.deco === 'paving') { if (((wi % 12) + 12) % 12 === 0) fr(i, y, 1, 3, g.mid); }
      else if (g.deco === 'road') { if (((Math.floor(wx / 7) % 2) + 2) % 2 === 0) fr(i, y + 1, 1, 1, '#f4f1e8'); }
      else if (g.deco === 'carpet') { fr(i, y + 3, 1, 1, '#f2c14e'); }
    }
    drawObjs(1);
    // people
    for (const n of npcs) {
      if (n.hidden) continue;
      const d = k.x - n.x, near = Math.abs(d) < 44 && !k.hidden;
      let f = 0, lift = 0, face = n.face;
      if (n.mode === 'greet') { if (near) { lift = Math.abs(Math.sin(t * 9 + n.ph)) * 3; face = d > 0 ? 1 : -1; if (!n.met && st.mode !== 'title') { n.met = true; hearts(n.x, 1, n.set.r[0].height + 2); } } }
      else if (n.mode === 'dance') { f = ((t * 5 + n.ph) | 0) % 2 + 1; lift = Math.abs(Math.sin(t * 8 + n.ph)) * 3; face = ((t * 1.2 + n.ph) | 0) % 2 ? 1 : -1; }
      else if (n.mode === 'cheer') { if (Math.abs(d) < 150) { f = ((t * 6 + n.ph) | 0) % 2; lift = Math.abs(Math.sin(t * 9 + n.ph)) * 2; face = d > 0 ? 1 : -1; } }
      else if (n.mode === 'guest') { face = d > 0 ? 1 : -1; if (Math.abs(d) < 60 || st.mode === 'end') lift = Math.abs(Math.sin(t * 8 + n.ph)) * 2; }
      const fs = face > 0 ? n.set.r : n.set.l;
      drawW(fs[Math.min(f, fs.length - 1)], n.x, lift);
    }
    for (const r2 of riders) { const fs = r2.face > 0 ? r2.set.r : r2.set.l; drawW(fs[(r2.anim / 7 | 0) % 2], r2.x, 0); }
    const c = st.clem;
    if (!c.hidden) {
      const set = (k.x >= zx('wedpath') + 10 && c.active) ? ClemS.groom : ClemS.normal;
      const fs = c.face > 0 ? set.r : set.l; drawW(fs[(c.anim / 7 | 0) % 2], c.x, 0);
    }
    const s = st.stan;
    if (!s.hidden) {
      const set = k.x >= zx('wedpath') ? StanS.bow : StanS.normal;
      const fs = s.face > 0 ? set.r : set.l;
      drawW(fs[(s.anim / 5 | 0) % 2], s.x, s.active ? 0 : 4);
    }
    if (!k.hidden) {
      const set = Katie[k.form], fs = k.face > 0 ? set.r : set.l;
      let f = 0, lift = 0;
      if (k.form === 'bike') f = (k.walk / 7 | 0) % 2;
      else if (k.moving) { f = (k.walk / (k.form === 'run' ? 9 : 6) | 0) % 2 + 1; lift = f === 2 ? 1 : 0; }
      drawW(fs[f], k.x, lift);
    }
    drawObjs(2);
    // particles
    for (const p of st.parts) {
      const a = Math.min(1, (p.life - p.age) * 2);
      ctx.globalAlpha = Math.max(0, a);
      if (p.text) { const q = scr(p.x, p.h); textS(p.text, Math.round(q[0] - textWidth(p.text) / 2), Math.round(q[1]), p.col); }
      else if (p.spr) drawW(p.spr, p.x, p.h);
      else { const q = scr(p.x, p.h); fr(Math.round(q[0]), Math.round(q[1] - p.size), p.size, p.size, p.col); }
    }
    ctx.globalAlpha = 1;
    if (lockDark > 0) { fr(0, 0, W, H, 'rgba(12,12,44,' + (lockDark * 0.55).toFixed(3) + ')'); }
    // speech bubbles
    for (const b of st.bubbles) drawBubble(b.text, scr(b.target.x, b.lift), b.t, b.dur);
    if (st.mode === 'lock') { const q = scr(ref.door, 70); const day = 'DAY ' + (1 + Math.floor(st.lock.t * st.lock.t * 3.3)); drawBubble(day, q, 1, 99); }
    // Clem pops up
    if (st.pop) {
      const pt = st.pop.t, e = Math.min(1, pt * 3) * Math.min(1, (4.6 - pt) * 3), px = W + 44 - e * 96, py = 118;
      ctx.save(); ctx.translate(px, py); ctx.rotate(-0.12); ctx.scale(3, 3); ctx.drawImage(ClemS.normal.l[(pt * 4 | 0) % 2], -16, -17); ctx.restore();
      if (pt > 0.5 && pt < 4.3) {
        const l1 = 'What about me?', l2 = "That's like my whole thing!", bw = textWidth(l2) + 12, bx = Math.round(px - 62 - bw), by = 66;
        box(bx, by, bw, 26, '#ffffff', '#2b2b33'); fr(bx + bw, by + 12, 3, 3, '#2b2b33'); fr(bx + bw - 1, by + 11, 2, 5, '#ffffff'); fr(bx + bw + 1, by + 13, 2, 1, '#ffffff');
        drawText(ctx, l1, bx + 6, by + 4, '#2b2b33'); drawText(ctx, l2, bx + 6, by + 14, '#2b2b33');
      }
    }
    // caption
    if (st.mode !== 'title' && st.cap.text) {
      const cp = st.cap, lines = wrapText(cp.text, W - 28);
      const bh = 15 + lines.length * 10;
      box(6, 6, W - 12, bh, 'rgba(22,24,48,.88)', '#f4f1e8');
      drawText(ctx, cp.title, 13, 10, '#ffd23f');
      let n = Math.floor(cp.t * 48);
      lines.forEach((ln, i) => { const s2 = ln.slice(0, Math.max(0, n)); n -= ln.length + 1; if (s2) drawText(ctx, s2, 13, 21 + i * 10, '#ffffff'); });
    }
    if (st.mode === 'play' && st.hint < 2.5 && st.katie.x < 300 && Math.sin(t * 5) > -0.4) textS('HOLD > OR D TO WALK', 136, 200, '#ffffff');
    if (st.mode !== 'title') ITEMS.forEach((it, i) => {
      const x = 6 + i * 13, y = H - 16, g0 = st.got[it.id];
      box(x, y, 11, 11, 'rgba(10,10,30,.45)', 'rgba(255,255,255,.35)');
      if (g0 !== undefined) { const pop = Math.max(0, 1 - (st.t - g0) * 3); ctx.drawImage(it.spr, x + 1, y + 1 - Math.round(pop * 4)); }
    });
    if (st.mode === 'title') drawTitle();
    if (st.mode === 'end') drawEnd();
  }
  function drawObjs(layer) {
    const t = st.t;
    for (const o of objs) {
      if (o.layer !== layer || o.hidden) continue;
      if (o.frames) o.spr = o.frames[(t * o.rate | 0) % o.frames.length];
      const bob = o.bob ? Math.sin(t * 2 + (o.ph || 0) + o.x) * o.bob : 0;
      drawW(o.spr, o.x, o.lift + bob, o.sink);
    }
  }
  function drawBubble(text, q, bt, dur) {
    const a = Math.min(1, bt * 6, (dur - bt) * 4); if (a <= 0) return;
    const w = textWidth(text) + 10; let x = Math.round(q[0] - w / 2), y = Math.round(q[1] - 14);
    x = Math.max(4, Math.min(W - w - 4, x));
    ctx.globalAlpha = a;
    box(x, y, w, 14, '#ffffff', '#2b2b33'); fr(Math.round(q[0]) - 1, y + 13, 3, 3, '#2b2b33'); fr(Math.round(q[0]), y + 12, 1, 3, '#ffffff');
    drawText(ctx, text, x + 5, y + 3, '#2b2b33');
    ctx.globalAlpha = 1;
  }
  function drawTitle() {
    const t = st.t;
    fr(0, 0, W, H, 'rgba(18,20,48,.45)');
    const s1 = 'KATIE & CLEM', w1 = textWidth(s1, 4), x1 = Math.round(CX - w1 / 2);
    drawText(ctx, s1, x1 + 3, 37, '#23254a', 4); drawText(ctx, s1, x1, 34, '#ffffff', 4);
    drawText(ctx, '&', x1 + textWidth('KATIE ', 4) + 4, 34, '#ff6b9d', 4);
    ctx.drawImage(S.heart, CX - 3, 70 + Math.round(Math.sin(t * 3) * 2));
    textC('The story so far', CX, 84, '#ffe9a6');
    if (Math.sin(t * 4) > -0.3) { const s2 = 'PRESS > TO START'; textS(s2, Math.round(CX - textWidth(s2) / 2), 104, '#ffffff'); }
    textS('Hold > (or D) to walk.  M: music on/off', Math.round(CX - textWidth('Hold > (or D) to walk.  M: music on/off') / 2), 202, '#d6dcff');
  }
  function drawEnd() {
    const e = st.endT;
    if (e < 2.6) return;
    const g = Math.min(1, (e - 2.6) * 2.5), ease = 1 - (1 - g) * (1 - g);
    const w = Math.round(206 * ease), h = Math.round(102 * ease), x = Math.round(CX - w / 2), y = Math.round(58 - h / 2);
    if (w < 8) return;
    box(x, y, w, h, '#c8324b', '#7a1f2e'); if (w > 12) box(x + 3, y + 3, w - 6, h - 6, '#fff8ee', '#f2c14e');
    if (g >= 1) {
      const L = ['Congratulations', 'on your big day,', "I'm so proud of", 'my big sister,'];
      const n = Math.floor((e - 3.0) * 26); let used = 0;
      L.forEach((ln, i) => { const s2 = ln.slice(0, Math.max(0, n - used)); used += ln.length; if (s2) drawText(ctx, s2, Math.round(CX - textWidth(ln, 2) / 2), 16 + i * 18, '#3a2a3a', 2); });
      if (n - used > 0) {
        const ln = 'love H', s2 = ln.slice(0, n - used), lx = Math.round(CX - (textWidth(ln, 2) + 20) / 2);
        drawText(ctx, s2, lx, 88, '#c8324b', 2);
        if (n - used > ln.length + 2) { ctx.save(); ctx.translate(lx + textWidth(ln, 2) + 6, 88 + Math.round(Math.sin(st.t * 4))); ctx.scale(2, 2); ctx.drawImage(S.heart, 0, 0); ctx.restore(); }
      }
      ctx.drawImage(S.heart, x + 8, y + 8); ctx.drawImage(S.heart, x + w - 15, y + 8);
      if (e > 8 && Math.sin(st.t * 3) > -0.5) { const s3 = 'THE END  -  press R to play again'; textS(s3, Math.round(CX - textWidth(s3) / 2), 203, '#ffffff'); }
    }
  }

  // ------------------------------------------------------------------ loop
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    update(dt); render();
    requestAnimationFrame(frame);
  }
  window.__game = { st, zx, Z, step: (n, dt) => { for (let i = 0; i < n; i++) update(dt || 1 / 60); render(); } };
  requestAnimationFrame(frame);
})();
