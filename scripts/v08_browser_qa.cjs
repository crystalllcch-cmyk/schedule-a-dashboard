const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const report = { browser: 'Chromium', viewport: '1440x1000', checks: [], errors: [], status: 'running' };
const out = path.resolve('browser-qa-results');
fs.mkdirSync(out, { recursive: true });
const pass = (name, detail) => report.checks.push({ name, passed: true, detail });
const fail = (name, error) => report.checks.push({ name, passed: false, error: String(error) });
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
  page.on('pageerror', e => report.errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') report.errors.push('console: ' + m.text()); });
  try {
    await page.goto('http://127.0.0.1:8787/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForFunction(() => typeof window.echarts !== 'undefined' && document.querySelector('#total')?.textContent.trim() === '4,551', null, { timeout: 30000 });
    pass('数据加载', 'ECharts已加载，首页候选记录总数为4,551');
    const views = [
      ['overview', ['history', 'quarters', 'geo']],
      ['activity', ['history2', 'q2', 'nos', 'growth']],
      ['brands', ['brandAnnual', 'brandMini']],
      ['explorer', ['districts', 'groups', 'heat']]
    ];
    for (const [view, chartIds] of views) {
      await page.locator('[data-view="' + view + '"]').click();
      await page.waitForTimeout(450);
      for (const id of chartIds) {
        const size = await page.locator('#' + id).evaluate(el => {
          const r = el.getBoundingClientRect();
          return { width: Math.round(r.width), height: Math.round(r.height), canvases: el.querySelectorAll('canvas').length };
        });
        if (size.width < 100 || size.height < 100 || size.canvases < 1) throw new Error(view + '/' + id + ' chart not rendered: ' + JSON.stringify(size));
      }
      await page.screenshot({ path: path.join(out, view + '.png'), fullPage: true });
      pass('页面图表渲染：' + view, chartIds.join(', ') + ' 均有可见画布及有效尺寸');
    }
    await page.locator('[data-view="overview"]').click();
    await page.locator('#year').selectOption('2026');
    if ((await page.locator('#total').textContent()).trim() !== '1,636') throw new Error('2026筛选总数不等于1,636');
    await page.locator('#quarter').selectOption('2');
    if ((await page.locator('#total').textContent()).trim() !== '865') throw new Error('2026第二季度筛选总数不等于865');
    await page.locator('#district').selectOption('7-52');
    if ((await page.locator('#total').textContent()).trim() !== '658') throw new Error('伊利诺伊北区2026第二季度记录数不等于658');
    pass('年份、季度、地区组合筛选', '2026全年1,636；2026第二季度865；伊利诺伊北区2026第二季度658');
    await page.locator('#reset').click();
    if ((await page.locator('#total').textContent()).trim() !== '4,551') throw new Error('重置后未恢复4,551');
    pass('筛选重置', '重置后恢复4,551');
    await page.locator('[data-view="geography"]').click();
    await page.locator('#mapNodes [data-code="3-15"]').click({ force: true });
    if ((await page.locator('#total').textContent()).trim() !== '178') throw new Error('地图点击宾夕法尼亚西区后数量不等于178');
    pass('地图节点联动', '点击宾夕法尼亚西区节点后，筛选总数更新为178');
    await page.locator('#reset').click();
    await page.locator('[data-view="brands"]').click();
    await page.locator('#brandBars button').first().click();
    if (!(await page.locator('#drawer').evaluate(el => el.classList.contains('open')))) throw new Error('品牌详情抽屉未打开');
    await page.locator('#close').click();
    pass('品牌详情交互', '点击品牌详情按钮可打开并关闭详情抽屉');
    await page.locator('[data-view="casefiles"]').click();
    const firstCase = page.locator('#caseGrid [data-case-id]').first();
    await firstCase.click();
    if (!(await page.locator('#drawer').evaluate(el => el.classList.contains('open')))) throw new Error('案件档案抽屉未打开');
    await page.screenshot({ path: path.join(out, 'case-dossier.png'), fullPage: true });
    pass('案件档案交互', '点击案件卡片可打开完整档案抽屉');
    if (report.errors.length) throw new Error('浏览器出现脚本/控制台错误：' + report.errors.join(' | '));
    report.status = 'passed';
  } catch (e) {
    report.status = 'failed';
    report.failure = e.stack || String(e);
    fail('执行中断', report.failure);
    try { await page.screenshot({ path: path.join(out, 'failure.png'), fullPage: true }); } catch {}
  } finally {
    fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(report, null, 2));
    await browser.close();
  }
  console.log(JSON.stringify(report, null, 2));
  if (report.status !== 'passed') process.exit(1);
})();