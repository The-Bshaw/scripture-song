#!/usr/bin/env python3
"""Apply editorially approved reviews from audit-reviews.json, with safeguards."""
import json,pathlib,re,urllib.parse
R=pathlib.Path(__file__).resolve().parents[1];p=R/'data/songs.json'; songs=json.loads(p.read_text()); reviews=json.loads((R/'audit-reviews.json').read_text());byid={s['id']:s for s in songs};applied=0
for r in reviews:
 if not r.get('approved',False):continue
 sid=r['id']; s=byid.get(sid)
 if not s or not s.get('wellLibrary'):raise ValueError('Unknown active-library song: '+sid)
 url=r.get('lyricSourceUrl','');u=urllib.parse.urlparse(url)
 if u.scheme!='https' or not u.hostname or u.hostname in ('open.spotify.com','spotify.com'):raise ValueError('Valid published lyric source URL required: '+sid)
 themes=r.get('primaryThemes',[]);secondary=r.get('secondaryThemes',[])
 if not 1<=len(themes)<=3 or not all(isinstance(x,str) and x.strip() and len(x)<60 for x in themes+secondary):raise ValueError('Invalid themes for '+sid)
 themes=[x.lower().strip() for x in themes];secondary=[x.lower().strip() for x in secondary]
 a={'status':'publisher-lyrics-reviewed','primaryThemes':themes,'secondaryThemes':secondary,'lyricSourceUrl':url,'auditNote':r.get('auditNote','Review completed by editorial team; see source.')} 
 s['lyricalAudit']=a;s['auditState']='source-reviewed';s['themeReviewStatus']='publisher-lyrics-reviewed';s['reviewStatus']='publisher-lyrics-reviewed';s['themes']=themes
 # Do not turn suggested Scripture associations into verified citations.
 s['scriptures']=[];s['scriptureConnections']=[]
 applied+=1
if applied:
 p.write_text(json.dumps(songs,indent=2,ensure_ascii=False)+'\n')
print('Applied',applied,'approved reviews')
