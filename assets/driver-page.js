initPage();
const main=$('main');
let PIN=sessionStorage.getItem('pin')||'';
let deferredPrompt=null;

window.addEventListener('beforeinstallprompt',e=>{
  e.preventDefault();
  deferredPrompt=e;
  showPwaBanner();
});

function showPwaBanner(){
  if(sessionStorage.getItem('pwa_dismissed')||$('pwa-box'))return;
  const isIos=/iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase())&&!window.navigator.standalone;
  if(!deferredPrompt&&!isIos)return;
  const banner=document.createElement('div');
  banner.id='pwa-box';
  banner.className='card pwa-box';
  banner.innerHTML='<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap"><div><b>📱 RKT Driver App</b><small>'+(isIos?'Tap Share ⎋ then "Add to Home Screen ⊞"':t('pwa_hint'))+'</small></div><div style="display:flex;gap:8px">'+(deferredPrompt?'<button id="pwa-install" class="btn sm">'+t('pwa_btn')+'</button>':'')+'<button id="pwa-close" class="btn ol sm" aria-label="Dismiss">✕</button></div></div>';
  const container=main.querySelector('.wrap')||main;
  container.insertAdjacentElement('afterbegin',banner);
  if($('pwa-install')){
    $('pwa-install').onclick=async()=>{
      if(deferredPrompt){
        deferredPrompt.prompt();
        const{outcome}=await deferredPrompt.userChoice;
        deferredPrompt=null;
        if(outcome==='accepted')banner.remove();
      }
    };
  }
  if($('pwa-close')){
    $('pwa-close').onclick=()=>{
      sessionStorage.setItem('pwa_dismissed','1');
      banner.remove();
    };
  }
}

function pinScreen(m){
  window.onLang=null;
  main.innerHTML='<div class="card narrow c"><h2 data-i="drv"></h2><p class="mu" data-i="'+(m||'pin')+'"></p><input id="pin" class="pinbox" type="password" inputmode="numeric" maxlength="8" autofocus aria-label="PIN"><button id="go" class="btn" data-i="open"></button></div>';
  applyLang();
  $('pin').onkeydown=e=>{if(e.key=='Enter')$('go').click()};
  $('go').onclick=async()=>{
    const g=$('go');
    if(g.disabled)return;
    PIN=v('pin').trim();
    if(!PIN)return;
    g.disabled=true;
    sessionStorage.setItem('pin',PIN);
    try{await start();}finally{g.disabled=false;}
  };
  showPwaBanner();
}

async function start(){
  if(!PIN)return pinScreen();
  let R=null;
  try{
    const res=await sb.rpc('get_rates',{p_pin:PIN});
    R=res.data;
  }catch(e){
    main.innerHTML='<div class="card narrow c"><h2>'+t('err_save')+'</h2><p class="mu">'+t('net_err')+'</p><button class="btn" id="retry">'+t('retry')+'</button></div>';
    $('retry').onclick=start;
    return;
  }
  if(!R||R.err){
    const lk=R&&R.err=='locked';
    PIN='';
    sessionStorage.removeItem('pin');
    return pinScreen(lk?'locked':'badpin');
  }
  mountForm(main,null,R,async data=>{
    try{
      const{data:c,error}=await sb.rpc('driver_save',{p_pin:PIN,p_data:data});
      if(error||!c||c.err)return toast(t(c&&c.err=='total'?'err_tot':c&&c.err=='locked'?'locked':c&&c.err=='rates'?'norates':'err_save'));
      location.href='bill.html?c='+c.code;
    }catch(err){
      toast(t('net_err'));
    }
  });
  let rb=[];
  try{
    const res=await sb.rpc('driver_recent',{p_pin:PIN});
    rb=res.data||[];
  }catch(e){
    rb=[];
  }
  const draw=()=>{
    $('rec').innerHTML='<h3>'+t('recent')+'</h3>'+(Array.isArray(rb)?rb:[]).map(b=>'<a class="row" href="bill.html?c='+b.code+'"><span>'+no(b.no)+' '+esc(b.cust)+'<small>'+b.status+'</small></span><b>'+inr(b.total)+'</b></a>').join('')+'<p style="margin-top:12px"><button class="lnk" id="out">'+t('logout')+'</button></p>';
    $('out').onclick=()=>{PIN='';sessionStorage.removeItem('pin');start()};
  };
  main.firstChild.insertAdjacentHTML('beforeend','<section class="card" id="rec"></section>');
  draw();
  showPwaBanner();
  const u=window.onLang;
  window.onLang=()=>{u();draw();showPwaBanner()};
}

start();
