// A small N x N cube for drawing patterns: the same notation as the app's
// engine (WCA / SiGN: R U' F2, 2R, Rw 3Fw r, 6-10Uw, x y z, M E S on odd N),
// checked against the engine on random scrambles (see tools/check-cube.js).
// Stickers are points in space (doubled integer coordinates) with an outward
// normal; a turn rotates the stickers of its layers a quarter about the face.
(function (root) {
  'use strict';
  // U R F D L B: outward normals; colour i = face i (W R G Y O B)
  var NORMALS = [[0, 1, 0], [1, 0, 0], [0, 0, 1], [0, -1, 0], [-1, 0, 0], [0, 0, -1]];
  var FACE_OF = { U: 0, R: 1, F: 2, D: 3, L: 4, B: 5 };

  function solved(n) {
    var st = [];
    for (var f = 0; f < 6; f++) {
      var nv = NORMALS[f];
      for (var a = 0; a < n; a++) for (var b = 0; b < n; b++) {
        var u = 2 * a - (n - 1), v = 2 * b - (n - 1), p;
        if (nv[0]) p = [nv[0] * (n - 1), u, v];
        else if (nv[1]) p = [u, nv[1] * (n - 1), v];
        else p = [u, v, nv[2] * (n - 1)];
        st.push({ p: p, nrm: nv.slice(), c: f });
      }
    }
    return st;
  }

  function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  // clockwise seen from outside along u: v' = u(u.v) - u x v
  function cw(u, v) { var d = dot(u, v), c = cross(u, v); return [u[0] * d - c[0], u[1] * d - c[1], u[2] * d - c[2]]; }

  // one layer (0 = the face itself) of face f, turned q quarters clockwise
  function turn(st, n, f, layer, q) {
    var u = NORMALS[f], level = (n - 1) - 2 * layer;
    for (var i = 0; i < st.length; i++) {
      var s = st[i];
      if (dot(s.p, u) !== level) continue;
      for (var k = 0; k < q; k++) { s.p = cw(u, s.p); s.nrm = cw(u, s.nrm); }
    }
  }

  // parse like the engine's parse_wca: returns [[face, layer, quarters], ...] or throws
  function parse(text, n) {
    var out = [], i = 0, sep = /[^0-9A-Za-z']/;
    while (i < text.length) {
      if (sep.test(text[i])) { i++; continue; }
      var start = i, prefix = 0, hasPrefix = false, lo = 0;
      while (i < text.length && text[i] >= '0' && text[i] <= '9') { prefix = prefix * 10 + (+text[i++]); hasPrefix = true; }
      if (hasPrefix && text[i] === '-') {
        lo = prefix; prefix = 0; i++;
        var digits = false;
        while (i < text.length && text[i] >= '0' && text[i] <= '9') { prefix = prefix * 10 + (+text[i++]); digits = true; }
        if (!digits) throw new Error('Unrecognised move ' + text.slice(start, i));
      }
      if (i >= text.length) throw new Error('Unrecognised move ' + text.slice(start));
      var c = text[i++], up = c.toUpperCase(), wide = c !== up;
      var rot = up === 'X' || up === 'Y' || up === 'Z', slice = up === 'M' || up === 'E' || up === 'S';
      if (rot) wide = false;
      if (text[i] === 'w' || text[i] === 'W') {
        if (rot || slice) throw new Error('Unrecognised move ' + text.slice(start, i + 1));
        wide = true; i++;
      }
      var q = 1;
      if (text[i] === "'") { q = 3; i++; } else if (text[i] === '2') { q = 2; i++; }
      var tok = text.slice(start, i), f, L;
      if (rot) {
        if (hasPrefix) throw new Error('Unrecognised move ' + tok);
        f = up === 'X' ? 1 : up === 'Y' ? 0 : 2;
        for (L = 0; L < n; L++) out.push([f, L, q]);
        continue;
      }
      if (slice) {
        if (hasPrefix || n % 2 === 0) throw new Error('Unrecognised move ' + tok);
        out.push([up === 'M' ? 4 : up === 'E' ? 3 : 2, (n - 1) / 2, q]);
        continue;
      }
      f = FACE_OF[up];
      if (f === undefined) throw new Error('Unrecognised move ' + tok);
      var depth = hasPrefix ? prefix : (wide ? 2 : 1);
      if (depth < 1 || depth > n) throw new Error('Move too deep for ' + n + '×' + n + ': ' + tok);
      if (lo > 0) {
        if (!wide || lo > depth) throw new Error('Unrecognised move ' + tok);
        for (L = lo - 1; L < depth; L++) out.push([f, L, q]);
      } else if (wide) for (L = 0; L < depth; L++) out.push([f, L, q]);
      else out.push([f, depth - 1, q]);
    }
    return out;
  }

  // the cube after `moves` from solved, as faces[f][row][col] seen from outside:
  // U with B at the top, D with F at the top, the side faces with U at the top
  function apply(n, moves) {
    var st = solved(n), list = parse(moves, n);
    for (var k = 0; k < list.length; k++) turn(st, n, list[k][0], list[k][1], list[k][2]);
    var faces = [];
    for (var f = 0; f < 6; f++) { faces.push([]); for (var r = 0; r < n; r++) faces[f].push(new Array(n)); }
    // per face: [right, down] directions in space for its picture
    var FRAME = [
      [[1, 0, 0], [0, 0, 1]],    // U: right = +x, down = towards F
      [[0, 0, -1], [0, -1, 0]],  // R
      [[1, 0, 0], [0, -1, 0]],   // F
      [[1, 0, 0], [0, 0, -1]],   // D: right = +x, down = towards B
      [[0, 0, 1], [0, -1, 0]],   // L
      [[-1, 0, 0], [0, -1, 0]]   // B (seen from behind)
    ];
    for (var i = 0; i < st.length; i++) {
      var s = st[i];
      for (f = 0; f < 6; f++) if (dot(s.nrm, NORMALS[f]) === 1) break;
      var fr = FRAME[f];
      var col = (dot(s.p, fr[0]) + (n - 1)) / 2, row = (dot(s.p, fr[1]) + (n - 1)) / 2;
      faces[f][row][col] = s.c;
    }
    return faces;
  }

  root.BcsCube = { apply: apply, parse: parse };
})(typeof window !== 'undefined' ? window : module.exports);
