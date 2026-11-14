'use strict';
// Read-only sampling of representative passages to triage provisional songs by how often they are recommended.
const fs=require('fs'),vm=require('vm'),path=require('path'),ROOT=path.join(__dirname,'..');
const app=fs.readFileSync(path.join(ROOT,'app.js'),'utf8');
const ctx=vm.createContext({console});vm.runInContext(app.slice(0,app.indexOf('const CHAPTER_COUNTS=')),ctx);
ctx._songs=JSON.parse(fs.readFileSync(path.join(ROOT,'data/songs.json'),'utf8'));
ctx._themes=JSON.parse(fs.readFileSync(path.join(ROOT,'data/passage-themes.json'),'utf8'));
ctx._focus=JSON.parse(fs.readFileSync(path.join(ROOT,'data/passage-focus.json'),'utf8'));
vm.runInContext('songs=_songs;chapterThemes=_themes;passageFocus=_focus',ctx);
const queries=['Genesis 1','Exodus 14','Psalm 23','Psalm 46','Psalm 100','Psalm 139','Psalm 150','Isaiah 6','Isaiah 53','Jeremiah 31','Lamentations 3','Ezekiel 37','Daniel 3','Micah 6','Matthew 5','Matthew 6:9-13','Matthew 28','Luke 15','John 1','John 3:16-17','John 11','John 15:4-5','Acts 2','Romans 3','Romans 5','Romans 8','Romans 12','1 Corinthians 13','1 Corinthians 15','2 Corinthians 4','2 Corinthians 12','Galatians 5','Ephesians 2:1-10','Ephesians 2:11-22','Philippians 2','Colossians 1','1 Thessalonians 4','Hebrews 4','James 1','1 Peter 1','Revelation 5','Revelation 19','Revelation 21'];
const activity=new Map();for(const q of queries){ctx._q=q;let res=vm.runInContext('rank([parseRef(_q)],[])',ctx);res.slice(0,12).forEach((s,i)=>{if(s.auditState==='source-reviewed')return;let r=activity.get(s.id)||{id:s.id,title:s.title,top12_count:0,top3_count:0,examples:[],top_score:0};r.top12_count++;if(i<3)r.top3_count++;r.top_score=Math.max(r.top_score,s.score);if(r.examples.length<5)r.examples.push(q);activity.set(s.id,r)})}
const rows=[...activity.values()].sort((a,b)=>b.top3_count-a.top3_count||b.top12_count-a.top12_count||a.title.localeCompare(b.title));
fs.writeFileSync(path.join(ROOT,'SONGS_NEEDING_LYRIC_REVIEW_PRIORITY.json'),JSON.stringify({sampledPassages:queries.length,prioritySongs:rows},null,2)+'\n');console.log(`Analyzed ${queries.length} sample passages; ${rows.length} provisional songs appeared in top 12`);
