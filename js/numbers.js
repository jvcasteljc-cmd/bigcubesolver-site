// "Your cube in numbers" - the app's About screen (AboutCharts.kt) on the web.
// Pieces and positions are COMPUTED here exactly as the app does; solution
// lengths and times are the app's measured tables (CubeNumbers in the app,
// from benchmarks/turns_by_size.csv and the Galaxy Z Fold 7 runs).
(function () {
  var SIZES = []; for (var n = 2; n <= 15; n++) SIZES.push(n);
  var TURNS_SHORT = [8.8, 18.6, 43.2, 68.9, 144.9, 202.6, 312.4, 423.1, 615.8, 768.9, 1033.5, 1208.7, 1542.6, 1751.4];
  var TURNS_REGULAR = [8.8, 18.6, 87.8, 254.8, 482.2, 553.0, 825.0, 967.9, 1294.7, 1496.3, 1884.3, 2160.1, 2609.2, 2904.0];
  var FOLD7_SHORT = [0.0, 0.11, 0.13, 1.03, 1.27, 1.19, 5.33, 2.65, 4.14, 6.21, 7.64, 13.51, 8.84, 10.86];
  var FOLD7_REGULAR = [0.0, 0.12, 1.2, 0.18, 0.01, 0.2, 0.06, 0.34, 0.12, 0.53, 0.26, 0.89, 0.45, 1.59];
  var UNIVERSE_MM = 880000000000000000000000000000n;   // ~93 billion light-years
  var DECK_LOG10 = 67.90664839220477;                  // log10(52!)
  var C = { corner: '#f9f7f0', edge: '#4d8ae6', centre: '#ffd400', short: '#2fcb6e', regular: '#f97c0c',
            pos: '#b07cf0', text: '#b6becd', grid: 'rgba(255,255,255,.13)', axis: 'rgba(255,255,255,.33)' };

  function fact(k) { var r = 1n; for (var i = 2n; i <= BigInt(k); i++) r *= i; return r; }
  var F24 = fact(24);
  function positions(n) {
    if (n % 2 === 0) return fact(7) * 3n ** 6n * F24 ** BigInt((n * n - 2 * n) / 4) / 24n ** BigInt(6 * (n - 2) * (n - 2) / 4);
    return fact(8) * 3n ** 7n * fact(12) * 2n ** 10n * F24 ** BigInt((n * n - 2 * n - 3) / 4) / 24n ** BigInt(6 * (n - 3) * (n - 1) / 4);
  }
  var POS = {}; SIZES.forEach(function (n) { POS[n] = positions(n); });
  function log10(v) { var s = v.toString(); return s.length - 1 + Math.log10(Number(s.slice(0, 15)) / Math.pow(10, Math.min(15, s.length) - 1)); }
  var corners = function () { return 8; }, edges = function (n) { return 12 * (n - 2); },
      centres = function (n) { return 6 * (n - 2) * (n - 2); };
  var SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
  function sup(k) { return String(k).split('').map(function (d) { return SUP[d]; }).join(''); }
  // commas always (as the app); breakable = a zero-width space after each, so a
  // long number wraps between groups only
  function grouped(v, breakable) { var s = v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','); return breakable ? s.replace(/,/g, ',\u200B') : s; }
  function scientific(v) {
    var s = v.toString(), r = Math.round(Number(s.slice(0, 3)) / 10) / 10;
    return r >= 10 ? '1.0 × 10' + sup(s.length) : r.toFixed(1) + ' × 10' + sup(s.length - 1);
  }
  function cardsFor(n) {
    var e = log10(POS[n]), k = 1, lf = 0;
    for (;;) { var next = lf + Math.log10(k + 1); if (Math.abs(next - e) > Math.abs(lf - e) && lf > 0) return k; k++; lf = next; }
  }
  var T = function (key, vars) { return window.BcsLang ? BcsLang.text(key, vars) : key; };
  var esc = function (s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); };

  // ---- the four line/bar charts, as SVG at the box's own width
  function chart(el, kind) {
    var W = Math.max(280, el.clientWidth), H = 250, L = 46, R = W - 10, TOP = 34, B = H - 24;
    var o = [];
    var slot = (R - L) / SIZES.length, x = function (i) { return L + slot * (i + 0.5); };
    function grid(y, label) {
      o.push('<line x1="' + L + '" x2="' + R + '" y1="' + y + '" y2="' + y + '" stroke="' + C.grid + '"/>');
      o.push('<text x="' + (L - 5) + '" y="' + (y + 4) + '" text-anchor="end">' + label + '</text>');
    }
    function legend(items, dashed) {
      var lx = L;
      items.forEach(function (it) {
        o.push('<rect x="' + lx + '" y="6" width="11" height="11" rx="2" fill="' + it[0] + '"/>');
        o.push('<text x="' + (lx + 15) + '" y="16">' + esc(it[1]) + '</text>');
        lx += 15 + it[1].length * 6.4 + 16;
      });
      if (dashed) {
        o.push('<line x1="' + lx + '" x2="' + (lx + 18) + '" y1="11" y2="11" stroke="#fff" stroke-opacity=".86" stroke-width="1.5" stroke-dasharray="5 4"/>');
        o.push('<text x="' + (lx + 22) + '" y="16">' + esc(dashed) + '</text>');
      }
    }
    function lines(series, y, endLabel) {
      series.forEach(function (s) {
        var c = s[0], v = s[1], d = '';
        v.forEach(function (val, i) { d += (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(val).toFixed(1); });
        o.push('<path d="' + d + '" fill="none" stroke="' + c + '" stroke-width="2.4" stroke-linejoin="round"/>');
        v.forEach(function (val, i) { o.push('<circle cx="' + x(i).toFixed(1) + '" cy="' + y(val).toFixed(1) + '" r="2.8" fill="' + c + '"/>'); });
        var last = v.length - 1;
        o.push('<text x="' + (x(last) + 4) + '" y="' + (y(v[last]) - 7) + '" text-anchor="end" fill="' + c + '" font-weight="700">' + endLabel(v[last]) + '</text>');
      });
    }
    var bw = slot * 0.62;
    if (kind === 'pieces') {
      legend([[C.corner, T('num.corners')], [C.edge, T('num.edges')], [C.centre, T('num.centres')]]);
      var y = function (v) { return B - (B - TOP) * v / 1200; };
      [0, 300, 600, 900, 1200].forEach(function (v) { grid(y(v), v.toLocaleString('en-US')); });
      SIZES.forEach(function (n, i) {
        var base = 0;
        [[C.corner, corners(n)], [C.edge, edges(n)], [C.centre, centres(n)]].forEach(function (p) {
          if (!p[1]) return;
          o.push('<rect x="' + (x(i) - bw / 2).toFixed(1) + '" y="' + y(base + p[1]).toFixed(1) + '" width="' + bw.toFixed(1) +
                 '" height="' + (y(base) - y(base + p[1])).toFixed(1) + '" fill="' + p[0] + '"/>');
          base += p[1];
        });
        o.push('<text class="v" x="' + x(i).toFixed(1) + '" y="' + (y(base) - 4).toFixed(1) + '" text-anchor="middle">' + base + '</text>');
      });
    } else if (kind === 'positions') {
      legend([[C.pos, T('num.positions_legend')]], T('num.atoms'));
      var yp = function (e) { return B - (B - TOP) * e / 850; };
      [0, 200, 400, 600, 800].forEach(function (e) { grid(yp(e), '10' + sup(e)); });
      SIZES.forEach(function (n, i) {
        var e = log10(POS[n]);
        o.push('<rect x="' + (x(i) - bw / 2).toFixed(1) + '" y="' + yp(e).toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + (B - yp(e)).toFixed(1) + '" fill="' + C.pos + '"/>');
        o.push('<text class="v" x="' + x(i).toFixed(1) + '" y="' + (yp(e) - 4).toFixed(1) + '" text-anchor="middle">10<tspan dy="-4" font-weight="700" font-size="8.5">' + Math.floor(e) + '</tspan></text>');
      });
      o.push('<line x1="' + L + '" x2="' + R + '" y1="' + yp(80) + '" y2="' + yp(80) + '" stroke="#fff" stroke-opacity=".86" stroke-width="1.5" stroke-dasharray="5 4"/>');
    } else if (kind === 'turns') {
      legend([[C.short, T('num.short')], [C.regular, T('num.regular')]]);
      var yt = function (v) { return B - (B - TOP) * v / 3000; };
      [0, 1000, 2000, 3000].forEach(function (v) { grid(yt(v), v.toLocaleString('en-US')); });
      lines([[C.regular, TURNS_REGULAR], [C.short, TURNS_SHORT]], yt, function (v) { return Math.floor(v).toLocaleString('en-US'); });
    } else {
      legend([[C.short, T('num.short')], [C.regular, T('num.regular')]]);
      var ys = function (v) { return B - (B - TOP) * ((Math.log10(Math.max(v, 0.01)) + 2) / 4); };
      [[0.01, '0.01 s'], [0.1, '0.1 s'], [1, '1 s'], [10, '10 s'], [100, '100 s']].forEach(function (g) { grid(ys(g[0]), g[1]); });
      lines([[C.regular, FOLD7_REGULAR], [C.short, FOLD7_SHORT]], ys, function (v) { return v >= 10 ? v.toFixed(0) + ' s' : v.toFixed(1) + ' s'; });
    }
    SIZES.forEach(function (n, i) { o.push('<text x="' + x(i).toFixed(1) + '" y="' + (B + 16) + '" text-anchor="middle">' + n + '</text>'); });
    o.push('<line x1="' + L + '" x2="' + R + '" y1="' + B + '" y2="' + B + '" stroke="' + C.axis + '"/>');
    el.innerHTML = '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" role="img" fill="' + C.text + '" font-size="11">' + o.join('') + '</svg>';
  }

  // ---- cards
  var RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'], SUITS = ['♠', '♥', '♦', '♣'];
  var red = function (c) { var s = Math.floor(c / 13); return s === 1 || s === 2; };
  function shuffled(k) {
    var a = []; for (var i = 0; i < k; i++) a.push(i);
    var r = new Uint32Array(k); (window.crypto || window.msCrypto).getRandomValues(r);
    for (var j = k - 1; j > 0; j--) { var t = r[j] % (j + 1), x = a[j]; a[j] = a[t]; a[t] = x; }
    return a;
  }
  function deck(el) {
    el.innerHTML = shuffled(52).map(function (c) {
      return '<span class="pc' + (red(c) ? ' red' : '') + '"><b>' + RANKS[c % 13] + '</b><i>' + SUITS[Math.floor(c / 13)] + '</i></span>';
    }).join('');
  }
  function deckScale(el) {
    var rows = [[T('num.deck_scale_sand'), 18.875], [T('num.deck_scale_shuffles'), 27.542], [T('num.deck_scale_earth'), 50.124], [T('num.deck_scale_deck'), DECK_LOG10]];
    el.innerHTML = rows.map(function (r, i) {
      var k = Math.floor(r[1]), m = Math.pow(10, r[1] - k);
      return '<div class="srow' + (i === 3 ? ' hi' : '') + '"><div>' + esc(r[0]) + '</div><div class="sbar"><i style="width:' + (r[1] / 80 * 100).toFixed(1) + '%"></i><b>' + m.toFixed(1) + ' × 10' + sup(k) + '</b></div></div>';
    }).join('');
  }
  function decksPerCube(el) {
    el.innerHTML = SIZES.map(function (n) {
      var decks = log10(POS[n]) / DECK_LOG10, art = '', label;
      if (decks < 1) {
        var k = cardsFor(n);
        for (var c = 0; c < k; c++) art += '<span class="mini' + (red(c * 7 % 52) ? ' red' : '') + '"></span>';
        art = '<span class="fan">' + art + '</span>';
        label = k + ' ' + T('num.decks_cards');
      } else {
        var whole = Math.floor(decks), part = decks - whole;
        for (var d = 0; d < whole; d++) art += '<span class="dk"></span>';
        if (part > 0.05) art += '<span class="dk" style="width:' + (part * 100).toFixed(0) + '%;max-width:' + (part * 22).toFixed(1) + 'px"></span>';
        label = Math.abs(decks - Math.round(decks)) < 0.05 ? Math.round(decks) + ' ' + T('num.decks_decks') : decks.toFixed(1) + ' ' + T('num.decks_decks');
      }
      return '<div class="drow' + (n === 15 ? ' hi' : '') + '"><span>' + n + '×' + n + '</span><span class="art">' + art + '</span><b>' + label + '</b></div>';
    }).join('');
  }

  // ---- pixels: the phone screen and the ladder, drawn on canvases
  var INK = '#43523d', LCD = '#c7f0d8', LCD_DIM = '#a9cdb8';
  function rnd() { var r = new Uint8Array(1); crypto.getRandomValues(r); return r[0]; }
  function bits(k) { var a = new Uint8Array(k); crypto.getRandomValues(a); return a; }
  function phone(cv) {
    var W = 84, H = 48, USED = 32, box = cv.parentNode.clientWidth;
    var px = Math.max(2, Math.floor(box * 0.86 / W)), pad = 16;
    cv.width = W * px + 2 * pad; cv.height = H * px + 2 * pad;
    var g = cv.getContext('2d');
    g.fillStyle = '#2b3a55'; g.beginPath();
    if (g.roundRect) g.roundRect(0, 0, cv.width, cv.height, 18); else g.rect(0, 0, cv.width, cv.height);
    g.fill();
    g.fillStyle = LCD; g.fillRect(pad, pad, W * px, H * px);
    var b = bits(W * USED); g.fillStyle = INK;
    for (var i = 0; i < b.length; i++) if (b[i] & 1) g.fillRect(pad + (i % W) * px, pad + Math.floor(i / W) * px, px, px);
    var yCut = pad + USED * px;
    g.fillStyle = LCD_DIM; g.fillRect(pad, yCut, W * px, (H - USED) * px);
    g.strokeStyle = INK; g.lineWidth = 2; g.setLineDash([6, 4]);
    g.beginPath(); g.moveTo(pad, yCut); g.lineTo(pad + W * px, yCut); g.stroke(); g.setLineDash([]);
    g.fillStyle = INK; g.font = '700 ' + Math.max(12, px * 4) + 'px system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(T('num.pic_ends_here'), pad + W * px / 2, yCut + (H - USED) * px / 2);
  }
  var RUNGS = [[8, 8, 'bw'], [16, 16, 'bw'], [32, 16, 'lcd'], [16, 16, 'rgb'], [84, 32, 'lcd']];
  function ladder(el) {
    var labels = ['num.pic_rung_3', 'num.pic_rung_5', 'num.pic_rung_7', 'num.pic_rung_13', 'num.pic_rung_15'];
    var px = Math.max(2, Math.floor(el.clientWidth * 0.98 / 84));
    el.innerHTML = '';
    RUNGS.forEach(function (r, k) {
      var p = document.createElement('p'); p.textContent = T(labels[k]); if (k === 4) p.style.fontWeight = '700';
      var cv = document.createElement('canvas'); cv.width = r[0] * px; cv.height = r[1] * px;
      var g = cv.getContext('2d'), b = bits(r[0] * r[1]);
      for (var i = 0; i < b.length; i++) {
        var v = b[i];
        g.fillStyle = r[2] === 'rgb' ? 'rgb(' + Math.round((v >> 5) * 255 / 7) + ',' + Math.round(((v >> 2) & 7) * 255 / 7) + ',' + Math.round((v & 3) * 255 / 3) + ')'
                    : r[2] === 'lcd' ? (v & 1 ? INK : LCD) : (v & 1 ? '#1e222c' : '#f9f7f0');
        g.fillRect((i % r[0]) * px, Math.floor(i / r[0]) * px, px, px);
      }
      el.appendChild(p); el.appendChild(cv);
    });
  }

  function fill() {
    var p15 = POS[15], times = p15 / UNIVERSE_MM;
    document.querySelectorAll('[data-chart]').forEach(function (el) { chart(el, el.getAttribute('data-chart')); });
    document.getElementById('total3').textContent = '= ' + grouped(POS[3]);
    document.getElementById('in-full').textContent = T('num.15_in_full', { a: p15.toString().length });
    document.getElementById('digits15').textContent = grouped(p15, true);
    document.getElementById('universe').textContent = T('num.15_universe',
      { a: scientific(p15), b: scientific(UNIVERSE_MM), c: scientific(times), d: times.toString().length });
    document.getElementById('deck52').textContent = grouped(fact(52), true);
    deckScale(document.getElementById('scale'));
    decksPerCube(document.getElementById('decks'));
    phone(document.getElementById('phone'));
    ladder(document.getElementById('ladder'));
  }
  function start() {
    fill();
    var d = document.getElementById('deck'); deck(d);
    d.addEventListener('click', function () { deck(d); });
    document.getElementById('phone').addEventListener('click', function () { phone(this); });
    document.getElementById('ladder').addEventListener('click', function () { ladder(this); });
    document.addEventListener('langchange', fill);
    var w = window.innerWidth;
    window.addEventListener('resize', function () { if (Math.abs(window.innerWidth - w) > 30) { w = window.innerWidth; fill(); } });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
