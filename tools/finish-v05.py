from pathlib import Path
p=Path('citylab.js');s=p.read_text();assert "const VERSION='0.5.0'" in s
if 'function visitInfill' not in s:
 s=s.replace('function setView(which){','let infillViewIndex=-1,infillViewName=null;\nfunction visitInfill(which=infillViewIndex+1){const entries=compiled.infill.placements.filter(p=>p.layer===\'frontage\').sort((a,b)=>Number(b.district===4)-Number(a.district===4));if(!entries.length)return null;infillViewIndex=((which%entries.length)+entries.length)%entries.length;const p=entries[infillViewIndex],c=Math.cos(p.rot),s=Math.sin(p.rot);setLayer(\'all\');config.infill=true;config.clay=false;config.detail=true;applyAppearance();player.mode=\'fly\';player.grapple=null;camera.position.set(p.x+c*4.5+s*10,p.y+5,p.z-s*4.5+c*10);camera.lookAt(p.x,p.y+1.8,p.z);yaw=camera.rotation.y;pitch=camera.rotation.x;infillViewName=DISTRICTS[p.district].short+\' / \'+p.type;hudDirty=true;return p;}\nfunction setView(which){infillViewName=null;')
 s=s.replace('views[viewIndex].name.toUpperCase()', '(infillViewName||views[viewIndex].name).toUpperCase()')
 s=s.replace("case'KeyI':", "case'KeyK':visitInfill();break;case'KeyI':")
 s=s.replace("case'KeyU':config.infill=!config.infill;", "case'KeyU':player.mode='fly';player.grapple=null;config.infill=!config.infill;")
 s=s.replace("'U             Toggle infill layers'", "'U / K         Infill toggle / close tour'")
 s=s.replace('U infill   /   B next district', 'U infill / K shops   /   B districts')
 s=s.replace('getCompiled:()=>compiled,setLayer,', 'getCompiled:()=>compiled,visitInfill,setLayer,')
 s=s.replace('version:VERSION,seed:config.seed,scifi:', 'version:VERSION,seed:config.seed,layer:config.layer,infill:compiled?.infill?.audit,surfaceRepair:B?.surfaceReport,scifi:')
 s=s.replace('compiledArchitecture:compiled.buildings,settings:', 'compiledArchitecture:compiled.buildings,infill:compiled.infill.placements,surfaceReport:B.surfaceReport,settings:')
 s=s.replace('collision.filter(c=>c.min.x>-160&&c.max.x<160&&c.min.z>-160&&c.max.z<160).map', 'collision.map')
 p.write_text(s)
p=Path('test-infill.mjs');s=p.read_text();old='const {city,compiled,audit,boxes}=f;f.dispose();'
if old in s:
 s=s.replace(old,"""const {city,compiled,audit,boxes}=f;const byId=new Map(compiled.infill.placements.map(p=>[p.id,p]));const escapes=[];
for(const item of f.B.items){const p=byId.get(item.owner);if(!p)continue;item.geometry.computeBoundingBox();const b=item.geometry.boundingBox;
 const excess=Math.max(p.x-p.w/2-b.min.x,b.max.x-p.x-p.w/2,p.z-p.d/2-b.min.z,b.max.z-p.z-p.d/2,p.y-b.min.y,b.max.y-p.top);
 if(excess>.01)escapes.push({id:p.id,excess});}
audit.infillCount=byId.size;audit.infillEnvelopeEscapes=escapes;audit.ok=audit.ok&&!escapes.length;f.dispose();""")
 p.write_text(s)
p=Path('qa-v05.cjs');s=p.read_text()
s=s.replace("  await page.evaluate(()=>citylab.setLayer('all'));", "  await page.evaluate(()=>{citylab.setLayer('all');citylab.lighting(0);});")
a=s.index('  const focus=');b=s.index('  report.regeneration=[];',a)
s=s[:a]+"""  report.closeViews=[];
  for(let n=0;n<3;n++){
   const place=await page.evaluate(n=>{const p=citylab.visitInfill(n);window.__frame(performance.now());return p;},n);
   if(!place)throw Error('No frontage tour target');report.closeViews.push(place);
   await page.screenshot({path:out+'/infill-close-'+n+'.png',timeout:45000});
  }
  await page.keyboard.press('KeyU');if(await page.evaluate(()=>citylab.config.infill))throw Error('U toggle failed');
  await page.keyboard.press('KeyK');if(!await page.evaluate(()=>citylab.config.infill))throw Error('K tour did not restore infill');
"""+s[b:]
p.write_text(s)
