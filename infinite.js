(function(){
  /* Mode Infini — génération procédurale, sauts toujours faisables
     Physique: jump vy=-580, grav=1100 → hauteur max ~153px
     Vitesse horiz=240 → portée air ~200px */

  var INF = { active:false, distance:0, modules:0, seed:1, bestDist:0, fragCount:0 };

  function mulberry32(a){
    return function(){
      var t = a += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function pick(rng, arr){ return arr[Math.floor(rng() * arr.length)]; }
  function ri(rng, a, b){ return a + Math.floor(rng() * (b - a + 1)); }

  function genModule(rng, startX, entryY, groundY){
    var width = ri(rng, 480, 620);
    var pattern = pick(rng, ["stairs_up","stairs_down","zigzag","plateau","gap_run","pyramid"]);
    var platforms = [], spikes = [], fragments = [];
    var y = entryY, x = startX + 40, endX = startX + width - 40, i, steps, stepW, n, dx;
    function clampY(yy){ return Math.max(160, Math.min(groundY - 40, yy)); }

    if(pattern === "stairs_up"){
      steps = ri(rng, 4, 6); stepW = Math.floor((width - 80) / steps);
      for(i=0;i<steps;i++){ y = clampY(y - ri(rng, 45, 95)); platforms.push({x:x,y:y,w:ri(rng,70,110),h:16}); x += stepW; }
    } else if(pattern === "stairs_down"){
      steps = ri(rng, 4, 6); stepW = Math.floor((width - 80) / steps);
      for(i=0;i<steps;i++){ y = clampY(y + ri(rng, 40, 90)); platforms.push({x:x,y:y,w:ri(rng,70,110),h:16}); x += stepW; }
    } else if(pattern === "zigzag"){
      n = ri(rng, 5, 7); dx = Math.floor((width - 80) / n);
      for(i=0;i<n;i++){ y = clampY(y + (i%2===0?-1:1)*ri(rng,50,100)); platforms.push({x:x,y:y,w:ri(rng,65,100),h:16}); x += dx; }
    } else if(pattern === "plateau"){
      platforms.push({x:startX+30,y:y,w:ri(rng,120,180),h:16});
      var midY = clampY(y - ri(rng,60,110));
      platforms.push({x:startX+width*0.35,y:midY,w:ri(rng,90,140),h:16});
      if(rng()>0.55){ var mx=startX+width*0.55; platforms.push({x:mx,y:clampY(midY+ri(rng,-40,40)),w:90,h:16,moveX:ri(rng,60,100),speed:ri(rng,35,55),baseX:mx}); }
      y = clampY(midY + ri(rng,20,70));
      platforms.push({x:startX+width*0.75,y:y,w:ri(rng,100,150),h:16});
    } else if(pattern === "gap_run"){
      n = ri(rng, 5, 8); dx = Math.floor((width - 60) / n);
      var runY = clampY(y + ri(rng,-30,30));
      for(i=0;i<n;i++) platforms.push({x:startX+30+i*dx,y:runY,w:ri(rng,55,85),h:16});
      y = runY;
    } else {
      var peak = clampY(y - ri(rng,80,120));
      platforms.push({x:startX+40,y:y,w:100,h:16});
      platforms.push({x:startX+width*0.28,y:clampY((y+peak)/2),w:80,h:16});
      platforms.push({x:startX+width*0.48,y:peak,w:90,h:16});
      platforms.push({x:startX+width*0.68,y:clampY((y+peak)/2+20),w:80,h:16});
      y = clampY(y + ri(rng,-20,40));
      platforms.push({x:startX+width*0.85,y:y,w:100,h:16});
    }

    var last = platforms[platforms.length-1];
    if(!last || last.x+last.w < endX-50){
      y = clampY(y);
      platforms.push({x:endX-90,y:y,w:100,h:16});
    }

    var numSpikes = ri(rng,1,3);
    for(i=0;i<numSpikes;i++){
      var sx = startX + ri(rng,80,width-80);
      var under = platforms.some(function(p){ return sx+20>p.x && sx<p.x+p.w; });
      if(!under) spikes.push({x:sx,y:groundY-16,w:ri(rng,35,55)});
    }
    var numFrag = ri(rng,0,2);
    for(i=0;i<numFrag && platforms.length;i++){
      var p = platforms[ri(rng,0,platforms.length-1)];
      fragments.push({x:p.x+p.w/2-10,y:p.y-40,collected:false});
    }
    return { width:width, exitY:y, platforms:platforms, spikes:spikes, fragments:fragments };
  }

  function themeForDist(dist){
    return ["cave","forest","temple"][Math.floor(dist/3000)%3];
  }

  function buildInfiniteLevel(seed, moduleCount){
    var rng = mulberry32(seed|0);
    var groundY = 500;
    var platforms = [{x:40,y:420,w:140,h:16}];
    var spikes = [], fragments = [];
    var x = 200, y = 420, totalW = 200;
    for(var m=0;m<moduleCount;m++){
      var mod = genModule(rng, x, y, groundY);
      platforms = platforms.concat(mod.platforms);
      spikes = spikes.concat(mod.spikes);
      fragments = fragments.concat(mod.fragments);
      x += mod.width; y = mod.exitY; totalW = x + 200;
    }
    return {
      name:"Infini", width:totalW, groundY:groundY, theme:themeForDist(0),
      platforms:platforms, spikes:spikes, fragments:fragments,
      exitX:totalW+99999, _inf:true, _nextX:x, _nextY:y, _seed:seed, _modCount:moduleCount
    };
  }

  function extendLevel(level){
    if(!level||!level._inf)return;
    var rng = mulberry32((level._seed + level._modCount*9973)|0);
    var mod = genModule(rng, level._nextX, level._nextY, level.groundY);
    level.platforms = level.platforms.concat(mod.platforms);
    level.spikes = level.spikes.concat(mod.spikes);
    level.fragments = level.fragments.concat(mod.fragments);
    level._nextX += mod.width;
    level._nextY = mod.exitY;
    level._modCount++;
    level.width = level._nextX + 400;
    level.theme = themeForDist(level._nextX);
    INF.modules = level._modCount;
  }

  function startInfinite(){
    INF.active = true; INF.distance = 0; INF.modules = 8; INF.fragCount = 0;
    INF.seed = (Date.now()&0xfffff) ^ ((Math.random()*1e6)|0);
    if(typeof winScreen!=="undefined"&&winScreen) winScreen.classList.add("hidden");
    if(typeof startScreen!=="undefined"&&startScreen) startScreen.classList.add("hidden");
    if(typeof loreScreen!=="undefined"&&loreScreen) loreScreen.classList.add("hidden");
    if(typeof resultsScreen!=="undefined"&&resultsScreen) resultsScreen.classList.add("hidden");
    var L = buildInfiniteLevel(INF.seed, 8);
    try{
      level = L; currentLevel = 99;
      fragmentsCollected = 0; totalFragments = L.fragments.length;
      if(typeof levelLabel!=="undefined"&&levelLabel) levelLabel.textContent = "Mode Infini";
      if(typeof fragmentsEl!=="undefined"&&fragmentsEl) fragmentsEl.textContent = "Distance : 0 m";
      if(typeof timerEl!=="undefined"&&timerEl) timerEl.textContent = "Modules : 8";
      player.x = 60; player.y = L.groundY - player.h - 10;
      player.vx = 0; player.vy = 0; player.onGround = false;
      cameraX = 0; startTime = performance.now(); state = "playing";
      if(typeof showMsg==="function") showMsg("Mode Infini — va le plus loin possible !", 2500);
    }catch(e){ console.error(e); alert("Erreur mode infini: "+e.message); }
  }

  function patchUpdate(){
    if(typeof update!=="function"||update._infPatched)return;
    var orig = update;
    function wrapped(dt){
      orig(dt);
      if(!INF.active||!level||!level._inf||state!=="playing")return;
      INF.distance = Math.max(INF.distance, Math.floor(player.x/10));
      if(typeof fragmentsEl!=="undefined"&&fragmentsEl) fragmentsEl.textContent = "Distance : "+INF.distance+" m";
      if(typeof timerEl!=="undefined"&&timerEl) timerEl.textContent = "Modules : "+(level._modCount||0);
      if(player.x > level.width - 900) extendLevel(level);
      if(INF.distance > INF.bestDist){
        INF.bestDist = INF.distance;
        try{ localStorage.setItem("pierre_inf_best", String(INF.bestDist)); }catch(e){}
      }
    }
    wrapped._infPatched = true;
    try{ update = wrapped; }catch(e){}
    window.update = wrapped;
  }

  function patchReset(){
    if(typeof resetPlayer!=="function"||resetPlayer._infPatched)return;
    var orig = resetPlayer;
    function wrapped(){
      if(INF.active && level && level._inf){
        if(typeof showMsg==="function") showMsg("Touché ! Distance : "+INF.distance+" m — continue…", 2000);
        var safe = null;
        for(var i=level.platforms.length-1;i>=0;i--){
          var p = level.platforms[i];
          if(p.x+p.w < player.x-20 && p.x > player.x-400){ safe=p; break; }
        }
        if(safe){
          player.x = safe.x+10; player.y = safe.y-player.h;
          player.vx=0; player.vy=0; player.onGround=true;
          return;
        }
      }
      orig();
    }
    wrapped._infPatched = true;
    try{ resetPlayer = wrapped; }catch(e){}
    window.resetPlayer = wrapped;
  }

  function addUI(){
    var win = document.getElementById("win-screen");
    if(win && !document.getElementById("btn-infinite")){
      var b = document.createElement("button");
      b.className="btn"; b.id="btn-infinite"; b.textContent="Mode Infini ∞";
      b.style.marginTop="8px";
      b.addEventListener("click", function(){ patchUpdate(); patchReset(); startInfinite(); });
      var replay = document.getElementById("btn-replay");
      if(replay) win.insertBefore(b, replay); else win.appendChild(b);
    }
    var start = document.getElementById("start-screen");
    if(start && !document.getElementById("btn-infinite-menu")){
      var b2 = document.createElement("button");
      b2.className="btn"; b2.id="btn-infinite-menu"; b2.textContent="Mode Infini ∞";
      b2.addEventListener("click", function(){
        patchUpdate(); patchReset();
        document.getElementById("start-screen").classList.add("hidden");
        startInfinite();
      });
      var res = document.getElementById("btn-results");
      if(res) start.insertBefore(b2, res); else start.appendChild(b2);
      try{
        var best = localStorage.getItem("pierre_inf_best");
        if(best){
          var p = document.createElement("p");
          p.id="inf-best"; p.style.cssText="color:#a89060;font-size:0.85rem;margin-top:4px";
          p.textContent="Record infini : "+best+" m";
          b2.insertAdjacentElement("afterend", p);
        }
      }catch(e){}
    }
  }

  function boot(){
    addUI(); patchUpdate(); patchReset();
    setTimeout(function(){ addUI(); patchUpdate(); patchReset(); }, 800);
    setTimeout(function(){ addUI(); patchUpdate(); patchReset(); }, 2000);
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
