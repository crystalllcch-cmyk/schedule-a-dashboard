"""Reuse archived Maijia rows; retrieve WorldTRO's public classification helper.
The helper URL is advertised in the public /tro/ page script. Court+case is
always the identity; bare-number collisions are retained for separate review.
"""
import json, pathlib, urllib.request, urllib.parse, concurrent.futures, time
from lxml import html
ROOT=pathlib.Path(__file__).resolve().parents[1]/'research/v15'
if not (ROOT/'maijia_existing_8248.json').exists():
 source=(ROOT.parents[1]/'advanced/index.html').read_text();start=source.index('const originalData=')+len('const originalData=');data,_=json.JSONDecoder().raw_decode(source[start:]);(ROOT/'maijia_existing_8248.json').write_text(json.dumps(data['data/public_tro.json'],ensure_ascii=False))
p=json.loads((ROOT/'maijia_existing_8248.json').read_text());rows=[dict(zip(p['columns'],v))for v in p['rows']]
selected=[r for r in rows if r['date'][:4]in('2025','2026')and r['date'][5:]<='11-25']
ROOT.mkdir(exist_ok=True,parents=True)
world=[]
for path in ['/tro/','/2025nianzuixintroanjian/','/2026/']:
 fn=ROOT/('worldtro_'+path.strip('/').replace('/','_')+'.html')
 if not fn.exists():fn.write_bytes(urllib.request.urlopen('https://worldtro.com'+path,timeout=30).read())
 d=html.fromstring(fn.read_bytes())
 for tr in d.xpath('//table//tr'):
  t=tr.xpath('./td')
  if len(t)<7:continue
  vals=[' '.join(c.text_content().split())for c in t]
  import re,datetime
  m=re.search(r'20\d\d-cv-\d+',vals[1])
  if not m:continue
  try:date=datetime.datetime.strptime(vals[0],'%m/%d/%Y').date().isoformat()
  except ValueError:continue
  a=t[1].xpath('.//a/@href');world.append(dict(date=date,case=m[0],plaintiff=vals[2],state=vals[3],firm=vals[4],brand=vals[5],raw_type=vals[6],source_url='https://worldtro.com'+a[0]if a else 'https://worldtro.com'+path))
(ROOT/'worldtro_list_rows.json').write_text(json.dumps(world,ensure_ascii=False,indent=2))
sns=sorted({r['case']for r in selected}|{r['case']for r in world if r['date'][:4]in('2025','2026')})
batches=[sns[i:i+80]for i in range(0,len(sns),80)];(ROOT/'nos_batches').mkdir(exist_ok=True)
def get(t):
 i,ss=t;f=ROOT/'nos_batches'/f'{i:03}.json'
 if f.exists():return i,len(json.loads(f.read_text()).get('data',{})),'cached'
 u='https://apicase.worldtro.com/admin/sync/nos?sns='+urllib.parse.quote(','.join(ss))
 for attempt in range(3):
  try:
   b=urllib.request.urlopen(u,timeout=25).read();j=json.loads(b);assert j['code']==0
   f.write_bytes(b);return i,len(j['data']),'ok'
  except Exception as e:
   if attempt==2:return i,0,str(e)
   time.sleep(1+attempt)
with concurrent.futures.ThreadPoolExecutor(max_workers=4)as ex:
 for i,n,status in ex.map(get,enumerate(batches)):
  print(f'batch {i+1}/{len(batches)}: {n} {status}',flush=True)
allnos={}
for f in sorted((ROOT/'nos_batches').glob('*.json')):allnos.update(json.loads(f.read_text()).get('data',{}))
(ROOT/'worldtro_nos.json').write_text(json.dumps(allnos,ensure_ascii=False,indent=2))
print(json.dumps({'selected':len(selected),'world_rows':len(world),'nos_resolved':len(allnos),'numbers_requested':len(sns)}),flush=True)
