// Translations are PAUSED (user, 2026-11-07): English is the master; site
// changes go into i18n/en.json (and src/) only, and the other languages are
// translated from English only when the user asks.
// A missing text simply shows in English. This check:
//   - FAILS when an existing translation's links/tags/{placeholders} differ
//     from the English (that would break the page);
//   - LISTS texts not yet translated and texts whose English changed since the
//     last translation (i18n/en.translated.json = English as last translated)
//     - the to-do list for the next translation round.
// After a translation round: cp i18n/en.json i18n/en.translated.json
// SPANISH IS KEPT UP TO DATE (user, 2026-11-09: "Keep only the English and
// Spanish versions of the site up to date"): it has its own baseline,
// i18n/es.translated.json - after updating es.json: cp i18n/en.json i18n/es.translated.json
// and the to-do list for Spanish should be empty before every push.
// usage: node tools/check-i18n.js
const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..', 'i18n');
const read = f => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
const en = read('en.json');
const done = fs.existsSync(path.join(dir, 'en.translated.json')) ? read('en.translated.json') : {};
const shape = s => JSON.stringify([
  (s.match(/href="[^"]*"/g) || []).sort(),
  (s.match(/<\/?\w+/g) || []).sort(),
  (s.match(/\{\w+\}/g) || []).sort(),
]);
let bad = 0;
const base = lang => fs.existsSync(path.join(dir, lang + '.translated.json')) ? read(lang + '.translated.json') : done;
const todo = b => [Object.keys(en).filter(k => !(k in b)), Object.keys(en).filter(k => k in b && b[k] !== en[k])];
for (const f of fs.readdirSync(dir).filter(f => /^[a-z]{2}\.json$/.test(f) && f !== 'en.json')) {
  const t = read(f);
  const changed = todo(base(f.slice(0, 2)))[1];
  for (const k of Object.keys(t)) {
    if (!(k in en)) { console.log(f, 'extra key (no longer in English):', k); continue; }
    if (shape(t[k]) !== shape(en[k]) && !changed.includes(k)) { console.log(f, 'markup differs:', k); bad++; }
  }
}
const [esAdded, esChanged] = todo(base('es'));
if (esAdded.length || esChanged.length) {
  console.log('SPANISH to-do (kept up to date - translate before pushing):');
  for (const k of esAdded) console.log('  new     ', k);
  for (const k of esChanged) console.log('  changed ', k);
} else console.log('Spanish: up to date');
const [added, changed] = todo(done);
if (added.length || changed.length)
  console.log('Other languages (paused): ' + added.length + ' new and ' + changed.length + ' changed texts show in English.');
const prv = fs.statSync(path.join(dir, '..', 'privacy.md')).mtimeMs;
const old = fs.readdirSync(path.join(dir, 'privacy')).filter(f => fs.statSync(path.join(dir, 'privacy', f)).mtimeMs < prv);
if (old.length) console.log('privacy.md is newer than these translations:', old.join(' '));
console.log(bad ? bad + ' problem(s)' : 'i18n ok');
process.exit(bad ? 1 : 0);
