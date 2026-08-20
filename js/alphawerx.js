/* ============================================================
   AlphaWerx — alphawerx.js  (phase 1 live build, GitHub + jsDelivr)
   Serve via jsDelivr, deferred, AFTER lenis (both defer — deferred
   scripts execute in document order, so Lenis is always ready):
   https://cdn.jsdelivr.net/gh/hamounbv/alphawerx@1.0.0/js/alphawerx.min.js
   (.min.js is generated automatically by jsDelivr)

   BAKED-IN CHANGES vs the p9d736 sandbox file (see README):
   1. SmartSwiper no longer downloads ~173 KB of Swiper on pages
      with no [data-swiper] element (bootSwiper guard).
   2. The Lenis init moved here from the Webflow footer inline
      script (guarded: skips the editor, tolerates a missing Lenis
      or GSAP — a failed CDN degrades to native scroll, never an error).
   3. The hero-video playbackRate snippet moved here, null-guarded
      (the old inline version threw on pages without #heroVideo).
   Everything below the marker is the v2.0 single-file build, unchanged.
   ============================================================ */

/* ═════════════════════════════════════════════════════════════════
   alphawerx — SINGLE FILE BUILD                          v2.0
   core.js + site JS merged into one browser file.

   ┌─ PART 1 · Blankboard Studio core ────────────────────────────┐
   │  Debug · Utils · boot · NavShrink · GoToTop · SmartSwiper    │
   │  ClickOnLoad · KeyboardIx3Toggle                             │
   │  Still exported as window.BBCore so anything that already    │
   │  reaches for BBCore keeps working.                           │
   └──────────────────────────────────────────────────────────────┘
   ┌─ PART 2 · alphawerx site modules ────────────────────────────┐
   │  GlowingBorders · AutoTabs · DeployAccordion · CountUp       │
   │  GsapMotion                                                  │
   └──────────────────────────────────────────────────────────────┘
   ┌─ PART 3 · boot call ─────────────────────────────────────────┐

   Silent by default — nothing prints on normal visits. Open any page
   with ?debug=on for the on-screen diagnostics panel (?debug=off to hide).

   NOTE ON THIS MERGE: core is no longer shared. Anything fixed in the
   core section of this file only benefits alphawerx — port fixes back
   to the studio core.js if they're general.

   v2.0 — ScrollPhases → DeployAccordion: all scroll-driven behavior
          removed. Plain click accordion at every breakpoint — first
          item open, exactly one open, one always stays open (the
          open head is a no-op). Binds to the SAME
          [data-scroll-phases] attribute, so no Designer rewiring.
          Runway, scrubber, and centred-pin retired. SHIP TOGETHER
          with deployment-phase custom CSS v2 (the old connector
          line reads --phase-progress, which v2.0 no longer writes).
   v1.9 — ShaderBackground: WebGL column-glow background on
          [data-shader-bg] — per-column light gain, dithered
          gradients, mouse-following glow with a "home" resting
          position; CSS background stays as the fallback
   v1.8 — CountUp: scroll-triggered number count-up on [data-count-up]
          (parses the final value straight from the text — prefix/
          suffix/decimal aware, CMS-safe)
   v1.7 — ScrollPhases: phone mode (≤ tablet break) — tap accordion,
          one phase open, videos relocated into the open body
   v1.6 — ScrollPhases: connector line scrubs with in-phase progress
   v1.5 — ScrollPhases: scroll-driven phases accordion + sticky video
   v1.4 — AutoTabs: viewport-aware autoplay
   v1.3 — AutoTabs: panels wrapper follows the ACTIVE panel's height
   v1.2 — AutoTabs: auto-rotating tabs w/ progress + play/pause
   v1.1 — GlowingBorders: cursor-proximity glow on [data-glowing-border]

   Sliders need NO code at all: in the Webflow Designer give the
   element class `swiper` + attribute `data-swiper`, then optionally
     data-swiper-slides="3|2|1"    per breakpoint
     data-swiper-space="20|16|14"  per breakpoint
     data-swiper-loop="true"       data-swiper-speed="600"
     data-swiper-autoplay="true"   data-swiper-autoplay-delay="5000"
     data-swiper-centered="true"   data-swiper-scope=".my-wrapper"
   Arrows/dots auto-detected: .swiper-prev / .swiper-next / .swiper-pagination
   ═════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  /* ╔═══════════════════════════════════════════════════════════════╗
       ║  PART 1 — CORE                                                ║
       ╚═══════════════════════════════════════════════════════════════╝ */

  /* ═══════════════ Debug — on-screen panel + gated logging ═══════════════ */

  // Adapted from the RegenX debug script. OFF by default: the console stays
  // completely silent on normal visits (real errors still surface).
  //
  //   turn ON:  open any page with  ?debug=on   (sticks for your browser;
  //             ?debug=1 and #debug work too — #debug is one page load only)
  //   turn OFF: ?debug=off
  //
  // While ON, a corner panel shows what booted, with timings, mirrored to the
  // console. Site files can write to it too:
  //   BBCore.Debug.log("myModule:", "anything useful");
  const Debug = (() => {
    let sticky = false;
    try {
      const q = new URLSearchParams(location.search);
      const v = q.get("debug");
      if (v === "on" || v === "1") localStorage.setItem("bbDebug", "1");
      if (v === "off" || v === "0") localStorage.removeItem("bbDebug");
      sticky = localStorage.getItem("bbDebug") === "1";
    } catch (_) {}

    const ON =
      sticky ||
      /(?:^|#).*debug/.test(location.hash) ||
      window.BB_DEBUG === true;

    let panel = null;
    const ts = () => String(Math.round(performance.now())).padStart(5, " ");

    function ensurePanel() {
      if (!ON || panel || !document.body) return;
      panel = document.createElement("div");
      panel.id = "bb-debug";
      Object.assign(panel.style, {
        position: "fixed",
        top: "8px",
        right: "8px",
        zIndex: "2147483647",
        maxWidth: "min(440px, 92vw)",
        maxHeight: "62vh",
        overflow: "auto",
        background: "rgba(12,12,12,.86)",
        color: "#9bffa3",
        font: "11px/1.5 ui-monospace, Menlo, Consolas, monospace",
        padding: "8px 10px",
        borderRadius: "6px",
        whiteSpace: "pre-wrap",
        pointerEvents: "auto",
        boxShadow: "0 6px 24px rgba(0,0,0,.45)",
      });
      panel.textContent = "BB debug — add ?debug=off to hide\n";
      document.body.appendChild(panel);
    }

    function fmt(a) {
      if (a === null) return "null";
      if (typeof a === "object") {
        try {
          return JSON.stringify(a);
        } catch (_) {
          return String(a);
        }
      }
      return String(a);
    }

    function log() {
      if (!ON) return;
      try {
        const line =
          "[" +
          ts() +
          "ms] " +
          Array.prototype.map.call(arguments, fmt).join(" ");
        console.log("%c[BB]", "color:#7cc;font-weight:bold", line);
        const write = () => {
          ensurePanel();
          if (panel) {
            panel.appendChild(document.createTextNode(line + "\n"));
            panel.scrollTop = panel.scrollHeight;
          }
        };
        if (document.body) write();
        else
          document.addEventListener("DOMContentLoaded", write, { once: true });
      } catch (_) {}
    }

    return { ON: ON, log: log };
  })();

  /* ═══════════════ Utils — qs/qsa/run/onReady/safeConsole ═══════════════ */

  // Shared DOM + console utilities (canonical across all Blankboard sites).
  // qs / qsa / isFn / run (safe module runner) / onReady / safeConsole
  const Utils = (() => {
    const qs = (sel, root = document) => root.querySelector(sel);
    const qsa = (sel, root = document) =>
      Array.from(root.querySelectorAll(sel));

    const isFn = (v) => typeof v === "function";

    const safeConsole = {
      log: (...args) => {
        try {
          // eslint-disable-next-line no-console
          console.log(...args);
        } catch (_) {}
      },
      warn: (...args) => {
        try {
          // eslint-disable-next-line no-console
          console.warn(...args);
        } catch (_) {}
      },
      error: (...args) => {
        try {
          // eslint-disable-next-line no-console
          console.error(...args);
        } catch (_) {}
      },
    };

    // Safe module runner: one module error won't stop the rest.
    // Success is only reported in debug mode; failures always hit the console.
    const run = (name, fn) => {
      try {
        fn();
        Debug.log("✅ " + name);
      } catch (err) {
        safeConsole.error(`❌ ${name} failed`, err);
        Debug.log(
          "❌ " + name + " failed:",
          String((err && err.message) || err)
        );
      }
    };

    // Optional: wait for DOM ready
    const onReady = (fn) => {
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", fn, { once: true });
      } else {
        fn();
      }
    };

    return Object.freeze({ qs, qsa, isFn, run, onReady, safeConsole });
  })();

  /* ═══════════════ boot — safe module runner + console badge ═══════════════ */

  // boot("clientname v1.2", [modules]) — runs each module through the safe
  // runner (one failure never stops the rest). Completely silent unless
  // debug mode is on (?debug=on) — window.BB is always set either way, so
  // "what's live here?" stays answerable from the console on any visit.
  // Bump the version string in the boot call at the bottom of this file
  // when you ship something notable.
  const BADGE_1 =
    "color:#fff;background:#111;padding:4px 8px;border-radius:6px;font-weight:700;";
  const BADGE_2 =
    "color:#111;background:#badeca;padding:4px 8px;border-radius:6px;font-weight:700;";

  function boot(label, modules) {
    const full = label + (window.BB_DEV ? " · DEV (cache-bypassed)" : "");
    try {
      window.BB = Object.freeze({
        site: label,
        dev: !!window.BB_DEV,
        debug: Debug.ON,
        modules: modules.map(function (m) {
          return m.name;
        }),
      });
    } catch (_) {}

    if (Debug.ON) {
      try {
        console.log("%c" + full + "%c boot", BADGE_1, BADGE_2);
      } catch (_) {}
      Debug.log(
        "boot:",
        full,
        "| readyState:",
        document.readyState,
        "| modules:",
        modules
          .map(function (m) {
            return m.name;
          })
          .join(", ")
      );
    }

    Utils.onReady(function () {
      modules.forEach(function (m) {
        Utils.run(m.name, m.init);
      });
      if (Debug.ON) {
        try {
          console.log("%c" + full + "%c ready", BADGE_1, BADGE_2);
        } catch (_) {}
        Debug.log("ready:", full);
      }
    });
  }

  /* ═══════════════ NavShrink — .is-shrunk on scroll ═══════════════ */

  // NAV SHRINK ON SCROLL — toggles .is-shrunk on nav wrappers past a viewport
  // threshold. Selector list is per-site config (they drifted across old copies):
  //   NavShrink()                                          -> studio default selectors
  //   NavShrink({ selectors: ".g-nav-w, .s-g-nav" })        -> custom
  //   NavShrink({ thresholdVh: 0.1 })                       -> shrink at 10vh
  function NavShrink(options = {}) {
    const selectors =
      options.selectors || ".g-navigation-w, .s-g-navigation, .sw-g-nav";
    const thresholdVh =
      options.thresholdVh == null ? 0.05 : options.thresholdVh;

    function init() {
      const targets = document.querySelectorAll(selectors);
      Debug.log("NavShrink:", targets.length, "nav element(s) for", selectors);
      if (!targets.length) return;

      const getThresholdPx = () => window.innerHeight * thresholdVh;
      let thresholdPx = getThresholdPx();

      const update = () => {
        const shouldShrink = window.scrollY >= thresholdPx;
        targets.forEach((el) => el.classList.toggle("is-shrunk", shouldShrink));
      };

      const onResize = () => {
        thresholdPx = getThresholdPx();
        update();
      };

      update();
      window.addEventListener("scroll", update, { passive: true });
      window.addEventListener("resize", onResize, { passive: true });
    }

    return { name: "NavShrink", init };
  }

  /* ═══════════════ GoToTop — Lenis-first smooth scroll to top ═══════════════ */

  // GO TO TOP (Lenis-first, native fallback)
  // Binds every [data-function="go-to-top"] element. Uses window.lenis when present.
  function GoToTop(options = {}) {
    const DEFAULTS = Object.freeze({
      selector: '[data-function="go-to-top"]',
      // Change this if your Lenis instance lives elsewhere
      getLenis: () => window.lenis || null,
      // Lenis scroll options (modern Lenis expects (target, options))
      lenisOptions: {
        duration: 1.1, // seconds
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        immediate: false,
        force: true,
        lock: false,
      },
    });

    const scrollToTop = (cfg) => {
      const lenis = cfg.getLenis?.();
      if (lenis && Utils.isFn(lenis.scrollTo)) {
        lenis.scrollTo(0, cfg.lenisOptions);
        return;
      }
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    };

    const bind = (el, cfg) => {
      el.addEventListener(
        "click",
        (e) => {
          e.preventDefault();
          scrollToTop(cfg);
        },
        { passive: false }
      );
    };

    const init = (options = {}) => {
      const cfg = Object.assign({}, DEFAULTS, options);
      const els = Utils.qsa(cfg.selector);
      Debug.log("GoToTop:", els.length, "trigger(s) for", cfg.selector);
      if (!els.length) return;
      els.forEach((el) => bind(el, cfg));
    };

    return { name: "GoToTop", init: () => init(options) };
  }

  /* ═══════════════ SmartSwiper — attribute-driven sliders (data-swiper) ═══════════════ */

  // SMART SWIPER — attribute-driven engine (the modern one; use for all new sites).
  // Add class .swiper + attribute data-swiper in Webflow. Optional attributes:
  //   data-swiper-slides="3|2|1"   slidesPerView desktop|tablet|mobile
  //   data-swiper-space="20|16|14" spaceBetween  desktop|tablet|mobile
  //   data-swiper-loop="true"      data-swiper-speed="600"
  //   data-swiper-autoplay="true"  data-swiper-autoplay-delay="5000"
  //   data-swiper-centered="true"  data-swiper-scope=".my-wrapper"
  // Auto-detects .swiper-prev / .swiper-next / .swiper-pagination inside the scope.
  // Lazy-loads Swiper 11 CSS+JS from jsDelivr only when needed. IO-based lazy init.
  // Public API (also on window.smartSwiper): init, refresh, ready(fn), initEl(el, opts)
  function SmartSwiper() {
    const SELECTOR = ".swiper[data-swiper]";
    const CSS_URL =
      "https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css";
    const JS_URL =
      "https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js";

    const hasIO = "IntersectionObserver" in window;
    const reduceMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const DEFAULTS = Object.freeze({
      slidesPerView: 3,
      spaceBetween: 20,
      speed: 735,
      loop: false,
      autoplay: false,
      centeredSlides: false,
      watchOverflow: true,
      simulateTouch: true,
      threshold: 0,
      touchReleaseOnEdges: true,
      observer: true,
      observeParents: true,
      observeSlideChildren: true,
      navigation: false,
      breakpoints: {
        0: { slidesPerView: 1, spaceBetween: 14 },
        768: { slidesPerView: 2, spaceBetween: 16 },
        1024: { slidesPerView: 3, spaceBetween: 20 },
      },
    });

    // ── Asset loading ──────────────────────────────────────────────────────────
    // Assets load unconditionally on init() — not gated on [data-swiper] elements
    // existing. This guarantees ready() and initEl() always resolve.
    let assetsReady = false;
    const readyQueue = [];

    function onAssetsReady() {
      assetsReady = true;
      readyQueue.splice(0).forEach((fn) => fn());
    }

    // Public: SmartSwiper.ready(fn)
    // Fires fn immediately if assets already loaded, otherwise queues it.
    function ready(fn) {
      if (typeof fn !== "function") return;
      if (assetsReady) fn();
      else readyQueue.push(fn);
    }

    // ── Helpers ────────────────────────────────────────────────────────────────
    const idle = (fn) =>
      "requestIdleCallback" in window
        ? window.requestIdleCallback(fn)
        : setTimeout(fn, 0);

    const parseBool = (value, fallback = false) => {
      if (value == null || value === "") return fallback;
      return String(value).toLowerCase() === "true";
    };

    const parseNum = (value, fallback) => {
      const n = Number(value);
      return Number.isFinite(n) ? n : fallback;
    };

    const parseTriple = (value, fallback) => {
      if (!value) return fallback.slice();
      const parts = String(value)
        .split("|")
        .map((s) => s.trim())
        .filter(Boolean);
      const desktop = parseNum(parts[0], fallback[0]);
      const tablet = parseNum(
        parts[1],
        parts[0] != null ? desktop : fallback[1]
      );
      const mobile = parseNum(
        parts[2],
        parts[1] != null ? tablet : fallback[2]
      );
      return [desktop, tablet, mobile];
    };

    const isDisplayed = (el) => !!el?.getClientRects?.().length;
    const getInstance = (el) =>
      el ? el._smartSwiperInstance || el.swiper || null : null;

    // ── Asset injection ────────────────────────────────────────────────────────
    function ensureCSS() {
      if (document.querySelector(`link[href*="${CSS_URL}"]`)) return;
      const link = Object.assign(document.createElement("link"), {
        rel: "stylesheet",
        href: CSS_URL,
      });
      document.head.appendChild(link);
    }

    function ensureJS(cb) {
      if (window.Swiper) {
        cb();
        return;
      }

      const existing = document.querySelector(`script[src*="${JS_URL}"]`);
      if (existing) {
        const wait = () => (window.Swiper ? cb() : setTimeout(wait, 40));
        wait();
        return;
      }

      const s = Object.assign(document.createElement("script"), {
        src: JS_URL,
        defer: true,
      });
      s.onload = cb;
      s.onerror = () => {};
      document.body.appendChild(s);
    }

    // ── Scope + nav resolution ─────────────────────────────────────────────────
    function resolveScope(el) {
      const selector = (el.dataset.swiperScope || "").trim();
      if (!selector) {
        return el.closest(".swiper-component") || el.parentElement || document;
      }
      let root = null;
      try {
        root = el.closest(selector);
      } catch (_) {}
      if (root) return root;
      try {
        root = document.querySelector(selector);
      } catch (_) {}
      return (
        root || el.closest(".swiper-component") || el.parentElement || document
      );
    }

    function resolveNav(el) {
      const scope = resolveScope(el);
      return {
        scope,
        prev: scope?.querySelector(".swiper-prev") ?? null,
        next: scope?.querySelector(".swiper-next") ?? null,
      };
    }

    // ── Autoplay builder ───────────────────────────────────────────────────────
    function buildAutoplay(el) {
      const enabled = parseBool(el.dataset.swiperAutoplay, DEFAULTS.autoplay);
      if (!enabled) return false;
      const raw = el.dataset.swiperAutoplayDelay;
      const delay =
        raw == null || raw === "" || raw === "false"
          ? 5000
          : Math.max(0, parseNum(raw, 5000));
      if (!delay) return false;
      return { delay, disableOnInteraction: true };
    }

    // ── Attribute option reader ────────────────────────────────────────────────
    function readOptions(el) {
      const slides = parseTriple(el.dataset.swiperSlides, [3, 2, 1]);
      const spaces = parseTriple(el.dataset.swiperSpace, [20, 16, 14]);
      const centered = parseBool(el.dataset.swiperCentered, false);
      const scope = resolveScope(el);

      const opts = {
        ...DEFAULTS,
        speed: parseNum(el.dataset.swiperSpeed, DEFAULTS.speed),
        loop: parseBool(el.dataset.swiperLoop, DEFAULTS.loop),
        autoplay: buildAutoplay(el),
        centeredSlides: centered,
        breakpoints: {
          0: {
            ...DEFAULTS.breakpoints[0],
            slidesPerView: slides[2],
            spaceBetween: spaces[2],
            centeredSlides: centered,
          },
          768: {
            ...DEFAULTS.breakpoints[768],
            slidesPerView: slides[1],
            spaceBetween: spaces[1],
            centeredSlides: centered,
          },
          1024: {
            ...DEFAULTS.breakpoints[1024],
            slidesPerView: slides[0],
            spaceBetween: spaces[0],
            centeredSlides: centered,
          },
        },
      };

      const paginationEl = scope?.querySelector(".swiper-pagination");
      if (paginationEl) {
        opts.pagination = { el: paginationEl, clickable: true };
      }

      if (reduceMotion) {
        opts.autoplay = false;
        opts.speed = Math.min(opts.speed || 400, 300);
      }

      const { prev, next } = resolveNav(el);
      if (prev || next) {
        opts.navigation = {
          prevEl: prev ?? null,
          nextEl: next ?? null,
          addIcons: false,
        };
      }

      return opts;
    }

    // ── Edge nav dimming ───────────────────────────────────────────────────────
    function bindEdgeNavState(el, swiper) {
      if (!swiper || el.dataset.swiperEdgeNavBound === "1") return;
      el.dataset.swiperEdgeNavBound = "1";

      const { prev, next } = resolveNav(el);
      const setHidden = (btn, hidden) => {
        if (!btn) return;
        btn.style.opacity = hidden ? "0.32" : "1";
        btn.style.cursor = hidden ? "not-allowed" : "pointer";
      };

      const update = () => {
        const locked = !!swiper.isLocked;
        setHidden(prev, locked || !!swiper.isBeginning);
        setHidden(next, locked || !!swiper.isEnd);
      };

      update();
      [
        "slideChange",
        "reachBeginning",
        "reachEnd",
        "fromEdge",
        "resize",
        "update",
        "lock",
        "unlock",
      ].forEach((evt) => {
        try {
          swiper.on(evt, update);
        } catch (_) {}
      });
    }

    // ── Core init / update (attribute-driven) ─────────────────────────────────
    function initOne(el) {
      if (!el) return;
      const existing = getInstance(el);
      if (existing) {
        updateOne(el);
        return;
      }
      if (!isDisplayed(el)) return;
      try {
        const swiper = new Swiper(el, readOptions(el));
        el._smartSwiperInstance = swiper;
        bindEdgeNavState(el, swiper);
        try {
          swiper.update();
        } catch (_) {}
      } catch (_) {}
    }

    function updateOne(el) {
      const swiper = getInstance(el);
      if (!swiper) {
        initOne(el);
        return;
      }
      if (!isDisplayed(el)) return;
      try {
        swiper.update();
        swiper.navigation?.update?.();
        bindEdgeNavState(el, swiper);
      } catch (_) {}
    }

    // ── Public: initEl ─────────────────────────────────────────────────────────
    //
    // Accepts a CSS selector STRING or a DOM element.
    //
    // KEY DIFFERENCE from attribute-driven init:
    // - The element is resolved INSIDE ready(), not at call time.
    // - This means you can safely call initEl() before the DOM is ready,
    //   before the element exists, or before Swiper assets are loaded.
    //   It will always work as long as the element exists by the time
    //   ready() fires (i.e. after DOMContentLoaded + Swiper JS loaded).
    // - No isDisplayed() guard — callers should know their element is visible.
    //
    // Usage:
    //   SmartSwiper.initEl('.my-slider', { loop: true, slidesPerView: 1 });
    //   SmartSwiper.initEl(document.querySelector('.my-slider'), { loop: true });
    //
    function initEl(elOrSelector, customOptions = {}) {
      ready(() => {
        // Resolve selector string here — after DOM + assets are ready
        const el =
          typeof elOrSelector === "string"
            ? document.querySelector(elOrSelector)
            : elOrSelector;

        if (!el) {
          console.warn(
            `SmartSwiper.initEl: element not found for "${elOrSelector}"`
          );
          return;
        }

        if (getInstance(el)) return; // already initialized

        try {
          const swiper = new Swiper(el, { ...DEFAULTS, ...customOptions });
          el._smartSwiperInstance = swiper;
          try {
            swiper.update();
          } catch (_) {}
        } catch (err) {
          console.error("SmartSwiper.initEl: Swiper init failed", err);
        }
      });
    }

    // ── Scan + observe ─────────────────────────────────────────────────────────
    function scan() {
      return Array.from(document.querySelectorAll(SELECTOR));
    }

    function observeAndInit(els) {
      if (!els.length) return;
      if (!hasIO) {
        els.forEach(initOne);
        return;
      }

      const io = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            initOne(entry.target);
            observer.unobserve(entry.target);
          });
        },
        { rootMargin: "200px 0px" }
      );

      els.forEach((el) => {
        if (!getInstance(el)) io.observe(el);
      });
    }

    // ── Boot ───────────────────────────────────────────────────────────────────
    function bootSwiper() {
      // BAKED-IN GUARD (audit fix L2/P3): this site has no sliders, so
      // don't fetch ~173 KB of Swiper CSS+JS for nothing. If a
      // [data-swiper] element is ever added, this loads as before.
      // NOTE: on slider-less pages ready()/initEl() callbacks now stay
      // queued — nothing on alphawerx uses them (verified Aug 2026).
      const els = scan();
      if (!els.length) {
        Debug.log("SmartSwiper: no [data-swiper] on this page — Swiper not loaded");
        return;
      }
      ensureCSS();
      ensureJS(() => {
        onAssetsReady(); // always resolve ready() queue first
        Debug.log(
          "SmartSwiper: assets ready —",
          els.length,
          "[data-swiper] slider(s) on this page"
        );
        observeAndInit(els);
      });
    }

    let refreshTimer;
    function refresh() {
      clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => {
        scan().forEach(updateOne);
      }, 100);
    }

    // ── Init ───────────────────────────────────────────────────────────────────
    function init() {
      const start = () => {
        idle(bootSwiper);

        document.addEventListener(
          "click",
          (e) => {
            if (e.target?.closest?.(".w-tab-link")) {
              setTimeout(refresh, 60);
              setTimeout(refresh, 180);
              setTimeout(refresh, 320);
            }
          },
          true
        );

        window.addEventListener("resize", refresh, { passive: true });

        window.smartSwiper = Object.freeze({
          init,
          refresh,
          update: refresh,
          ready,
          initEl,
        });
      };

      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", start, { once: true });
      } else {
        start();
      }
    }

    return Object.freeze({ name: "SmartSwiper", init, refresh, ready, initEl });
  }

  /* ═══════════════ ClickOnLoad — auto-click [data-click-on-load] ═══════════════ */

  // CLICK ON LOAD — auto-clicks [data-click-on-load] elements after Webflow ready,
  // with retries + MutationObserver for late-rendered DOM (CMS, tabs, IX2).
  function ClickOnLoad(options = {}) {
    const DEFAULTS = Object.freeze({
      selector: "[data-click-on-load]",
      clickedAttr: "data-clicked-on-load",
      retryDelays: [0, 50, 200, 800, 2000],
      observeMutations: true,
      mutationDebounce: 120,
      alsoRunOnWindowLoad: true,
      skipAnchorsWithHref: false,
      domReadyDelay: 320,
    });

    const safeDispatchClick = (el) => {
      try {
        el.dispatchEvent(
          new MouseEvent("click", {
            bubbles: true,
            cancelable: true,
            view: window,
          })
        );
      } catch (_) {}
      try {
        if (typeof el.click === "function") el.click();
      } catch (_) {}
    };

    const shouldSkip = (el, cfg) => {
      if (!el || el.nodeType !== 1) return true;
      if (el.hasAttribute(cfg.clickedAttr)) return true;
      if (cfg.skipAnchorsWithHref && el.matches("a[href]")) return true;
      return false;
    };

    const clickOne = (el, cfg) => {
      if (shouldSkip(el, cfg)) return false;
      el.setAttribute(cfg.clickedAttr, "1");
      safeDispatchClick(el);
      return true;
    };

    const clickAll = (cfg, root = document) => {
      const nodes = root.querySelectorAll(
        `${cfg.selector}:not([${cfg.clickedAttr}])`
      );
      nodes.forEach((el) => clickOne(el, cfg));
      return nodes.length;
    };

    const scheduleRetries = (cfg) => {
      cfg.retryDelays.forEach((ms) => setTimeout(() => clickAll(cfg), ms));
    };

    const debounce = (fn, wait) => {
      let t;
      return () => {
        clearTimeout(t);
        t = setTimeout(fn, wait);
      };
    };

    const onWebflowReady = (fn) => {
      if (window.Webflow && Array.isArray(window.Webflow))
        window.Webflow.push(fn);
      else fn();
    };

    const init = (options = {}) => {
      const cfg = Object.assign({}, DEFAULTS, options);

      const start = () => {
        Debug.log(
          "ClickOnLoad:",
          document.querySelectorAll(cfg.selector).length,
          "element(s) for",
          cfg.selector
        );
        scheduleRetries(cfg);

        if (cfg.observeMutations && "MutationObserver" in window) {
          const recheck = debounce(
            () => scheduleRetries(cfg),
            cfg.mutationDebounce
          );
          const mo = new MutationObserver(recheck);
          mo.observe(document.documentElement, {
            childList: true,
            subtree: true,
          });
          window.__clickOnLoadMO = mo;
        }

        if (cfg.alsoRunOnWindowLoad) {
          window.addEventListener("load", () => scheduleRetries(cfg), {
            once: true,
          });
        }
      };

      const bootClicks = () => {
        setTimeout(() => onWebflowReady(start), cfg.domReadyDelay);
      };

      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", bootClicks, {
          once: true,
        });
      } else {
        bootClicks();
      }
    };

    return { name: "ClickOnLoad", init: () => init(options) };
  }

  /* ═══════════════ KeyboardIx3Toggle — keyboard → Webflow IX3 events ═══════════════ */

  // KEYBOARD -> WEBFLOW IX3 CUSTOM EVENTS (TOGGLE)
  // Default: Shift+G emits "Shift G" / "Reverse Shift G" and toggles body class.
  // Pass { key, forwardEvent, reverseEvent, openClass } to customize.
  function KeyboardIx3Toggle(options = {}) {
    const DEFAULTS = Object.freeze({
      key: "g",
      forwardEvent: "Shift G",
      reverseEvent: "Reverse Shift G",
      openClass: "is-shift-g-open", // state stored on <body>
      allowRepeat: false,
      ignoreWhenTyping: true,
    });

    const isTypingField = (el) => {
      if (!el) return false;
      const tag = (el.tagName || "").toLowerCase();
      return tag === "input" || tag === "textarea" || el.isContentEditable;
    };

    const emit = (eventName) => {
      try {
        const ix3 = window.Webflow?.require?.("ix3");
        if (ix3 && typeof ix3.emit === "function") ix3.emit(eventName);
      } catch (_) {}
    };

    const init = (options = {}) => {
      const cfg = Object.assign({}, DEFAULTS, options);

      Debug.log(
        "KeyboardIx3Toggle: Shift+" + String(cfg.key).toUpperCase(),
        "→",
        cfg.forwardEvent,
        "/",
        cfg.reverseEvent
      );

      const onKeyDown = (e) => {
        if (!cfg.allowRepeat && e.repeat) return;
        if (cfg.ignoreWhenTyping && isTypingField(document.activeElement))
          return;

        // Only Shift + G (no Ctrl/Cmd/Alt)
        if (!e.shiftKey || e.ctrlKey || e.metaKey || e.altKey) return;

        const k = String(e.key || "").toLowerCase();
        if (k !== cfg.key) return;

        e.preventDefault();

        const isOpen = document.body.classList.contains(cfg.openClass);

        if (!isOpen) {
          emit(cfg.forwardEvent);
          document.body.classList.add(cfg.openClass);
        } else {
          emit(cfg.reverseEvent);
          document.body.classList.remove(cfg.openClass);
        }
      };

      window.Webflow = window.Webflow || [];
      window.Webflow.push(() => {
        window.addEventListener("keydown", onKeyDown);
      });
    };

    return { name: "KeyboardIx3Toggle", init: () => init(options) };
  }

  /* ═══════════════ core public API ═══════════════ */
  // Kept for backwards compatibility: anything already calling
  // window.BBCore.* (other embeds, console poking) keeps working.
  window.BBCore = Object.freeze({
    boot: boot,
    Debug: Debug,
    Utils: Utils,
    NavShrink: NavShrink,
    GoToTop: GoToTop,
    SmartSwiper: SmartSwiper,
    ClickOnLoad: ClickOnLoad,
    KeyboardIx3Toggle: KeyboardIx3Toggle,
  });

  /* ╔═══════════════════════════════════════════════════════════════╗
       ║  PART 2 — SITE MODULES (alphawerx)                            ║
       ╚═══════════════════════════════════════════════════════════════╝ */

  /* ═══════════════ GlowingBorders — PATCHED (drop-in replacement) ═══════════════
   Replaces the GlowingBorders() function in alphawerx.js v2.0 single-file build.

   WHY: the v2.0 version calls getBoundingClientRect() + 3 style writes on
   EVERY [data-glowing-border] element on EVERY pointermove frame — including
   elements nowhere near the viewport. On /case-studies that's ~18 elements
   (6 cards × card + 2 result chips); after Load More it's ~30. Moving the
   mouse while scrolling = layout reads + style recalcs every frame on all of
   them → scroll jank that gets WORSE each time more items load.

   THIS PATCH (same fix your v2.2 split build already documented): an
   IntersectionObserver keeps the paint list to what's actually on screen.
   Offscreen cards get their intensity zeroed once and are skipped entirely.
   Same public behavior, same attributes, same window.refreshGlowingBorders()
   hook — nothing changes in the Designer.
   ═══════════════════════════════════════════════════════════════════════════ */
  function GlowingBorders() {
    const RANGE_DEFAULT = 260; // px past the card edge where the glow hits zero

    let cards = []; // every [data-glowing-border] on the page
    let visible = new Set(); // ...the ones actually on screen (painted)
    let io = null;

    const observe = () => {
      if (io) io.disconnect();
      visible = new Set();
      io = new IntersectionObserver(
        (entries) => {
          for (const en of entries) {
            const card = cards.find((c) => c.el === en.target);
            if (!card) continue;
            if (en.isIntersecting) {
              visible.add(card);
            } else {
              visible.delete(card);
              // zero once on exit so nothing stays lit, then never touched again
              en.target.style.setProperty("--glow-intensity", 0);
            }
          }
        },
        { rootMargin: "120px" } // start painting slightly before entry
      );
      cards.forEach((c) => io.observe(c.el));
    };

    const collect = () => {
      cards = [...document.querySelectorAll("[data-glowing-border]")].map(
        (el) => ({
          el,
          range:
            parseFloat(el.getAttribute("data-glow-range")) || RANGE_DEFAULT,
        })
      );
      observe();
      Debug.log("GlowingBorders:", cards.length, "card(s)");
    };

    let raf = 0;
    let px = 0,
      py = 0;
    const paint = () => {
      raf = 0;
      // only what's on screen — offscreen cards cost nothing
      for (const { el, range } of visible) {
        const r = el.getBoundingClientRect();
        el.style.setProperty("--glow-x", `${px - r.left}px`);
        el.style.setProperty("--glow-y", `${py - r.top}px`);
        const dx = Math.max(r.left - px, 0, px - r.right);
        const dy = Math.max(r.top - py, 0, py - r.bottom);
        const d = Math.hypot(dx, dy);
        const t = Math.max(0, 1 - d / range);
        el.style.setProperty("--glow-intensity", (t * t).toFixed(3));
      }
    };

    function init() {
      collect();

      window.addEventListener(
        "pointermove",
        (e) => {
          if (e.pointerType === "touch") return; // hover effect: mouse/pen only
          px = e.clientX;
          py = e.clientY;
          if (!raf) raf = requestAnimationFrame(paint);
        },
        { passive: true }
      );

      // Fade everything out when the cursor leaves the page
      document.documentElement.addEventListener("pointerleave", () => {
        for (const { el } of cards) el.style.setProperty("--glow-intensity", 0);
      });

      // Re-scan hook for dynamically injected cards (fs-list load more, CMS
      // filtering). Re-collect + re-observe so new cards join the paint list.
      window.refreshGlowingBorders = collect;
    }

    return { name: "GlowingBorders", init };
  }

  // AUTO TABS — auto-rotating tab section on [data-auto-tabs] (COALESCE).
  // The progress bar's CSS animation IS the timer: its `animationend`
  // event advances to the next tab, and pausing just flips
  // animation-play-state — so the bar and the switch can never drift.
  // Visuals live in CSS (head embed); this only drives classes:
  //   .is-active   on the current .auto-tab + .auto-tabs-panel
  //   .is-paused   on the [data-auto-tabs] root
  // The panels wrapper always matches the ACTIVE panel's height (the
  // active panel is in flow; inactive ones are absolute — see CSS) and
  // this module tweens the wrapper between heights on switch.
  //
  // Autoplay is VIEWPORT-AWARE — playing = barInView && !userPaused:
  //   • runs only while the tab BAR is on screen (≥ IN_VIEW_THRESHOLD)
  //   • scrolling away freezes the progress bar mid-sweep; scrolling
  //     back resumes it from the same point
  //   • a pause from the toggle is STICKY: the viewport never resumes
  //     it — only the user pressing play clears it
  //   • reduced-motion starts sticky-paused; pressing play opts in
  //
  // Expected structure inside [data-auto-tabs], matched by order:
  //   .auto-tabs-bar > .auto-tabs-list > .auto-tab
  //                    (each with .auto-tab-progress + .auto-tab-label)
  //   .auto-tabs-panels > .auto-tabs-panel
  //   [data-tabs-toggle]  play/pause button (optional)
  // Timing: DEFAULT_TAB_DURATION below; per-tab override in Webflow:
  //   data-duration="8000"   (ms, on the .auto-tab button)
  // ARIA roles, ids, and arrow-key nav are wired here — nothing extra
  // to add in Designer. After injecting a new instance dynamically:
  //   window.refreshAutoTabs()
  function AutoTabs() {
    const DEFAULT_TAB_DURATION = 6000; // ms per tab unless data-duration says otherwise
    const IN_VIEW_THRESHOLD = 0.4; // how much of the BAR must be visible to count as in view

    function initRoot(root) {
      if (root.hasAttribute("data-auto-tabs-ready")) return; // never double-bind
      root.setAttribute("data-auto-tabs-ready", "");

      const tabs = [...root.querySelectorAll(".auto-tab")];
      const panels = [...root.querySelectorAll(".auto-tabs-panel")];
      const toggle = root.querySelector("[data-tabs-toggle]");
      const list = root.querySelector(".auto-tabs-list");
      if (!tabs.length || tabs.length !== panels.length) {
        Debug.log("AutoTabs: tab/panel count mismatch — skipped", root);
        return;
      }
      const panelsWrap =
        root.querySelector(".auto-tabs-panels") || panels[0].parentElement;
      const bar = root.querySelector(".auto-tabs-bar") || root;

      const reduceMotion = matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      let current = Math.max(
        0,
        tabs.findIndex((t) => t.classList.contains("is-active"))
      );

      /* ---- play state = two independent signals ----
             userPaused : sticky user intent from the toggle
             barInView  : live viewport signal from the observer
             The rotation runs only when BOTH allow it. */
      let playing = false;
      let userPaused = reduceMotion; // reduced-motion = sticky pause until user opts in
      let barInView = false;

      function applyPlayState() {
        setPlaying(barInView && !userPaused);
      }

      /* wire ARIA + durations (markup stays minimal in the Designer) */
      const uid = Math.random().toString(36).slice(2, 7);
      if (list) list.setAttribute("role", "tablist");

      tabs.forEach((tab, i) => {
        const panel = panels[i];
        tab.id = tab.id || `auto-tab-${uid}-${i}`;
        panel.id = panel.id || `auto-panel-${uid}-${i}`;
        tab.setAttribute("role", "tab");
        tab.setAttribute("aria-controls", panel.id);
        panel.setAttribute("role", "tabpanel");
        panel.setAttribute("aria-labelledby", tab.id);

        // Per-tab duration drives BOTH the visible bar and the auto-advance
        const fill = tab.querySelector(".auto-tab-progress");
        fill.style.animationDuration =
          (parseInt(tab.dataset.duration, 10) || DEFAULT_TAB_DURATION) + "ms";

        // The bar finishing IS the timer — no setTimeout, so no drift
        fill.addEventListener("animationend", () =>
          activate((i + 1) % tabs.length)
        );

        tab.addEventListener("click", () => {
          if (i === current) return;
          activate(i);
          // To make a manual click stop the rotation instead, add:
          // userPaused = true; applyPlayState();
        });
      });

      /* keyboard (ARIA tabs pattern) */
      if (list)
        list.addEventListener("keydown", (e) => {
          if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
          e.preventDefault();
          const next =
            (current + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) %
            tabs.length;
          activate(next);
          tabs[next].focus();
        });

      /* play / pause toggle — pausing is sticky, playing hands control
             back to the viewport (toggle optional) */
      if (toggle)
        toggle.addEventListener("click", () => {
          userPaused = playing; // playing → this click is a sticky pause; paused → clears it
          applyPlayState();
        });

      /* height tween cleanup: once the wrapper reaches its target height,
             release it back to `auto` so responsive reflow keeps working */
      panelsWrap.addEventListener("transitionend", (e) => {
        if (e.target === panelsWrap && e.propertyName === "height")
          panelsWrap.style.height = "";
      });

      function setPlaying(state) {
        playing = state;
        root.classList.toggle("is-paused", !playing);
        if (toggle)
          toggle.setAttribute(
            "aria-label",
            playing ? "Pause auto-rotation" : "Play auto-rotation"
          );
      }

      function activate(index) {
        if (index === current) return;

        // Current rendered height — accurate even mid-tween
        const startH = panelsWrap.getBoundingClientRect().height;

        tabs[current].classList.remove("is-active");
        panels[current].classList.remove("is-active");
        current = index;
        tabs[current].classList.add("is-active"); // fresh bar starts automatically
        panels[current].classList.add("is-active");
        syncAria();

        // New active panel is now in flow — its natural height is the target
        const targetH = panels[current].offsetHeight;
        if (reduceMotion || Math.abs(startH - targetH) < 1) {
          panelsWrap.style.height = ""; // snap / nothing to animate
          return;
        }
        panelsWrap.style.height = startH + "px";
        void panelsWrap.offsetHeight; // commit start height before retargeting
        panelsWrap.style.height = targetH + "px"; // CSS transition runs
      }

      function syncAria() {
        tabs.forEach((t, i) => {
          t.setAttribute("aria-selected", i === current ? "true" : "false");
          t.tabIndex = i === current ? 0 : -1;
        });
      }

      /* init */
      syncAria();
      setPlaying(false);

      /* viewport signal: watches the BAR itself (not the whole section,
             whose tall panels would drag the ratio down) and stays connected
             for the life of the page — every enter/leave re-evaluates */
      const io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) barInView = e.isIntersecting;
          applyPlayState();
        },
        { threshold: IN_VIEW_THRESHOLD }
      );
      io.observe(bar);
    }

    function init() {
      const roots = document.querySelectorAll("[data-auto-tabs]");
      roots.forEach(initRoot);
      Debug.log("AutoTabs:", roots.length, "instance(s)");

      // Re-scan hook for dynamically injected instances
      window.refreshAutoTabs = () =>
        document.querySelectorAll("[data-auto-tabs]").forEach(initRoot);
    }

    return { name: "AutoTabs", init };
  }

  // DEPLOY ACCORDION — click accordion + video swap on [data-scroll-phases].
  // v2.0 replacement for ScrollPhases: ALL scroll-driven behavior is
  // gone. Plain tabs at every breakpoint:
  //   • the markup's .is-active item opens on load (falls back to 01)
  //   • clicking a head opens that phase and closes the previous one
  //   • clicking the ALREADY-OPEN head is a no-op — which is exactly
  //     how "one must always stay open" works: the only way to close
  //     a panel is to open another
  // The attribute stays [data-scroll-phases] on purpose — zero
  // Designer rewiring for the behavior swap.
  //
  // Visuals: desktop keeps the right-column video stack and crossfades
  // .deploy-video.is-active on click (styles live in Designer). The
  // active video restarts (currentTime = 0) and plays; the rest pause.
  // An IntersectionObserver pauses the active video while the section
  // is offscreen.
  //
  // TABLET/PHONE (≤991px — .deploy-right is display:none in Designer):
  // each figure is RELOCATED into its item's .deploy-item-body-inner
  // (moved, not cloned — nothing double-downloads) and back to
  // .deploy-visuals above the breakpoint. Videos get preload="none"
  // on phone for cellular citizenship.
  //
  // Reduced motion: videos never autoplay; the swap is fade-only (CSS).
  // After injecting an instance dynamically:  window.refreshDeployAccordion()
  function DeployAccordion() {
    const PHONE_MQ = "(max-width: 991px)"; // Webflow tablet break — keep in sync with the custom CSS

    function initRoot(track) {
      if (track.hasAttribute("data-scroll-phases-ready")) return; // never double-bind
      track.setAttribute("data-scroll-phases-ready", "");

      const items = [...track.querySelectorAll(".deploy-item")];
      const figs = [...track.querySelectorAll(".deploy-video")];
      const visualsWrap = track.querySelector(".deploy-visuals");
      const n = items.length;
      if (!n || (figs.length && figs.length !== n)) {
        Debug.log(
          "DeployAccordion: item/video count mismatch — skipped",
          track
        );
        return;
      }

      const mq = matchMedia(PHONE_MQ);
      const reduceMotion = matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      let current = -1; // forces the first activate() to run
      let inView = false;

      function activate(index) {
        if (index === current) return; // open head clicked → no-op (one always open)
        current = index;

        items.forEach((el, i) => {
          const active = i === index;
          el.classList.toggle("is-active", active);
          const head = el.querySelector(".deploy-item-head");
          if (head)
            head.setAttribute("aria-expanded", active ? "true" : "false");
        });

        figs.forEach((fig, i) => {
          const active = i === index;
          fig.classList.toggle("is-active", active);
          const v = fig.querySelector("video");
          if (!v) return;
          if (active) {
            try {
              v.currentTime = 0; // restart from the top
            } catch (_) {}
            if (!reduceMotion && inView) v.play().catch(() => {});
          } else {
            v.pause();
          }
        });
      }

      /* PHONE MODE — relocate figures into their item bodies (moved,
             not cloned) and back again when the breakpoint is crossed. */
      const applyMode = () => {
        const phone = mq.matches;
        figs.forEach((fig, i) => {
          const v = fig.querySelector("video");
          if (phone) {
            const inner = items[i].querySelector(".deploy-item-body-inner");
            if (inner && fig.parentElement !== inner) {
              inner.appendChild(fig); // video BELOW the bullets — for
              // above-bullets use:
              // inner.insertBefore(fig, inner.querySelector("ul"));
            }
            if (v) v.preload = "none"; // cellular citizenship
          } else {
            if (visualsWrap && fig.parentElement !== visualsWrap)
              visualsWrap.appendChild(fig); // figs order restores stack order
            if (v) v.preload = "metadata";
          }
        });
      };

      mq.addEventListener("change", applyMode);

      /* heads: direct toggle at every breakpoint */
      items.forEach((el, i) => {
        const head = el.querySelector(".deploy-item-head");
        if (head) head.addEventListener("click", () => activate(i));
      });

      /* pause the active video while the track is offscreen */
      const io = new IntersectionObserver((entries) => {
        for (const e of entries) inView = e.isIntersecting;
        const fig = figs[current];
        const v = fig && fig.querySelector("video");
        if (!v) return;
        if (inView && !reduceMotion) v.play().catch(() => {});
        else v.pause();
      });
      io.observe(track);

      applyMode();
      // open the markup's is-active item (falls back to 01) — this
      // first pass also wires aria-expanded and pauses inactive videos
      activate(
        Math.max(
          0,
          items.findIndex((el) => el.classList.contains("is-active"))
        )
      );
    }

    function init() {
      const roots = document.querySelectorAll("[data-scroll-phases]");
      roots.forEach(initRoot);
      Debug.log("DeployAccordion:", roots.length, "instance(s)");

      // Re-scan hook for dynamically injected instances
      // (old name kept as an alias so nothing breaks)
      window.refreshDeployAccordion = window.refreshScrollPhases = () =>
        document.querySelectorAll("[data-scroll-phases]").forEach(initRoot);
    }

    return { name: "DeployAccordion", init };
  }

  // COUNT UP — scroll-triggered number count-up on [data-count-up].
  // Authoring model: the markup ships the REAL final value ("$968,279",
  // "52.5%", "1,609") — this parses it at runtime into prefix / number /
  // suffix, notes the decimals, and animates 0 → final with the same
  // comma formatting, restoring the exact original string at the end.
  // Because the truth is already in the DOM: no-JS and SEO see real
  // numbers, reduced-motion needs zero handling (we just don't run),
  // and CMS-bound text works untouched. Layout never jumps: before
  // counting we measure the final text and lock min-width at that size
  // (inline counters get inline-block + right-align in CSS so the
  // suffix side stays pinned). Plays ONCE per element — the observer
  // disconnects at 60% visibility. Per-element speed override in
  // Webflow:  data-count-duration="2000"   (ms)
  // Elements with no digits ("Zero") are skipped silently.
  // After injecting counters dynamically (CMS filtering, pagination):
  //   window.refreshCountUps()
  function CountUp() {
    const DURATION_DEFAULT = 1600; // ms, 0 → final
    const VISIBLE_AT = 0.6; // how much of the element must be on screen
    const NUM_RE = /-?[\d,]*\.?\d+/; // first number in the text, commas ok

    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

    function initEl(el) {
      if (el.hasAttribute("data-count-up-ready")) return; // never double-bind
      el.setAttribute("data-count-up-ready", "");

      const finalText = el.textContent;
      const m = finalText.match(NUM_RE);
      if (!m) return; // "Zero" etc — nothing to count

      const prefix = finalText.slice(0, m.index);
      const suffix = finalText.slice(m.index + m[0].length);
      const target = parseFloat(m[0].replace(/,/g, ""));
      const dot = m[0].indexOf(".");
      const decimals = dot === -1 ? 0 : m[0].length - dot - 1;
      const duration =
        parseInt(el.getAttribute("data-count-duration"), 10) ||
        DURATION_DEFAULT;

      const fmt = (v) =>
        prefix +
        v.toLocaleString("en-US", {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }) +
        suffix;

      const io = new IntersectionObserver(
        (entries) => {
          if (!entries.some((e) => e.isIntersecting)) return;
          io.disconnect(); // plays once

          // lock width at the FINAL text's size — nothing shuffles
          el.style.minWidth = el.getBoundingClientRect().width + "px";

          const t0 = performance.now();
          const tick = (now) => {
            const p = Math.min(1, (now - t0) / duration);
            const eased = 1 - Math.pow(1 - p, 4); // fast open, long settle
            el.textContent = fmt(target * eased);
            if (p < 1) requestAnimationFrame(tick);
            else {
              el.textContent = finalText; // exact original string back
              el.style.minWidth = "";
            }
          };
          requestAnimationFrame(tick);
        },
        { threshold: VISIBLE_AT }
      );
      io.observe(el);
    }

    function init() {
      // hook exists either way so callers never throw
      window.refreshCountUps = () => {
        if (reduce) return;
        document.querySelectorAll("[data-count-up]").forEach(initEl);
      };
      if (reduce) {
        Debug.log("CountUp: reduced motion — numbers stay static");
        return; // markup already shows the real values
      }
      const els = document.querySelectorAll("[data-count-up]");
      els.forEach(initEl);
      Debug.log("CountUp:", els.length, "counter(s)");
    }

    return { name: "CountUp", init };
  }

  // GSAP MOTION — trigger-based reveals on [data-gsap-title] + [data-gsap-reveal].
  //
  //   [data-gsap-title]   splits the text (words by default) and floats
  //                       the pieces up with a blur + 3D tilt
  //   [data-gsap-reveal]  moves the element as a whole
  //
  // By default every element is INDEPENDENT: its own ScrollTrigger, its
  // own tween, firing when it reaches the start position. Nothing waits
  // on anything else.
  //
  // To sequence several of them, wrap them in a container carrying
  // [data-gsap-motion-stagger]. Every title/reveal inside then shares ONE
  // ScrollTrigger on that container, offset by index × step in DOM order
  // — member 0 at 0s, member 1 at 1×step, and so on. The attribute's
  // value IS the step in seconds; leave it empty for the default.
  //
  //   <div data-gsap-motion-stagger="0.12">
  //     <h2 data-gsap-title>…</h2>     ← fires at 0.00s
  //     <p  data-gsap-reveal>…</p>     ← fires at 0.12s
  //     <a  data-gsap-reveal>…</a>     ← fires at 0.24s
  //   </div>
  //
  // Two different staggers, don't mix them up:
  //   data-gsap-motion-stagger   on a CONTAINER — step between members
  //   data-gsap-stagger          on an ELEMENT  — step between its own
  //                              pieces (a title's words, or the nodes
  //                              matched by data-gsap-children)
  //
  // Plays ONCE on enter — no scrub.
  //
  // Per-element knobs:
  //   data-gsap-y="10"             travel, px
  //   data-gsap-duration="0.9"     per piece
  //   data-gsap-ease="power3.out"
  //   data-gsap-start="top 80%"    ignored inside a stagger container —
  //                                the container owns the trigger there
  //   data-gsap-from="bottom|top|left|right"    reveal only
  //   data-gsap-children=".card"   reveal only — animate these instead
  //   data-gsap-split="words|chars|lines"       title only, default words
  //   data-gsap-target=".u-text"   title only — child to split
  //   data-gsap-blur="10"          title only, 0 turns it off
  //   data-gsap-rotate="25"        title only, deg
  //   data-gsap-keep-split="true"  title only — see below
  //
  // Titles REVERT their split once they finish: the spans come out, the
  // original markup goes back, text is selectable again and a resize
  // can't rewrap a stale line split. data-gsap-keep-split="true" if your
  // CSS styles .word / .char.
  //
  // Degrades in layers. No SplitText → titles animate as whole-element
  // reveals. No GSAP at all → everything is revealed unanimated. A failed
  // CDN can never leave a page blank.
  //
  // FOUC: reveals get their from-state set synchronously at boot; titles
  // can't (nothing to set until the split exists), so pair with the CSS:
  //   html.w-mod-js [data-gsap-title],
  //   html.w-mod-js [data-gsap-reveal]{ visibility: hidden }
  //   [data-gsap-title].is-gsap-ready,
  //   [data-gsap-reveal].is-gsap-ready{ visibility: visible }
  // A hard timeout reveals everything regardless.
  //
  // After injecting content dynamically:  window.refreshGsapMotion()
  function GsapMotion() {
    const DEFAULTS = {
      // shared
      y: 16,
      duration: 2,
      ease: "power3.out",
      start: "top 90%",
      from: "bottom",
      group: 0.12, // step between members of a stagger container
      children: 0.08, // step between data-gsap-children nodes
      // title only
      split: "words",
      blur: 5,
      rotate: 25,
      perspective: 800, // without this rotationX reads as a flat squash
    };
    // a title's own pieces — more pieces, smaller step
    const PIECE_STAGGER = { chars: 0.012, words: 0.012, lines: 0.012 };
    // keep words whole inside a char split, and inside a line split
    const SPLIT_TYPE = {
      chars: "words,chars",
      words: "words",
      lines: "lines,words",
    };
    // where the element travels FROM
    const OFFSET = {
      bottom: (d) => ({ y: d }),
      top: (d) => ({ y: -d }),
      left: (d) => ({ x: -d }),
      right: (d) => ({ x: d }),
    };
    const SEL = "[data-gsap-title], [data-gsap-reveal]";
    const GROUP_SEL = "[data-gsap-motion-stagger]";
    const READY = "is-gsap-ready";
    const REVEAL_TIMEOUT = 4000; // safety — content must never stay hidden
    const LABELABLE = /^(H[1-6]|A|BUTTON|SUMMARY|FIGCAPTION)$/;

    const live = [];
    let registered = false;
    let hasSplitText = false;

    const num = (el, attr, fallback) => {
      const v = parseFloat(el.getAttribute(attr));
      return isNaN(v) ? fallback : v;
    };
    const reveal = (el) => el.classList.add(READY);
    const isTitle = (el) => el.hasAttribute("data-gsap-title");

    const targetsOf = (el) => {
      const sel = el.getAttribute("data-gsap-children");
      if (sel === null) return [el]; // absent — the element moves as a whole
      const kids =
        sel && sel !== "*" ? [...el.querySelectorAll(sel)] : [...el.children];
      return kids.length ? kids : [el]; // empty container — don't animate nothing
    };

    const fromState = (el) => {
      const dist = num(el, "data-gsap-y", DEFAULTS.y);
      const dir = (
        el.getAttribute("data-gsap-from") || DEFAULTS.from
      ).toLowerCase();
      return Object.assign(
        { opacity: 0, force3D: true },
        (OFFSET[dir] || OFFSET[DEFAULTS.from])(dist)
      );
    };

    const makeSplit = (textEl, kind) =>
      typeof SplitText.create === "function"
        ? SplitText.create(textEl, { type: SPLIT_TYPE[kind], aria: false })
        : new SplitText(textEl, { type: SPLIT_TYPE[kind], aria: false });

    /* Build one element's vars. Returns { targets, from, to, cleanup,
         split } — the caller decides whether it gets its own ScrollTrigger
         or goes into a container's timeline. */
    function prep(el) {
      const duration = num(el, "data-gsap-duration", DEFAULTS.duration);
      const ease = el.getAttribute("data-gsap-ease") || DEFAULTS.ease;

      if (isTitle(el) && hasSplitText) {
        const sel = el.getAttribute("data-gsap-target");
        const textEl =
          (sel && el.querySelector(sel)) || el.querySelector(".u-text") || el;
        const original = textEl.textContent; // grab it BEFORE the split
        if (!original.trim()) return null;

        const asked = (
          el.getAttribute("data-gsap-split") || DEFAULTS.split
        ).toLowerCase();
        const kind = SPLIT_TYPE[asked] ? asked : DEFAULTS.split;

        const split = makeSplit(textEl, kind);
        const pieces = split[kind];
        if (!pieces || !pieces.length) {
          split.revert();
          return null;
        }

        // aria-label is only permitted on roles that accept a name; where
        // it isn't, the pieces stay readable rather than hiding the text
        const canLabel = LABELABLE.test(textEl.tagName);
        if (canLabel) {
          textEl.setAttribute("aria-label", original);
          pieces.forEach((p) => p.setAttribute("aria-hidden", "true"));
        }

        const blur = num(el, "data-gsap-blur", DEFAULTS.blur);
        const keep = el.getAttribute("data-gsap-keep-split") === "true";

        return {
          targets: pieces,
          split: split,
          from: {
            y: num(el, "data-gsap-y", DEFAULTS.y),
            opacity: 0,
            filter: blur ? "blur(" + blur + "px)" : "none",
            rotationX: num(el, "data-gsap-rotate", DEFAULTS.rotate),
            transformPerspective: DEFAULTS.perspective,
            transformOrigin: "50% 100%",
            force3D: true,
          },
          to: {
            y: 0,
            opacity: 1,
            filter: blur ? "blur(0px)" : "none",
            rotationX: 0,
            duration: duration,
            ease: ease,
            force3D: true,
            stagger: num(el, "data-gsap-stagger", PIECE_STAGGER[kind]),
            clearProps: "transform,opacity,filter",
          },
          cleanup: keep
            ? null
            : () => {
                split.revert(); // spans out, original markup back
                if (canLabel) textEl.removeAttribute("aria-label");
              },
        };
      }

      // reveal — and the fallback path for titles when SplitText is off
      const targets = targetsOf(el);
      return {
        targets: targets,
        split: null,
        cleanup: null,
        from: fromState(el),
        to: {
          x: 0,
          y: 0,
          opacity: 1,
          duration: duration,
          ease: ease,
          force3D: true,
          stagger:
            targets.length > 1
              ? num(el, "data-gsap-stagger", DEFAULTS.children)
              : 0,
          clearProps: "transform,opacity", // hand layout back to CSS
        },
      };
    }

    /* independent: its own trigger, fires on its own */
    function bindSolo(el) {
      const p = prep(el);
      reveal(el);
      if (!p) return;
      p.to.scrollTrigger = {
        trigger: el,
        start: el.getAttribute("data-gsap-start") || DEFAULTS.start,
        once: true,
        toggleActions: "play none none none",
      };
      if (p.cleanup) p.to.onComplete = p.cleanup;
      live.push({
        tween: gsap.fromTo(p.targets, p.from, p.to),
        split: p.split,
      });
    }

    /* sequenced: one trigger on the container, members offset by index */
    function bindGroup(root, els) {
      const step =
        parseFloat(root.getAttribute("data-gsap-motion-stagger")) ||
        DEFAULTS.group;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: root.getAttribute("data-gsap-start") || DEFAULTS.start,
          once: true,
          toggleActions: "play none none none",
        },
      });

      const cleanups = [];
      els.forEach((el, i) => {
        const p = prep(el);
        reveal(el);
        if (!p) return;
        tl.fromTo(p.targets, p.from, p.to, i * step); // absolute seconds
        if (p.cleanup) cleanups.push(p.cleanup);
        if (p.split) live.push({ split: p.split });
      });

      if (cleanups.length)
        tl.eventCallback("onComplete", () => cleanups.forEach((fn) => fn()));
      live.push({ tween: tl });
    }

    /* split the unbound elements into solo ones and container groups */
    function collect() {
      const solo = [];
      const groups = new Map();
      document.querySelectorAll(SEL).forEach((el) => {
        if (el.hasAttribute("data-gsap-motion-ready")) return; // never double-bind
        el.setAttribute("data-gsap-motion-ready", "");
        const root = el.closest(GROUP_SEL);
        if (root) {
          if (!groups.has(root)) groups.set(root, []);
          groups.get(root).push(el); // querySelectorAll gives DOM order
        } else {
          solo.push(el);
        }
      });
      return { solo: solo, groups: groups };
    }

    function bindAll() {
      const { solo, groups } = collect();
      solo.forEach(bindSolo);
      groups.forEach((els, root) => bindGroup(root, els));
      ScrollTrigger.refresh(); // positions settle after the splits reflow
      return solo.length + groups.size;
    }

    function init() {
      const all = () => document.querySelectorAll(SEL);

      // hooks exist either way so callers never throw; old names aliased
      const rescan = () => {
        if (!window.gsap || !window.ScrollTrigger) return;
        bindAll();
      };
      window.refreshGsapMotion =
        window.refreshGsapTitles =
        window.refreshGsapReveals =
          rescan;

      const els = all();
      if (!els.length) return;

      if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
        els.forEach(reveal);
        Debug.log("GsapMotion: reduced motion — content shown, not animated");
        return;
      }
      if (!window.gsap || !window.ScrollTrigger) {
        els.forEach(reveal);
        Debug.log("GsapMotion: gsap/ScrollTrigger missing — content shown");
        return;
      }
      hasSplitText = !!window.SplitText;
      if (!registered) {
        gsap.registerPlugin(ScrollTrigger);
        if (hasSplitText) gsap.registerPlugin(SplitText);
        registered = true;
      }
      if (!hasSplitText)
        Debug.log("GsapMotion: no SplitText — titles animate whole");

      // reveals can be hidden right now; a title has nothing to set until
      // it's split, so it leans on the CSS until bindAll runs
      els.forEach((el) => {
        if (!isTitle(el) || !hasSplitText) {
          gsap.set(targetsOf(el), fromState(el));
          reveal(el);
        }
      });

      let started = false;
      const start = () => {
        if (started) return;
        started = true;
        Debug.log("GsapMotion:", bindAll(), "trigger(s)");
      };

      // split AFTER webfonts land — splitting on fallback metrics measures
      // the wrong boxes and lines re-wrap under you
      const fonts =
        (document.fonts && document.fonts.ready) || Promise.resolve();

      if (document.querySelector(".preloader")) {
        // anything playing out behind the preloader is a reveal nobody sees
        window.addEventListener("preloaderComplete", () => fonts.then(start), {
          once: true,
          passive: true,
        });
      } else {
        fonts.then(start);
      }
      setTimeout(start, REVEAL_TIMEOUT);

      window.addEventListener(
        "pagehide",
        () => {
          live.forEach((r) => {
            if (r.tween) {
              if (r.tween.scrollTrigger) r.tween.scrollTrigger.kill();
              r.tween.kill();
            }
            if (r.split) r.split.revert();
          });
          live.length = 0;
        },
        { passive: true }
      );
    }

    return { name: "GsapMotion", init };
  }

  /* ============================================================================
   WhyJoinTabs  v1.0 — click-to-switch tabs for the "Why Join" section
   ----------------------------------------------------------------------------
   Markup contract (the Webflow classes as already built — no new attributes):

     section.s-why-join
       .why-join-visuals
         .why-join-visual        one per tab; .is-active = the visible one
       .why-join-tab-links
         a.why-join-tab-link     one per visual; .is-active = the current tab

   Links pair to visuals by DOM order. Click only — no timers, no autoplay.
   Adds tablist/tab/tabpanel semantics and arrow-key navigation.
   Fires `whyJoinTabChange` on the section (detail: {index, link, visual}).
   After injecting markup (CMS, filtering): window.refreshWhyJoinTabs()
============================================================================ */

  const WJT = { groups: [], cfg: null, uid: 0 };

  const WJT_DEFAULTS = {
    scope: ".s-why-join",
    list: ".why-join-tab-links",
    link: ".why-join-tab-link",
    visuals: ".why-join-visuals",
    visual: ".why-join-visual",
    active: "is-active",
  };

  function wjtLog() {
    const d = window.BBCore && window.BBCore.Debug;
    if (d && typeof d.log === "function") {
      d.log.apply(
        d,
        ["WhyJoinTabs"].concat(Array.prototype.slice.call(arguments))
      );
    }
  }

  function wjtSelect(group, index, opts) {
    const focus = !!(opts && opts.focus);
    const last = group.links.length - 1;
    const i = index < 0 ? 0 : index > last ? last : index;

    if (group.index === i) {
      if (focus) group.links[i].focus();
      return;
    }
    group.index = i;

    group.links.forEach(function (link, n) {
      const on = n === i;
      link.classList.toggle(group.cfg.active, on);
      link.setAttribute("aria-selected", on ? "true" : "false");
      link.tabIndex = on ? 0 : -1;
      if (on && focus) link.focus();
    });

    group.visuals.forEach(function (visual, n) {
      const on = n === i;
      visual.classList.toggle(group.cfg.active, on);
      visual.setAttribute("aria-hidden", on ? "false" : "true");
    });

    group.scope.dispatchEvent(
      new CustomEvent("whyJoinTabChange", {
        bubbles: true,
        detail: {
          index: i,
          link: group.links[i],
          visual: group.visuals[i] || null,
        },
      })
    );
  }

  function wjtKeydown(group, event) {
    const total = group.links.length;
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[
      event.key
    ];

    if (event.key === "Home") {
      event.preventDefault();
      wjtSelect(group, 0, { focus: true });
      return;
    }
    if (event.key === "End") {
      event.preventDefault();
      wjtSelect(group, total - 1, { focus: true });
      return;
    }
    if (!step) return;

    event.preventDefault();
    wjtSelect(group, (group.index + step + total) % total, { focus: true });
  }

  function wjtBuild(scope, cfg) {
    const visualsEl = scope.querySelector(cfg.visuals);
    const listEl = scope.querySelector(cfg.list);
    if (!visualsEl || !listEl) return null;

    const links = Array.prototype.slice.call(listEl.querySelectorAll(cfg.link));
    const visuals = Array.prototype.slice.call(
      visualsEl.querySelectorAll(cfg.visual)
    );
    if (!links.length || !visuals.length) return null;

    if (links.length !== visuals.length) {
      wjtLog(
        "count mismatch — " +
          links.length +
          " links vs " +
          visuals.length +
          " visuals"
      );
    }

    const group = {
      scope: scope,
      cfg: cfg,
      links: links,
      visuals: visuals,
      index: -1,
    };
    const id = "wjt-" + ++WJT.uid;

    listEl.setAttribute("role", "tablist");

    links.forEach(function (link, n) {
      const visual = visuals[n];
      link.setAttribute("role", "tab");
      if (!link.id) link.id = id + "-tab-" + n;

      if (visual) {
        if (!visual.id) visual.id = id + "-panel-" + n;
        visual.setAttribute("role", "tabpanel");
        visual.setAttribute("aria-labelledby", link.id);
        link.setAttribute("aria-controls", visual.id);
      }

      link.addEventListener("click", function (e) {
        e.preventDefault();
        wjtSelect(group, n, { focus: false });
      });
    });

    listEl.addEventListener("keydown", function (e) {
      wjtKeydown(group, e);
    });

    // Honour whichever tab the Designer marked active; default to the first.
    let start = 0;
    links.forEach(function (link, n) {
      if (link.classList.contains(cfg.active)) start = n;
    });
    wjtSelect(group, start);

    return group;
  }

  function wjtInit(options) {
    const cfg = Object.assign({}, WJT_DEFAULTS, options || {});
    WJT.cfg = cfg;

    let count = 0;
    document.querySelectorAll(cfg.scope).forEach(function (scope) {
      if (scope.hasAttribute("data-wjt-ready")) return; // already wired
      const group = wjtBuild(scope, cfg);
      if (!group) return;
      scope.setAttribute("data-wjt-ready", "");
      WJT.groups.push(group);
      count++;
    });

    wjtLog("booted " + count + " group(s)");
    return WJT.groups;
  }

  /* Registered at module-definition time, not inside init — anything calling
   this before boot finishes still gets a function. */
  window.refreshWhyJoinTabs = function () {
    return wjtInit(WJT.cfg);
  };

  const WhyJoinTabs = function (options) {
    return {
      name: "WhyJoinTabs",
      init: function () {
        return wjtInit(options);
      },
    };
  };

  /* Safety net: if the boot list never calls WhyJoinTabs(), wire up anyway.
   Runs a tick after DOM ready so an explicit boot-list entry wins, and is a
   no-op once any group exists. */
  (function () {
    const net = function () {
      if (!WJT.groups.length) wjtInit(WJT.cfg);
    };
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", function () {
        setTimeout(net, 0);
      });
    } else {
      setTimeout(net, 0);
    }
  })();

  /* ╔═══════════════════════════════════════════════════════════════╗
       ║  PART 3 — BOOT                                                ║
       ║  Bump the version string when you ship something notable —    ║
       ║  it shows in the debug panel / window.BB on the live site.    ║
       ╚═══════════════════════════════════════════════════════════════╝ */

  boot("alphawerx v2.0.1", [
    // KeyboardIx3Toggle(), // Shift+G → Webflow IX3 events
    GoToTop(), // [data-function="go-to-top"]
    SmartSwiper(), // all [data-swiper] sliders
    // ClickOnLoad(), // [data-click-on-load]
    NavShrink(), // .is-shrunk on scroll — pass { selectors: "..." } if this site's nav classes differ
    GlowingBorders(), // cursor-proximity glow on [data-glowing-border]
    AutoTabs(), // auto-rotating tabs on [data-auto-tabs]
    DeployAccordion(), // click accordion + video swap on [data-scroll-phases]
    CountUp(), // scroll-triggered number count-up on [data-count-up]
    GsapMotion(), // grouped scroll reveal — [data-gsap-title] + [data-gsap-reveal]
    WhyJoinTabs(),
  ]);
})();

