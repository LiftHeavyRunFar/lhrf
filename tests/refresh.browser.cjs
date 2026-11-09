// A stale tab remains open throughout the update, as on Android.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const http=require('node:http');
const path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const current=path.join(__dirname,'..'),previous=process.env.LHRF_REFRESH_BASE;
const store='lhrf_beta_v1118_clean',live='lhrf_fresh_beta_live_v1114';
const fixture=require('./training-mode-fixture.cjs').fixture();
(async()=>{
 assert.ok(previous,'Set LHRF_REFRESH_BASE to the v1.39.2 checkout');
 let release='previous',browser;
 const server=http.createServer((req,res)=>{
  const pathname=new URL(req.url,'http://localhost').pathname;
  const root=pathname==='/refresh.html'||release==='current'||release==='mixed'&&pathname==='/sw.js'?current:previous;
  const file=path.join(root,pathname==='/'?'index.html':pathname);
  const types={'.html':'text/html','.js':'application/javascript','.css':'text/css'};
  try{res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.setHeader('Cache-Control','no-store');res.end(fs.readFileSync(file));}
  catch{res.writeHead(404).end();}
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const url='http://localhost:'+server.address().port+'/';
 try{
  browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE,args:['--no-sandbox','--disable-dev-shm-usage']});
  const context=await browser.newContext({viewport:{width:393,height:852},isMobile:true,hasTouch:true});
  await context.addInitScript(({store,fixture})=>{if(!localStorage.getItem(store))localStorage.setItem(store,JSON.stringify(fixture))},{store,fixture});
  const stale=await context.newPage();
  await stale.goto(url);
  await stale.waitForFunction(()=>!!navigator.serviceWorker.controller);
  assert.equal(await stale.locator('#frAdvancedAvailability').count(),1);
  const before=await stale.evaluate(key=>localStorage.getItem(key),store);
  release='mixed';
  await stale.evaluate(async()=>{
   const reg=await navigator.serviceWorker.getRegistration();
   const outcome=new Promise(resolve=>{
    reg.addEventListener('updatefound',()=>{
     const worker=reg.installing;
     worker.addEventListener('statechange',()=>{if(worker.state==='redundant')resolve();});
    },{once:true});
   });
   await reg.update();
   await outcome;
  });
  assert.ok(!(await stale.evaluate(()=>caches.keys())).includes('lhrf-shell-v1.39.4'));
  release='current';
  const refresh=await context.newPage();
  await refresh.goto(url+'refresh.html');
  for(const key of [live,live+'_pendingRun']){
   await refresh.evaluate(key=>localStorage.setItem(key,'{"synthetic":true}'),key);
   await refresh.getByRole('button',{name:'Update now'}).click();
   await refresh.waitForFunction(()=>document.getElementById('status').textContent.includes('Finish your workout'));
   assert.equal(await refresh.evaluate(key=>localStorage.getItem(key),key),'{"synthetic":true}');
   await refresh.evaluate(key=>localStorage.removeItem(key),key);
  }
  await refresh.getByRole('button',{name:'Update now'}).click();
  await refresh.waitForFunction(()=>document.getElementById('status').textContent.includes('LHRF is ready'),{},{timeout:25000});
  await refresh.getByRole('link',{name:'Open LHRF'}).click();
  assert.equal(await refresh.locator('meta[name="lhrf-release"]').getAttribute('content'),'1.39.4');
  assert.equal(await refresh.locator('#frAdvancedAvailability').count(),0);
  assert.equal(await refresh.evaluate(key=>localStorage.getItem(key),store),before);
  await context.setOffline(true);
  await refresh.reload();
  assert.equal(await refresh.locator('meta[name="lhrf-release"]').getAttribute('content'),'1.39.4');
  assert.equal(await refresh.evaluate(key=>localStorage.getItem(key),store),before);
  console.log('PASS stale Android tab, mixed-cache rejection, workout protection, explicit update and offline preservation');
 }finally{
  if(browser)await browser.close();
  server.closeAllConnections();
  await new Promise(resolve=>server.close(resolve));
 }
})().catch(error=>{console.error(error);process.exitCode=1;});
