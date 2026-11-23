"""Rebuild anonymous filing cross-tabs from the accepted R24 v3 candidate CSV."""
import collections
import csv
import hashlib
import json
import pathlib
import sys

source = pathlib.Path(sys.argv[1])
target = pathlib.Path(sys.argv[2])
raw = source.read_bytes()
assert hashlib.sha256(raw).hexdigest() == '9521b865871587fcca66f0d7e852d5ec18c98d547014ad654d986cad98746a57'
rows = list(csv.DictReader(raw.decode('utf-8-sig').splitlines()))
assert len(rows) == 4551
assert len({tuple(r[k] for k in ['CIRCUIT', 'DISTRICT', 'OFFICE', 'DOCKET']) for r in rows}) == 4551
cells = collections.Counter((r['FILEDATE'][:7], r['CIRCUIT']+'-'+r['DISTRICT'], r['NOS']) for r in rows)
assert all(r['ORIGIN'] == '1' for r in rows)
payload = {'source': source.name, 'sha256': hashlib.sha256(raw).hexdigest(),
           'unit': 'ORIGIN=1 case-level candidate records', 'total': len(rows),
           'cells': [dict(month=m, district=d, nos=n, count=v) for (m,d,n),v in sorted(cells.items())]}
target.write_text(json.dumps(payload, ensure_ascii=False, indent=2)+'\n')
print(json.dumps({'rows': len(rows), 'cells':len(cells), 'sum':sum(cells.values())}))
