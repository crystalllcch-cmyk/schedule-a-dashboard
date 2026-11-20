# Data files

- `dashboard.json`: FJC R24 v3 candidate aggregates, district aggregates, candidate-group aggregates, NOS counts, and source registry.
- `district_quarterly.json`: rebuilt directly from all 4,551 rows in `R24_FJC_v3_修正后候选明细_2026-11-13.csv`, grouped by FJC circuit + district + quarter. Total reconciles to 4,551.
- `geography.json`: district totals and quarter breakdowns, plus city-level locator coordinates for 13 mapped district codes. Nine low-count district codes remain unmapped and appear in a separate list.
- `case_dossiers.json`: 16 selected case profiles with source-quality labels, supported procedural timelines, issues, outcomes, and source links. Six profiles also include a `partyResponse` summary, populated only where the dossier expressly records a defendant or party response; absence of this field must not be read as proof that no defense was raised.

The geography markers are orientation points, not district boundary geometry or the location of a particular defendant. The case dossier archive is a selected research sample, not a complete census. Do not treat FJC candidates as confirmed Schedule A cases.

- The interactive case archive groups the 16 dossiers into three editorial clusters (appellate rules; procedure/jurisdiction/service; TRO/PI/asset relief). Bubble size is a display hierarchy only, not case volume, success probability, or precedential weight. Bubble color indicates a primary issue selected for visualization.

- Archive admission rule: include only dossiers whose core procedural result and legal significance are supported by a court opinion/order or a clearly recorded docket entry. Cases with essential rulings or current procedural status that cannot be confirmed are excluded from the interactive archive until verified.

- Each `case_dossiers.json` profile retains its original searchable text fields and adds `analysisPoints`: labeled bullet arrays for `summary`, `issue`, `response` (where a party response is recorded), `decision`, and `significance`. The dashboard renders these as structured lists in the bubble tooltip, quick-view panel, and full case drawer. Labels organize the source-supported analysis; they do not add new factual findings.
