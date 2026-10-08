(function(){
  const SCORES_URL="https://kvdb.io/Cv8UZtviGCJ763mChjGocC/scores";
  const LEVELS_URL="https://kvdb.io/Cv8UZtviGCJ763mChjGocC/levels";
  const ADMIN_CODE="33160";
  function formatTime(ms){const s=Math.floor(Number(ms)/1e3);return Math.floor(s/60)+":"+String(s%60).padStart(2,"0")}
  function parseTimeStr(str){const m=String(str||"").trim().match(/^(\d+):(\d{1,2})$/);if(!m)return null;return(parseInt(m[1],10)*60+parseInt(m[2],10))*1000}
  function esc(s){return String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}
  function looksLikeScore(o){return o&&typeof o==="object"&&(o.prenom||o.nom||o.name)&&(o.time!=null||o.timeStr)}
  async function fetchScores(){try{const r=await fetch(SCORES_URL+"?t="+Date.now(),{cache:"no-store"});if(!r.ok)return[];const d=await r.json();return Array.isArray(d)?d:[]}catch(e){return[]}}
  async function writeScores(scores){const r=await fetch(SCORES_URL,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(scores),cache:"no-store"});if(!r.ok)throw new Error("PUT "+r.status);return scores}
  async function fetchLevels(){try{const r=await fetch(LEVELS_URL+"?t="+Date.now(),{cache:"no-store"});if(!r.ok)return null;const d=await r.json();return Array.isArray(d)?d:null}catch(e){return null}}
  async function writeLevels(levels){const r=await fetch(LEVELS_URL,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(levels),cache:"no-store"});if(!r.ok)throw new Error("PUT levels "+r.status);return levels}
  function applyBadgeToTable(){
    const body=document.getElementById("results-body");
    if(!body)return;
    const rows=body.querySelectorAll("tr");
    if(!rows.length)return;
    const first=rows[0];
    const cells=first.querySelectorAll("td");
    if(!cells.length)return;
    const t=cells[0].textContent.trim();
    if(!t||t.indexOf("Aucun")>=0||t.indexOf("Chargement")>=0)return;
    first.classList.add("best-player");
    if(!cells[0].querySelector(".badge-best")){
      cells[0].innerHTML='<span class="badge-best" title="Meilleur joueur">👑 #1</span>';
    }
    for(let i=1;i<rows.length;i++)rows[i].classList.remove("best-player");
  }
  function watchResults(){
    const body=document.getElementById("results-body");
    if(!body||body.dataset.watched==="1")return;
    body.dataset.watched="1";
    new MutationObserver(function(){applyBadgeToTable()}).observe(body,{childList:true,subtree:true});
    applyBadgeToTable();
  }
  function renderScoresWithBadge(scores){
    const resultsBody=document.getElementById("results-body");
    if(!resultsBody)return;
    resultsBody.innerHTML="";
    if(!scores||!scores.length){
      resultsBody.innerHTML='<tr><td colspan="5" style="text-align:center;color:#a89060">Aucun score pour le moment.</td></tr>';
      return;
    }
    scores.forEach(function(s,i){
      const tr=document.createElement("tr");
      if(i===0)tr.className="best-player";
      const rank=i===0?'<span class="badge-best" title="Meilleur joueur">👑 #1</span>':String(i+1);
      tr.innerHTML="<td>"+rank+"</td><td>"+esc(s.prenom)+"</td><td>"+esc(s.nom)+"</td><td>"+esc(s.timeStr)+"</td><td>"+(s.fragments||12)+"/12</td>";
      resultsBody.appendChild(tr);
    });
  }
  function patchRenderScores(){
    try{window.renderScores=renderScoresWithBadge}catch(e){}
    try{if(typeof renderScores==="function")renderScores=renderScoresWithBadge}catch(e){}
  }
  function patchAuthButton(){
    const btn=document.getElementById("btn-auth");
    if(!btn||btn.dataset.badgePatched==="1")return;
    btn.dataset.badgePatched="1";
    btn.addEventListener("click",function(){
      setTimeout(applyBadgeToTable,300);
      setTimeout(applyBadgeToTable,800);
      setTimeout(applyBadgeToTable,1500);
    },true);
  }
  async function migrateLocalScores(){
    if(localStorage.getItem("pierre_migrated_v1")==="1")return;
    var found=[],keys=[],i,k,raw,data,list,s;
    for(i=0;i<localStorage.length;i++){k=localStorage.key(i);if(k)keys.push(k)}
    for(i=0;i<keys.length;i++){
      try{
        raw=localStorage.getItem(keys[i]);if(!raw||raw.length<2)continue;
        data=JSON.parse(raw);
        list=Array.isArray(data)?data:(data&&Array.isArray(data.scores)?data.scores:null);
        if(!list)continue;
        for(var j=0;j<list.length;j++){
          s=list[j];if(!looksLikeScore(s))continue;
          found.push({prenom:String(s.prenom||s.firstName||"?").trim(),nom:String(s.nom||s.lastName||s.name||"?").trim(),classe:s.classe||"5°8",time:Number(s.time)||0,timeStr:s.timeStr||formatTime(Number(s.time)||0),fragments:s.fragments||12,date:s.date||new Date().toISOString()});
        }
      }catch(e){}
    }
    localStorage.setItem("pierre_migrated_v1","1");
    if(!found.length)return;
    try{
      var remote=await fetchScores();
      var key=function(x){return(x.prenom+"|"+x.nom+"|"+x.time).toLowerCase()};
      var map=new Map();
      remote.forEach(function(x){map.set(key(x),x)});
      found.forEach(function(x){if(!map.has(key(x)))map.set(key(x),x)});
      await writeScores(Array.from(map.values()).sort(function(a,b){return a.time-b.time}));
    }catch(e){localStorage.removeItem("pierre_migrated_v1")}
  }
  var customLevelsCache=null;
  async function loadCustomLevels(){
    var remote=await fetchLevels();
    if(remote&&remote.length){customLevelsCache=remote;localStorage.setItem("pierre_custom_levels",JSON.stringify(remote));return remote}
    try{var local=JSON.parse(localStorage.getItem("pierre_custom_levels")||"null");if(Array.isArray(local)&&local.length){customLevelsCache=local;return local}}catch(e){}
    return null;
  }
  function patchMakeLevel(){
    if(typeof makeLevel!=="function")return;
    var original=makeLevel;
    window.__originalMakeLevel=original;
    function wrapped(i){
      var custom=customLevelsCache;
      if(custom&&custom[i]&&custom[i].name){
        var L=JSON.parse(JSON.stringify(custom[i]));
        L.platforms=L.platforms||[];L.spikes=L.spikes||[];
        L.fragments=(L.fragments||[]).map(function(f){return{x:f.x,y:f.y,collected:false}});
        L.groundY=L.groundY||500;L.width=L.width||2800;L.theme=L.theme||"cave";
        return L;
      }
      return original(i);
    }
    try{makeLevel=wrapped}catch(e){}
    window.makeLevel=wrapped;
  }
  function ensureAdminUI(){
    if(document.getElementById("admin-screen"))return;
    var start=document.getElementById("start-screen");
    if(start&&!document.getElementById("admin-gate")){
      var gate=document.createElement("div");
      gate.id="admin-gate";
      gate.innerHTML='<button type="button" id="admin-open-btn" aria-label="Admin">⚙</button><input type="password" id="admin-code-input" placeholder="code" autocomplete="off" inputmode="numeric" />';
      start.appendChild(gate);
      var input=document.getElementById("admin-code-input");
      var openBtn=document.getElementById("admin-open-btn");
      openBtn.addEventListener("click",function(e){e.preventDefault();e.stopPropagation();gate.classList.add("open");input.focus()});
      input.addEventListener("keydown",function(e){if(e.key==="Enter")tryAdminLogin()});
      input.addEventListener("change",tryAdminLogin);
      var h1=start.querySelector("h1");
      if(h1){
        var taps=0,tapTimer=null;
        h1.addEventListener("click",function(){
          taps++;clearTimeout(tapTimer);tapTimer=setTimeout(function(){taps=0},800);
          if(taps>=5){taps=0;gate.classList.add("open");input.focus()}
        });
      }
    }
    var admin=document.createElement("div");
    admin.id="admin-screen";
    admin.className="screen hidden";
    admin.innerHTML='<h1>Panneau Admin</h1><div class="admin-tabs"><button type="button" class="btn admin-tab active" data-tab="scores">Scores</button><button type="button" class="btn admin-tab" data-tab="levels">Stages</button><button type="button" class="btn admin-tab" data-tab="tools">Outils</button></div><div class="admin-panel" id="admin-panel-scores"><p class="admin-hint">Modifier, ajouter ou supprimer des scores.</p><div class="admin-scroll"><table class="admin-table"><thead><tr><th>#</th><th>Prénom</th><th>Nom</th><th>Temps</th><th>Frag.</th><th></th></tr></thead><tbody id="admin-scores-body"></tbody></table></div><div class="admin-form-row"><input id="adm-prenom" placeholder="Prénom" /><input id="adm-nom" placeholder="Nom" /><input id="adm-time" placeholder="1:30" /><input id="adm-frag" placeholder="12" value="12" style="width:70px" /><button type="button" class="btn" id="adm-add-score">Ajouter</button></div><button type="button" class="btn" id="adm-save-scores">Enregistrer</button><button type="button" class="btn btn-danger" id="adm-clear-scores">Tout effacer</button><p id="adm-scores-msg" class="admin-msg"></p></div><div class="admin-panel hidden" id="admin-panel-levels"><p class="admin-hint">Créer / modifier des stages (actifs après sauvegarde).</p><div class="admin-form-row"><select id="adm-level-select"></select><button type="button" class="btn" id="adm-level-new">Nouveau</button><button type="button" class="btn btn-danger" id="adm-level-del">Supprimer</button></div><div class="admin-form-col"><label>Nom <input id="adm-lv-name" /></label><label>Thème <select id="adm-lv-theme"><option value="cave">Grotte</option><option value="forest">Forêt</option><option value="temple">Temple</option></select></label><label>Largeur <input id="adm-lv-width" type="number" value="2800" /></label><label>Sol Y <input id="adm-lv-ground" type="number" value="500" /></label></div><p class="admin-hint">JSON (platforms, spikes, fragments) :</p><textarea id="adm-lv-json" rows="8" spellcheck="false"></textarea><div class="admin-form-row"><button type="button" class="btn" id="adm-lv-apply">Appliquer</button><button type="button" class="btn" id="adm-lv-save">Sauvegarder</button><button type="button" class="btn" id="adm-lv-reset">Origine</button></div><p id="adm-levels-msg" class="admin-msg"></p></div><div class="admin-panel hidden" id="admin-panel-tools"><p class="admin-hint">Export / import des scores.</p><button type="button" class="btn" id="adm-export-scores">Exporter scores</button><button type="button" class="btn" id="adm-import-scores">Importer scores</button><input type="file" id="adm-import-file" accept="application/json,.json" class="hidden" /><p id="adm-tools-msg" class="admin-msg"></p><p class="admin-hint" style="margin-top:16px">Code admin : 33160</p></div><button type="button" class="btn" id="adm-close">Fermer l\'admin</button>';
    document.getElementById("ui").appendChild(admin);
    admin.querySelectorAll(".admin-tab").forEach(function(btn){
      btn.addEventListener("click",function(){
        admin.querySelectorAll(".admin-tab").forEach(function(b){b.classList.remove("active")});
        btn.classList.add("active");
        admin.querySelectorAll(".admin-panel").forEach(function(p){p.classList.add("hidden")});
        document.getElementById("admin-panel-"+btn.dataset.tab).classList.remove("hidden");
      });
    });
    document.getElementById("adm-close").addEventListener("click",function(){
      admin.classList.add("hidden");
      document.getElementById("start-screen").classList.remove("hidden");
    });
    var draftScores=[],draftLevels=[],selectedLevel=0;
    function bindScoreRows(){
      var body=document.getElementById("admin-scores-body");
      body.innerHTML="";
      draftScores.forEach(function(s,i){
        var tr=document.createElement("tr");
        tr.innerHTML='<td>'+(i===0?"👑":(i+1))+'</td><td><input data-i="'+i+'" data-f="prenom" value="'+esc(s.prenom)+'" /></td><td><input data-i="'+i+'" data-f="nom" value="'+esc(s.nom)+'" /></td><td><input data-i="'+i+'" data-f="timeStr" value="'+esc(s.timeStr)+'" style="width:70px" /></td><td><input data-i="'+i+'" data-f="fragments" value="'+(s.fragments||12)+'" style="width:50px" /></td><td><button type="button" class="btn-mini" data-del="'+i+'">✕</button></td>';
        body.appendChild(tr);
      });
      body.querySelectorAll("input").forEach(function(inp){
        inp.addEventListener("change",function(){
          var i=+inp.dataset.i,f=inp.dataset.f;
          if(f==="timeStr"){var ms=parseTimeStr(inp.value);if(ms!=null){draftScores[i].timeStr=inp.value.trim();draftScores[i].time=ms}}
          else if(f==="fragments")draftScores[i].fragments=parseInt(inp.value,10)||12;
          else draftScores[i][f]=inp.value.trim();
        });
      });
      body.querySelectorAll("[data-del]").forEach(function(btn){
        btn.addEventListener("click",function(){draftScores.splice(+btn.dataset.del,1);bindScoreRows()});
      });
    }
    async function refreshAdminScores(){draftScores=await fetchScores();bindScoreRows()}
    document.getElementById("adm-add-score").addEventListener("click",function(){
      var prenom=document.getElementById("adm-prenom").value.trim();
      var nom=document.getElementById("adm-nom").value.trim();
      var timeStr=document.getElementById("adm-time").value.trim()||"1:00";
      var ms=parseTimeStr(timeStr);if(ms==null)ms=60000;
      var frag=parseInt(document.getElementById("adm-frag").value,10)||12;
      if(!prenom||!nom){document.getElementById("adm-scores-msg").textContent="Prénom et nom requis.";return}
      draftScores.push({prenom:prenom,nom:nom,classe:"5°8",time:ms,timeStr:formatTime(ms),fragments:frag,date:new Date().toISOString()});
      draftScores.sort(function(a,b){return a.time-b.time});
      bindScoreRows();
      document.getElementById("adm-prenom").value="";document.getElementById("adm-nom").value="";
      document.getElementById("adm-scores-msg").textContent="Ajouté (enregistre ensuite).";
    });
    document.getElementById("adm-save-scores").addEventListener("click",async function(){
      var msg=document.getElementById("adm-scores-msg");
      try{
        document.querySelectorAll("#admin-scores-body input").forEach(function(inp){
          var i=+inp.dataset.i,f=inp.dataset.f;if(!draftScores[i])return;
          if(f==="timeStr"){var ms=parseTimeStr(inp.value);if(ms!=null){draftScores[i].timeStr=inp.value.trim();draftScores[i].time=ms}}
          else if(f==="fragments")draftScores[i].fragments=parseInt(inp.value,10)||12;
          else draftScores[i][f]=inp.value.trim();
        });
        draftScores.sort(function(a,b){return a.time-b.time});
        await writeScores(draftScores);msg.textContent="Scores enregistrés ✓";bindScoreRows();
      }catch(e){msg.textContent="Erreur : "+e.message}
    });
    document.getElementById("adm-clear-scores").addEventListener("click",async function(){
      if(!confirm("Effacer TOUS les scores ?"))return;
      try{await writeScores([]);draftScores=[];bindScoreRows();document.getElementById("adm-scores-msg").textContent="Tous les scores effacés."}
      catch(e){document.getElementById("adm-scores-msg").textContent="Erreur : "+e.message}
    });
    function defaultLevelTemplate(n){
      return{name:"Nouveau stage "+n,width:2800,groundY:500,theme:"cave",
        platforms:[{x:140,y:420,w:100,h:16},{x:280,y:360,w:90,h:16},{x:420,y:300,w:110,h:16},{x:600,y:340,w:100,h:16}],
        spikes:[{x:250,y:484,w:50}],fragments:[{x:450,y:260},{x:700,y:280},{x:1000,y:220},{x:1400,y:240}],exitX:2600};
    }
    function fillLevelSelect(){
      var sel=document.getElementById("adm-level-select");sel.innerHTML="";
      draftLevels.forEach(function(L,i){var o=document.createElement("option");o.value=i;o.textContent=(i+1)+". "+(L.name||"Sans nom");sel.appendChild(o)});
      if(draftLevels.length){sel.value=String(Math.min(selectedLevel,draftLevels.length-1));showLevelEditor(+sel.value)}
      else document.getElementById("adm-lv-json").value="";
    }
    function showLevelEditor(i){
      selectedLevel=i;var L=draftLevels[i];if(!L)return;
      document.getElementById("adm-lv-name").value=L.name||"";
      document.getElementById("adm-lv-theme").value=L.theme||"cave";
      document.getElementById("adm-lv-width").value=L.width||2800;
      document.getElementById("adm-lv-ground").value=L.groundY||500;
      var copy=JSON.parse(JSON.stringify(L));
      delete copy.name;delete copy.theme;delete copy.width;delete copy.groundY;
      document.getElementById("adm-lv-json").value=JSON.stringify(copy,null,2);
    }
    async function initLevelsPanel(){
      var remote=await fetchLevels();
      if(remote&&remote.length)draftLevels=remote;
      else if(typeof makeLevel==="function"){
        draftLevels=[];var src=window.__originalMakeLevel||makeLevel;
        for(var i=0;i<3;i++){
          try{var L=src(i);if(L&&L.name){var clean=JSON.parse(JSON.stringify(L));if(clean.fragments)clean.fragments=clean.fragments.map(function(f){return{x:f.x,y:f.y}});draftLevels.push(clean)}}catch(e){break}
        }
      }
      if(!draftLevels.length)draftLevels=[defaultLevelTemplate(1)];
      fillLevelSelect();
    }
    document.getElementById("adm-level-select").addEventListener("change",function(e){showLevelEditor(+e.target.value)});
    document.getElementById("adm-level-new").addEventListener("click",function(){
      draftLevels.push(defaultLevelTemplate(draftLevels.length+1));selectedLevel=draftLevels.length-1;fillLevelSelect();
      document.getElementById("adm-levels-msg").textContent="Stage ajouté.";
    });
    document.getElementById("adm-level-del").addEventListener("click",function(){
      if(draftLevels.length<=1){document.getElementById("adm-levels-msg").textContent="Il faut au moins un stage.";return}
      draftLevels.splice(selectedLevel,1);selectedLevel=Math.max(0,selectedLevel-1);fillLevelSelect();
    });
    document.getElementById("adm-lv-apply").addEventListener("click",function(){
      var msg=document.getElementById("adm-levels-msg");
      try{
        var extra=JSON.parse(document.getElementById("adm-lv-json").value);
        var w=parseInt(document.getElementById("adm-lv-width").value,10)||2800;
        draftLevels[selectedLevel]={name:document.getElementById("adm-lv-name").value.trim()||"Stage",theme:document.getElementById("adm-lv-theme").value,width:w,groundY:parseInt(document.getElementById("adm-lv-ground").value,10)||500,platforms:extra.platforms||[],spikes:extra.spikes||[],fragments:extra.fragments||[],exitX:extra.exitX||w-100};
        fillLevelSelect();msg.textContent="Stage mis à jour.";
      }catch(e){msg.textContent="JSON invalide : "+e.message}
    });
    document.getElementById("adm-lv-save").addEventListener("click",async function(){
      var msg=document.getElementById("adm-levels-msg");
      try{
        document.getElementById("adm-lv-apply").click();
        await writeLevels(draftLevels);
        localStorage.setItem("pierre_custom_levels",JSON.stringify(draftLevels));
        customLevelsCache=draftLevels;patchMakeLevel();
        msg.textContent="Stages sauvegardés ✓";
      }catch(e){msg.textContent="Erreur : "+e.message}
    });
    document.getElementById("adm-lv-reset").addEventListener("click",async function(){
      if(!confirm("Revenir aux stages d'origine ?"))return;
      try{
        await writeLevels([]);localStorage.removeItem("pierre_custom_levels");customLevelsCache=null;
        if(window.__originalMakeLevel){try{makeLevel=window.__originalMakeLevel}catch(e){}window.makeLevel=window.__originalMakeLevel}
        draftLevels=[];
        for(var i=0;i<3;i++){
          try{var L=(window.__originalMakeLevel||makeLevel)(i);var clean=JSON.parse(JSON.stringify(L));if(clean.fragments)clean.fragments=clean.fragments.map(function(f){return{x:f.x,y:f.y}});draftLevels.push(clean)}catch(e){break}
        }
        fillLevelSelect();document.getElementById("adm-levels-msg").textContent="Stages d'origine restaurés.";
      }catch(e){document.getElementById("adm-levels-msg").textContent="Erreur : "+e.message}
    });
    document.getElementById("adm-export-scores").addEventListener("click",async function(){
      var scores=await fetchScores();
      var blob=new Blob([JSON.stringify(scores,null,2)],{type:"application/json"});
      var a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="scores-pierre-mysterieuse.json";a.click();
      document.getElementById("adm-tools-msg").textContent="Export téléchargé.";
    });
    document.getElementById("adm-import-scores").addEventListener("click",function(){document.getElementById("adm-import-file").click()});
    document.getElementById("adm-import-file").addEventListener("change",async function(e){
      var file=e.target.files&&e.target.files[0];if(!file)return;
      try{
        var data=JSON.parse(await file.text());
        if(!Array.isArray(data))throw new Error("JSON = tableau requis");
        data.sort(function(a,b){return(a.time||0)-(b.time||0)});
        await writeScores(data);
        document.getElementById("adm-tools-msg").textContent=data.length+" scores importés ✓";
      }catch(err){document.getElementById("adm-tools-msg").textContent="Import échoué : "+err.message}
    });
    window.__adminOpen=async function(){
      document.querySelectorAll(".screen").forEach(function(s){s.classList.add("hidden")});
      admin.classList.remove("hidden");
      await refreshAdminScores();
      await initLevelsPanel();
    };
  }
  function tryAdminLogin(){
    var input=document.getElementById("admin-code-input");
    if(!input)return;
    if(input.value.trim()===ADMIN_CODE){
      input.value="";
      ensureAdminUI();
      if(window.__adminOpen)window.__adminOpen();
    }
  }
  function fixClearButton(){
    var btn=document.getElementById("btn-clear");
    if(!btn||btn.dataset.fixed==="1")return;
    btn.dataset.fixed="1";
    btn.addEventListener("click",async function(e){
      e.preventDefault();e.stopImmediatePropagation();
      if(!confirm("Effacer TOUS les scores de la classe ?"))return;
      var prev=btn.textContent;btn.textContent="Suppression...";btn.disabled=true;
      try{
        await writeScores([]);
        renderScoresWithBadge([]);
        btn.textContent="Scores effacés ✓";
        setTimeout(function(){btn.textContent=prev;btn.disabled=false},1500);
      }catch(err){alert("Erreur réseau");btn.textContent=prev;btn.disabled=false}
    },true);
  }
  function checkUrlAdmin(){
    try{
      var p=new URLSearchParams(location.search);
      if(p.get("admin")===ADMIN_CODE){ensureAdminUI();if(window.__adminOpen)window.__adminOpen()}
    }catch(e){}
  }
  async function boot(){
    ensureAdminUI();
    watchResults();
    patchRenderScores();
    patchAuthButton();
    fixClearButton();
    migrateLocalScores();
    await loadCustomLevels();
    patchMakeLevel();
    checkUrlAdmin();
    setTimeout(function(){patchRenderScores();patchMakeLevel();patchAuthButton();fixClearButton();watchResults();ensureAdminUI()},500);
    setTimeout(function(){patchRenderScores();patchMakeLevel();patchAuthButton();watchResults();applyBadgeToTable()},1500);
    setTimeout(function(){patchRenderScores();applyBadgeToTable()},3000);
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);
  else boot();
})();
