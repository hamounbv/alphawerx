# alphawerx-site-code

Version-controlled custom code for **alphawerx.ai** (Webflow site `6a550527033ca43347ca181a`, phase 1 live build), served through **jsDelivr** — same setup as the `brandvm` repo.

```
css/alphawerx.css      → all site custom CSS (core.css + alphawerx.css merged, load order preserved)
js/alphawerx.js        → all site custom JS (v2.0 single-file build + Lenis init + hero-video snippet)
webflow/_header.html   → the Site Settings → Head block (paste into Webflow)
webflow/_footer.html   → the Site Settings → Footer block (paste into Webflow)
```

Replaces, in one move: the two `p9d736.csb.app` stylesheet links in the `G | Embed Code` component, the `p9d736.csb.app/sites/alphawerx/alphawerx.js` footer script, the synchronous `unpkg.com` Lenis script + its 40-line inline init, and the inline heroVideo snippet. After cutover, **no production file depends on CodeSandbox or unpkg.**

## Baked-in changes (everything else is faithful to the sandbox files)

1. **Swiper guard** — `bootSwiper()` now skips loading Swiper (~173 KB decoded, measured) on pages with no `[data-swiper]` element. This site has none; if a slider is ever added, Swiper loads exactly as before. Caveat: `SmartSwiper.ready()/initEl()` callbacks stay queued on slider-less pages — nothing on this site uses them (verified Aug 2026).
2. **Reveal failsafe** — the `[data-gsap-reveal]/[data-gsap-title]` hide rules at the bottom of the CSS now carry a pure-CSS animation that force-reveals all copy at 2.5 s, so a slow or failed JS fetch can never leave the page blank.
3. **Lenis init internalized** — moved from the footer inline script into `js/alphawerx.js`, guarded: skips the Webflow editor, tolerates a missing Lenis (native scroll fallback) or missing GSAP (plain rAF driver). Same options, same `[data-h-scroll]` horizontal rail at ≤991 px, same `gsap.ticker` bridge.
4. **heroVideo guard** — the `playbackRate = 0.75` snippet moved into the JS, null-guarded (the inline version threw a TypeError on any page without `#heroVideo`).

Boot label bumped to `alphawerx v2.0.1` — check `window.BB.site` in the console to confirm which build a page is running.

## jsDelivr rules (the important ones)

- **The repo must be public.** jsDelivr's `/gh/` endpoint doesn't serve private repos. (Fine — this code ships to every visitor's browser anyway.)
- URL shape: `https://cdn.jsdelivr.net/gh/hamounbv/alphawerx@VERSION/path/file`
- **Auto-minify:** request `alphawerx.min.css` / `alphawerx.min.js` and jsDelivr generates the minified file — commit only the readable source. (The sandbox served these unminified; this alone cuts roughly half the custom-code bytes.)
- **Pin a tag for production** (`@1.0.0`). Tagged URLs are cached permanently on the CDN — deploys are immutable and rollback = pointing the snippet at the previous tag.
- `@main` works for testing but is cached up to ~12 h, and query-string cache-busters are ignored — never use `@main` in the production snippet.
- Emergency cache purge: `https://purge.jsdelivr.net/gh/hamounbv/alphawerx@1.0.0/css/alphawerx.min.css`

## One-time GitHub setup

1. github.com → **New repository** → name `alphawerx` → **Public** → Create.
2. "uploading an existing file" → drag the contents of this folder (`css/`, `js/`, `webflow/`, `README.md`) → Commit.
3. Releases → **Create a new release** → tag `v1.0.0` → Publish. (Tag names with `v` work as `@1.0.0` on jsDelivr.)
4. Sanity-check in a browser tab before touching Webflow:
   `https://cdn.jsdelivr.net/gh/hamounbv/alphawerx@1.0.0/css/alphawerx.min.css`
   `https://cdn.jsdelivr.net/gh/hamounbv/alphawerx@1.0.0/js/alphawerx.min.js`

## One-time Webflow cutover (alphawerx.ai)

1. Site Settings → Custom Code → **Head**: replace the whole block with `webflow/_header.html`.
2. Site Settings → Custom Code → **Footer**: replace the whole block with `webflow/_footer.html`. Delete everything that was there except nothing — the Lenis script, the inline Lenis init, the Code Sandbox script tag, and the heroVideo snippet are all superseded. (The GSAP `<script>` tags in the published page are emitted by Webflow for IX3 — they are not custom code and stay.)
3. In the Designer, open the `G | Embed Code` component and delete its contents (the remixicon link moved to the head; the two p9d736 links are superseded; the empty "staging only" style block goes too). Keep or delete the component shell itself — it's hidden either way.
4. Publish to the webflow.io staging domain first → QA (below) → publish to alphawerx.ai.

**QA checklist:** hero video plays (0.75×) · smooth scroll + go-to-top easing works · headline/word reveals animate · COALESCE tabs auto-rotate, pause button works · Five-Phase accordion opens + swaps images · count-ups animate (and never show negative values — this build's easing is monotonic) · glow borders follow the cursor · `window.BB.site` = `alphawerx v2.0.1` · DevTools Network: zero requests to `csb.app` or `unpkg.com`, no 404s, and **no Swiper request** on the homepage.

## Release workflow

1. Edit `css/alphawerx.css` or `js/alphawerx.js`, commit.
2. Tag: Releases → new release `v1.0.1` (or `git tag v1.0.1 && git push --tags`).
3. Bump the version in `webflow/_header.html` + `webflow/_footer.html`, commit.
4. Paste the updated snippet(s) into Webflow Site Settings → Custom Code, publish.
5. Verify the new file loads (DevTools → Network), spot-check pages.

Rollback = steps 3–4 with the previous tag.

## House rules

- Never edit CSS/JS inline in Webflow again — if it's style or behavior, it goes in this repo.
- External stylesheets don't render in the Designer canvas. For canvas work, drop a temporary embed with the two `<link>`s on a page while designing and delete it before publishing.
- This is the **phase-1** build frozen onto real hosting. Phase 2 (the refactored v1.1/v2.2 kit currently on `mfx83v.csb.app`) should land here as `v2.0.0` of this repo when it's ready — apply the CountUp ≥0 clamp before shipping it (the newer kit's easing dips negative; see the staging audit, snippet S8).

## Optional cleanups, deliberately NOT baked in

Documented with evidence in `alphawerx-ai-live-performance-audit-2026-08-20.html` and the staging audit (same folder this bundle came from): Site Settings → **Minify CSS toggle is OFF** (flip it — one click, nothing to do with this repo) · meta description / OG / canonical missing on the live homepage · glow mask double-encoding fix (S6b — changes what's on screen, eyeball it) · reveal duration 2 → 0.85 and blur 5 → 0 (S5) · glow idle-pauser (S6) · `body { width: 100vw }` → `100%` · `maximum-scale=1` accessibility trade-off · fonts TTF → WOFF2 · hero/footer videos off raw S3 + posters.
