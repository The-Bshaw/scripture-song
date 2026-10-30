'use strict';
const $=q=>document.querySelector(q);
const BOOKS=['Genesis','Exodus','Leviticus','Numbers','Deuteronomy','Joshua','Judges','Ruth','1 Samuel','2 Samuel','1 Kings','2 Kings','1 Chronicles','2 Chronicles','Ezra','Nehemiah','Esther','Job','Psalm','Proverbs','Ecclesiastes','Song of Solomon','Isaiah','Jeremiah','Lamentations','Ezekiel','Daniel','Hosea','Joel','Amos','Obadiah','Jonah','Micah','Nahum','Habakkuk','Zephaniah','Haggai','Zechariah','Malachi','Matthew','Mark','Luke','John','Acts','Romans','1 Corinthians','2 Corinthians','Galatians','Ephesians','Philippians','Colossians','1 Thessalonians','2 Thessalonians','1 Timothy','2 Timothy','Titus','Philemon','Hebrews','James','1 Peter','2 Peter','1 John','2 John','3 John','Jude','Revelation'];
const ALIAS={ps:'Psalm',psa:'Psalm',psalms:'Psalm',song:'Song of Solomon',songofsongs:'Song of Solomon',sos:'Song of Solomon',jn:'John',jhn:'John',rom:'Romans',eph:'Ephesians',phil:'Philippians',php:'Philippians',col:'Colossians',gal:'Galatians',jas:'James',heb:'Hebrews',gen:'Genesis',ex:'Exodus',exo:'Exodus',isa:'Isaiah',jer:'Jeremiah',matt:'Matthew',mt:'Matthew',mk:'Mark',mrk:'Mark',lk:'Luke',rev:'Revelation',acts:'Acts',act:'Acts',cor:'1 Corinthians',deut:'Deuteronomy',dt:'Deuteronomy',pet:'1 Peter',tim:'1 Timothy',thess:'1 Thessalonians',sam:'1 Samuel',kings:'1 Kings',chron:'1 Chronicles',zec:'Zechariah',zech:'Zechariah'};
let songs=[],chapterThemes={},allResults=[],lastRefs=[],availableThemes=[],excludedThemes=new Set();
const TOPIC_ALIASES={"god's faithfulness":"faithfulness","god's love":"love","holy ghost":"holy spirit","spirit":"holy spirit","forgiven":"forgiveness","forgive":"forgiveness","redeemer":"redemption","redeemed":"redemption","saved":"salvation","savior":"salvation","saviour":"salvation","thanksgiving":"gratitude","thankfulness":"gratitude","thankful":"gratitude","trusting":"trust","worshiping":"worship","worshipping":"worship","humble":"humility","healed":"healing","risen":"resurrection","jesus":"christ","jesus christ":"christ","god's grace":"grace","god's mercy":"mercy"};
const normTopic=s=>s.toLowerCase().replace(/[’‘]/g,"'").replace(/[^a-z0-9\s']/g,' ').replace(/\s+/g,' ').trim();
// Controlled theological vocabulary. Specific lyrics retain their original primary tags;
// search concepts are derived rather than written back into the source-reviewed data.
const CONCEPTS={
  resurrection:['resurrection','resurrection of christ','victory over death'],
  grace:['grace','salvation by grace','justification','righteousness of christ','salvation by faith'],
  salvation:['salvation','gospel','salvation by grace','justification','redemption','freedom from sin','freedom through the cross','new life'],
  faith:['faith','trust','trust in god','trust in christ',"faith in god\'s promises",'trust in jesus','trust in trials'],
  hope:['hope','hope in christ','assurance','assurance of salvation','assurance in christ','eternal life'],
  mercy:['mercy','forgiveness',"god\'s mercy",'compassion of christ'],
  forgiveness:['forgiveness','forgiveness of sins','cleansing by christ\'s blood','mercy'],
  atonement:['atonement','cross of christ','suffering of christ','christ\'s blood','cleansing by christ\'s blood','freedom through the cross','sacrifice'],
  cross:['cross of christ','atonement','suffering of christ','freedom through the cross'],
  love:['love of god',"god\'s love",'love of christ','god seeks the lost',"god\'s pursuing love"],
  faithfulness:['faithfulness',"god\'s faithfulness",'faithfulness of jesus','trust in god'],
  goodness:['goodness',"god\'s goodness",'faithfulness'],
  trust:['trust','trust in god','trust in christ','trust in jesus','trust in trials','dependence on god','dependence on christ','assurance'],
  prayer:['prayer','dependence on god','prayer for wisdom','intercession of christ','prayer for revival'],
  worship:['worship','praise','adoration','exaltation','worthiness of christ','worthiness of god','eternal worship','holiness of god'],
  praise:['praise','adoration','exaltation','gratitude','corporate praise','thanksgiving'],
  glory:['glory','exaltation','worthitness of christ','worthiness of christ','holiness of god'],
  church:['church','unity','unity in worship','corporate praise','renewal of the church','discipleship'],
  identity:['identity in christ','worth in christ','union with christ','adoption','new life'],
  humility:['humility','humility of christ','surrender','repentance'],
  repentance:['repentance','returning to the father','surrender','confession'],
  shepherd:['shepherd','guidance','provision',"god\'s care",'dependence on god'],
  comfort:['comfort','peace amid suffering','assurance','trust in trials','presence of god'],
  provision:['provision',"god\'s provision",'contentment','sufficiency of god'],
  presence:['presence of god',"god\'s presence",'longing for god','holy spirit','abiding in christ'],
  holiness:['holiness','holiness of god','holy spirit','sanctification'],
  kingship:['kingship of christ','kingdom of christ','kingdom of god','worthiness of christ'],
  redemption:['redemption','atonement','salvation','cleansing by christ\'s blood'],
  christ:['christ-centeredness','devotion to jesus','worthiness of christ','kingship of christ','union with christ'],
  baptism:['new life','union with christ','salvation','identity in christ'],
  advent:['incarnation','birth of christ','joy at christ\'s coming','longing for christ','advent'],
  resurrection_hope:['resurrection','resurrection of christ','victory over death','eternal life']
};
const CONCEPT_ALIAS={...TOPIC_ALIASES,'righteousness':'grace','justified':'grace','mercy of god':'mercy','god is good':'goodness','jesus resurrection':'resurrection','risen christ':'resurrection','atoning work':'atonement','peace':'comfort','god with us':'presence','thank you':'gratitude','thanksgiving':'gratitude'};
function normConcept(x){return CONCEPT_ALIAS[normTopic(x)]||normTopic(x)}
function searchTags(song){return {primary:(song.primaryThemes||song.themes||[]).map(normTopic),secondary:(song.secondaryThemes||[]).map(normTopic)}}
function conceptStrength(theme,tag){
  const c=normConcept(theme),v=normTopic(tag);
  if(c===v)return 1;
  const pool=CONCEPTS[c]||[];
  return pool.includes(v)?0.78:0;
}
function themeStrength(theme,song){
  const tags=searchTags(song);
  const primary=Math.max(0,...tags.primary.map(t=>conceptStrength(theme,t)));
  const secondary=Math.max(0,...tags.secondary.map(t=>conceptStrength(theme,t)));
  // Secondary concepts help find substantial connections, but never equal a primary match.
  // Metaphorical mentions of resurrection are not resurrection matches.
  return {primary,secondary:(normConcept(theme)==='resurrection'&&tags.secondary.includes('resurrection imagery'))?0:secondary};
}
function knownTopics(){return new Set([...Object.keys(CONCEPTS),...songs.flatMap(s=>[...(s.themes||[]),...(s.secondaryThemes||[])]).map(normConcept),...Object.values(chapterThemes).flat().map(normConcept)])}
function resolveTopics(input){let available=knownTopics(),matched=new Set(),unknown=[];for(const raw of input){const phrase=normTopic(raw.replace(/^topics?\s*:\s*/i,'').replace(/^themes?\s*:\s*/i,''));if(!phrase)continue;const parts=phrase.split(/\s+(?:and|&)\s+/);for(const part of parts){const candidate=normConcept(part);if(available.has(candidate))matched.add(candidate);else unknown.push(part)}}return {topics:[...matched],unknown}}
const normalBook=s=>{let b=s.trim().replace(/^(III|II|I)\s+/i,(_,r)=>({I:'1',II:'2',III:'3'})[r.toUpperCase()]+' ').replace(/\./g,'');let noSpace=b.toLowerCase().replace(/\s+/g,'');return ALIAS[b.toLowerCase()]||ALIAS[noSpace]||BOOKS.find(x=>x.toLowerCase()===b.toLowerCase())||null};
function parseRef(str){str=str.trim().replace(/[–—]/g,'-').replace(/\s+/g,' ');let m=str.match(/^(.+?)\s*(\d+)\s*(?::\s*(\d+))?\s*(?:-\s*(?:(\d+)\s*:\s*)?(\d+))?$/);if(!m)return null;let book=normalBook(m[1]),ch=Number(m[2]),v=m[3]?+m[3]:null,endCh=ch,endV=v;if(!book||ch<1||ch>150)return null;if(m[5]){if(m[4]){endCh=+m[4];endV=+m[5]}else if(v!==null){endV=+m[5]}else{endCh=+m[5];endV=null}}if(endCh<ch||endCh>150||(endCh===ch&&v!==null&&endV!==null&&endV<v)||v>176||endV>176)return null;return {book,ch,v,endCh,endV,text:`${book} ${ch}${v!==null?':'+v:''}${m[5]?'-'+(m[4]?m[4]+':':'')+m[5]:''}`}}
function parseRefs(str){let refs=[],bad=[];for(const raw of str.split(/[;,\n]+/).map(s=>s.trim()).filter(Boolean)){const ref=parseRef(raw);if(ref)refs.push(ref);else bad.push(raw)}return {refs,bad}}
function intervals(r,c){if(c<r.ch||c>r.endCh)return null;const lo=(c===r.ch&&r.v!==null)?r.v:1,hi=(c===r.endCh&&r.endV!==null)?r.endV:200;return [lo,hi]}
function overlap(a,b){if(a.book!==b.book)return false;let left=Math.max(a.ch,b.ch),right=Math.min(a.endCh,b.endCh);for(let c=left;c<=right;c++){let aa=intervals(a,c),bb=intervals(b,c);if(aa&&bb&&aa[0]<=bb[1]&&bb[0]<=aa[1])return true}return false}
function getThemes(refs){let set=new Set();for(const r of refs)for(let c=r.ch;c<=Math.min(r.endCh,r.ch+149);c++)for(let t of chapterThemes[`${r.book} ${c}`]||[])set.add(t);return [...set]}
const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function rank(refs,topics=[]){
  const passageThemes=getThemes(refs).map(normConcept);
  const BROAD=new Set(['christ','worship','praise','glory','faith','love']);
  return songs.map(s=>{
    if(s.wellLibrary&&s.auditState!=='source-reviewed')return null;
    const topicScores=topics.map(t=>themeStrength(t,s));
    // All explicitly requested topics must have a meaningful relationship.
    if(topics.some((t,i)=>!topicScores[i].primary&&(!topicScores[i].secondary||['resurrection','baptism'].includes(normConcept(t)))))return null;
    const topicPrimary=topicScores.reduce((sum,x)=>sum+x.primary,0);
    const topicSecondary=topicScores.reduce((sum,x)=>sum+x.secondary,0);
    const candidates=(s.scriptureConnections||[]).filter(c=>{const r=parseRef(c.reference);return r&&refs.some(user=>overlap(r,user))});
    const direct=candidates.filter(c=>c.matchLevel==='direct-biblical');
    const sourced=candidates.filter(c=>c.matchLevel==='source-linked');
    const editorial=candidates.filter(c=>c.matchLevel==='editorial-parallel');
    const matching=passageThemes.map(theme=>({theme,...themeStrength(theme,s)}));
    const strongPrimary=matching.filter(x=>!BROAD.has(x.theme)&&x.primary>0);
    const secondaryHits=matching.filter(x=>!BROAD.has(x.theme)&&x.secondary>0);
    const primaryWeight=strongPrimary.reduce((sum,x)=>sum+x.primary,0);
    const secondaryWeight=secondaryHits.reduce((sum,x)=>sum+x.secondary,0);
    // One distinctive primary concept is enough for a relevant Scripture suggestion.
    // Secondary-only matches require at least two independent specific concepts.
    // Even an editorial verse association requires a meaningful thematic connection.
    const thematicStrong=primaryWeight>=0.75||secondaryWeight>=1.5;
    const editorialStrong=editorial.length>0&&(primaryWeight>=0.75||secondaryWeight>=0.75);
    if(refs.length&&!direct.length&&!sourced.length&&!thematicStrong&&!editorialStrong)return null;
    let score=direct.length*160+sourced.length*125+(editorialStrong?35:0)+primaryWeight*55+secondaryWeight*13+topicPrimary*85+topicSecondary*29;
    if(!refs.length&&topics.length&&topicPrimary<.75)score-=28;
    const matchLevel=direct.length?'Direct biblical connection':sourced.length?'Publisher Scripture association':editorialStrong?'Strong editorial Scripture connection':thematicStrong?'Related theological themes':'Thematic connection';
    return {...s,linked:[...direct,...sourced,...(editorialStrong?editorial:[])].map(c=>c.reference),shared:strongPrimary.map(x=>x.theme),requested:topics,matchLevel,score};
  }).filter(Boolean).sort((a,b)=>b.score-a.score||a.title.localeCompare(b.title));
}
function songMarkup(s){
  const category=s.wellLibrary?s.wellCategory:'Additional';
  const categoryClass=['Global','Ancient','Heritage','Advent'].includes(category)?category.toLowerCase():'additional';
  const themeButtons=(s.themes||[]).map(t=>`<button type="button" class="song-theme" data-theme-search="${safe(t)}" aria-label="Search all songs for theme ${safe(t)}">${safe(t)}</button>`).join('');
  return `<article class="song"><div class="meta"><span class="category-pill category-${categoryClass}">${safe(category)}</span></div><h3>${safe(s.title)}</h3><div class="song-themes" aria-label="Song themes">${themeButtons||'<span class="themes-pending">Themes pending review</span>'}</div>${s.linked&&s.linked.length?`<div class="connection-note"><span aria-hidden="true">▤</span> ${safe(s.matchLevel)} · ${safe(s.linked.slice(0,2).join("; "))}</div>`: ''}${s.reviewStatus==='pending-theological-review'?'<div class="review-note">Lyric and theme review pending</div>':''}<div class="song-links">${s.spotifyUrl?`<a target="_blank" rel="noopener noreferrer" href="${safe(s.spotifyUrl)}">Spotify ↗</a>`:''}<a target="_blank" rel="noopener noreferrer" href="https://songselect.ccli.com/search/results?SearchText=${encodeURIComponent(s.title)}">SongSelect ↗</a><button type="button" class="copy-title" data-copy="${safe(s.title)}" aria-label="Copy song title">Copy title</button></div></article>`;
}
function renderThemeFilters(){
  const el=$('#themes');
  if(!availableThemes.length){el.innerHTML='';return;}
  el.innerHTML='<div class="theme-filter-label">Exclude topics from these results <span>(click × to remove songs with that theme)</span></div><div class="theme-chip-wrap">'+availableThemes.map(t=>{
    const excluded=excludedThemes.has(t);
    return `<button type="button" class="theme-filter ${excluded?'excluded':''}" data-exclude-theme="${safe(t)}" aria-pressed="${excluded}" aria-label="${excluded?'Include':'Exclude'} songs tagged ${safe(t)}"><span>${safe(t)}</span><span class="theme-filter-icon" aria-hidden="true">${excluded?'+':'×'}</span></button>`;
  }).join('')+'</div>';
}
function render(){let type=$('#type').value,sort=$('#sort').value,keyword=$('#keyword').value.toLowerCase().trim(),section=$('#collection').value;let display=allResults.filter(s=>!((s.themes||[]).some(t=>excludedThemes.has(t)))&&(type==='all'||s.type===type)&&(section==='all'||(section==='well'?s.wellLibrary:section==='other'?!s.wellLibrary:s.wellCategory===section))&&(!keyword||[s.title,s.author||'',...s.themes].join(' ').toLowerCase().includes(keyword)));let sorter=sort==='title'?(a,b)=>a.title.localeCompare(b.title):sort==='newest'?(a,b)=>(b.year||0)-(a.year||0)||a.title.localeCompare(b.title):(a,b)=>b.score-a.score||a.title.localeCompare(b.title);const primary=display.filter(s=>s.wellLibrary).sort(sorter),additional=display.filter(s=>!s.wellLibrary).sort(sorter);$('#count').textContent=`${display.length} MATCHES · ${primary.length} FROM THE WELL · ${additional.length} ADDITIONAL`;$('#empty').hidden=display.length!==0;$('#songGrid').innerHTML=(primary.length?`<div class="section-title"><div><span class="eyebrow">YOUR SONG LIBRARY</span><h3>Songs at The Well <span class="section-count">${primary.length}</span></h3><p>From Global, Ancient, Heritage, and Advent. Listed first for every search.</p></div></div><div class="song-grid-inner">${primary.map(songMarkup).join('')}</div>`:'')+(additional.length?`<div class="section-title additional-title"><div><span class="eyebrow">EXPLORE MORE</span><h3>Additional songs <span class="section-count">${additional.length}</span></h3><p>Suggestions beyond your regular song library.</p></div></div><div class="song-grid-inner">${additional.map(songMarkup).join('')}</div>`:'');document.querySelectorAll('.copy-title').forEach(b=>b.addEventListener('click',()=>navigator.clipboard.writeText(b.dataset.copy).then(()=>{b.textContent='Copied ✓'}).catch(()=>{})))}
document.querySelector('#themes').addEventListener('click',e=>{const b=e.target.closest('[data-exclude-theme]');if(!b)return;const t=b.dataset.excludeTheme;if(excludedThemes.has(t))excludedThemes.delete(t);else excludedThemes.add(t);renderThemeFilters();render()});
document.querySelector('#songGrid').addEventListener('click',e=>{const b=e.target.closest('[data-theme-search]');if(!b)return;$('#keyword').value='';$('#type').value='all';$('#collection').value='all';run(b.dataset.themeSearch);$('#results').scrollIntoView({behavior:'smooth',block:'start'})});
function run(query,push=true){excludedThemes.clear();availableThemes=[];const pieces=query.split(/[;,\n]+/).map(s=>s.trim()).filter(Boolean);let refs=[],topicInputs=[];for(const piece of pieces){const r=parseRef(piece);if(r)refs.push(r);else topicInputs.push(piece)}const {topics,unknown}=resolveTopics(topicInputs);if(!refs.length&&!topics.length){const q=query.toLowerCase().trim();const matches=songs.filter(s=>q&&s.title.toLowerCase().includes(q)).map(s=>({...s,linked:[],shared:[],requested:[],score:1}));if(matches.length){allResults=matches;$('#passages').value=query;$('#resultsTitle').textContent='Songs matching “'+query+'”';renderThemeFilters();render();if(push)history.replaceState(null,'',location.pathname+'?passage='+encodeURIComponent(query));return;}$('#resultsTitle').textContent='Search Scripture or a topic';$('#songGrid').innerHTML='';renderThemeFilters();$('#count').textContent='';$('#empty').hidden=true;return}lastRefs=refs;$('#passages').value=query;allResults=rank(refs,topics);const parts=[...refs.map(x=>x.text),...topics.map(x=>x.replace(/\b\w/g,c=>c.toUpperCase()))];$('#resultsTitle').textContent='Songs matching “'+parts.join(' + ')+'”';availableThemes=[...new Set([...topics,...getThemes(refs)])];renderThemeFilters();render();if(push)history.replaceState(null,'',location.pathname+'?passage='+encodeURIComponent(query))}
async function init(){try{let [a,b]=await Promise.all([fetch('data/songs.json'),fetch('data/passage-themes.json')]);if(!a.ok||!b.ok)throw Error('Failed to load data');songs=await a.json();chapterThemes=await b.json();run(new URLSearchParams(location.search).get('passage')||$('#passages').value,false)}catch(e){$('#count').textContent='Unable to load song data. Check GitHub Pages or use a local web server.';console.error(e)}}
$('#searchForm').addEventListener('submit',e=>{e.preventDefault();run($('#passages').value);$('#results').scrollIntoView({behavior:'smooth'})});document.querySelectorAll('[data-example]').forEach(b=>b.addEventListener('click',()=>{run(b.dataset.example);$('#results').scrollIntoView({behavior:'smooth'})}));$('#type').addEventListener('change',render);$('#collection').addEventListener('change',render);$('#sort').addEventListener('change',render);$('#keyword').addEventListener('input',render);init();
