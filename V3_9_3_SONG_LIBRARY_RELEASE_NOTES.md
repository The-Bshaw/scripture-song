# Scripture & Song V3.9.3 — Song Library page

- Top-right masthead wording and version removed; replaced with Song Search and Song Library links, active state and mobile handling.
- `song-library.html` organizes the entire Songs at The Well sheet catalog by Global, Ancient, Heritage, Advent, and Shelved. Cards appear alphabetically left-to-right in three desktop columns, two tablet columns, and one mobile column.
- Inline lazy-loading Spotify track embeds display when the sheet supplies a track URL. Tracks lacking IDs show a clear placeholder and Spotify search shortcut. Spotify controls and available clip lengths are determined by Spotify.
- The connected sheet contained 68 Global, 24 Ancient (excluding one placeholder), 15 Heritage (excluding two placeholders), 10 Advent, and 8 Shelved titles on November 14, 2026. The initial local snapshot now contains 125 Well songs including Shelved.
- Updated the Apps Script to include column F (Shelved), excluding column E (new song considerations), and the GitHub sync script to accept Shelved entries. Existing GitHub Actions schedule remains the same; redeploy the updated Apps Script and run an authorized sync to refresh the live Google Sheet catalog.
- Spotify links have been updated for 34 tracks found in the live Sheet, where valid. The Sheet presently has 35 links, one to an album rather than a track: it cannot be embedded as a track preview without choosing a specific recording. Most songs do not have individual Spotify track links; they remain visible with a pending-preview placeholder.
- Shelved songs are visible in Song Library but excluded from song-search recommendations.
- Preserves the Scripture search logic, 1,189 chapter coverage, supporting assets, and published song theology.
