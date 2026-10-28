(() => {
  /* ---------- devices ----------
   * Native resolutions are from the makers' published specs. Each screen is given in its natural
   * orientation: cover = portrait; inner = the way it opens like a book, fold running top↕bottom.
   * Viewport size (CSS px / iOS points) = native px ÷ pixel ratio (dpr).
   *  - iPhone Duo: @3x assumed (Apple publishes pixels only).
   *  - Android: dpr follows the phone's display-size setting, so 2.625 (420 dpi) is only a default; edit it.
   * Camera: {cx: fraction of width | right: px from right edge, top: px, udc: under-display}.
   * Corner radii: [top-left, top-right, bottom-right, bottom-left] in the natural orientation.
   */
  const APPLE_LAYOUTS = ['folded', 'folded-land', 'tent', 'unfolded-land', 'book', 'unfolded-port', 'laptop'];
  const ANDROID_LAYOUTS = ['folded', 'folded-land', 'unfolded', 'book', 'unfolded-rot', 'tabletop'];
  const DEVICES = [
    { id: 'iphone-duo', group: 'Apple', name: 'iPhone Duo', platform: 'ios', layouts: APPLE_LAYOUTS,
      cover: { px: [1398, 2034], in: 5.4, dpr: 3, r: [6, 36, 36, 6], cam: { right: 16, top: 16 } },
      inner: { px: [2670, 1878], in: 7.6, dpr: 3, r: 26, cam: null } },
    // Fold8 is the wide "passport" model (opens to 4:3 landscape); Fold8 Ultra keeps the tall Fold7 shape.
    // Fold8 main display confirmed on samsung.com/sg (7.6″, 1848 × 2448, listed height × width; spec-fold8.jpg).
    // A 75 mm-wide cover × 2 ≈ the 154 mm-wide inner screen, so the Fold8 opens wide (landscape).
    // Camera positions for both are assumed from the Fold7 layout.
    { id: 'z-fold8-ultra', group: 'Samsung', name: 'Galaxy Z Fold8 Ultra', platform: 'android', layouts: ANDROID_LAYOUTS,
      cover: { px: [1080, 2520], in: 6.5, dpr: 2.625, r: 24, cam: { cx: 0.5, top: 12 } },
      inner: { px: [2256, 2504], in: 8.0, dpr: 2.625, r: 20, cam: { cx: 0.75, top: 12 } } },
    { id: 'z-fold8', group: 'Samsung', name: 'Galaxy Z Fold8', platform: 'android', layouts: ANDROID_LAYOUTS,
      cover: { px: [1248, 1972], in: 5.5, dpr: 2.625, r: 24, cam: { cx: 0.5, top: 12 } },
      inner: { px: [2448, 1848], in: 7.6, dpr: 2.625, r: 20, cam: { cx: 0.75, top: 12 } } },
    { id: 'z-fold7', group: 'Samsung', name: 'Galaxy Z Fold7', platform: 'android', layouts: ANDROID_LAYOUTS,
      cover: { px: [1080, 2520], in: 6.5, dpr: 2.625, r: 24, cam: { cx: 0.5, top: 12 } },
      inner: { px: [1968, 2184], in: 8.0, dpr: 2.625, r: 20, cam: { cx: 0.75, top: 12 } } },
    { id: 'z-fold6', group: 'Samsung', name: 'Galaxy Z Fold6', platform: 'android', layouts: ANDROID_LAYOUTS,
      cover: { px: [968, 2376], in: 6.3, dpr: 2.625, r: 24, cam: { cx: 0.5, top: 12 } },
      inner: { px: [1856, 2160], in: 7.6, dpr: 2.625, r: 20, cam: { cx: 0.75, top: 12, udc: true } } },
    { id: 'z-fold5', group: 'Samsung', name: 'Galaxy Z Fold5', platform: 'android', layouts: ANDROID_LAYOUTS,
      cover: { px: [904, 2316], in: 6.2, dpr: 2.625, r: 24, cam: { cx: 0.5, top: 12 } },
      inner: { px: [1812, 2176], in: 7.6, dpr: 2.625, r: 20, cam: { cx: 0.75, top: 12, udc: true } } },
    // Pro Folds open slightly tall: Google lists the inner screen width × height as 2076 × 2152, and the
    // unfolded body is 155.2 mm tall × ~150 mm wide. Pixel 11 Pro Fold confirmed on store.google.com/sg.
    { id: 'pixel-11-pro-fold', group: 'Google', name: 'Pixel 11 Pro Fold', platform: 'android', layouts: ANDROID_LAYOUTS,
      cover: { px: [1080, 2342], in: 6.5, dpr: 2.625, r: 28, cam: { cx: 0.5, top: 14 } },
      inner: { px: [2076, 2152], in: 8.0, dpr: 2.625, r: 24, cam: { right: 20, top: 14 } } },
    { id: 'pixel-10-pro-fold', group: 'Google', name: 'Pixel 10 Pro Fold', platform: 'android', layouts: ANDROID_LAYOUTS,
      cover: { px: [1080, 2364], in: 6.4, dpr: 2.625, r: 28, cam: { cx: 0.5, top: 14 } },
      inner: { px: [2076, 2152], in: 8.0, dpr: 2.625, r: 24, cam: { right: 20, top: 14 } } },
    { id: 'pixel-9-pro-fold', group: 'Google', name: 'Pixel 9 Pro Fold', platform: 'android', layouts: ANDROID_LAYOUTS,
      cover: { px: [1080, 2424], in: 6.3, dpr: 2.625, r: 28, cam: { cx: 0.5, top: 14 } },
      inner: { px: [2076, 2152], in: 8.0, dpr: 2.625, r: 24, cam: { right: 20, top: 14 } } },
    { id: 'pixel-fold', group: 'Google', name: 'Pixel Fold', platform: 'android', layouts: ANDROID_LAYOUTS,
      cover: { px: [1080, 2092], in: 5.8, dpr: 2.625, r: 28, cam: { cx: 0.5, top: 14 } },
      inner: { px: [2208, 1840], in: 7.6, dpr: 2.625, r: 24, cam: null } },   // inner camera sits in the bezel
  ];

  // rot: turned 90° clockwise from the natural orientation
  const LAYOUTS = {
    'folded':        { screen: 'cover', rot: false, posture: 'closed' },
    'tent':          { screen: 'cover', rot: true,  posture: 'tent',   name: 'Tent',   note: 'standing as an A-frame, hinge on top' },
    'folded-land':   { screen: 'cover', rot: true,  posture: 'closed' },
    'unfolded-land': { screen: 'inner', rot: false, posture: 'flat' },
    'unfolded-port': { screen: 'inner', rot: true,  posture: 'flat' },
    'unfolded':      { screen: 'inner', rot: false, posture: 'flat' },
    'unfolded-rot':  { screen: 'inner', rot: true,  posture: 'flat' },
    'book':          { screen: 'inner', rot: false, posture: 'half',   name: 'Book',   note: 'half-open like a book' },
    'laptop':        { screen: 'inner', rot: true,  posture: 'half',   name: 'Laptop', note: 'top half upright, bottom half flat on the table' },
    'tabletop':      { screen: 'inner', rot: true,  posture: 'half',   name: 'Tabletop', note: 'top half upright, bottom half flat on the table' },
  };
  const BEZEL = 9, DIVIDER = 10, CAM = 20;

  const $ = id => document.getElementById(id);
  const viewport = $('viewport'), stage = $('stage'), device = $('device'), screen = $('screen');
  const frameA = $('frameA'), frameB = $('frameB');
  const S = { dev: DEVICES[0], layoutId: 'unfolded-land', split: false, edited: false };
  const reports = new Map();     // frame window -> {issues, label}
  let geo = null, animTimer;
  const loaded = { A: '', B: '' };

  [...new Set(DEVICES.map(d => d.group))].forEach(g => {
    const og = document.createElement('optgroup'); og.label = g;
    DEVICES.filter(d => d.group === g).forEach(d => og.appendChild(new Option(d.name, d.id)));
    $('preset').appendChild(og);
  });
  const num = id => +$(id).value || 0;
  const L = () => LAYOUTS[S.layoutId];
  const unit = () => S.dev.platform === 'ios' ? 'pt' : 'dp';
  const isSplit = () => S.split && L().screen === 'inner';
  // the inner screen in its natural orientation, flat: what you get when you open the phone like a book
  const openTarget = () => S.dev.layouts.find(i => LAYOUTS[i].screen === 'inner' && !LAYOUTS[i].rot && LAYOUTS[i].posture === 'flat');

  /* ---------- device → logical sizes ---------- */
  function fillSizes() {
    const d = S.dev, cd = num('cdpr') || d.cover.dpr, id = num('idpr') || d.inner.dpr;
    $('cw').value = Math.round(d.cover.px[0] / cd); $('ch').value = Math.round(d.cover.px[1] / cd);
    $('iw').value = Math.round(d.inner.px[0] / id); $('ih').value = Math.round(d.inner.px[1] / id);
    S.edited = false;
  }
  function selectDevice(id) {
    S.dev = DEVICES.find(d => d.id === id);
    $('cdpr').value = S.dev.cover.dpr; $('idpr').value = S.dev.inner.dpr; $('crease').value = 0;
    fillSizes();
    const d = S.dev, ios = d.platform === 'ios';
    $('specHint').textContent = `${d.name} spec: cover ${d.cover.in}″ ${d.cover.px.join('×')} px, inner ${d.inner.in}″ ${d.inner.px.join('×')} px. ` +
      (ios ? 'Points assume @3x (Apple lists pixels only).'
           : 'Viewport in CSS px/dp = px ÷ pixel ratio. Android ratios follow the phone’s display-size setting — 2.625 is a default, check yours with window.devicePixelRatio.');
    if (!d.layouts.includes(S.layoutId)) S.layoutId = openTarget();
    buildLayoutPicker();
  }

  /* ---------- layout picker ---------- */
  function orientOf(id) {
    const l = LAYOUTS[id], s = S.dev[l.screen].px;
    const land = (s[0] > s[1]) !== l.rot;
    return land ? 'landscape' : 'portrait';
  }
  function layoutName(id) {
    const l = LAYOUTS[id]; if (l.name) return l.name;
    return (l.screen === 'cover' ? 'Folded' : 'Unfolded') + (id === 'folded' ? '' : ' ' + orientOf(id));
  }
  function layoutDesc(id) {
    const l = LAYOUTS[id], o = orientOf(id);
    const fold = l.screen === 'inner' ? ` — fold runs ${l.rot ? 'left↔right' : 'top↕bottom'}` : '';
    return `${l.screen === 'cover' ? 'Cover' : 'Inner'} screen, ${o}${l.note ? ', ' + l.note : ''}${fold}`;
  }
  function iconFor(id) {
    const l = LAYOUTS[id];
    if (l.posture === 'half') return { src: l.rot ? 'laptop' : 'book' };
    if (id === 'tent') return { src: 'tent' };
    if (l.screen === 'cover') return { src: 'folded', rot: l.rot };
    return { src: orientOf(id) === 'landscape' ? 'unfolded-land' : 'unfolded-port' };
  }
  function buildLayoutPicker() {
    $('layouts').innerHTML = S.dev.layouts.map(id => {
      const ic = iconFor(id);
      return `<button data-v="${id}" title="${layoutDesc(id)}"><img src="icons/${ic.src}.png" class="${ic.rot ? 'rot' : ''}" alt="">${layoutName(id)}</button>`;
    }).join('');
  }

  /* ---------- geometry ---------- */
  // rotate a rect/point 90° clockwise inside a W×H box
  const rotPt = (p, H) => ({ x: H - p.y, y: p.x });
  const rotR = r => [r[3], r[0], r[1], r[2]];

  function geometry() {
    const l = L(), d = S.dev, scr = d[l.screen], crease = num('crease');
    const nw = l.screen === 'cover' ? num('cw') : num('iw'), nh = l.screen === 'cover' ? num('ch') : num('ih');
    const w = l.rot ? nh : nw, h = l.rot ? nw : nh;
    let radii = Array.isArray(scr.r) ? scr.r : [scr.r, scr.r, scr.r, scr.r];
    if (l.rot) radii = rotR(radii);
    let cam = null;
    if (scr.cam) {
      const c = scr.cam, cx = c.cx != null ? c.cx * nw : nw - c.right - CAM / 2, cy = c.top + CAM / 2;
      cam = l.rot ? rotPt({ x: cx, y: cy }, nh) : { x: cx, y: cy };
      cam.udc = !!c.udc;
    }
    const base = { w, h, radii, cam };
    if (l.screen === 'cover') return { ...base, axis: null, crease: null, frames: { A: { x: 0, y: 0, w, h } } };
    const axis = l.rot ? 'h' : 'v';
    const c = axis === 'v' ? { x: (w - crease) / 2, y: 0, w: crease, h } : { x: 0, y: (h - crease) / 2, w, h: crease };
    if (!isSplit()) return { ...base, axis, crease: c, frames: { A: { x: 0, y: 0, w, h } } };
    // split view is side by side; when the fold is vertical the divider sits on it
    const dv = axis === 'v' ? Math.max(DIVIDER, crease) : DIVIDER;
    const a = { x: 0, y: 0, w: (w - dv) / 2, h }, b = { x: (w + dv) / 2, y: 0, w: a.w, h };
    return { ...base, axis, crease: c, div: { x: a.w, y: 0, w: dv, h }, frames: { A: a, B: b } };
  }

  // Status bar / home indicator / camera insets. iOS hides the status bar on a landscape phone screen.
  function defaultSafe() {
    const g = geometry(), l = L(), land = g.w > g.h;
    const s = S.dev.platform === 'ios'
      ? { t: l.screen === 'cover' && land ? 0 : 24, r: 0, b: 20, l: 0 }
      : { t: 24, r: 0, b: 24, l: 0 };
    if (g.cam && !g.cam.udc) {
      const dist = { t: g.cam.y, b: g.h - g.cam.y, l: g.cam.x, r: g.w - g.cam.x };
      const order = land ? ['l', 'r', 't', 'b'] : ['t', 'b', 'l', 'r'];   // ties go to the sides in landscape
      const edge = order.reduce((m, k) => dist[k] < dist[m] - 0.5 ? k : m, order[0]);
      s[edge] = Math.max(s[edge], Math.round(dist[edge] + CAM / 2 + 12));
    }
    return s;
  }
  function setSafe(s) { $('sT').value = s.t; $('sR').value = s.r; $('sB').value = s.b; $('sL').value = s.l; }
  const safe = () => ({ t: num('sT'), r: num('sR'), b: num('sB'), l: num('sL') });

  const intersect = (a, b) => {
    const x = Math.max(a.x, b.x), y = Math.max(a.y, b.y);
    const x2 = Math.min(a.x + a.w, b.x + b.w), y2 = Math.min(a.y + a.h, b.y + b.h);
    return x2 >= x && y2 >= y && (x2 > x || y2 > y) ? { x, y, w: x2 - x, h: y2 - y } : null;
  };
  const px = (el, r) => Object.assign(el.style, { left: r.x + 'px', top: r.y + 'px', width: r.w + 'px', height: r.h + 'px' });

  function layout(animate) {
    const l = L(), inner = l.screen === 'inner';
    geo = geometry();
    device.className = 'device' + (inner ? ' inner' : '') + (isSplit() ? ' split' : '') +
      (l.posture === 'half' ? ` half ${geo.axis}-fold` : '') + ($('segOutline').checked && inner ? ' outline' : '');
    screen.style.width = geo.w + 'px'; screen.style.height = geo.h + 'px';
    screen.style.borderRadius = geo.radii.map(v => v + 'px').join(' ');
    device.style.borderRadius = geo.radii.map(v => v + BEZEL + 'px').join(' ');
    px(frameA, geo.frames.A);
    if (geo.frames.B) px(frameB, geo.frames.B);
    if (geo.div) px($('divider'), geo.div);

    const cl = $('creaseLine');
    if (inner && !(isSplit() && geo.axis === 'v')) {
      const c = geo.crease, band = 24;   // the shading is wider than the physical crease
      px(cl, geo.axis === 'v' ? { x: c.x - band / 2, y: 0, w: band + c.w, h: geo.h }
                              : { x: 0, y: c.y - band / 2, w: geo.w, h: band + c.h });
      cl.className = geo.axis + ($('creaseShow').checked ? ' show' : '');
    } else cl.className = '';
    if (inner) {
      const hw = geo.w / 2, hh = geo.h / 2;
      px($('halfA'), geo.axis === 'v' ? { x: 0, y: 0, w: hw, h: geo.h } : { x: 0, y: 0, w: geo.w, h: hh });
      px($('halfB'), geo.axis === 'v' ? { x: hw, y: 0, w: hw, h: geo.h } : { x: 0, y: hh, w: geo.w, h: hh });
    }

    const cam = $('camera');
    cam.classList.toggle('hide', !geo.cam || !$('cutout').checked);
    cam.classList.toggle('udc', !!geo.cam?.udc);
    if (geo.cam) Object.assign(cam.style, { left: geo.cam.x - CAM / 2 + 'px', top: geo.cam.y - CAM / 2 + 'px' });
    $('homeBar').classList.toggle('android', S.dev.platform === 'android');

    stage.classList.toggle('tent', S.layoutId === 'tent' && animOn());
    updateModel();

    [...$('layouts').children].forEach(b => b.classList.toggle('on', b.dataset.v === S.layoutId));
    $('orientLabel').textContent = layoutDesc(S.layoutId);
    $('split').disabled = !inner;
    const dpr = num(inner ? 'idpr' : 'cdpr'), npx = S.dev[l.screen].px, [pw, ph] = l.rot ? [npx[1], npx[0]] : npx;
    $('info').textContent = `${S.dev.name} · ${layoutName(S.layoutId)} · ${geo.w}×${geo.h} ${unit()}` +
      (S.edited ? ' (custom size)' : ` (${pw}×${ph} px @${dpr}x)`) +
      (isSplit() ? ` · split view, each app ${geo.frames.A.w}×${geo.frames.A.h}` : '');

    fit();
    clearTimeout(animTimer);
    if (animate) {
      device.classList.add('resizing');
      animTimer = setTimeout(() => { device.classList.remove('resizing'); sendAll(); }, 600);
    }
    sendAll();
  }

  function fit() {
    const W = geo.w + 2 * BEZEL, H = geo.h + 2 * BEZEL, z = $('zoom').value;
    const k = z === 'fit' ? Math.min((viewport.clientWidth - 40) / W, (viewport.clientHeight - 60) / H, 1) : +z;
    stage.style.transform = `scale(${k})`;
    stage.style.margin = `${(H * k - H) / 2}px ${(W * k - W) / 2}px`;
  }

  function loadUrls(force) {
    const a = $('urlA').value.trim() || 'about:blank';
    const b = $('urlB').value.trim() || a;
    if (force || loaded.A !== a) { frameA.src = a; loaded.A = a; }
    if (isSplit() && (force || loaded.B !== b)) { frameB.src = b; loaded.B = b; }
    reports.clear(); renderReport();
  }

  /* ---------- bridge protocol ---------- */
  function configFor(key) {
    const f = geo.frames[key]; if (!f) return null;
    const l = L();
    // crease in this app's own coordinates (null if the fold is not inside this app's area)
    let crease = null;
    if (geo.crease) {
      const hit = intersect(geo.crease, f);
      if (hit) crease = { x: hit.x - f.x, y: hit.y - f.y, w: hit.w, h: hit.h, axis: geo.axis };
    }
    // Like Android foldables: a flat screen is 1 segment; half-folded (book/laptop/tabletop) exposes 2.
    let segments = [{ x: 0, y: 0, w: f.w, h: f.h }];
    if (crease && l.posture === 'half') segments = crease.axis === 'v'
      ? [{ x: 0, y: 0, w: crease.x, h: f.h }, { x: crease.x + crease.w, y: 0, w: f.w - crease.x - crease.w, h: f.h }]
      : [{ x: 0, y: 0, w: f.w, h: crease.y }, { x: 0, y: crease.y + crease.h, w: f.w, h: f.h - crease.y - crease.h }];
    return {
      type: 'duo:config', device: S.dev.id, platform: S.dev.platform,
      layout: S.layoutId, screen: l.screen, posture: l.posture,
      mode: l.screen === 'cover' ? 'folded' : isSplit() ? 'split' : 'unfolded',
      orientation: f.w > f.h ? 'landscape' : 'portrait',
      label: key === 'A' ? (isSplit() ? 'Left app' : 'App') : 'Right app',
      segments, crease, safe: safe(),
    };
  }
  function frameKey(win) { return win === frameA.contentWindow ? 'A' : win === frameB.contentWindow ? 'B' : null; }
  function send(key) {
    const cfg = configFor(key), fr = key === 'A' ? frameA : frameB;
    if (cfg) try { fr.contentWindow.postMessage(cfg, '*'); } catch {}
  }
  function sendAll() { send('A'); if (isSplit()) send('B'); }

  function renderReport() {
    const ul = $('report'), mk = $('markers');
    ul.innerHTML = ''; mk.innerHTML = '';
    const keys = isSplit() ? ['A', 'B'] : ['A'];
    let bridged = false;
    keys.forEach(k => {
      const win = (k === 'A' ? frameA : frameB).contentWindow, r = reports.get(win); if (!r) return;
      bridged = true;
      const label = r.label || k, off = geo.frames[k];
      if (!r.issues.length) ul.insertAdjacentHTML('beforeend', `<li class="ok">${esc(label)}: no layout issues found</li>`);
      r.issues.forEach(i => {
        const li = document.createElement('li');
        li.className = i.severity === 'error' ? 'bad' : '';
        li.innerHTML = `<b>${esc(label)}</b> · ${esc(i.title)}<small>${esc(i.detail || '')}</small>`;
        ul.appendChild(li);
        if (i.rect) {
          const m = document.createElement('div');
          m.className = 'marker' + (i.severity === 'error' ? '' : ' warn');
          px(m, { x: i.rect.x + off.x, y: i.rect.y + off.y, w: i.rect.w, h: i.rect.h });
          mk.appendChild(m);
        }
      });
    });
    $('bridgeStatus').className = 'badge ' + (bridged ? 'on' : 'off');
    $('bridgeStatus').textContent = bridged ? 'Bridge connected' : 'No bridge detected';
  }
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  window.addEventListener('message', e => {
    const d = e.data; if (!d || typeof d !== 'object') return;
    const key = frameKey(e.source); if (!key) return;
    if (d.type === 'duo:ready') send(key);
    else if (d.type === 'duo:report') {
      reports.set(e.source, { issues: d.issues || [], label: configFor(key)?.label });
      renderReport();
    }
  });
  [frameA, frameB].forEach(f => f.addEventListener('load', () => { reports.delete(f.contentWindow); setTimeout(sendAll, 50); }));

  /* ---------- controls ---------- */
  function applyLayout(id) {
    S.layoutId = id;
    setSafe(defaultSafe());
    if (isSplit()) loadUrls(false);
    reports.clear(); renderReport();
    layout(true);
  }

  /* ---------- animations ---------- */
  const animOn = () => $('animate').checked && !matchMedia('(prefers-reduced-motion: reduce)').matches;
  let busy = false;

  /* The phone as a 3D book: half A (right) stays put, half B (left) is hinged to it at x = 0.
   * Inner screen = front faces, cover screen = back of B. Your app is one live view and can't be bent,
   * so during the move the rig shows plain lit screens; then the live app fades back in at its new size. */
  function rigDims() {
    const sw = num('iw') / 2, sh = num('ih'), cw = num('cw'), ch = num('ch');
    return { sw, sh, cw, ch, PW: Math.max(sw, cw) + BEZEL, PH: Math.max(sh, ch) + 2 * BEZEL };
  }
  // presented = how the live view shows it (face-on); posed = the physical shape
  function pose(id, posed, d) {
    const l = LAYOUTS[id], z = l.rot ? 90 : 0;
    if (l.screen === 'cover') {
      if (posed && id === 'tent') return { z, a: 32, b: 148, s: 0, cam: 'rotateX(-8deg) rotateY(-48deg) scale(.82)' };
      return { z, a: 0, b: 180, s: -d.PW / 2, cam: id === 'tent' ? 'rotateX(14deg)' : 'rotateX(0deg)' };
    }
    if (posed && l.posture === 'half')
      return l.rot ? { z, a: 0, b: 95, s: 0, cam: 'rotateX(48deg) scale(.86)' }
                   : { z, a: -36, b: 36, s: 0, cam: 'rotateX(8deg) scale(.9)' };
    return { z, a: 0, b: 0, s: 0, cam: 'rotateX(0deg)' };
  }
  const same = (p, q) => p.z === q.z && p.a === q.a && p.b === q.b && p.s === q.s && p.cam === q.cam;
  const lerp = (p, q) => ({ z: (p.z + q.z) / 2, a: (p.a + q.a) / 2, b: (p.b + q.b) / 2, s: (p.s + q.s) / 2,
                             cam: 'rotateX(14deg) rotateY(-20deg) scale(.9)' });

  function buildRig(d) {
    const dev = S.dev, inR = dev.inner.r, cr = Array.isArray(dev.cover.r) ? dev.cover.r : [dev.cover.r, dev.cover.r, dev.cover.r, dev.cover.r];
    const R = inR + BEZEL, cam = dev.cover.cam;
    const glassTop = (d.PH - d.sh) / 2, coverLeft = (d.PW - d.cw) / 2, coverTop = (d.PH - d.ch) / 2;
    const camDot = cam && !cam.udc ? `<i class="r-camdot" style="left:${(cam.cx != null ? cam.cx * d.cw : d.cw - cam.right - 10) - 10}px;top:${cam.top}px"></i>` : '';
    const rig = document.createElement('div');
    rig.id = 'rig';
    rig.innerHTML = `<div class="r-cam"><div class="r-orient">
      <div class="r-half a" style="width:${d.PW}px;height:${d.PH}px;left:0;top:${-d.PH / 2}px">
        <div class="r-face front" style="border-radius:4px ${R}px ${R}px 4px">
          <div class="r-glass" style="left:0;top:${glassTop}px;width:${d.sw}px;height:${d.sh}px;border-radius:0 ${inR}px ${inR}px 0"></div></div>
        <div class="r-face back" style="border-radius:${R}px 4px 4px ${R}px"></div>
      </div>
      <div class="r-half b" style="width:${d.PW}px;height:${d.PH}px;left:${-d.PW}px;top:${-d.PH / 2}px">
        <div class="r-face front" style="border-radius:${R}px 4px 4px ${R}px">
          <div class="r-glass" style="right:0;top:${glassTop}px;width:${d.sw}px;height:${d.sh}px;border-radius:${inR}px 0 0 ${inR}px"></div></div>
        <div class="r-face back" style="border-radius:4px ${R}px ${R}px 4px">
          <div class="r-glass cover" style="left:${coverLeft}px;top:${coverTop}px;width:${d.cw}px;height:${d.ch}px;border-radius:${cr.map(v => v + 'px').join(' ')}">${camDot}</div></div>
      </div></div></div>`;
    stage.appendChild(rig);
    return rig;
  }

  let rigRun = null;
  function finishRig() {
    if (!rigRun) return;
    rigRun.anims.forEach(x => x.cancel());
    rigRun.rig.remove();
    clearTimeout(rigRun.timer);
    device.style.transition = 'opacity .18s ease'; device.style.opacity = '';
    rigRun = null;
  }

  function setLayout(id) {
    finishRig();
    const from = S.layoutId;
    if (!animOn() || from === id) return applyLayout(id);
    const d = rigDims();
    // keyframes: as shown now → physical shape now → mid-air tilt → new physical shape → (hold) → as it will be shown
    const seq = [pose(from, false, d)], dur = [0];
    const step = (p, ms) => { if (!same(p, seq[seq.length - 1]) || ms === 'hold') { seq.push(p); dur.push(ms === 'hold' ? 450 : ms); } };
    const fromPosed = pose(from, true, d), tgtPosed = pose(id, true, d), tgtShown = pose(id, false, d);
    step(fromPosed, 350);
    step(lerp(fromPosed, tgtPosed), 420);
    step(tgtPosed, 420);
    if (!same(tgtPosed, tgtShown)) { step({ ...tgtPosed }, 'hold'); step(tgtShown, 420); }
    const total = dur.reduce((x, y) => x + y, 0), offs = []; let acc = 0;
    dur.forEach(t => { acc += t; offs.push(acc / total); });

    device.style.transition = 'none'; device.style.opacity = '0';
    applyLayout(id);                                // the app resizes behind the rig, state intact
    const rig = buildRig(d), q = sel => rig.querySelector(sel);
    const opts = { duration: total, easing: 'cubic-bezier(.45,.05,.25,1)', fill: 'forwards' };
    const K = f => seq.map((p, i) => ({ transform: f(p), offset: offs[i] }));
    const anims = [
      q('.r-cam').animate(K(p => `perspective(2400px) ${p.cam}`), opts),
      q('.r-orient').animate(K(p => `rotateZ(${p.z}deg) translateX(${p.s}px)`), opts),
      q('.r-half.a').animate(K(p => `rotateY(${p.a}deg)`), opts),
      q('.r-half.b').animate(K(p => `rotateY(${p.b}deg)`), opts),
    ];
    rigRun = { rig, anims, timer: setTimeout(finishRig, total + 30) };
  }

  // Physical posture as a small 3D model: half B is hinged to half A; blue = inner screen, green = cover screen.
  const POSE = {
    closed:   { cam: 'rotateX(18deg) rotateY(-30deg)', a: 'none',            b: 'rotateY(180deg)' },
    tent:     { cam: 'rotateX(-12deg) rotateY(-58deg)', a: 'rotateY(32deg)',  b: 'rotateY(148deg)' },
    flat:     { cam: 'rotateX(30deg) rotateY(-12deg)', a: 'none',            b: 'none' },
    half:     { cam: 'rotateX(14deg) rotateY(0deg)',   a: 'rotateY(-38deg)', b: 'rotateY(38deg)' },
    tabletop: { cam: 'rotateX(56deg) rotateZ(-22deg)',   a: 'none',            b: 'rotateY(96deg)' },
  };
  function updateModel() {
    const m = $('model'), l = L();
    m.classList.toggle('hide', !animOn());
    const c = S.dev.cover.px, ph = 62;
    m.style.setProperty('--ph', ph + 'px'); m.style.setProperty('--pw', Math.round(ph * c[0] / c[1]) + 'px');
    const pose = POSE[l.posture === 'half' && l.rot ? 'tabletop' : l.posture];
    const closed = l.screen === 'cover';
    let rot = l.rot ? 'rotateZ(90deg)' : '';
    if (closed && l.posture === 'closed') rot += ' translateX(calc(var(--pw) / -2))';   // centre the folded stack
    m.querySelector('.m-cam').style.transform = pose.cam;
    m.querySelector('.m-rot').style.transform = rot || 'none';
    m.querySelector('.m-half.a').style.transform = pose.a;
    m.querySelector('.m-half.b').style.transform = pose.b;
    m.querySelector('.m-label').innerHTML = `<b>${layoutName(S.layoutId)}</b><br><i style="background:#2a5bd7"></i>inner<i style="background:#1f8f5f"></i>cover`;
  }
  $('layouts').onclick = e => { const b = e.target.closest('button'); if (b) setLayout(b.dataset.v); };
  // Same iframe stays alive across fold/unfold, so you can see whether the app keeps its state.
  // Opening the portrait cover like a book gives the inner screen in its natural orientation.
  $('fold').onclick = () => setLayout(L().screen === 'cover' ? openTarget() : 'folded');
  $('split').onchange = () => { S.split = $('split').checked; if (isSplit()) loadUrls(false); reports.clear(); renderReport(); layout(true); };
  $('preset').onchange = () => { selectDevice($('preset').value); setSafe(defaultSafe()); layout(true); };
  ['cdpr', 'idpr'].forEach(id => $(id).addEventListener('input', () => { if (num(id) >= 1) { fillSizes(); layout(false); } }));
  ['cw', 'ch', 'iw', 'ih', 'crease'].forEach(id => $(id).addEventListener('input', () => { if (id !== 'crease') S.edited = true; layout(false); }));
  ['cutout', 'creaseShow', 'segOutline', 'animate'].forEach(id => $(id).onchange = () => layout(false));
  ['sT', 'sR', 'sB', 'sL'].forEach(id => $(id).oninput = sendAll);
  $('zoom').onchange = fit;
  $('load').onclick = () => loadUrls(true);
  $('reload').onclick = () => [frameA, frameB].forEach(f => { if (f.getAttribute('src')) try { f.contentWindow.location.reload(); } catch { f.src = f.src; } });
  $('check').onclick = () => [frameA, frameB].forEach(f => { try { f.contentWindow.postMessage({ type: 'duo:check' }, '*'); } catch {} });
  ['urlA', 'urlB'].forEach(id => $(id).addEventListener('keydown', e => { if (e.key === 'Enter') loadUrls(true); }));
  window.addEventListener('resize', fit);

  selectDevice(DEVICES[0].id);
  setSafe(defaultSafe());
  layout(false);
  loadUrls(true);
})();
