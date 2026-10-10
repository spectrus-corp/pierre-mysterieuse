(function(){
  var INF={active:false,distance:0,bestDist:0};
  try{INF.bestDist=parseInt(localStorage.getItem("pierre_inf_best")||"0",10)||0;}catch(e){}

  function mulberry32(a){return function(){var t=a+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
  function pick(rng,arr){return arr[Math.floor(rng()*arr.length)];}
  function ri(rng,a,b){return a+Math.floor(rng()*(b-a+1));}

  function genModule(rng,startX,entryY,groundY){
    var width=ri(rng,480,620);
    var pattern=pick(rng,["stairs_up","stairs_down","zigzag","plateau","gap_run","pyramid"]);
    var platforms=[],spikes=[],y=entryY,x=startX+40,endX=startX+width-40,i;
    function clampY(yy){return Math.max(160,Math.min(groundY-40,yy));}
    if(pattern==="stairs_up"){
      var steps=ri(rng,4,6),stepW=Math.floor((width-80)/steps);
      for(i=0;i<steps;i++){y=clampY(y-ri(rng,45,95));platforms.push({x:x,y:y,w:ri(rng,70,110),h:16});x+=stepW;}
    }else if(pattern==="stairs_down"){
      steps=ri(rng,4,6);stepW=Math.floor((width-80)/steps);
      for(i=0;i<steps;i++){y=clampY(y+ri(rng,40,90));platforms.push({x:x,y:y,w:ri(rng,70,110),h:16});x+=stepW;}
    }else if(pattern==="zigzag"){
      var n=ri(rng,5,7),dx=Math.floor((width-80)/n);
      for(i=0;i<n;i++){y=clampY(y+(i%2===0?-1:1)*ri(rng,50,100));platforms.push({x:x,y:y,w:ri(rng,65,100),h:16});x+=dx;}
    }else if(pattern==="plateau"){
      platforms.push({x:startX+30,y:y,w:ri(rng,120,180),h:16});
      var midY=clampY(y-ri(rng,60,110));
      platforms.push({x:startX+width*0.35,y:midY,w:ri(rng,90,140),h:16});
      if(rng()>0.5){var mx=startX+width*0.55;platforms.push({x:mx,y:clampY(midY+ri(rng,-40,40)),w:90,h:16,moveX:ri(rng,60,100),speed:ri(rng,35,55),baseX:mx});}
      y=clampY(midY+ri(rng,20,70));
      platforms.push({x:startX+width*0.75,y:y,w:ri(rng,100,150),h:16});
    }else if(pattern==="gap_run"){
      n=ri(rng,5,8);dx=Math.floor((width-60)/n);
      var runY=clampY(y+ri(rng,-30,30));
      for(i=0;i<n;i++)platforms.push({x:startX+30+i*dx,y:runY,w:ri(rng,55,85),h:16});
      y=runY;
    }else{
      var peak=clampY(y-ri(rng,80,120));
      platforms.push({x:startX+40,y:y,w:100,h:16});
      platforms.push({x:startX+width*0.28,y:clampY((y+peak)/2),w:80,h:16});
      platforms.push({x:startX+width*0.48,y:peak,w:90,h:16});
      platforms.push({x:startX+width*0.68,y:clampY((y+peak)/2+20),w:80,h:16});
      y=clampY(y+ri(rng,-20,40));
      platforms.push({x:startX+width*0.85,y:y,w:100,h:16});
    }
    var last=platforms[platforms.length-1];
    if(!last||last.x+last.w<endX-50){y=clampY(y);platforms.push({x:endX-90,y:y,w:100,h:16});}
    for(i=0;i<ri(rng,1,3);i++){
      var sx=startX+ri(rng,80,width-80);
      if(!platforms.some(function(p){return sx+20>p.x&&sx<p.x+p.w;}))
        spikes.push({x:sx,y:groundY-16,w:ri(rng,35,55)});
    }
    return {width:width,exitY:y,platforms:platforms,spikes:spikes,fragments:[]};
  }

  function buildInfiniteLevel(seed,count){
    var rng=mulberry32(seed|0),groundY=500;
    var platforms=[{x:40,y:420,w:160,h:16}],spikes=[];
    var x=220,y=420;
    for(var m=0;m<count;m++){
      var mod=genModule(rng,x,y,groundY);
      platforms=platforms.concat(mod.platforms);
      spikes=spikes.concat(mod.spikes);
      x+=mod.width;y=mod.exitY;
    }
    return {
      name:"Infini ∞",width:x+400,groundY:groundY,theme:["cave","forest","temple"][seed%3],
      platforms:platforms,spikes:spikes,fragments:[],
      exitX:x+999999,_inf:true,_modCount:count
    };
  }

  function startInfinite(){
    if(typeof startLevel!=="function"){alert("Jeu pas encore chargé");return;}
    INF.active=true;INF.distance=0;
    var seed=(Date.now()&0xfffff)^((Math.random()*1e6)|0);
    window.__useInf=true;
    window.__infLevel=buildInfiniteLevel(seed,60);
    ["start-screen","win-screen","lore-screen","results-screen","admin-screen"].forEach(function(id){
      var el=document.getElementById(id);if(el){el.classList.add("hidden");el.style.display="none";}
    });
    startLevel(0);
    var lab=document.getElementById("level-label");
    if(lab)lab.textContent="Mode Infini ∞";
    if(typeof showMsg==="function")showMsg("Mode Infini — va le plus loin possible !",2500);
    (function tick(){
      requestAnimationFrame(tick);
      if(!INF.active||!window.__useInf)return;
      var px=window.__gamePlayerX;
      if(typeof px==="number")INF.distance=Math.max(INF.distance,Math.floor(px/10));
      var fr=document.getElementById("fragments");
      if(fr)fr.textContent="Distance : "+INF.distance+" m · Record : "+INF.bestDist+" m";
      if(INF.distance>INF.bestDist){
        INF.bestDist=INF.distance;
        try{localStorage.setItem("pierre_inf_best",String(INF.bestDist));}catch(e){}
      }
    })();
  }

  function addUI(){
    var start=document.getElementById("start-screen");
    if(start&&!document.getElementById("btn-infinite-menu")){
      var b=document.createElement("button");
      b.className="btn";b.id="btn-infinite-menu";b.textContent="Mode Infini ∞";
      b.addEventListener("click",startInfinite);
      var res=document.getElementById("btn-results");
      if(res)start.insertBefore(b,res);else start.appendChild(b);
    }
  }

  window.startInfiniteMode=startInfinite;
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",addUI);
  else addUI();
  setTimeout(addUI,600);
})();
