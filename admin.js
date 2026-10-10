(function () {
  const ADMIN_CODE = "33160";
  const SCORES_URL = "https://kvdb.io/Cv8UZtviGCJ763mChjGocC/scores";
  const MODE_URL = "https://kvdb.io/Cv8UZtviGCJ763mChjGocC/freemode";

  function injectCSS() {
    if (document.getElementById("admin-ui-css")) return;
    const s = document.createElement("style");
    s.id = "admin-ui-css";
    s.textContent = `#admin-fab{position:fixed;top:10px;right:10px;z-index:9998;width:46px;height:46px;border-radius:50%;border:1px solid rgba(232,197,71,0.35);background:rgba(20,14,8,0.75);color:#e8c547;font-size:1.25rem;cursor:pointer;opacity:0.45;backdrop-filter:blur(6px);transition:opacity .2s,transform .15s,box-shadow .2s;-webkit-tap-highlight-color:transparent}#admin-fab:hover,#admin-fab:focus{opacity:1;box-shadow:0 0 12px rgba(232,197,71,0.35)}#admin-fab:active{transform:scale(0.94)}#admin-overlay{position:fixed;inset:0;z-index:10000;background:rgba(6,4,2,0.72);display:flex;align-items:center;justify-content:center;padding:16px}#admin-overlay.hidden{display:none!important}.admin-card{width:min(560px,96vw);max-height:min(88vh,720px);overflow:auto;background:linear-gradient(180deg,#1c140c 0%,#120e0a 100%);border:1px solid #6b5430;border-radius:16px;box-shadow:0 20px 50px rgba(0,0,0,0.55),inset 0 1px 0 rgba(232,197,71,0.12);padding:22px 20px 18px;color:#e8dcc8;text-align:left}.admin-card h2{margin:0 0 4px;color:#e8c547;font-size:1.35rem;font-weight:700}.admin-card .sub{color:#a89060;font-size:0.85rem;margin-bottom:14px}.admin-tabs{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px}.admin-tabs button{flex:1;min-width:90px;background:#2a1e14;color:#c9b896;border:1px solid #4a3c28;border-radius:10px;padding:10px 12px;font-size:0.9rem;cursor:pointer}.admin-tabs button:hover{border-color:#e8c547;color:#e8c547}.admin-tabs button.active{background:linear-gradient(180deg,#6b4c2a,#4a3218);border-color:#e8c547;color:#f5e6c8;font-weight:600}.admin-pane{display:none}.admin-pane.active{display:block}.admin-pane p{color:#c9b896;font-size:0.92rem;line-height:1.45;margin:0 0 12px}.admin-row{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0;align-items:center}.admin-row .btn,.admin-pane .btn{background:linear-gradient(180deg,#6b4c2a,#4a3218);color:#f5e6c8;border:1px solid #e8c547;padding:10px 16px;border-radius:8px;cursor:pointer;font-size:0.92rem;min-height:42px}.admin-row .btn:hover{background:linear-gradient(180deg,#8a6438,#6b4c2a)}.btn-danger{border-color:#c55!important;background:linear-gradient(180deg,#6b2a2a,#4a1818)!important}.admin-field{display:flex;flex-direction:column;gap:4px;flex:1;min-width:120px}.admin-field label{font-size:0.8rem;color:#a89060}.admin-field input,.admin-field select{background:#0e0a07;border:1px solid #5a4030;color:#e8dcc8;border-radius:8px;padding:10px 12px;font-size:15px;min-height:42px}.admin-status{background:rgba(232,197,71,0.08);border:1px solid rgba(232,197,71,0.22);border-radius:10px;padding:10px 12px;font-size:0.88rem;color:#e8c547;margin-bottom:12px}.admin-msg{min-height:1.2em;font-size:0.88rem;color:#8fca8f;margin-top:8px}.admin-msg.err{color:#e88}.admin-table-wrap{max-height:220px;overflow:auto;border:1px solid #3a2a18;border-radius:10px;margin:8px 0 12px}.admin-table{width:100%;border-collapse:collapse;font-size:0.82rem}.admin-table th,.admin-table td{padding:8px 10px;border-bottom:1px solid #2a1e14;text-align:left}.admin-table th{color:#e8c547;position:sticky;top:0;background:#1c140c}.admin-table tr:hover td{background:rgba(232,197,71,0.06)}.cheat-grid{display:grid;gap:10px}.cheat-grid label{display:flex;align-items:center;gap:10px;background:#16100a;border:1px solid #3a2a18;border-radius:10px;padding:10px 12px;color:#c9b896;font-size:0.92rem;cursor:pointer}.cheat-grid input[type=checkbox]{width:18px;height:18px;accent-color:#e8c547}.cheat-slider{display:flex;flex-direction:column;gap:6px;padding:8px 4px}.cheat-slider input[type=range]{width:100%;accent-color:#e8c547}.admin-close-row{display:flex;justify-content:flex-end;margin-top:14px;gap:8px}.gate-input{width:100%;background:#0e0a07;border:1px solid #5a4030;color:#e8dcc8;border-radius:10px;padding:12px;font-size:16px;text-align:center;letter-spacing:0.15em;margin:12px 0}.btn-mini{background:#4a3218;color:#e8c547;border:1px solid #5a4030;border-radius:4px;width:28px;height:28px;cursor:pointer;font-size:12px}`; 
    document.head.appendChild(s);
  }

  function formatTime(ms) {
    const s = Math.floor((ms || 0) / 1000);
    const m = Math.floor(s / 60);
    return m + ":" + String(s % 60).padStart(2, "0");
  }

  function ensureFab() {
    if (document.getElementById("admin-fab")) return;
    const btn = document.createElement("button");
    btn.id = "admin-fab";
    btn.type = "button";
    btn.title = "Admin";
    btn.setAttribute("aria-label", "Admin");
    btn.textContent = "⚙";
    btn.addEventListener("click", openGate);
    document.body.appendChild(btn);
  }

  function openGate() {
    let ov = document.getElementById("admin-overlay");
    if (ov) {
      ov.classList.remove("hidden");
      ov.innerHTML = gateHTML();
      bindGate();
      return;
    }
    ov = document.createElement("div");
    ov.id = "admin-overlay";
    ov.innerHTML = gateHTML();
    document.body.appendChild(ov);
    bindGate();
  }

  function gateHTML() {
    return '<div class="admin-card" style="width:min(360px,94vw)"><h2>Espace admin</h2><p class="sub">Entre le code pour continuer</p><input class="gate-input" id="adm-gate-code" type="password" inputmode="numeric" autocomplete="off" placeholder="••••" /><p class="admin-msg err" id="adm-gate-err"></p><div class="admin-row" style="justify-content:flex-end"><button type="button" class="btn" id="adm-gate-cancel">Annuler</button><button type="button" class="btn" id="adm-gate-ok">Entrer</button></div></div>';
  }

  function bindGate() {
    document.getElementById("adm-gate-cancel").onclick = function () {
      document.getElementById("admin-overlay").classList.add("hidden");
    };
    document.getElementById("adm-gate-ok").onclick = tryEnter;
    document.getElementById("adm-gate-code").addEventListener("keydown", function (e) {
      if (e.key === "Enter") tryEnter();
    });
    setTimeout(function () { document.getElementById("adm-gate-code").focus(); }, 40);
  }

  function tryEnter() {
    var v = (document.getElementById("adm-gate-code").value || "").trim();
    if (v !== ADMIN_CODE) {
      document.getElementById("adm-gate-err").textContent = "Code incorrect";
      return;
    }
    openPanel();
  }

  function openPanel() {
    var ov = document.getElementById("admin-overlay");
    if (!ov) {
      ov = document.createElement("div");
      ov.id = "admin-overlay";
      document.body.appendChild(ov);
    }
    ov.classList.remove("hidden");
    ov.innerHTML =
      '<div class="admin-card">' +
      '<h2>Panneau admin</h2>' +
      '<p class="sub">Gestion du site · visible seulement avec le code</p>' +
      '<div class="admin-tabs">' +
      '<button type="button" class="active" data-tab="scores">Scores</button>' +
      '<button type="button" data-tab="libre">Jeu libre</button>' +
      '<button type="button" data-tab="cheats">Cheats</button>' +
      '<button type="button" data-tab="info">Infos</button>' +
      "</div>" +
      '<div class="admin-pane active" id="pane-scores">' +
      "<p>Scores de la classe 5°8 (serveur partagé).</p>" +
      '<div class="admin-row">' +
      '<button type="button" class="btn" id="adm-refresh">Rafraîchir</button>' +
      '<button type="button" class="btn btn-danger" id="adm-clear">Tout effacer</button>' +
      "</div>" +
      '<div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>#</th><th>Prénom</th><th>Nom</th><th>Temps</th><th>Frag.</th><th></th></tr></thead><tbody id="adm-scores-body"></tbody></table></div>' +
      '<p class="admin-msg" id="adm-scores-msg"></p></div>' +
      '<div class="admin-pane" id="pane-libre">' +
      '<div class="admin-status" id="adm-fm-status">Chargement…</div>' +
      "<p>Active une version libre (secrets, hors cadre arts). Les scores classe restent.</p>" +
      '<div class="admin-row"><div class="admin-field"><label>Durée</label><select id="adm-fm-dur"><option value="0">Sans limite</option><option value="15">15 minutes</option><option value="60">1 heure</option><option value="360">6 heures</option><option value="1440">24 heures</option></select></div></div>' +
      '<div class="admin-row"><button type="button" class="btn" id="adm-fm-local">BETA cet appareil</button><button type="button" class="btn" id="adm-fm-local-off">Stop BETA</button></div>' +
      '<div class="admin-row"><button type="button" class="btn" id="adm-fm-global">Activer pour TOUS</button><button type="button" class="btn btn-danger" id="adm-fm-global-off">Désactiver tous</button></div>' +
      '<p class="admin-msg" id="adm-fm-msg"></p></div>' +
      '<div class="admin-pane" id="pane-cheats">' +
      "<p>Cheats actifs tout de suite pendant la partie (cet appareil uniquement).</p>" +
      '<div class="cheat-grid"><label><input type="checkbox" id="adm-fly"/> Mode Fly</label><label><input type="checkbox" id="adm-god"/> Mode Dieu</label></div>' +
      '<div class="cheat-slider"><label>Vitesse × <span id="adm-speed-val">1.0</span></label><input type="range" id="adm-speed" min="0.5" max="4" step="0.1" value="1"/></div>' +
      '<div class="cheat-slider"><label>Saut × <span id="adm-jump-val">1.0</span></label><input type="range" id="adm-jump" min="0.5" max="3" step="0.1" value="1"/></div>' +
      '<div class="cheat-slider"><label>Gravité × <span id="adm-grav-val">1.0</span></label><input type="range" id="adm-grav" min="0.2" max="2.5" step="0.1" value="1"/></div>' +
      '<div class="admin-row"><button type="button" class="btn" id="adm-cheat-reset">Réinitialiser</button><button type="button" class="btn" id="adm-cheat-max">Max power</button></div>' +
      '<p class="admin-msg" id="adm-cheat-msg"></p></div>' +
      '<div class="admin-pane" id="pane-info">' +
      "<p><strong>Accès :</strong> bouton ⚙ en haut à droite, code <code>33160</code>.</p>" +
      "<p><strong>Mode libre :</strong> aussi via <code>?libre=1</code> / <code>?libre=0</code>.</p>" +
      "<p><strong>Scores :</strong> visibles par la classe avec le code 5°8.</p></div>" +
      '<div class="admin-close-row"><button type="button" class="btn" id="adm-close">Fermer</button></div></div>';

    ov.querySelectorAll(".admin-tabs button").forEach(function (btn) {
      btn.onclick = function () {
        ov.querySelectorAll(".admin-tabs button").forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        ov.querySelectorAll(".admin-pane").forEach(function (p) { p.classList.remove("active"); });
        document.getElementById("pane-" + btn.dataset.tab).classList.add("active");
        if (btn.dataset.tab === "scores") loadScores();
        if (btn.dataset.tab === "libre") refreshFmStatus();
        if (btn.dataset.tab === "cheats") syncCheatsUI();
      };
    });

    document.getElementById("adm-close").onclick = function () { ov.classList.add("hidden"); };
    ov.addEventListener("click", function (e) { if (e.target === ov) ov.classList.add("hidden"); });

    document.getElementById("adm-refresh").onclick = loadScores;
    document.getElementById("adm-clear").onclick = clearScores;

    document.getElementById("adm-fm-local").onclick = function () {
      localStorage.setItem("pierre_freemode_local", JSON.stringify({ active: true, expires: fmExpiry() }));
      document.getElementById("adm-fm-msg").textContent = "BETA locale activée — recharge…";
      setTimeout(function () { location.reload(); }, 500);
    };
    document.getElementById("adm-fm-local-off").onclick = function () {
      localStorage.removeItem("pierre_freemode_local");
      document.getElementById("adm-fm-msg").textContent = "BETA locale désactivée — recharge…";
      setTimeout(function () { location.reload(); }, 500);
    };
    document.getElementById("adm-fm-global").onclick = async function () {
      try {
        await fetch(MODE_URL, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active: true, expires: fmExpiry(), updated: new Date().toISOString() }) });
        document.getElementById("adm-fm-msg").textContent = "Mode global activé ✓";
        refreshFmStatus();
      } catch (e) { document.getElementById("adm-fm-msg").textContent = "Erreur : " + e.message; }
    };
    document.getElementById("adm-fm-global-off").onclick = async function () {
      try {
        await fetch(MODE_URL, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active: false, expires: null }) });
        document.getElementById("adm-fm-msg").textContent = "Mode global désactivé";
        refreshFmStatus();
      } catch (e) { document.getElementById("adm-fm-msg").textContent = "Erreur : " + e.message; }
    };

    window.__cheats = window.__cheats || { speed: 1, jump: 1, gravity: 1, fly: false, god: false };
    function applyCheats() {
      var C = window.__cheats;
      C.fly = document.getElementById("adm-fly").checked;
      C.god = document.getElementById("adm-god").checked;
      C.speed = parseFloat(document.getElementById("adm-speed").value) || 1;
      C.jump = parseFloat(document.getElementById("adm-jump").value) || 1;
      C.gravity = parseFloat(document.getElementById("adm-grav").value) || 1;
      document.getElementById("adm-speed-val").textContent = C.speed.toFixed(1);
      document.getElementById("adm-jump-val").textContent = C.jump.toFixed(1);
      document.getElementById("adm-grav-val").textContent = C.gravity.toFixed(1);
      document.getElementById("adm-cheat-msg").textContent = "Appliqué ✓";
    }
    ["adm-fly", "adm-god"].forEach(function (id) { document.getElementById(id).onchange = applyCheats; });
    ["adm-speed", "adm-jump", "adm-grav"].forEach(function (id) { document.getElementById(id).oninput = applyCheats; });
    document.getElementById("adm-cheat-reset").onclick = function () {
      window.__cheats = { speed: 1, jump: 1, gravity: 1, fly: false, god: false };
      syncCheatsUI();
      document.getElementById("adm-cheat-msg").textContent = "Réinitialisé";
    };
    document.getElementById("adm-cheat-max").onclick = function () {
      window.__cheats = { speed: 3, jump: 2.5, gravity: 0.5, fly: true, god: true };
      syncCheatsUI();
      document.getElementById("adm-cheat-msg").textContent = "Max power ✓";
    };

    loadScores();
    refreshFmStatus();
    syncCheatsUI();
  }

  function fmExpiry() {
    var mins = parseInt(document.getElementById("adm-fm-dur").value, 10) || 0;
    return mins ? Date.now() + mins * 60000 : null;
  }

  async function refreshFmStatus() {
    var el = document.getElementById("adm-fm-status");
    if (!el) return;
    var local = null;
    try { local = JSON.parse(localStorage.getItem("pierre_freemode_local") || "null"); } catch (e) {}
    var global = null;
    try {
      var r = await fetch(MODE_URL + "?t=" + Date.now(), { cache: "no-store" });
      if (r.ok) global = await r.json();
    } catch (e) {}
    if (local && local.active) el.textContent = "État : BETA locale active";
    else if (global && global.active) el.textContent = "État : mode libre GLOBAL actif";
    else el.textContent = "État : projet arts plastiques (classique)";
  }

  function syncCheatsUI() {
    var C = window.__cheats || { speed: 1, jump: 1, gravity: 1, fly: false, god: false };
    var fly = document.getElementById("adm-fly");
    if (!fly) return;
    fly.checked = !!C.fly;
    document.getElementById("adm-god").checked = !!C.god;
    document.getElementById("adm-speed").value = C.speed;
    document.getElementById("adm-jump").value = C.jump;
    document.getElementById("adm-grav").value = C.gravity;
    document.getElementById("adm-speed-val").textContent = Number(C.speed).toFixed(1);
    document.getElementById("adm-jump-val").textContent = Number(C.jump).toFixed(1);
    document.getElementById("adm-grav-val").textContent = Number(C.gravity).toFixed(1);
  }

  async function loadScores() {
    var body = document.getElementById("adm-scores-body");
    var msg = document.getElementById("adm-scores-msg");
    if (!body) return;
    body.innerHTML = "<tr><td colspan='6'>Chargement…</td></tr>";
    try {
      var r = await fetch(SCORES_URL + "?t=" + Date.now(), { cache: "no-store" });
      var data = r.ok ? await r.json() : [];
      if (!Array.isArray(data)) data = [];
      window.__adminScores = data.slice();
      var sorted = data.slice().sort(function (a, b) { return (a.time || 9e9) - (b.time || 9e9); });
      body.innerHTML = "";
      if (!sorted.length) {
        body.innerHTML = "<tr><td colspan='6'>Aucun score</td></tr>";
        return;
      }
      sorted.forEach(function (s, i) {
        var idx = window.__adminScores.indexOf(s);
        var tr = document.createElement("tr");
        tr.innerHTML =
          "<td>" + (i + 1) + (i === 0 ? " 👑" : "") + "</td>" +
          "<td>" + esc(s.prenom || "") + "</td>" +
          "<td>" + esc(s.nom || "") + "</td>" +
          "<td>" + formatTime(s.time) + "</td>" +
          "<td>" + (s.fragments || 0) + "</td>" +
          "<td><button type='button' class='btn-mini' data-del='" + idx + "'>✕</button></td>";
        body.appendChild(tr);
      });
      body.querySelectorAll("[data-del]").forEach(function (btn) {
        btn.onclick = function () { deleteScore(parseInt(btn.getAttribute("data-del"), 10)); };
      });
      if (msg) msg.textContent = sorted.length + " score(s)";
    } catch (e) {
      body.innerHTML = "<tr><td colspan='6'>Erreur réseau</td></tr>";
    }
  }

  async function deleteScore(idx) {
    if (!confirm("Supprimer ce score ?")) return;
    try {
      var data = (window.__adminScores || []).filter(function (_, i) { return i !== idx; });
      await fetch(SCORES_URL, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      loadScores();
    } catch (e) { alert("Erreur : " + e.message); }
  }

  async function clearScores() {
    if (!confirm("Effacer TOUS les scores de la classe ?")) return;
    try {
      await fetch(SCORES_URL, { method: "PUT", headers: { "Content-Type": "application/json" }, body: "[]" });
      loadScores();
      document.getElementById("adm-scores-msg").textContent = "Scores effacés";
    } catch (e) { alert("Erreur : " + e.message); }
  }

  function esc(t) {
    var d = document.createElement("div");
    d.textContent = t;
    return d.innerHTML;
  }

  function boot() {
    injectCSS();
    ensureFab();
    if (location.search.indexOf("admin=33160") >= 0) openPanel();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
  window.__adminOpen = openPanel;
})();
