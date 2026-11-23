# V0.9 data files

The current page loads exactly three files:

| File | Role |
| --- | --- |
| `v09_research.json` | Accepted research findings, 22 district locators, latest episode outcomes, probability sample and external reference series |
| `filing_cells.json` | 247 anonymous month × district × NOS cells regenerated from all 4,551 R24 v3 records; shared filing filters |
| `case_dossiers.json` | 26 dossiers; authority, source category, circuit and procedural status are separate fields |

`filing_cells.json` source SHA-256: `9521b865871587fcca66f0d7e852d5ec18c98d547014ad654d986cad98746a57`.

Regenerate with `python scripts/build_filing_cells.py /path/to/R24.csv data/filing_cells.json`. The script validates the source fingerprint, row count, unique keys and ORIGIN=1.

## Preserved V0.8 files

`dashboard.json`, `geography.json`, `research_insights.json` and `district_quarterly.json` are historical snapshots; V0.9 does not load them. Old diagnostic-sample and 13/22 map-coverage statements are superseded. They remain only as historical context. Current methodology is in `docs/METHODOLOGY.md`.

The 22 map points are approximate cities, not court buildings or judicial boundaries. Filing filters apply only to filing aggregates. Outcomes, sample precision, TFL and ABTL retain their own scopes and denominators. Dossier filters are independent.
