# bigcubesolver.com

The website of Big Cube Solver (Android). Plain HTML/CSS/JS, no build step;
GitHub Pages publishes every push to `main` at https://bigcubesolver.com.

| path | file |
|---|---|
| `/` | index.html |
| `/patterns` | patterns.html + patterns.json (the gallery: `{n, name, m}` each) |
| `/p?n=7&name=..&m=..` | p.html - a pattern link as the app shares it; the app opens these itself |
| `/faq` | faq.html - questions and answers |
| `/support` | support.html - support@bigcubesolver.com |
| `/test`, `/test-guide`, `/feedback` | tester pages (feedback.html redirects to the Google Form once FORM_URL is set) |
| `/privacy` | privacy.html (from privacy.md + i18n/privacy/) |
| `/.well-known/assetlinks.json` | lets Android open `/p` links straight in the app (`.nojekyll` keeps the folder) |

## Pages are GENERATED - edit src/ and i18n/, then build

**ALL 14 LANGUAGES ARE CURRENT (2026-11-11, owner: "translate the App and the
site to all 14 languages. English version is the master").** English stays the
master: every change starts in `src/` and `i18n/en.json`, and its translations
go into all 13 other `i18n/<lang>.json` (and `i18n/privacy/<lang>.md` when the
English part of privacy.md changes) in the same round. Then
`cp i18n/en.json i18n/en.translated.json` and `cp i18n/en.json i18n/es.translated.json`;
`check-i18n.js` lists the to-do (Spanish first, then the others) and must be
clean before a push. (Paused 2026-11-07 .. 2026-11-11, when only English and
Spanish were kept current.)

    node tools/check-i18n.js   # every language has every text, same links/tags
    node tools/build-site.js   # src/*.html + i18n/<lang>.json -> ./<page>.html

- `src/<page>.html`: templates. `<h1 t="key"></h1>` becomes one copy per
  language (`data-lang="xx"`), `{{HEADER:page}}`, `{{FOOTER}}`, `{{HEAD}}`,
  `{{JS:prefix}}` (texts for page scripts: `BcsLang.t(key, vars)`), `{{PRIVACY}}`.
- `i18n/<lang>.json`: every text, keyed; English is the source.
- Privacy: `privacy.md` (en + es, a copy of the app repo's docs/PRIVACY.md) and
  `i18n/privacy/<lang>.md` for the other 12 (translations; English prevails).
- 14 languages, menu order in tools/build-site.js (LANGS) and js/lang.js:
  en, es, then zh hi fr pt ru id de ja tr ko it pl (by number of speakers).
  `js/lang.js` picks one (?lang=, #xx, saved choice, browser) and css/site.css
  shows only that copy. Support answers in English and Spanish only (said on
  /support in every language).

`js/cube.js` is a small copy of the app's move engine (same notation), checked
against the engine by `node tools/check-cube.js <engine applier>`.

Keys in assetlinks.json: the Play upload key and the test (sideload) key.
The Play APP-SIGNING key was added 2026-11-09 (74:63:22:...:95:D7, read with
apksigner from the universal APK Play builds - App bundle explorer -> 427 ->
Downloads; the Console's "App signing" page was hard to find). All three
stay: app signing (Play installs), upload key, test key (sideloaded APKs).

## Community (Discord)
The invite lives in ONE place: `DISCORD` in tools/build-site.js (used as `{{DISCORD}}`). Printed material should point at https://bigcubesolver.com/community, never at the invite. New invite = change that line, `node tools/build-site.js`, commit, push.
