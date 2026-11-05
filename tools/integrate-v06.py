"""One-time v0.5 -> v0.6 integration; assert the expected preimage before editing."""
from pathlib import Path
import hashlib
R=Path(__file__).resolve().parent.parent
p=R/'citylab.js';assert hashlib.sha256(p.read_bytes()).hexdigest()=='c07abd6560466dca203916fc8cc6d0654551bfcf7ec1099e65cd823c139acd33','Renderer changed; refusing stale integration'
for name in ['frontage.js','street-services.js','roof-services.js']:
 p=R/name;s=p.read_text();s="import {generateNeighborhoodProp} from './neighborhood-props.js';\n"+s;s=s.replace("p.id,()=>{", "p.id,()=>{\n  if(generateNeighborhoodProp(api,sci,p))return;");p.write_text(s)
p=R/'districts.js';p.write_text(p.read_text().replace('B.items||[]);','B.items||[],api.infillOptions||{});'))
p=R/'tools/compile-fixture.mjs';s=p.read_text().replace('height=1){','height=1,infillOptions={}){').replace('{B,mats,sign,rail,pipe,indexCollider:','{B,mats,sign,rail,pipe,infillOptions,indexCollider:');p.write_text(s)
for n in ['citylab.js','urbanism.js','scifi.js','index.html','build_standalone.py']:
 p=R/n;p.write_text(p.read_text().replace('0.5.0','0.6.0').replace('Citylab-v0.5','Citylab-v0.6').replace('CITYLAB 0.5','CITYLAB 0.6').replace('Citylab 0.5','Citylab 0.6'))
p=R/'citylab.js';s=p.read_text();s="import {INFILL_CATALOG} from './infill-catalog.js';\n"+s
s=s.replace('infill:true,detail:',"infill:true,density:['balanced','busy','packed'].includes(url.searchParams.get('density'))?url.searchParams.get('density'):'busy',detail:")
s=s.replace('compileDistricts({B,mats,sign,rail,pipe,indexCollider}','compileDistricts({B,mats,sign,rail,pipe,indexCollider,infillOptions:{density:config.density}}')
s=s.replace('layer:config.layer,infill:','layer:config.layer,density:config.density,infill:')
s=s.replace('U infill / K shops','U infill / K shops / M density: ${config.density}')
s=s.replace("'U / K         Infill toggle / close tour',","'U / K         Infill toggle / close tour','M             Neighbourhood density',").replace('338,440','338,460')
s=s.replace("case'KeyK':visitInfill();","case'KeyM':setDensity(['balanced','busy','packed'][(['balanced','busy','packed'].indexOf(config.density)+1)%3]);break;case'KeyK':visitInfill();")
a=s.index('function visitInfill(');e=s.index('\nfunction setView',a)
s=s[:a]+'''function setDensity(value){if(!['balanced','busy','packed'].includes(value))throw Error('Invalid density');config.density=value;player.mode='fly';player.grapple=null;const result=regenerate();say('Neighbourhood density: '+value+' / '+result.infill.placements+' assemblies');return result;}
function visitInfill(which=infillViewIndex+1){
 const all=compiled.infill.placements.filter(p=>p.layer==='frontage').sort((a,b)=>Number(b.district===4)-Number(a.district===4));
 const types=new Set(),unique=[],rest=[];for(const p of all){if(types.has(p.type))rest.push(p);else{types.add(p.type);unique.push(p);}}
 const entries=[...unique,...rest];if(!entries.length)return null;
 let p;if(typeof which==='string'){p=compiled.infill.placements.find(p=>p.type===which);if(!p)return null;}else{infillViewIndex=((which%entries.length)+entries.length)%entries.length;p=entries[infillViewIndex];}
 const c=Math.cos(p.rot),s=Math.sin(p.rot);setLayer('all');config.infill=true;config.clay=false;config.detail=true;applyAppearance();player.mode='fly';player.grapple=null;
 camera.position.set(p.x+c*4.7+s*9,p.y+4.7,p.z-s*4.7+c*9);camera.lookAt(p.x,p.y+1.7,p.z);yaw=camera.rotation.y;pitch=camera.rotation.x;
 infillViewName=DISTRICTS[p.district].short+' / '+(INFILL_CATALOG[p.type]?.name||p.type);hudDirty=true;return p;
}
'''+s[e:]
s=s.replace('visitInfill,setLayer,layers','visitInfill,setDensity,setLayer,layers')
s=s.replace("next.searchParams.set('seed',config.seed);","next.searchParams.set('seed',config.seed);next.searchParams.set('density',config.density);")
p.write_text(s)
for n in ['test-infill.mjs','test-surfaces.mjs','test-grounding.mjs']:
 p=R/n;p.write_text(p.read_text().replace('qa-v05','qa-v06').replace('0.5.0','0.6.0'))
s=(R/'qa-v05.cjs').read_text().replace('qa-v05','qa-v06').replace('0.5.0','0.6.0').replace('Citylab-v0.5','Citylab-v0.6').replace('450000','570000')
pos=s.index('  report.regeneration=[];')
s=s[:pos]+'''  report.catalogViews=[];
  for(const type of ['noodlebar','clinic','arcade','florist','droneworks','coffeebar','bikedock','greenhouse','maptable','laundry']){
   const item=await page.evaluate(type=>{citylab.setHUD(false);const p=citylab.visitInfill(type);window.__frame(performance.now());return p;},type);
   if(!item)throw Error('Missing catalog sample: '+type);report.catalogViews.push(item);
   await page.screenshot({path:out+'/'+type+'.png',timeout:45000});
  }
  const basePlan=await page.evaluate(()=>JSON.stringify(citylab.getRecipe()));report.density=[];
  for(const density of ['balanced','packed','busy']){
   await page.evaluate(d=>{citylab.setDensity(d);window.__frame(performance.now());},density);
   if(basePlan!==await page.evaluate(()=>JSON.stringify(citylab.getRecipe())))throw Error('Density changed street/building layout');
   report.density.push({density,...await page.evaluate(()=>citylab.stats().infill)});
  }
  if(report.density[0].placements>=report.density[1].placements)throw Error('Density presets have no effect');
  await page.keyboard.press('KeyM');if(await page.evaluate(()=>citylab.config.density)!=='packed')throw Error('M density control failed');await page.evaluate(()=>citylab.setDensity('busy'));
'''+s[pos:]
(R/'qa-v06.cjs').write_text(s)
print('Integrated v0.6 neighbourhood expansion')
