from pathlib import Path
import json
root=Path(__file__).resolve().parents[1]
songs=json.loads((root/'data/songs.json').read_text())
themes=json.loads((root/'data/passage-themes.json').read_text())
(root/'data/local-preview.js').write_text('window.SCRIPTURE_SONG_PREVIEW='+json.dumps({'songs':songs,'themes':themes},ensure_ascii=False,separators=(',',':'))+';\n')
