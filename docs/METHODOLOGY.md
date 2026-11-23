# V0.9 Data Methodology — 2026-11-23

## 1. Primary FJC candidate pool

- Source: FJC Integrated Database, Civil; R24 v3 corrected candidate extract.
- Original source snapshot: `cv88on.zip`, 329,665,474 bytes; SHA-256 `74405231a9a3c246c7090d471a1525924fa5afb513ff22b4dc0f4babbac7223d`.
- Candidate rows: 4,551; 18 columns; FILEDATE 2025-01-02 through 2026-06-30.
- Deduplication key: CIRCUIT + DISTRICT + OFFICE + DOCKET.
- All 4,551 candidate keys are unique. All are ORIGIN=1 initial filing records.
- Unit: case-level Schedule A-feature candidate docket record. Not an individually confirmed Schedule A case, defendant, store, listing, or enforcement campaign.

## 2. Filing-date trends

FILEDATE is used for actual district-court filing-date analysis. FDATEUSE/TDATEUSE are AO statistical date fields and must not replace FILEDATE/TERMDATE for the dashboard's observed date interval.

| Period | Candidate records | Monthly average |
|---|---:|---:|
| 2025 H1 | 1,316 | 219.3 |
| 2025 H2 | 1,599 | 266.5 |
| 2026 H1 | 1,636 | 272.7 |

2026 H1 is +24.32% against 2025 H1 but only +2.31% against 2025 H2. Do not describe the series as continuous acceleration.

## 3. District, circuit and NOS

- 22 district codes are mapped using the FJC Civil Codebook.
- Map markers use approximate city locator coordinates. They are not courthouse coordinates, district boundaries, or defendant locations.
- N.D. Illinois: 1,156 (2025 H1) to 1,292 (2026 H1).
- Other districts: 160 to 344. The increase is concentrated in W.D. Pennsylvania and S.D. New York; S.D. Florida declines.
- NOS 820=copyright; 830=patent; 835=patent—ANDA; 840=trademark. NOS 835 must not be silently merged into generic Other.
- W.D. Pennsylvania's explicit Schedule A wording in DEF and S.D. New York's lack of the same wording are differences in caption/DEF-field practices, not comparable incidence rates.
- FJC PLT and DEF are first-listed party fields. PLT strings may be truncated at 30 characters; unique strings are not unique legal entities.

## 4. Latest episode, reopened records, DISP and TERMDATE

- Count new filings from ORIGIN=1 only.
- 29 ORIGIN=4 records are reinstated/reopened episodes for existing docket keys. They update the latest status but do not create new filing counts.
- Latest status: 3,506 terminated (L), 1,045 pending (S).
- Latest DISP among terminated records: 12 voluntary dismissal/termination 1,744; 4 default judgment 1,267; 14 other dismissal 165; 13 settled 152; 5 consent judgment 42; 6 pretrial motion judgment 34; 17 other judgment 25; 18 statistical closing 25; 2 want of prosecution 22; 3 lack of jurisdiction 18; 0 transfer 11; 11 remand to agency 1.
- DISP 12 is not synonymous with no settlement; private settlement may precede a voluntary dismissal.
- DISP 18 is separately flagged. Some candidate case dockets show post-TERMDATE activity; do not treat statistical closing as a merits judgment or complete end of litigation.
- Latest terminated FILEDATE—TERMDATE interval: median 66 days; mean 80.82; P25 41; P75 105; P90 162. This is not complete litigation duration, TRO/PI decision time, or last docket activity.

## 5. Judgment fields

The judgment subset is restricted to 1,368 candidate records in DISP 4/5/6/17. JUDGMENT is plaintiff-favorable for 1,360 and defendant-favorable for 8 (99.42% plaintiff-favorable within this restricted subset). This is not a win rate for all Schedule A cases. NOJ is displayed only as a secondary breakdown within the relevant judgment subset.

## 6. Candidate identification validation

R05 sample:
- Candidate population N=4,551.
- 9 certainty units (7 rare NOS records and 2 N.D. Illinois explicit Schedule A records).
- 101 stratified random units.
- 110 reviewed; 98 confirmed, 12 inconclusive, 0 identified as not Schedule A.
- Conservative weighted precision estimate: 88.59%; approximate 95% design-based interval 82.34%–94.84%.
- Optimistic sensitivity point estimate if all 12 inconclusive units were confirmed: 100%. No upper confidence interval is estimated under the all-positive assumption.
- The 12 inconclusive units are not false positives. Their weighted population estimate is about 519.3 records.
- The 110-unit selection was regenerated from the archived `design_random_sample_v09.py`; all 110 case keys, sample IDs and stratum ordering matched. The estimator was independently rerun and matched the archived JSON.
- The earlier 354-unit design was superseded. The earlier 94-unit diagnostic sample is purposive; 73/94 cannot be used as precision.
- This sample estimates precision/positive predictive value within the candidate pool only. It does not estimate recall, missed cases outside the pool, or national Schedule A volume.

