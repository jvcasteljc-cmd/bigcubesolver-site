// Draws a cube (BcsCube.apply's faces) as an SVG seen from the front-right-top:
// U on top, F on the left, R on the right, in the app's colours.
(function (root) {
  'use strict';
  var COLOURS = ['#f9f7f0', '#d6182b', '#0db251', '#ffd400', '#f97c0c', '#0d59d9'];
  var SHADE = { 0: 1, 2: 0.9, 1: 0.76 };       // light from above-left
  var C30 = Math.cos(Math.PI / 6), S30 = 0.5;

  function shade(hex, k) {
    var v = parseInt(hex.slice(1), 16);
    var r = Math.round(((v >> 16) & 255) * k), g = Math.round(((v >> 8) & 255) * k), b = Math.round((v & 255) * k);
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  }
  // unit cube point -> screen (x right, y down); size 1 spans ~1.73 wide
  function proj(x, y, z) { return [(x - z) * C30, (x + z) * S30 - y]; }

  // face picture (row, col) -> a point in the unit cube, u/v in 0..1 across the face
  var AT = {
    0: function (u, v) { return [u, 1, v]; },          // U: right = +x, down = towards F
    2: function (u, v) { return [u, 1 - v, 1]; },      // F
    1: function (u, v) { return [1, 1 - v, 1 - u]; }   // R: right = towards the back
  };

  function svg(n, faces, opts) {
    opts = opts || {};
    var gap = n <= 3 ? 0.07 : n <= 7 ? 0.09 : 0.11;
    var parts = [];
    [0, 2, 1].forEach(function (f) {
      var at = AT[f];
      // the face's black body
      var body = [[0, 0], [1, 0], [1, 1], [0, 1]].map(function (p) { return proj.apply(null, at(p[0], p[1])); });
      parts.push('<polygon points="' + body.map(fmt).join(' ') + '" fill="#0b0c10"/>');
      for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) {
        var a = (c + gap) / n, b = (c + 1 - gap) / n, t = (r + gap) / n, d = (r + 1 - gap) / n;
        var pts = [[a, t], [b, t], [b, d], [a, d]].map(function (p) { return proj.apply(null, at(p[0], p[1])); });
        parts.push('<polygon points="' + pts.map(fmt).join(' ') + '" fill="' + shade(COLOURS[faces[f][r][c]], SHADE[f]) + '"/>');
      }
    });
    var label = opts.label ? ' role="img" aria-label="' + esc(opts.label) + '"' : ' aria-hidden="true"';
    return '<svg viewBox="-0.9 -1.04 1.8 2.08" xmlns="http://www.w3.org/2000/svg"' + label + '>' + parts.join('') + '</svg>';
  }
  function fmt(p) { return p[0].toFixed(4) + ',' + p[1].toFixed(4); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (ch) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]; }); }

  // the link the app shares and opens: /p?n=..&name=..&m=..
  function link(n, name, moves, base) {
    return (base || '') + '/p?n=' + n + '&name=' + encodeURIComponent(name) + '&m=' + encodeURIComponent(moves.trim().replace(/\s+/g, ' '));
  }

  root.BcsDraw = { svg: svg, link: link, esc: esc };
})(window);
