const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{chromium}=require('playwright');
const C=require('../src/programme-catalogue'),T=require('../src/catalogue-training'),root=path.resolve(__dirname,'..');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox']});const context=await browser.newContext({viewport:{width:393,height:852},serviceWorkers:'block'});try{
 const state=T.enrol(T.empty(),C.previewProgramme('10k-two-run'),'2026-11-16','run');
 await context.addInitScript(s=>localStorage.setItem('lhrf-catalogue-preview-v1',JSON.stringify(s)),state);
 const page=await context.newPage();await page.route('https://owner-test.test/**',r=>{let p=new URL(r.request().url()).pathname;if(p.endsWith('/'))p+='index.html';let f=path.resolve(root,'.'+p);if(!f.startsWith(root+path.sep)||!fs.existsSync(f))return r.fulfill({status:404});return r.fulfill({body:fs.readFileSync(f),contentType:f.endsWith('.js')?'application/javascript':f.endsWith('.css')?'text/css':'text/html'})});
 await page.clock.install({time:new Date('2026-11-16T09:00:00Z')});await page.goto('https://owner-test.test/catalogue-preview/');await page.getByRole('button',{name:'Calendar',exact:true}).click();await page.getByRole('button',{name:'Open workout'}).first().click();
 assert.equal(await page.getByRole('button',{name:'Download Garmin FIT'}).count(),0);assert.equal(await page.getByLabel('Import completed Garmin activity · FIT, TCX or GPX').count(),0);
 assert.equal(await page.evaluate(async()=>{try{await fetch('https://example.invalid/test');return 'allowed'}catch{return 'blocked'}}),'blocked');assert.equal(await page.evaluate(()=>{try{window.open('https://example.invalid');return 'allowed'}catch{return 'blocked'}}),'blocked');
 console.log('PASS standalone candidate hides Garmin file routes and blocks tested external fetch/popup');
 }finally{await context.close();await browser.close()}})().catch(e=>{console.error(e);process.exitCode=1});
