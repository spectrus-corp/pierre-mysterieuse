(function(){
  var tries=0;
  function enhance(){
    var orig=window.__adminOpen;
    if(typeof orig!=="function"){if(tries++<20)setTimeout(enhance,300);return;}
    if(orig._enhanced)return;
    window.__adminOpen=function(){
      orig.apply(this,arguments);
      setTimeout(addExtras,50);
    };
    window.__adminOpen._enhanced=true;
  }
  function addExtras(){
    var card=document.querySelector(".admin-card");
    if(!card||document.getElementById("pane-jeu"))return;
    var tabs=card.querySelector(".admin-tabs");
    if(!tabs)return;
    [["jeu","Partie"],["outils","Outils"]].forEach(function(pair){
      if(tabs.querySelector('[data-tab="'+pair[0]+'"]'))return;
      var b=document.createElement("button");
      b.type="button";b.dataset.tab=pair[0];b.textContent=pair[1];
      tabs.appendChild(b);
      b.onclick=function(){
        tabs.querySelectorAll("button").forEach(function(x){x.classList.remove("active");});
        b.classList.add("active");
        card.querySelectorAll(".admin-pane").forEach(function(p){p.classList.remove("active");});
        var pane=document.getElementById("pane-"+pair[0]);
        if(pane)pane.classList.add("active");
      };
    });
    var scores=document.getElementById("pane-scores");
    if(scores&&!document.getElementById("adm-add-score")){
      var wrap=document.createElement("div");
      wrap.innerHTML='<p style="color:#a89060;font-size:0.8rem;margin-top:8px">Ajouter un score</p>'+
        '<div class="admin-row"><div class="admin-field"><label>Prénom</label><input id="adm-add-prenom"/></div><div class="admin-field"><label>Nom</label><input id="adm-add-nom"/></div></div>'+
        '<div class="admin-row"><div class="admin-field"><label>Temps (sec)</label><input id="adm-add-sec" type="number" value="30"/></div><div class="admin-field"><label>Fragments</label><input id="adm-add-frag" type="number" value="4"/></div></div>'+
        '<div class="admin-row"><button type="button" class="btn" id="adm-add-score">Ajouter</button></div>';
      scores.appendChild(wrap);
      document.getElementById("adm-add-score").onclick=async function(){
        var prenom=(document.getElementById("adm-add-prenom").value||"").trim();
        var nom=(document.getElementById("adm-add-nom").value||"").trim();
        var sec=parseFloat(document.getElementById("adm-add-sec").value)||30;
        var frag=parseInt(document.getElementById("adm-add-frag").value,10)||0;
        if(!prenom||!nom)return;
        try{
          var r=await fetch("https://kvdb.io/Cv8UZtviGCJ763mChjGocC/scores?t="+Date.now(),{cache:"no-store"});
          var data=r.ok?await r.json():[];if(!Array.isArray(data))data=[];
          data.push({prenom:prenom,nom:nom,classe:"5°8",time:sec*1000,fragments:frag,date:new Date().toISOString()});
          await fetch("https://kvdb.io/Cv8UZtviGCJ763mChjGocC/scores",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)});
          var msg=document.getElementById("adm-scores-msg");if(msg)msg.textContent="Score ajouté ✓";
          var ref=document.getElementById("adm-refresh");if(ref)ref.click();
        }catch(e){alert(e.message);}
      };
    }
    if(!document.getElementById("pane-jeu")){
      var jeu=document.createElement("div");
      jeu.id="pane-jeu";jeu.className="admin-pane";
      jeu.innerHTML='<p>Contrôles de partie.</p><div class="admin-status" id="adm-game-status">—</div>'+
        '<div class="admin-row"><button type="button" class="btn" id="adm-lvl0">Niv.1</button><button type="button" class="btn" id="adm-lvl1">Niv.2</button><button type="button" class="btn" id="adm-lvl2">Niv.3</button></div>'+
        '<div class="admin-row"><button type="button" class="btn" id="adm-inf">Infini ∞</button><button type="button" class="btn" id="adm-reset-pos">Reset pos</button></div>'+
        '<div class="admin-row"><button type="button" class="btn" id="adm-all-frag">Tous fragments</button></div>'+
        '<p class="admin-msg" id="adm-jeu-msg"></p>';
      var closeRow=card.querySelector(".admin-close-row");
      if(closeRow)card.insertBefore(jeu,closeRow);else card.appendChild(jeu);
      function go(i){
        document.getElementById("admin-overlay").classList.add("hidden");
        window.__useInf=false;window.__infLevel=null;
        ["start-screen","win-screen","lore-screen","results-screen"].forEach(function(id){var el=document.getElementById(id);if(el)el.classList.add("hidden");});
        if(typeof startLevel==="function")startLevel(i);
      }
      document.getElementById("adm-lvl0").onclick=function(){go(0);};
      document.getElementById("adm-lvl1").onclick=function(){go(1);};
      document.getElementById("adm-lvl2").onclick=function(){go(2);};
      document.getElementById("adm-inf").onclick=function(){
        document.getElementById("admin-overlay").classList.add("hidden");
        if(typeof window.startInfiniteMode==="function")window.startInfiniteMode();
      };
      document.getElementById("adm-reset-pos").onclick=function(){
        if(window.__player){window.__player.x=60;window.__player.y=300;window.__player.vx=0;window.__player.vy=0;}
        if(typeof resetPlayer==="function")try{resetPlayer();}catch(e){}
        document.getElementById("adm-jeu-msg").textContent="Position reset";
      };
      document.getElementById("adm-all-frag").onclick=function(){
        var L=window.__level;if(!L||!L.fragments)return;
        L.fragments.forEach(function(f){f.collected=true;});
        document.getElementById("adm-jeu-msg").textContent="Fragments OK";
      };
      var st=document.getElementById("adm-game-status");
      if(st)st.textContent="État : "+(window.__state||"?")+" · X : "+(typeof window.__gamePlayerX==="number"?Math.floor(window.__gamePlayerX):"—");
    }
    if(!document.getElementById("pane-outils")){
      var outils=document.createElement("div");
      outils.id="pane-outils";outils.className="admin-pane";
      outils.innerHTML='<p>Outils.</p>'+
        '<div class="admin-row"><button type="button" class="btn" id="adm-export">Exporter scores</button><button type="button" class="btn" id="adm-clear-local">Vider cache local</button></div>'+
        '<div class="admin-field"><label>Importer JSON</label><textarea id="adm-import-json" rows="3" style="width:100%;background:#0e0a07;border:1px solid #5a4030;color:#e8dcc8;border-radius:8px;padding:8px;font-size:12px"></textarea></div>'+
        '<div class="admin-row"><button type="button" class="btn" id="adm-import">Importer</button></div>'+
        '<p class="admin-msg" id="adm-outils-msg"></p>';
      var closeRow2=card.querySelector(".admin-close-row");
      if(closeRow2)card.insertBefore(outils,closeRow2);else card.appendChild(outils);
      document.getElementById("adm-export").onclick=async function(){
        try{
          var r=await fetch("https://kvdb.io/Cv8UZtviGCJ763mChjGocC/scores?t="+Date.now(),{cache:"no-store"});
          var data=r.ok?await r.json():[];
          var a=document.createElement("a");
          a.href=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:"application/json"}));
          a.download="scores-5e8.json";a.click();
          document.getElementById("adm-outils-msg").textContent="Export OK";
        }catch(e){document.getElementById("adm-outils-msg").textContent=String(e);}
      };
      document.getElementById("adm-clear-local").onclick=function(){
        try{localStorage.removeItem("pierre_freemode_local");localStorage.removeItem("pierre_inf_best");}catch(e){}
        document.getElementById("adm-outils-msg").textContent="Cache vidé";
      };
      document.getElementById("adm-import").onclick=async function(){
        try{
          var data=JSON.parse(document.getElementById("adm-import-json").value);
          if(!Array.isArray(data))throw new Error("tableau requis");
          await fetch("https://kvdb.io/Cv8UZtviGCJ763mChjGocC/scores",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)});
          document.getElementById("adm-outils-msg").textContent="Import OK ("+data.length+")";
        }catch(e){document.getElementById("adm-outils-msg").textContent=String(e);}
      };
    }
    var cheats=document.getElementById("pane-cheats");
    if(cheats&&!document.getElementById("adm-fly-tip")){
      var tip=document.createElement("p");
      tip.id="adm-fly-tip";
      tip.style.cssText="color:#a89060;font-size:0.82rem";
      tip.innerHTML="Fly : <strong>Espace</strong> monter · <strong>↓ / S</strong> descendre · flèches se déplacer.";
      cheats.insertBefore(tip,cheats.firstChild);
    }
  }
  enhance();
})();
