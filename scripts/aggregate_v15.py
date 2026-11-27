import json,re,collections,pathlib,hashlib
ROOT=pathlib.Path(__file__).resolve().parents[1];OUT=ROOT/'research/v15'
p=json.loads((OUT/'maijia_existing_8248.json').read_text());rows=[dict(zip(p['columns'],r))for r in p['rows']]
world=json.loads((OUT/'worldtro_list_rows.json').read_text());nos=json.loads((OUT/'worldtro_nos.json').read_text())
def norm(s):return re.sub(r'[^a-z0-9\u4e00-\u9fff]','',s.lower())
def explicit(brand):
 if '版权'in brand or re.search(r'copyright',brand,re.I):return '版权相关'
 if '专利'in brand or re.search(r'patent|\bUS\s*D?\s*\d[\d,]{3,}',brand,re.I):return '专利相关'
 if '商标'in brand or re.search(r'trademark',brand,re.I):return '商标相关'
 return None
known=collections.defaultdict(set)
for r in rows+world:
 e=explicit(r['brand'])
 if e and norm(r['brand'])not in ('','--'):known[norm(r['brand'])].add(e)
 # Plaintiff identity alone is deliberately not used to transfer rights across products.
collision=collections.defaultdict(set)
for r in rows:
 if r['date'][:4]in('2025','2026'):collision[r['case']].add(r['court'])
worldmap=collections.defaultdict(list)
for r in world:worldmap[(r['case'],r['state'])].append(r)
selected=[]
for row in rows:
 r=dict(row)
 if r['date'][:4]not in('2025','2026')or r['date'][5:]>'11-25':continue
 if not r['court']:
  m=re.search(r'/tro-case-lists/([a-z]+)-',r['source_url']);r['court']=m[1]if m else ''
 e=explicit(r['brand']);method='名称明确标识'if e else None
 same=known[norm(r['brand'])]
 matches=worldmap.get((r['case'],r['state']),[])
 if not e and len(same)==1:e=next(iter(same));method='同一权利名称对应'
 if not e:
  wm={explicit(x['brand'])for x in matches}-{None}
  if len(wm)==1:e=next(iter(wm));method='第二站同案名称'
 if not e and len(collision[r['case']])<=1 and nos.get(r['case'])in('820','830'):
  e={'820':'版权相关','830':'专利相关'}[nos[r['case']]];method='第二站具体案由'
 # 840 is not used as a residual trademark default: historic records contain
 # systematic copyright/name conflicts. Unclassified records remain in other.
 r.update(right=e or '其他案件',classification_basis=method or '未据默认840推定权利类型',worldtro_url=matches[0]['source_url']if matches else '',worldtro_nos=nos.get(r['case']))
 selected.append(r)
seen=set()
for r in selected:
 k=r['court']+'|'+r['case'];assert k not in seen;seen.add(k)
summary={'cutoff':'11-25','years':{},'identity':'court+case','source':'麦家星球完整年度明细为主；WorldTRO补充同案权利名称和具体案由','classification':'名称明确标识优先；第二站具体820/830补充；默认840不直接推定商标，其他单列。'}
for y in('2025','2026'):
 a=[r for r in selected if r['date'][:4]==y];summary['years'][y]={'total':len(a),'states':dict(collections.Counter(r['state']for r in a)),'courts':dict(collections.Counter(r['court']for r in a)),'rights':dict(collections.Counter(r['right']for r in a)),'months':[sum(int(r['date'][5:7])==m for r in a)for m in range(1,12)],'quarters':[sum((int(r['date'][5:7])-1)//3+1==q for r in a)for q in range(1,5)]}
(OUT/'unified_rows.json').write_text(json.dumps(selected,ensure_ascii=False,indent=2));(OUT/'summary.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2))
print(json.dumps(summary,ensure_ascii=False,indent=2))
