/*
 * duo-bridge.js — drop into the app you are testing (web app / WebView content), dev builds only.
 *   <script src="http://localhost:8080/duo-bridge.js"></script>
 * It receives the simulated foldable-phone state from the simulator and:
 *   - sets attributes on <html>:
 *       data-duo-device="iphone-duo|z-fold7|…"   data-duo-platform="ios|android"
 *       data-duo-layout="folded|tent|folded-land|unfolded|unfolded-land|unfolded-port|unfolded-rot|book|laptop|tabletop"
 *       data-duo-screen="cover|inner"   data-duo-mode="folded|unfolded|split"
 *       data-duo-posture="closed|tent|flat|half"   data-duo-fold="vertical|horizontal|none"
 *   - sets CSS variables on :root (px, viewport coords; 0 when there is no fold):
 *       --duo-crease-x/y/w/h, --duo-segments, --safe-top/right/bottom/left
 *   - polyfills window.getWindowSegments() (DOMRect[], Viewport Segments API shape)
 *     and dispatches a "duochange" event on window
 *   - runs layout checks and reports them back to the simulator
 * It does nothing when the page is not inside the simulator.
 */
(() => {
  if (window.parent === window) return;
  let cfg = null, timer;
  const BAND = 12;   // controls within this distance of the fold line are hard to use when half-folded

  const rectOf = r => ({ x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) });
  const inter = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

  function selector(el) {
    if (el.id) return '#' + el.id;
    let s = el.tagName.toLowerCase();
    if (el.classList.length) s += '.' + [...el.classList].slice(0, 2).join('.');
    const t = (el.innerText || el.value || el.alt || '').trim().slice(0, 24);
    return t ? `${s} "${t}"` : s;
  }

  function apply() {
    const root = document.documentElement, st = root.style;
    const c = cfg.crease || { x: 0, y: 0, w: 0, h: 0 };
    st.setProperty('--duo-segments', cfg.segments.length);
    ['x', 'y', 'w', 'h'].forEach(k => st.setProperty('--duo-crease-' + k, c[k] + 'px'));
    ['top', 'right', 'bottom', 'left'].forEach((k, i) => st.setProperty('--safe-' + k, cfg.safe['trbl'[i]] + 'px'));
    root.dataset.duoLayout = cfg.layout;
    root.dataset.duoDevice = cfg.device;
    root.dataset.duoPlatform = cfg.platform;
    root.dataset.duoScreen = cfg.screen;
    root.dataset.duoMode = cfg.mode;
    root.dataset.duoPosture = cfg.posture;
    root.dataset.duoFold = cfg.crease ? (cfg.crease.axis === 'v' ? 'vertical' : 'horizontal') : 'none';
    window.getWindowSegments = () => cfg.segments.map(s => new DOMRect(s.x, s.y, s.w, s.h));
    window.dispatchEvent(new Event('duochange'));
  }

  function check() {
    if (!cfg) return;
    const issues = [], count = {};
    const add = (key, max, issue) => { count[key] = (count[key] || 0) + 1; if (count[key] <= max) issues.push(issue); };
    const vw = innerWidth, vh = innerHeight, de = document.documentElement;
    const half = cfg.posture === 'half';

    if (de.scrollWidth > vw + 1)
      issues.push({ severity: 'error', title: 'Horizontal overflow', detail: `Content is ${de.scrollWidth}pt wide in a ${vw}pt viewport` });

    let band = null;
    if (cfg.crease) {
      const c = cfg.crease;
      band = c.axis === 'v' ? { x: c.x - BAND, y: 0, w: c.w + 2 * BAND, h: vh } : { x: 0, y: c.y - BAND, w: vw, h: c.h + 2 * BAND };
    }

    let maxRight = 0;
    const els = document.body.querySelectorAll('a,button,input,select,textarea,img,video,svg,h1,h2,h3,h4,h5,h6,p,label,li,td,th,[role=button],[onclick]');
    let n = 0;
    for (const el of els) {
      if (++n > 3000) break;
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || cs.display === 'none') continue;
      const r = rectOf(el.getBoundingClientRect());
      if (!r.w || !r.h || r.y > vh || r.y + r.h < 0) continue;
      maxRight = Math.max(maxRight, r.x + r.w);
      const interactive = el.matches('a,button,input,select,textarea,[role=button],[onclick]');

      if (band && inter(r, band)) {
        if (interactive) {
          add('crease-ctl', 8, { severity: half ? 'error' : 'warn', title: half ? 'Control on the fold (half-folded)' : 'Control sits on the fold crease', detail: selector(el), rect: r });
        } else if (half && el.matches('img,video,h1,h2,h3,p')) {
          add('crease-content', 5, { severity: 'warn', title: 'Content split by the fold', detail: selector(el), rect: r });
        }
      }
      if (r.x + r.w > vw + 1 && cs.position !== 'fixed')
        add('clip', 5, { severity: 'warn', title: 'Clipped on right', detail: selector(el), rect: r });
      if (interactive && (r.w < 44 || r.h < 44) && !['hidden', 'checkbox', 'radio'].includes(el.type))
        add('tap', 3, { severity: 'warn', title: 'Small tap target (<44pt)', detail: `${selector(el)} is ${r.w}×${r.h}` });
      if (cfg.screen === 'inner' && el.matches('p,li') && r.w > 720 && (el.innerText || '').length > 120)
        add('measure', 3, { severity: 'warn', title: 'Text lines too long for the big screen', detail: `${selector(el)} is ${r.w}pt wide — use columns or a max-width`, rect: r });
    }
    if (cfg.screen === 'inner' && maxRight && maxRight < vw * 0.6)
      issues.push({ severity: 'warn', title: 'Inner screen mostly unused', detail: `Content only reaches ${Math.round(maxRight)}pt of ${vw}pt — looks like a phone layout` });

    parent.postMessage({ type: 'duo:report', issues }, '*');
  }

  const schedule = () => { clearTimeout(timer); timer = setTimeout(check, 300); };

  addEventListener('message', e => {
    const d = e.data; if (!d) return;
    if (d.type === 'duo:config') { cfg = d; apply(); schedule(); }
    else if (d.type === 'duo:check') check();
  });
  addEventListener('resize', schedule);
  addEventListener('load', schedule);
  parent.postMessage({ type: 'duo:ready' }, '*');
})();
