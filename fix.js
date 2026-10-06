(function(){
  const SCORES_URL="https://kvdb.io/Cv8UZtviGCJ763mChjGocC/scores";
  function formatTime(ms){const s=Math.floor(ms/1e3);return Math.floor(s/60)+":"+String(s%60).padStart(2,"0")}
  function looksLikeScore(o){return o&&typeof o==="object"&&(o.prenom||o.nom||o.name)&&(o.time!=null||o.timeStr)}
  async function fetchScores(){
    try{const r=await fetch(SCORES_URL+"?t="+Date.now(),{cache:"no-store"});if(!r.ok)return[];const d=await r.json();return Array.isArray(d)?d:[]}
    catch(e){return[]}
  }
  async function writeScores(scores){
    const r=await fetch(SCORES_URL,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(scores),cache:"no-store"});
    if(!r.ok)throw new Error("PUT "+r.status);
    return scores;
  }
  async function migrateLocalScores(){
    if(localStorage.getItem("pierre_migrated_v1")==="1")return;
    const found=[];
    const keys=[];
    for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k)keys.push(k)}
    for(const k of keys){
      try{
        const raw=localStorage.getItem(k);if(!raw||raw.length<2)continue;
        const data=JSON.parse(raw);
        const list=Array.isArray(data)?data:(data&&Array.isArray(data.scores)?data.scores:null);
        if(!list)continue;
        for(const s of list){
          if(!looksLikeScore(s))continue;
          found.push({
            prenom:String(s.prenom||s.firstName||"?").trim(),
            nom:String(s.nom||s.lastName||s.name||"?").trim(),
            classe:s.classe||"5°8",
            time:Number(s.time)||0,
            timeStr:s.timeStr||formatTime(Number(s.time)||0),
            fragments:s.fragments||12,
            date:s.date||new Date().toISOString()
          });
        }
      }catch(e){}
    }
    localStorage.setItem("pierre_migrated_v1","1");
    if(!found.length)return;
    try{
      const remote=await fetchScores();
      const key=s=>(s.prenom+"|"+s.nom+"|"+s.time).toLowerCase();
      const map=new Map();
      for(const s of remote)map.set(key(s),s);
      for(const s of found){if(!map.has(key(s)))map.set(key(s),s)}
      const merged=[...map.values()].sort((a,b)=>a.time-b.time);
      await writeScores(merged);
      console.log("[Pierre] Migration: "+found.length+" score(s) local(aux) synchronisé(s)");
    }catch(e){
      console.warn("[Pierre] Migration échouée",e);
      localStorage.removeItem("pierre_migrated_v1");
    }
  }
  function fixClearButton(){
    const btn=document.getElementById("btn-clear");
    if(!btn||btn.dataset.fixed==="1")return;
    btn.dataset.fixed="1";
    btn.addEventListener("click",async function onClear(e){
      e.preventDefault();
      e.stopImmediatePropagation();
      if(!confirm("Effacer TOUS les scores de la classe ?"))return;
      const prev=btn.textContent;
      btn.textContent="Suppression...";
      btn.disabled=true;
      try{
        await writeScores([]);
        const body=document.getElementById("results-body");
        if(body)body.innerHTML='<tr><td colspan="5" style="text-align:center;color:#a89060">Aucun score pour le moment.</td></tr>';
        btn.textContent="Scores effacés ✓";
        setTimeout(function(){btn.textContent=prev;btn.disabled=false},1500);
      }catch(err){
        console.error(err);
        alert("Erreur réseau : impossible d'effacer. Réessaie.");
        btn.textContent=prev;
        btn.disabled=false;
      }
    },true);
  }
  migrateLocalScores();
  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded",fixClearButton);
  }else{
    fixClearButton();
  }
  setTimeout(fixClearButton,1000);
  setTimeout(fixClearButton,3000);
})();
