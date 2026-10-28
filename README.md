# Foldable Phone Simulator

Browser-based simulator for book-style foldable phones: Apple iPhone Duo, Samsung Galaxy Z Fold5/6/7/8/8 Ultra and Google Pixel Fold / 9 Pro Fold / 10 Pro Fold / 11 Pro Fold. Each has a small **cover screen** when folded and one large **inner screen** when opened. Load your mobile web app / WebView content in it to see how the UI behaves on both screens.

## Open it
**Hosted:** https://minhquan0402.github.io/foldable-phone-simulator/ (no install needed).
Paste your app's URL, e.g. `http://localhost:3000`, and press Load. The first time, Chrome may ask to allow access to devices on your local network: click Allow.

**Run locally instead:**
```bash
cd foldable-phone-simulator
python3 -m http.server 8080      # or: npx serve .
# open http://localhost:8080
```

## Phones
| Phone | Cover screen (native px) | Inner screen (native px) | Default pixel ratio | Default viewport, cover / inner |
|---|---|---|---|---|
| Apple iPhone Duo | 5.4″, 1398 × 2034 | 7.6″, 2670 × 1878 | 3 (assumed) | 466 × 678 pt / 890 × 626 pt |
| Samsung Galaxy Z Fold8 Ultra | 6.5″, 1080 × 2520 | 8.0″, 2256 × 2504 | 2.625 | 411 × 960 / 859 × 954 dp |
| Samsung Galaxy Z Fold8 | 5.5″, 1248 × 1972 | 7.6″, 2448 × 1848 | 2.625 | 475 × 751 / 933 × 704 dp |
| Samsung Galaxy Z Fold7 | 6.5″, 1080 × 2520 | 8.0″, 1968 × 2184 | 2.625 | 411 × 960 / 750 × 832 dp |
| Samsung Galaxy Z Fold6 | 6.3″, 968 × 2376 | 7.6″, 1856 × 2160 | 2.625 | 369 × 905 / 707 × 823 dp |
| Samsung Galaxy Z Fold5 | 6.2″, 904 × 2316 | 7.6″, 1812 × 2176 | 2.625 | 344 × 882 / 690 × 829 dp |
| Google Pixel 11 Pro Fold | 6.5″, 1080 × 2342 | 8.0″, 2076 × 2152 | 2.625 | 411 × 892 / 791 × 820 dp |
| Google Pixel 10 Pro Fold | 6.4″, 1080 × 2364 | 8.0″, 2076 × 2152 | 2.625 | 411 × 901 / 791 × 820 dp |
| Google Pixel 9 Pro Fold | 6.3″, 1080 × 2424 | 8.0″, 2076 × 2152 | 2.625 | 411 × 923 / 791 × 820 dp |
| Google Pixel Fold | 5.8″, 1080 × 2092 | 7.6″, 2208 × 1840 | 2.625 | 411 × 797 / 841 × 701 dp |

Galaxy Z Fold8: main display 7.6″ 1848 × 2448 and cover 5.5″ are confirmed on Samsung's own spec page (`spec-fold8.jpg`). Samsung writes resolutions as height × width; the physical sizes show it opens wide (2 × 75 mm cover ≈ 154 mm inner width). Its cover resolution (1248 × 1972) is from retailer listings.

Pixel 11 Pro Fold: both screens are confirmed on Google's store page (`spec-pixel11-outer.jpg`, `spec-pixel11-inner.jpg`): cover 6.5″ 1080 × 2342 at 399 ppi, inner 8″ 2076 × 2152 at 372 ppi.

Inner sizes are listed as the screen opens like a book (fold runs top↕bottom): Galaxy Fold5–7, Fold8 Ultra and the Pixel 9/10/11 Pro Folds open tall (the Pro Folds only slightly — unfolded they are 155.2 mm tall × ~150 mm wide). The Galaxy Z Fold8, the original Pixel Fold and the iPhone Duo open wide.

**Viewport = native pixels ÷ pixel ratio.** The native resolutions come from the makers' published specs (`spec-outer.jpg`/`spec-inner.jpg` for the iPhone Duo).
- **iPhone Duo:** the @3x ratio is assumed, because Apple lists pixels only.
- **Android:** the ratio follows the phone's display-size setting, and the user can change it. 2.625 (420 dpi) is a common default. It gives 344 × 882 for the Galaxy Z Fold5 cover, which I believe matches Chrome DevTools' preset (not confirmed in this session). Some sites list other values, e.g. 984 × 1092 for the Fold7 inner screen at a ratio of 2.0. Edit the pixel-ratio fields to match, and check a real phone with `window.innerWidth` and `window.devicePixelRatio`.

