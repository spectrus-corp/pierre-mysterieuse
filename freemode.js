(function(){
  var MODE_URL="https://kvdb.io/Cv8UZtviGCJ763mChjGocC/freemode";
  var freemode={active:false,scope:"off",expires:null};
  var secretsFound={};

  async function fetchGlobalMode(){
    try{var r=await fetch(MODE_URL+"?t="+Date.now(),{cache:"no-store"});if(!r.ok)return null;return await r.json();}catch(e){return null;}
  }
  function readLocal(){try{var raw=localStorage.getItem("pierre_freemode_local");return raw?JSON.parse(raw):null;}catch(e){return null;}}
  function isExpired(data){if(!data||!data.expires)return false;return Date.now()>Number(data.expires);}
  async function resolveMode(){
    var local=readLocal();
    if(local&&local.active&&!isExpired(local)){freemode={active:true,scope:"local",expires:local.expires||null};return freemode;}
    if(local&&isExpired(local))localStorage.removeItem("pierre_freemode_local");
    var global=await fetchGlobalMode();
    if(global&&global.active&&!isExpired(global)){freemode={active:true,scope:"global",expires:global.expires||null};return freemode;}
    freemode={active:false,scope:"off",expires:null};return freemode;
  }

  function applyUI(){
    var start=document.getElementById("start-screen");if(!start)return;
    var h1=start.querySelector("h1"),p=start.querySelector("p");
    var badge=document.getElementById("freemode-badge");
    if(freemode.active){
      if(h1)h1.textContent="Platformer Libre";
      if(p)p.innerHTML="Version libre — secrets & cheats cachés. Scores classe toujours dispo.<br><strong>Indices :</strong> ↑↑↓↓←→←→BA · tape <em>pierre</em> · triple-clic sur le titre";
      document.title="Platformer Libre";
      if(!badge){badge=document.createElement("div");badge.id="freemode-badge";badge.style.cssText="position:absolute;top:12px;left:12px;z-index:30;background:linear-gradient(180deg,#e8c547,#b8860b);color:#1a120b;font-size:0.75rem;font-weight:700;padding:4px 10px;border-radius:999px";start.appendChild(badge);}
      badge.textContent=freemode.scope==="local"?"BETA locale":"Jeu libre (tous)";badge.style.display="block";
      window.__cheats=window.__cheats||{speed:1,jump:1,gravity:1,fly:false,god:false};
      if(!window.__cheats._freeBoost){window.__cheats.speed=1.15;window.__cheats.jump=1.12;window.__cheats._freeBoost=true;}
    }else{
      if(h1)h1.textContent="La Pierre Mystérieuse";
      if(p)p.innerHTML="Explore les niveaux, collecte les fragments et reconstitue le secret de la pierre.<br><strong>Clavier :</strong> flèches / WASD + Espace<br><strong>Mobile :</strong> boutons à l'écran";
      document.title="La Pierre Mystérieuse — Arts Plastiques 5°8";
      if(badge)badge.style.display="none";
    }
  }

  function toast(msg){if(typeof showMsg==="function")showMsg(msg,2800);}
  function unlockSecret(id,label,apply){
    if(secretsFound[id])return;secretsFound[id]=true;
    try{localStorage.setItem("pierre_secret_"+id,"1");}catch(e){}
    if(apply)apply();toast("✦ Secret : "+label);
  }

  function installKonami(){
    var seq=[38,38,40,40,37,39,37,39,66,65],pos=0;
    window.addEventListener("keydown",function(e){
      if(!freemode.active)return;
      if(e.keyCode===seq[pos]){pos++;if(pos===seq.length){pos=0;unlockSecret("konami","Mode dieu + fly",function(){window.__cheats=window.__cheats||{};window.__cheats.god=true;window.__cheats.fly=true;window.__cheats.speed=2;});}}
      else pos=e.keyCode===seq[0]?1:0;
    });
  }
  function installTypeCode(){
    var buf="";
    window.addEventListener("keydown",function(e){
      if(!freemode.active)return;
      if(e.key&&e.key.length===1){buf=(buf+e.key.toLowerCase()).slice(-8);
        if(buf.indexOf("pierre")>=0){buf="";unlockSecret("pierre","Saut ×1.8",function(){window.__cheats=window.__cheats||{};window.__cheats.jump=1.8;});}}
    });
  }
  function installTripleTitle(){
    var start=document.getElementById("start-screen");if(!start)return;
    var h1=start.querySelector("h1");if(!h1||h1.dataset.secret)return;
    h1.dataset.secret="1";h1.style.cursor="pointer";
    var clicks=0,t=0;
    h1.addEventListener("click",function(){
      if(!freemode.active)return;
      var now=Date.now();if(now-t>800)clicks=0;t=now;clicks++;
      if(clicks>=3){clicks=0;unlockSecret("triple","Vitesse ×2",function(){window.__cheats=window.__cheats||{};window.__cheats.speed=2;});}
    });
  }
  function patchLoreSkip(){
    var btn=document.getElementById("btn-continue");if(!btn||btn.dataset.freePatched==="1")return;
    btn.dataset.freePatched="1";
    var lore=document.getElementById("lore-screen");if(!lore)return;
    new MutationObserver(function(){
      if(!freemode.active)return;
      if(!lore.classList.contains("hidden"))setTimeout(function(){btn.click();},350);
    }).observe(lore,{attributes:true,attributeFilter:["class"]});
  }

  var tries=0;
  async function boot(){
    await resolveMode();applyUI();patchLoreSkip();installKonami();installTypeCode();installTripleTitle();
    if(tries++<8)setTimeout(boot,500);
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})();
