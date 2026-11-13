// Synthetic additional native catalogue journeys. No athlete records or live requests.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
const file=path.join(__dirname,'structured-five-athletes.browser.cjs');
const source=fs.readFileSync(file,'utf8').split('(async()=>{const browser')[0].replace('await selectDays(page,p.days);',\"if(p.programme==='powerlifting-four-day'){for(const lift of ['squat','bench','deadlift'])await page.locator('select[name=weakness-'+lift+']').selectOption({index:1});} await selectDays(page,p.days);\");
const {one}=new Function('require','process','__dirname',source+';return {one}')(require('node:module').createRequire(file),process,__dirname);
const profiles=[
 {id:'bench-specialist',programme:'bench-specialisation',discipline:'strength',days:['Monday','Wednesday','Friday']},
 {id:'deadlift-specialist',programme:'deadlift-specialisation',discipline:'strength',days:['Monday','Wednesday','Friday']},
 {id:'half-marathon',programme:'half-marathon',discipline:'running',days:['Tuesday','Thursday','Saturday','Sunday']},
 {id:'marathon-distance',programme:'marathon-distance',discipline:'running',days:['Tuesday','Thursday','Saturday','Sunday']},
 {id:'marathon-timed',programme:'marathon-timed',discipline:'running',days:['Tuesday','Thursday','Saturday','Sunday']},
 {id:'general-strength',programme:'general-strength',discipline:'strength',days:['Monday','Wednesday','Friday']},
 {id:'powerlifting-four',programme:'powerlifting-four-day',discipline:'strength',days:['Monday','Tuesday','Thursday','Saturday']},
];
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});const result=[];try{for(const p of profiles){const item=await one(browser,p);result.push(item);console.log('ADDITIONAL_JOURNEY '+JSON.stringify({profile:p.id,passed:item.passed,steps:item.steps,saved:item.saved,plans:item.plans?.map(x=>({id:x.id,weeks:x.weeks})),failure:item.failure,errors:item.errors}));}}finally{await browser.close()}assert.equal(result.filter(x=>x.passed).length,profiles.length,'One or more additional catalogue journeys failed');})().catch(e=>{console.error(e);process.exitCode=1});
