const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const base=path.join(__dirname,'..');
const app=fs.readFileSync(path.join(base,'app.js'),'utf8');
const code=app.slice(0,app.indexOf('const CHAPTER_COUNTS='));
const context=vm.createContext({console});vm.runInContext(code,context);
const tracks=JSON.parse(fs.readFileSync(path.join(base,'data/songs.json'),'utf8'));
const themeMap=JSON.parse(fs.readFileSync(path.join(base,'data/passage-themes.json'),'utf8'));
context._songs=tracks;context._themes=themeMap;context._focus=JSON.parse(fs.readFileSync(path.join(base,'data/passage-focus.json'),'utf8'));
vm.runInContext('songs=_songs;chapterThemes=_themes;passageFocus=_focus',context);
function run(ref){context._query=ref;return vm.runInContext('rank([parseRef(_query)],[])',context)};
function report(ref){const results=run(ref);console.log('\n'+ref+': '+results.length+' results');for(const s of results.slice(0,7)){console.log('  '+s.score+' '+s.title+' | '+s.matchLevel+' | '+(s.matchReasons||[]).join(' / '))};return results}
for(const q of ['Psalm 23','Psalm 150','Isaiah 53','John 11','John 15','Ephesians 2','Romans 8','Matthew 28','Lamentations 3','Genesis 1','1 Corinthians 13','Revelation 19']){const results=report(q);assert(results.every(s=>s.score>=0));assert(results.every((s,i)=>i===0||s.score<=results[i-1].score));assert(results.every(s=>s.matchReasons?.length))}
let a=run('John 15:4-5');assert(a.find(s=>s.title==='Abide'),'Abide should match John 15');
let b=run('Psalm 23');assert(b.find(s=>s.title==='Goodness of God'),'Goodness of God should match Psalm 23');
let c=run('Ephesians 2');assert(c.length>0,'Ephesians 2 needs results');
let one=run('Ephesians 2:1-10'),two=run('Ephesians 2:11-22');assert(JSON.stringify(one.slice(0,5).map(s=>s.title))!==JSON.stringify(two.slice(0,5).map(s=>s.title)),'Verse sections must produce different rankings');
assert(one.find(s=>s.title==='All Sufficient Merit'),'Grace passage must include All Sufficient Merit');
let prayer=run('Matthew 6:9-13');assert(prayer.length,'Lord prayer range should show songs');
let s=vm.runInContext('rank([],["resurrection"])',context);assert(s.length,'resurrection topic needs matches');
console.log('\nPASSED: 12 passages, confidence/explanation checks, direct known songs, topic search');
