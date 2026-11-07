// The header and footer every page shares - edit them HERE, then run
//   node tools/sync-layout.js
// which rewrites the <header class="top"> and <footer> blocks of every page
// (build-privacy.js uses this module directly).
const NAV = [
  { id: 'home', href: '/', en: 'Home', es: 'Inicio' },
  { id: 'patterns', href: '/patterns', en: 'Patterns', es: 'Patrones' },
  { id: 'faq', href: '/faq', en: 'Q&amp;A', es: 'Preguntas' },
  { id: 'support', href: '/support', en: 'Support', es: 'Soporte' },
  { id: 'privacy', href: '/privacy', en: 'Privacy', es: 'Privacidad' },
];
const LANGS = [{ code: 'en', label: 'EN', name: 'English' }, { code: 'es', label: 'ES', name: 'Español' }];
const both = (en, es) => `<span data-lang="en">${en}</span><span data-lang="es">${es}</span>`;

// which nav entry a page file lights up
const PAGE_OF = { 'index.html': 'home', 'patterns.html': 'patterns', 'faq.html': 'faq', 'support.html': 'support', 'privacy.html': 'privacy' };

function header(page) {
  const links = NAV.map(n => `<a href="${n.href}"${n.id === page ? ' aria-current="page"' : ''}>${both(n.en, n.es)}</a>`).join('');
  const langs = LANGS.map(l => `<button type="button" data-set="${l.code}" lang="${l.code}" title="${l.name}">${l.label}</button>`).join('');
  return `<header class="top">
  <div class="wrap">
    <a class="brand" href="/"><img src="/img/icon-192.png" alt="" width="32" height="32"><span>Big Cube Solver</span></a>
    <nav>${links}</nav>
    <div class="langs" role="group" aria-label="Language / Idioma">${langs}</div>
  </div>
  <div class="stripe"><i></i><i></i><i></i><i></i><i></i><i></i></div>
</header>`;
}

function footer() {
  return `<footer>
  <div class="wrap">
    <span>© 2026 Big Cube Solver</span>
    <a href="/faq">${both('Q&amp;A', 'Preguntas')}</a>
    <a href="/support">${both('Support', 'Soporte')}</a>
    <a href="/privacy">${both('Privacy', 'Privacidad')}</a>
    <a href="mailto:support@bigcubesolver.com">support@bigcubesolver.com</a>
  </div>
</footer>`;
}

const LANG_SCRIPT = '<script src="/js/lang.js"></script>';

module.exports = { header, footer, both, PAGE_OF, LANG_SCRIPT };
