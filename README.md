# Scripture & Song — GitHub Pages starter

Functional **static** song-finder prototype. Searches multiple semicolon/comma separated passages, normalizes Bible book names, ranks direct Scripture relationships above thematic similarities, and filters/sorts results. No backend or API key required.

## Start locally

Run `python3 -m http.server 8000` from this directory and open http://localhost:8000 . Or deploy to GitHub Pages.

## Publish

1. Create a **public** GitHub repository and upload the contents of this folder, including `.github/workflows/pages.yml`.
2. Use the `main` branch.
3. Settings → Pages → Build and deployment → **GitHub Actions**. Pushing commits triggers deployment automatically.
4. Visit the Pages URL shown after the deployment succeeds.

## Data / caveats

`data/songs.json`: 50 **hand-curated starter examples**. No lyrics, sheet music, recordings, copyrighted thumbnails, or copied catalogs are included. Scripture relationships and authors are *editorial starter annotations, not verified provider metadata* and should be reviewed before production publication. Some arrangements or modern versions may carry separate rights.

`data/passage-themes.json`: selected Bible chapters mapped to broad themes. When a Bible chapter is not indexed, the app only finds direct associations. Passage intersections are simplified, especially for ranges spanning multiple chapters. Comma-separated entries must be complete references (no inferred book continuation).

**This is not a full-song database, and it does not yet auto-ingest new releases.** Importing third-party records requires source-specific permission/licensing and normalization. Hymnary documents a Scripture JSON endpoint, but its data reuse terms and CORS behavior need review before integrating or caching. SongSelect's catalog cannot simply be copied into this repository. A public repo means all embedded metadata is publicly downloadable.

## Data format

```json
{"title":"Example Song","author":"Example Author","type":"Contemporary","themes":["grace","faith"],"scriptures":["Ephesians 2:8-9"],"year":2025}
```

To add new releases manually, edit `data/songs.json` and commit. GitHub Pages publishes the new dataset. A future GitHub Actions cron can validate a **licensed** metadata feed and open review PRs weekly. Do not automatically scrape or republish provider catalogs without permission.

## Next production work

- Establish rights and permitted data usage with CCLI/SongSelect, Hymnary, publishers and other catalog owners.
- Build a normalized song ID map (`CCLI`, `hymnary`, provider source identifiers) and deduplication.
- Replace unverified editorial references with provenance-backed associations, confidence grades, and reviews.
- Extend thematic Bible index to every chapter; add passage-level semantics and optional verse text from a properly licensed source.
- Weekly feeds → staging → dedupe → editorial review → GitHub Actions build and deploy.
- Add user-curated sets, CSV exports, local favorites, and optional account-backed sync.

## Licensing

Prototype code may be reused. Song metadata and external service data have separate rights. External references are not endorsements. Review publication/rights claims independently.
