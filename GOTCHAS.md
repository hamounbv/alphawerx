# Gotchas

A running log of things that cost time on this project. Agents read it at
the start of every session and add to it when they hit something new (see
the Session protocol in `AGENTS.md`). Never delete an entry — update its
`Status` instead.

Entries tagged `Scope: template-candidate` are harvested across all client
repos to improve `brandvm/wf-template`.

## Entry format

```md
### YYYY-MM-DD · Short title
- Area: designer | css | loader | release | mcp | ci | js | perf
- Scope: project | template-candidate
- Symptom: what was observed
- Cause: why it happened
- Fix: what was done, or the workaround
- Status: open | fixed <sha> | upstreamed wf-template <sha>
- Found by: claude | codex | human
```

## This project

<!-- Add new entries here, newest first. -->

### 2026-08-20 · Tag v1.0.1 exists but no snippet uses it
- Area: release
- Scope: project
- Symptom: `v1.0.1` is tagged, yet `webflow/_header.html`,
  `webflow/_footer.html` and the `js/alphawerx.js` header still say `@1.0.0`.
- Cause: `v1.0.1` points at b016328, which only dropped `id="aw-site-css"`
  from the head snippet; the README's step 3 (bump the snippets) was never
  done. CSS/JS are identical between the two tags apart from the new
  `js/alphawerx-dotmap.js`.
- Fix: none yet. Confirm which tag the live site pins before the next
  release, and cut `v1.0.2`+ rather than reusing either tag.
- Status: open
- Found by: human

### 2026-08-20 · `js/alphawerx-dotmap.js` is not loaded by any snippet
- Area: js
- Scope: project
- Symptom: The dot-map script (d3a7e06) is in the repo, but neither
  `webflow/` snippet references it.
- Cause: Added after the v1.0.0 cutover; how it reaches the site (page-level
  code, Embed, or not at all) is not recorded here.
- Fix: none yet. Check Webflow page settings/Embeds before editing it, then
  record the load point in `AGENTS.md`.
- Status: open
- Found by: human

### 2026-08-20 · GSAP reveal hide rules can blank the page
- Area: css
- Scope: template-candidate
- Symptom: Copy marked `[data-gsap-reveal]` / `[data-gsap-title]` stays
  invisible if the JS is slow or fails.
- Cause: CSS hides the elements up front and only JS reveals them.
- Fix: a pure-CSS `aw-reveal-failsafe` animation force-reveals at 2.5 s
  (bottom of `css/alphawerx.css`, README "Baked-in changes" 2).
- Status: fixed d0a6e80
- Found by: human

### 2026-08-20 · Inline heroVideo snippet threw on pages without the video
- Area: js
- Scope: project
- Symptom: TypeError in the console on every page without `#heroVideo`.
- Cause: The inline `playbackRate = 0.75` snippet had no null check.
- Fix: moved into `js/alphawerx.js`, null-guarded (README "Baked-in
  changes" 4).
- Status: fixed d0a6e80
- Found by: human

### 2026-08-20 · Phase-2 kit CountUp easing dips negative
- Area: js
- Scope: project
- Symptom: Count-ups briefly show negative values in the newer kit on
  CodeSandbox.
- Cause: Its easing overshoots below zero; the phase-1 build here is
  monotonic.
- Fix: clamp CountUp to ≥0 before landing phase 2 as `v2.0.0` (README
  "House rules").
- Status: open
- Found by: human

### 2026-08-20 · Repo CSS is not visible on the Designer canvas
- Area: designer
- Scope: project
- Symptom: Designer canvas renders without the site's custom styles.
- Cause: The CSS `<link>` is in head custom code, which the canvas does not
  run.
- Fix: temporary Embed with the `<link>` while designing, deleted before
  publishing (README "House rules"). Prefer moving styles into the Designer.
- Status: documented
- Found by: human

## Known from previous projects

Inherited from `wf-template`. Found across earlier client repos; listed so
they are not rediscovered. Status refers to the template. Only the entries
that apply to this repo's setup are copied.

### 2026-10-02 · Neutralizers in §03 override Designer styles
- Area: css
- Scope: template-candidate
- Symptom: A style changed in the Designer has no effect on the page.
- Cause: `src/styles.css` loads after `webflow.css`, so the §03 `.w-*` rules
  win same-specificity ties by source order. `.w-layout-blockcontainer
  { max-width }` silently overrode Designer container caps (threestars
  b5f122c); the `.w-dropdown-toggle` reset broke Webflow's chevron spacing
  (reformdd 8c65a5c).
- Fix: reformdd removed ten neutralizers so "Webflow's own defaults now stand
  unopposed" (c2e5f4b). Delete a neutralizer the moment it fights the
  Designer.
- Status: open
- Found by: human

### 2026-10-02 · Root font-size scale drifts from Designer tokens
- Area: css
- Scope: template-candidate
- Symptom: Designer variables named for px values ("Max Width - 1280px")
  render at different sizes; the scale is retuned again and again.
- Cause: The §01 fluid scale sets `:root` font-size, so every rem/em value
  coming out of the Designer scales with it. reformdd retuned it seven times
  (1680 → 1440 → 1680 → clamp → revert → 1920 → 1440); threestars found em
  layout tokens rendering 6.25% short.
- Fix: none general. Agree the scale with the designer before building, or
  drop it and let Webflow variables own sizing.
- Status: open
- Found by: human

### 2026-10-02 · Renaming a Webflow variable silently breaks repo CSS
- Area: css
- Scope: template-candidate
- Symptom: A container cap or token-driven value quietly stops applying.
- Cause: Container/Max Width was renamed to Section/Max Width in Webflow.
  Webflow rewrites its own references but cannot reach this bundle, so
  `var(--_layout---container--max-width, none)` fell back to `none`
  (reformdd 1ca59f6).
- Fix: avoid referencing Webflow variable names in repo CSS; if one is
  needed, log it here so renames get checked.
- Status: open
- Found by: human
