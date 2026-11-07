// Every language must have every key, and keep the English markup: the same
// links (href), the same tags (counted) and the same {placeholders}.
// usage: node tools/check-i18n.js
const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..', 'i18n');
const en = JSON.parse(fs.readFileSync(path.join(dir, 'en.json'), 'utf8'));
const shape = s => JSON.stringify([
  (s.match(/href="[^"]*"/g) || []).sort(),
  (s.match(/<\/?\w+/g) || []).sort(),
  (s.match(/\{\w+\}/g) || []).sort(),
]);
let bad = 0;
for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.json') && f !== 'en.json')) {
  const t = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
  for (const k of Object.keys(en)) {
    if (!(k in t)) { console.log(f, 'missing', k); bad++; continue; }
    if (shape(t[k]) !== shape(en[k])) { console.log(f, 'markup differs:', k, '\n  en:', en[k], '\n  ', t[k]); bad++; }
  }
  for (const k of Object.keys(t)) if (!(k in en)) { console.log(f, 'extra key', k); bad++; }
}
for (const f of fs.readdirSync(path.join(dir, 'privacy'))) {
  const s = fs.readFileSync(path.join(dir, 'privacy', f), 'utf8');
  if (!s.includes('privacy@bigcubesolver.com')) { console.log('privacy/' + f, 'lacks the contact address'); bad++; }
  if ((s.match(/^## /gm) || []).length !== 10) { console.log('privacy/' + f, 'should have 10 sections'); bad++; }
}
console.log(bad ? bad + ' problem(s)' : 'i18n ok');
process.exit(bad ? 1 : 0);
