#!/usr/bin/env python3
"""Generate a transparent queue from the active song library; safe to run at every sync."""
import pathlib,json,csv,io
R=pathlib.Path(__file__).resolve().parents[1]
songs=json.loads((R/'data/songs.json').read_text())
rows=[]
for s in sorted([x for x in songs if x.get('wellLibrary')],key=lambda s:(s.get('wellCategory',''),s['title'].lower())):
 a=s.get('lyricalAudit') or {};done=s.get('auditState')=='source-reviewed' and bool(a.get('lyricSourceUrl'))
 rows.append({'id':s['id'],'category':s.get('wellCategory',''),'title':s['title'], 'spotify_url':s.get('spotifyUrl',''),'audit_status':'source-reviewed' if done else 'needs-lyric-evidence', 'source_url':a.get('lyricSourceUrl',''), 'verified_primary_themes':'; '.join(a.get('primaryThemes',[]) if done else []),'verified_secondary_themes':'; '.join(a.get('secondaryThemes',[]) if done else []),'provisional_themes_not_for_search':'; '.join(s.get('provisionalThemes',[])), 'provisional_scriptures_not_for_search':'; '.join(s.get('provisionalScriptures',[])), 'next_action':'Confirm recording, inspect authorized publisher lyrics, record 1-3 primary themes and evidence URL' if not done else 'Check Scripture connections independently'})
path=R/'audit-queue.csv'
with path.open('w',newline='') as f:
 w=csv.DictWriter(f,fieldnames=list(rows[0]) if rows else ['id']);w.writeheader();w.writerows(rows)
print('Audit queue:',len(rows),'active songs,',sum(r['audit_status']=='source-reviewed' for r in rows),'source reviewed; pending',sum(r['audit_status']!='source-reviewed' for r in rows))
