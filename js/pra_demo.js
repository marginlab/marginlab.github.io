/* PRA interactive demo. Static: reads demo.json written by make_demo_data.py, no server and no model at view time.
   Mount: <div id="pra-demo" data-src="assets/demo.json" data-base="assets/"></div> + pra_demo.css */
(function () {
  "use strict";
  var LV = ["#440154", "#21918c", "#fde725"], LV_TXT = ["#fff", "#fff", "#1f2328"];   // levels 1, 3, 5 (as in the paper)
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
  function lerp(a, b, t) { return a + (b - a) * t; }
  function tween(dur, fn) {
    if (reduce) return fn(1);
    var t0 = performance.now();
    (function step(now) {
      var t = Math.min(1, (now - t0) / dur);
      fn(1 - Math.pow(1 - t, 3));
      if (t < 1) requestAnimationFrame(step);
    })(t0);
  }
  function thumbs(list, onPick) {   // list: [{src, tag, cls}]
    var box = el("div", { "class": "prad-thumbs" });
    list.forEach(function (x, i) {
      var b = el("button", { type: "button", "aria-label": x.tag },
        '<img src="' + x.src + '" alt=""><i class="prad-cls prad-cls-' + x.cls + '">' + x.tag + "</i>");
      b.onclick = function () { onPick(i); };
      box.appendChild(b);
    });
    return box;
  }
  function mark(box, i) { each(box.children, function (b, k) { b.classList.toggle("on", k === i); }); }
  function strip(frames, base, onPick) {
    var s = el("div", { "class": "prad-strip" });
    frames.forEach(function (f, i) {
      var b = el("button", { type: "button", "aria-label": "Clip " + (i + 1) }, '<img src="' + base + f + '" alt="">');
      b.onclick = function () { onPick(i); };
      s.appendChild(b);
    });
    return s;
  }

  /* ================================================================ 1: score a video from a written rubric */
  function sectionA(pane, A, base) {
    var st = { v: A.videos.length - 1, wording: "original", item: 2, clip: 4 };
    pane.appendChild(el("p", { "class": "prad-msg" },
      "PRA reads each rubric item as text and places the video <b>between its level descriptions</b>. Try the reworded rubric: same skills, new words."));
    var top = el("div", { "class": "prad-top" });
    var vids = thumbs(A.videos.map(function (v) { return { src: base + v.frames[4], tag: v.label, cls: CLS[v.label] }; }),
      function (i) { if (st.v !== i) { st.v = i; st.clip = 4; render(true); } });
    var seg = el("div", { "class": "prad-seg", role: "group", "aria-label": "Rubric wording" });
    [["original", "Original rubric"], ["reworded", "Reworded rubric"]].forEach(function (o) {
      var b = el("button", { type: "button", "data-w": o[0] }, o[1]);
      b.onclick = function () { if (st.wording !== o[0]) { st.wording = o[0]; render(); } };
      seg.appendChild(b);
    });
    top.appendChild(vids); top.appendChild(seg);
    pane.appendChild(top);

    var main = el("div", { "class": "prad-a" });
    pane.appendChild(main);
    // ---- video
    var left = el("div", { "class": "prad-col" });
    var stage = el("div", { "class": "prad-stage" });
    var imA = el("img", { alt: "Video frame" }), imB = el("img", { alt: "" });
    stage.appendChild(imA); stage.appendChild(imB);
    var stripBox = el("div"), total = el("div", { "class": "prad-total" });
    left.appendChild(stage); left.appendChild(stripBox); left.appendChild(total);
    // ---- readout
    var right = el("div", { "class": "prad-col prad-panel" });
    var nav = el("div", { "class": "prad-nav" });
    var prev = el("button", { type: "button", "class": "prad-arrow", "aria-label": "Previous item" }, "&#8249;");
    var select = el("select", { "aria-label": "Rubric item" });
    var next = el("button", { type: "button", "class": "prad-arrow", "aria-label": "Next item" }, "&#8250;");
    nav.appendChild(prev); nav.appendChild(select); nav.appendChild(next);
    var nums = el("div", { "class": "prad-nums" },
      '<div class="pra"><b>0.00</b><span>PRA</span></div><div><b>0.00</b><span>raters</span></div>');
    var S = svg("svg", { viewBox: "0 0 320 200", role: "img", "aria-label": "The video's position among the three level descriptions" });
    var defs = svg("defs");
    var g1 = svg("linearGradient", { id: "prad-g1", gradientUnits: "userSpaceOnUse" }), g2 = svg("linearGradient", { id: "prad-g2", gradientUnits: "userSpaceOnUse" });
    [[g1, 0, 1], [g2, 1, 2]].forEach(function (g) {
      g[0].appendChild(svg("stop", { offset: "0", "stop-color": LV[g[1]] }));
      g[0].appendChild(svg("stop", { offset: "1", "stop-color": LV[g[2]] }));
      defs.appendChild(g[0]);
    });
    S.appendChild(defs);
    var seg1 = svg("line", { stroke: "url(#prad-g1)", "stroke-width": "9", "stroke-linecap": "round" });
    var seg2 = svg("line", { stroke: "url(#prad-g2)", "stroke-width": "9", "stroke-linecap": "round" });
    var star = svg("polygon", { fill: "#f2a20c", stroke: "#7a4a00", "stroke-width": "1" });
    var halo = svg("circle", { r: "18", fill: ORANGE, "fill-opacity": "0.18", "class": "prad-pulse" });
    var dot = svg("circle", { r: "8", fill: ORANGE, stroke: "#fff", "stroke-width": "2.5" });
    S.appendChild(seg1); S.appendChild(seg2); S.appendChild(star);
    var lv = [0, 1, 2].map(function (i) {
      var c = svg("circle", { r: "14", fill: LV[i], stroke: "#fff", "stroke-width": "3" });
      var t = svg("text", { "text-anchor": "middle", "font-size": "14", "font-weight": "800", fill: LV_TXT[i] });
      t.textContent = [1, 3, 5][i];
      S.appendChild(c); S.appendChild(t);
      return [c, t];
    });
    S.appendChild(halo); S.appendChild(dot);
    var key = el("div", { "class": "prad-key" }, '<span><i class="prad-dot"></i>PRA</span><span><i class="prad-star">&#9733;</i>raters</span>');
    var desc = el("div", { "class": "prad-desc" });
    right.appendChild(nav); right.appendChild(nums); right.appendChild(S); right.appendChild(key); right.appendChild(desc);
    main.appendChild(left); main.appendChild(right);

    var shown = imA, strp = null, geo = null, prev1 = 0, prev2 = 0;
    function frame(src) {
      var n = shown === imA ? imB : imA;
      n.onload = function () { n.classList.add("on"); shown.classList.remove("on"); shown = n; };
      n.src = src;
    }
    function px(it) {
      var pts = it.levels.concat([it.pred, it.target]);
      var xs = pts.map(function (p) { return p[0]; }), ys = pts.map(function (p) { return p[1]; });
      var x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs), y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys);
      var sc = Math.min(270 / (x1 - x0 + 1e-6), 150 / (y1 - y0 + 1e-6)), cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
      var P = function (p) { return [160 + (p[0] - cx) * sc, 104 - (p[1] - cy) * sc]; };
      return { L: it.levels.map(P), pred: P(it.pred), target: P(it.target) };
    }
    function starPts(c, r) {
      var p = [];
      for (var i = 0; i < 10; i++) {
        var a = Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r;
        p.push((c[0] + rr * Math.cos(a)).toFixed(1) + "," + (c[1] - rr * Math.sin(a)).toFixed(1));
      }
      return p.join(" ");
    }
    function draw(g) {
      [[seg1, g1, 0, 1], [seg2, g2, 1, 2]].forEach(function (s) {
        var a = g.L[s[2]], b = g.L[s[3]];
        [s[0], s[1]].forEach(function (n) { n.setAttribute("x1", a[0]); n.setAttribute("y1", a[1]); n.setAttribute("x2", b[0]); n.setAttribute("y2", b[1]); });
      });
      lv.forEach(function (n, i) {
        n[0].setAttribute("cx", g.L[i][0]); n[0].setAttribute("cy", g.L[i][1]);
        n[1].setAttribute("x", g.L[i][0]); n[1].setAttribute("y", g.L[i][1] + 5);
      });
      star.setAttribute("points", starPts(g.target, 11));
      [halo, dot].forEach(function (n) { n.setAttribute("cx", g.pred[0]); n.setAttribute("cy", g.pred[1]); });
    }
    function mix(a, b, t) {
      var m = function (p, q) { return [lerp(p[0], q[0], t), lerp(p[1], q[1], t)]; };
      return { L: a.L.map(function (p, i) { return m(p, b.L[i]); }), pred: m(a.pred, b.pred), target: m(a.target, b.target) };
    }
    function count(node, a, b) { tween(600, function (t) { node.textContent = fmt(lerp(a, b, t)); }); }
    prev.onclick = function () { st.item = (st.item + 7) % 8; render(); };
    next.onclick = function () { st.item = (st.item + 1) % 8; render(); };
    select.onchange = function () { st.item = +select.value; render(); };

    function render(newVideo) {
      var v = A.videos[st.v], w = v.wordings[st.wording], rub = A.rubrics[st.wording], it = w.items[st.item];
      mark(vids, st.v);
      each(seg.children, function (b) { b.classList.toggle("on", b.getAttribute("data-w") === st.wording); });
      if (newVideo || !strp) {
        stripBox.innerHTML = "";
        strp = strip(v.frames, base, function (i) { st.clip = i; frame(base + v.frames[i]); mark(strp, i); });
        stripBox.appendChild(strp);
        frame(base + v.frames[st.clip]);
      }
      mark(strp, st.clip);
      total.innerHTML = "<span>Total score</span><b class=\"pra\">" + fmt(w.grs, 1) + "</b><em>PRA</em><b>" + fmt(v.grs, 1) + "</b><em>raters</em>";
      select.innerHTML = rub.map(function (r, i) { return '<option value="' + i + '"' + (i === st.item ? " selected" : "") + ">" + r.name + "</option>"; }).join("");
      var b = nums.querySelectorAll("b");
      count(b[0], prev1, it.score); count(b[1], prev2, v.item_mean[st.item]);
      prev1 = it.score; prev2 = v.item_mean[st.item];
      var to = px(it), from = geo || to;
      tween(650, function (t) { geo = mix(from, to, t); draw(geo); });
      var near = it.score < 2 ? 0 : (it.score < 4 ? 1 : 2);
      desc.innerHTML = rub[st.item].levels.map(function (d, i) {
        return '<div class="' + (i === near ? "on" : "") + '"><b style="background:' + LV[i] + ";color:" + LV_TXT[i] + '">' + [1, 3, 5][i] + "</b><span>" + d + "</span></div>";
      }).join("");
    }
    render(true);
  }

  /* ================================================================ 2: where the models look on unseen items */
  function jet(t) {
    var c = function (x) { return Math.min(Math.max(1.5 - Math.abs(x), 0), 1) * 255; };
    return [c(4 * t - 3), c(4 * t - 2), c(4 * t - 1)];
  }
  function decode(b64) {
    var s = atob(b64), a = new Float32Array(s.length);
    for (var i = 0; i < s.length; i++) a[i] = s.charCodeAt(i) / 255;
    return a;
  }
  function paint(canvas, image, cam, h, w) {
    var W = canvas.width, H = canvas.height, ctx = canvas.getContext("2d");
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
      if (up[i] < thr) { d[4 * i] *= 0.8; d[4 * i + 1] *= 0.8; d[4 * i + 2] *= 0.8; continue; }
      var c = jet((up[i] - lo) / (hi - lo + 1e-8));
      d[4 * i] = 0.42 * d[4 * i] + 0.58 * c[0]; d[4 * i + 1] = 0.42 * d[4 * i + 1] + 0.58 * c[1]; d[4 * i + 2] = 0.42 * d[4 * i + 2] + 0.58 * c[2];
    }
    ctx.putImageData(data, 0, 0);
  }

  function sectionB(pane, B, base) {
    var st = { t: 0, clip: 4, timer: null };
    pane.appendChild(el("p", { "class": "prad-msg" },
      "Rubric items <b>never seen in training</b>. Highlighted: what each model looks at to score the video."));
    var trials = thumbs(B.trials.map(function (t) { return { src: base + t.frames[4], tag: t.task, cls: CLS[t.skill] }; }),
      function (i) { if (st.t !== i) { st.t = i; load(); } });
    pane.appendChild(trials);
    var pair = el("div", { "class": "prad-pair" });
    var cv = {};
    [["bce", "Conventional matching", ""], ["pra", "PRA (ours)", " ours"]].forEach(function (m) {
      var f = el("figure", { "class": "prad-fig" + m[2] });
      var c = el("canvas", { width: 480, height: 360, "aria-label": m[1] + " heat map" });
      var cap = el("figcaption", {}, '<b class="prad-iou">0.000</b><span>overlap with<br>instruments &amp; suture</span>');
      f.appendChild(el("div", { "class": "prad-fig-h" }, m[1]));
      f.appendChild(c); f.appendChild(cap);
      pair.appendChild(f);
      cv[m[0]] = { canvas: c, num: cap.querySelector("b") };
    });
    pane.appendChild(pair);
    var ctrl = el("div", { "class": "prad-ctrl" });
    var play = el("button", { type: "button", "class": "prad-play", "aria-label": "Play the clips" }, "&#9654;");
    var stripBox = el("div", { "class": "prad-grow" });
    ctrl.appendChild(play); ctrl.appendChild(stripBox);
    pane.appendChild(ctrl);

    var imgs = [], strp = null, prevIoU = { bce: 0, pra: 0 };
    function show(i) {
      st.clip = i;
      mark(strp, i);
      var t = B.trials[st.t], im = imgs[i];
      var go = function () {
        ["bce", "pra"].forEach(function (k) { paint(cv[k].canvas, im, decode(t.cams[k][i]), t.shape[0], t.shape[1]); });
      };
      if (im.complete && im.naturalWidth) go(); else im.addEventListener("load", go, { once: true });
    }
    function load() {
      var t = B.trials[st.t];
      mark(trials, st.t);
      imgs = t.frames.map(function (f) { var im = new Image(); im.src = base + f; return im; });
      stripBox.innerHTML = "";
      strp = strip(t.frames, base, show);
      stripBox.appendChild(strp);
      ["bce", "pra"].forEach(function (k) {
        var a = prevIoU[k], b = t.iou[k];
        tween(700, function (x) { cv[k].num.textContent = fmt(lerp(a, b, x), 3); });
        prevIoU[k] = b;
      });
      show(st.clip);
    }
    play.onclick = function () {
      if (st.timer) { clearInterval(st.timer); st.timer = null; play.innerHTML = "&#9654;"; return; }
      play.innerHTML = "&#10073;&#10073;";
      st.timer = setInterval(function () { show((st.clip + 1) % 8); }, 900);
    };
    load();
  }

  /* ================================================================ shell */
  function mount(root) {
    var src = root.getAttribute("data-src"), base = root.getAttribute("data-base") || "";
    root.innerHTML = '<p class="prad-fine">Loading the demo&hellip;</p>';
    fetch(src).then(function (r) { return r.json(); }).then(function (d) {
      root.innerHTML = "";
      var hero = el("div", { "class": "prad-hero" },
        "<h3>A rubric is text. PRA reads it.</h3><p>Pick a video and a rubric item, then see where the score comes from.</p>");
      var tabs = el("div", { "class": "prad-tabs", role: "tablist" });
      hero.appendChild(tabs);
      root.appendChild(hero);
      var panes = [];
      [["1", "Score a video"], ["2", "Where it looks"]].forEach(function (t, i) {
        var b = el("button", { type: "button", role: "tab", "class": "prad-tab" }, '<span class="prad-tab-k">' + t[0] + "</span>" + t[1]);
        b.onclick = function () { select(i); };
        tabs.appendChild(b);
        var p = el("div", { "class": "prad-pane", role: "tabpanel" });
        root.appendChild(p);
        panes.push(p);
      });
      function select(i) {
        each(tabs.children, function (b, k) { b.classList.toggle("on", k === i); b.setAttribute("aria-selected", k === i); });
        panes.forEach(function (p, k) { p.classList.toggle("on", k === i); });
      }
      if (d.aixsuture) sectionA(panes[0], d.aixsuture, base);
      if (d.jigsaws) sectionB(panes[1], d.jigsaws, base);
      root.appendChild(el("p", { "class": "prad-fine" },
        "Precomputed outputs of the trained models on selected videos; not a clinical tool. Videos: AIxSuture (CC BY-NC-ND 4.0), JIGSAWS."));
      select(0);
    }).catch(function (e) { root.innerHTML = '<p class="prad-fine">The demo data could not be loaded.</p>'; console.error(e); });
  }
  document.addEventListener("DOMContentLoaded", function () {
    var root = document.getElementById("pra-demo");
    if (root) mount(root);
  });
})();