## Supported layouts
Pick one from the **Layout & orientation** panel (icons in `icons/` come from Apple's artwork).

**iPhone Duo:** Folded · Folded landscape · Tent · Unfolded landscape · Book · Unfolded portrait · Laptop (Apple's six, plus Folded landscape).
**Galaxy / Pixel (Android postures):** Folded · Folded landscape · Unfolded · Book · Unfolded (rotated) · Tabletop.

| Layout | Screen | Fold | Segments reported |
|---|---|---|---|
| Folded / Folded landscape / Tent | cover | — | 1 |
| Unfolded (natural orientation) | inner | top↕bottom, flat | 1 |
| Book | inner, half-open | top↕bottom | 2 |
| Unfolded (rotated) | inner | left↔right, flat | 1 |
| Laptop (iPhone) / Tabletop (Android) | inner, bottom half flat on the table | left↔right | 2 |

Extras:
- **Split view** (inner layouts): two apps side by side. When the fold runs top↕bottom the divider sits on it (iPhone Duo: 440 × 626 each); when it runs left↔right the fold crosses both apps.
- **Fold ⇄ Unfold** switches between the cover screen and the inner screen *without reloading the app*, so you can check that it keeps state and re-lays out (the demo's cart counter shows this). Switching layouts never reloads the app either.
- The crease is drawn as shading only; content under it stays visible. Set *Crease width* > 0 to model a dead strip.
- Home indicator / Android gesture bar, punch-hole or under-display camera and per-layout safe areas are shown and sent to your app.

## Animations
Every layout change plays a **3D animation of the whole phone**, the way the real device moves. Unfolding opens it like a book; folding closes it; Tent stands it up as an A-frame; Book and Laptop/Tabletop bend it to that angle; rotation turns it.

Your app is one live web view, and a browser can't bend one view across two hinged panels. So during the ~1 s movement the phone shows plain lit screens, then your live app fades back in at its new size, with its state intact. For Book and Laptop/Tabletop the phone folds into shape, holds briefly, then turns flat toward you so you can use the app. The **posture model** under the layout picker keeps showing the physical shape (inner screen blue, cover green).

**Book, Laptop and Tabletop** show two phones side by side: a 3D phone held in that posture, and the flat phone you use. Click **Show my app in 3D** and choose **This tab** when Chrome asks to share: the 3D phone's screens then mirror your app live as you use it (Chrome or Edge on a computer; it uses tab capture cropped to the phone's screen, and nothing leaves your browser). Click **Stop** to end the mirror. Without it, the 3D phone shows the posture with plain screens.

The fold line is hidden by default; turn it on with **View → Show fold line**. Turn animations off with **View → Animations & posture model**; they also switch off automatically when the OS asks for reduced motion.

## Testing your app
1. Start your app's dev server, paste its URL, press Load.
   It must allow framing (no `X-Frame-Options: DENY` / `frame-ancestors 'none'`) and, if the simulator is on http, be http too.
2. For live layout checks, add the bridge to your app (dev only):
   ```html
   <script src="https://minhquan0402.github.io/foldable-phone-simulator/duo-bridge.js"></script>
   <!-- or http://localhost:8080/duo-bridge.js when running locally -->
   ```
   It reports and highlights: controls on the fold crease, content split by the fold when half-folded, horizontal overflow, clipped elements, tap targets < 44pt, text lines too long for the inner screen, and an inner screen that is mostly unused (phone layout).
3. Adapt your layout. Prefer width-based breakpoints (split-view panes are narrow even on the inner screen), plus the bridge's hooks for fold-aware tweaks:
   ```css
   @media (min-width: 640px) { .page { display:grid; grid-template-columns:1fr 1fr; column-gap:32px; } }
   html[data-duo-posture="half"][data-duo-fold="horizontal"] .page { /* top half content, bottom half controls */ }
   body { padding: var(--safe-top) var(--safe-right) var(--safe-bottom) var(--safe-left); }
   ```
   Attributes: `data-duo-device`, `data-duo-platform` (ios|android), `data-duo-layout` (see the layout ids in `app.js`), `data-duo-screen` (cover|inner), `data-duo-mode` (folded|unfolded|split), `data-duo-posture` (closed|tent|flat|half), `data-duo-fold` (vertical|horizontal|none).
   Variables: `--duo-crease-x/y/w/h`, `--duo-segments`, `--safe-*`. JS: `window.getWindowSegments()` and the `duochange` event.
   In production use the standard `env(viewport-segment-*)` / `@media (horizontal-viewport-segments: 2)` and native size-class APIs.

`demo.html` is a sample app: the default layout shows the problems (checkout button on the fold, stretched phone UI), `?adaptive=1` fixes them.

## Limits
Browser iframes can't emulate native iOS (UIKit/SwiftUI, device pixel ratio, real safe areas, hinge sensors). For native apps, use the same sizes as custom sizes in Xcode previews / the iOS Simulator, or test your React Native/Expo web build here.
