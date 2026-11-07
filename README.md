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
| `/privacy` | privacy.html, GENERATED from privacy.md by `node tools/build-privacy.js` |
| `/.well-known/assetlinks.json` | lets Android open `/p` links straight in the app (`.nojekyll` keeps the folder) |

## Languages (English, Spanish)

Every text is written once per language, marked `data-lang="en"` / `data-lang="es"`;
`js/lang.js` (loaded in `<head>`) picks one from `?lang=`, `#en`/`#es`, the
saved choice, or the browser, and `css/site.css` hides the others. Page
scripts that build text use `BcsLang.both({en, es})`. `<title data-es="..">`
gives the Spanish tab title. A new page: copy support.html.

## Header and footer

Shared by every page, defined ONCE in `tools/layout.js` (tabs, language
buttons, footer links). After editing it run `node tools/sync-layout.js`.

`js/cube.js` is a small copy of the app's move engine (same notation), checked
against the engine by `node tools/check-cube.js <engine applier>`.

Keys in assetlinks.json: the Play upload key and the test (sideload) key.
After the first Play upload, ADD the app-signing key from Play Console
(Setup -> App signing -> SHA-256).
