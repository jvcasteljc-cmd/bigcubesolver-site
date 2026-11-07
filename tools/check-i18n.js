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
const changed = Object.keys(en).filter(k => k in done && done[k] !== en[k]);
const added = Object.keys(en).filter(k => !(k in done));
for (const f of fs.readdirSync(dir).filter(f => /^[a-z]{2}\.json$/.test(f) && f !== 'en.json')) {
  const t = read(f);
  for (const k of Object.keys(t)) {
    if (!(k in en)) { console.log(f, 'extra key (no longer in English):', k); continue; }
    if (shape(t[k]) !== shape(en[k]) && !changed.includes(k)) { console.log(f, 'markup differs:', k); bad++; }
  }
}
if (added.length || changed.length) {
  console.log('Translation to-do (shown in English until translated):');
  for (const k of added) console.log('  new     ', k);
  for (const k of changed) console.log('  changed ', k);
}
const prv = fs.statSync(path.join(dir, '..', 'privacy.md')).mtimeMs;
const old = fs.readdirSync(path.join(dir, 'privacy')).filter(f => fs.statSync(path.join(dir, 'privacy', f)).mtimeMs < prv);
if (old.length) console.log('privacy.md is newer than these translations:', old.join(' '));
console.log(bad ? bad + ' problem(s)' : 'i18n ok');
process.exit(bad ? 1 : 0);
