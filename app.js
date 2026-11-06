'use strict';
const $=q=>document.querySelector(q);
const BOOKS=['Genesis','Exodus','Leviticus','Numbers','Deuteronomy','Joshua','Judges','Ruth','1 Samuel','2 Samuel','1 Kings','2 Kings','1 Chronicles','2 Chronicles','Ezra','Nehemiah','Esther','Job','Psalm','Proverbs','Ecclesiastes','Song of Solomon','Isaiah','Jeremiah','Lamentations','Ezekiel','Daniel','Hosea','Joel','Amos','Obadiah','Jonah','Micah','Nahum','Habakkuk','Zephaniah','Haggai','Zechariah','Malachi','Matthew','Mark','Luke','John','Acts','Romans','1 Corinthians','2 Corinthians','Galatians','Ephesians','Philippians','Colossians','1 Thessalonians','2 Thessalonians','1 Timothy','2 Timothy','Titus','Philemon','Hebrews','James','1 Peter','2 Peter','1 John','2 John','3 John','Jude','Revelation'];
const ALIAS={ps:'Psalm',psa:'Psalm',psalms:'Psalm',song:'Song of Solomon',songofsongs:'Song of Solomon',sos:'Song of Solomon',jn:'John',jhn:'John',rom:'Romans',eph:'Ephesians',phil:'Philippians',php:'Philippians',col:'Colossians',gal:'Galatians',jas:'James',heb:'Hebrews',gen:'Genesis',ex:'Exodus',exo:'Exodus',isa:'Isaiah',jer:'Jeremiah',matt:'Matthew',mt:'Matthew',mk:'Mark',mrk:'Mark',lk:'Luke',rev:'Revelation',acts:'Acts',act:'Acts',cor:'1 Corinthians',deut:'Deuteronomy',dt:'Deuteronomy',pet:'1 Peter',tim:'1 Timothy',thess:'1 Thessalonians',sam:'1 Samuel',kings:'1 Kings',chron:'1 Chronicles',zec:'Zechariah',zech:'Zechariah'};
let passageFocus=[],songs=[],chapterThemes={},allResults=[],lastRefs=[],availableThemes=[],excludedThemes=new Set(),bibleOverviews={books:{},chapters:{}},activeDiscovery=null,selectedDiscoveryThemes=new Set();
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
function focusedThemesForRef(ref){
  if(ref.v===null||ref.endCh!==ref.ch)return null;
  const start=ref.v,end=ref.endV===null?start:ref.endV;
  const match=passageFocus.find(item=>{
    const section=parseRef(item.reference);
    return section&&section.book===ref.book&&section.ch===ref.ch&&section.endCh===ref.ch&&
      start>=section.v&&end<=section.endV;
  });
  return match?match.themes:null;
}
function getThemes(refs){
  const set=new Set();
  for(const r of refs){
    const focus=focusedThemesForRef(r);
    if(focus){for(const t of focus)set.add(t);continue;}
    for(let c=r.ch;c<=Math.min(r.endCh,r.ch+149);c++)for(const t of chapterThemes[`${r.book} ${c}`]||[])set.add(t);
  }
  return [...set];
}
const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// Matching v3.9: evidence first, then distinctive primary themes, then secondary support.
// Editorial associations remain explicitly editorial; no claimed lyric verification is inferred.
const GENERIC_CONCEPTS=new Set(['christ','worship','praise','glory','faith','love','hope','grace','salvation','goodness','trust','church','peace','prayer','god','jesus christ']);
const EXTRA_CONCEPT_ALIASES={
  'jesus christ':'christ','christ jesus':'christ','the lord jesus':'christ',
  'god’s faithfulness':'faithfulness','steadfast love':'faithfulness',
  'god’s goodness':'goodness','greatness of god':'greatness','god’s greatness':'greatness',
  'majesty of god':'greatness','god’s glory':'glory',
  'victory over death':'resurrection',
  'resurrection of jesus':'resurrection','resurrection of christ':'resurrection',
  'new creation':'restoration','spiritual renewal':'renewal',
  'god’s presence':'presence','abiding in jesus':'abiding in christ',
  'the holy spirit':'holy spirit','god’s mercy':'mercy',
  'gospel':'salvation','justification':'grace','justification by faith':'grace',
  'sanctification':'holiness','purity':'holiness','holy living':'holiness',
  'gratitude':'thanksgiving','thankful':'thanksgiving',
  'kingdom of christ':'kingship','kingdom of god':'kingship','kingship of christ':'kingship',
  'christ’s return':'second coming','return of christ':'second coming'
};
const NEAR_CONCEPTS={
  'shepherd':['guidance','god’s care','provision'],
  'atonement':['cross','sacrifice','christ’s blood'],
  'cross':['atonement','sacrifice'],
  'faithfulness':['steadfast love'],
  'compassion':['mercy'],
  'mercy':['compassion'],
  'resurrection':['victory over death'],
  'restoration':['renewal'],
  'creation':['creator'],
  'incarnation':['birth of christ'],
  'holiness':['sanctification'],
  'unity':['church unity','unity in worship'],
  'abiding in christ':['dependence on christ'],
  'kingship':['kingdom'],
  'gratitude':['thanksgiving'],
  'thanksgiving':['gratitude']
};
function matchConcept(x){
  const v=normTopic(x);
  return EXTRA_CONCEPT_ALIASES[v]||TOPIC_ALIASES[v]||v;
}
function conceptualMatch(query,tag){
  const q=matchConcept(query),t=matchConcept(tag);
  if(q===t)return 1;
  // Permit curated, directional near matches, not loose substring/stem matching.
  const linked=NEAR_CONCEPTS[q]||[];
  if(linked.some(v=>matchConcept(v)===t))return .65;
  return 0;
}
function songEvidence(song,query){
  const primary=(song.primaryThemes||song.themes||[]).map(t=>({tag:t,weight:conceptualMatch(query,t)})).sort((a,b)=>b.weight-a.weight)[0];
  const secondary=(song.secondaryThemes||[]).map(t=>({tag:t,weight:conceptualMatch(query,t)})).sort((a,b)=>b.weight-a.weight)[0];
  // An explicit primary concept always outranks a mere secondary mention.
  return {primary:primary?.weight||0,primaryTag:primary?.tag||'',secondary:secondary?.weight||0,secondaryTag:secondary?.tag||''};
}
function connectionEvidence(song,refs){
  return (song.scriptureConnections||[]).map(c=>{
    const linked=parseRef(c.reference||'');
    if(!linked||!refs.some(ref=>overlap(linked,ref)))return null;
    const specificity=(refs.some(ref=>ref.v!==null)&&linked.v!==null)?1:0;
    return {...c,specificity};
  }).filter(Boolean);
}
function rank(refs,topics=[]){
  // Preserve each chapter's editorial priority: the first two themes represent core ideas.
  // Multi-chapter searches deduplicate concepts rather than rewarding repeated generic tags.
  const passageRows=[];
  const seen=new Set();
  for(const r of refs){
    const focus=focusedThemesForRef(r);
    for(let ch=r.ch;ch<=r.endCh;ch++){
      const ts=focus||chapterThemes[`${r.book} ${ch}`]||[];
      for(let i=0;i<ts.length;i++){
        const concept=matchConcept(ts[i]);
        if(seen.has(concept))continue;
        seen.add(concept);
        passageRows.push({name:ts[i],concept,importance:[1.35,1.08,.75,.58,.45][Math.min(i,4)],anchor:i<2});
      }
    }
  }
  return songs.map(song=>{
    if(song.wellLibrary&&song.auditState!=='source-reviewed')return null;
    const explicit=topics.map(t=>({name:t,...songEvidence(song,t)}));
    if(explicit.some(e=>!e.primary&&!e.secondary))return null;
    const matches=passageRows.map(t=>({...t,...songEvidence(song,t.name)}))
      .filter(t=>t.primary||t.secondary);
    const specific=matches.filter(t=>t.anchor||!GENERIC_CONCEPTS.has(t.concept));
    const primary=specific.filter(t=>t.primary).sort((a,b)=>b.primary*b.importance-a.primary*a.importance);
    const secondary=specific.filter(t=>!t.primary&&t.secondary).sort((a,b)=>b.secondary*b.importance-a.secondary*a.importance);
    const generic=matches.filter(t=>!t.anchor&&GENERIC_CONCEPTS.has(t.concept));
    const strongCore=primary.length>0;
    const supportedSecondary=secondary.length>=2;
    const candidates=connectionEvidence(song,refs);
    const direct=candidates.filter(c=>c.matchLevel==='direct-biblical');
    const sourced=candidates.filter(c=>c.matchLevel==='source-linked');
    const editorial=candidates.filter(c=>c.matchLevel==='editorial-parallel');
    // Editorial links are not independent proof. They need actual lyrical/theme support.
    const editorialFit=editorial.length>0&&(strongCore||supportedSecondary||generic.some(t=>t.primary));
    if(refs.length&&!direct.length&&!sourced.length&&!strongCore&&!supportedSecondary&&!editorialFit)return null;
    // Cap the count of overlapping tags so generic, broadly described songs don't dominate.
    const coreScore=primary.slice(0,3).reduce((n,m,i)=>n+m.primary*m.importance*[75,30,12][i],0);
    const supportingScore=secondary.slice(0,2).reduce((n,m,i)=>n+m.secondary*m.importance*[15,8][i],0);
    const genericScore=Math.min(11,generic.filter(m=>m.primary).length*4+generic.filter(m=>m.secondary).length*1.5);
    const verseExact=candidates.some(c=>c.specificity);
    const verseLinked=editorial.some(c=>parseRef(c.reference||'')?.v!==null);
    const evidenceScore=direct.length?(180+(verseExact?28:0)):sourced.length?(145+(verseExact?22:0)):editorialFit?(45+(verseLinked?25:0)+(verseExact?12:0)):0;
    const topicScore=explicit.reduce((n,m)=>n+m.primary*85+m.secondary*24,0);
    const contemporaryBonus=song.type==='Contemporary'?4:0;
    const score=Math.round(coreScore+supportingScore+genericScore+evidenceScore+topicScore+contemporaryBonus);
    const reasonParts=[];
    if(direct.length)reasonParts.push('Direct Scripture link recorded in the catalog');
    else if(sourced.length)reasonParts.push('Publisher-linked Scripture reference');
    else if(editorialFit)reasonParts.push('Editorial Scripture parallel (not independently verified)');
    if(primary.length)reasonParts.push('Main song themes: '+primary.slice(0,2).map(t=>t.primaryTag).join(', '));
    else if(secondary.length)reasonParts.push('Supporting song themes: '+secondary.slice(0,2).map(t=>t.secondaryTag).join(', '));
    else if(explicit.length)reasonParts.push('Matches requested theme'+(explicit.length>1?'s':''));
    if(refs.some(r=>r.v!==null)&&!candidates.length)reasonParts.push(refs.every(r=>focusedThemesForRef(r))?'Matched to editorial passage-section themes; lyrical connection not verified':'Based on chapter themes, not verse-specific lyrical evidence');
    const matchLevel=direct.length?'Direct biblical connection':sourced.length?'Publisher Scripture association':editorialFit?'Editorial Scripture parallel':strongCore?'Strong thematic match':'Supporting thematic match';
    return {...song,linked:[...direct,...sourced,...(editorialFit?editorial:[])].map(c=>c.reference),
      shared:primary.slice(0,3).map(m=>m.name),requested:topics,matchLevel,score,
      matchReasons:reasonParts,matchTier:(direct.length||sourced.length||primary.length>=2)?'strong':primary.length?'good':'related'};
  }).filter(Boolean).sort((a,b)=>b.score-a.score||a.title.localeCompare(b.title));
}


