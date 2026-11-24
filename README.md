# Schedule A Litigation Intelligence Dashboard

美国 Schedule A 诉讼趋势与法院审查变化研究看板。

## 当前版本与发布状态（2026-11-24）

- **线上正式版本：V0.8**。
- 正式分支：`main`，当前基准提交：`f7885a45f5f4e1044627fa9dd32a59c73e56de2e`。
- 线上网址：https://crystalllcch-cmyk.github.io/schedule-a-dashboard/
- V0.8存档分支：`archive/v0.8-before-v0.9-2026-11-23`。
- 高级改版参考分支：`feature/four-module-information-architecture-2026-11-23`。
- 当前P1工作分支：`feature/p1-content-storytelling-2026-11-24`，属于独立开发分支，**不是线上发布版本**。
- **用户尚未批准V0.9或高级改版正式发布；不得将本分支合并至`main`，不得触发正式网站部署，除非取得用户新的明确授权。**

四模块参考分支最新开发提交为 `bbe0d1d1b5f58c9a4098a85b577d1b45a1b22e38`。当前P1工作分支的应用代码提交为 `3f0ed9dac85efcac42f55145750ffb8ef6e4f3ae`，GitHub Actions运行 [#45337751136](https://github.com/crystalllcch-cmyk/schedule-a-dashboard/actions/runs/45337751136) 已通过DOM测试、桌面及手机Chromium测试，并对仓库页面和单文件生成版本分别完成验收。自动化测试通过不等于用户验收，也不构成发布授权。

## 当前研究与功能内容

- FJC R24 v3候选池：4,551条案件级Schedule A特征候选记录，FILEDATE窗口2025-01-02至2026-06-30。
- FILEDATE月度、季度及半年度趋势；2025与2026 H1融合展示。
- 22个地区法院代码全部映射，地图点位为近似城市定位。
- ORIGIN=4重开记录调整后的最新episode状态、DISP和FILEDATE—TERMDATE间隔。
- 110条分层样本的候选池内部加权precision及置信区间。
- The Fashion Law五品牌样本、ABTL/Lex Machina历史序列及各自限制。
- 26个精选案件档案：已刊发上诉判决、非先例上诉处置、地区法院裁定、法官命令、待决上诉及相关判例。
- 19项精选司法事件、6类法律主题，以及事件/主题与案件档案的关联下钻。
- 四个一级模块：趋势与拐点、地域与结构、司法规则与案件档案、品牌样本与数据核验。

## 重要统计限制

1. 4,551条是算法识别的候选记录，不是4,551件逐案确认的Schedule A案件。
2. 案卷数不等于被告数、店铺数、Listing数或独立维权活动数。拆案效应只能作为统计解释限制，不能在没有被告清单和campaign关联数据时量化。
3. R05样本110条（9条确定性纳入、101条分层随机），98条有公开记录支持、12条暂无法分类。保守加权precision约88.59%，近似95%区间82.34%—94.84%。该估计仅适用于4,551条候选池内部，不估计recall或全国真实案件总量。
4. FJC最新episode状态：3,506条terminated、1,045条pending；29条ORIGIN=4重开记录用于更新状态，不作为新立案。
5. DISP=18须单独说明；FJC记录的FILEDATE—TERMDATE间隔不是完整诉讼周期、TRO/PI裁定时间或最后案卷活动时间。
6. TFL五品牌是目的性时尚行业联邦商标样本；3.17倍是样本月均速度比，不是全国增长率。
7. ABTL正文所称63%增长率及TRO grant rate 75.2%/45.9%无法从公开文章独立复算，不作为已核实全国KPI。
8. 案件档案为精选研究档案，不是全面案件普查。待决上诉不得显示为已判决规则；非先例裁判不得标记为拘束性判例。

## 数据文件

- `data/v09_research.json`：整合指标、月度/季度、地区、NOS、结案、抽样、品牌样本及历史序列。
- `data/case_dossiers.json`：26个精选案件档案及时间线、判例效力、来源等级、巡回区、程序状态和原始链接。
- `data/filing_cells.json`：由已核验候选CSV重建的247个匿名月度×地区×NOS统计单元。
- `index.html`、`app.js`：高级互动页面与交互逻辑。
- `review/schedule-a-advanced-preview.html`：四模块基线单文件预览；P1—P3优化完成后将重新生成当前工作分支的独立预览。
- `docs/METHODOLOGY.md`：研究方法、字段定义、统计口径与限制。
- `docs/PHASE1_FOUR_MODULE_ARCHITECTURE.md` 至 `docs/PHASE5_ACCEPTANCE.md`：阶段记录。

## 本地预览

通过本地静态HTTP服务器打开仓库根目录（例如 `python -m http.server 8000`），再访问 `http://localhost:8000`。页面使用ECharts、Leaflet、OpenStreetMap tiles及Google Fonts外部资源。图表资源不可用时显示数值表格；地图不可用时仍可查看地区数据。

独立单文件预览内嵌三份研究数据和应用逻辑，不依赖本地JSON请求；图表库、地图底图及字体仍通过网络加载。

## 发布规则

只有完成研究内容核验、统计口径核对、来源链接抽查、交互测试、桌面/移动端验收、用户实际预览及用户明确批准后，才可将改版合并至`main`并触发GitHub Pages部署。正式发布后还须检查线上实际页面及部署提交。当前V0.8继续作为唯一正式线上版本。
