# Data files

- `dashboard.json`: FJC R24 v3 candidate aggregates, district aggregates, candidate-group aggregates, NOS counts, and source registry.
- `district_quarterly.json`: rebuilt directly from all 4,551 rows in `R24_FJC_v3_修正后候选明细_2026-11-13.csv`, grouped by FJC circuit + district + quarter. Total reconciles to 4,551.
- `geography.json`: district totals and quarter breakdowns, plus city-level locator coordinates for 13 mapped district codes. Nine low-count district codes remain unmapped and appear in a separate list.
- `case_dossiers.json`: 18 selected case profiles with source-quality labels, supported procedural timelines, issues, outcomes, and source links. Six profiles also include a `partyResponse` summary, populated only where the dossier expressly records a defendant or party response; absence of this field must not be read as proof that no defense was raised.

The geography markers are orientation points, not district boundary geometry or the location of a particular defendant. The case dossier archive is a selected research sample, not a complete census. Do not treat FJC candidates as confirmed Schedule A cases.

- The interactive case archive groups the 18 dossiers into three editorial clusters (appellate rules; procedure/jurisdiction/service; TRO/PI/asset relief). Bubble size is a display hierarchy only, not case volume, success probability, or precedential weight. Bubble color indicates a primary issue selected for visualization.

- Archive admission rule: include only dossiers whose core procedural result and legal significance are supported by a court opinion/order or a clearly recorded docket entry. Cases with essential rulings or current procedural status that cannot be confirmed are excluded from the interactive archive until verified.

- `research_insights.json` retains the original legal-theme and court-decision text fields and adds labeled `analysisPoints` for each theme's core legal changes/business implications and each decision's issues, result, and authority/scope. The interface renders these as bullet lists in the legal-analysis panel, case cards, and case-detail view.
- Each `case_dossiers.json` profile retains its original searchable text fields and adds `analysisPoints`: labeled bullet arrays for `summary`, `issue`, `response` (where a party response is recorded), `decision`, and `significance`. The dashboard renders these as structured lists in the bubble tooltip, quick-view panel, and full case drawer. Labels organize the source-supported analysis; they do not add new factual findings.

- `case_dossiers.json` powers the interactive case archive's clustered bubble view and searchable list view. Hover/focus previews show issues, recorded party responses, court handling and research significance; click/keyboard activation opens the full point-by-point dossier, timeline and original sources.


## V0.8 content-layer updates (2026-11-26)

- `geography.json`: `stateSummary` adds a state-level aggregation derived from the 13 mapped FJC judicial-district codes. Nine unmapped district codes correspond to nine candidate records and remain separate. Maps, rankings and filters continue to use federal judicial districts.
- `research_insights.json`: the legal analysis now contains seven themes, including dedicated defendant-joinder and asset-restraint / third-party-platform themes. The decision library includes 17 linked rule and case records. Gettleman’s Standing Order is dated 2026-04-04; Kendall’s is dated 2026-08-11. Both are judge-specific, not district-wide rules.
- `research_insights.json` brand sample: TFL’s 203 qualifying Schedule A cases identified from five brands’ federal trademark dockets across five fashion brands (2021-01-01 to 2026-08-31) are stored by brand and year. Monthly rates divide full-year counts by 12 and 2026 Jan–Aug counts by 8, so the trend chart compares like-for-like monthly activity. Brand strategy summaries follow TFL’s qualitative discussion; its non-Schedule-A litigation descriptions are not treated as exhaustive counts.
- `research_insights.json` historical series: ABTL Orange County Report Figure 1, attributed to Lex Machina, covers 2016 through 2025-11-11. The 2025 value is partial and is not a full-year count.
- `case_dossiers.json`: `sourceClass` distinguishes `official` (official court-hosted material), `court-copy` (full court document mirrored by a third party), `docket-index` (public docket index / minute-entry record), and `mixed` (court material plus secondary status information). This class describes the source channel, not the legal authority or weight of the underlying ruling.

- `research_insights.json` adds `litigationActivity`: FJC candidate trend interpretation (2025 Q1–2026 Q2), separately scoped U.S. Courts trademark filing context and Cornerstone/Lex Machina patent Schedule A share, TFL five-brand plaintiff activity, a Dior repeat-filer docket snapshot, and judge-specific bond comparisons. These scopes are not combined into one national Schedule A count.
- `case_dossiers.json` now includes two additional 2026 examples: Christian Dior v. Schedule A Defendants, No. 1:26-cv-10747 (Kocoras; public docket/minute-entry record), and Advance Magazine Publishers Inc. v. Schedule A Defendants, No. 1:26-cv-11858 (Kendall; full court-order copy). The archive now has 18 dossiers grouped 3 / 6 / 9 across appellate, procedure/jurisdiction/service, and TRO/PI/asset-relief clusters.
- The 2026-11-10 Advance Magazine order applies Kendall’s 2026-08-11 dated Standing Order bond of $10,000 per defendant. Older Kendall profile PDF dated 2026-06-30 still accessible online states $1,000 per defendant; the later dated order and November application control for post-August references. Judge Alonso’s official page and Judge Rowland’s January 2026 docket sample use $1,000 per defendant. These are judge-specific examples, not a district-wide uniform bond.
- The activity analysis keeps three separate statistical scopes: FJC candidate records; ABTL/Lex Machina Schedule A filing series; and external all-trademark / patent-only market context. None should be added together or relabeled as a single confirmed national Schedule A total.
