# Scripture & Song — Version 2

A contemporary-first, static Scripture-to-song discovery engine for GitHub Pages.

## What's in Version 2

- **162 editorial song entries**, contemporary-first, with historic hymns included. Expanded from 51 in V1.
- **180 Bible chapters** with broad, manually selected thematic annotations, expanded from 50 in V1.
- Scripture search for semicolon/comma-separated references, chapter ranges, verse ranges, and cross-chapter references.
- Basic relevance scoring using overlap with editorial Scripture associations and shared chapter themes. Contemporary songs win only small score ties.
- Contemporary/hymn filters, keyword filter (title, credited artist, themes), alphabetical/newest sorting, copy-title links and shareable passage URLs.
- No lyrics, chord charts, audio files, images, or sheet music are hosted.

## Important limitations

**This is a curated prototype, not a verified or complete worship catalog.** Artist/writer attribution, release-year fields and thematic associations are preliminary editorial entries, not official licensed metadata. An editorial Scripture association does **not** necessarily mean a song explicitly quotes that verse. The link badges deliberately do not say "direct quotation." Entries are not guaranteed to be the original song version or all writer credits; duplicate arrangements and song-title variants still need editorial consolidation.

180 indexed chapters is **not** verse-by-verse coverage, and the lookup currently assigns the full chapter's themes even for a single verse. This can introduce false positive results. Chapters not listed in `data/passage-themes.json` do not yet have thematic results, unless a song has an editorial Scripture link for that chapter.

This project **does not automatically ingest new songs**. An authorized metadata feed, source-specific reuse terms, quality control, and a staging/review process must be established before a scheduled import is appropriate. Do not use unlicensed lyrics or scrape/republish third-party catalogs without permission.

## Update the existing GitHub Pages site (The-Bshaw/scripture-song)

1. Download and unzip `scripture-song-engine-v2.zip`.
2. Open your GitHub repository, https://github.com/The-Bshaw/scripture-song .
3. Upload or replace these **five** files at the repository root (not inside another folder):
   - `index.html`
   - `styles.css`
   - `app.js`
   - `data/songs.json`
   - `data/passage-themes.json`
4. Also replace `README.md` if you want these instructions in GitHub.
5. Commit the changes. GitHub Pages already configured as **Deploy from branch → main → /(root)** will publish the new version automatically; no `.github` workflow is required.

**Note:** GitHub's browser upload view can reject an uploaded file with the same path as an existing file. If so, open each existing file, use the pencil editor, replace its content, and commit. For larger JSON files, GitHub Desktop or git command-line upload is simpler and more reliable than browser pasting.

### Local preview

```bash
cd scripture-song-engine-v2
python3 -m http.server 8000
```

Then open http://localhost:8000/ . Opening `index.html` directly with a `file://` URL will not load the JSON data in many browsers.

## Data model

`data/songs.json`: `{id, title, author, type, themes, scriptures, year, reviewStatus, source}`. `scriptures` holds **unverified editorial passage associations**. `themes` holds broad editorial concepts, not copied song lyrics.

`data/passage-themes.json`: `"Book chapter": ["theme", ...]`.

A future production model should split songs, credited writers, recordings, source provenance, Scripture links, editorial verification, and deduplication IDs into separate entities.

## Research and authoritative catalog discovery

- Worship Together song finder, themes, and new releases: https://www.worshiptogether.com/song-search/ and https://www.worshiptogether.com/lists/
- PraiseCharts 2026 release discovery list (as of 2026-10-26): https://www.praisecharts.com/song-lists/top-new-worship-songs-of-2026
- CCLI SongSelect: https://songselect.ccli.com/
- Hymnary: https://hymnary.org/

References are for editorial research; they are not authorization to redistribute their databases. Current V2 additions are manually curated examples and are not a scraped provider export.

## Next steps

1. Review artist credits, canonical song identity, dates, and theological/specific passage links.
2. Build explicit passage-level mapping with provenance and a `verified / probable / theme-only` status.
3. Expand and validate biblical chapter/verse taxonomy.
4. Research approved API, feed or licensing pathways and ingest into a staging branch.
5. Add automated validation tests and human editorial review before weekly publication.

## Version 2.1 changes
- Montserrat font throughout, increased body and small-text contrast.
- Replaced large hero heading with prominent supporting description.
- Main search supports Scripture references, matching topics/themes, or semicolon-separated combinations (e.g. `Romans 8; grace`).
- Topic searches match the curated theme labels and common synonyms; unmatched topics are disclosed.
