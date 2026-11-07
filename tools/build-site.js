// Builds every page of the site from src/*.html + i18n/<lang>.json.
//   node tools/build-site.js        (writes ./<page>.html; commit the output)
//
// Template syntax (src/*.html):
//   <h1 t="key"></h1>        one copy of the element per language, marked
//                            data-lang="xx" lang="xx", holding i18n[xx][key]
//                            (HTML allowed; English when a language lacks it)
//   <title t="key"></title>  English text + data-xx="..." for js/lang.js
//   {{HEADER:page}}          the shared header (page = nav entry to light up)
//   {{FOOTER}}               the shared footer
//   {{HEAD}}                 the shared <head> lines (css, icons, lang.js)
//   {{JS:prefix}}            BcsLang.add({...}) with every key starting with prefix
//   {{PRIVACY}}              the policy, one <article> per language, from
//                            privacy.md (en + es, the app repo's docs/PRIVACY.md)
//                            and i18n/privacy/<lang>.md for the others
// Languages, in menu order (English and Spanish first, then by speakers):
const LANGS = [
  ['en', 'English'], ['es', 'Español'],
  ['zh', '中文（简体）'], ['hi', 'हिन्दी'], ['fr', 'Français'], ['pt', 'Português (Brasil)'],
  ['ru', 'Русский'], ['id', 'Bahasa Indonesia'], ['de', 'Deutsch'], ['ja', '日本語'],
  ['tr', 'Türkçe'], ['ko', '한국어'], ['it', 'Italiano'], ['pl', 'Polski'],
];
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');

const T = {};
for (const [code] of LANGS) T[code] = JSON.parse(read(`i18n/${code}.json`));
const tr = (code, key) => {
  const v = T[code][key] !== undefined ? T[code][key] : T.en[key];
  if (v === undefined) throw new Error('missing key ' + key);
  return v;
};
const all = (key, tag = 'span', attrs = '') =>
  LANGS.map(([c]) => `<${tag}${attrs} data-lang="${c}" lang="${c}">${tr(c, key)}</${tag}>`).join('');
const escAttr = s => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

// ---- shared parts
const NAV = [['home', '/'], ['patterns', '/patterns'], ['faq', '/faq'], ['support', '/support'], ['privacy', '/privacy']];
const GLOBE = '<svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z"/></svg>';
function header(page) {
  const links = NAV.map(([id, href]) => `<a href="${href}"${id === page ? ' aria-current="page"' : ''}>${all('nav.' + id)}</a>`).join('');
  const codes = LANGS.map(([c]) => `<span data-lang="${c}">${c.toUpperCase()}</span>`).join('');
  const items = LANGS.map(([c, name], i) =>
    (i === 2 ? '<hr>' : '') + `<button type="button" role="option" data-set="${c}" lang="${c}">${name}</button>`).join('');
  return `<header class="top">
  <div class="wrap">
    <a class="brand" href="/"><img src="/img/icon-192.png" alt="" width="32" height="32"><span>Big Cube Solver</span></a>
    <nav>${links}</nav>
    <details class="langs"><summary title="Language">${GLOBE}${codes}<i class="caret"></i></summary><div class="langlist" role="listbox" aria-label="Language">${items}</div></details>
  </div>
  <div class="stripe"><i></i><i></i><i></i><i></i><i></i><i></i></div>
</header>`;
}
function footer() {
  return `<footer>
  <div class="wrap">
    <span>© 2026 Big Cube Solver</span>
    <a href="/faq">${all('nav.faq')}</a>
    <a href="/support">${all('nav.support')}</a>
    <a href="/privacy">${all('nav.privacy')}</a>
    <a href="mailto:support@bigcubesolver.com">support@bigcubesolver.com</a>
  </div>
</footer>`;
}
const HEAD = `<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#15181f">
<link rel="icon" href="/img/favicon.png">
<link rel="apple-touch-icon" href="/img/apple-touch-icon.png">
<link rel="stylesheet" href="/css/site.css">
<script src="/js/lang.js"></script>`;

