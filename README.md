# Scripture & Song V3.2 — Google Sheet auto-sync

Version 3.2 keeps the **117-song reviewed The Well library first**, preserves Scripture associations, and adds **26 Spotify links supplied by The Well**. The new GitHub Action reads new titles, categories and hyperlink URLs from your existing spreadsheet every 15 minutes (best effort). **No paid server is required.**

## Setup (one time)

1. Open the ORIGINAL **Songs at The Well** Google Sheet. Select **Extensions → Apps Script**.
2. Replace the Apps Script editor's content with **`google-apps-script/Code.gs`**, save. If you already have scripts for something else in this spreadsheet, create a new script file instead of deleting existing functions.
3. Open **Project Settings → Script properties → Add script property**. Name it `SYNC_TOKEN`. Give it a private random token of at least 24 characters. You'll paste the same token into GitHub later. **Never paste the token into your repository or share screenshots showing it.**
4. Select **Deploy → New deployment → Web app**, **Execute as: Me**, **Who has access: Anyone**. Authorize it and copy the Web App URL ending in `/exec`. This endpoint requires the token, and it exports **only the song titles, four categories, and Spotify track links** from columns A–D. Other sheet columns are not sent. If your Workspace account does not allow Anyone web-app deployment, you will need an alternative private integration.
5. Upload all the V3.2 files to your `The-Bshaw/scripture-song` repository, keeping `.github/workflows/sync-the-well.yml`. Ensure GitHub Pages is still using **Deploy from a branch: `main` / `(root)`**.
6. Under **GitHub → Settings → Secrets and variables → Actions**, create two **Repository secrets**:
   - `SHEET_SYNC_URL`: your entire Apps Script Web App `/exec` URL
   - `SHEET_SYNC_TOKEN`: the exact token from Script properties
7. Under **GitHub → Settings → Actions → General → Workflow permissions**, allow **Read and write permissions** so the sync can commit `data/songs.json`.
8. Under **Actions → Sync The Well Songs → Run workflow**, run it once. Verify it completes. After that, it automatically runs at :07, :22, :37, and :52 UTC each hour (GitHub may delay scheduled workflows).

## Sheet usage

- Active songs are in **columns A-D**: Global, Ancient, Heritage, Advent. Row 1 is headings.
- Insert a song name in a cell. Highlight the **entire title**, press Command+K, paste the **Spotify TRACK link** (not album, artist or playlist links).
- The sync can extract standard rich-text links and literal `=HYPERLINK("https://open.spotify.com/track/...", "Title")` formulas.
- Moving a song between categories updates membership. Removing a song demotes it into Additional Songs so editorial research isn't destroyed. If you instead want removals to disappear entirely, adjust the sync policy.
- **Existing theological mappings are preserved.** New titles show in the library, with `pending-theological-review` status and *no invented* themes/Scriptures. They can be found by title; **they won't appear under a theme such as Hope until a reviewed thematic connection is added**.
- Sync checks every 15 minutes, but GitHub Actions may be delayed; deployment can take more time. This is not immediate live sync.

## Safety and limitations

- Apps Script Web App is reachable by anyone with its URL but requires your private token for data. It uses a restricted output schema. Keep token private and rotate if exposed. App Script `ContentService` may redirect HTTP requests to Google content hosts; the Python client follows redirects.
- Existing Spotify links from our identification batches are preserved when a sheet cell has no Spotify link. Adding a link in the sheet updates it (with `recordingNeedsReview` flag if changed).
- If the endpoint fails, authentication fails, fewer than 50 songs are returned, categories are invalid, or duplicate titles cross categories, the workflow fails **without modifying the repository**.
- App Script endpoint is for syncing active music list only. Spotify links are recording references, not licenses or automatically analyzed song lyrics. New songs need editorial tagging in `data/songs.json` after each sync; existing reviews survive.
- The sync script uses title-based identity; if two different compositions share exactly the same title within a category, the model will need unique song IDs in the sheet. The current script rejects cross-category duplicate titles to avoid silently confusing songs.
- GitHub's web uploader may skip hidden `.github` folders; confirm the workflow file is actually present. Use GitHub Desktop if easier.

## Contents

- `google-apps-script/Code.gs` — read-only, token-protected Google Sheet endpoint
- `scripts/sync_google_sheet.py` — safely merge library membership + Spotify URLs into site catalog
- `.github/workflows/sync-the-well.yml` — 15-minute scheduled sync
- `data/songs.json` — existing reviewed data and Spotify references
- `data/passage-themes.json` — existing chapter index
- `theological-review.csv` — previously reviewed audit notes

This release does **not** edit your original Google Sheet and does **not** automatically verify new lyrics or theology.
