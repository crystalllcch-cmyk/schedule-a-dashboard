import json,re,collections,pathlib,copy
ROOT=pathlib.Path(__file__).resolve().parents[1];OUT=ROOT/'research/v15'
s=(ROOT/'advanced/index.html').read_text();p=s.index('const originalData=')+len('const originalData=');old,_=json.JSONDecoder().raw_decode(s[p:]);rows=json.loads((OUT/'unified_rows.json').read_text());summary=json.loads((OUT/'summary.json').read_text())
# Postal-state and court-name normalization is based on the court identifier.
for r in rows:
 if r['court']=='tnmd':r['state']='TN'
for y in ('2025','2026'):summary['years'][y]['states']=dict(collections.Counter(r['state'] for r in rows if r['date'].startswith(y)))
(OUT/'summary.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2))
oldg=old['data/geography.json'];oldD=old['data/dashboard.json']
ct={'ilnd':'7-52','flsd':'11-3C','pawd':'3-15','nysd':'2-08','txwd':'5-42','innd':'7-55','txed':'5-40','flmd':'11-3A','vaed':'4-22','njd':'3-12','moed':'8-65','txsd':'5-41','mad':'1-01','cacd':'9-73','ksd':'10-83','wawd':'9-81'}
extras={'gand':('11-gand','N.D. Georgia','佐治亚北区','GA',33.749,-84.388,'Atlanta'),'ned':('8-ned','D. Nebraska','内布拉斯加联邦法院','NE',41.2565,-95.9345,'Omaha'),'tnmd':('6-tnmd','M.D. Tennessee','田纳西中区','TN',36.1627,-86.7816,'Nashville'),'ord':('9-ord','D. Oregon','俄勒冈联邦法院','OR',45.5152,-122.6784,'Portland'),'wied':('7-wied','E.D. Wisconsin','威斯康星东区','WI',43.0389,-87.9065,'Milwaukee'),'cod':('10-cod','D. Colorado','科罗拉多联邦法院','CO',39.7392,-104.9903,'Denver')}
cn={'ilnd':'伊利诺伊北区','flsd':'佛州南区','pawd':'宾州西区','nysd':'纽约南区','txwd':'得州西区','innd':'印第安纳北区','txed':'得州东区','flmd':'佛州中区','vaed':'弗吉尼亚东区','njd':'新泽西联邦法院','moed':'密苏里东区','txsd':'得州南区','mad':'马萨诸塞联邦法院','cacd':'加州中区','ksd':'堪萨斯联邦法院','wawd':'华盛顿西区'}
bycode={x['code']:x for x in oldg['districts']};geo=[];districts=[];dq=[]
for court in sorted(set(r['court']for r in rows)):
 if court in ct:
  g=copy.deepcopy(bycode[ct[court]]);code=ct[court]
 else:
  code,name,namecn,state,lat,lng,loc=extras[court];g={'code':code,'name':name,'state':state,'lat':lat,'lng':lng,'locator':loc,'locatorSource':'https://www.'+court+'.uscourts.gov/'};ct[court]=code;cn[court]=namecn
 g['court_id']=court;g['count']=sum(r['court']==court for r in rows);g['quarters']={}
 for y in(2025,2026):
  for q in(1,2,3,4):
   count=sum(r['court']==court and r['date'][:4]==str(y)and (int(r['date'][5:7])-1)//3+1==q for r in rows);g['quarters'][f'{y}Q{q}']=count
   circuit,dist=code.split('-',1);dq.append({'code':code,'name':g['name'],'circuit':circuit,'district':dist,'year':y,'quarter':q,'count':count})
 geo.append(g);districts.append({'code':code,'name':g['name'],'count':g['count']})
quarters=[{'label':f'{y} Q{q}'+('*'if q==4 else ''),'year':y,'quarter':q,'count':sum(r['date'][:4]==str(y)and (int(r['date'][5:7])-1)//3+1==q for r in rows)}for y in(2025,2026)for q in(1,2,3,4)]
dashboard={'meta':{'dataset':'中文TRO公开案件同期统计','coverage':'2025及2026年1月1日至11月25日','sourceDate':'2026-11-25'},'quarters':quarters,'districts':sorted(districts,key=lambda x:-x['count']),'candidateGroups':oldD['candidateGroups'],'nos':oldD['nos'],'sources':[]}
g={'source':'麦家星球；WorldTRO交叉核对','coverage':dashboard['meta']['coverage'],'total':len(rows),'knownMappedTotal':len(rows),'unmappedTotal':0,'districts':sorted(geo,key=lambda x:-x['count'])}
# Identity-safe classification index; bare docket number is not a deduplication key.
rights={r['court']+'|'+r['case']:r['right']for r in rows if r['right']!='其他案件'}
u={'cutoff':'2026-11-25','summary':summary,'dashboard':dashboard,'geography':g,'district_quarterly':dq,'rights':rights,'court_names':{ct[k]:v for k,v in cn.items()},'classifications_2026':dict(collections.Counter(r['right']for r in rows if r['date'].startswith('2026'))),'provenance':{'primary_rows':8248,'comparison_rows':len(rows),'worldtro_list_rows':2100,'copyright_comparison_used':False}}
(OUT/'dashboard_unified.json').write_text(json.dumps(u,ensure_ascii=False,indent=2));(OUT/'unified_rows.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2));print('Unified districts:',len(geo),'sum:',sum(x['count']for x in geo));print('copyright',u['classifications_2026']);print('growth',((2969/2273)-1)*100,'IL share',2344/2969*100,'outside net',(625-229)/696*100)
