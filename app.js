// V0.9 filing filters share one anonymous month × district × NOS table.
const sum = rows => rows.reduce((n, x) => n + x.count, 0);
const selected = id => $(id).value;
const timeMatch = month => (selected('yearFilter')==='all'||month.startsWith(selected('yearFilter'))) && (selected('quarterFilter')==='all'||quarterOf({month})===selected('quarterFilter'));
const districtMatch = d => (selected('districtFilter')==='all'||d.code===selected('districtFilter')) && (selected('circuitFilter')==='all'||d.circuit===selected('circuitFilter')) && (!$('excludeIllinois').checked||d.code!=='7-52');
const pct = (a, b) => b ? ((a / b - 1) * 100).toFixed(2) + '%' : '基期为0，不计算';
function filingRows(ignoreYear = false) {
  return F.cells.filter(x => (ignoreYear || timeMatch(x.month)) && (!$('excludeIllinois').checked || x.district !== '7-52')
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
function updateFixedKpis() {
  const total = sum(F.cells);
  const h25 = sum(F.cells.filter(x => x.month >= '2025-01' && x.month <= '2025-06'));
  const h26 = sum(F.cells.filter(x => x.month >= '2026-01' && x.month <= '2026-06'));
  const nd25 = sum(F.cells.filter(x => x.month >= '2025-01' && x.month <= '2025-06' && x.district === '7-52'));
  const nd26 = sum(F.cells.filter(x => x.month >= '2026-01' && x.month <= '2026-06' && x.district === '7-52'));
  const cr25 = sum(F.cells.filter(x => x.month >= '2025-01' && x.month <= '2025-06' && x.nos === '820'));
  const cr26 = sum(F.cells.filter(x => x.month >= '2026-01' && x.month <= '2026-06' && x.nos === '820'));
  const yoy = (h26 / h25 - 1) * 100;
  const ndShare25 = nd25 / h25 * 100, ndShare26 = nd26 / h26 * 100;
  const crGrowth = (cr26 / cr25 - 1) * 100;
  const crContribution = (cr26 - cr25) / (h26 - h25) * 100;
  $('kpiCandidates').textContent = fmt(total);
  $('kpiCandidatesNote').textContent = '2025.01—2026.06 · ORIGIN=1新立案记录';
  $('kpiH1Growth').textContent = '+' + yoy.toFixed(1) + '%';
  $('kpiH1GrowthNote').textContent = fmt(h26) + '条；较2025 H1增加' + fmt(h26-h25) + '条';
  $('kpiNdilShare').textContent = ndShare26.toFixed(1) + '%';
  $('kpiNdilShareNote').textContent = fmt(nd26) + '条；较2025 H1下降' + (ndShare25-ndShare26).toFixed(1) + '个百分点';
  $('kpiCopyrightGrowth').textContent = '+' + crGrowth.toFixed(1) + '%';
  $('kpiCopyrightGrowthNote').textContent = fmt(cr25) + '→' + fmt(cr26) + '条；贡献全池净增量' + crContribution.toFixed(1) + '%';
}
function updateChart(id, option, headers, rows) {
  if (charts[id]) { option.tooltip = {trigger: id === 'nosChart' ? 'item' : 'axis', confine: true, formatter: params => {const items=Array.isArray(params)?params:[params];return esc(items[0]?.name||'')+'<br>'+items.map(p=>esc(p.seriesName||'候选记录')+'：'+fmt(p.value)).join('<br>')+'<br>'+(['overviewHalf','overviewDistrict','regionNosChart'].includes(id)?'固定比较期间；地理及NOS条件有效':'当前立案筛选合计：'+fmt(sum(filingRows()))+' 条')+'<br>FJC R24 v3 · FILEDATE截至2026-06-30';}}; charts[id].setOption(option, { replaceMerge: ['series'] }); }
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
  const district = D.districts.find(x => x.code === selected('districtFilter') && districtMatch(x));
  if (district) {map.setView([district.lat,district.lng],6);return;}
  const points = D.districts.filter(districtMatch).map(x => [x.lat,x.lng]);
  if (points.length) map.fitBounds(points,{padding:[24,24],maxZoom:4});
}
function updateMap(rows) {
  if (!map) return;
  markers.forEach(m => m.remove()); markers = [];
  D.districts.filter(districtMatch).forEach(d => {
    const districtRows = rows.filter(x => x.district === d.code), n = sum(districtRows);
    const quarters = groupRows(districtRows, D.quarters.filter(q => (selected('yearFilter') === 'all' || q.label.startsWith(selected('yearFilter'))) && (selected('quarterFilter')==='all'||q.label===selected('quarterFilter'))).map(q => q.label), quarterOf);
    const marker = L.circleMarker([d.lat, d.lng], {radius: Math.max(4, Math.min(17, 4 + Math.sqrt(n) / 3)), color: n ? '#356b89' : '#aab8c3', fillColor: n ? '#79a8bb' : '#e2e8ed', fillOpacity: .78, weight: 1}).addTo(map);
    marker.bindPopup('<b>' + esc(d.name) + '</b><br>' + esc(d.circuit) + '<br>当前筛选候选记录：' + fmt(n) + '<br>近似城市：' + esc(d.locator) + '<br><a target="_blank" rel="noopener" href="' + esc(d.locatorSource) + '">法院城市来源</a><br>' + quarters.map(q => esc(q.key) + '：' + fmt(q.count)).join('<br>'), {maxHeight:200,autoPanPadding:[16,16],keepInView:true});
    markers.push(marker);
  });
  fitMapView();
}
function updateFilings() {
  const rows = filingRows(), allYears = filingRows(true), year = selected('yearFilter');
  const months = groupRows(rows, D.monthly.filter(x => timeMatch(x.month)).map(x => x.month), x => x.month);
  const quarters = groupRows(rows, D.quarters.filter(x => (year === 'all' || x.label.startsWith(year)) && (selected('quarterFilter')==='all'||x.label===selected('quarterFilter'))).map(x => x.label), quarterOf);
  const halves = groupRows(allYears, D.halfYears.map(x => x.period), halfOf);
  const scope = ['yearFilter','quarterFilter','circuitFilter','districtFilter','nosFilter'].map(id => $(id).selectedOptions[0].textContent).join(' · ') + ($('excludeIllinois').checked?' · 排除 N.D. Illinois':'');
  $('filterSummary').textContent = '当前立案筛选：' + scope + ' ｜ ' + fmt(sum(rows)) + ' 条候选记录。来源：FJC R24 v3，FILEDATE截至2026-06-30。';
  for (const id of ['overviewTrend', 'monthlyChart']) updateChart(id, {xAxis: {data: months.map(x => x.key)}, series: [{name: '候选记录（FJC R24 v3）', type: 'line', data: months.map(x => x.count), itemStyle: {color: '#3d7da0'}, symbolSize: 5}]}, ['月度', '候选记录'], months.map(x => [x.key, x.count]));
  updateChart('quarterChart', {xAxis: {data: quarters.map(x => x.key)}, series: [{name: '候选记录（FJC R24 v3）', type: 'bar', data: quarters.map(x => x.count), itemStyle: {color: '#719db3'}, label: {show: true, position: 'top'}}]}, ['季度', '候选记录'], quarters.map(x => [x.key, x.count]));
  updateChart('halfTrendChart', {xAxis: {data: halves.map(x => x.key)}, series: [{name: '候选记录（FJC R24 v3）', type: 'bar', data: halves.map(x => x.count), itemStyle: {color: '#659b9a'}, label: {show: true, position: 'top'}}]}, ['半年度', '候选记录'], halves.map(x => [x.key, x.count]));
  updateChart('overviewHalf', {xAxis: {data: halves.map(x => x.key)}, series: [{name: '候选记录（FJC R24 v3）', type: 'bar', data: halves.map(x => x.count), itemStyle: {color: '#659b9a'}, label: {show: true, position: 'top'}}]}, ['半年度', '候选记录'], halves.map(x => [x.key, x.count]));
  const h25 = sum(allYears.filter(x => halfOf(x) === '2025 H1')), h252 = sum(allYears.filter(x => halfOf(x) === '2025 H2')), h26 = sum(allYears.filter(x => halfOf(x) === '2026 H1'));
  $('halfComparison').textContent = '同一地区/巡回区/NOS条件下：2026 H1同比 ' + pct(h26, h25) + '；较2025 H2 ' + pct(h26, h252) + '。';
  $('halfRows').innerHTML = halves.map(x => '<tr><td>' + esc(x.key) + '</td><td>' + fmt(x.count) + '</td><td>' + (x.count / 6).toFixed(1) + '</td><td>' + (x.key === '2026 H1' ? pct(x.count, h25) : '—') + '</td></tr>').join('');
  const q = key => sum(allYears.filter(x => quarterOf(x) === key));
  $('quarterComparison').textContent = '同一地区/巡回区/NOS条件下：2026 Q1较2025 Q4 ' + pct(q('2026 Q1'), q('2025 Q4')) + '；2026 Q2较Q1 ' + pct(q('2026 Q2'), q('2026 Q1')) + '。比较期间固定，不受年份或季度显示选择影响。';
  const districts = D.districts.filter(districtMatch).map(x => ({...x, count: sum(rows.filter(r => r.district === x.code))})).sort((a,b) => b.count - a.count);
  updateChart('districtChart', {yAxis: {data: districts.map(x => x.name), inverse: true}, series: [{name: '候选记录（FJC R24 v3）', type: 'bar', data: districts.map(x => x.count), itemStyle: {color: '#719db2'}, label: {show: true, position: 'right', fontSize: 9}}]}, ['地区', '候选记录'], districts.map(x => [x.name, x.count]));
  const nos = D.nos.filter(n => selected('nosFilter') === 'all' || n.code === selected('nosFilter')).map(n => ({...n, count: sum(rows.filter(x => x.nos === n.code))}));
  updateChart('nosChart', {series: [{type: 'pie', center: ['50%','38%'], radius: ['30%', '54%'], label: {show: false}, data: nos.map(x => ({name: x.code + ' · ' + x.label, value: x.count}))}]}, ['NOS', '候选记录'], nos.map(x => [x.code + ' · ' + x.label, x.count]));
  const changed = districts.map(d => ({name: d.name, value: sum(allYears.filter(x => x.district === d.code && halfOf(x) === '2026 H1')) - sum(allYears.filter(x => x.district === d.code && halfOf(x) === '2025 H1'))})).sort((a,b) => Math.abs(b.value)-Math.abs(a.value)).slice(0,6);
  updateChart('overviewDistrict', {yAxis: {data: changed.map(x => x.name)}, series: [{name: '2026 H1 − 2025 H1（候选记录）', type: 'bar', data: changed.map(x => x.value), itemStyle: {color: '#7da9bd'}, label: {show: true, position: 'right'}}]}, ['地区', 'H1同比增量'], changed.map(x => [x.name, x.value]));
  const other = allYears.filter(x => x.district !== '7-52');
  const categories = D.nos.filter(x => selected('nosFilter') === 'all' || x.code === selected('nosFilter'));
  const other25 = categories.map(n => sum(other.filter(x => x.nos === n.code && halfOf(x) === '2025 H1'))), other26 = categories.map(n => sum(other.filter(x => x.nos === n.code && halfOf(x) === '2026 H1')));
  updateChart('regionNosChart', {xAxis: {data: categories.map(x => x.code)}, series: [{name: '2025 H1', type: 'bar', data: other25, itemStyle:{color:'#b4c7d1'}},{name: '2026 H1', type: 'bar', data: other26, itemStyle:{color:'#6d9e9b'}}]}, ['NOS', '2025 H1', '2026 H1'], categories.map((n,i) => [n.code, other25[i], other26[i]]));
  renderDistrictList(rows); renderCircuits(rows);
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
  renderCaseConstellation(arr);
  $('caseList').innerHTML = arr.map(caseMarkup).join('') || '<div class="callout">没有匹配的案件。可清空搜索或重置档案筛选。</div>';
}
const caseMarkup = x => '<details class="case" data-case-key="'+esc(x.caseNo)+'"><summary><div><h3>' + esc(x.title) + '</h3><div class="meta2">' + esc(x.caseNo) + ' · ' + esc(x.court) + ' · ' + esc(x.date) + ' · ' + esc(x.outcomeLabel || '') + '</div></div><span class="tag">' + esc(x.authorityType) + '<br>' + esc(x.evidenceType) + '</span></summary><div class="casebody"><div class="callout">判例效力：' + esc(x.authorityType) + ' ｜ 来源：' + esc(x.evidenceType) + '<br>' + esc(x.sourceNote || '') + '</div>'
    + [['案件背景',x.summary],['核心争点',x.issue],['法院处理',x.decision],['研究意义与适用边界',x.significance]].map(([h,t]) => '<h4>'+h+'</h4><p>'+esc(t)+'</p>').join('')
    + '<h4>程序时间线</h4><div class="timeline">' + (x.timeline||[]).map(t => '<div><b>'+esc(t.date)+' · '+esc(t.label)+'</b><br>'+esc(t.detail)+'</div>').join('') + '</div><h4>来源</h4><ul>'
    + (x.sources||[]).map(s => '<li><a href="'+esc(s.url)+'" target="_blank" rel="noopener">'+esc(s.label)+'</a> <span class="meta2">('+esc(s.role||'')+')</span></li>').join('')+'</ul></div></details>';

const researchEvents = [
 ['2025-03-24','No.23-2948 · 132 F.4th 526','商标利润计算','相关多店铺先例'],
 ['2025-04-11','1:25-cv-02970','程序性不合规驳回','程序审查早于2026年'],
 ['2025-08-14','Nos.24-1471 / 24-1472','设计专利与现有技术','非先例'],
 ['2025-10-30','No.24-2841','版权利润请求','非先例'],
 ['2025-12-18','No. 24-313','中国被告邮件送达','第二巡回先例'],
 ['2026-03-31','No. 25-2074','逐被告个人管辖权','第七巡回先例'],
 ['2026-04-27','1:25-cv-13806','实际交易证据不足','地区法院适用'],
 ['2026-05-19','No.25-2340','Rule 20事实分析与Rule 21分离','非先例'],
 ['2026-05-26','4:26-cv-00169','Nike案PI获准','地区法院反向观察'],
 ['2026-05-29','No. 25-2205','送达与缺席判决挑战','第七巡回先例'],
 ['2026-06-18','1:25-cv-13392','TRO不替代PI审查','地区法院裁定'],
 ['2026-06-23','4:26-cv-00533','Nike案TRO被拒','地区法院对照'],
 ['2026-08-14','Nos.24-1538 / 24-1826','PI独立审查','非先例'],
 ['2026-08-14','2:26-cv-01134','被告合并异议被拒','个案反例 · 第三方案卷文本'],
 ['2026-08-31','6:25-cv-00339-RP','缺席阶段审查被告合并','档案记载的具体裁定日期'],
 ['2026-09-30','4:25-cv-01220','管辖、送达、冻结及平台命令','地区法院裁定'],
 ['2026-09-30','4:25-cv-01416-JCB · Dkt.18','管辖、资产限制与保证金','另一独立案件'],
 ['2026-11-04','No.25-12597','Adidas口头辩论','待决上诉 · 不是判决'],
 ['2026-11-17','No.25-2048','律师费裁量','非先例 · 非管辖权新规则']
];
const legalResearchThemes=[
 {title:'01 · 个人管辖权',finding:'第七巡回Liu要求被告自身与法院地的实际联系；地区法院已将其用于审查订单及交付证据。',action:'审查每店实际交易、取消或拦截记录及归属关系；不要将未发货测试单当然视为无管辖权，也不要概括为全国强制测试购。',keys:['No. 25-2074','1:25-cv-13806','1:26-cv-04668','No.25-2048']},
 {title:'02 · 境外送达与缺席救济',finding:'Smart Study与Kangol均涉及海牙公约适用时中国被告邮件送达；地址未知例外及勤勉查找仍需个案分析。',action:'核对真实地址、送达方式、查找记录和裁判巡回区；缺席后也要核对Rule 60(b)(4)路径。Adidas仍待决。',keys:['No. 24-313','No. 25-2205','1:25-cv-06945-TWT','No.25-12597']},
 {title:'03 · 被告合并与拆案',finding:'Wood要求具体分析及考虑分离，GoodEgg在缺席阶段排除不当合并被告；PLOUT则在特定诉状事实下驳回异议。',action:'检查共同交易、协同证据及专利法§299；案件数量不能直接代表被告数量或证明拆案规模。',keys:['No.25-2340','6:25-cv-00339-RP','2:26-cv-01134']},
 {title:'04 · TRO、PI与实体证据',finding:'Duoleduo及Jacki Easlick显示TRO获准不替代PI独立审查；两宗Nike案则显示同地区存在不同处理结果。',action:'PI前及时提交侵权比对、现有技术、损害及反证；不要仅因已冻结而放弃PI异议，也不要推断某法院统一拒绝或批准。',keys:['1:25-cv-13392','Nos.24-1538 / 24-1826','4:26-cv-00169','4:26-cv-00533','2:25-cv-01850-CCW']},
 {title:'05 · 资产限制、平台与保证金',finding:'E.D. Texas两份不同案件裁定对冻结范围、逐被告证据及第三方取证提出具体要求，不能合并为同一裁判。',action:'核对涉案收入与冻结范围、担保依据及Rule 45程序；区分实用专利与商标/版权的救济基础。',keys:['4:25-cv-01220','4:25-cv-01416-JCB · Dkt.18','6:25-cv-00335-LS']},
 {title:'06 · 缺席赔偿与利润计算',finding:'Dyson为相关商标利润先例；Dolls Kill及Huajie为非先例处置，涉及不同赔偿问题。',action:'核对权利类型、实际侵权销售额、成本扣除、法定赔偿适用条件及判决依据；不能用FJC判决子集比例估计应诉胜率。',keys:['No.23-2948 · 132 F.4th 526','No.24-2841','No.25-2659']}
];
function researchLink(key,title,subtitle){
 const x=C.cases.find(v=>v.caseNo===key);if(!x)throw Error('研究档案关联缺失: '+key);
 const b=document.createElement('button');b.type='button';b.className='event-link';b.dataset.researchCase=key;
 b.innerHTML='<b>'+esc(title||x.title)+'</b><small>'+esc(subtitle||x.date)+' · '+esc(x.authorityType)+'</small><small>'+esc(x.caseNo)+' · '+esc(x.evidenceType)+'</small>';
 return b;
}
function renderResearchIntegration(){
 const groups=$('judicialTimeline'),later=$('postCutoffEvents'),themes=$('legalThemes');
 groups.replaceChildren();later.replaceChildren();themes.replaceChildren();
 const events=researchEvents.slice().sort((a,b)=>a[0].localeCompare(b[0]));
 function period(parent,title,count,items){
  const row=document.createElement('div');row.className='event-period';
  const info=document.createElement('div');info.innerHTML='<h4>'+esc(title)+'</h4>'+(count==null?'<p class="sub">无同期FJC数量</p>':'<div class="event-count">'+fmt(count)+'</div><div class="sub">全池候选记录</div>');
  const content=document.createElement('div');content.className='event-items';
  items.forEach(e=>content.appendChild(researchLink(e[1],e[2],e[0]+' · '+e[3])));
  if(!items.length)content.textContent='本次精选事件未覆盖该季度；不代表没有司法活动。';
  row.append(info,content);parent.appendChild(row);
 }
 D.quarters.forEach(q=>period(groups,q.label,q.count,events.filter(e=>quarterOf({month:e[0].slice(0,7)})===q.label)));
 for(const q of ['2026 Q3','2026 Q4'])period(later,q,null,events.filter(e=>quarterOf({month:e[0].slice(0,7)})===q));
 legalResearchThemes.forEach(theme=>{const card=document.createElement('article');card.className='theme-card';card.innerHTML='<h4>'+esc(theme.title)+'</h4><p><b>研究判断：</b>'+esc(theme.finding)+'</p><p><b>业务核查：</b>'+esc(theme.action)+'</p>';const details=document.createElement('details');details.innerHTML='<summary>关联案件（'+theme.keys.length+'）</summary>';theme.keys.forEach(key=>details.appendChild(researchLink(key)));card.appendChild(details);themes.appendChild(card);});
}

function renderCaseConstellation(arr) {
  const el=$('caseConstellation'); if(!el) return;
  if(!window.echarts){el.innerHTML='<div class="callout">图表资源暂不可用；档案列表仍可正常使用。</div>';return;}
  if(!charts.caseConstellation) mk('caseConstellation',{tooltip:{trigger:'item',formatter:p=>esc(p.data.title)+'<br>'+esc(p.data.caseNo)+'<br>'+esc(p.data.circuit)+' · '+esc(p.data.date)+'<br>'+esc(p.data.authorityType)},grid:{left:130,right:28,top:24,bottom:48},xAxis:{type:'time',name:'案件日期',axisLabel:{color:'#6b8090'},splitLine:{lineStyle:{color:'#edf2f5'}}},yAxis:{type:'category',name:'巡回区',data:[...new Set(C.cases.map(x=>x.circuit||'其他'))].sort(),axisLabel:{fontSize:10,color:'#62798b'},splitLine:{show:true,lineStyle:{color:'#edf2f5'}}},series:[{type:'scatter',symbolSize:13,data:[],emphasis:{focus:'self',scale:1.5}}]});
  const symbols={'已刊发上诉先例':'diamond','非先例上诉处置':'triangle','地区法院个案裁定/命令':'circle','法官专项命令':'rect','待决上诉':'roundRect','相关上诉判例':'pin'};
  const colors=['#327ca4','#58a69c','#947db9','#c18a50','#c87883','#8298aa'];
  const types=[...new Set(C.cases.map(x=>x.authorityType))]; $('constellationEmpty').textContent=arr.length?'':'当前筛选无匹配档案。';
  const series=types.map((type,i)=>({name:type,type:'scatter',symbol:symbols[type]||'circle',symbolSize:14,itemStyle:{color:colors[i%colors.length],borderColor:'#fff',borderWidth:1.5},data:arr.filter(x=>x.authorityType===type).map(x=>({value:[Date.parse((x.date.match(/\d{4}-\d{2}-\d{2}/g)||[]).slice(-1)[0]+'T12:00:00Z'),x.circuit||'其他'],title:x.title,caseNo:x.caseNo,circuit:x.circuit||'其他',date:x.date,authorityType:x.authorityType,caseKey:x.caseNo}))}));
  charts.caseConstellation.setOption({legend:{type:'scroll',bottom:0,textStyle:{fontSize:10}},series},{replaceMerge:['series']});
  if(!charts.caseConstellation.__bound){charts.caseConstellation.on('click',p=>openCase(p.data?.caseKey));charts.caseConstellation.__bound=true;}
}
function openCase(key){const details=[...$('caseList').querySelectorAll('details.case')].find(el=>el.dataset.caseKey===key);if(!details)return;setCaseMode('list');details.open=true;details.scrollIntoView?.({behavior:'smooth',block:'center'});}
function chooseDistrict(code){$('districtFilter').value=code;$('districtFilter').dispatchEvent(new Event('change'));setGeoMode('map');}
function renderDistrictList(rows){
 const agg=D.districts.filter(districtMatch).map(d=>({d,count:sum(rows.filter(x=>x.district===d.code))})).sort((a,b)=>b.count-a.count);
 $('districtList').innerHTML=table(['排名','地区法院','巡回区','候选记录','近似城市'],agg.map((x,i)=>[i+1,x.d.name,x.d.circuit,fmt(x.count),x.d.locator]));
 $('districtList').querySelectorAll('tbody tr').forEach((tr,i)=>{const cell=tr.cells[1];const b=document.createElement('button');b.type='button';b.className='district-select';b.textContent=agg[i].d.name;b.addEventListener('click',()=>chooseDistrict(agg[i].d.code));cell.replaceChildren(b);});
}
function renderCircuits(rows){const root=$('circuitSummary');root.replaceChildren();const groups=[...new Set(D.districts.filter(d=>!$('excludeIllinois').checked||d.code!=='7-52').map(d=>d.circuit))].map(circuit=>({circuit,count:sum(rows.filter(r=>D.districts.find(d=>d.code===r.district).circuit===circuit))})).sort((a,b)=>b.count-a.count);groups.forEach(g=>{const b=document.createElement('button');b.type='button';b.textContent=g.circuit+' · '+fmt(g.count);b.setAttribute('aria-pressed',String(selected('circuitFilter')===g.circuit));b.onclick=()=>{const next=selected('circuitFilter')===g.circuit?'all':g.circuit;$('districtFilter').value='all';$('circuitFilter').value=next;$('circuitFilter').dispatchEvent(new Event('change'));};root.appendChild(b);});}
function syncQuarters(){const prev=selected('quarterFilter'),year=selected('yearFilter'),el=$('quarterFilter');el.replaceChildren(new Option('全部可用季度','all'));D.quarters.filter(q=>year==='all'||q.label.startsWith(year)).forEach(q=>el.add(new Option(q.label,q.label)));if([...el.options].some(x=>x.value===prev))el.value=prev;}
function setGeoMode(mode){$('geoMapPanel').hidden=mode!=='map';$('geoListPanel').hidden=mode!=='list';document.querySelectorAll('[data-geo-mode]').forEach(b=>{const active=b.dataset.geoMode===mode;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});if(mode==='map')requestAnimationFrame(()=>{map?.invalidateSize();fitMapView();Object.values(charts).forEach(c=>c.resize());});}
function setCaseMode(mode){$('caseList').hidden=mode!=='list';$('caseConstellationPanel').hidden=mode!=='constellation';document.querySelectorAll('[data-case-mode]').forEach(b=>{const active=b.dataset.caseMode===mode;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});if(mode==='constellation')requestAnimationFrame(()=>charts.caseConstellation?.resize());}
function setTrendView(mode){const panels={month:'monthlyTrendPanel',quarter:'quarterTrendPanel',half:'halfTrendPanel'};for(const [key,id] of Object.entries(panels))$(id).hidden=key!==mode;document.querySelectorAll('[data-trend-view]').forEach(b=>{const active=b.dataset.trendView===mode;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});const chartId={month:'monthlyChart',quarter:'quarterChart',half:'halfTrendChart'}[mode];requestAnimationFrame(()=>charts[chartId]?.resize());}
function addOptions(id, values) {
  [...new Set(values)].sort().forEach(v => { const o=document.createElement('option'); o.value=v; o.textContent=v; $(id).appendChild(o); });
}
function fixedFallbacks() {
  if (window.echarts) return;
  const content = {
    statusChart: [['状态','候选记录'], [['已终止',3506],['待审',1045]]],
    halfTrendChart: [['半年度','候选记录'], D.halfYears.map(x => [x.period,x.count])],
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
  addOptions('circuitFilter', D.districts.map(x=>x.circuit)); syncQuarters();
  for (const d of D.districts.slice().sort((a,b)=>a.name.localeCompare(b.name))) {const o=document.createElement('option'); o.value=d.code;o.textContent=d.name;$('districtFilter').appendChild(o);}
  for (const [id,field] of Object.entries({caseCourt:'court',caseAuthority:'authorityType',caseEvidence:'evidenceType',caseCircuit:'circuit'})) addOptions(id,C.cases.map(x=>x[field]));
  for (const id of ['yearFilter','quarterFilter','circuitFilter','districtFilter','nosFilter','excludeIllinois']) $(id).addEventListener('change',()=>{
    if(id==='yearFilter')syncQuarters();
    if(id==='excludeIllinois' && $('excludeIllinois').checked && selected('districtFilter')==='7-52')$('districtFilter').value='all';
    if(id==='districtFilter' && selected(id)==='7-52')$('excludeIllinois').checked=false;
    if(id==='circuitFilter') { if(selected('districtFilter')!=='all' && D.districts.find(x=>x.code===selected('districtFilter')).circuit!==selected('circuitFilter') && selected('circuitFilter')!=='all') $('districtFilter').value='all'; }
    if(id==='districtFilter' && selected(id)!=='all') $('circuitFilter').value=D.districts.find(x=>x.code===selected(id)).circuit;
    updateFilings();
  });
  $('resetFilters').onclick=()=>{ for(const id of ['yearFilter','quarterFilter','circuitFilter','districtFilter','nosFilter']) $(id).value='all';$('excludeIllinois').checked=false;syncQuarters();updateFilings(); };
  document.querySelectorAll('[data-trend-view]').forEach(b=>b.addEventListener('click',()=>setTrendView(b.dataset.trendView)));
  setTrendView('month');
  document.querySelectorAll('[data-geo-mode]').forEach(b=>b.addEventListener('click',()=>setGeoMode(b.dataset.geoMode)));
  document.querySelectorAll('[data-case-mode]').forEach(b=>b.addEventListener('click',()=>setCaseMode(b.dataset.caseMode)));
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
  renderResearchIntegration();
  document.querySelector('main').addEventListener('click',event=>{const button=event.target.closest('[data-research-case]');if(!button)return;const dossier=C.cases.find(x=>x.caseNo===button.dataset.researchCase);if(!dossier)return;activateModule('judiciary');$('linkedCaseContent').innerHTML=caseMarkup(dossier).replace('class="case"','class="linked-case"');$('linkedCaseContent').querySelector('details').open=true;$('linkedCasePanel').hidden=false;$('linkedCasePanel').scrollIntoView?.({behavior:'smooth',block:'start'});});
  $('closeLinkedCase').onclick=()=>{$('linkedCasePanel').hidden=true;$('linkedCaseContent').replaceChildren();};
  for (const id of ['outcomes','quality','plaintiffs','cases','method']) {const note=document.createElement('div');note.className='callout fixed-scope';note.textContent=id==='cases'?'精选案件档案使用下方独立筛选，不受FJC立案筛选影响。':'本模块保留自身统计总体；不随立案筛选变化。';$(id).prepend(note);}
  document.querySelectorAll('.tab').forEach(b=>b.setAttribute('aria-pressed',String(b.classList.contains('active'))));
  window.addEventListener('resize',()=>{const width=document.getElementById('map').clientWidth;if(map&&width&&width!==lastMapWidth){map.invalidateSize();fitMapView();}});
  fixedFallbacks(); cases(); updateFilings();
}
async function readJSON(path) { const response=await fetch(path);if(!response.ok) throw new Error(path+' HTTP '+response.status);return response.json(); }
Promise.all(['v09_research','case_dossiers','filing_cells'].map(x=>readJSON('./data/'+x+'.json'))).then(([d,c,f])=>{
  D=d;C=c;F=f;
  if(sum(F.cells)!==4551) throw new Error('立案交叉表总量不一致');
  updateFixedKpis();
  const status=document.createElement('div');status.id='mapStatus';status.className='mapnote';status.setAttribute('role','status');$('map').after(status);
  const fallback=document.createElement('details');fallback.className='callout';fallback.innerHTML='<summary>查看当前筛选数据与来源</summary><p>FJC R24 v3：月度 × 地区 × NOS汇总；统计单位为候选案卷记录，零值表示该候选池内没有符合条件的记录。</p><div id="filingData"></div>';$('geography').appendChild(fallback);
  initCharts();initMap();initUI();
}).catch(error=>{const message=document.createElement('div');message.className='callout warn';message.textContent='数据加载失败：'+error.message;document.querySelector('main').replaceChildren(message);});
