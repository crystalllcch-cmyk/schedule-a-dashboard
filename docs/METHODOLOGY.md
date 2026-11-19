# Data methodology — prototype v0.1

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
The district-quarter summary file sums to 4,542 records, while the case-level candidate extract sums to 4,551. Quarter differences (case-level minus district-quarter summary) are: 2025 Q1 +1, 2025 Q2 +3, 2025 Q3 +2, 2025 Q4 0, 2026 Q1 +1, 2026 Q2 +2. The dashboard preserves this discrepancy and does not assign the difference to any district.

## Not yet integrated
Historical ABTL/Lex Machina series, five-brand activity sample, RPX quarterly metrics, CaseMagic snapshots, and court-decision database are not included in this prototype. They must be independently reconciled and sourced before appearing in public charts.
