(function(){
  window.__cheats = window.__cheats || { speed:1, jump:1, gravity:1, fly:false, god:false };

  function ensureCheatsTab(){
    var admin = document.getElementById("admin-screen");
    if(!admin) return;
    if(document.getElementById("admin-panel-cheats")) return;

    var tabs = admin.querySelector(".admin-tabs");
    if(tabs){
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn admin-tab";
      btn.dataset.tab = "cheats";
      btn.textContent = "Cheats";
      tabs.appendChild(btn);
      btn.addEventListener("click", function(){
        admin.querySelectorAll(".admin-tab").forEach(function(b){ b.classList.remove("active"); });
        btn.classList.add("active");
        admin.querySelectorAll(".admin-panel").forEach(function(p){ p.classList.add("hidden"); });
        document.getElementById("admin-panel-cheats").classList.remove("hidden");
      });
    }

    var panel = document.createElement("div");
    panel.id = "admin-panel-cheats";
    panel.className = "admin-panel hidden";
    panel.innerHTML =
      '<p class="admin-hint">Réglages de triche (actifs immédiatement en jeu).</p>'+
      '<div class="cheat-row"><label><input type="checkbox" id="cheat-fly"/> Mode Fly (Espace = monter, ↓/S = descendre)</label></div>'+
      '<div class="cheat-row"><label><input type="checkbox" id="cheat-god"/> Mode Dieu (invincible aux pics)</label></div>'+
      '<div class="cheat-row"><label>Vitesse × <span id="cheat-speed-val">1.0</span></label>'+
      '<input type="range" id="cheat-speed" min="0.5" max="4" step="0.1" value="1"/></div>'+
      '<div class="cheat-row"><label>Saut × <span id="cheat-jump-val">1.0</span></label>'+
      '<input type="range" id="cheat-jump" min="0.5" max="3" step="0.1" value="1"/></div>'+
      '<div class="cheat-row"><label>Gravité × <span id="cheat-grav-val">1.0</span></label>'+
      '<input type="range" id="cheat-grav" min="0.2" max="2.5" step="0.1" value="1"/></div>'+
      '<div class="cheat-row" style="margin-top:12px">'+
      '<button type="button" class="btn" id="cheat-reset">Réinitialiser</button>'+
      '<button type="button" class="btn" id="cheat-max">Max power</button>'+
      '</div>'+
      '<p id="cheat-msg" class="admin-msg"></p>';

    var closeBtn = document.getElementById("adm-close");
    if(closeBtn) admin.insertBefore(panel, closeBtn);
    else admin.appendChild(panel);

    function syncUI(){
      var C = window.__cheats;
      document.getElementById("cheat-fly").checked = !!C.fly;
      document.getElementById("cheat-god").checked = !!C.god;
      document.getElementById("cheat-speed").value = C.speed;
      document.getElementById("cheat-jump").value = C.jump;
      document.getElementById("cheat-grav").value = C.gravity;
      document.getElementById("cheat-speed-val").textContent = Number(C.speed).toFixed(1);
      document.getElementById("cheat-jump-val").textContent = Number(C.jump).toFixed(1);
      document.getElementById("cheat-grav-val").textContent = Number(C.gravity).toFixed(1);
    }

    function applyFromUI(){
      var C = window.__cheats;
      C.fly = document.getElementById("cheat-fly").checked;
      C.god = document.getElementById("cheat-god").checked;
      C.speed = parseFloat(document.getElementById("cheat-speed").value) || 1;
      C.jump = parseFloat(document.getElementById("cheat-jump").value) || 1;
      C.gravity = parseFloat(document.getElementById("cheat-grav").value) || 1;
      document.getElementById("cheat-speed-val").textContent = C.speed.toFixed(1);
      document.getElementById("cheat-jump-val").textContent = C.jump.toFixed(1);
      document.getElementById("cheat-grav-val").textContent = C.gravity.toFixed(1);
      document.getElementById("cheat-msg").textContent = "Appliqué ✓";
    }

    ["cheat-fly","cheat-god"].forEach(function(id){
      document.getElementById(id).addEventListener("change", applyFromUI);
    });
    ["cheat-speed","cheat-jump","cheat-grav"].forEach(function(id){
      document.getElementById(id).addEventListener("input", applyFromUI);
    });
    document.getElementById("cheat-reset").addEventListener("click", function(){
      window.__cheats = { speed:1, jump:1, gravity:1, fly:false, god:false };
      syncUI();
      document.getElementById("cheat-msg").textContent = "Réinitialisé";
    });
    document.getElementById("cheat-max").addEventListener("click", function(){
      window.__cheats = { speed:3, jump:2.5, gravity:0.5, fly:true, god:true };
      syncUI();
      document.getElementById("cheat-msg").textContent = "Max power activé";
    });
    syncUI();
  }

  function injectCSS(){
    if(document.getElementById("cheat-css")) return;
    var s = document.createElement("style");
    s.id = "cheat-css";
    s.textContent =
      ".cheat-row{margin:10px 0;text-align:left;color:#c9b896;font-size:0.95rem}"+ 
      ".cheat-row label{display:block;margin-bottom:4px}"+ 
      ".cheat-row input[type=range]{width:min(320px,90%);accent-color:#e8c547}"+ 
      ".cheat-row input[type=checkbox]{width:18px;height:18px;margin-right:8px;vertical-align:middle}";
    document.head.appendChild(s);
  }

  var tries = 0;
  function boot(){
    injectCSS();
    ensureCheatsTab();
    var orig = window.__adminOpen;
    if(typeof orig === "function" && !orig._cheatHook){
      window.__adminOpen = async function(){
        await orig.apply(this, arguments);
        ensureCheatsTab();
      };
      window.__adminOpen._cheatHook = true;
    }
    if(tries++ < 8) setTimeout(boot, 500);
  }
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
