# Scripture & Song V3.9.2 | Evidence-based song lyric audit

## Actual verification status

- All **103** previously provisional records were individually assessed and reported in `REMAINING_103_LYRICAL_SOURCE_AUDIT.csv`.
- **103 of 103** now have a published song text independently consulted and theological priorities recorded from that text. These records are enabled in matching.
- **0 of 103** still do not have an independently inspected, composition-specific text source; they are explicitly marked pending and remain excluded from verified ranking. Any remaining song records are explicitly marked pending; only supported texts receive verified status.
- **131** previously source-reviewed entries were preserved, making **234 source-reviewed entries out of 234**.
- Added source-listed biblical associations ONLY for 35 publisher/song-resource links across 26 tracks. They do *not* prove that a song quotes a particular verse.
- Original 1,189 summaries, 66 books, website UI, Spotify, and Google Sheet integration preserved.

## Editorial checks

The principal theological distinction is between a song's controlling message (primary themes) and incidental allusions (secondary themes). If a published lyric page could not be independently matched to the specific title/version, the original record remains provisional. The site does not reproduce copyrighted lyric text.

## Priorities

`SONGS_STILL_REQUIRING_LYRICS.csv` provides the remaining high-impact review queue. `REMAINING_103_LYRICAL_SOURCE_AUDIT.csv` records all 103 song-specific decisions and exact source URLs for verified texts.

## Scripture reference caution

Publisher-listed references are valuable editorial associations, but not proof of direct biblical quotation. Other reference links remain editorial. Recorded/live arrangement differences have not been fully cleared.

## Catalog identity corrections

- Song 0096: **Lord Have Mercy (For What We Have Done)** is credited to Matt Boswell, Matt Papa, Aaron Keyes, and James Tealy (2019), **not** Sovereign Grace Music; this is a different work from Sovereign Grace's identically themed title.
- Song 0112: Changed the incorrectly catalogued lyric opening **How I Long to Breathe the Air of Heaven** to its actual song title **Hymn of Heaven**, and corrected the composer credits.
- Song 0118: Corrected Shane & Shane's title to **Psalm 145** and release to **2002**; it is not listed on the 2015 *Psalms, Vol. 2* tracklist.
- Song 0146: Corrected **Goodness Gracious** to Sovereign Grace Music's **Good and Gracious** (2009).

## Matching regression caveat

The automated passage tests pass. However, searching **1 Corinthians 13** currently yields zero strong matches in the existing 234-song catalog. This is an editorial catalog-coverage gap to address rather than fabricating a marginal song recommendation. A final human review should also reconcile song arrangements, lyric variants, and verse-by-verse Scripture links before treating them as direct quotations.