// ---- privacy: tiny Markdown (headings, paragraphs, "- " lists, **b**, *i*, links)
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
function inline(s) {
  s = esc(s);
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>');
  s = s.replace(/(^|[\s(（：:])([\w.+-]+@[\w-]+\.[\w.]+\w)/g, '$1<a href="mailto:$2">$2</a>');
  s = s.replace(/(^|[\s(])(https:\/\/[^\s)<]+[^\s).,<])/g, '$1<a href="$2">$2</a>');
  return s;
}
function md(text) {
  const out = [];
  let para = [], list = null;
  const flush = () => {
    if (para.length) { out.push('<p>' + inline(para.join(' ')) + '</p>'); para = []; }
    if (list) { out.push('<ul>' + list.map(li => '<li>' + inline(li) + '</li>').join('') + '</ul>'); list = null; }
  };
  for (const raw of text.split('\n')) {
    const line = raw.trimEnd();
    let m;
    if (!line.trim()) { flush(); continue; }
    if ((m = line.match(/^(#{1,3}) (.*)$/))) { flush(); const h = m[1].length; out.push(`<h${h}>${inline(m[2])}</h${h}>`); continue; }
    if ((m = line.match(/^\s*[-*] (.*)$/))) { if (para.length) flush(); (list = list || []).push(m[1]); continue; }
    if (list && /^\s+\S/.test(raw)) { list[list.length - 1] += ' ' + line.trim(); continue; }
    if (list) flush();
    para.push(line.trim());
  }
  flush();
  return out.join('\n');
}
function privacy() {
  const [en, es] = read('privacy.md').split(/\n---\n/);
  const src = { en: en.replace(/^\(Published at [^)]*\)\s*$/m, ''), es };
  return LANGS.map(([c]) => {
    const text = src[c] || read(`i18n/privacy/${c}.md`);
    return `    <article id="${c}" lang="${c}" data-lang="${c}">\n${md(text)}\n    </article>`;
  }).join('\n');
}

// ---- pages
const PAGES = fs.readdirSync(path.join(root, 'src')).filter(f => f.endsWith('.html'));
for (const f of PAGES) {
  let s = read('src/' + f);
  s = s.replace('{{HEAD}}', HEAD);
  s = s.replace(/\{\{HEADER:(\w*)\}\}/, (_, p) => header(p));
  s = s.replace('{{FOOTER}}', footer());
  s = s.replace('{{PRIVACY}}', () => privacy());
  s = s.replace(/\{\{JS:([\w.]+)\}\}/g, (_, prefix) => {
    const d = {};
    for (const k of Object.keys(T.en).filter(k => k.startsWith(prefix))) {
      d[k] = {};
      for (const [c] of LANGS) d[k][c] = tr(c, k);
    }
    return `<script>BcsLang.add(${JSON.stringify(d)});</script>`;
  });
  s = s.replace(/<title t="([^"]+)"><\/title>/, (_, key) =>
    '<title' + LANGS.slice(1).map(([c]) => ` data-${c}="${escAttr(tr(c, key))}"`).join('') + `>${tr('en', key)}</title>`);
  s = s.replace(/<(\w+)((?:\s+[\w-]+(?:="[^"]*")?)*?)\s+t="([^"]+)"((?:\s+[\w-]+(?:="[^"]*")?)*)\s*><\/\1>/g,
    (_, tag, a1, key, a2) => all(key, tag, a1 + a2));
  if (/\st="|\{\{/.test(s)) throw new Error(f + ': unexpanded template text: ' + (s.match(/.{0,40}(\st="|\{\{).{0,40}/) || [''])[0]);
  s = s.replace(/^<!doctype html>\n/i, m => m + `<!-- GENERATED from src/${f} by tools/build-site.js - edit the source -->\n`);
  fs.writeFileSync(path.join(root, f), s);
}
console.log('built', PAGES.length, 'pages in', LANGS.length, 'languages');
