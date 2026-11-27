const fs=require('fs'),{chromium}=require('playwright');
(async()=>{
 fs.mkdirSync('exports',{recursive:true});
 let s=fs.readFileSync('advanced/index.html','utf8');
 if(s.includes('id="interactive-hydration"')){fs.copyFileSync('advanced/index.html','exports/index_v12.html');return;}
 const browser=await chromium.launch();const p=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto('http://127.0.0.1:8787/advanced/',{waitUntil:'networkidle'});await p.waitForTimeout(700);
 for(const view of ['overview','activity','geography','courts','brands','casefiles']){await p.locator('[data-view="'+view+'"]').click();await p.waitForTimeout(100)}
 if(errors.length)throw new Error(errors.join('\n'));
 const appendix=[];
 for(const id of await p.evaluate(()=>Object.keys(DEPTH))){await p.locator('[data-view="courts"]').click();await p.locator('[data-depth="'+id+'"]').click();appendix.push(await p.locator('#themeDetail').evaluate(e=>e.outerHTML.replace('id="themeDetail"','')))}
 for(const id of await p.evaluate(()=>CASES.cases.map(c=>c.id))){await p.evaluate(id=>openCase(id),id);appendix.push(await p.evaluate(()=>'<article><h2>'+document.getElementById('dtitle').innerHTML+'</h2><p>'+document.getElementById('dintro').innerHTML+'</p>'+document.getElementById('dbody').innerHTML+'</article>'));await p.evaluate(()=>document.getElementById('drawer').classList.remove('open'))}
 await p.locator('[data-view="courts"]').click();await p.locator('[data-depth="jurisdiction"]').click();await p.locator('[data-view="overview"]').click();
 const fallback=await p.evaluate(()=>{const root=document.body.cloneNode(true);root.querySelectorAll('script,noscript').forEach(n=>n.remove());const originals=document.querySelectorAll('canvas');root.querySelectorAll('canvas').forEach((c,i)=>{const im=document.createElement('img');im.src=originals[i].toDataURL();im.setAttribute('alt','统计图表');im.style.cssText='max-width:100%;width:'+originals[i].style.width+';height:'+originals[i].style.height;c.replaceWith(im)});root.querySelectorAll('button').forEach(b=>b.removeAttribute('disabled'));return root.innerHTML});
 const body=s.slice(s.indexOf('<body>')+6,s.lastIndexOf('</body>'));const scripts=body.match(/<script\b[^>]*>[\s\S]*?<\/script>/g)||[];const markup=body.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'');
 const boot='<script id="interactive-hydration">document.body.innerHTML=new TextDecoder().decode(Uint8Array.from(atob("'+Buffer.from(markup).toString('base64')+'"),c=>c.charCodeAt(0)));</script>';
 const nojs='<noscript><style>.view{display:block!important;margin-top:40px}#nav,.case-tools,button{display:none!important}.static-full-text{max-width:1372px;margin:30px auto;padding:20px;color:#f5faff;line-height:1.8}.static-full-text article{margin:25px 0;border-top:1px solid #52718b;padding-top:20px}</style><section class="static-full-text"><h2>法院专题与完整案件档案</h2>'+appendix.join('')+'</section></noscript>';
 const title=s.slice(0,s.indexOf('<body>')).replace('<title>美国批量侵权诉讼行业风险看板｜V1.2 分析重写版</title>','<title>美国批量侵权诉讼行业风险看板｜V1.2 分析重写版</title>');
 const baked=title+'<body>'+fallback+nojs+boot+scripts.join('')+'</body></html>';
 fs.writeFileSync('advanced/index.html',baked);fs.mkdirSync('versions/v1.2',{recursive:true});fs.writeFileSync('versions/v1.2/index.html',baked);
 fs.copyFileSync('advanced/index.html','exports/index_v12.html');
 console.log(JSON.stringify({errors,chapters:7,dossiers:31,bytes:Buffer.byteLength(baked)}));await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
