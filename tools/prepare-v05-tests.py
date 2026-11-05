from pathlib import Path
s=Path('test-scifi.mjs').read_text();a=s.index('const cache=');b=s.index('const results=[]');s=s[:a]+"import {compileFixture} from './tools/compile-fixture.mjs';\nfunction compile(seed,height=1){globalThis.gc?.();const f=compileFixture(seed,height);const {city,compiled,audit,boxes}=f;f.dispose();return{city,compiled,audit,boxes};}\n"+s[b:];s=s.replace("revision:'0.4.0'","revision:'0.5.0'").replace("'qa-v04'","'qa-v05'");Path('test-infill.mjs').write_text(s)
s=Path('qa-v04.cjs').read_text().replace('qa-v04','qa-v05').replace('v0.4.html','v0.5.html').replace('330000','450000')
needle='  report.regeneration=[];'
insert="""  report.isolation=[];const planBefore=await page.evaluate(()=>JSON.stringify(citylab.getRecipe()));
  for(const layer of ['frontage','services','rooftops','traversal','armor']){
   await page.evaluate(layer=>{citylab.setView(1);citylab.setLayer(layer);window.__frame(performance.now());},layer);
   const visible=await page.evaluate(()=>{const a=[];citylab.scene.traverse(o=>{if(o.isMesh&&o.visible&&o.userData.layer)a.push(o.userData.layer);});return [...new Set(a)];});
   report.isolation.push({layer,visible});if(visible.some(x=>x!==layer))throw Error('Generator isolation leak: '+layer);
   await page.screenshot({path:out+'/isolate-'+layer+'.png',timeout:45000});
  }
  await page.evaluate(()=>citylab.setLayer('all'));
  if(planBefore!==await page.evaluate(()=>JSON.stringify(citylab.getRecipe())))throw Error('Layer selection changed recipe');
  const focus=await page.evaluate(()=>citylab.getCompiled().infill.placements.find(p=>p.type==='microshop'&&p.district===4)||citylab.getCompiled().infill.placements.find(p=>p.type==='vendor'));
  if(!focus)throw Error('No frontage generated');
  await page.evaluate(p=>{citylab.setCamera([p.x+13,9,p.z+18],[p.x,2,p.z]);window.__frame(performance.now());},focus);
  await page.screenshot({path:out+'/infill-close.png',timeout:45000});
"""
assert needle in s;s=s.replace(needle,insert+needle)
s=s.replace("report.offline={errors:offErrors,version:await offline.evaluate(()=>citylab.version)};", "report.offline={errors:offErrors,version:await offline.evaluate(()=>citylab.version)};if(report.version!=='0.5.0'||report.offline.version!=='0.5.0')throw Error('Version mismatch');")
Path('qa-v05.cjs').write_text(s)
