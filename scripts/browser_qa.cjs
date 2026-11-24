// Real Chromium acceptance checks, with screenshots for visual review.
const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const output = path.resolve(process.env.QA_OUTPUT || 'browser-qa-results');
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
    for (const view of ['trend','structure','judiciary','validation']) {
      await page.locator('[data-module="'+view+'"]').click();
      await sleep(400);
      if (view === 'trend') {
        await check(label+' trend period switching', async()=>{
          const modes=[['month','monthlyChart'],['quarter','quarterChart'],['half','halfTrendChart']];
          for (const [mode,id] of modes) {
            await page.locator('[data-trend-view="'+mode+'"]').click();
            await sleep(180);
            const box=await page.locator('#'+id).evaluate(el=>({width:el.clientWidth,height:el.clientHeight,canvas:el.querySelectorAll('canvas').length}));
            assert.ok(box.width>0&&box.height>0,label+' '+mode+' trend chart did not resize');
            assert.ok(box.canvas>0,label+' '+mode+' trend chart missing canvas');
          }
          await page.locator('[data-trend-view="month"]').click();
          await sleep(180);
          return {modes:['month','quarter','half'],rendered:true};
        });
      }
      const detail = await page.evaluate(() => ({viewportWidth:innerWidth,documentWidth:document.documentElement.scrollWidth,charts:[...document.querySelectorAll('.view.active .chart:not(#caseConstellation)')].filter(x=>x.getClientRects().length>0).map(x=>({id:x.id,width:x.clientWidth,height:x.clientHeight,canvas:x.querySelectorAll('canvas').length,text:x.textContent.slice(0,80)}))}));
      await page.screenshot({path:path.join(output,label+'-'+view+'.png'),fullPage:true});
      report.views.push({viewport:label,view,...detail});
      assert.ok(detail.documentWidth <= viewport.width + 1, label+' '+view+' overflows: '+detail.documentWidth);
      assert.ok(detail.charts.every(x=>x.width>0&&x.height>0),label+' '+view+' zero-sized chart');
      assert.ok(detail.charts.every(x=>x.canvas>0),label+' '+view+' missing actual ECharts rendering');
    }
    await page.locator('[data-module="trend"]').click();
    await check(label+' chart tooltip',async()=>{
      await page.locator('#monthlyChart').scrollIntoViewIfNeeded();
      const point=await page.evaluate(()=>{const el=document.getElementById('monthlyChart'),chart=echarts.getInstanceByDom(el),xy=chart.convertToPixel({seriesIndex:0},[0,230]),rect=el.getBoundingClientRect();return {x:rect.x+xy[0],y:rect.y+xy[1]};});
      await page.mouse.move(point.x,point.y);await sleep(200);
      const text=await page.locator('#monthlyChart').innerText();assert.match(text,/FJC R24 v3/);return {sourceTooltip:true};
    });
    await page.locator('[data-module="structure"]').click();
    await sleep(300);
    await check(label+' map markers and popup',async()=>{
      assert.equal(await page.locator('.leaflet-interactive').count(),22);
      const outside=await page.evaluate(()=>{const r=document.getElementById('map').getBoundingClientRect();return [...document.querySelectorAll('.leaflet-interactive')].filter(el=>{const q=el.getBoundingClientRect(),x=q.x+q.width/2,y=q.y+q.height/2;return x<r.x||x>r.right||y<r.y||y>r.bottom;}).length;});
      assert.equal(outside,0,'initial map clips locator centers');
      await page.locator('.leaflet-interactive').first().click();
      await page.locator('.leaflet-popup-content').waitFor();
      const text=await page.locator('.leaflet-popup-content').innerText();
      assert.match(text,/N.D. Illinois/);assert.match(text,/2026 Q2/);assert.match(text,/3,840/);
      await page.locator('.leaflet-popup-close-button').click({trial:true});
      await sleep(500);
      await page.screenshot({path:path.join(output,label+'-map-popup.png'),fullPage:true});
      const closeInside=await page.evaluate(()=>{const r=document.getElementById('map').getBoundingClientRect(),q=document.querySelector('.leaflet-popup-close-button').getBoundingClientRect();return q.top>=r.top&&q.bottom<=r.bottom;});
      assert.ok(closeInside,'popup close button clipped after screenshot/resize');
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
    await check(label+' quarter, exclusion and synchronized geographic views',async()=>{
      await page.selectOption('#yearFilter','2026');await page.selectOption('#quarterFilter','2026 Q2');
      assert.match(await page.locator('#filterSummary').innerText(),/865 条候选记录/);
      assert.equal(await page.locator('#quarterFilter option[value="2026 Q3"]').count(),0);
      await page.locator('#resetFilters').click();await page.check('#excludeIllinois');
      assert.match(await page.locator('#filterSummary').innerText(),/711 条候选记录/);
      assert.equal(await page.locator('.leaflet-interactive').count(),21);
      await page.locator('[data-geo-mode="list"]').click();assert.equal(await page.locator('#districtList tbody tr').count(),21);
      assert.ok(!(await page.locator('#districtList').innerText()).includes('N.D. Illinois'));
      await page.locator('[data-geo-mode="map"]').click();await page.locator('#resetFilters').click();
      return {quarter:865,excluded:711};
    });
    await page.locator('[data-module="judiciary"]').click();
    await check(label+' constellation and non-destructive drill-down',async()=>{
      await page.selectOption('#caseStatus','pending');
      await page.locator('[data-case-mode="constellation"]').click();
      const data=await page.evaluate(()=>echarts.getInstanceByDom(document.getElementById('caseConstellation')).getOption().series.flatMap(s=>s.data));
      assert.equal(data.length,1);assert.ok(Number.isFinite(data[0].value[0]));
      await page.evaluate(()=>openCase(echarts.getInstanceByDom(document.getElementById('caseConstellation')).getOption().series.flatMap(s=>s.data)[0].caseKey));
      assert.equal(await page.locator('#caseStatus').inputValue(),'pending');
      assert.equal(await page.locator('.case[open]').count(),1);
      await page.selectOption('#caseStatus','all');return {nodes:data.length,filterPreserved:true};
    });
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
