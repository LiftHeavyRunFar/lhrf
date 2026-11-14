const assert = require('node:assert/strict');
const { chromium, devices } = require('playwright');
const { createServer } = require('node:http');
const { readFile } = require('node:fs/promises');
const { resolve, sep, extname } = require('node:path');
const root = resolve(__dirname, '..');
const mime = { '.html':'text/html', '.js':'application/javascript', '.css':'text/css', '.webmanifest':'application/manifest+json' };
(async()=>{
 const server=createServer(async(req,res)=>{try{const path=new URL(req.url,'http://localhost').pathname;const file=resolve(root,'.'+(path==='/'?'/index.html':path));if(!file.startsWith(root+sep))throw Error();res.setHeader('content-type',mime[extname(file)]||'application/octet-stream');res.end(await readFile(file))}catch{res.writeHead(404).end()}});
 await new Promise(done=>server.listen(0,'127.0.0.1',done));
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox']});
 try{for(const [label,options] of [['mobile',devices['Pixel 7']],['desktop',{viewport:{width:1280,height:800}}]]){
  const context=await browser.newContext(options);const page=await context.newPage();
  await page.goto('http://127.0.0.1:'+server.address().port+'/');await page.waitForLoadState('networkidle');
  await page.evaluate(()=>{localStorage.setItem('synthetic-completed-workout','completed');localStorage.setItem('synthetic-garmin-record','garmin')});
  await page.evaluate(()=>go('today'));
  const warning=page.locator('#singleTabSafety');assert.equal(await warning.isVisible(),true,label+' warning');
  const text=await warning.innerText();assert.match(text,/one LHRF tab or app window/);assert.match(text,/offline/);assert.match(text,/Older or suspended copies can overwrite/);assert.match(text,/unsaved work, record its details separately before closing/);assert.match(text,/saving that copy may overwrite/);assert.match(text,/Export backups/);assert.match(text,/Backups contain saved records/);assert.match(text,/do not rely on them to resume an unfinished workout/);assert.match(text,/cannot guarantee/);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),true,label+' no horizontal overflow');
  await page.reload();await page.evaluate(()=>go('today'));assert.equal(await warning.isVisible(),true,label+' warning after reload');
  assert.deepEqual(await page.evaluate(()=>[localStorage.getItem('synthetic-completed-workout'),localStorage.getItem('synthetic-garmin-record')]),['completed','garmin']);
  await context.close();console.log(label+' warning and synthetic sentinels: PASS');
 }}finally{await browser.close();await new Promise(done=>server.close(done))}
})().catch(e=>{console.error(e);process.exitCode=1});
