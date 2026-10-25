/* Explicit approved-programme activation. No athlete logs are removed. */
(function(root){
'use strict';
function install(state,config,engineModule,now=new Date().toISOString()){
 if(!config?.programmeId||!config.sessionNamespace||!config.startDate||config.weeks!==5)throw Error('Invalid approved programme.');
 const next=JSON.parse(JSON.stringify(state));if(next.customRoadmap?.programmeId===config.programmeId)return next;
 const archive={programme:next.customRoadmap||null,schedule:next.activeSchedule||[],week:next.activeCustomWeek||1,overrides:next.overrides||{},decisions:next.decisions||[],archivedAt:now};
 next.programmeArchive=[...(next.programmeArchive||[]),archive];
 next.customRoadmap={...JSON.parse(JSON.stringify(config)),approvedAt:now};next.activeCustomWeek=1;next.overrides={};next.decisions=[];
 next.activeSchedule=engineModule.createEngine({data:next}).generatedSessions(next.customRoadmap,1);next.onboardingComplete=true;
 return next;
}
const api={install};if(typeof module==='object'&&module.exports)module.exports=api;else root.LHRFProgrammeInstall=api;
})(typeof globalThis!=='undefined'?globalThis:this);
