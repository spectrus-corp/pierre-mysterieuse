(function(){
  var MODE_URL = "https://kvdb.io/Cv8UZtviGCJ763mChjGocC/freemode";
  var freemode = { active:false, scope:"off", expires:null };

  async function fetchGlobalMode(){
    try{
      var r=await fetch(MODE_URL+"?t="+Date.now(),{cache:"no-store"});
      if(!r.ok) return null;
      return await r.json();
    }catch(e){ return null; }
  }
  async function writeGlobalMode(data){
    var r=await fetch(MODE_URL,{
      method:"PUT",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify(data),
      cache:"no-store"
    });
    if(!r.ok) throw new Error("PUT "+r.status);
    return data;
  }

  function readLocal(){
    try{
      var raw=localStorage.getItem("pierre_freemode_local");
      if(!raw) return null;
      return JSON.parse(raw);
    }catch(e){ return null; }
  }
  function writeLocal(data){
    if(!data) localStorage.removeItem("pierre_freemode_local");
    else localStorage.setItem("pierre_freemode_local", JSON.stringify(data));
  }
  function isExpired(data){
    if(!data || !data.expires) return false;
    return Date.now() > Number(data.expires);
  }

  async function resolveMode(){
    var local=readLocal();
    if(local && local.active && !isExpired(local)){
      freemode={active:true, scope:"local", expires:local.expires||null};
      return freemode;
    }
    if(local && isExpired(local)) writeLocal(null);
    var global=await fetchGlobalMode();
    if(global && global.active && !isExpired(global)){
      freemode={active:true, scope:"global", expires:global.expires||null};
      return freemode;
    }
    freemode={active:false, scope:"off", expires:null};
    return freemode;
  }

  function applyUI(){
    var start=document.getElementById("start-screen");
    if(!start) return;
    var h1=start.querySelector("h1");
    var p=start.querySelector("p");
    var badge=document.getElementById("freemode-badge");
    if(freemode.active){
      if(h1) h1.textContent="Platformer Libre";
      if(p) p.innerHTML="Mode jeu libre — sans le cadre du projet arts plastiques.<br><strong>Clavier :</strong> flèches / WASD + Espace<br><strong>Mobile :</strong> boutons à l'écran";
      document.title="Platformer Libre";
      if(!badge){
        badge=document.createElement("div");
        badge.id="freemode-badge";
        badge.style.cssText="position:absolute;top:12px;left:12px;z-index:30;background:linear-gradient(180deg,#e8c547,#b8860b);color:#1a120b;font-size:0.75rem;font-weight:700;padding:4px 10px;border-radius:999px";
        start.appendChild(badge);
      }
      badge.textContent=freemode.scope==="local"?"BETA locale":"Jeu libre (tous)";
      badge.style.display="block";
    } else {
      if(h1) h1.textContent="La Pierre Mystérieuse";
      if(p) p.innerHTML="Explore les niveaux, collecte les fragments et reconstitue le secret de la pierre.<br><strong>Clavier :</strong> flèches / WASD + Espace<br><strong>Mobile :</strong> boutons à l'écran";
      document.title="La Pierre Mystérieuse — Arts Plastiques 5°8";
      if(badge) badge.style.display="none";
    }
  }

  function patchLoreSkip(){
    var btn=document.getElementById("btn-continue");
    if(!btn || btn.dataset.freePatched==="1") return;
    btn.dataset.freePatched="1";
    var lore=document.getElementById("lore-screen");
    if(!lore) return;
    new MutationObserver(function(){
      if(!freemode.active) return;
      if(!lore.classList.contains("hidden")){
        setTimeout(function(){ btn.click(); }, 400);
      }
    }).observe(lore,{attributes:true,attributeFilter:["class"]});
  }

  function ensureAdminPanel(){
    var admin=document.getElementById("admin-screen");
    if(!admin) return;
    if(document.getElementById("admin-panel-freemode")) return;

    var tabs=admin.querySelector(".admin-tabs");
    if(tabs && !tabs.querySelector('[data-tab="freemode"]')){
      var btn=document.createElement("button");
      btn.type="button";
      btn.className="btn admin-tab";
      btn.dataset.tab="freemode";
      btn.textContent="Jeu libre";
      tabs.appendChild(btn);
      btn.addEventListener("click", function(){
        admin.querySelectorAll(".admin-tab").forEach(function(b){b.classList.remove("active");});
        btn.classList.add("active");
        admin.querySelectorAll(".admin-panel").forEach(function(p){p.classList.add("hidden");});
        document.getElementById("admin-panel-freemode").classList.remove("hidden");
        refreshStatus();
      });
    }

    var panel=document.createElement("div");
    panel.id="admin-panel-freemode";
    panel.className="admin-panel hidden";
    panel.innerHTML=
      '<p class="admin-hint">Lancer une version <strong>sans le projet arts plastiques</strong> (plateforme pure).</p>'+
      '<p id="fm-status" class="admin-msg">Chargement…</p>'+
      '<div class="admin-form-col" style="margin:12px 0">'+
      '<label>Durée <select id="fm-duration">'+
      '<option value="0">Sans limite</option>'+
      '<option value="15">15 minutes</option>'+
      '<option value="60">1 heure</option>'+
      '<option value="360">6 heures</option>'+
      '<option value="1440">24 heures</option>'+
      '</select></label></div>'+
      '<div class="admin-form-row">'+
      '<button type="button" class="btn" id="fm-local-on">Activer BETA (cet appareil)</button>'+
      '<button type="button" class="btn" id="fm-local-off">Stop BETA locale</button>'+
      '</div>'+
      '<div class="admin-form-row">'+
      '<button type="button" class="btn" id="fm-global-on">Activer pour TOUS</button>'+
      '<button type="button" class="btn btn-danger" id="fm-global-off">Désactiver pour tous</button>'+
      '</div>'+
      '<p class="admin-hint">Local = seulement ton navigateur (test).<br>Global = tous les visiteurs voient le mode libre.</p>'+
      '<p id="fm-msg" class="admin-msg"></p>';

    var closeBtn=document.getElementById("adm-close");
    if(closeBtn) admin.insertBefore(panel, closeBtn);
    else admin.appendChild(panel);

    function expiryFromSelect(){
      var mins=parseInt(document.getElementById("fm-duration").value,10)||0;
      if(!mins) return null;
      return Date.now()+mins*60*1000;
    }

    async function refreshStatus(){
      await resolveMode();
      applyUI();
      var el=document.getElementById("fm-status");
      if(!el) return;
      if(!freemode.active) el.textContent="Mode actuel : projet arts plastiques";
      else if(freemode.scope==="local"){
        var t=freemode.expires?(" expire "+new Date(freemode.expires).toLocaleString()):" (sans limite)";
        el.textContent="Mode actuel : BETA locale"+t;
      } else {
        var t2=freemode.expires?(" expire "+new Date(freemode.expires).toLocaleString()):" (sans limite)";
        el.textContent="Mode actuel : jeu libre GLOBAL"+t2;
      }
    }

    document.getElementById("fm-local-on").addEventListener("click", function(){
      writeLocal({active:true, expires:expiryFromSelect()});
      document.getElementById("fm-msg").textContent="Beta locale activée ✓";
      refreshStatus();
    });
    document.getElementById("fm-local-off").addEventListener("click", function(){
      writeLocal(null);
      document.getElementById("fm-msg").textContent="Beta locale désactivée";
      refreshStatus();
    });
    document.getElementById("fm-global-on").addEventListener("click", async function(){
      var msg=document.getElementById("fm-msg");
      try{
        await writeGlobalMode({active:true, expires:expiryFromSelect(), updated:new Date().toISOString()});
        msg.textContent="Mode global activé pour tous ✓";
        await refreshStatus();
      }catch(e){ msg.textContent="Erreur : "+e.message; }
    });
    document.getElementById("fm-global-off").addEventListener("click", async function(){
      var msg=document.getElementById("fm-msg");
      try{
        await writeGlobalMode({active:false, expires:null, updated:new Date().toISOString()});
        msg.textContent="Mode global désactivé";
        await refreshStatus();
      }catch(e){ msg.textContent="Erreur : "+e.message; }
    });
  }

  var tries=0;
  async function boot(){
    await resolveMode();
    applyUI();
    patchLoreSkip();
    ensureAdminPanel();
    var orig=window.__adminOpen;
    if(typeof orig==="function" && !orig._fmHook){
      window.__adminOpen=async function(){
        await orig.apply(this, arguments);
        ensureAdminPanel();
      };
      window.__adminOpen._fmHook=true;
    }
    if(tries++<10) setTimeout(boot, 500);
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
