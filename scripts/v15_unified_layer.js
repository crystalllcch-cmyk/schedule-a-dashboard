// All active volume and geography charts use the same Maijia case register.
PR.forEach(r=>{if(!r.court){const m=r.source_url.match(/tro-case-lists\/([a-z]+)-/);if(m)r.court=m[1]}if(r.court==='tnmd')r.state='TN'});
const V15_TOTAL=2969,V15_PREV=2273;
const v15Period='1月1日至11月25日';
let v15Ready=false;
function v15Rights(r){return UNIFIED.rights[r.court+'|'+r.case]||'其他案件'}
function v15SourceCharts(){
 if(!v15Ready)return;
 charts.geo.setOption({xAxis:{data:['2025年同期','2026年同期']},legend:{data:['伊利诺伊北区','其他地区']},series:[{name:'伊利诺伊北区',data:[2044,2344]},{name:'其他地区',data:[229,625]}]});
 const yr=UNIFIED.classifications_2026;
 charts.nos.setOption({animation:false,grid:{left:60,right:30,top:40,bottom:45,containLabel:true},legend:{show:false},tooltip:{trigger:'axis',backgroundColor:'#294B65',textStyle:{color:'#F5FAFF'}},xAxis:{type:'category',data:['版权相关','专利相关','其他案件'],axisLabel:{color:'#D4E1EC',fontSize:11}},yAxis:{type:'value',axisLabel:{color:'#D4E1EC'},splitLine:{lineStyle:{color:'#405D76'}}},series:[{name:'2026年截至11月25日',type:'bar',data:[yr['版权相关'],yr['专利相关'],V15_TOTAL-yr['版权相关']-yr['专利相关']],barMaxWidth:60,label:{show:true,position:'top',color:'#F5FAFF',fontSize:12,fontWeight:600},itemStyle:{color:'#73E7DF'}}]},true);
 charts.growth.setOption({series:[{data:[{name:'伊利诺伊北区增量',value:300},{name:'其他地区增量',value:396}]}]});
}
const v15PriorLocalize=localizeCharts;localizeCharts=function(){v15PriorLocalize();v15SourceCharts()};
const v15PriorRefresh=refresh;refresh=function(){v15PriorRefresh();if(v15Ready){$('total').textContent=fmt(V15_TOTAL);v15SourceCharts()}};
const v15PriorGeo=renderGeo;renderGeo=function(){v15PriorGeo();if(!v15Ready)return;
 const chosen=GEO.districts.find(d=>d.code===filters.district);
 const label=chosen?(UNIFIED.court_names[chosen.code]||chosen.name):'全部收录地区';
 const period=$('mapPeriod');if(period)period.value=filters.year;
 const badge=$('view-geography').querySelector('.section-title .tag');if(badge)badge.textContent=(filters.year==='all'?'两年同期':filters.year+'年同期')+' · '+fmt(chosen?geoValue(chosen):GEO.districts.reduce((n,d)=>n+geoValue(d),0))+'件';
 $('mapSelectedName').textContent=label;
 $('mapSelectedMeta').textContent=(filters.year==='all'?'2025—2026年同期合计':filters.year+'年'+v15Period)+' · 点击法院查看季度分布';
 $('mapSelectedCount').textContent=fmt(chosen?geoValue(chosen):GEO.districts.reduce((n,d)=>n+geoValue(d),0));
 $('geoQuarterTitle').textContent=label+' · 季度案件变化';
 const qs=D.quarters.filter(q=>filters.year==='all'||String(q.year)===filters.year);
 const vals=qs.map(q=>({label:chineseText(q.label),value:chosen?(chosen.quarters[q.year+'Q'+q.quarter]||0):GEO.districts.reduce((n,d)=>n+(d.quarters[q.year+'Q'+q.quarter]||0),0)}));
 updateGeoQuarterLine(vals);specifiedChartSpace();
 const text=$('geoQuarterTitle').parentElement.querySelector('.sub');
 if(chosen){const a=Object.entries(chosen.quarters).filter(([q])=>q.startsWith('2025')).reduce((n,[,v])=>n+v,0),b=Object.entries(chosen.quarters).filter(([q])=>q.startsWith('2026')).reduce((n,[,v])=>n+v,0);putSpecified(text,{lead:label+'：两年同期对比',points:['2025年同期'+fmt(a)+'件，2026年同期'+fmt(b)+'件，净变化'+(b-a>=0?'+':'')+fmt(b-a)+'件。第四季度均统计至11月25日。']})}else putSpecified(text,SPECIFIED_COPY.geoLine);
};
const v15PriorInit=init;init=function(){v15PriorInit();v15Ready=true;
 const labels=['2026年收录案件','案件数量同比','已识别版权相关案件','伊利诺伊北区占比'];
 const values=['2,969','+30.6%','628','79.0%'];
 const details=['1月1日至11月25日','较2025年同期增加696件','占2026年同期收录的21.2%','2026年同期｜同比降11.0个百分点'];
 document.querySelectorAll('.kpi').forEach((e,i)=>{e.querySelector('label').textContent=labels[i];e.querySelector('strong').textContent=values[i];e.querySelector('small').textContent=details[i]});
 document.querySelector('.hero-meta').innerHTML='核心观察<strong>2025—2026</strong>历史趋势 · 2022—2026<br>案件统计统一截至11月25日';
 document.querySelector('.hero p').textContent='分析诉讼数量、法院分布与原告行为的变化，结合裁判规则判断卖家风险及被告应对空间。';
 const titles=$('view-overview').querySelectorAll('.section-title');
 titles[0].querySelector('p').textContent='年度规模与季度节奏结合观察。';titles[0].querySelector('.tag')&&(titles[0].querySelector('.tag').textContent='2025—2026年同期比较');
 const geoTitle=$('geo').closest('.grid').previousElementSibling;geoTitle.querySelector('h2').textContent='02 / 地域结构：伊利诺伊州为中心，其他州增长更快';geoTitle.querySelector('p').textContent='2025—2026年1月1日至11月25日同期比较。';geoTitle.querySelector('.tag')&&(geoTitle.querySelector('.tag').textContent='统一期间');
 $('geo').closest('.card').querySelector('h3').textContent='法院地区案件数量对比';$('geo').closest('.card').querySelector('.sub').textContent='两年均统计至11月25日';
 const catTitle=$('nos').closest('.grid').previousElementSibling;catTitle.querySelector('h2').textContent='2026年案件结构：权利线索与地域增量';catTitle.querySelector('p').textContent='观察版权、专利相关案件及各地区对增长的贡献。';
 $('nos').closest('.card').querySelector('h3').textContent='2026年权利线索分布';$('nos').closest('.card').querySelector('.sub').textContent='截至11月25日';
 putSpecified($('growthInsight'),{lead:'外围地区贡献56.9%的净增量',points:['伊利诺伊北区同比增加300件，其他地区增加396件。核心地区继续增长，外围地区增长更快，共同推动案件数量上升。']});
 $('view-geography').querySelector('.section-title p').textContent='查看2025—2026年同期案件的法院分布及季度变化。';$('view-geography').querySelector('.section-title .tag').textContent='2026年同期 · 2,969件';
 const mapCard=$('usMap').closest('.card');mapCard.querySelector('h3').textContent='美国联邦地区法院案件分布';mapCard.querySelector('.tag').textContent=GEO.districts.length+'个法院定位点';
 document.querySelectorAll('.map-toolbar span').forEach((e,i)=>e.textContent=i?'两年同期均截至11月25日':'美国联邦法院分布');
 const control=document.createElement('label');control.className='sub';control.style.cssText='display:flex;align-items:center;gap:10px;margin-bottom:10px';control.innerHTML='地图观察期间 <select class="select" id="mapPeriod"><option value="2026">2026年截至11月25日</option><option value="2025">2025年截至11月25日</option><option value="all">两年同期合计</option></select>';
 $('view-geography').querySelector('.geo-layout').before(control);
 $('mapPeriod').onchange=()=>{filters={year:$('mapPeriod').value,quarter:'all',district:'all'};refresh()};
 $('mapClear').textContent='恢复2026年同期';$('mapClear').onclick=()=>{filters={year:'2026',quarter:'all',district:'all'};$('mapPeriod').value='2026';refresh()};
 // Remove the retired FJC screening-method chart from the current report.
 if(charts.groups){charts.groups.dispose();delete charts.groups;}
 const footer=document.querySelector('.footer');footer.innerHTML='<details><summary>数据来源与统计口径 · 点击展开</summary><div class="footgrid"><div><b>案件总量与地域统计</b><br>麦家星球2022—2026年度列表，复用209页、8,248条收录明细。2025、2026同期均为1月1日至11月25日，分别为2,273件和2,969件；以法院＋案号去重。2026年第四季度及2025年同期第四季度均统计至11月25日。<br><a href="https://www.maijiaxingqiu.com/tro-case-lists/2026/" target="_blank">麦家星球年度列表 ↗</a></div><div><b>权利类型线索</b><br>以案件名称中的明确版权、专利标识为基础，使用WorldTRO同案描述及具体820/830案由补充。2026年已识别版权相关628件、专利相关94件，其余2,247件包含商标及未明确分类案件；历史默认840与版权名称存在冲突，未直接推定为商标。版权指标展示当期数量与占比，不计算分类覆盖程度不同的同比。<br><a href="https://worldtro.com/troyear/" target="_blank">WorldTRO年度列表 ↗</a></div><div><b>交叉核对与法院定位</b><br>WorldTRO读取2,100行公开列表及其公开分类接口，核对同案信息；列表差异保存在底稿，未将覆盖期间不同的两站数量直接相加。法院由原始案件链接识别，共22个法院地区；2条纽约杂项程序记录保留于收录总量。地图使用法院所在城市示意点，州级统计与法院地区分别汇总。</div><div><b>品牌专项观察</b><br>The Fashion Law五品牌资料保留2021—2026年8月的独立观察期，月均按实际月份计算。品牌行为分析结合既有具名诉讼及批量案件材料。<br><a href="https://www.thefashionlaw.com/inside-the-state-of-schedule-a-litigation-in-fashion/" target="_blank">五品牌研究 ↗</a></div><div><b>法院裁判与历史资料</b><br>7个法院专题及31份案件档案保留原裁判与案卷链接。联邦法院候选数据保留于历史底稿；本版总量、同比、地区比较、地图与季度图统一使用上述公开收录明细。</div></div></details><div style="margin-top:12px">美国批量侵权诉讼趋势报告 · V1.5 统一统计版 · 截至2026年11月25日</div>';
 Object.entries(UNIFIED.court_names).forEach(([code,name])=>{const d=GEO.districts.find(d=>d.code===code);if(d)COURT_CN[d.name]=name});
 const states={TN:'田纳西州',GA:'佐治亚州',NE:'内布拉斯加州',OR:'俄勒冈州',WI:'威斯康星州',CO:'科罗拉多州',CA:'加利福尼亚州',NJ:'新泽西州',WA:'华盛顿州',MA:'马萨诸塞州',MO:'密苏里州',KS:'堪萨斯州',VA:'弗吉尼亚州'};Object.assign(stateLabel,states);$('publicState').querySelectorAll('option').forEach(o=>{if(o.value!=='all')o.textContent=stateLabel[o.value]||o.value});
 filters={year:'2026',quarter:'all',district:'all'};refresh();v15SourceCharts();
 charts.nos.off('click');charts.nos.on('click',p=>{const type=p.dataIndex===0?'版权相关':p.dataIndex===1?'专利相关':null;const a=PR.filter(r=>r.date.startsWith('2026')&&r.date.slice(5)<='11-25'&&(type?v15Rights(r)===type:!['版权相关','专利相关'].includes(v15Rights(r))));pubCases('2026年同期 · '+(type||'其他案件'),a)});
 charts.geo.off('click');charts.geo.on('click',p=>pubCases(p.name+' · '+p.seriesName,PR.filter(r=>r.date.startsWith(p.dataIndex===0?'2025':'2026')&&r.date.slice(5)<='11-25'&&(p.seriesIndex===0?r.court==='ilnd':r.court!=='ilnd'))));
 localizeMain();
};
