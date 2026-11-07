// Site language. Loaded in <head> (blocking, tiny) so the page paints in the
// right language at once. tools/build-site.js writes every text once per
// language, marked data-lang="xx"; css/site.css shows only the current one.
// Choice: ?lang=xx, else #xx (privacy links), else the saved choice, else the
// browser's languages, else English. Buttons with data-set="xx" switch it.
(function () {
  var LANGS = ['en', 'es', 'zh', 'hi', 'fr', 'pt', 'ru', 'id', 'de', 'ja', 'tr', 'ko', 'it', 'pl'];
  var html = document.documentElement, want = null;
  var ok = function (l) { return LANGS.indexOf(l) >= 0; };
  try { want = new URLSearchParams(location.search).get('lang'); } catch (e) {}
  if (!ok(want) && /^#[a-z]{2}$/.test(location.hash)) want = location.hash.slice(1);
  if (!ok(want)) { try { want = localStorage.getItem('lang'); } catch (e) {} }
  if (!ok(want)) {
    var prefs = navigator.languages || [navigator.language || 'en'];
    for (var i = 0; i < prefs.length && !ok(want); i++) want = String(prefs[i]).slice(0, 2).toLowerCase();
    if (!ok(want)) want = 'en';
  }
  var titleEl = null, enTitle = null, dict = {};
  function set(l) {
    html.lang = l;
    try { localStorage.setItem('lang', l); } catch (e) {}
    titleEl = titleEl || document.querySelector('title');
    if (titleEl && !titleEl.hasAttribute('data-dynamic')) {
      if (enTitle === null) enTitle = titleEl.textContent;
      document.title = titleEl.getAttribute('data-' + l) || enTitle;
    }
    var bs = document.querySelectorAll('[data-set]');
    for (var i = 0; i < bs.length; i++) bs[i].setAttribute('aria-selected', String(bs[i].getAttribute('data-set') === l));
    var ev; try { ev = new Event('langchange'); } catch (e) { ev = document.createEvent('Event'); ev.initEvent('langchange', true, true); }
    document.dispatchEvent(ev);
  }
  set(want);
  document.addEventListener('DOMContentLoaded', function () {
    set(html.lang);
    var bs = document.querySelectorAll('[data-set]');
    for (var i = 0; i < bs.length; i++) bs[i].addEventListener('click', function () {
      set(this.getAttribute('data-set'));
      var d = this.closest && this.closest('details'); if (d) d.open = false;
    });
    // the language list closes on a tap outside it or on Escape
    document.addEventListener('click', function (e) {
      var open = document.querySelectorAll('details.langs[open]');
      for (var i = 0; i < open.length; i++) if (!open[i].contains(e.target)) open[i].open = false;
    });
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      var open = document.querySelectorAll('details.langs[open]');
      for (var i = 0; i < open.length; i++) open[i].open = false;
    });
  });
  function fill(s, vars) { return String(s).replace(/\{(\w+)\}/g, function (m, k) { return vars && vars[k] !== undefined ? vars[k] : m; }); }
  // page scripts: BcsLang.t(key, vars) -> HTML with one span per language
  // (the CSS shows the current one); BcsLang.text(key, vars) -> plain text now
  window.BcsLang = {
    current: function () { return html.lang; },
    add: function (d) { for (var k in d) dict[k] = d[k]; },
    t: function (key, vars) {
      var d = dict[key] || {}, out = '';
      for (var i = 0; i < LANGS.length; i++) {
        var l = LANGS[i], s = d[l] !== undefined ? d[l] : d.en;
        out += '<span data-lang="' + l + '" lang="' + l + '">' + fill(s, vars) + '</span>';
      }
      return out;
    },
    text: function (key, vars) { var d = dict[key] || {}; return fill(d[html.lang] !== undefined ? d[html.lang] : d.en, vars); }
  };
})();
