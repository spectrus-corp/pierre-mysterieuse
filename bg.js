function drawBgCave(){
  const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#1a1410');g.addColorStop(1,'#0a0806');
  ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  ctx.fillStyle='rgba(40,30,22,0.5)';
  for(let i=0;i<10;i++){const bx=((i*220)-cameraX*0.15)%(W+250)-80,bh=120+(i%4)*50;
    ctx.beginPath();ctx.moveTo(bx,H);ctx.lineTo(bx+30,H-bh);ctx.lineTo(bx+80,H-bh*0.7);ctx.lineTo(bx+120,H);ctx.fill();}
  ctx.fillStyle='rgba(70,55,40,0.7)';
  for(let i=0;i<14;i++){const sx=((i*130)-cameraX*0.5)%(W+150)-20,sh=40+(i%5)*18;
    ctx.beginPath();ctx.moveTo(sx,0);ctx.lineTo(sx+12,sh);ctx.lineTo(sx+24,0);ctx.fill();}
  for(let i=0;i<6;i++){const cx=((i*200+50)-cameraX*0.25)%(W+100),cy=80+(i%3)*60;
    ctx.fillStyle='rgba(180,140,60,'+(0.3+0.2*Math.sin(gameTime*2+i))+')';ctx.beginPath();ctx.arc(cx,cy,4,0,Math.PI*2);ctx.fill();}
}
function drawBgForest(){
  const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#0e1a14');g.addColorStop(1,'#060e0a');
  ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  for(let i=0;i<12;i++){const tx=((i*160)-cameraX*0.28)%(W+200)-40,th=140+(i%4)*40;
    ctx.fillStyle='rgba(20,40,25,0.55)';ctx.fillRect(tx+18,H-th,14,th);
    ctx.beginPath();ctx.arc(tx+25,H-th+10,35+(i%3)*10,0,Math.PI*2);ctx.fill();}
  for(let i=0;i<10;i++){const tx=((i*190)-cameraX*0.5)%(W+220)-50,th=180+(i%3)*50;
    ctx.fillStyle='rgba(15,35,22,0.7)';ctx.fillRect(tx+20,H-th,18,th);
    ctx.fillStyle='rgba(25,55,35,0.65)';ctx.beginPath();ctx.arc(tx+29,H-th+5,45,0,Math.PI*2);ctx.fill();}
  ctx.fillStyle='rgba(80,140,60,0.35)';
  for(let i=0;i<15;i++){const lx=((i*90+gameTime*20*((i%3)-1))-cameraX*0.4)%(W+80);
    ctx.fillRect(lx,60+(i*37)%300+Math.sin(gameTime+i)*15,5,3);}
}
function drawBgTemple(){
  const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#1a1020');g.addColorStop(1,'#0c0810');
  ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  for(let i=0;i<9;i++){const cx=((i*200)-cameraX*0.3)%(W+220)-40;
    ctx.fillStyle='rgba(60,40,70,0.5)';ctx.fillRect(cx,H-280,28,240);
    ctx.fillStyle='rgba(80,55,90,0.45)';ctx.fillRect(cx-6,H-290,40,14);}
  for(let i=0;i<7;i++){const cx=((i*240+60)-cameraX*0.55)%(W+280)-50;
    ctx.fillStyle='rgba(70,45,85,0.65)';ctx.fillRect(cx,H-320,36,280);
    ctx.fillStyle='rgba(200,160,60,0.25)';ctx.fillRect(cx+4,H-300,28,4);}
  for(let i=0;i<12;i++){const rx=((i*110)-cameraX*0.35+Math.sin(gameTime*0.5+i)*20)%(W+60);
    const ry=50+(i*41)%280+Math.cos(gameTime*0.7+i)*12;
    ctx.fillStyle='rgba(220,180,80,'+(0.2+0.15*Math.sin(gameTime*2+i))+')';ctx.fillRect(rx,ry,3,8);}
}
function drawBackground(){
  if(!level)return;
  if(level.theme==='cave')drawBgCave();
  else if(level.theme==='forest')drawBgForest();
  else drawBgTemple();
}
