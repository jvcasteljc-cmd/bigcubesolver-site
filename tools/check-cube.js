// Checks js/cube.js against the app's engine: random sequences in every
// notation, applied by both; each engine face must equal ours under ONE fixed
// grid symmetry per face (the engine stores faces in its own frames).
// usage: node tools/check-cube.js <engine-applier>   (reads "n\tmoves" lines)
const { execFileSync } = require('child_process');
const { apply } = require('../js/cube.js').BcsCube;
const applier = process.argv[2];
let seed = 12345;
const rnd = k => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % k; };
const FACES = 'URFDLB', SUF = ['', "'", '2'];
function token(n) {
  const f = FACES[rnd(6)], s = SUF[rnd(3)], kind = rnd(9);
  if (kind === 0) return 'xyz'[rnd(3)] + s;
  if (kind === 1 && n % 2) return 'MES'[rnd(3)] + s;
  if (kind === 2) return f.toLowerCase() + s;
  if (kind === 3) return (1 + rnd(n)) + f + 'w' + s;
  if (kind === 4) { const b = 1 + rnd(n), a = 1 + rnd(b); return a + '-' + b + f + 'w' + s; }
  if (kind === 5) return (1 + rnd(n)) + f + s;
  if (kind === 6) return f + 'w' + s;
  return f + s;
}
const cases = [];
for (let n = 2; n <= 15; n++) for (let t = 0; t < 12; t++) {
  const m = []; for (let k = 0; k < 4 + rnd(30); k++) m.push(token(n));
  cases.push([n, m.join(' ')]);
}
const out = execFileSync(applier, { input: cases.map(c => c[0] + '\t' + c[1]).join('\n') + '\n' }).toString().trim().split('\n');
const SYM = [ // (r,c) -> engine (r,c) for an n grid
  (r, c, n) => [r, c], (r, c, n) => [r, n - 1 - c], (r, c, n) => [n - 1 - r, c], (r, c, n) => [n - 1 - r, n - 1 - c],
  (r, c, n) => [c, r], (r, c, n) => [c, n - 1 - r], (r, c, n) => [n - 1 - c, r], (r, c, n) => [n - 1 - c, n - 1 - r]];
const ok = Array.from({ length: 6 }, () => SYM.map(() => true));
let errs = 0;
cases.forEach(([n, moves], i) => {
  if (out[i].startsWith('ERR')) { errs++; console.log('engine error', n, out[i]); return; }
  const faces = apply(n, moves);
  for (let f = 0; f < 6; f++) SYM.forEach((s, k) => {
    if (!ok[f][k]) return;
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
      const [er, ec] = s(r, c, n);
      if (+out[i][f * n * n + er * n + ec] !== faces[f][r][c]) { ok[f][k] = false; return; }
    }
  });
});
const fits = ok.map(row => row.map((v, k) => v ? k : -1).filter(k => k >= 0));
console.log(cases.length + ' sequences, ' + errs + ' engine errors; symmetries that fit per face U R F D L B:', JSON.stringify(fits));
process.exit(fits.every(f => f.length >= 1) && errs === 0 ? 0 : 1);
