# Schedule A Litigation Intelligence Dashboard

An interactive research dashboard prototype for exploring U.S. Schedule A litigation trends.

## Current prototype
- FJC R24 v3 case-level candidate aggregate (2025 Q1–2026 Q2)
- Quarterly candidate trend
- District concentration and candidate-group composition
- Interactive year / quarter / district filters
- Click-through chart details and methodology notes

## Important data limitations
The 4,551 records are Schedule A-feature candidates identified from FJC IDB characteristics, not 4,551 individually confirmed Schedule A cases. The FJC extract contains first-listed plaintiff and defendant only. The 94-record diagnostic sample is purposeful, not random; 73 records were supported by public docket records, and this cannot be used to estimate national precision or recall.

The district-quarter summary totals 4,542, which is 9 below the case-level candidate detail total of 4,551. The quarterly differences are 1, 3, 2, 0, 1, and 2. The dashboard preserves these as separate source views and does not allocate the difference to specific districts.

External RPX, CaseMagic, brand samples, and court decisions are not yet integrated into this prototype. No confidential company information should be added to this public repository.

## Run locally
Open `index.html` through a local static web server (not by double-clicking) so the JSON data files can load.

## Publish
Enable GitHub Pages in repository Settings → Pages → Deploy from a branch → `main` → `/ (root)`.
