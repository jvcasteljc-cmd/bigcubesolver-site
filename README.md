# bigcubesolver.com

The website of Big Cube Solver (Android). Plain HTML/CSS/JS, no build step;
GitHub Pages publishes every push to `main` at https://bigcubesolver.com.

| path | file |
|---|---|
| `/` | index.html |
| `/patterns` | patterns.html + patterns.json (the gallery: `{n, name, m}` each) |
| `/p?n=7&name=..&m=..` | p.html - a pattern link as the app shares it; the app opens these itself |
| `/privacy` | privacy.html, GENERATED from privacy.md by `node tools/build-privacy.js` |
| `/.well-known/assetlinks.json` | lets Android open `/p` links straight in the app (`.nojekyll` keeps the folder) |

`js/cube.js` is a small copy of the app's move engine (same notation), checked
against the engine by `node tools/check-cube.js <engine applier>`.

Keys in assetlinks.json: the Play upload key and the test (sideload) key.
After the first Play upload, ADD the app-signing key from Play Console
(Setup -> App signing -> SHA-256).
