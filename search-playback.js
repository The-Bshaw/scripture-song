'use strict';
/* Spotify play/pause controls for the Song Search result cards.
   The iFrame API may not allow playback without another click; in that case show its native controls. */
(()=>{
  const playSvg='<svg viewBox="0 0 12 14" width="12" height="14" aria-hidden="true" focusable="false"><path d="M1.5 1.9C1.5 1.136 2.331.655 2.998 1.036l7.066 4.035c.674.385.674 1.358 0 1.743L2.998 10.85c-.667.381-1.498-.1-1.498-.864V1.9Z" fill="currentColor"/></svg>';
  const pauseSvg='<svg class="pause-icon" viewBox="0 0 12 14" width="12" height="14" aria-hidden="true" focusable="false"><rect x="1.5" y="1" width="3.1" height="12" rx="1.55" fill="currentColor"/><rect x="7.4" y="1" width="3.1" height="12" rx="1.55" fill="currentColor"/></svg>';
  const dock=document.getElementById('spotify-playback-dock');
  const target=document.getElementById('spotify-embed-target');
  const status=document.getElementById('search-player-status');
  const close=document.getElementById('spotify-dock-close');
  let iframeApi=null,controller=null,activeId=null,activeButton=null,playing=false,requestId=0,watchdog=null;
  function announce(message){if(status)status.textContent=message;}
  function buttonState(button,isPlaying){
    if(!button||!button.isConnected)return;
    button.innerHTML=isPlaying?pauseSvg:playSvg;
    button.setAttribute('aria-pressed',String(isPlaying));
    button.setAttribute('aria-label',(isPlaying?'Pause ':'Play ')+(button.dataset.title||'song'));
    button.closest('.song')?.classList.toggle('search-song-playing',isPlaying);
  }
  function hideDock(){dock?.classList.remove('is-visible');dock?.setAttribute('aria-hidden','true');}
  function showDock(message){
    if(!activeId)return;
    if(!controller&&!target.querySelector('iframe')){
      const iframe=document.createElement('iframe');
      iframe.title='Spotify player fallback';
      iframe.src='https://open.spotify.com/embed/track/'+activeId+'?utm_source=generator';
      iframe.allow='autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';
      iframe.referrerPolicy='strict-origin-when-cross-origin';
      target.replaceChildren(iframe);
    }
    dock.classList.add('is-visible');dock.setAttribute('aria-hidden','false');
    if(message)announce(message);
  }
  function clearWatchdog(){if(watchdog!==null){clearTimeout(watchdog);watchdog=null;}}
  function watch(request){
    clearWatchdog();
    watchdog=setTimeout(()=>{
      if(request!==requestId||!activeId||playing)return;
      buttonState(activeButton,false);
      showDock('Spotify needs you to start playback in its player controls.');
    },2200);
  }
  function stop(){
    ++requestId;clearWatchdog();
    try{controller?.pause();}catch(err){console.warn('Spotify pause unavailable',err);}
    buttonState(activeButton,false);
    activeButton=null;activeId=null;playing=false;hideDock();
  }
  function connectEvents(instance){
    instance.addListener('playback_started',event=>{
      if(controller!==instance||!activeId)return;
      const uri=event?.data?.playingURI;
      if(uri&&uri!=='spotify:track:'+activeId)return;
      playing=true;clearWatchdog();buttonState(activeButton,true);hideDock();announce('Spotify playback started.');
    });
    instance.addListener('playback_update',event=>{
      if(controller!==instance||!activeId)return;
      const data=event?.data||{};
      if(data.playingURI&&data.playingURI!=='spotify:track:'+activeId)return;
      if(data.isPaused===false){playing=true;clearWatchdog();buttonState(activeButton,true);hideDock();}
      else if(data.isPaused===true&&playing){playing=false;buttonState(activeButton,false);}
    });
  }
  function createPlayer(id,request){
    if(!iframeApi||request!==requestId||activeId!==id)return;
    try{controller?.destroy();}catch(err){console.warn(err);}
    controller=null;target.replaceChildren();
    const holder=document.createElement('div');target.append(holder);
    iframeApi.createController(holder,{uri:'spotify:track:'+id,width:'100%',height:80},instance=>{
      if(request!==requestId||activeId!==id){instance.destroy();return;}
      controller=instance;connectEvents(instance);
      try{instance.play();}catch(err){showDock('Start the preview with Spotify controls.');}
    });
  }
  function playTrack(id,button){
    if(activeId===id){
      if(playing){try{controller?.pause();}catch(err){}playing=false;buttonState(button,false);clearWatchdog();announce('Playback paused.');}
      else{
        const request=++requestId;
        if(controller){try{controller.resume();}catch(err){showDock('Use Spotify controls to resume.');}}
        else createPlayer(id,request);
        watch(request);
      }
      return;
    }
    stop();
    activeId=id;activeButton=button;
    const request=++requestId;
    announce('Starting '+(button.dataset.title||'song')+'.');
    if(iframeApi)createPlayer(id,request);
    watch(request);
  }
  window.onSpotifyIframeApiReady=api=>{
    iframeApi=api;
    if(activeId&&!controller)createPlayer(activeId,requestId);
  };
  document.getElementById('songGrid')?.addEventListener('click',event=>{
    const button=event.target.closest('.search-play');
    if(!button)return;
    const id=button.dataset.spotifyTrack;
    if(!/^[A-Za-z0-9]{22}$/.test(id))return;
    playTrack(id,button);
  });
  close?.addEventListener('click',stop);
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&activeId)stop();});
  window.SearchSpotifyPlayback={stop};
})();
