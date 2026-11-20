# Schedule A Litigation Intelligence Dashboard

An interactive research dashboard for exploring U.S. Schedule A litigation trends, selected court decisions, and geographic candidate distributions.

## Current prototype
- FJC R24 v3 case-level candidate aggregates: 4,551 Schedule A-feature candidates, 2025 Q1–2026 Q2
- Historical ABTL / Lex Machina series and quarterly FJC candidate trend
- Five-brand Fashion Law sample and court-decision research summaries
- Interactive year / quarter / district filters
- U.S. geographic exploration with 13 city-level district locator points and 9 unmapped low-frequency FJC district codes
- Case dossier archive with 18 selected researched cases, procedural timelines, source-quality labels, issue/outcome summaries, and original-source links
- Click-through chart details and methodology notes

## Important data limitations
The 4,551 records are Schedule A-feature candidates identified from FJC IDB characteristics, not 4,551 individually confirmed Schedule A cases. The FJC extract contains first-listed plaintiff and defendant only. The 94-record diagnostic sample is purposeful, not random; 73 records were supported by public docket records, and this cannot be used to estimate national precision or recall.

The district-quarter dataset used by the interactive map has been rebuilt directly from all 4,551 case-level candidate rows and reconciles to 4,551. Thirteen district codes are mapped to approximate city-level locator points; nine low-frequency district codes remain unmapped. Markers are not district boundary polygons or defendant locations.

The 18 case dossiers are a selected research archive, not a comprehensive case census. Each dossier labels whether its source is an appellate opinion, official court PDF, court-order copy, docket minute entry, or secondary legal summary. Do not treat FJC candidates as confirmed Schedule A cases or infer nationwide grant/denial rates from the selected case sample.

RPX quarterly metrics and CaseMagic rolling snapshots are not yet integrated into interactive charts because their units and coverage differ from the FJC candidate series. No confidential company information should be added to this public repository.

## Data files
- `data/dashboard.json`: trend and aggregate data
- `data/research_insights.json`: historical series, brand sample, and court-decision summaries
- `data/geography.json`: district counts, quarter breakdowns, and map locator coordinates
- `data/district_quarterly.json`: district-quarter rows rebuilt from the R24 v3 candidate detail
- `data/case_dossiers.json`: selected researched case profiles and timelines
- `docs/METHODOLOGY.md`: source scope, methodology, and limitations

## Run locally
Open `index.html` through a local static web server (not by double-clicking) so the JSON data files and map tiles can load.

## Publish
Enable GitHub Pages in repository Settings → Pages → Deploy from a branch → `main` → `/ (root)`.
