import json,re,pathlib
ROOT=pathlib.Path(__file__).resolve().parents[1]
s=(ROOT/'advanced/index.html').read_text();u=json.loads((ROOT/'research/v15/dashboard_unified.json').read_text())
m=re.search(r'const SPECIFIED_COPY=(.*?);\n',s);j=json.loads(m[1])
def c(k,t,b):j[k]={'lead':t,'points':[b]}
c('history','批量诉讼保持活跃，案件增长跨年度延续','今年截至11月25日收录2,969件，超过去年全年，较去年同期增长30.6%。去年下半年的增长延续至今年，批量诉讼仍是原告持续使用的重要维权方式，卖家面临的涉诉压力具有持续性。')
c('geography','伊利诺伊北区继续增长，其他地区贡献过半净增量','伊利诺伊北区由2,044件增至2,344件，其他地区由229件增至625件，贡献同期56.9%的净增量。核心地区持续活跃，外围地区增长更快，推动伊利诺伊北区占比由89.9%降至79.0%。')
c('category','版权素材纠纷持续出现，跨店铺复用会扩大涉案范围','2026年同期已识别版权相关案件628件，占收录总量的21.2%，专利相关案件94件。商品图片、图案等素材纠纷仍是重要案件来源；相同素材在多个店铺或链接重复使用，会使同一权利问题涉及更多销售主体。')
c('map','伊利诺伊北区仍为中心，宾州与纽约扩大诉讼地域范围','2026年同期伊利诺伊北区收录2,344件，宾州西区260件、纽约南区112件；佛州南区由188件降至157件。原告的起诉地域更加分散，被告面对的法院及程序要求也随之增多。')
c('geoLine','前三季度保持增长，第四季度同期仍高于去年','2026年前三季度分别为729件、822件和835件，均高于去年同期；第四季度截至11月25日为583件，高于去年同期的462件。案件规模跨季度延续，第三季度环比增速有所放缓。')
c('heat','宾州西区全年持续活跃，纽约南区增长集中于第二季度','宾州西区今年前三季度分别为58件、51件和96件，第三季度进一步增加；纽约南区第二季度为63件，高于第一季度的15件和第三季度的22件。两地增长节奏不同，宾州呈持续活跃，纽约更集中于特定季度。')
j['alerts'][1]={'lead':'诉讼地域继续扩展，版权素材纠纷仍需重视','body':'宾州与纽约成为伊利诺伊州之外的重要增长来源；2026年同期已识别版权相关案件628件。起诉地域扩展与商品素材纠纷并存，卖家需要兼顾多地程序与图片、图案等权利问题。'}
s=s[:m.start(1)]+json.dumps(j,ensure_ascii=False)+s[m.end(1):]
s=s.replace("const SPECIFIED_RELEASE='V1.4 趋势分析修订版';","const SPECIFIED_RELEASE='V1.5 统一统计版';")
s=s.replace("D=originalData['data/dashboard.json'];R=originalData['data/research_insights.json'];DQ=originalData['data/district_quarterly.json'];GEO=originalData['data/geography.json'];","D=UNIFIED.dashboard;R=originalData['data/research_insights.json'];DQ=UNIFIED.district_quarterly;GEO=UNIFIED.geography;")
s=s.replace('V1.3 历史版本 ↗</a>','V1.3 历史版本 ↗</a><a href="/schedule-a-dashboard/versions/v1.4/" style="margin-left:0">V1.4 历史版本 ↗</a>')
layer=(ROOT/'scripts/v15_unified_layer.js').read_text()
s=s.replace('startOriginal();</script>','const UNIFIED='+json.dumps(u,ensure_ascii=False,separators=(',',':'))+';\n'+layer+'\nstartOriginal();</script>')
(ROOT/'advanced/index.html').write_text(s);(ROOT/'versions/v1.5').mkdir(exist_ok=True);(ROOT/'versions/v1.5/index.html').write_text(s)
b=(ROOT/'build_v14.cjs').read_text().replace('v14','v15').replace('V1.4 趋势分析修订版','V1.5 统一统计版');(ROOT/'build_v15.cjs').write_text(b)
y=(ROOT/'.github/workflows/v14-acceptance.yml').read_text().replace('v14','v15').replace('V1.4','V1.5').replace('work/v15-analysis-20261127','work/v15-unified-data-20261127');(ROOT/'.github/workflows/v15-acceptance.yml').write_text(y)
print('V1.5 source prepared')
