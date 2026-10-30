# V3.5.1 Preview and Hero Fix

- Hero text and search now float on the darkened photo, with no panel.
- Updated stylesheet cache key to prevent older cached hero design.
- For local Finder preview (`file://`), `data/local-preview.js` supplies a snapshot so browser JSON fetch restrictions do not block searches.
- On GitHub Pages (`https://`), the app still fetches live `data/songs.json` and `data/passage-themes.json`, so the Google Sheet synchronization remains the source of truth.
- The sync workflow refreshes the local preview snapshot on every update.
- Ensure you copy ALL files including `data/`, `assets/`, and `.github/` to the repository root.
- If the error still appears on the published https site, verify both JSON files are reachable at their site URLs and inspect browser console for failed requests.
