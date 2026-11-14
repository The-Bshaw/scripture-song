"use strict";
const CATEGORY_ORDER=["Global","Ancient","Heritage","Advent","Shelved"];
const labels={Global:"Global",Ancient:"Ancient",Heritage:"Heritage",Advent:"Advent",Shelved:"Shelved"};
const descriptions={Global:"Songs in our regular worship rotation.",Ancient:"Historic hymns and enduring songs of the church.",Heritage:"Songs that have shaped our worship over the years.",Advent:"Songs for Advent and the Christmas season.",Shelved:"Songs we love but aren't currently in regular rotation."};
const collator=new Intl.Collator("en",{sensitivity:"base",numeric:true});
const htmlEscape=value=>String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
const trackId=value=>{const match=String(value||"").match(/^https:\/\/open\.spotify\.com\/track\/([A-Za-z0-9]{22})(?:[/?#]|$)/);return match?match[1]:null};
let librarySongs=[];
function render(){
 const query=document.querySelector('#library-filter').value.trim().toLocaleLowerCase();
 const matches=librarySongs.filter(s=>!query||s.title.toLocaleLowerCase().includes(query));
 document.querySelector('#library-count').textContent=`${matches.length} ${matches.length===1?'song':'songs'} · ${CATEGORY_ORDER.length} collections`;
 const sections=document.querySelector('#library-sections');
 sections.replaceChildren();
 const links=document.querySelector('#library-categories');links.replaceChildren();
 for(const category of CATEGORY_ORDER){
   const songs=matches.filter(s=>s.wellCategory===category).sort((a,b)=>collator.compare(a.title,b.title));
   if(!songs.length&&!query){continue;}if(!songs.length)continue;
   const link=document.createElement('a');link.href='#group-'+category.toLowerCase();link.textContent=category+' ('+songs.length+')';links.append(link);
   const section=document.createElement('section');section.className='library-section';section.id='group-'+category.toLowerCase();
   const heading=document.createElement('div');heading.className='library-section-head';heading.innerHTML=`<div><span class="library-overline">SONG COLLECTION</span><h2>${htmlEscape(labels[category])} <span class="library-section-count">${songs.length}</span></h2><p>${htmlEscape(descriptions[category])}</p></div>`;section.append(heading);
   const grid=document.createElement('div');grid.className='library-grid';
   for(const song of songs){
    const id=trackId(song.spotifyUrl);
    const card=document.createElement('article');card.className='library-song';
    // The song title is visible even when no Spotify link is supplied in the Sheet.
    const header=document.createElement('div');header.className='library-song-info';
    header.innerHTML=`<h3>${htmlEscape(song.title)}</h3>${song.author?`<p>${htmlEscape(song.author)}</p>`:''}`;
    card.append(header);
    if(id){
      const iframe=document.createElement('iframe');iframe.title='Spotify player for '+song.title;
      iframe.src='https://open.spotify.com/embed/track/'+id+'?utm_source=generator';
      iframe.loading='lazy';iframe.allow='autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';
      iframe.referrerPolicy='strict-origin-when-cross-origin';iframe.className='library-spotify';
      card.append(iframe);
      const a=document.createElement('a');a.href='https://open.spotify.com/track/'+id;a.target='_blank';a.rel='noopener noreferrer';a.className='library-spotify-link';a.textContent='Open in Spotify ↗';card.append(a);
    }else{
      const placeholder=document.createElement('div');placeholder.className='library-no-preview';
      placeholder.innerHTML='<span class="library-play-symbol" aria-hidden="true">♫</span><span>Spotify preview not linked yet</span>';
      card.append(placeholder);
      const a=document.createElement('a');a.href='https://open.spotify.com/search/'+encodeURIComponent(song.title);a.target='_blank';a.rel='noopener noreferrer';a.className='library-spotify-link';a.textContent='Find on Spotify ↗';card.append(a);
    }
    grid.append(card);
   }
   section.append(grid);sections.append(section);
 }
 if(!matches.length){const msg=document.createElement('div');msg.className='library-no-results';msg.textContent='No songs found. Try another title.';sections.append(msg);}
}
async function init(){
 try{
  if(location.protocol==='file:'&&window.SCRIPTURE_SONG_PREVIEW){librarySongs=window.SCRIPTURE_SONG_PREVIEW.songs;}
  else {const response=await fetch('data/songs.json',{cache:'no-store'});if(!response.ok)throw Error('Cannot fetch songs');librarySongs=await response.json();}
  if(!Array.isArray(librarySongs))throw Error('Invalid library');
  librarySongs=librarySongs.filter(s=>s.wellLibrary&&CATEGORY_ORDER.includes(s.wellCategory)&&s.title);
  render();
 }catch(error){console.error(error);document.querySelector('#library-error').hidden=false;document.querySelector('#library-count').textContent='Library unavailable';}
}
document.querySelector('#library-filter').addEventListener('input',render);
init();
