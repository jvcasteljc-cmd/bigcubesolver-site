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
After the first Play upload, ADD the app-signing key from Play Console
(Setup -> App signing -> SHA-256).
