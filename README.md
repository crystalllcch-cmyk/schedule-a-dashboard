# Schedule A Litigation Intelligence Dashboard

美国 Schedule A 诉讼趋势与法院审查变化研究看板。

## V0.9 release — 2026-11-23

V0.9已完成研究、交互及真实浏览器验收，用户于2026-11-23确认发布。V0.8恢复分支为 `archive/v0.8-before-v0.9-2026-11-23`，恢复提交为 `15e80242faf69224eac37ddb4e7177fc0d05159f`。

### 当前模块

- FJC R24 v3候选池：4,551条案件级Schedule A特征候选记录，FILEDATE窗口2025-01-02至2026-06-30。
- FILEDATE月度、季度及半年度趋势；2025与2026 H1融合展示。
- 22个地区法院代码全部映射，地图点位为近似城市定位。
- ORIGIN=4重开记录调整后的最新episode状态、DISP和FILEDATE—TERMDATE间隔。
- 110条分层样本的候选池内部加权precision及置信区间。
- The Fashion Law五品牌样本、ABTL/Lex Machina历史序列及各自限制。
- 26个精选案件档案：已刊发上诉判决、非先例上诉处置、地区法院裁定、法官命令、待决上诉及相关判例。

### 重要统计限制

1. 4,551条是算法识别的候选记录，不是4,551件逐案确认的Schedule A案件。
2. 案卷数不等于被告数、店铺数、Listing数或独立维权活动数。拆案效应只能作为统计解释限制，不能在没有被告清单和campaign关联数据时量化。
3. R05样本110条（9条确定性纳入、101条分层随机），98条confirmed、12条inconclusive。保守加权precision约88.59%，近似95%区间82.34%—94.84%。该估计仅适用于4,551条候选池内部，不估计recall或全国真实案件总量。
4. FJC最新episode状态：3,506条terminated、1,045条pending；29条ORIGIN=4重开记录用于更新状态，不作为新立案。
5. DISP=18须单独说明；FJC记录的FILEDATE—TERMDATE间隔不是完整诉讼周期、TRO/PI裁定时间或最后案卷活动时间。
6. TFL五品牌是目的性时尚行业联邦商标样本；3.17倍是样本月均速度比，不是全国增长率。
7. ABTL正文所称63%增长率及TRO grant rate 75.2%/45.9%无法从公开文章独立复算，不作为已核实全国KPI。
8. 案件档案为精选研究档案，不是全面案件普查。待决上诉不得显示为已判决规则；非先例裁判不得标记为拘束性判例。

## 数据文件

- `data/v09_research.json`：V0.9整合指标、月度/季度、地区、NOS、结案、抽样、品牌样本及历史序列。
- `data/case_dossiers.json`：26个精选案件档案及时间线、判例效力、来源等级、巡回区、程序状态和原始链接。
- `data/filing_cells.json`：由已核验候选CSV重建的247个匿名月度×地区×NOS统计单元。
- `index.html`：V0.9互动看板页面。
- `data/dashboard.json`、`data/geography.json`、`data/research_insights.json`及`data/district_quarterly.json`：保留的V0.8历史文件，不作为V0.9页面主数据源。
- `docs/METHODOLOGY.md`：V0.9研究方法、字段定义、口径与限制。

## 本地预览

通过本地静态HTTP服务器打开仓库根目录（例如 `python -m http.server 8000`），再访问 `http://localhost:8000`。页面使用ECharts、Leaflet、OpenStreetMap tiles及Google Fonts外部资源。图表资源不可用时显示数值表格；地图不可用时仍可查看地区数据。

R12已补齐年份×巡回区×地区×NOS共同筛选，以及案件判例效力、来源等级、巡回区和状态独立筛选。R13已完成真实Chromium桌面/手机及单文件候选版验收；记录见 `docs/R13_BROWSER_ACCEPTANCE.md`。用户已确认正式发布。

交互逻辑验证：`npm install` 后运行 `npm test`。该验证使用DOM环境和图表适配器，不替代浏览器渲染验收。

## 发布规则

只有完成数据核对、交互测试、来源链接抽查、页面验收及用户确认后，才可将V0.9合并至`main`并触发GitHub Pages部署。本次发布已取得用户确认。

