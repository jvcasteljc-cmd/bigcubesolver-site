// privacy.md (the app repo's docs/PRIVACY.md, copied) -> privacy.html.
// The policy is plain Markdown: headings, paragraphs, "- " lists, **bold**,
// *italic*, [links](url); "---" separates the English and Spanish versions.
// usage: node tools/build-privacy.js
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const md = fs.readFileSync(path.join(root, 'privacy.md'), 'utf8');

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
function inline(s) {
  s = esc(s);
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>');
  s = s.replace(/(^|[\s(])([\w.+-]+@[\w-]+\.[\w.]+\w)/g, '$1<a href="mailto:$2">$2</a>');
  s = s.replace(/(^|[\s(])(https:\/\/[^\s)<]+[^\s).,<])/g, '$1<a href="$2">$2</a>');
  return s;
}
function block(text) {
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
const [en, es] = md.split(/\n---\n/);
const page = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#15181f">
<link rel="icon" href="/img/favicon.png">
<link rel="apple-touch-icon" href="/img/apple-touch-icon.png">
<link rel="stylesheet" href="/css/site.css">
<title>Privacy Policy - Big Cube Solver</title>
<meta name="description" content="Big Cube Solver does not collect, store on any server, or share any personal data.">
</head>
<body>
<!-- GENERATED from privacy.md by tools/build-privacy.js - edit privacy.md -->
<header class="top">
  <div class="wrap">
    <a class="brand" href="/"><img src="/img/icon-192.png" alt="" width="32" height="32">Big Cube Solver</a>
    <nav><a href="/">Home</a><a href="/patterns">Patterns</a><a href="/privacy" aria-current="page">Privacy</a></nav>
  </div>
  <div class="stripe"><i></i><i></i><i></i><i></i><i></i><i></i></div>
</header>
<main class="wrap">
  <div class="prose">
    <div class="lang"><a class="chip" href="#en">English</a><a class="chip" href="#es">Español</a></div>
    <article id="en">
${block(en.replace(/^\(Published at [^)]*\)\s*$/m, ''))}
    </article>
    <hr style="border:0;border-top:1px solid var(--line);margin:40px 0">
    <article id="es" lang="es">
${block(es)}
    </article>
  </div>
</main>
<footer>
  <div class="wrap">
    <span>© 2026 Big Cube Solver</span>
    <a href="/privacy">Privacy</a>
    <a href="mailto:privacy@bigcubesolver.com">privacy@bigcubesolver.com</a>
  </div>
</footer>
</body>
</html>
`;
fs.writeFileSync(path.join(root, 'privacy.html'), page);
console.log('privacy.html written');
