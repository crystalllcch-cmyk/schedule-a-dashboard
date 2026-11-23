// Real Chromium acceptance checks, with screenshots for visual review.
const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const output = path.resolve('browser-qa-results');
fs.mkdirSync(output, { recursive: true });
const report = { startedAt: new Date().toISOString(), browser: 'Chromium', views: [], interactions: [], errors: [], status: 'running' };
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
let browser;
async function check(name, fn) {
  try { const detail = await fn(); report.interactions.push({name,passed:true,detail}); }
  catch (error) {report.interactions.push({name,passed:false,error:error.message});throw error;}
}
(async () => {
  browser = await chromium.launch({ headless: true });
  for (const viewport of [{width:1440,height:1000},{width:390,height:844}]) {
    const label = viewport.width === 390 ? 'mobile' : 'desktop';
    const context = await browser.newContext({viewport,deviceScaleFactor:1});
    const page = await context.newPage();
    page.on('pageerror', e => report.errors.push({viewport:label,error:e.message}));
    await page.goto(process.env.QA_URL || 'http://127.0.0.1:8787', {waitUntil:'domcontentloaded',timeout:90000});
    await page.locator('.case').first().waitFor({state:'attached',timeout:60000});
    assert.equal(await page.locator('.case').count(),26);
    for (const view of ['overview','trend','geography','outcomes','quality','plaintiffs','cases','method']) {
      await page.locator('[data-view="'+view+'"]').click();
      await sleep(400);
      const detail = await page.evaluate(() => ({viewportWidth:innerWidth,documentWidth:document.documentElement.scrollWidth,charts:[...document.querySelectorAll('.view.active .chart')].map(x=>({id:x.id,width:x.clientWidth,height:x.clientHeight,canvas:x.querySelectorAll('canvas').length,text:x.textContent.slice(0,80)}))}));
      await page.screenshot({path:path.join(output,label+'-'+view+'.png'),fullPage:true});
      report.views.push({viewport:label,view,...detail});
      assert.ok(detail.documentWidth <= viewport.width + 1, label+' '+view+' overflows: '+detail.documentWidth);
      assert.ok(detail.charts.every(x=>x.width>0&&x.height>0),label+' '+view+' zero-sized chart');
      assert.ok(detail.charts.every(x=>x.canvas>0),label+' '+view+' missing actual ECharts rendering');
    }
    await page.locator('[data-view="geography"]').click();
    await check(label+' map markers and popup',async()=>{
      assert.equal(await page.locator('.leaflet-interactive').count(),22);
      await page.locator('.leaflet-interactive').first().click();
      await page.locator('.leaflet-popup-content').waitFor();
      const text=await page.locator('.leaflet-popup-content').innerText();
      assert.match(text,/N.D. Illinois/);assert.match(text,/2026 Q2/);assert.match(text,/3,840/);
      await page.screenshot({path:path.join(output,label+'-map-popup.png'),fullPage:true});
      await page.locator('.leaflet-popup-close-button').click();
      const tiles=await page.locator('.leaflet-tile-loaded').count();
      assert.ok(tiles>0,'OSM tiles not loaded');return {markers:22,tiles,popup:text};
    });
    await check(label+' shared filters 2026 / W.D. Pennsylvania / copyright',async()=>{
      await page.selectOption('#yearFilter','2026');await page.selectOption('#districtFilter','3-15');await page.selectOption('#nosFilter','820');
      await page.locator('#filterSummary').filter({hasText:'113 条候选记录'}).waitFor();
      const counts=await page.evaluate(()=>echarts.getInstanceByDom(document.getElementById('monthlyChart')).getOption().series[0].data);
      assert.equal(counts.reduce((a,b)=>a+b,0),113);
      await page.screenshot({path:path.join(output,label+'-filtered-geography.png'),fullPage:true});return {total:113,monthlySeries:counts};
    });
    await check(label+' zero result and reset',async()=>{
      await page.selectOption('#nosFilter','835');assert.match(await page.locator('#filterSummary').innerText(),/0 条候选记录/);
      await page.locator('#resetFilters').click();assert.match(await page.locator('#filterSummary').innerText(),/4,551 条候选记录/);
      assert.equal(await page.locator('#nosFilter').inputValue(),'all');
    });
    await page.locator('[data-view="cases"]').click();
    await check(label+' pending appeal filter',async()=>{
      await page.selectOption('#caseStatus','pending');assert.equal(await page.locator('.case').count(),1);assert.match(await page.locator('.case').innerText(),/Adidas/i);
      await page.selectOption('#caseStatus','all');
    });
    await check(label+' keyboard details and source note',async()=>{
      await page.locator('#caseSearch').fill('24-1538');assert.equal(await page.locator('.case').count(),1);
      await page.locator('.case summary').focus();await page.keyboard.press('Enter');
      assert.equal(await page.locator('.case').getAttribute('open'),'');
      assert.match(await page.locator('.casebody').innerText(),/impermissible/);
      await page.screenshot({path:path.join(output,label+'-keyboard-dossier.png'),fullPage:true});
    });
    await context.close();
  }
  assert.equal(report.errors.length,0,JSON.stringify(report.errors));
  report.status='passed';
})().catch(error=>{report.status='failed';report.failure=error.stack;process.exitCode=1;}).finally(async()=>{
  report.finishedAt=new Date().toISOString();fs.writeFileSync(path.join(output,'report.json'),JSON.stringify(report,null,2));
  console.log(JSON.stringify(report,null,2));if(browser)await browser.close();
});
