// Site language. Loaded in <head> (blocking, tiny) so the page paints in the
// right language at once. Every text exists once per language, marked
// data-lang="en" / data-lang="es"; css/site.css shows only the current one.
// Choice: ?lang=xx, else #en/#es (privacy links), else the saved choice,
// else the browser's language. Buttons with data-set="xx" switch it.
// To add a language: add its code to LANGS, its data-lang texts, and a button
// in tools/layout.js.
(function () {
  var LANGS = ['en', 'es'];
  var html = document.documentElement, want = null;
  try { want = new URLSearchParams(location.search).get('lang'); } catch (e) {}
  if (!want && /^#(en|es)$/.test(location.hash)) want = location.hash.slice(1);
  if (!want) { try { want = localStorage.getItem('lang'); } catch (e) {} }
  if (LANGS.indexOf(want) < 0) {
    var nav = (navigator.languages && navigator.languages[0]) || navigator.language || 'en';
    want = LANGS.indexOf(nav.slice(0, 2).toLowerCase()) >= 0 ? nav.slice(0, 2).toLowerCase() : 'en';
  }
  var titleEl = null, titles = {};
  function set(l) {
    html.lang = l;
    try { localStorage.setItem('lang', l); } catch (e) {}
    titleEl = titleEl || document.querySelector('title');
    if (titleEl) {
      if (!titles.en) titles.en = titleEl.textContent;
      var t = titleEl.getAttribute('data-' + l) || titles.en;
      if (!titleEl.hasAttribute('data-dynamic')) document.title = t;
    }
    var bs = document.querySelectorAll('[data-set]');
    for (var i = 0; i < bs.length; i++) bs[i].setAttribute('aria-pressed', String(bs[i].getAttribute('data-set') === l));
  }
  set(want);
  document.addEventListener('DOMContentLoaded', function () {
    set(html.lang);
    var bs = document.querySelectorAll('[data-set]');
    for (var i = 0; i < bs.length; i++) bs[i].addEventListener('click', function () { set(this.getAttribute('data-set')); });
  });
  // for page scripts that build text: BcsLang.both({en: '..', es: '..'}) -> two spans
  window.BcsLang = {
    current: function () { return html.lang; },
    both: function (t) { return '<span data-lang="en">' + t.en + '</span><span data-lang="es">' + t.es + '</span>'; }
  };
})();
