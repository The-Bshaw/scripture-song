"use strict";
const CATEGORY_ORDER=["All Songs","Global","Ancient","Heritage","Advent","Shelved"];
const collator=new Intl.Collator("en",{sensitivity:"base",numeric:true});
const trackId=value=>{const match=String(value||"").match(/^https:\/\/open\.spotify\.com\/track\/([A-Za-z0-9]{22})(?:[/?#]|$)/);return match?match[1]:null};
let librarySongs=[];
let activeCategory="All Songs";
let openPlayer=null;
const filter=document.querySelector('#library-filter');
const tabs=document.querySelector('#library-categories');
const sections=document.querySelector('#library-sections');
function clearPlayer(){
 if(!openPlayer)return;
 const {card,button,container}=openPlayer;
 container.replaceChildren();container.hidden=true;
 button.setAttribute('aria-expanded','false');button.setAttribute('aria-label','Show Spotify player for '+card.dataset.title);
 button.innerHTML='<span aria-hidden="true">▶</span>';
 card.classList.remove('library-song-playing');
 openPlayer=null;
}
function togglePlayer(card,id){
 if(openPlayer?.card===card){clearPlayer();return;}
 clearPlayer();
 const button=card.querySelector('.library-play');
 const container=card.querySelector('.library-player-slot');
 const iframe=document.createElement('iframe');
 iframe.title='Spotify player for '+card.dataset.title;
 iframe.src='https://open.spotify.com/embed/track/'+id+'?utm_source=generator';
 iframe.loading='eager';iframe.allow='autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';
 iframe.referrerPolicy='strict-origin-when-cross-origin';iframe.className='library-spotify';
 container.append(iframe);container.hidden=false;
 button.setAttribute('aria-expanded','true');button.setAttribute('aria-label','Hide Spotify player for '+card.dataset.title);
 button.innerHTML='<span aria-hidden="true">Ⅱ</span>';
 card.classList.add('library-song-playing');
 openPlayer={card,button,container};
}
function renderTabs(){
 tabs.replaceChildren();
 for(const category of CATEGORY_ORDER){
   const button=document.createElement('button');button.type='button';button.className='library-category-tab';
   button.textContent=category;button.setAttribute('aria-pressed',String(activeCategory===category));
   button.addEventListener('click',()=>{if(category===activeCategory)return;activeCategory=category;filter.value='';render();});
   tabs.append(button);
 }
}
function makeCard(song){
 const card=document.createElement('article');card.className='library-song';card.dataset.title=song.title;
 const info=document.createElement('div');info.className='library-song-info';
 const h=document.createElement('h3');h.textContent=song.title;info.append(h);
 if(activeCategory==='All Songs'){
  const tag=document.createElement('span');tag.className='library-song-category';tag.textContent=song.wellCategory;info.append(tag);
 }
 card.append(info);
 const id=trackId(song.spotifyUrl);
 const controls=document.createElement('div');controls.className='library-song-controls';
 if(id){
  const button=document.createElement('button');button.type='button';button.className='library-play';
  button.innerHTML='<span aria-hidden="true">▶</span>';
  button.setAttribute('aria-label','Show Spotify player for '+song.title);
  button.setAttribute('aria-expanded','false');
  button.addEventListener('click',()=>togglePlayer(card,id));
  controls.append(button);
  const link=document.createElement('a');link.href='https://open.spotify.com/track/'+id;link.target='_blank';link.rel='noopener noreferrer';link.textContent='Spotify ↗';link.className='library-spotify-link';controls.append(link);
 }else{
  const button=document.createElement('span');button.className='library-play library-play-unavailable';button.textContent='♫';button.setAttribute('aria-label','Spotify recording not linked');button.title='Spotify recording not linked';controls.append(button);
  const link=document.createElement('a');link.href='https://open.spotify.com/search/'+encodeURIComponent(song.title);link.target='_blank';link.rel='noopener noreferrer';link.textContent='Find on Spotify ↗';link.className='library-spotify-link';controls.append(link);
 }
 card.append(controls);
 const slot=document.createElement('div');slot.className='library-player-slot';slot.hidden=true;card.append(slot);
 return card;
}
function render(){
 clearPlayer();renderTabs();sections.replaceChildren();
 const q=filter.value.trim().toLocaleLowerCase();
 const songs=librarySongs.filter(s=>(activeCategory==='All Songs'||s.wellCategory===activeCategory)&&(!q||s.title.toLocaleLowerCase().includes(q))).sort((a,b)=>collator.compare(a.title,b.title));
 if(!songs.length){const empty=document.createElement('p');empty.className='library-no-results';empty.textContent='No songs found. Try another title or collection.';sections.append(empty);return;}
 const grid=document.createElement('div');grid.className='library-grid';
 for(const song of songs)grid.append(makeCard(song));
 sections.append(grid);
}
async function init(){
 try{
  if(location.protocol==='file:'&&window.SCRIPTURE_SONG_PREVIEW){librarySongs=window.SCRIPTURE_SONG_PREVIEW.songs;}
  else{const response=await fetch('data/songs.json',{cache:'no-store'});if(!response.ok)throw Error('Cannot fetch songs');librarySongs=await response.json();}
  if(!Array.isArray(librarySongs))throw Error('Invalid song library');
  librarySongs=librarySongs.filter(s=>s.wellLibrary&&CATEGORY_ORDER.includes(s.wellCategory)&&s.title);
  render();
 }catch(error){console.error(error);document.querySelector('#library-error').hidden=false;sections.replaceChildren();}
}
filter.addEventListener('input',render);
init();
