# Scripture & Song V3.9.5 — Direct-Play Library

- Connected the six collection tabs and compact search on one centered desktop row.
- Increased desktop tab labels from 12px to 14px (+2px) and narrowed search to 188px.
- Added one reusable Spotify iFrame API controller for song playback, pause, resume, and switching tracks from the circular play button.
- No Spotify player appears inside the song cards. When the browser or Spotify blocks autoplay, a compact fallback appears at the bottom-right with native playback controls.
- Only source-verified linked Spotify track IDs can be played; songs without a track link still show a Spotify search link.
- The browser and Spotify control preview access. Automatic playback is not guaranteed; Spotify may not emit playback for some tracks or browsers.
- Existing Google Sheets sync, song data, scripture summaries and matching engine are unchanged.
