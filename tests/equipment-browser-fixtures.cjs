// Explicit confirmations for synthetic browser scenarios. Production has no
// default inventory; the separate equipment scenario tests unknown/missing kit.
const assert=require('node:assert/strict');
const {fullInventory}=require('./equipment-fixtures.cjs');
async function confirmOnboardingEquipment(page){
 const inventory=await page.evaluate(inv=>{
  const panel=[...document.querySelectorAll('#firstRun details')].find(p=>['Equipment','Specialist equipment (optional)'].includes(p.querySelector('summary')?.textContent));
  if(!panel)throw Error('Missing onboarding equipment controls');
  // The specialist inventory intentionally has no venue input.
  panel.querySelectorAll('select[aria-label]').forEach(x=>x.value=inv.items[x.getAttribute('aria-label')]||'unknown');
  panel.querySelectorAll('input[type="checkbox"][aria-label]').forEach(x=>{x.equipmentState=inv.items[x.getAttribute('aria-label')]||'unknown'});
  const legacySave=[...panel.querySelectorAll('button')].find(b=>b.textContent==='Save equipment');
  if(legacySave)legacySave.click();
  else panel.querySelector('input[type="checkbox"]').dispatchEvent(new Event('change',{bubbles:true}));
  return window.LHRFOnboardingEquipmentDraft||data.equipmentInventory;
 },fullInventory());
 assert.equal(inventory.source,'athlete-confirmed');assert.equal(inventory.items['straight-bar'],'available');
}
async function confirmPreviewEquipment(page){
 await page.evaluate(inv=>{
  const panel=document.getElementById('previewEquipment');if(!panel?.isConnected)throw Error('Preview equipment controls are not mounted');
  panel.querySelector('[data-venue]').value=inv.venueId;
  panel.querySelectorAll('[data-equipment]').forEach(x=>x.value=inv.items[x.dataset.equipment]||'unknown');
  panel.querySelectorAll('[data-setup]').forEach(x=>x.checked=inv.setups[x.dataset.setup]===x.value);
 },fullInventory());
}
module.exports={confirmOnboardingEquipment,confirmPreviewEquipment};
