// V0.9 filing filters share one anonymous month × district × NOS table.
const sum = rows => rows.reduce((n, x) => n + x.count, 0);
const selected = id => $(id).value;
const pct = (a, b) => b ? ((a / b - 1) * 100).toFixed(2) + '%' : '基期为0，不计算';
function filingRows(ignoreYear = false) {
  return F.cells.filter(x => (ignoreYear || selected('yearFilter') === 'all' || x.month.startsWith(selected('yearFilter')))
    && (selected('districtFilter') === 'all' || x.district === selected('districtFilter'))
    && (selected('circuitFilter') === 'all' || D.districts.find(d => d.code === x.district).circuit === selected('circuitFilter'))
    && (selected('nosFilter') === 'all' || x.nos === selected('nosFilter')));
}
function groupRows(rows, keys, keyFor) {
  return keys.map(key => ({ key, count: sum(rows.filter(x => keyFor(x) === key)) }));
}
const quarterOf = x => x.month.slice(0, 4) + ' Q' + Math.ceil(Number(x.month.slice(5)) / 3);
const halfOf = x => x.month.slice(0, 4) + ' H' + (Number(x.month.slice(5)) <= 6 ? 1 : 2);
function table(headers, rows) {
  return '<div class="data-fallback"><table class="table"><thead><tr>' + headers.map(x => '<th>' + esc(x) + '</th>').join('')
    + '</tr></thead><tbody>' + rows.map(row => '<tr>' + row.map(x => '<td>' + esc(x) + '</td>').join('') + '</tr>').join('') + '</tbody></table></div>';
}
function updateChart(id, option, headers, rows) {
  if (charts[id]) { option.tooltip = {trigger: id === 'nosChart' ? 'item' : 'axis', confine: true, formatter: params => {const items=Array.isArray(params)?params:[params];return esc(items[0]?.name||'')+'<br>'+items.map(p=>esc(p.seriesName||'候选记录')+'：'+fmt(p.value)).join('<br>')+'<br>当前立案筛选合计：'+fmt(sum(filingRows()))+' 条<br>FJC R24 v3 · FILEDATE截至2026-06-30';}}; charts[id].setOption(option, { replaceMerge: ['series'] }); }
  else $(id).innerHTML = table(headers, rows);
}
function initMap() {
  if (!window.L) { $('map').innerHTML = '<div class="callout">地图未能加载；下方地区数据表仍可查看全部数值。</div>'; return; }
  map = L.map('map',{zoomSnap:0.5}).setView([38.7, -96], 4);
  const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 11, attribution: '© OpenStreetMap' });
  tiles.on('tileerror', () => { $('mapStatus').textContent = '地图底图暂不可用；定位点及下方数据表仍可使用。'; });
  tiles.addTo(map);
}
let lastMapWidth = 0;
function fitMapView() {
  if (!map || !document.getElementById('map').clientWidth) return;
  lastMapWidth = document.getElementById('map').clientWidth;
  const district = D.districts.find(x => x.code === selected('districtFilter'));
  if (district) {map.setView([district.lat,district.lng],6);return;}
  const points = D.districts.filter(x => selected('circuitFilter') === 'all' || x.circuit === selected('circuitFilter')).map(x => [x.lat,x.lng]);
  if (points.length) map.fitBounds(points,{padding:[24,24],maxZoom:4});
}
function updateMap(rows) {
  if (!map) return;
  markers.forEach(m => m.remove()); markers = [];
  D.districts.forEach(d => {
    const districtRows = rows.filter(x => x.district === d.code), n = sum(districtRows);
    const quarters = groupRows(districtRows, D.quarters.filter(q => selected('yearFilter') === 'all' || q.label.startsWith(selected('yearFilter'))).map(q => q.label), quarterOf);
    const marker = L.circleMarker([d.lat, d.lng], {radius: Math.max(4, Math.min(17, 4 + Math.sqrt(n) / 3)), color: n ? '#356b89' : '#aab8c3', fillColor: n ? '#79a8bb' : '#e2e8ed', fillOpacity: .78, weight: 1}).addTo(map);
    marker.bindPopup('<b>' + esc(d.name) + '</b><br>' + esc(d.circuit) + '<br>当前筛选候选记录：' + fmt(n) + '<br>近似城市：' + esc(d.locator) + '<br><a target="_blank" rel="noopener" href="' + esc(d.locatorSource) + '">法院城市来源</a><br>' + quarters.map(q => esc(q.key) + '：' + fmt(q.count)).join('<br>'), {maxHeight:200,autoPanPadding:[16,16],keepInView:true});
    markers.push(marker);
  });
  fitMapView();
}
function updateFilings() {
  const rows = filingRows(), allYears = filingRows(true), year = selected('yearFilter');
  const months = groupRows(rows, D.monthly.filter(x => year === 'all' || x.month.startsWith(year)).map(x => x.month), x => x.month);
  const quarters = groupRows(rows, D.quarters.filter(x => year === 'all' || x.label.startsWith(year)).map(x => x.label), quarterOf);
  const halves = groupRows(rows, D.halfYears.filter(x => year === 'all' || x.period.startsWith(year)).map(x => x.period), halfOf);
  const scope = ['yearFilter', 'circuitFilter', 'districtFilter', 'nosFilter'].map(id => $(id).selectedOptions[0].textContent).join(' · ');
  $('filterSummary').textContent = '当前立案筛选：' + scope + ' ｜ ' + fmt(sum(rows)) + ' 条候选记录。来源：FJC R24 v3，FILEDATE截至2026-06-30。';
  for (const id of ['overviewTrend', 'monthlyChart']) updateChart(id, {xAxis: {data: months.map(x => x.key)}, series: [{name: '候选记录（FJC R24 v3）', type: 'line', data: months.map(x => x.count), itemStyle: {color: '#3d7da0'}, symbolSize: 5}]}, ['月度', '候选记录'], months.map(x => [x.key, x.count]));
  updateChart('quarterChart', {xAxis: {data: quarters.map(x => x.key)}, series: [{name: '候选记录（FJC R24 v3）', type: 'bar', data: quarters.map(x => x.count), itemStyle: {color: '#719db3'}, label: {show: true, position: 'top'}}]}, ['季度', '候选记录'], quarters.map(x => [x.key, x.count]));
  updateChart('overviewHalf', {xAxis: {data: halves.map(x => x.key)}, series: [{name: '候选记录（FJC R24 v3）', type: 'bar', data: halves.map(x => x.count), itemStyle: {color: '#659b9a'}, label: {show: true, position: 'top'}}]}, ['半年度', '候选记录'], halves.map(x => [x.key, x.count]));
  const h25 = sum(allYears.filter(x => halfOf(x) === '2025 H1')), h252 = sum(allYears.filter(x => halfOf(x) === '2025 H2')), h26 = sum(allYears.filter(x => halfOf(x) === '2026 H1'));
  $('halfComparison').textContent = '同一地区/巡回区/NOS条件下：2026 H1同比 ' + pct(h26, h25) + '；较2025 H2 ' + pct(h26, h252) + '。';
  $('halfRows').innerHTML = halves.map(x => '<tr><td>' + esc(x.key) + '</td><td>' + fmt(x.count) + '</td><td>' + (x.count / 6).toFixed(1) + '</td><td>' + (x.key === '2026 H1' ? pct(x.count, h25) : '—') + '</td></tr>').join('');
  const q = key => sum(allYears.filter(x => quarterOf(x) === key));
  $('quarterComparison').textContent = '同一地区/巡回区/NOS条件下：2026 Q1较2025 Q4 ' + pct(q('2026 Q1'), q('2025 Q4')) + '；2026 Q2较Q1 ' + pct(q('2026 Q2'), q('2026 Q1')) + '。比较期间固定，不受年份显示选择影响。';
  const districts = D.districts.filter(x => (selected('circuitFilter') === 'all' || x.circuit === selected('circuitFilter')) && (selected('districtFilter') === 'all' || x.code === selected('districtFilter'))).map(x => ({...x, count: sum(rows.filter(r => r.district === x.code))})).sort((a,b) => b.count - a.count);
  updateChart('districtChart', {yAxis: {data: districts.map(x => x.name), inverse: true}, series: [{name: '候选记录（FJC R24 v3）', type: 'bar', data: districts.map(x => x.count), itemStyle: {color: '#719db2'}, label: {show: true, position: 'right', fontSize: 9}}]}, ['地区', '候选记录'], districts.map(x => [x.name, x.count]));
  const nos = D.nos.filter(n => selected('nosFilter') === 'all' || n.code === selected('nosFilter')).map(n => ({...n, count: sum(rows.filter(x => x.nos === n.code))}));
  updateChart('nosChart', {series: [{type: 'pie', center: ['50%','38%'], radius: ['30%', '54%'], label: {show: false}, data: nos.map(x => ({name: x.code + ' · ' + x.label, value: x.count}))}]}, ['NOS', '候选记录'], nos.map(x => [x.code + ' · ' + x.label, x.count]));
  const changed = districts.map(d => ({name: d.name, value: sum(allYears.filter(x => x.district === d.code && halfOf(x) === '2026 H1')) - sum(allYears.filter(x => x.district === d.code && halfOf(x) === '2025 H1'))})).sort((a,b) => Math.abs(b.value)-Math.abs(a.value)).slice(0,6);
  updateChart('overviewDistrict', {yAxis: {data: changed.map(x => x.name)}, series: [{name: '2026 H1 − 2025 H1（候选记录）', type: 'bar', data: changed.map(x => x.value), itemStyle: {color: '#7da9bd'}, label: {show: true, position: 'right'}}]}, ['地区', 'H1同比增量'], changed.map(x => [x.name, x.value]));
  const other = allYears.filter(x => x.district !== '7-52');
  const categories = D.nos.filter(x => selected('nosFilter') === 'all' || x.code === selected('nosFilter'));
  const other25 = categories.map(n => sum(other.filter(x => x.nos === n.code && halfOf(x) === '2025 H1'))), other26 = categories.map(n => sum(other.filter(x => x.nos === n.code && halfOf(x) === '2026 H1')));
  updateChart('regionNosChart', {xAxis: {data: categories.map(x => x.code)}, series: [{name: '2025 H1', type: 'bar', data: other25, itemStyle:{color:'#b4c7d1'}},{name: '2026 H1', type: 'bar', data: other26, itemStyle:{color:'#6d9e9b'}}]}, ['NOS', '2025 H1', '2026 H1'], categories.map((n,i) => [n.code, other25[i], other26[i]]));
  $('filingData').innerHTML = table(['月度', '候选记录'], months.map(x => [x.key, x.count])) + table(['地区', '候选记录'], districts.map(x => [x.name, x.count])) + table(['NOS', '候选记录'], nos.map(x => [x.code + ' · ' + x.label, x.count]));
  updateMap(rows);
}
function cases() {
  const q = selected('caseSearch').trim().toLowerCase(), topic = selected('caseTopic');
  const aliases = {pj: ['pj', 'jurisdiction', 'personal-jurisdiction'], tro: ['tro', 'pi'], damages: ['damages','profits'], joinder: ['joinder','rule20'], asset: ['asset','asset-freeze'], service:['service']};
  const fields = {caseCourt:'court', caseAuthority:'authorityType', caseEvidence:'evidenceType', caseCircuit:'circuit', caseStatus:'procedureStatus'};
  const arr = C.cases.filter(x => Object.entries(fields).every(([id,field]) => selected(id) === 'all' || x[field] === selected(id))
    && (topic === 'all' || (x.topics || []).some(t => (aliases[topic] || [topic]).includes(t)))
    && [x.title,x.caseNo,x.court,x.summary,x.issue,x.significance,x.decision,...(x.topics||[])].join(' ').toLowerCase().includes(q));
  $('caseCount').textContent = '显示 ' + arr.length + ' / ' + C.cases.length + ' 案';
  $('caseList').innerHTML = arr.map(x => '<details class="case"><summary><div><h3>' + esc(x.title) + '</h3><div class="meta2">' + esc(x.caseNo) + ' · ' + esc(x.court) + ' · ' + esc(x.date) + ' · ' + esc(x.outcomeLabel || '') + '</div></div><span class="tag">' + esc(x.authorityType) + '<br>' + esc(x.evidenceType) + '</span></summary><div class="casebody"><div class="callout">判例效力：' + esc(x.authorityType) + ' ｜ 来源：' + esc(x.evidenceType) + '<br>' + esc(x.sourceNote || '') + '</div>'
    + [['案件背景',x.summary],['核心争点',x.issue],['法院处理',x.decision],['研究意义与适用边界',x.significance]].map(([h,t]) => '<h4>'+h+'</h4><p>'+esc(t)+'</p>').join('')
    + '<h4>程序时间线</h4><div class="timeline">' + (x.timeline||[]).map(t => '<div><b>'+esc(t.date)+' · '+esc(t.label)+'</b><br>'+esc(t.detail)+'</div>').join('') + '</div><h4>来源</h4><ul>'
    + (x.sources||[]).map(s => '<li><a href="'+esc(s.url)+'" target="_blank" rel="noopener">'+esc(s.label)+'</a> <span class="meta2">('+esc(s.role||'')+')</span></li>').join('')+'</ul></div></details>').join('') || '<div class="callout">没有匹配的案件。可清空搜索或重置档案筛选。</div>';
}
function addOptions(id, values) {
  [...new Set(values)].sort().forEach(v => { const o=document.createElement('option'); o.value=v; o.textContent=v; $(id).appendChild(o); });
}
function fixedFallbacks() {
  if (window.echarts) return;
  const content = {
    statusChart: [['状态','候选记录'], [['已终止',3506],['待审',1045]]],
    dispChart: [['DISP','数量'], D.disp.map(x => [x.code+' · '+x.label,x.count])],
    judgmentChart: [['判决子集','数量'], [['有利原告',1360],['有利被告',8]]],
    precisionChart: [['估计','百分比'], [['保守点估计',88.59],['95%区间下限',82.34],['95%区间上限',94.84],['敏感性上端',100]]],
    brandAnnualChart: [['TFL期间','样本案件'],D.brands.annual.map(x=>[x.period,x.count])],
    brandChart: [['品牌','2025全年','2026年1—8月'],D.brands.rows.map(x=>[x.brand,x.y2025,x.y2026])],
    abtlChart: [['ABTL年份','二手统计'],D.abtl.historical.map(x=>[x.year+(x.partial?'*':''),x.count])]
  };
  Object.entries(content).forEach(([id,[headers,rows]]) => $(id).innerHTML=table(headers,rows));
}
function initUI() {
  addOptions('circuitFilter', D.districts.map(x=>x.circuit));
  for (const d of D.districts.slice().sort((a,b)=>a.name.localeCompare(b.name))) {const o=document.createElement('option'); o.value=d.code;o.textContent=d.name;$('districtFilter').appendChild(o);}
  for (const [id,field] of Object.entries({caseCourt:'court',caseAuthority:'authorityType',caseEvidence:'evidenceType',caseCircuit:'circuit'})) addOptions(id,C.cases.map(x=>x[field]));
  for (const id of ['yearFilter','circuitFilter','districtFilter','nosFilter']) $(id).addEventListener('change',()=>{
    if(id==='circuitFilter') { if(selected('districtFilter')!=='all' && D.districts.find(x=>x.code===selected('districtFilter')).circuit!==selected('circuitFilter') && selected('circuitFilter')!=='all') $('districtFilter').value='all'; }
    if(id==='districtFilter' && selected(id)!=='all') $('circuitFilter').value=D.districts.find(x=>x.code===selected(id)).circuit;
    updateFilings();
  });
  $('resetFilters').onclick=()=>{ for(const id of ['yearFilter','circuitFilter','districtFilter','nosFilter']) $(id).value='all';updateFilings(); };
  $('caseSearch').addEventListener('input',cases);
  for(const id of ['caseAuthority','caseEvidence','caseCircuit','caseStatus','caseTopic','caseCourt']) $(id).addEventListener('change',cases);
  const reset=document.createElement('button');reset.className='reset';reset.textContent='重置档案筛选';reset.onclick=()=>{$('caseSearch').value='';for(const id of ['caseAuthority','caseEvidence','caseCircuit','caseStatus','caseTopic','caseCourt']) $(id).value='all';cases();};document.querySelector('.tools').appendChild(reset);
  // Four research modules preserve the eight audited sections; no denominator is merged.
  const modules = {
    trend: {title:'01 · 趋势与拐点',description:'总览判断、月度/季度/半年度候选案卷趋势与比较基准。',ids:['overview','trend'],names:['研究总览','时间趋势'],filing:true},
    structure: {title:'02 · 地域与结构',description:'地区与NOS结构、地图分布，以及独立口径的结案和程序结果。',ids:['geography','outcomes'],names:['地区与权利类型','结案与程序结果'],filing:true},
    judiciary: {title:'03 · 司法规则与案件档案',description:'以案件、法院裁判、程序时间线和证据等级为核心的司法规则研究。',ids:['cases'],names:['法院规则与案件档案'],filing:false},
    validation: {title:'04 · 品牌样本与数据核验',description:'品牌活动样本、外部历史参考、识别质量及可复核研究方法。',ids:['plaintiffs','quality','method'],names:['品牌样本与历史参考','候选识别质量','方法与来源'],filing:false}
  };
  // Research reading order is independent of historical DOM order.
  const main = document.querySelector('main');
  for (const id of ['overview','trend','geography','outcomes','cases','plaintiffs','quality','method']) main.appendChild($(id));
  function activateModule(key) {
    const module = modules[key];
    if (!module) return;
    document.querySelectorAll('.tab').forEach(b=>{const active=b.dataset.module===key;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
    document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active',module.ids.includes(v.id)));
    document.querySelector('.filters').hidden=!module.filing;
    $('filterSummary').hidden=!module.filing;
    $('moduleTitle').textContent=module.title;
    $('moduleDescription').textContent=module.description;
    $('moduleLinks').replaceChildren();
    module.ids.forEach((id,i)=>{const button=document.createElement('button');button.type='button';button.textContent=module.names[i];button.addEventListener('click',()=>$(id).scrollIntoView({behavior:'smooth',block:'start'}));$('moduleLinks').appendChild(button);});
    requestAnimationFrame(()=>{Object.values(charts).forEach(c=>c.resize());map?.invalidateSize();fitMapView();});
  }
  for (const button of document.querySelectorAll('.tab')) button.addEventListener('click',()=>activateModule(button.dataset.module));
  activateModule('trend');
  for (const id of ['outcomes','quality','plaintiffs','cases','method']) {const note=document.createElement('div');note.className='callout fixed-scope';note.textContent=id==='cases'?'精选案件档案使用下方独立筛选，不受FJC立案筛选影响。':'本模块保留自身统计总体；不随立案筛选变化。';$(id).prepend(note);}
  document.querySelectorAll('.tab').forEach(b=>b.setAttribute('aria-pressed',String(b.classList.contains('active'))));
  window.addEventListener('resize',()=>{const width=document.getElementById('map').clientWidth;if(map&&width&&width!==lastMapWidth){map.invalidateSize();fitMapView();}});
  fixedFallbacks(); cases(); updateFilings();
}
async function readJSON(path) { const response=await fetch(path);if(!response.ok) throw new Error(path+' HTTP '+response.status);return response.json(); }
Promise.all(['v09_research','case_dossiers','filing_cells'].map(x=>readJSON('./data/'+x+'.json'))).then(([d,c,f])=>{
  D=d;C=c;F=f;
  if(sum(F.cells)!==4551) throw new Error('立案交叉表总量不一致');
  const status=document.createElement('div');status.id='mapStatus';status.className='mapnote';status.setAttribute('role','status');$('map').after(status);
  const fallback=document.createElement('details');fallback.className='callout';fallback.innerHTML='<summary>查看当前筛选数据与来源</summary><p>FJC R24 v3：月度 × 地区 × NOS汇总；统计单位为候选案卷记录，零值表示该候选池内没有符合条件的记录。</p><div id="filingData"></div>';$('geography').appendChild(fallback);
  initCharts();initMap();initUI();
}).catch(error=>{const message=document.createElement('div');message.className='callout warn';message.textContent='数据加载失败：'+error.message;document.querySelector('main').replaceChildren(message);});
