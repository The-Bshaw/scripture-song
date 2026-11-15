"use strict";
const CATEGORY_ORDER=["All Songs","Global","Ancient","Heritage","Advent","Shelved"];
const collator=new Intl.Collator("en",{sensitivity:"base",numeric:true});
const trackId=value=>{const match=String(value||"").match(/^https:\/\/open\.spotify\.com\/track\/([A-Za-z0-9]{22})(?:[/?#]|$)/);return match?match[1]:null};
let librarySongs=[];
let activeCategory="All Songs";
let activeTrack=null;
let activeButton=null;
let controller=null;
let controllerTrack=null;
let iframeAPI=null;
let attemptedPlayback=false;
let isPlaying=false;
let playbackTimeout=null;
let playbackRequest=0;
const filter=document.querySelector('#library-filter');
const tabs=document.querySelector('#library-categories');
const sections=document.querySelector('#library-sections');
const dock=document.querySelector('#spotify-playback-dock');
const dockTarget=document.querySelector('#spotify-embed-target');
const status=document.querySelector('#library-player-status');
const dockClose=document.querySelector('#spotify-dock-close');
const setStatus=message=>{status.textContent=message;};
function revealFallback(message){
 if(!activeTrack)return;
 if(!controller&&!dockTarget.querySelector('iframe')){
   const iframe=document.createElement('iframe');
   iframe.title='Spotify player fallback';
   iframe.src='https://open.spotify.com/embed/track/'+activeTrack+'?utm_source=generator';
   iframe.allow='autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';
   iframe.referrerPolicy='strict-origin-when-cross-origin';
   dockTarget.replaceChildren(iframe);
 }
 dock.classList.add('is-visible');
 dock.setAttribute('aria-hidden','false');
 if(message)setStatus(message);
}
function concealFallback(){dock.classList.remove('is-visible');dock.setAttribute('aria-hidden','true');}
function clearWatchdog(){if(playbackTimeout!==null){clearTimeout(playbackTimeout);playbackTimeout=null;}}
function setButtonState(button,playing){
 if(!button)return;
 button.innerHTML='<span aria-hidden="true">'+(playing?'Ⅱ':'▶')+'</span>';
 button.setAttribute('aria-label',(playing?'Pause ':'Play ')+(button.dataset.title||'song'));
 button.setAttribute('aria-pressed',String(playing));
 button.closest('.library-song')?.classList.toggle('library-song-playing',playing);
}
function resetActiveButton(){setButtonState(activeButton,false);activeButton=null;isPlaying=false;}
function beginWatchdog(request){
 clearWatchdog();
 playbackTimeout=setTimeout(()=>{
   if(request!==playbackRequest||!activeTrack||isPlaying)return;
   setButtonState(activeButton,false);
   revealFallback('Spotify did not start automatically. Use the player controls to start listening.');
 },2200);
}
function stopPlayback(){
 playbackRequest++;clearWatchdog();
 if(controller){try{controller.pause();}catch(error){console.warn('Spotify pause unavailable',error);}}
 resetActiveButton();activeTrack=null;concealFallback();
}
function attachControllerEvents(instance){
 instance.addListener('playback_started',event=>{
   if(!activeTrack||controller!==instance)return;
   const uri=event?.data?.playingURI||'';
   if(uri&&uri!=='spotify:track:'+activeTrack)return;
   isPlaying=true;attemptedPlayback=true;clearWatchdog();
   setButtonState(activeButton,true);concealFallback();
   setStatus('Spotify playback started.');
 });
 instance.addListener('playback_update',event=>{
   if(!activeTrack||controller!==instance)return;
   const data=event?.data||{};
   if(data.playingURI&&data.playingURI!=='spotify:track:'+activeTrack)return;
   if(data.isPaused===false){isPlaying=true;clearWatchdog();setButtonState(activeButton,true);concealFallback();}
   if(data.isPaused===true&&isPlaying){isPlaying=false;setButtonState(activeButton,false);}
 });
}
function createAndPlay(id,request){
 if(!iframeAPI||!activeTrack||request!==playbackRequest)return;
 if(controller){try{controller.destroy();}catch(error){console.warn(error);}controller=null;}
 dockTarget.replaceChildren();
 const placeholder=document.createElement('div');dockTarget.append(placeholder);
 iframeAPI.createController(placeholder,{uri:'spotify:track:'+id,width:'100%',height:80},instance=>{
   if(request!==playbackRequest){instance.destroy();return;}
   controller=instance;controllerTrack=id;attachControllerEvents(instance);
   // Spotify's controller is now available. Playback may still require interaction inside the embed.
   try{instance.play();attemptedPlayback=true;}catch(error){revealFallback('Use Spotify controls to start this track.');}
 });
}
function playTrack(id,button){
 if(activeTrack===id){
   if(isPlaying){controller?.pause();isPlaying=false;setButtonState(button,false);clearWatchdog();setStatus('Playback paused.');}
   else if(controller){
     const request=++playbackRequest;
     attemptedPlayback=true;controller.resume();beginWatchdog(request);setStatus('Starting '+button.dataset.title+'.');
   }else{const request=++playbackRequest;createAndPlay(id,request);beginWatchdog(request);}
   return;
 }
 resetActiveButton();clearWatchdog();concealFallback();
 activeTrack=id;activeButton=button;attemptedPlayback=false;controllerTrack=null;
 const request=++playbackRequest;
 setStatus('Starting '+button.dataset.title+'.');
 if(!iframeAPI){
   beginWatchdog(request);
   // API callback will create the player as soon as Spotify's script loads.
   return;
 }
 createAndPlay(id,request);beginWatchdog(request);
}
window.onSpotifyIframeApiReady=API=>{
 iframeAPI=API;
 if(activeTrack&&!controller)createAndPlay(activeTrack,playbackRequest);
};
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
  button.innerHTML='<span aria-hidden="true">▶</span>';button.dataset.title=song.title;
  button.setAttribute('aria-label','Play '+song.title);button.setAttribute('aria-pressed','false');
  button.addEventListener('click',()=>playTrack(id,button));controls.append(button);
  const link=document.createElement('a');link.href='https://open.spotify.com/track/'+id;link.target='_blank';link.rel='noopener noreferrer';link.textContent='Spotify ↗';link.className='library-spotify-link';controls.append(link);
 }else{
  const icon=document.createElement('span');icon.className='library-play library-play-unavailable';icon.textContent='♫';icon.setAttribute('aria-label','Spotify recording not linked');icon.title='Spotify recording not linked';controls.append(icon);
  const link=document.createElement('a');link.href='https://open.spotify.com/search/'+encodeURIComponent(song.title);link.target='_blank';link.rel='noopener noreferrer';link.textContent='Find on Spotify ↗';link.className='library-spotify-link';controls.append(link);
 }
 card.append(controls);return card;
}
function render(){
 stopPlayback();renderTabs();sections.replaceChildren();
 const q=filter.value.trim().toLocaleLowerCase();
 const songs=librarySongs.filter(s=>(activeCategory==='All Songs'||s.wellCategory===activeCategory)&&(!q||s.title.toLocaleLowerCase().includes(q))).sort((a,b)=>collator.compare(a.title,b.title));
 if(!songs.length){const empty=document.createElement('p');empty.className='library-no-results';empty.textContent='No songs found. Try another title or collection.';sections.append(empty);return;}
 const grid=document.createElement('div');grid.className='library-grid';for(const song of songs)grid.append(makeCard(song));sections.append(grid);
}
async function init(){
 try{
  if(location.protocol==='file:'&&window.SCRIPTURE_SONG_PREVIEW){librarySongs=window.SCRIPTURE_SONG_PREVIEW.songs;}
  else{const response=await fetch('data/songs.json',{cache:'no-store'});if(!response.ok)throw Error('Cannot fetch songs');librarySongs=await response.json();}
  if(!Array.isArray(librarySongs))throw Error('Invalid song library');
  librarySongs=librarySongs.filter(s=>s.wellLibrary&&CATEGORY_ORDER.includes(s.wellCategory)&&s.title);render();
 }catch(error){console.error(error);document.querySelector('#library-error').hidden=false;sections.replaceChildren();}
}
filter.addEventListener('input',render);
dockClose.addEventListener('click',()=>{stopPlayback();});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&activeTrack&&controller){controller.pause();isPlaying=false;setButtonState(activeButton,false);}});
init();