## 7. District diagnostic sample and joinder counterexample

R03 selected 8 cases each from W.D. Pennsylvania and S.D. New York; all 16 sampled records had public docket evidence supporting Schedule A filing characteristics. The sample is too small and was designed for district diagnostics, not national precision estimation.

PLOUT v. REN SHIJU et al., No.2:26-cv-01134 (W.D. Pa., Aug.14, 2026, ECF 52) denied a misjoinder motion at the motion stage based on pleaded coordination allegations. The available text is reproduced by third-party docket sources; the underlying entry was text-only and no signed PDF/PACER-certified snapshot was obtained in this research batch. It is a counterexample to a universal claim that courts uniformly reject Schedule A joinder, not proof that all defendants were factually coordinated.

## 8. Brand sample and ABTL / Lex Machina

### The Fashion Law five-brand sample

Dior, Chrome Hearts, Louis Vuitton, Stüssy and Gucci; 203 qualifying federal trademark Schedule A cases from 2021-01-01 to 2026-08-31. Annual counts: 2021 15; 2022 21; 2023 33; 2024 25; 2025 35; 2026 Jan–Aug 74.

The 3.17x metric is the ratio of sample monthly pace (2026 Jan–Aug versus 2025 full year), not national growth. Brand patterns diverge; do not imply all five brands accelerated.

### ABTL Orange County Report / Lex Machina

Historical Figure 1 values: 2016 196; 2017 250; 2018 314; 2019 405; 2020 574; 2021 804; 2022 1,042; 2023 1,424; 2024 2,060; 2025* 2,808 (*through 2025-11-11).

The article's narrative claim of 63% 2025 growth cannot be independently reproduced from the public chart. 2,060 to 2,808 is a 36.3% arithmetic difference across unequal time windows. The article's TRO grant rates of 75.2% and 45.9% lack public denominators and case-level lists. These remain secondary, unverified signals, not core national KPIs.

## 9. Appellate and district-court authority

Case archive records distinguish:
1. Published precedential appellate opinions.
2. Nonprecedential appellate dispositions.
3. District-court orders.
4. Judge-specific standing orders.
5. Pending appeals.
6. Related appellate authority not itself classified as a Schedule A case.

Do not present Smart Study/Kangol, Liu, Wood, Louis Poulsen, Jacki Easlick, Adidas or Shangyou Jiayi as interchangeable authority. In particular:
- Smart Study and Kangol are published appellate opinions on China/Hague Convention email service.
- Liu is a published Seventh Circuit opinion on actual sales and defendant-specific personal jurisdiction; it does not impose a nationwide categorical test-purchase requirement.
- Wood is nonprecedential; it calls for fact-specific Rule 20 analysis and consideration of Rule 21 severance.
- Louis Poulsen is a nonprecedential attorney-fee disposition, not a ruling that test purchases are unnecessary.
- Jacki Easlick is nonprecedential and concerns independent PI review after an ex parte TRO.
- Adidas is pending in the Eleventh Circuit; oral argument occurred 2026-11-04, and no opinion is reflected as of 2026-11-23.
- Shangyou Jiayi (4:25-cv-01416) and Liu v. Schedule A (4:25-cv-01220) are different E.D. Texas cases and must remain separate.

## 10. Sources

- FJC Civil Codebook: https://www.fjc.gov/sites/default/files/idb/codebooks/Civil%20Codebook%201988%20Forward%2010252023.pdf
- FJC IDB Research Guide: https://www.fjc.gov/sites/default/files/IDB-Research-Guide.pdf
- The Fashion Law: https://www.thefashionlaw.com/inside-the-state-of-schedule-a-litigation-in-fashion/
- ABTL Orange County Report, Spring 2026: https://www.allenmatkins.com/a/web/5jtKChmncRtSMrDQtfg52x/brKH8S/2026-volume-1.pdf

## 11. Release controls

V0.9 prototype is on branch `v0.9-research-integration-2026-11-23`. The V0.8 `main` branch and published GitHub Pages site remain unchanged. Do not merge/deploy until all charts, map points, source links, case records, filters, responsive layouts and methodology notes pass independent testing.
