# Scripture & Song V3.9.0 — Better Song Matching

This release improves the **quality and transparency of recommendations**. All previously indexed Bible summaries and song records remain intact.

## What's new

1. **Primary-theme-first relevance ranking.** The engine prioritizes the dominant theological subjects in a song over supporting mentions. It caps scores for multiple broad themes so generic overlaps do not overwhelm a clear match.
2. **Passage-section matching.** 66 editorial focus sections (in `data/passage-focus.json`) distinguish selected verse ranges within a chapter, e.g., Ephesians 2:1–10 (grace/salvation) versus Ephesians 2:11–22 (reconciliation/unity). Other ranges fall back to chapter themes. These are editorial interpretations, not exhaustive verse-level analysis.
3. **Evidence-sensitive matching.** Source-linked or direct Scripture associations are treated differently from editorial references. Unverified editorial parallels are always labeled as such. An editorial association cannot be misrepresented as verified lyric dependence.
4. **Explanations on song cards.** Recommendations now show the match type, matching primary themes, and any recorded Scripture reference. Verse-only searches identify when a match rests on broader chapter themes.
5. **Contemporary songs first for otherwise similar relevance.** Adds a small contemporary-song scoring preference while preserving the site's The Well library-first display and all filters.
6. **Regression testing.** `scripts/test_matching_quality.js` tests multiple representative passages and verse-level differentiation. Run with `node scripts/test_matching_quality.js`.

## Representative query behavior

- **Ephesians 2:1–10:** Grace and salvation songs take priority.
- **Ephesians 2:11–22:** Unity, reconciliation, and peace rise instead.
- **John 15:4–5:** “Abide” is ranked first.
- **Psalm 150:** Praise-focused songs are returned, without requiring specific word overlap on generic themes alone.
- **Isaiah 53:** Songs about the cross and atonement dominate.
- **Revelation 19:11–21:** Songs about the reign of Christ and God's justice are emphasized over unrelated resurrection songs.

## Catalog status and limitations

- The catalog contains **234 song entries**: 117 from The Well and 117 additional entries. This release does not claim the extra songs have been newly lyric-verified.
- The catalog's existing references include both corroborated Scripture associations and **unverified editorial parallels**. The engine only classifies what the source data documents. All new passage-focus labels are editorial, requiring final human/Scripture review.
- **66 curated passage sections** are a starting point, not complete verse-by-verse coverage. All 1,189 chapter themes and summaries remain indexed.
- No song lyrics or copyright-protected sheet music were copied into the package.
- Existing Google Sheets synchronization, Spotify players, custom styling, and the original song catalog are preserved.

## Publishing

Extract this ZIP into the root of your local GitHub repository, replacing matching files. Commit and push through GitHub Desktop. The existing GitHub Pages deployment will publish the update.
