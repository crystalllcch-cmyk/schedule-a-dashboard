# Data methodology — current dashboard release v0.8 (2026-11-20)

## Primary dataset
- File: `data/dashboard.json`
- Dataset: R24 FJC v3 corrected candidate extract
- Source date: 2026-11-13
- Coverage: 2025 Q1–2026 Q2
- Unit: case-level Schedule A-feature candidate record
- Total: 4,551
- Deduplication key: CIRCUIT + DISTRICT + OFFICE + DOCKET

## Candidate identification and validation
The extract includes multiple candidate groups, including caption-prefix and explicit Schedule A text patterns. Candidate classification is not equivalent to docket-by-docket confirmation. FJC IDB exposes first-listed plaintiff and defendant only. A purposeful diagnostic sample has 73/94 records supported by public docket records; because it is not random and there is no independent negative-pool audit, national precision and recall are not estimable.

## District data reconciliation
An earlier regional-summary export totaled 4,542 and omitted 9 candidate rows. For the interactive geography page, district-quarter counts have been rebuilt directly from all 4,551 rows in the R24 v3 case-level candidate detail, grouped by CIRCUIT + DISTRICT + calendar year + quarter. The rebuilt district-quarter table reconciles exactly to 4,551; 13 district codes are mapped to city-level locator points and 9 low-count codes remain unmapped.

## Integrated and pending datasets
Historical ABTL/Lex Machina series, the five-brand Fashion Law sample, and selected appellate/district-court decisions are included in `data/research_insights.json`. Sixteen selected, source-checked case dossiers are included in `data/case_dossiers.json`. RPX quarterly metrics and CaseMagic rolling snapshots are not yet integrated into interactive charts because their units and coverage differ from the FJC candidate series; they remain separate comparison sources until their own display and caveats are implemented.


## Research interpretation layer
- Historical series: ABTL Orange County Report, Spring 2026, Figure 1, p.10; 2016–2025* values are 196, 250, 314, 405, 574, 804, 1,042, 1,424, 2,060, 2,808. The 2025 point is through 2025-11-11.
- FJC H1 comparison: 2025 H1 1,316; 2026 H1 1,636; +320 / +24.32%. This is a same-source candidate comparison, not a confirmed national Schedule A filing growth rate.
- H1 geography: N.D. Illinois 1,156 → 1,292; other districts 160 → 344. N.D. Illinois share 87.84% → 78.97%. These are candidate-pool regional figures.
- H1 NOS: 840 823 → 969; 820 379 → 567; 830 112 → 99. NOS is administrative classification, not verified claim type in each case.
- Five-brand TFL sample: 2025 full year 35; 2026-01-01 to 2026-08-31 74; monthly pace comparison 3.17x. Brand-specific changes are shown separately. This is a purposive five-brand sample, not a national universe.
- Legal decision records include appellate opinions, district-court orders, and judge-specific standing orders. The dashboard labels each type and its applicable authority; judge-specific orders are not presented as district-wide rules.


## Interactive geography and case archive
- `data/geography.json` and `data/district_quarterly.json` are both derived directly from the 4,551-row R24 v3 candidate detail, grouped by CIRCUIT + DISTRICT and calendar quarter. Their totals reconcile to 4,551.
- 13 district codes are displayed at city-level locator points; 9 low-frequency codes remain unmapped. Map points are not district boundaries and do not identify a defendant's location.
- `data/case_dossiers.json` contains 16 selected, source-checked cases. Each profile preserves the case-specific timeline, outcome, source-quality label and source link. It is a selected research archive, not a complete case census.
- Case records distinguish appellate opinions, official GovInfo court documents, court-order copies, docket minute entries, and secondary legal summaries. Where the source is a docket index or secondary summary, the interface labels it as such.