const CHAPTER_COUNTS=[50,40,27,36,34,24,21,4,31,24,22,25,29,36,10,13,10,42,150,31,12,8,66,52,5,48,12,14,3,9,1,4,7,3,3,3,2,14,4,28,16,24,21,28,16,16,13,6,6,4,4,5,3,6,4,3,1,13,5,5,3,5,1,1,1,22];
const BOOK_CHAPTERS=Object.fromEntries(BOOKS.map((b,i)=>[b,CHAPTER_COUNTS[i]]));
function parseBookOrChapter(q){
  const book=normalBook(q.trim());
  if(book)return {book,chapter:null};
  const ref=parseRef(q.trim());
  if(ref&&ref.v===null&&ref.ch===ref.endCh)return {book:ref.book,chapter:ref.ch};
  return null;
}
function renderDiscovery(){
  const box=$('#bibleDiscovery');
  if(!activeDiscovery){box.hidden=true;box.innerHTML='';return;}
  const {book,chapter}=activeDiscovery;
  const key=chapter?`${book} ${chapter}`:book;
  const hasChapterSummary=!chapter||Boolean(bibleOverviews.chapters[key]);
  const summary=chapter?(bibleOverviews.chapters[key]||`Detailed chapter summary forthcoming. Book context: ${bibleOverviews.books[book]||''}`):(bibleOverviews.books[book]||'');
  const specific=chapter?chapterThemes[key]||[]:[];
  const suggested=chapter?specific:activeDiscovery.themes;
  const list=suggested.length?suggested:activeDiscovery.themes;
  const qualifies=chapter&&!specific.length;
  box.hidden=false;
  box.innerHTML=`<h3>${safe(key)} · ${hasChapterSummary?'Overview':'Book context'}</h3><p>${safe(summary)}</p><div class="theme-prompt">${qualifies?'Suggested book-wide themes (chapter themes not yet indexed)':'Explore themes to narrow your songs'}</div><div class="discovery-themes">${list.map(t=>`<button type="button" class="discovery-theme" data-discovery-theme="${safe(t)}" aria-pressed="${selectedDiscoveryThemes.has(normConcept(t))}">${safe(t)}</button>`).join('')}</div>${qualifies?'<p class="discovery-note">These themes describe the book generally, not necessarily this chapter.</p>':''}`;
}
$('#bibleDiscovery').addEventListener('click',e=>{
  const btn=e.target.closest('[data-discovery-theme]');if(!btn||!activeDiscovery)return;
  const theme=normConcept(btn.dataset.discoveryTheme);
  if(selectedDiscoveryThemes.has(theme))selectedDiscoveryThemes.delete(theme);else selectedDiscoveryThemes.add(theme);
  updateDiscoveryResults();
});
function updateDiscoveryResults(){
  if(!activeDiscovery)return;
  const {book,chapter}=activeDiscovery;
  const refs=[{book,ch:chapter||1,v:null,endCh:chapter||BOOK_CHAPTERS[book],endV:null}];
  const topics=[...selectedDiscoveryThemes];
  allResults=rank(refs,topics);
  availableThemes=[...new Set([...(chapter?chapterThemes[`${book} ${chapter}`]||[]:activeDiscovery.themes)])];
  renderDiscovery();renderThemeFilters();render();
}

