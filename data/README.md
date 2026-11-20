# Data files

- `dashboard.json`: FJC R24 v3 candidate aggregates, district aggregates, candidate-group aggregates, NOS counts, and source registry.
- `district_quarterly.json`: rebuilt directly from all 4,551 rows in `R24_FJC_v3_修正后候选明细_2026-11-13.csv`, grouped by FJC circuit + district + quarter. Total reconciles to 4,551.
- `geography.json`: district totals and quarter breakdowns, plus city-level locator coordinates for 13 mapped district codes. Nine low-count district codes remain unmapped and appear in a separate list.
- `case_dossiers.json`: 18 selected case profiles with source-quality labels, supported procedural timelines, issues, outcomes, and source links.

The geography markers are orientation points, not district boundary geometry or the location of a particular defendant. The case dossier archive is a selected research sample, not a complete census. Do not treat FJC candidates as confirmed Schedule A cases.
