(function () {
  "use strict";

  var CONFIG = {
    spacing: 4,
    size: 1.5,
    shape: "diamond",
    color: "#e7edf4",
    brightness: 100,
    variation: 100,
    curvature: 50,
    blinkCount: 40,
    blinkSpeed: 2,
    glowSize: 2,
    glowIntensity: 90,
    mixAccent: true,
    glowColor: "#8fbe7a",
    seed: 1337,
    padding: 0.05,
    hoverRadius: 240,
    hoverStrength: 11,
    hoverReturn: 100,
    pins: [
      { label: "Chicago Office", lat: 41.8781, lon: -87.6298 },
      { label: "Chandigarh Office", lat: 30.7333, lon: 76.7794 },
      { label: "Toronto HQ", lat: 43.6532, lon: -79.3832 },
    ],
    pinScale: 0.75,
  };

  var MASK =
    "data:image/png;base64,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";

  function initAwDotMap(root, cfg, maskSrc) {
    var TAU = Math.PI * 2;
    var canvas = document.createElement("canvas");
    canvas.style.display = "block";
    canvas.style.width = "100%";
    root.innerHTML = "";
    root.appendChild(canvas);
    var ctx = canvas.getContext("2d");
    var mask = null,
      integ = null,
      mw = 0,
      mh = 0;
    var dotsX = null,
      dotsY = null,
      dotA = null,
      offX = null,
      offY = null;
    var blinkers = [],
      layer = null,
      sprites = [];
    var raf = 0,
      inView = true,
      reduced = false,
      destroyed = false;
    var W = 0,
      H = 0,
      dpr = 1,
      seed = 1;
    var mouseX = -1e4,
      mouseY = -1e4,
      pointerIn = false,
      settled = true,
      lastT = 0;
    var LAT_TOP = 84,
      LAT_BOT = -56.5; // must match the latitude crop baked into the land mask
    var pinLayer = null,
      geom = null;
    try {
      reduced =
        window.matchMedia &&
        matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch (e) {}
    // Overlay setup lives below the state declarations: assigning before a `var ... = null`
    // line runs would get clobbered when that initializer executes.
    ensureStyles();
    try {
      if (getComputedStyle(root).position === "static")
        root.style.position = "relative";
    } catch (e) {}
    pinLayer = document.createElement("div");
    pinLayer.style.cssText =
      "position:absolute;left:0;top:0;right:0;bottom:0;pointer-events:none;";
    root.appendChild(pinLayer);

    function rnd() {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    }
    function hexRGB(h) {
      h = String(h || "").replace("#", "");
      if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
      var n = parseInt(h, 16) || 0;
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    }
    function mix(a, b, t) {
      return [
        Math.round(a[0] + (b[0] - a[0]) * t),
        Math.round(a[1] + (b[1] - a[1]) * t),
        Math.round(a[2] + (b[2] - a[2]) * t),
      ];
    }
    function css(c, a) {
      return "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + a + ")";
    }
    function shapePath(p, x, y, s, shape) {
      var h = s / 2;
      if (shape === "square") {
        p.rect(x - h, y - h, s, s);
      } else if (shape === "diamond") {
        h *= 1.28;
        p.moveTo(x, y - h);
        p.lineTo(x + h, y);
        p.lineTo(x, y + h);
        p.lineTo(x - h, y);
        p.closePath();
      } else {
        p.moveTo(x + h, y);
        p.arc(x, y, h, 0, TAU);
      }
    }
    function boxFrac(x0, y0, x1, y1) {
      x0 = Math.max(0, Math.min(mw, x0));
      x1 = Math.max(0, Math.min(mw, x1));
      y0 = Math.max(0, Math.min(mh, y0));
      y1 = Math.max(0, Math.min(mh, y1));
      if (x1 <= x0 || y1 <= y0) return 0;
      var s =
        integ[y1 * (mw + 1) + x1] -
        integ[y0 * (mw + 1) + x1] -
        integ[y1 * (mw + 1) + x0] +
        integ[y0 * (mw + 1) + x0];
      return s / ((x1 - x0) * (y1 - y0));
    }

    /* Draws every base dot, batched into 8 alpha buckets (8 fills total).
       Used once per rebuild for the cached static layer, and per frame while interacting. */
    function paintDots(g, withOffsets) {
      if (!dotsX) return;
      var col = hexRGB(cfg.color || "#e7edf4");
      var base = (+cfg.brightness || 80) / 100;
      var size = Math.max(0.5, +cfg.size || 2);
      var buckets = [],
        i;
      for (i = 0; i < 8; i++) buckets.push(new Path2D());
      var n = dotsX.length;
      for (i = 0; i < n; i++) {
        var x = dotsX[i],
          y = dotsY[i];
        if (withOffsets) {
          x += offX[i];
          y += offY[i];
        }
        shapePath(
          buckets[Math.min(7, Math.floor(dotA[i] * 8))],
          x,
          y,
          size,
          cfg.shape
        );
      }
      for (i = 0; i < 8; i++) {
        g.fillStyle = css(col, Math.min(1, base * ((i + 1) / 8)));
        g.fill(buckets[i]);
      }
    }

    function rebuild() {
      if (!mask || destroyed) return;
      seed = cfg.seed >>> 0 || 1;
      var rect = root.getBoundingClientRect();
      W = Math.max(300, rect.width || root.clientWidth || 800);
      H = (W * mh) / mw;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.height = H + "px";

      var pad = cfg.padding != null ? cfg.padding : 0.05;
      var ox = W * pad,
        oy = H * pad,
        gw = W - 2 * ox,
        gh = H - 2 * oy;
      var sp = Math.max(3, +cfg.spacing || 6);
      var cols = Math.floor(gw / sp),
        rows = Math.floor(gh / sp);
      var offGx = ox + (gw - cols * sp) / 2,
        offGy = oy + (gh - rows * sp) / 2;
      var k = ((+cfg.curvature || 0) / 100) * 0.4,
        comp = 1 / (1 - k * 0.5);
      var cx = W / 2,
        cy = H / 2,
        hx = gw / 2,
        hy = gh / 2;
      var spm = (sp / gw) * mw,
        halfM = spm / 2;
      var vari = (+cfg.variation || 0) / 100;
      geom = {
        ox: ox,
        oy: oy,
        gw: gw,
        gh: gh,
        cx: cx,
        cy: cy,
        hx: hx,
        hy: hy,
        k: k,
        comp: comp,
      };

      var px = [],
        py = [],
        pa = [];
      for (var r = 0; r <= rows; r++) {
        for (var c = 0; c <= cols; c++) {
          var gx = offGx + c * sp,
            gy = offGy + r * sp;
          var u = (gx - ox) / gw,
            v = (gy - oy) / gh;
          var mx = u * (mw - 1),
            my = v * (mh - 1);
          var frac = boxFrac(
            Math.floor(mx - halfM),
            Math.floor(my - halfM),
            Math.floor(mx + halfM) + 1,
            Math.floor(my + halfM) + 1
          );
          var ctr =
            mask[
              Math.min(mh - 1, Math.max(0, Math.round(my))) * mw +
                Math.min(mw - 1, Math.max(0, Math.round(mx)))
            ];
          if (frac < 0.35 && !ctr) continue;
          var nx = (gx - cx) / hx,
            ny = (gy - cy) / hy;
          var rr = nx * nx + ny * ny;
          var f = (1 - k * rr * 0.5) * comp;
          px.push(cx + nx * hx * f);
          py.push(cy + ny * hy * f);
          pa.push(1 - vari * rnd() * 0.9);
        }
      }
      dotsX = px;
      dotsY = py;
      dotA = pa;
      offX = new Float32Array(px.length);
      offY = new Float32Array(px.length);
      settled = true;

      // Static layer for idle frames.
      layer = document.createElement("canvas");
      layer.width = canvas.width;
      layer.height = canvas.height;
      var s2 = layer.getContext("2d");
      s2.scale(dpr, dpr);
      paintDots(s2, false);

      // Pre-rendered glow sprites (radial gradients built once, not per frame).
      sprites = [];
      var A = hexRGB("#6b9bea"),
        B = hexRGB("#8fbe7a");
      var gcol = hexRGB(cfg.glowColor || "#8fbe7a");
      var nS = cfg.mixAccent ? 5 : 1,
        i;
      var size = Math.max(0.5, +cfg.size || 2);
      var gs = Math.max(4, (+cfg.glowSize || 2) * size);
      for (i = 0; i < nS; i++) {
        var c2 = cfg.mixAccent ? mix(A, B, nS === 1 ? 1 : i / (nS - 1)) : gcol;
        var sc = document.createElement("canvas");
        var d2 = Math.max(8, Math.ceil(gs * 2 * dpr));
        sc.width = d2;
        sc.height = d2;
        var g2 = sc.getContext("2d");
        var grad = g2.createRadialGradient(
          d2 / 2,
          d2 / 2,
          0,
          d2 / 2,
          d2 / 2,
          d2 / 2
        );
        grad.addColorStop(0, css(mix(c2, [255, 255, 255], 0.55), 0.95));
        grad.addColorStop(0.22, css(c2, 0.55));
        grad.addColorStop(1, css(c2, 0));
        g2.fillStyle = grad;
        g2.fillRect(0, 0, d2, d2);
        sprites.push({ c: sc, core: mix(c2, [255, 255, 255], 0.78) });
      }

      // Blinking dots: random land dots, spread apart (spread relaxes as the count grows).
      blinkers = [];
      var want = Math.min(
        Math.max(0, Math.round(+cfg.blinkCount || 0)),
        px.length
      );
      var minD = W * 0.055 * Math.sqrt(14 / Math.max(14, want));
      var minD2 = minD * minD;
      for (i = 0; i < want; i++) {
        var idx = -1,
          t2;
        for (t2 = 0; t2 < 14; t2++) {
          var cand = Math.floor(rnd() * px.length),
            ok = true;
          for (var j = 0; j < blinkers.length; j++) {
            var bx = px[cand] - px[blinkers[j].idx],
              by = py[cand] - py[blinkers[j].idx];
            if (bx * bx + by * by < minD2) {
              ok = false;
              break;
            }
          }
          if (ok) {
            idx = cand;
            break;
          }
        }
        if (idx < 0) idx = Math.floor(rnd() * px.length);
        blinkers.push({
          idx: idx,
          phase: rnd() * TAU,
          period: (0.6 + rnd() * 0.9) * (+cfg.blinkSpeed || 2),
          s: Math.floor(rnd() * sprites.length),
        });
      }
      buildPins();
      draw(performance.now());
      ensureLoop();
    }

    /* Pin overlay: DOM elements over the canvas so backdrop-filter genuinely blurs the
       dots underneath, ripples run as cheap CSS transforms, and labels stay crisp text. */
    function ensureStyles() {
      if (document.getElementById("awdm-pin-css")) return;
      var st = document.createElement("style");
      st.id = "awdm-pin-css";
      st.textContent =
        ".awdm-pin{position:absolute;width:0;height:0;pointer-events:none;font-family:inherit}" +
        ".awdm-pin>*{position:absolute;left:0;top:0}" +
        ".awdm-glow{width:14em;height:14em;border-radius:50%;background:#4F8D4B;opacity:.22;filter:blur(2em);transform:translate(-50%,-50%)}" +
        ".awdm-ring{border-radius:50%;background:rgba(11,12,14,.2);transform:translate(-50%,-50%);-webkit-backdrop-filter:blur(2px);backdrop-filter:blur(2px)}" +
        ".awdm-ring.o{width:15em;height:15em;border:1px solid rgba(143,198,143,.18)}" +
        ".awdm-ring.i{width:9.2em;height:9.2em;border:1px solid rgba(143,198,143,.28)}" +
        ".awdm-ripple{width:15em;height:15em;border-radius:50%;border:1px solid rgba(143,198,143,.4);transform:translate(-50%,-50%) scale(.62);opacity:0;animation:awdm-rip 3.2s linear infinite}" +
        ".awdm-ripple.d{animation-delay:1.6s}" +
        "@keyframes awdm-rip{0%{transform:translate(-50%,-50%) scale(.62);opacity:0}12%{opacity:.55}100%{transform:translate(-50%,-50%) scale(1.32);opacity:0}}" +
        ".awdm-glyph{transform:translate(-50%,-53%)}" +
        ".awdm-label{transform:translate(-50%,0);top:1.7em;background:rgba(11,12,14,.4);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);border:1px solid rgba(255,255,255,.14);border-radius:999px;padding:.75em 1.5em;color:#fff;font-size:1.3em;font-weight:500;letter-spacing:.01em;white-space:nowrap;line-height:1.2}" +
        "@media (prefers-reduced-motion:reduce){.awdm-ripple{animation:none;opacity:0}}";
      document.head.appendChild(st);
    }
    var PIN_GLYPH =
      '<svg class="awdm-glyph" width="2.5em" height="3.4em" viewBox="97.5 92 25 34" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M110 92C117.2 92 122.5 97.3998 122.5 104.6C122.5 113.7 110 126 110 126C110 126 97.5 113.7 97.5 104.6C97.5002 97.3998 102.8 92 110 92ZM109.998 99.9004C107.458 99.9006 105.398 101.96 105.398 104.5C105.398 107.04 107.458 109.099 109.998 109.1C112.539 109.1 114.599 107.04 114.599 104.5C114.599 101.959 112.539 99.9004 109.998 99.9004Z" fill="url(#awdmPG)"/>' +
      '<defs><linearGradient id="awdmPG" x1="118.369" y1="134.846" x2="78.8812" y2="131.596" gradientUnits="userSpaceOnUse">' +
      '<stop stop-color="#4F8D4B"/><stop offset="1" stop-color="#8FC68F"/></linearGradient></defs></svg>';
    function buildPins() {
      if (!pinLayer) return;
      pinLayer.innerHTML = "";
      var pins = cfg.pins;
      if (!pins || !pins.length || !geom) return;
      // Pins shrink a little with the map so they don't swallow mobile layouts.
      var scale =
        (+cfg.pinScale > 0 ? +cfg.pinScale : 1) *
        Math.max(0.55, Math.min(1, W / 1100));
      for (var i = 0; i < pins.length; i++) {
        var p = pins[i] || {};
        if (typeof p.lat !== "number" || typeof p.lon !== "number") continue;
        var u = (p.lon + 180) / 360;
        var v = (LAT_TOP - p.lat) / (LAT_TOP - LAT_BOT);
        if (u < 0 || u > 1 || v < 0 || v > 1) continue;
        var gx = geom.ox + u * geom.gw,
          gy = geom.oy + v * geom.gh;
        var nx = (gx - geom.cx) / geom.hx,
          ny = (gy - geom.cy) / geom.hy;
        var f = (1 - geom.k * (nx * nx + ny * ny) * 0.5) * geom.comp;
        var el = document.createElement("div");
        el.className = "awdm-pin";
        el.style.left = geom.cx + nx * geom.hx * f + "px";
        el.style.top = geom.cy + ny * geom.hy * f + "px";
        el.style.fontSize = 10 * scale + "px";
        el.innerHTML =
          '<span class="awdm-glow"></span><span class="awdm-ripple"></span><span class="awdm-ripple d"></span>' +
          '<span class="awdm-ring o"></span><span class="awdm-ring i"></span>' +
          PIN_GLYPH +
          (p.label ? '<span class="awdm-label"></span>' : "");
        if (p.label)
          el.querySelector(".awdm-label").textContent = String(p.label);
        pinLayer.appendChild(el);
      }
    }

    /* Pointer repulsion: each dot springs toward a target offset pushed away from the
       cursor (quadratic falloff inside hoverRadius), fast attack / slower release. */
    function stepPhysics(dt) {
      if (!offX) return;
      var S = Math.max(0, +cfg.hoverStrength || 0);
      var R = Math.max(10, +cfg.hoverRadius || 100);
      var ret = +cfg.hoverReturn;
      if (!(ret >= 1)) ret = 40;
      var relK = 1 - Math.exp(-ret * 0.09 * dt);
      var attK = 1 - Math.exp(-ret * 0.234 * dt);
      var R2 = R * R,
        maxOff = 0,
        anyTarget = false;
      var n = dotsX.length;
      for (var i = 0; i < n; i++) {
        var tx = 0,
          ty = 0;
        if (pointerIn && S > 0) {
          var dx = dotsX[i] - mouseX,
            dy = dotsY[i] - mouseY;
          var d2 = dx * dx + dy * dy;
          if (d2 < R2) {
            var d = Math.sqrt(d2);
            if (d < 0.5) {
              dx = 0.5;
              dy = 0;
              d = 0.5;
            }
            var t = 1 - d / R;
            var push = S * t * t;
            tx = (dx / d) * push;
            ty = (dy / d) * push;
            anyTarget = true;
          }
        }
        var k2 =
          tx * tx + ty * ty > offX[i] * offX[i] + offY[i] * offY[i]
            ? attK
            : relK;
        offX[i] += (tx - offX[i]) * k2;
        offY[i] += (ty - offY[i]) * k2;
        var m = offX[i] * offX[i] + offY[i] * offY[i];
        if (m > maxOff) maxOff = m;
      }
      if (maxOff < 0.02 && !anyTarget) settled = true;
    }

    function draw(t) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      var dynamic = !settled && !!offX;
      if (dynamic) {
        ctx.save();
        ctx.scale(dpr, dpr);
        paintDots(ctx, true);
        ctx.restore();
      } else if (layer) {
        ctx.drawImage(layer, 0, 0);
      }
      if (!blinkers.length || !dotsX) return;
      ctx.save();
      ctx.scale(dpr, dpr);
      var size = Math.max(0.5, +cfg.size || 2);
      var gs = Math.max(4, (+cfg.glowSize || 2) * size);
      var inten = (+cfg.glowIntensity || 90) / 100;
      for (var i = 0; i < blinkers.length; i++) {
        var b = blinkers[i];
        var p = reduced
          ? 0.55
          : Math.sin((t / 1000 / b.period) * TAU + b.phase) * 0.5 + 0.5;
        var a = Math.pow(p, 1.6) * inten;
        if (a < 0.02) continue;
        var bx = dotsX[b.idx] + offX[b.idx],
          by = dotsY[b.idx] + offY[b.idx];
        var sp2 = sprites[b.s] || sprites[0];
        ctx.globalAlpha = a;
        ctx.drawImage(sp2.c, bx - gs, by - gs, gs * 2, gs * 2);
        ctx.globalAlpha = Math.min(1, a * 1.35);
        ctx.fillStyle = css(sp2.core, 1);
        var pth = new Path2D();
        shapePath(pth, bx, by, size * 1.2, cfg.shape);
        ctx.fill(pth);
      }
      ctx.globalAlpha = 1;
      ctx.restore();
    }

    function running() {
      return (
        !reduced &&
        inView &&
        !document.hidden &&
        !destroyed &&
        (blinkers.length > 0 || !settled)
      );
    }
    function tick(t) {
      raf = 0;
      if (destroyed) return;
      var dt = lastT ? Math.min(0.05, (t - lastT) / 1000) : 0.016;
      lastT = t;
      if (!settled) stepPhysics(dt);
      draw(t);
      if (running()) raf = requestAnimationFrame(tick);
      else lastT = 0;
    }
    function ensureLoop() {
      if (!raf && running()) raf = requestAnimationFrame(tick);
    }

    function toLocal(e) {
      var r = canvas.getBoundingClientRect();
      if (!r.width || !r.height) return;
      mouseX = (e.clientX - r.left) * (W / r.width);
      mouseY = (e.clientY - r.top) * (H / r.height);
    }
    function wake() {
      if (reduced || destroyed) return;
      if (!((+cfg.hoverStrength || 0) > 0)) return;
      settled = false;
      ensureLoop();
    }
    canvas.addEventListener(
      "pointermove",
      function (e) {
        toLocal(e);
        pointerIn = true;
        wake();
      },
      { passive: true }
    );
    canvas.addEventListener(
      "pointerdown",
      function (e) {
        toLocal(e);
        pointerIn = true;
        wake();
      },
      { passive: true }
    );
    canvas.addEventListener(
      "pointerleave",
      function () {
        pointerIn = false;
        wake();
      },
      { passive: true }
    );
    canvas.addEventListener(
      "pointercancel",
      function () {
        pointerIn = false;
        wake();
      },
      { passive: true }
    );
    canvas.addEventListener(
      "pointerup",
      function (e) {
        if (e.pointerType !== "mouse") {
          pointerIn = false;
          wake();
        }
      },
      { passive: true }
    );

    document.addEventListener("visibilitychange", ensureLoop);
    var io = null;
    if ("IntersectionObserver" in window) {
      io = new IntersectionObserver(
        function (en) {
          inView = !!(en[0] && en[0].isIntersecting);
          ensureLoop();
        },
        { rootMargin: "120px" }
      );
      io.observe(root);
    }
    var rto = 0;
    function onResize() {
      clearTimeout(rto);
      rto = setTimeout(function () {
        var w = root.getBoundingClientRect().width;
        if (Math.abs(w - W) > 1) rebuild();
      }, 140);
    }
    var ro = null;
    if ("ResizeObserver" in window) {
      ro = new ResizeObserver(onResize);
      ro.observe(root);
    } else window.addEventListener("resize", onResize);

    var img = new Image();
    if (!/^data:/.test(maskSrc)) img.crossOrigin = "anonymous";
    img.onload = function () {
      try {
        var c = document.createElement("canvas");
        c.width = img.naturalWidth;
        c.height = img.naturalHeight;
        var x = c.getContext("2d", { willReadFrequently: true });
        x.drawImage(img, 0, 0);
        var d = x.getImageData(0, 0, c.width, c.height).data;
        mw = c.width;
        mh = c.height;
        mask = new Uint8Array(mw * mh);
        var i;
        for (i = 0; i < mw * mh; i++) mask[i] = d[i * 4] > 127 ? 1 : 0;
        integ = new Uint32Array((mw + 1) * (mh + 1));
        for (var y = 1; y <= mh; y++) {
          var rowSum = 0;
          for (var x2 = 1; x2 <= mw; x2++) {
            rowSum += mask[(y - 1) * mw + (x2 - 1)];
            integ[y * (mw + 1) + x2] = integ[(y - 1) * (mw + 1) + x2] + rowSum;
          }
        }
      } catch (e) {
        if (window.console)
          console.warn("[aw-dotmap] could not read mask pixels (CORS?)", e);
        return;
      }
      rebuild();
    };
    img.onerror = function () {
      if (window.console)
        console.warn("[aw-dotmap] mask image failed to load: " + maskSrc);
    };
    img.src = maskSrc;

    return {
      update: function (next) {
        if (next) cfg = next;
        if (mask) rebuild();
      },
      destroy: function () {
        destroyed = true;
        if (raf) cancelAnimationFrame(raf);
        if (ro) ro.disconnect();
        if (io) io.disconnect();
        document.removeEventListener("visibilitychange", ensureLoop);
        window.removeEventListener("resize", onResize);
        root.innerHTML = "";
      },
      count: function () {
        return dotsX ? dotsX.length : 0;
      },
      shining: function () {
        return blinkers.length;
      },
    };
  }

  function boot() {
    var els = document.querySelectorAll("[data-aw-dotmap]");
    for (var i = 0; i < els.length; i++) {
      var cfg = CONFIG;
      var raw = els[i].getAttribute("data-aw-config");
      if (raw) {
        try {
          var o = JSON.parse(raw),
            k;
          cfg = {};
          for (k in CONFIG) cfg[k] = CONFIG[k];
          for (k in o) cfg[k] = o[k];
        } catch (e) {
          cfg = CONFIG;
          if (window.console)
            console.warn("[aw-dotmap] invalid data-aw-config JSON", e);
        }
      }
      els[i].__awDotMap = initAwDotMap(els[i], cfg, MASK);
    }
  }
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", boot);
  else boot();
  window.AWDotMap = { init: initAwDotMap, config: CONFIG };
})();
