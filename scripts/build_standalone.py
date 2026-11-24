"""Package the accepted page/data as one reviewable HTML; keep external chart/map libraries."""
import json
from pathlib import Path
import sys

root = Path(__file__).resolve().parents[1]
output = Path(sys.argv[1])
datasets = {name: json.loads((root/'data'/f'{name}.json').read_text()) for name in ['v09_research','case_dossiers','filing_cells']}
analysis = (root/'analysis.js').read_text()
app = (root/'app.js').read_text()
old = "async function readJSON(path) { const response=await fetch(path);if(!response.ok) throw new Error(path+' HTTP '+response.status);return response.json(); }"
assert app.count(old) == 1
new = "async function readJSON(path) { return EMBEDDED_DATA[path.split('/').pop().replace('.json','')]; }"
app = app.replace(old,new)
payload = json.dumps(datasets, ensure_ascii=False).replace('<', '\\u003c')
html = (root/'index.html').read_text()
scripts = '<script src="./analysis.js"></script><script src="./app.js"></script>'
assert html.count(scripts) == 1
html = html.replace(scripts, '<script>const EMBEDDED_DATA='+payload+';\n'+analysis+'\n'+app+'</script>')
assert 'fetch(' not in html
output.parent.mkdir(parents=True,exist_ok=True)
output.write_text(html)
print(output.resolve())
