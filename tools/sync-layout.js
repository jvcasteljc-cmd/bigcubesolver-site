// Rewrites the shared header and footer of every page from tools/layout.js
// and makes sure each page loads js/lang.js right after its <title>.
// usage: node tools/sync-layout.js   (run after editing tools/layout.js)
const fs = require('fs');
const path = require('path');
const { header, footer, PAGE_OF, LANG_SCRIPT } = require('./layout');
const root = path.join(__dirname, '..');

for (const f of fs.readdirSync(root).filter(f => f.endsWith('.html'))) {
  const file = path.join(root, f);
  let s = fs.readFileSync(file, 'utf8');
  const before = s;
  const page = PAGE_OF[f] || '';
  s = s.replace(/<header class="top">[\s\S]*?<\/header>/, header(page));
  if (/<footer>[\s\S]*?<\/footer>/.test(s)) s = s.replace(/<footer>[\s\S]*?<\/footer>/, footer());
  else s = s.replace(/<\/main>/, '</main>\n' + footer());
  if (!s.includes(LANG_SCRIPT)) s = s.replace(/(<title[^>]*>[^<]*<\/title>)/, '$1\n' + LANG_SCRIPT);
  if (s !== before) { fs.writeFileSync(file, s); console.log('updated', f); }
}