function spotifyTrackId(url) {
  const m = String(url || '').match(/^https:\/\/open\.spotify\.com\/track\/([A-Za-z0-9]{22})(?:[/?#]|$)/);
  return m ? m[1] : '';
}

function songMarkup(s){
  const category=s.wellLibrary?s.wellCategory:'Additional';
  const categoryClass=['Global','Ancient','Heritage','Advent'].includes(category)?category.toLowerCase():'additional';
  const themeButtons=(s.themes||[]).map(t=>`<button type="button" class="song-theme" data-theme-search="${safe(t)}" aria-label="Search all songs for theme ${safe(t)}">${safe(t)}</button>`).join('');
  return `<article class="song"><div class="meta">${s.wellLibrary?`<span class="category-pill category-${categoryClass}">${safe(category)}</span>`:""}</div><h3>${safe(s.title)}</h3><div class="song-themes" aria-label="Song themes">${themeButtons||'<span class="themes-pending">Themes pending review</span>'}</div>${s.matchReasons&&s.matchReasons.length?`<div class="match-explanation"><div class="match-label">${safe(s.matchLevel)}</div><div class="match-reasons">${s.matchReasons.map(r=>`<span>${safe(r)}</span>`).join("")}</div>${s.linked&&s.linked.length?`<div class="match-scriptures">Related Scripture: ${safe(s.linked.slice(0,2).join("; "))}</div>`:""}</div>`:""}${s.reviewStatus==='pending-theological-review'?'<div class="review-note">Lyric and theme review pending</div>':''}${spotifyTrackId(s.spotifyUrl)?`<div class="song-preview"><button type="button" class="preview-toggle" data-spotify-track="${spotifyTrackId(s.spotifyUrl)}" aria-expanded="false" aria-label="Show Spotify player for ${safe(s.title)}"><span aria-hidden="true">▶</span> Listen preview</button><div class="preview-slot" hidden></div></div>`:''}<div class="song-links">${s.spotifyUrl?`<a target="_blank" rel="noopener noreferrer" href="${safe(s.spotifyUrl)}">Spotify ↗</a>`:''}<a target="_blank" rel="noopener noreferrer" href="https://songselect.ccli.com/search/results?SearchText=${encodeURIComponent(s.title)}">SongSelect ↗</a><button type="button" class="copy-title" data-copy="${safe(s.title)}" aria-label="Copy song title">Copy title</button></div></article>`;
}
function renderThemeFilters(){
  const el=$('#themes');
  if(!availableThemes.length){el.innerHTML='';return;}
  el.innerHTML='<div class="theme-filter-label">Exclude topics from these results <span>(click × to remove songs with that theme)</span></div><div class="theme-chip-wrap">'+availableThemes.map(t=>{
    const excluded=excludedThemes.has(t);
    return `<button type="button" class="theme-filter ${excluded?'excluded':''}" data-exclude-theme="${safe(t)}" aria-pressed="${excluded}" aria-label="${excluded?'Include':'Exclude'} songs tagged ${safe(t)}"><span>${safe(t)}</span><span class="theme-filter-icon" aria-hidden="true">${excluded?'+':'×'}</span></button>`;
  }).join('')+'</div>';
}
function render(){let type=$('#type').value,sort=$('#sort').value,keyword=$('#keyword').value.toLowerCase().trim(),section=$('#collection').value;let display=allResults.filter(s=>!((s.themes||[]).some(t=>excludedThemes.has(t)))&&(type==='all'||s.type===type)&&(section==='all'||(section==='well'?s.wellLibrary:section==='other'?!s.wellLibrary:s.wellCategory===section))&&(!keyword||[s.title,s.author||'',...s.themes].join(' ').toLowerCase().includes(keyword)));let sorter=sort==='title'?(a,b)=>a.title.localeCompare(b.title):sort==='newest'?(a,b)=>(b.year||0)-(a.year||0)||a.title.localeCompare(b.title):(a,b)=>b.score-a.score||a.title.localeCompare(b.title);const primary=display.filter(s=>s.wellLibrary).sort(sorter),additional=display.filter(s=>!s.wellLibrary).sort(sorter);$('#count').textContent=`${display.length} MATCHES · ${primary.length} FROM THE WELL · ${additional.length} ADDITIONAL`;$('#empty').hidden=display.length!==0;$('#songGrid').innerHTML=(primary.length?`<div class="section-title"><div><span class="eyebrow">YOUR SONG LIBRARY</span><h3>Songs at The Well <span class="section-count">${primary.length}</span></h3></div></div><div class="song-grid-inner">${primary.map(songMarkup).join('')}</div>`:'')+(additional.length?`<div class="section-title additional-title"><div><span class="eyebrow">EXPLORE MORE</span><h3>Additional songs <span class="section-count">${additional.length}</span></h3><p>Suggestions beyond your regular song library.</p></div></div><div class="song-grid-inner">${additional.map(songMarkup).join('')}</div>`:'');document.querySelectorAll('.preview-toggle').forEach(button=>button.addEventListener('click',()=>{
  const slot=button.nextElementSibling;
  const opening=slot.hidden;
  // Keep only one Spotify player active at a time.
  document.querySelectorAll('.preview-slot:not([hidden])').forEach(other=>{
    other.hidden=true;
    other.replaceChildren();
    const toggle=other.previousElementSibling;
    if(toggle){toggle.setAttribute('aria-expanded','false');toggle.innerHTML='<span aria-hidden="true">▶</span> Listen preview';}
  });
  if(!opening)return;
  const id=button.dataset.spotifyTrack;
  if(!/^[a-zA-Z0-9]{22}$/.test(id))return;
  const iframe=document.createElement('iframe');
  iframe.src='https://open.spotify.com/embed/track/'+id+'?utm_source=generator';
  iframe.title='Spotify song player';
  iframe.loading='lazy';
  iframe.allow='autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';
  iframe.setAttribute('allowfullscreen','');
  iframe.referrerPolicy='strict-origin-when-cross-origin';
  slot.replaceChildren(iframe);
  slot.hidden=false;
  button.setAttribute('aria-expanded','true');
  button.innerHTML='<span aria-hidden="true">×</span> Close player';
}));document.querySelectorAll('.copy-title').forEach(b=>b.addEventListener('click',()=>navigator.clipboard.writeText(b.dataset.copy).then(()=>{b.textContent='Copied ✓'}).catch(()=>{})))}
document.querySelector('#themes').addEventListener('click',e=>{const b=e.target.closest('[data-exclude-theme]');if(!b)return;const t=b.dataset.excludeTheme;if(excludedThemes.has(t))excludedThemes.delete(t);else excludedThemes.add(t);renderThemeFilters();render()});
document.querySelector('#songGrid').addEventListener('click',e=>{const b=e.target.closest('[data-theme-search]');if(!b)return;$('#keyword').value='';$('#type').value='all';$('#collection').value='all';run(b.dataset.themeSearch);$('#results').scrollIntoView({behavior:'smooth',block:'start'})});
function run(query,push=true){excludedThemes.clear();availableThemes=[];activeDiscovery=null;selectedDiscoveryThemes.clear();
  const bible=parseBookOrChapter(query);
  if(bible){
    const {book,chapter}=bible;
    if(chapter&&chapter>BOOK_CHAPTERS[book]){activeDiscovery=null;renderDiscovery();$('#resultsTitle').textContent='Invalid Bible chapter';$('#count').textContent='';$('#songGrid').innerHTML='';return;}
    const themes=chapter?[...(chapterThemes[`${book} ${chapter}`]||[])]:[...new Set(Object.entries(chapterThemes).filter(([k])=>k.startsWith(book+' ')).flatMap(([,ts])=>ts))];
    const bookThemeRows=Object.entries(chapterThemes).filter(([k])=>k.startsWith(book+' ')).flatMap(([,ts])=>ts);
    const bookThemes=[...new Set(bookThemeRows)].sort((a,b)=>bookThemeRows.filter(t=>t===b).length-bookThemeRows.filter(t=>t===a).length).slice(0,12);
    activeDiscovery={book,chapter,themes:chapter?(themes.length?themes:bookThemes):bookThemes};
    $('#passages').value=query;$('#resultsTitle').textContent='Songs matching “'+(chapter?`${book} ${chapter}`:book)+'”';
    updateDiscoveryResults();
    if(push)history.replaceState(null,'',location.pathname+'?passage='+encodeURIComponent(query));
    return;
  }
  renderDiscovery();const pieces=query.split(/[;,\n]+/).map(s=>s.trim()).filter(Boolean);let refs=[],topicInputs=[];for(const piece of pieces){const r=parseRef(piece);if(r)refs.push(r);else topicInputs.push(piece)}const {topics,unknown}=resolveTopics(topicInputs);if(!refs.length&&!topics.length){const q=query.toLowerCase().trim();const matches=songs.filter(s=>q&&s.title.toLowerCase().includes(q)).map(s=>({...s,linked:[],shared:[],requested:[],score:1}));if(matches.length){allResults=matches;$('#passages').value=query;$('#resultsTitle').textContent='Songs matching “'+query+'”';renderThemeFilters();render();if(push)history.replaceState(null,'',location.pathname+'?passage='+encodeURIComponent(query));return;}$('#resultsTitle').textContent='Search Scripture or a topic';$('#songGrid').innerHTML='';renderThemeFilters();$('#count').textContent='';$('#empty').hidden=true;return}lastRefs=refs;$('#passages').value=query;allResults=rank(refs,topics);const parts=[...refs.map(x=>x.text),...topics.map(x=>x.replace(/\b\w/g,c=>c.toUpperCase()))];$('#resultsTitle').textContent='Songs matching “'+parts.join(' + ')+'”';availableThemes=[...new Set([...topics,...getThemes(refs)])];renderThemeFilters();render();if(push)history.replaceState(null,'',location.pathname+'?passage='+encodeURIComponent(query))}
async function init(){try{
  if(location.protocol==='file:' && window.SCRIPTURE_SONG_PREVIEW){
    songs=window.SCRIPTURE_SONG_PREVIEW.songs;
    chapterThemes=window.SCRIPTURE_SONG_PREVIEW.themes;passageFocus=window.SCRIPTURE_SONG_PREVIEW.passageFocus||[];bibleOverviews=window.SCRIPTURE_SONG_PREVIEW.overviews||bibleOverviews;
    try { bibleOverviews=window.SCRIPTURE_SONG_BIBLE_OVERVIEWS||bibleOverviews; }catch(e){}
  }else{
    const [a,b,c,d]=await Promise.all([fetch('data/songs.json',{cache:'no-store'}),fetch('data/passage-themes.json',{cache:'no-store'}),fetch('data/bible-overviews.json',{cache:'no-store'}),fetch('data/passage-focus.json',{cache:'no-store'})]);
    if(!a.ok||!b.ok)throw Error('Song data request failed: '+a.status+'/'+b.status);
    songs=await a.json();chapterThemes=await b.json();if(c.ok)bibleOverviews=await c.json();if(d.ok)passageFocus=await d.json();
  }
  if(!Array.isArray(songs)||!songs.length)throw Error('Song catalog empty');
  run(new URLSearchParams(location.search).get('passage')||$('#passages').value,false);
}catch(e){$('#count').textContent='Unable to load song data. Verify data/songs.json and data/passage-themes.json are uploaded to GitHub Pages.';console.error(e)}}
$('#searchForm').addEventListener('submit',e=>{e.preventDefault();run($('#passages').value);$('#results').scrollIntoView({behavior:'smooth'})});document.querySelectorAll('[data-example]').forEach(b=>b.addEventListener('click',()=>{run(b.dataset.example);$('#results').scrollIntoView({behavior:'smooth'})}));$('#type').addEventListener('change',render);$('#collection').addEventListener('change',render);$('#sort').addEventListener('change',render);$('#keyword').addEventListener('input',render);init();