/* ============================================================
   Lenis smooth scrolling — moved here from the Webflow footer
   inline script (baked-in change #2). Same options, same
   [data-h-scroll] horizontal rail at ≤991px, same GSAP ticker
   bridge — now guarded so a missing library can never break
   the page (native scroll is the fallback).
   ============================================================ */
(function () {
  if (window.Webflow && window.Webflow.env && window.Webflow.env("editor")) return;
  if (typeof Lenis === "undefined") return; // CDN failed → native scroll, no errors

  var lenis = new Lenis({
    duration: 1.2,
    easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
    orientation: "vertical",
    gestureOrientation: "vertical",
    wheelMultiplier: 1,
    syncTouch: false,
    touchMultiplier: 2,
    infinite: false,
  });
  window.lenis = lenis;

  var hLenis = null;
  function initH() {
    if (hLenis) return;
    var wrap = document.querySelector("[data-h-scroll]");
    if (!wrap) return;
    hLenis = new Lenis({
      wrapper: wrap,
      content: wrap.querySelector("[data-h-scroll-track]") || wrap.firstElementChild,
      orientation: "horizontal",
      gestureOrientation: "horizontal",
      smoothWheel: true,
      syncTouch: false,
      overscroll: false,
      duration: 1.2,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
    });
  }
  function destroyH() { if (hLenis) { hLenis.destroy(); hLenis = null; } }
  var mq = window.matchMedia("(max-width: 991px)");
  function applyH(e) { if (e.matches) initH(); else destroyH(); }
  applyH(mq);
  if (mq.addEventListener) mq.addEventListener("change", applyH);

  if (window.gsap && window.ScrollTrigger) {
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (time) {
      lenis.raf(time * 1000);
      if (hLenis) hLenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
  } else {
    // plain rAF driver when GSAP isn't on the page
    (function raf(time) {
      lenis.raf(time);
      if (hLenis) hLenis.raf(time);
      requestAnimationFrame(raf);
    })(0);
  }
})();

/* ============================================================
   Hero video playback rate — moved here from the footer inline
   script (baked-in change #3), now null-guarded so pages without
   #heroVideo don't throw.
   ============================================================ */
(function () {
  var v = document.getElementById("heroVideo");
  if (v) v.playbackRate = 0.75;
})();
