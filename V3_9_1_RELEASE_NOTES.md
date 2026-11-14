# Scripture & Song V3.9.1 — Lyrical Audit

## Scope and honest verification status

- **234 of 234 catalog entries** have an individual inventory/audit ledger row.
- **117** songs carry *earlier* published lyric-source reviews inherited from the existing project. They have **not** been independently rechecked in this release.
- **14** historical hymn texts were independently compared with published hymn text sources in this release; primary/secondary themes were refined to reflect the complete representative text.
- **103** additional songs are **provisional**, without independently inspected full published lyrics. Their suggested themes are not certified.
- This is **not** a claim that 234 full lyrical reviews have been completed: only the new checked texts were verified during this pass. A Scripture citation is not validated simply because song themes are supported by a source.

## Quality findings

1. **Source provenance is not the same as Scripture dependence.** A hymn may be theologically consistent with a verse without quoting or paraphrasing that verse. Most links remain editorial parallels.
2. **Recorded versions and text variants matter.** Traditional hymns may omit stanzas, while modern versions may add bridges or change verses. The audit of a representative text must be followed by an arrangement-specific confirmation before claiming a live recording is identical.
3. **Primary-theme inflation hurts results.** Some titles describe an image, such as dry bones or spiritual warfare, while a song's principal message may be resurrection, God's presence, or assurance. Only source-supported primary themes should outweigh secondary ones.
4. **Duplicate recordings and compositions** may appear under different titles and artists. Keep their recordings separate where desired, but avoid treating them as independently documented theology without checking the version.
5. **Specific textual references have greater value than broad editorial parallels.** Newly source-linked hymn associations are limited to cases directly mentioned in the inspected source notes; remaining references retain their lower editorial confidence.

## Artifacts

- `SONG_BY_SONG_THEOLOGICAL_AUDIT.csv`: 234 individual rows: evidence provenance, thematic assessment, Scripture confidence, and actionable verification notes.
- `data/song-audit-ledger.json`: same review ledger in a machine-readable form.
- `data/songs.json`: source-backed refinements for 14 hymns only, preserving all existing catalog data and prior source reviews.
- `V3_9_1_RELEASE_NOTES.md`: release summary and publication instructions.

## Priority for continued checking

Review the remaining provisional additional songs from the original source, ideally starting with the modern songs ranked most often in a passage search, and match the correct track or CCLI number. Next, audit individual Scripture references for each song against the text, keeping direct textual dependence, hymnal/publisher Scripture associations, and editorial theological parallels separate. Do not copy copyrighted lyrics into the repository.

## Citation trail

Each newly verified historical hymn lists the exact Hymnary source URL in the CSV/JSON and `data/songs.json`. The previous 117 lyric references also retain their original publisher or hymn-source URLs. Published source texts were consulted for theological classification, not reproduced in this release.
