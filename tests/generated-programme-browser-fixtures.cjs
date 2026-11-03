// Exercise the real generated-proposal approval safeguards with synthetic data only.
const assert=require('node:assert/strict');
module.exports=async function approveGeneratedProgramme(page){
 await page.locator('#generatedProgrammeReview').waitFor();
 assert.equal(await page.locator('#replacementApply').isDisabled(),true);
 const download=page.waitForEvent('download');await page.locator('#replacementDownload').click();
 const file=await download;await page.setInputFiles('#replacementVerifyBackup',await file.path());
 await page.getByText('Fresh backup verified.',{exact:false}).waitFor();
 await page.locator('#replacementConsent').check();
 assert.equal(await page.locator('#replacementApply').isEnabled(),true);
 await page.locator('#replacementApply').click();
 await page.getByText('Programme change saved and verified.',{exact:false}).waitFor();
};
