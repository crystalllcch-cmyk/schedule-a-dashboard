// P2 chart storytelling layer. Loaded before app.js; data/functions resolve at interaction time.
let lastAnalysisFocus = null;
function analysisPct(a,b){if(!b)return '无可比基数';const v=(a/b-1)*100;return (v>0?'+':'')+v.toFixed(1)+'%';}
function analysisPreviousMonth(key){const [y,m]=key.split('-').map(Number);const d=new Date(Date.UTC(y,m-2,1));return d.getUTCFullYear()+'-'+String(d.getUTCMonth()+1).padStart(2,'0');}
function analysisSection(title,text){return '<section class="analysis-section"><h3>'+esc(title)+'</h3><p>'+esc(text)+'</p></section>';}
function openAnalysisPanel(title,summary,sections,sources=[],eyebrow='图表深度分析'){
  lastAnalysisFocus=document.activeElement;
  $('analysisEyebrow').textContent=eyebrow;$('analysisTitle').textContent=title;$('analysisSummary').textContent=summary;
  $('analysisBody').innerHTML=sections.map(x=>analysisSection(x[0],x[1])).join('');
  $('analysisSources').innerHTML=sources.length?'<h3>研究来源与口径</h3>'+sources.map(x=>'<a href="'+esc(x.url)+'" target="_blank" rel="noopener">'+esc(x.label)+'</a>').join(''):'';
  $('analysisOverlay').hidden=false;document.body.style.overflow='hidden';$('analysisClose').focus();
}
function closeAnalysisPanel(){
  if($('analysisOverlay').hidden)return;
  $('analysisOverlay').hidden=true;document.body.style.overflow='';
  if(lastAnalysisFocus&&lastAnalysisFocus.isConnected)lastAnalysisFocus.focus();
  lastAnalysisFocus=null;
}
function analysisEvents(period,kind){
  return researchEvents.filter(e=>{const m=e[0].slice(0,7);return kind==='month'?m===period:kind==='quarter'?quarterOf({month:m})===period:halfOf({month:m})===period;});
}
function updateDynamicInsights(rows,allYears){
  const total=sum(rows),timeScope=selected('quarterFilter')!=='all'?selected('quarterFilter'):(selected('yearFilter')==='all'?'全部年份':selected('yearFilter')+'年');
  const qs=D.quarters.map(q=>({key:q.label,count:sum(rows.filter(x=>quarterOf(x)===q.label))})).filter(x=>x.count).sort((a,b)=>b.count-a.count);
  $('trendDynamicInsight').textContent=total?'当前筛选：'+timeScope+'，共'+fmt(total)+'条候选记录。'+(qs.length?'数量最高的季度为'+qs[0].key+'（'+fmt(qs[0].count)+'条）。':'')+'图表随地区、巡回区及NOS条件更新；首屏KPI保持全池基准。':'当前筛选没有匹配候选记录；可调整条件或重置筛选。';
  const ds=D.districts.map(d=>({d,count:sum(rows.filter(x=>x.district===d.code))})).filter(x=>x.count).sort((a,b)=>b.count-a.count);
  $('geoDynamicInsight').textContent=ds.length?'当前筛选下数量最高的地区为'+ds[0].d.name+'（'+fmt(ds[0].count)+'条，占'+(ds[0].count/total*100).toFixed(1)+'%）；前三个地区合计'+fmt(ds.slice(0,3).reduce((a,x)=>a+x.count,0))+'条。':'当前筛选没有可展示的地区记录。';
  const ns=D.nos.map(n=>({n,count:sum(rows.filter(x=>x.nos===n.code))})).filter(x=>x.count).sort((a,b)=>b.count-a.count);
  $('nosDynamicInsight').textContent=ns.length?'当前筛选下主要NOS为'+ns.slice(0,3).map(x=>x.n.label+' '+fmt(x.count)+'条').join('；')+'。NOS是行政诉讼性质分类，不等于法院最终实体认定。':'当前筛选没有可展示的NOS记录。';
}
function chartTooltip(id,params){
  const items=Array.isArray(params)?params:[params],p=items[0]||{},name=String(p.name||p.axisValue||''),value=Array.isArray(p.value)?p.value[p.value.length-1]:p.value;
  const base='<b>'+esc(name)+'</b><br>'+items.map(x=>esc(x.seriesName||'候选记录')+'：'+fmt(Array.isArray(x.value)?x.value[x.value.length-1]:x.value)).join('<br>');
  if(['overviewTrend','monthlyChart','quarterChart','halfTrendChart','overviewHalf'].includes(id)){
    const all=filingRows(true);let prevKey='',prev=0;
    if(id==='quarterChart'){const i=D.quarters.findIndex(x=>x.label===name);prevKey=i>0?D.quarters[i-1].label:'';if(prevKey)prev=sum(all.filter(x=>quarterOf(x)===prevKey));}
    else if(['halfTrendChart','overviewHalf'].includes(id)){const i=D.halfYears.findIndex(x=>x.period===name);prevKey=i>0?D.halfYears[i-1].period:'';if(prevKey)prev=sum(all.filter(x=>halfOf(x)===prevKey));}
    else {prevKey=analysisPreviousMonth(name);prev=sum(all.filter(x=>x.month===prevKey));}
    return base+(prevKey?'<br>较'+esc(prevKey)+'：'+analysisPct(Number(value)||0,prev):'')+'<br>点击查看同期司法事件与详细解释';
  }
  if(['districtChart','overviewDistrict'].includes(id)){const d=D.districts.find(x=>x.name===name);if(d){const count=sum(filingRows().filter(x=>x.district===d.code)),all=sum(filingRows());return base+'<br>当前筛选占比：'+(all?(count/all*100).toFixed(1)+'%':'—')+'<br>点击查看该地区H1变化与NOS构成';}}
  if(id==='nosChart'){const code=name.split(' · ')[0],count=sum(filingRows().filter(x=>x.nos===code)),all=sum(filingRows());return base+'<br>当前筛选占比：'+(all?(count/all*100).toFixed(1)+'%':'—')+'<br>NOS是诉讼性质行政分类';}
  if(id==='brandChart'){const b=D.brands.rows.find(x=>x.brand===name);if(b)return base+'<br>月均速度：'+(b.paceRatio==null?'基数为0':b.paceRatio.toFixed(2)+'倍')+'<br>点击查看品牌样本范围';}
  if(id==='abtlChart'&&name.includes('*'))return base+'<br>2025年数据截至11月11日，并非全年';
  return base+'<br>点击查看该图表的口径、解释及业务影响';
}
function openAnalysisForChart(id,p){
  const name=String(p?.name||p?.axisValue||p?.data?.name||''),rows=filingRows(),all=filingRows(true),total=sum(rows),of=(n,d)=>d?(n/d*100).toFixed(1)+'%':'—';
  let title='图表分析',summary='',sections=[],sources=[{label:'FJC Civil Codebook（字段定义）',url:'https://www.fjc.gov/sites/default/files/idb/codebooks/Civil%20Codebook%201988%20Forward%2010252023.pdf'}];
  if(['overviewTrend','monthlyChart','quarterChart','halfTrendChart','overviewHalf'].includes(id)){
    const kind=id==='quarterChart'?'quarter':(['halfTrendChart','overviewHalf'].includes(id)?'half':'month'),period=name;
    let count=0,prevKey='',prev=0,priorKey='',prior=0;
    if(kind==='month'){count=sum(all.filter(x=>x.month===period));prevKey=analysisPreviousMonth(period);prev=sum(all.filter(x=>x.month===prevKey));priorKey=String(Number(period.slice(0,4))-1)+period.slice(4);prior=sum(all.filter(x=>x.month===priorKey));}
    else if(kind==='quarter'){count=sum(all.filter(x=>quarterOf(x)===period));const i=D.quarters.findIndex(x=>x.label===period);prevKey=i>0?D.quarters[i-1].label:'';prev=prevKey?sum(all.filter(x=>quarterOf(x)===prevKey)):0;priorKey=period.replace(/^\d{4}/,String(Number(period.slice(0,4))-1));prior=sum(all.filter(x=>quarterOf(x)===priorKey));}
    else{count=sum(all.filter(x=>halfOf(x)===period));const i=D.halfYears.findIndex(x=>x.period===period);prevKey=i>0?D.halfYears[i-1].period:'';prev=prevKey?sum(all.filter(x=>halfOf(x)===prevKey)):0;priorKey=period.replace(/^\d{4}/,String(Number(period.slice(0,4))-1));prior=sum(all.filter(x=>halfOf(x)===priorKey));}
    title=period+' · 候选记录变化';summary=period+'在当前地区、巡回区及NOS条件下共有'+fmt(count)+'条候选记录；当前时间筛选合计'+fmt(total)+'条。';
    sections=[['核心发现',prevKey?'较'+prevKey+'变化'+analysisPct(count,prev)+'；'+(priorKey?'同比基准'+priorKey+'为'+fmt(prior)+'条。':''):'这是当前数据窗口内的首个比较期。'],['数据拆解',period+'：'+fmt(count)+'条；'+(prevKey?prevKey+'：'+fmt(prev)+'条。':'前一比较期无可用数据。')+(priorKey?' '+priorKey+'：'+fmt(prior)+'条。':'')],['研究解释','按FILEDATE（实际立案日期）汇总FJC候选记录。比较使用相同地区、巡回区和NOS条件；案卷数量不等于被告、店铺或独立维权活动数量。']];
    const ev=analysisEvents(period,kind);sections.push(['同期司法事件',ev.length?ev.map(e=>e[0]+' · '+e[1]+' · '+e[2]+'（'+e[3]+'）').join('；'):'本期未收录精选司法事件；不代表同期没有司法活动。']);
    sections.push(['业务观察','若某一地区或权利类型筛选后趋势明显不同，应继续核对该地区裁判、原告样本和案卷识别情况；不能仅凭数量变化推断法院政策导致案件增长。']);
  }else if(id==='districtChart'||id==='overviewDistrict'){
    const d=D.districts.find(x=>x.name===name);if(!d)return;
    const count=sum(rows.filter(x=>x.district===d.code)),h25=sum(all.filter(x=>x.district===d.code&&halfOf(x)==='2025 H1')),h26=sum(all.filter(x=>x.district===d.code&&halfOf(x)==='2026 H1'));
    const top=D.nos.map(n=>({n,count:sum(rows.filter(x=>x.district===d.code&&x.nos===n.code))})).filter(x=>x.count).sort((a,b)=>b.count-a.count).slice(0,3);
    title=d.name+' · 地区分析';summary='当前筛选下该地区有'+fmt(count)+'条候选记录，占当前筛选总量'+of(count,total)+'。';
    sections=[['核心发现',d.name+'属于'+d.circuit+'；当前筛选下占比'+of(count,total)+'。'],['半年度对比','2025 H1：'+fmt(h25)+'条；2026 H1：'+fmt(h26)+'条；变化'+(h26-h25>=0?'+':'')+fmt(h26-h25)+'条（'+analysisPct(h26,h25)+'）。'],['NOS构成',top.length?top.map(x=>x.n.code+' '+x.n.label+'：'+fmt(x.count)+'条').join('；'):'当前筛选下没有该地区记录。'],['业务影响','核查该巡回区和地区法院的个人管辖权、被告合并、境外送达及TRO/PI裁判。地区数量本身不能证明法院采取统一政策。']];
    const related=C.cases.filter(x=>x.circuit===d.circuit).slice(0,4);if(related.length)sections.push(['相关精选档案',related.map(x=>x.title+'（'+x.caseNo+'）').join('；')]);
  }else if(id==='nosChart'||id==='regionNosChart'){
    const code=name.split(' · ')[0],n=D.nos.find(x=>x.code===code);if(!n)return;
    const count=sum(rows.filter(x=>x.nos===code));
    if(id==='regionNosChart'){
      const other=all.filter(x=>x.district!=='7-52'),h25=sum(other.filter(x=>x.nos===code&&halfOf(x)==='2025 H1')),h26=sum(other.filter(x=>x.nos===code&&halfOf(x)==='2026 H1'));
      const nat25=sum(F.cells.filter(x=>x.nos===code&&x.month>='2025-01'&&x.month<='2025-06')),nat26=sum(F.cells.filter(x=>x.nos===code&&x.month>='2026-01'&&x.month<='2026-06'));
      title='非N.D. Illinois · '+n.label+'（NOS '+code+'）';summary='其他地区该NOS由'+fmt(h25)+'条变为'+fmt(h26)+'条。';
      sections=[['核心发现','非N.D. Illinois地区H1变化'+analysisPct(h26,h25)+'，净增'+(h26-h25)+'条。'],['全国对照','全国同一NOS由'+fmt(nat25)+'条变为'+fmt(nat26)+'条，变化'+analysisPct(nat26,nat25)+'。两组分母不同。'],['解释边界','NOS是行政诉讼性质分类，不等于法院最终认定的实体侵权类型。']];
    }else{
      const h25=sum(all.filter(x=>x.nos===code&&halfOf(x)==='2025 H1')),h26=sum(all.filter(x=>x.nos===code&&halfOf(x)==='2026 H1'));
      title='NOS '+code+' · '+n.label;summary='当前筛选下该类候选记录'+fmt(count)+'条，占'+of(count,total)+'。';
      sections=[['核心发现',n.label+'候选记录'+fmt(count)+'条，占当前筛选总量'+of(count,total)+'。'],['半年度变化','2025 H1：'+fmt(h25)+'条；2026 H1：'+fmt(h26)+'条；变化'+analysisPct(h26,h25)+'。'],['解释边界','NOS行政分类不能证明原告权利有效、被告侵权或法院已作实体认定。']];
      if(code==='820')sections.push(['全国版权观察','版权NOS由379条增至567条，增长49.6%，贡献全池H1净增量的58.8%。']);
    }
  }else if(id==='statusChart'){
    const s=D.status.latestEpisode,den=D.precision.population,count=name.includes('终止')?s.terminated:s.pending;
    title='FJC最新episode状态 · '+name;summary=name+'：'+fmt(count)+'条，占候选池'+of(count,den)+'。';
    sections=[['数据拆解','已终止'+fmt(s.terminated)+'条；待审'+fmt(s.pending)+'条；重新开启29条（17条已终止、12条仍待审）。'],['解释边界','ORIGIN=4重新开启记录用于更新最新episode状态，不重复计入新立案。TERMINATED不等于原告胜诉或被告败诉。']];
  }else if(id==='dispChart'){
    const code=name.split(' · ')[0],item=D.disp.find(x=>x.code===code);if(!item)return;
    title='DISP '+code+' · '+item.label;summary='该结案方式'+fmt(item.count)+'条，占DISP终止记录'+of(item.count,sum(D.disp))+'。';
    sections=[['核心发现',item.label+'：'+fmt(item.count)+'条。'],['解释边界',code==='18'?'DISP=18为统计性关闭，需结合原始案卷解释。':code==='4'?'缺席判决仍需核对判决金额、救济和程序基础。':'DISP反映案件终结方式，不直接反映TRO/PI申请结果。']];
  }else if(id==='judgmentChart'){
    const j=D.judgment,count=name.includes('原告')?j.plaintiffFavored:j.defendantFavored;
    title='NOJ判决子集 · '+name;summary='在'+fmt(j.denominator)+'条特定判决类别候选记录中，'+name+'为'+fmt(count)+'条。';
    sections=[['数据拆解','有利原告'+fmt(j.plaintiffFavored)+'条；有利被告'+fmt(j.defendantFavored)+'条；合计'+fmt(j.denominator)+'条。'],['解释边界',j.scope+'；不是全部案件胜诉率。']];
  }else if(id==='precisionChart'){
    const q=D.precision;title='候选池内部识别精度 · '+name;summary='110条分层样本支持的保守加权precision为'+q.lowerEstimatePct.toFixed(2)+'%。';
    sections=[['抽样设计','样本110条：确定性纳入9条、分层随机101条；公开记录支持98条，暂无法分类12条。'],['估计范围','保守加权precision '+q.lowerEstimatePct.toFixed(2)+'%；近似95%区间'+q.approx95CI[0].toFixed(2)+'%—'+q.approx95CI[1].toFixed(2)+'%。'],['解释边界',q.scope+'；100%仅为敏感性上端，不是置信区间上限。']];
  }else if(id==='brandAnnualChart'){
    const item=D.brands.annual.find(x=>x.period===name);if(!item)return;
    title='TFL五品牌样本 · '+name;summary=name+'记录'+fmt(item.count)+'件。';
    sections=[['核心发现',name==='2026 Jan–Aug'?'2026年1—8月74件，2025全年35件；月均速度约3.17倍。':'该年度样本记录'+fmt(item.count)+'件。'],['解释边界',D.brands.limitation+'。']];
    sources.push({label:'The Fashion Law · 五品牌样本',url:'https://www.thefashionlaw.com/inside-the-state-of-schedule-a-litigation-in-fashion/'});
  }else if(id==='brandChart'){
    const item=D.brands.rows.find(x=>x.brand===name);if(!item)return;
    title=name+' · 品牌样本分析';summary='2025全年'+fmt(item.y2025)+'件；2026年1—8月'+fmt(item.y2026)+'件。';
    sections=[['样本变化','2025全年'+fmt(item.y2025)+'件；2026年1—8月'+fmt(item.y2026)+'件。'+(item.paceRatio==null?'2025基数为0，不计算倍数。':'月均速度约'+item.paceRatio.toFixed(2)+'倍。')],['品牌分化','五品牌增量主要来自Dior、Chrome Hearts和Stüssy；Louis Vuitton月均速度约0.90倍，Gucci约1.00倍。'],['解释边界','目的性时尚品牌样本，不代表全国Schedule A总量。']];
    sources.push({label:'The Fashion Law · 五品牌样本',url:'https://www.thefashionlaw.com/inside-the-state-of-schedule-a-litigation-in-fashion/'});
  }else if(id==='abtlChart'){
    const item=D.abtl.historical.find(x=>x.year===Number(name.replace('*','')));if(!item)return;
    title='ABTL / Lex Machina · '+item.year+'年历史参考';summary=item.year+'年记录'+fmt(item.count)+'件'+(item.partial?'，截至'+item.cutoff+'，并非全年':'')+'。';
    sections=[['数据解释',item.partial?'2025数据截至2025-11-11，不是完整年度，也不应擅自年化。':'该序列来自ABTL报告引用的Lex Machina历史数据。'],['未复算指标','报告所称63%增长及TRO批准率缺少公开分子、分母和案件清单，无法独立复算。'],['解释边界','作为历史参考，不替代FJC候选池统计。']];
    sources.push({label:'ABTL Orange County Report · Spring 2026',url:D.abtl.url});
  }else return;
  openAnalysisPanel(title,summary,sections,sources);
}
function bindAnalysisEvents(){
  const ids=['overviewTrend','overviewHalf','overviewDistrict','monthlyChart','quarterChart','halfTrendChart','districtChart','nosChart','regionNosChart','statusChart','dispChart','judgmentChart','precisionChart','brandAnnualChart','brandChart','abtlChart'];
  ids.forEach(id=>{const chart=charts[id];if(chart&&!chart.__analysisBound){chart.on('click',p=>openAnalysisForChart(id,p));chart.__analysisBound=true;}});
}
