(function(){
  const ADMIN_CODE="33160";
  const SCORES_URL="https://kvdb.io/Cv8UZtviGCJ763mChjGocC/scores";
  const MODE_URL="https://kvdb.io/Cv8UZtviGCJ763mChjGocC/freemode";

  function ensureGear(){
    if(document.getElementById("admin-gear"))return;
    const g=document.createElement("button");
    g.id="admin-gear";g.type="button";g.setAttribute("aria-label","Admin");
    g.textContent="⚙";
    g.style.cssText="position:fixed;top:10px;right:10px;z-index:9999;width:44px;height:44px;border-radius:50%;border:1px solid #5a4a30;background:rgba(30,24,16,0.85);color:#c9b896;font-size:1.3rem;cursor:pointer;opacity:0.35";
    g.onmouseenter=()=>g.style.opacity="1";
    g.onmouseleave=()=>g.style.opacity="0.35";
    g.onclick=()=>openGate();
    document.body.appendChild(g);
  }

  function openGate(){
    let gate=document.getElementById("admin-gate-modal");
    if(!gate){
      gate=document.createElement("div");
      gate.id="admin-gate-modal";
      gate.style.cssText="position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,0.75);display:flex;align-items:center;justify-content:center";
      gate.innerHTML='<div style="background:#1a120b;border:1px solid #5a4a30;padding:24px;border-radius:12px;min-width:280px;text-align:center"><p style="color:#c9b896">Code admin</p><input id="adm-code-in" type="password" style="padding:8px;width:90%;margin:8px 0"/><br><button class="btn" id="adm-code-ok">OK</button> <button class="btn" id="adm-code-cancel">Annuler</button><p id="adm-code-err" style="color:#c66"></p></div>';
      document.body.appendChild(gate);
      document.getElementById("adm-code-cancel").onclick=()=>gate.remove();
      document.getElementById("adm-code-ok").onclick=()=>{
        if(document.getElementById("adm-code-in").value===ADMIN_CODE){gate.remove();openAdmin();}
        else document.getElementById("adm-code-err").textContent="Code incorrect";
      };
    }
  }

  function openAdmin(){
    let admin=document.getElementById("admin-screen");
    if(!admin){
      admin=document.createElement("div");
      admin.id="admin-screen";
      admin.className="screen";
      admin.style.cssText="position:fixed;inset:0;z-index:9000;background:#120e0a;overflow:auto;padding:20px;color:#c9b896";
      admin.innerHTML=`\n        <h2 style="color:#e8c547">Admin</h2>\n        <div class="admin-tabs" style="display:flex;gap:8px;flex-wrap:wrap;margin:12px 0">\n          <button type="button" class="btn admin-tab active" data-tab="scores">Scores</button>\n          <button type="button" class="btn admin-tab" data-tab="cheats">Cheats</button>\n          <button type="button" class="btn admin-tab" data-tab="freemode">Jeu libre</button>\n        </div>\n        <div id="admin-panel-scores" class="admin-panel">\n          <p>Gestion des scores classe</p>\n          <button type="button" class="btn" id="adm-refresh-scores">Rafraîchir</button>\n          <button type="button" class="btn btn-danger" id="adm-clear-scores">Effacer scores</button>\n          <pre id="adm-scores-pre" style="text-align:left;font-size:0.8rem;max-height:200px;overflow:auto;background:#0a0806;padding:8px"></pre>\n        </div>\n        <div id="admin-panel-cheats" class="admin-panel hidden">\n          <p>Cheats actifs tout de suite</p>\n          <label><input type="checkbox" id="cheat-fly"/> Fly</label>\n          <label><input type="checkbox" id="cheat-god"/> Dieu</label><br>\n          <label>Vitesse <input type="range" id="cheat-speed" min="0.5" max="4" step="0.1" value="1"/></label>\n          <label>Saut <input type="range" id="cheat-jump" min="0.5" max="3" step="0.1" value="1"/></label>\n          <label>Gravité <input type="range" id="cheat-grav" min="0.2" max="2.5" step="0.1" value="1"/></label>\n        </div>\n        <div id="admin-panel-freemode" class="admin-panel hidden">\n          <p>Version libre (secrets, hors cadre arts). Scores classe conservés.</p>\n          <p id="fm-status">…</p>\n          <label>Durée <select id="fm-duration"><option value="0">Sans limite</option><option value="15">15 min</option><option value="60">1 h</option><option value="360">6 h</option><option value="1440">24 h</option></select></label><br>\n          <button type="button" class="btn" id="fm-local-on">BETA cet appareil</button>\n          <button type="button" class="btn" id="fm-local-off">Stop BETA</button>\n          <button type="button" class="btn" id="fm-global-on">Activer pour TOUS</button>\n          <button type="button" class="btn btn-danger" id="fm-global-off">Désactiver tous</button>\n          <p id="fm-msg"></p>\n        </div>\n        <button type="button" class="btn" id="adm-close" style="margin-top:16px">Fermer</button>\n      `;
      document.body.appendChild(admin);
      bindAdmin(admin);
    }
    admin.classList.remove("hidden");
    admin.style.display="block";
  }

  function bindAdmin(admin){
    admin.querySelectorAll(".admin-tab").forEach(btn=>{
      btn.onclick=()=>{
        admin.querySelectorAll(".admin-tab").forEach(b=>b.classList.remove("active"));
        btn.classList.add("active");
        admin.querySelectorAll(".admin-panel").forEach(p=>p.classList.add("hidden"));
        const panel=document.getElementById("admin-panel-"+btn.dataset.tab);
        if(panel)panel.classList.remove("hidden");
        if(btn.dataset.tab==="freemode")refreshFm();
        if(btn.dataset.tab==="scores")refreshScores();
      };
    });
    document.getElementById("adm-close").onclick=()=>{admin.classList.add("hidden");admin.style.display="none";};
    window.__cheats=window.__cheats||{speed:1,jump:1,gravity:1,fly:false,god:false};
    function applyCheats(){
      const C=window.__cheats;
      C.fly=document.getElementById("cheat-fly").checked;
      C.god=document.getElementById("cheat-god").checked;
      C.speed=parseFloat(document.getElementById("cheat-speed").value)||1;
      C.jump=parseFloat(document.getElementById("cheat-jump").value)||1;
      C.gravity=parseFloat(document.getElementById("cheat-grav").value)||1;
    }
    ["cheat-fly","cheat-god"].forEach(id=>document.getElementById(id).onchange=applyCheats);
    ["cheat-speed","cheat-jump","cheat-grav"].forEach(id=>document.getElementById(id).oninput=applyCheats);
    async function refreshScores(){
      try{
        const r=await fetch(SCORES_URL+"?t="+Date.now(),{cache:"no-store"});
        const d=r.ok?await r.json():[];
        document.getElementById("adm-scores-pre").textContent=JSON.stringify(d,null,2);
      }catch(e){document.getElementById("adm-scores-pre").textContent=String(e);}
    }
    document.getElementById("adm-refresh-scores").onclick=refreshScores;
    document.getElementById("adm-clear-scores").onclick=async()=>{
      if(!confirm("Effacer TOUS les scores ?"))return;
      await fetch(SCORES_URL,{method:"PUT",headers:{"Content-Type":"application/json"},body:"[]"});
      refreshScores();
    };
    function exp(){const m=parseInt(document.getElementById("fm-duration").value,10)||0;return m?Date.now()+m*60000:null;}
    async function refreshFm(){
      let local=null;try{local=JSON.parse(localStorage.getItem("pierre_freemode_local")||"null")}catch(e){}
      let global=null;try{const r=await fetch(MODE_URL+"?t="+Date.now(),{cache:"no-store"});if(r.ok)global=await r.json()}catch(e){}
      const el=document.getElementById("fm-status");
      if(local&&local.active)el.textContent="BETA locale active";
      else if(global&&global.active)el.textContent="GLOBAL actif";
      else el.textContent="Mode arts plastiques";
    }
    document.getElementById("fm-local-on").onclick=()=>{localStorage.setItem("pierre_freemode_local",JSON.stringify({active:true,expires:exp()}));document.getElementById("fm-msg").textContent="BETA ON";location.reload();};
    document.getElementById("fm-local-off").onclick=()=>{localStorage.removeItem("pierre_freemode_local");document.getElementById("fm-msg").textContent="BETA OFF";location.reload();};
    document.getElementById("fm-global-on").onclick=async()=>{await fetch(MODE_URL,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({active:true,expires:exp()})});document.getElementById("fm-msg").textContent="GLOBAL ON";location.reload();};
    document.getElementById("fm-global-off").onclick=async()=>{await fetch(MODE_URL,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({active:false})});document.getElementById("fm-msg").textContent="GLOBAL OFF";location.reload();};
  }

  function boot(){
    ensureGear();
    if(location.search.includes("admin=33160"))openAdmin();
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);
  else boot();
  window.__adminOpen=openAdmin;
})();
