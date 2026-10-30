# Evidence-based lyrical audit and ongoing song intake

## Honest status
All 117 active songs are inventoried and triaged. **Only 17 currently have source-backed lyrical reviews; 100 still require source examination.** Preliminary theme and Scripture suggestions on those 107 songs are preserved but **excluded from matching** until approved. This is not a claim of 117 verified lyric audits.

## Workflow for every newly added song
1. Add the title under Global, Ancient, Heritage, or Advent in the existing Google Sheet. Hyperlink the **whole title** to the exact Spotify track.
2. Every ~15 minutes GitHub Actions imports membership and Spotify URL. New songs are immediately available by **title**, but not by themes or Bible passage until reviewed.
3. The same Action regenerates `audit-queue.csv`, listing all active songs and their review statuses. Filter its `audit_status` column for `needs-lyric-evidence`.
4. Identify the correct recording/composition; locate a legally accessible publisher/author lyric page. Read the full lyrics **on the source site** and record 1–3 primary themes and optional secondary themes. Do not paste copyrighted lyrics into this repository.
5. Add an entry to `audit-reviews.json` (use the exact song `id`) with `approved: true`, `lyricSourceUrl`, `primaryThemes`, `secondaryThemes` and an `auditNote`, then run `python scripts/apply_audit.py` followed by `python scripts/generate_audit_queue.py`, commit and push.
6. Scripture references need a **separate** assessment: only add verse references to `scriptures` after validating the relationship with published song text. Distinguish quotations, paraphrases and theological parallels, and retain citations. The review importer intentionally does not create Scripture citations.

## Example review entry (replace placeholder fields, never approve without inspecting source)
```json
[
  {
    "id": "well-003",
    "approved": false,
    "lyricSourceUrl": "https://publisher.example/song/lyrics",
    "primaryThemes": ["dependence", "prayer"],
    "secondaryThemes": ["faithfulness"],
    "auditNote": "Repeated chorus and verses center on prayerful dependence."
  }
]
```

## Operational cautions
- The source workbook alone does not contain full lyrics. Spotify links identify recordings, but do not provide licensed full lyric texts or reliable theological analysis.
- The sync script matches songs by normalized title. Multiple compositions with the same title need a stable unique identifier before review data can be safely associated.
- When the linked Spotify track changes, the sync invalidates the prior lyric review and queues that song for re-review.
- Any live Google Sheet changes must not be overwritten by a local ZIP: pull latest `main` with GitHub Desktop before replacing files.
- Review status is inspectable in `audit-queue.csv`. The review action is editorial and is **not automatically performed by GitHub Actions**. For fully automatic analysis, an authorized lyrics provider/API and an external inference service with secret credentials would be required, plus human oversight.
