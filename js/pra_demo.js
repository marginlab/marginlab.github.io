/* PRA interactive demo. Static: reads demo.json written by make_demo_data.py, no server and no model at view time.
   Mount: <div id="pra-demo" data-src="assets/demo.json" data-base="assets/"></div> + pra_demo.css */
(function () {
  "use strict";
  var LV = ["#440154", "#21918c", "#fde725"], LV_TXT = ["#fff", "#fff", "#1f2328"];   // levels 1, 3, 5 (viridis, as in the paper)
  var CLS = { novice: 0, intermediate: 1, proficient: 2, expert: 2 };
  var ORANGE = "#e0670f", MAROON = "#8C1D40";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function el(tag, attrs, html) {
    var e = document.createElement(tag);
    for (var k in attrs || {}) e.setAttribute(k, attrs[k]);
    if (html !== undefined) e.innerHTML = html;
    return e;
  }
  function svg(tag, attrs) {
    var e = document.createElementNS("http://www.w3.org/2000/svg", tag);
    for (var k in attrs || {}) e.setAttribute(k, attrs[k]);
    return e;
  }
  function fmt(x, d) { return Number(x).toFixed(d === undefined ? 2 : d); }
  function each(list, fn) { Array.prototype.forEach.call(list, fn); }
  function tween(dur, fn, done) {
    if (reduce) { fn(1); if (done) done(); return; }
    var t0 = performance.now();
    (function step(now) {
      var t = Math.min(1, (now - t0) / dur);
      fn(1 - Math.pow(1 - t, 3));
      if (t < 1) requestAnimationFrame(step); else if (done) done();
    })(t0);
  }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function counter(node, from, to, d) { tween(600, function (t) { node.textContent = fmt(lerp(from, to, t), d); }); }
  function filmstrip(frames, base, onPick) {
    var strip = el("div", { "class": "prad-strip", role: "group", "aria-label": "Clips" });
    frames.forEach(function (f, i) {
      var b = el("button", { type: "button", "aria-label": "Clip " + (i + 1) }, '<img src="' + base + f + '" alt=""><span>' + (i + 1) + "</span>");
      b.onclick = function () { onPick(i); };
      strip.appendChild(b);
    });
    return strip;
  }
  function markStrip(strip, i) { each(strip.children, function (b, k) { b.classList.toggle("on", k === i); }); }

  /* ================================================================ A: score a video with a written rubric */
  function sectionA(pane, A, base) {
    var st = { v: A.videos.length - 1, wording: "original", item: 2, clip: 4 };
    var picker = el("div", { "class": "prad-cards" });
    pane.appendChild(picker);
    var grid = el("div", { "class": "prad-grid-a" });
    pane.appendChild(grid);

    // ---- video
    var colV = el("div", { "class": "prad-col" });
    var stage = el("div", { "class": "prad-stage" });
    var imgA = el("img", { alt: "Video frame" }), imgB = el("img", { alt: "", "aria-hidden": "true" });
    var badge = el("div", { "class": "prad-badge" });
    stage.appendChild(imgA); stage.appendChild(imgB); stage.appendChild(badge);
    var strip = null, stripBox = el("div");
    var gauge = el("div", { "class": "prad-grs" });
    colV.appendChild(stage); colV.appendChild(stripBox); colV.appendChild(gauge);
    colV.appendChild(el("div", { "class": "prad-credit" }, "Frames: AIxSuture test set (Peters et al.; Hoffmann et al.), CC BY-NC-ND 4.0."));

    // ---- rubric items
    var colI = el("div", { "class": "prad-col" });
    var toggle = el("div", { "class": "prad-seg", role: "group", "aria-label": "Rubric wording" });
    [["original", "Original OSATS wording"], ["reworded", "Reworded rubric"]].forEach(function (o) {
      var b = el("button", { type: "button", "data-w": o[0] }, o[1]);
      b.onclick = function () { if (st.wording !== o[0]) { st.wording = o[0]; render(); } };
      toggle.appendChild(b);
    });
    var hint = el("div", { "class": "prad-hint" });
    var items = el("div", { "class": "prad-items" });
    colI.appendChild(toggle); colI.appendChild(hint); colI.appendChild(items);
    colI.appendChild(el("div", { "class": "prad-legend" },
      '<span><i class="prad-dot"></i>PRA-cond</span><span><i class="prad-dia"></i>raters&#39; mean</span>' +
      '<span><i class="prad-tick"></i>one rater</span>'));

    // ---- how the score is read
    var colG = el("div", { "class": "prad-col prad-card-geo" });
    var gHead = el("div", { "class": "prad-geo-head" },
      '<div class="prad-eyebrow">How the score is read</div><div class="prad-geo-name"></div>' +
      '<div class="prad-geo-scores"><div><span>PRA-cond</span><b class="prad-big">0.00</b></div>' +
      '<div><span>raters</span><b class="prad-big prad-big-r">0.00</b></div></div>');
    var S = svg("svg", { viewBox: "0 0 320 230", role: "img", "aria-label": "Prediction, path through the level descriptions and the score read on it" });
    var defs = svg("defs");
    var g1 = svg("linearGradient", { id: "prad-g1", gradientUnits: "userSpaceOnUse" }), g2 = svg("linearGradient", { id: "prad-g2", gradientUnits: "userSpaceOnUse" });
    [[g1, 0, 1], [g2, 1, 2]].forEach(function (g) {
      g[0].appendChild(svg("stop", { offset: "0", "stop-color": LV[g[1]] }));
      g[0].appendChild(svg("stop", { offset: "1", "stop-color": LV[g[2]] }));
      defs.appendChild(g[0]);
    });
    var glow = svg("radialGradient", { id: "prad-glow" });
    glow.appendChild(svg("stop", { offset: "0", "stop-color": ORANGE, "stop-opacity": "0.45" }));
    glow.appendChild(svg("stop", { offset: "1", "stop-color": ORANGE, "stop-opacity": "0" }));
    defs.appendChild(glow);
    S.appendChild(defs);
    var tri = svg("polygon", { fill: MAROON, "fill-opacity": "0.05", stroke: MAROON, "stroke-opacity": "0.12", "stroke-dasharray": "3 4" });
    var seg1 = svg("line", { stroke: "url(#prad-g1)", "stroke-width": "8", "stroke-linecap": "round" });
    var seg2 = svg("line", { stroke: "url(#prad-g2)", "stroke-width": "8", "stroke-linecap": "round" });
    var proj = svg("line", { stroke: "#1f2328", "stroke-width": "1.8", "stroke-dasharray": "3 3" });
    var star = svg("polygon", { fill: "#f2a20c", stroke: "#7a4a00", "stroke-width": "1" });
    var halo = svg("circle", { r: "20", fill: "url(#prad-glow)", "class": "prad-pulse" });
    var pred = svg("circle", { r: "7", fill: ORANGE, stroke: "#fff", "stroke-width": "2" });
    var ring = svg("circle", { r: "7", fill: "none", stroke: "#1f2328", "stroke-width": "2.5" });
    [tri, seg1, seg2, proj, star].forEach(function (n) { S.appendChild(n); });
    var lvNodes = [0, 1, 2].map(function (i) {
      var c = svg("circle", { r: "13", fill: LV[i], stroke: "#fff", "stroke-width": "2.5" });
      var t = svg("text", { "text-anchor": "middle", "font-size": "13", "font-weight": "700", fill: LV_TXT[i] });
      t.textContent = [1, 3, 5][i];
      S.appendChild(c); S.appendChild(t);
      return [c, t];
    });
    S.appendChild(halo); S.appendChild(pred); S.appendChild(ring);
    var key = el("div", { "class": "prad-key" },
      '<span><i class="prad-dot prad-dot-o"></i>prediction</span><span><i class="prad-ring"></i>score on the path</span>' +
      '<span><i class="prad-star">&#9733;</i>raters&#39; target</span>');
    var ruler = el("div", { "class": "prad-ruler" });
    var levels = el("div", { "class": "prad-levels" });
    colG.appendChild(gHead); colG.appendChild(S); colG.appendChild(key); colG.appendChild(ruler); colG.appendChild(levels);
    grid.appendChild(colV); grid.appendChild(colI); grid.appendChild(colG);

    A.videos.forEach(function (v, i) {
      var c = el("button", { type: "button", "class": "prad-card" },
        '<img src="' + base + v.frames[4] + '" alt=""><span><i class="prad-cls prad-cls-' + CLS[v.label] + '">' + v.label +
        "</i>GRS " + fmt(v.grs, 1) + "</span>");
      c.onclick = function () { if (st.v !== i) { st.v = i; st.clip = 4; render(true); } };
      picker.appendChild(c);
    });

    var shown = { img: imgA }, geo = null, big = gHead.querySelector(".prad-big"), bigR = gHead.querySelector(".prad-big-r");
    function showFrame(src) {
      var next = shown.img === imgA ? imgB : imgA;
      next.onload = function () { next.classList.add("on"); shown.img.classList.remove("on"); shown.img = next; };
      next.src = src;
    }
    function px(it) {   // data -> svg coordinates for one item
      var pts = it.levels.concat([it.pred, it.read, it.target]);
      var xs = pts.map(function (p) { return p[0]; }), ys = pts.map(function (p) { return p[1]; });
      var x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs), y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys);
      var sc = Math.min(270 / (x1 - x0 + 1e-6), 170 / (y1 - y0 + 1e-6)), cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
      var P = function (p) { return [160 + (p[0] - cx) * sc, 118 - (p[1] - cy) * sc]; };
      return { L: it.levels.map(P), pred: P(it.pred), read: P(it.read), target: P(it.target) };
    }
    function starPts(c, r) {
      var p = [];
      for (var i = 0; i < 10; i++) {
        var a = Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r;
        p.push((c[0] + rr * Math.cos(a)).toFixed(1) + "," + (c[1] - rr * Math.sin(a)).toFixed(1));
      }
      return p.join(" ");
    }
    function drawGeo(g) {
      var L = g.L;
      tri.setAttribute("points", L.map(function (p) { return p.join(","); }).join(" "));
      [[seg1, g1, 0, 1], [seg2, g2, 1, 2]].forEach(function (s) {
        var a = L[s[2]], b = L[s[3]];
        s[0].setAttribute("x1", a[0]); s[0].setAttribute("y1", a[1]); s[0].setAttribute("x2", b[0]); s[0].setAttribute("y2", b[1]);
        s[1].setAttribute("x1", a[0]); s[1].setAttribute("y1", a[1]); s[1].setAttribute("x2", b[0]); s[1].setAttribute("y2", b[1]);
      });
      lvNodes.forEach(function (n, i) {
        n[0].setAttribute("cx", L[i][0]); n[0].setAttribute("cy", L[i][1]);
        n[1].setAttribute("x", L[i][0]); n[1].setAttribute("y", L[i][1] + 4.5);
      });
      proj.setAttribute("x1", g.pred[0]); proj.setAttribute("y1", g.pred[1]); proj.setAttribute("x2", g.read[0]); proj.setAttribute("y2", g.read[1]);
      star.setAttribute("points", starPts(g.target, 11));
      [halo, pred].forEach(function (n) { n.setAttribute("cx", g.pred[0]); n.setAttribute("cy", g.pred[1]); });
      ring.setAttribute("cx", g.read[0]); ring.setAttribute("cy", g.read[1]);
    }
    function mix(a, b, t) {
      var m = function (p, q) { return [lerp(p[0], q[0], t), lerp(p[1], q[1], t)]; };
      return { L: a.L.map(function (p, i) { return m(p, b.L[i]); }), pred: m(a.pred, b.pred), read: m(a.read, b.read), target: m(a.target, b.target) };
    }
    var prevScore = 0, prevRater = 0;
    function render(newVideo) {
      var v = A.videos[st.v], w = v.wordings[st.wording], rub = A.rubrics[st.wording], it = w.items[st.item];
      each(picker.children, function (c, i) { c.classList.toggle("on", i === st.v); });
      each(toggle.children, function (b) { b.classList.toggle("on", b.getAttribute("data-w") === st.wording); });
      if (newVideo || !strip) {
        stripBox.innerHTML = "";
        strip = filmstrip(v.frames, base, function (i) { st.clip = i; showFrame(base + v.frames[i]); markStrip(strip, i); });
        stripBox.appendChild(strip);
        showFrame(base + v.frames[st.clip]);
      }
      markStrip(strip, st.clip);
      badge.innerHTML = '<i class="prad-cls prad-cls-' + CLS[v.label] + '">' + v.label + "</i> raters&#39; GRS " + fmt(v.grs, 1);
      var other = v.wordings[st.wording === "original" ? "reworded" : "original"];
      gauge.innerHTML =
        '<div class="prad-grs-row"><span>Global rating score (sum of 8 items)</span></div>' +
        '<div class="prad-grs-nums"><div><b>' + fmt(v.grs, 1) + '</b><em>raters</em></div><div class="pra"><b>' + fmt(w.grs, 1) +
        '</b><em>PRA-cond, ' + (st.wording === "original" ? "original" : "reworded") + '</em></div><div class="alt"><b>' + fmt(other.grs, 1) +
        "</b><em>" + (st.wording === "original" ? "reworded" : "original") + " wording</em></div></div>";
      hint.innerHTML = st.wording === "original"
        ? "The 8 OSATS items as the AIxSuture raters used them. Click an item."
        : "Same items, <b>new names and paraphrased descriptions</b>, never seen in training. Click an item.";
      items.innerHTML = "";
      w.items.forEach(function (x, i) {
        var raters = v.ratings.map(function (r) { return r[i]; });
        var X = function (y) { return ((y - 1) / 4 * 100).toFixed(1) + "%"; };
        var bar = '<div class="prad-bar"><div class="prad-track"></div>';
        raters.forEach(function (r) { bar += '<i class="prad-tick" style="left:' + X(r) + '"></i>'; });
        bar += '<i class="prad-dia" style="left:' + X(v.item_mean[i]) + '"></i><i class="prad-dot" style="left:' + X(x.score) + '"></i></div>';
        var row = el("button", { type: "button", "class": "prad-row" + (i === st.item ? " on" : "") },
          '<span class="prad-name">' + rub[i].name + '</span><span class="prad-val">' + fmt(x.score, 1) + "</span>" + bar);
        row.onclick = function () { if (st.item !== i) { st.item = i; render(); } };
        items.appendChild(row);
      });
      // geometry, animated from the previous state
      var target = px(it), from = geo || target;
      tween(650, function (t) { geo = mix(from, target, t); drawGeo(geo); });
      gHead.querySelector(".prad-geo-name").textContent = rub[st.item].name;
      counter(big, prevScore, it.score); counter(bigR, prevRater, v.item_mean[st.item]);
      prevScore = it.score; prevRater = v.item_mean[st.item];
      var Xr = function (y) { return ((y - 1) / 4 * 100).toFixed(1) + "%"; };
      ruler.innerHTML = '<div class="prad-ruler-track"></div>' +
        [1, 2, 3, 4, 5].map(function (k) { return '<span class="prad-rk" style="left:' + Xr(k) + '">' + k + "</span>"; }).join("") +
        '<i class="prad-dia" style="left:' + Xr(v.item_mean[st.item]) + '"></i><i class="prad-dot prad-dot-o" style="left:' + Xr(it.score) + '"></i>';
      var near = it.score < 2 ? 0 : (it.score < 4 ? 1 : 2);
      levels.innerHTML = rub[st.item].levels.map(function (d, i) {
        return '<div class="prad-lv' + (i === near ? " on" : "") + '"><b style="background:' + LV[i] + ";color:" + LV_TXT[i] + '">' + [1, 3, 5][i] +
          "</b><span>&ldquo;" + d + "&rdquo;</span></div>";
      }).join("");
    }
    render(true);
  }

  /* ================================================================ B: zero-shot Grad-CAM, compare slider */
  function jet(t) {
    var c = function (x) { return Math.min(Math.max(1.5 - Math.abs(x), 0), 1) * 255; };
    return [c(4 * t - 3), c(4 * t - 2), c(4 * t - 1)];
  }
  function decode(b64) {
    var s = atob(b64), a = new Float32Array(s.length);
    for (var i = 0; i < s.length; i++) a[i] = s.charCodeAt(i) / 255;
    return a;
  }
  function overlay(image, cam, h, w, W, H) {
    var cv = document.createElement("canvas");
    cv.width = W; cv.height = H;
    var ctx = cv.getContext("2d");
    ctx.drawImage(image, 0, 0, W, H);
    var up = new Float32Array(W * H);
    for (var y = 0; y < H; y++) {                      // bilinear, align_corners = False (as in the paper code)
      var sy = Math.min(Math.max((y + 0.5) * h / H - 0.5, 0), h - 1), y0 = Math.floor(sy), y1 = Math.min(y0 + 1, h - 1), fy = sy - y0;
      for (var x = 0; x < W; x++) {
        var sx = Math.min(Math.max((x + 0.5) * w / W - 0.5, 0), w - 1), x0 = Math.floor(sx), x1 = Math.min(x0 + 1, w - 1), fx = sx - x0;
        up[y * W + x] = (cam[y0 * w + x0] * (1 - fx) + cam[y0 * w + x1] * fx) * (1 - fy) + (cam[y1 * w + x0] * (1 - fx) + cam[y1 * w + x1] * fx) * fy;
      }
    }
    var sorted = Float32Array.from(up).sort(), thr = sorted[Math.floor(0.75 * sorted.length)], lo = sorted[0], hi = sorted[sorted.length - 1];
    var data = ctx.getImageData(0, 0, W, H), d = data.data;
    for (var i = 0; i < up.length; i++) {
      if (up[i] < thr) { d[4 * i] *= 0.82; d[4 * i + 1] *= 0.82; d[4 * i + 2] *= 0.82; continue; }   // dim the rest slightly
      var c = jet((up[i] - lo) / (hi - lo + 1e-8));
      d[4 * i] = 0.42 * d[4 * i] + 0.58 * c[0]; d[4 * i + 1] = 0.42 * d[4 * i + 1] + 0.58 * c[1]; d[4 * i + 2] = 0.42 * d[4 * i + 2] + 0.58 * c[2];
    }
    ctx.putImageData(data, 0, 0);
    return cv;
  }

  function sectionB(pane, B, base, onShow) {
    var st = { t: 0, clip: 4, split: 0.5, timer: null, swept: false };
    var picker = el("div", { "class": "prad-cards" });
    pane.appendChild(picker);
    var grid = el("div", { "class": "prad-grid-b" });
    pane.appendChild(grid);
    var left = el("div", { "class": "prad-col" });
    var cmp = el("div", { "class": "prad-compare" });
    var W = 640, H = 480;
    var cv = el("canvas", { width: W, height: H, "aria-hidden": "true" });
    var line = el("div", { "class": "prad-divider" }, '<span class="prad-handle">&#8249;&#8250;</span>');
    var labL = el("div", { "class": "prad-tag prad-tag-l" }, "Sigmoid matching");
    var labR = el("div", { "class": "prad-tag prad-tag-r" }, "PRA-cond (ours)");
    var range = el("input", { type: "range", min: 0, max: 1000, value: 500, "class": "prad-range", "aria-label": "Compare sigmoid matching (left) and PRA-cond (right)" });
    cmp.appendChild(cv); cmp.appendChild(line); cmp.appendChild(labL); cmp.appendChild(labR); cmp.appendChild(range);
    var stripBox = el("div"), ctrl = el("div", { "class": "prad-ctrl" });
    var play = el("button", { type: "button", "class": "prad-play" }, "&#9654; Play clips");
    var lab = el("span", { "class": "prad-small" });
    ctrl.appendChild(play); ctrl.appendChild(lab);
    left.appendChild(cmp); left.appendChild(stripBox); left.appendChild(ctrl);
    left.appendChild(el("div", { "class": "prad-credit" }, "Frames: JIGSAWS (Gao et al., 2014). Grad-CAM averaged over the six items; one training seed."));

    var right = el("div", { "class": "prad-col prad-card-geo" });
    right.innerHTML =
      '<div class="prad-eyebrow">Zero-shot on JIGSAWS</div><div class="prad-trial"></div>' +
      '<p class="prad-copy">Both models were trained on <b>two</b> AIxSuture items only. JIGSAWS&#39; six rubric items are new: ' +
      "they arrive as text. Drag the slider to compare where each score comes from.</p>" +
      '<div class="prad-eyebrow">Overlap with instruments &amp; suture (IoU)</div><div class="prad-iou"></div>' +
      '<p class="prad-copy prad-small">Hottest 10% of the Grad-CAM map vs. instrument and suture masks, averaged over the 8 clips. ' +
      "The dashed line is a random 10% of the pixels.</p>" +
      '<div class="prad-why"><b>Why?</b> A skill description is a few high-level words; the video is dense. Matching pushes the ' +
      "video feature toward the sparse text, while PRA only makes the text <i>predictable</i> from the video, keeping its dense features.</div>";
    grid.appendChild(left); grid.appendChild(right);

    B.trials.forEach(function (t, i) {
      var c = el("button", { type: "button", "class": "prad-card" },
        '<img src="' + base + t.frames[4] + '" alt=""><span><i class="prad-cls prad-cls-' + CLS[t.skill] + '">' + t.skill + "</i>" + t.task + "</span>");
      c.onclick = function () { if (st.t !== i) { st.t = i; st.clip = 4; build(); } };
      picker.appendChild(c);
    });

    var imgs = [], ovs = {}, strip = null;
    function composite() {
      var ctx = cv.getContext("2d"), o = ovs[st.clip];
      if (!o) return;
      var x = Math.round(st.split * W);
      ctx.drawImage(o.bce, 0, 0, x, H, 0, 0, x, H);
      ctx.drawImage(o.pra, x, 0, W - x, H, x, 0, W - x, H);
      line.style.left = (st.split * 100) + "%";
      labL.style.opacity = st.split < 0.18 ? 0 : 1;
      labR.style.opacity = st.split > 0.82 ? 0 : 1;
    }
    function ensure(i, cb) {
      var t = B.trials[st.t];
      if (ovs[i]) return cb();
      var im = imgs[i];
      var go = function () {
        ovs[i] = { bce: overlay(im, decode(t.cams.bce[i]), t.shape[0], t.shape[1], W, H),
                   pra: overlay(im, decode(t.cams.pra[i]), t.shape[0], t.shape[1], W, H) };
        cb();
      };
      if (im.complete && im.naturalWidth) go(); else im.addEventListener("load", go, { once: true });
    }
    function show(i) {
      st.clip = i;
      markStrip(strip, i);
      lab.textContent = "Clip " + (i + 1) + " of 8";
      ensure(i, composite);
    }
    function build() {
      var t = B.trials[st.t];
      each(picker.children, function (c, i) { c.classList.toggle("on", i === st.t); });
      ovs = {};
      imgs = t.frames.map(function (f) { var im = new Image(); im.src = base + f; return im; });
      stripBox.innerHTML = "";
      strip = filmstrip(t.frames, base, function (i) { show(i); });
      stripBox.appendChild(strip);
      right.querySelector(".prad-trial").innerHTML = "<b>" + t.task + "</b> &middot; " + t.skill + " &middot; GRS " + fmt(t.grs, 0);
      var maxI = 0.35, chance = 0.06;
      var bar = function (name, v, cls) {
        return '<div class="prad-iou-row ' + cls + '"><span>' + name + '</span><div class="prad-iou-track"><i style="width:0%" data-w="' +
          (Math.min(v, maxI) / maxI * 100).toFixed(1) + '%"></i><em style="left:' + (chance / maxI * 100).toFixed(1) + '%"></em></div><b>' + fmt(v, 3) + "</b></div>";
      };
      var box = right.querySelector(".prad-iou");
      box.innerHTML = bar("Sigmoid matching", t.iou.bce, "") + bar("PRA-cond (ours)", t.iou.pra, "ours");
      requestAnimationFrame(function () { each(box.querySelectorAll("i[data-w]"), function (i) { i.style.width = i.getAttribute("data-w"); }); });
      show(st.clip);
    }
    range.oninput = function () { st.split = range.value / 1000; composite(); };
    play.onclick = function () {
      if (st.timer) { clearInterval(st.timer); st.timer = null; play.innerHTML = "&#9654; Play clips"; return; }
      play.innerHTML = "&#10073;&#10073; Pause";
      st.timer = setInterval(function () { show((st.clip + 1) % 8); }, 900);
    };
    build();
    onShow(function () {        // a short sweep of the divider the first time the tab is opened
      if (st.swept || reduce) return;
      st.swept = true;
      var keys = [0.5, 0.86, 0.14, 0.5], seg = 0;
      (function next() {
        if (seg >= keys.length - 1) return;
        var a = keys[seg], b = keys[seg + 1];
        tween(900, function (t) { st.split = lerp(a, b, t); range.value = st.split * 1000; composite(); }, function () { seg++; next(); });
      })();
    });
  }

  /* ================================================================ shell */
  function mount(root) {
    var src = root.getAttribute("data-src"), base = root.getAttribute("data-base") || "";
    root.innerHTML = '<p class="prad-small">Loading the demo&hellip;</p>';
    fetch(src).then(function (r) { return r.json(); }).then(function (d) {
      root.innerHTML = "";
      var hero = el("div", { "class": "prad-hero" },
        '<div class="prad-hero-in"><div class="prad-eyebrow prad-eyebrow-h">Interactive demo &middot; precomputed model outputs</div>' +
        "<h3>Watch PRA read a surgical skill rubric</h3>" +
        "<p>PRA does not pick a level by probability. It predicts a point among the rubric&#39;s own level descriptions and " +
        "reads the score on the path between them &mdash; so a rubric can be given, or rewritten, as plain text.</p></div>");
      var tabs = el("div", { "class": "prad-tabs", role: "tablist" });
      hero.appendChild(tabs);
      root.appendChild(hero);
      var panes = [], showHooks = [];
      [["A", "Score with a written rubric", "AIxSuture &middot; 8 OSATS items"],
       ["B", "Where it looks on new items", "JIGSAWS &middot; zero-shot Grad-CAM"]].forEach(function (t, i) {
        var b = el("button", { type: "button", role: "tab", "class": "prad-tab" },
          '<span class="prad-tab-k">' + t[0] + "</span><span><b>" + t[1] + "</b><em>" + t[2] + "</em></span>");
        b.onclick = function () { select(i); };
        tabs.appendChild(b);
        var p = el("div", { "class": "prad-pane", role: "tabpanel" });
        root.appendChild(p);
        panes.push(p);
      });
      function select(i) {
        each(tabs.children, function (b, k) { b.classList.toggle("on", k === i); b.setAttribute("aria-selected", k === i); });
        panes.forEach(function (p, k) { p.classList.toggle("on", k === i); });
        if (showHooks[i]) showHooks[i]();
      }
      if (d.aixsuture) sectionA(panes[0], d.aixsuture, base);
      if (d.jigsaws) sectionB(panes[1], d.jigsaws, base, function (fn) { showHooks[1] = fn; });
      root.appendChild(el("p", { "class": "prad-small prad-note" },
        "Research demo: outputs of the trained models, precomputed for selected examples. Not a clinical tool."));
      select(0);
    }).catch(function (e) { root.innerHTML = '<p class="prad-small">The demo data could not be loaded.</p>'; console.error(e); });
  }
  document.addEventListener("DOMContentLoaded", function () {
    var root = document.getElementById("pra-demo");
    if (root) mount(root);
  });
})();
