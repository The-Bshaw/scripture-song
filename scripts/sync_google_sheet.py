#!/usr/bin/env python3
"""Sync active Well library from Apps Script without overwriting song theology."""
import json, os, pathlib, re, sys, urllib.request, unicodedata
ROOT=pathlib.Path(__file__).resolve().parents[1]
SONGS=ROOT/'data'/'songs.json'
CATS={'Global','Ancient','Heritage','Advent'}
MIN_SONGS=50

def norm(s):
    return re.sub(r'[^a-z0-9]','',unicodedata.normalize('NFKD',s.casefold()).encode('ascii','ignore').decode())

def spotify(url):
    if not isinstance(url,str): return ''
    m=re.fullmatch(r'https://open\.spotify\.com/track/([A-Za-z0-9]{22})(?:[/?#].*)?',url.strip())
    return 'https://open.spotify.com/track/'+m.group(1) if m else ''

def main():
    endpoint=os.environ.get('SHEET_SYNC_URL','').strip()
    secret=os.environ.get('SHEET_SYNC_TOKEN','').strip()
    if not endpoint.startswith('https://script.google.com/') or not secret:
        raise RuntimeError('Add SHEET_SYNC_URL and SHEET_SYNC_TOKEN as GitHub Actions secrets.')
    req=urllib.request.Request(endpoint, data=json.dumps({'token':secret}).encode('utf-8'),headers={'Content-Type':'text/plain;charset=utf-8'},method='POST')
    with urllib.request.urlopen(req,timeout=45) as response:
        payload=json.load(response)
    if not isinstance(payload,dict) or payload.get('ok') is not True or payload.get('schemaVersion')!=1:
        raise RuntimeError('Sheet endpoint did not return authenticated library data.')
    rows=payload.get('songs')
    if not isinstance(rows,list) or not (MIN_SONGS<=len(rows)<=2500):
        raise RuntimeError('Unexpected active library size. Refusing to overwrite the site catalog.')
    clean={}
    for row in rows:
        if not isinstance(row,dict):raise RuntimeError('Malformed song row')
        title=row.get('title','').strip() if isinstance(row.get('title'),str) else ''
        cat=row.get('category')
        if not title or len(title)>180 or cat not in CATS: raise RuntimeError('Invalid song title or category')
        key=norm(title)
        if not key: raise RuntimeError('Blank normalized title')
        # A title must occupy only one active category; resolve conflicts in the sheet first.
        if key in clean:
            if clean[key]['category']!=cat: raise RuntimeError(f'Duplicate in different categories: {title}')
            if row.get('spotifyUrl') and not clean[key].get('spotifyUrl'):clean[key]['spotifyUrl']=row['spotifyUrl']
        else: clean[key]={'title':title,'category':cat,'spotifyUrl':spotify(row.get('spotifyUrl',''))}
    existing=json.loads(SONGS.read_text())
    if not isinstance(existing,list): raise RuntimeError('Invalid existing songs.json')
    oldwell={norm(s['title']):s for s in existing if s.get('wellLibrary')}
    outside=[s for s in existing if not s.get('wellLibrary')]
    new=[]
    for key,row in clean.items():
        if key in oldwell:
            s=oldwell[key].copy()
            s['title']=row['title'];s['wellCategory']=row['category'];s['wellLibrary']=True
            # Existing reviewed Spotify recording survives until the sheet explicitly links a new one.
            if row['spotifyUrl']:
                if s.get('spotifyUrl')!=row['spotifyUrl']:
                    s['spotifyUrl']=row['spotifyUrl'];s['recordingReference']='linked-from-google-sheet'
                    s['recordingNeedsReview']=True
            new.append(s)
        else:
            # If an existing external song is added to The Well, reuse its original editorial fields.
            match=next((s for s in outside if norm(s['title'])==key),None)
            if match:
                s=match.copy();outside.remove(match)
                s.update({'title':row['title'],'wellLibrary':True,'wellCategory':row['category']})
                if row['spotifyUrl']:s['spotifyUrl']=row['spotifyUrl'];s['recordingReference']='linked-from-google-sheet';s['recordingNeedsReview']=True
                new.append(s)
            else:
                # New titles are searchable by title in the library, but require theology before theme ranking.
                new.append({'id':'well-sheet-'+key[:65], 'title':row['title'],'author':'',
                    'type':'Hymn' if row['category']=='Ancient' else 'Contemporary',
                    'themes':[],'scriptures':[],'scriptureConnections':[],
                    'wellLibrary':True,'wellCategory':row['category'],
                    'spotifyUrl':row['spotifyUrl'],'recordingReference':'linked-from-google-sheet' if row['spotifyUrl'] else '',
                    'reviewStatus':'pending-theological-review','reviewNote':'New song from Google Sheet; theme and Scripture matching pending.',
                    'scriptureBasis':'No Scripture references verified or assigned yet.',
                    'source':'Songs at The Well (Google Sheets sync)'})
    # Demoted songs remain discoverable as additional music; preserve their theological annotations.
    for key,s in oldwell.items():
        if key not in clean:
            demoted=s.copy();demoted['wellLibrary']=False;demoted['wellCategory']=None
            demoted['source']='Previously in Songs at The Well'
            outside.append(demoted)
    # Avoid duplicate IDs when a newly moved song already existed in the broader catalog.
    merged=new+outside
    ids=[s['id'] for s in merged]
    if len(ids)!=len(set(ids)):raise RuntimeError('Duplicate IDs after sync')
    result=json.dumps(merged,indent=2,ensure_ascii=False)+'\n'
    if SONGS.read_text()!=result:
        SONGS.write_text(result)
        print(f'Updated catalog: {len(new)} Well songs; {len(outside)} additional; {sum(s.get("reviewStatus")=="pending-theological-review" for s in new)} Well songs pending theology.')
    else:
        print('No catalog changes.')

if __name__=='__main__':
    try:main()
    except Exception as error:
        print(f'Sync failed safely: {error}',file=sys.stderr);sys.exit(1)
