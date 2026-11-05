"""One-time 0.8-to-0.9 integration. Refuse unknown source; leave the street plan untouched."""
from pathlib import Path
import hashlib
root=Path(__file__).resolve().parent.parent
expected={'districts.js':'c5eee7b909b8ca99c1c4ef994ec14d26145ca520149cb42ebcbc7c62bea8617e','citylab.js':'7e901cbeb001d7d77a0b0f73356c3461aea7e8774d227a94c9b24472245a7a42','geometry-batch.js':'a1acfd0778e25de968d3243fdbab563bf844d0820e9f1a6743ff3e46cdca097e','index.html':'61bdc255b763b7f4f2c7a3e198a9f84baac42d5277942563525233b030b5906a','build_standalone.py':'6c270918d7cac3779c37d4933122d5a60b5db51f5d4a0a5331fe17056a276bc7'}
if "const VERSION='0.9.0'" in (root/'citylab.js').read_text():
 print('Integration already applied');raise SystemExit(0)
for f,digest in expected.items():
 assert hashlib.sha256((root/f).read_bytes()).hexdigest()==digest,'Unexpected preimage: '+f

def apply(f,old,new):
 p=root/f;s=p.read_text();assert s.count(old)==1,(f,old[:80],s.count(old));p.write_text(s.replace(old,new))
apply('districts.js',"import {generateNeighborhoods}","import {installRetrofitMaterials,planRetrofit,compileRetrofit} from './retrofit.js';\nimport {generateNeighborhoods}")
apply('districts.js','  installScifiMaterials(mats,surface);','  installScifiMaterials(mats,surface);installRetrofitMaterials(mats);')
apply('districts.js','  return {ground,decks,buildings,artifacts,urban,infill,streets};',"  const retro=planRetrofit(data,{urban,infill},B.items||[]);\n  if(B.scope)compileRetrofit(buildApi,createScifiKit(buildApi,data),retro);\n  return {ground,decks,buildings,artifacts,urban,infill,streets,retro};")
apply('districts.js','const architecture=auditArchitecture(data);',"if(compiled.retro&&!compiled.retro.audit.ok)errors.push('Retrofit reservation conflict');const architecture=auditArchitecture(data);")
apply('geometry-batch.js',"'signage','context'","'signage','retrofit','context'")
apply('geometry-batch.js',"'adScreen','asphalt'","'adScreen','retroDisplay','asphalt'")
apply('citylab.js','infill:true,detail:true','infill:true,retrofit:true,detail:true')
apply('citylab.js',"&&(config.infill||!['frontage','services','rooftops'].includes(layer))","&&(config.infill||!['frontage','services','rooftops'].includes(layer))&&(config.retrofit||layer!=='retrofit')")
apply('citylab.js','function setView(which)',"""let retrofitView=0;
function visitRetrofit(n=retrofitView+1){
 const all=compiled.retro.placements.filter(p=>p.type!=='cable-bundle').sort((a,b)=>Number(b.block.startsWith('2,'))-Number(a.block.startsWith('2,'))||a.y-b.y);
 const unique=[...new Map(all.map(p=>[p.type,p])).values()],entries=[...unique,...all.filter(p=>!unique.includes(p))];
 retrofitView=((n%entries.length)+entries.length)%entries.length;const p=entries[retrofitView];if(!p)return null;
 player.mode='fly';player.grapple=null;config.layer='all';config.clay=false;config.retrofit=true;applyAppearance();
 const s=Math.sin(p.rot),c=Math.cos(p.rot),reach=p.type==='blade-sign'?12:16;
 camera.position.set(p.x+c*5+s*reach,p.y+3.8,p.z-s*5+c*reach);camera.lookAt(p.x+s,p.y+1.5,p.z+c);yaw=camera.rotation.y;pitch=camera.rotation.x;
 infillViewName='RETROFIT / '+p.type.toUpperCase();hudDirty=true;return p;
}
function setView(which)""")
apply('citylab.js','infill:compiled?.infill?.audit,','infill:compiled?.infill?.audit,retrofit:compiled?.retro?.audit,')
apply('citylab.js','infill:compiled.infill.placements,surfaceReport:','infill:compiled.infill.placements,retrofit:compiled.retro.packed,surfaceReport:')
apply('citylab.js',"switch(e.code){case'KeyM':","switch(e.code){case'KeyX':visitRetrofit(e.shiftKey?retrofitView-1:retrofitView+1);break;case'KeyZ':player.mode='fly';config.retrofit=!config.retrofit;applyAppearance();say('Cyberpunk retrofits '+(config.retrofit?'on':'off'));break;case'KeyM':")
apply('citylab.js',"'I / Shift+I   Isolate generator / all'","'X / Z         Retrofit tour / A-B toggle','I / Shift+I   Isolate generator / all'")
apply('citylab.js','M buildings / C streets / K new places','X retrofits / Z A-B / M buildings / C streets / K places')
apply('citylab.js','visitInfill,visitBuilding,visitStreet,setLayer,','visitInfill,visitBuilding,visitStreet,visitRetrofit,setRetrofit:v=>{config.retrofit=!!v;applyAppearance();},setLayer,')
for f in ['citylab.js','index.html','build_standalone.py']:
 p=root/f;s=p.read_text().replace('0.8.0','0.9.0').replace('CITYLAB 0.8','CITYLAB 0.9').replace('Citylab 0.8','Citylab 0.9').replace('Citylab-v0.8','Citylab-v0.9');p.write_text(s)
# Retain the previous full viewer regression against this revision.
p=root/'qa-v08.cjs';s=p.read_text().replace('0.8.0','0.9.0').replace('qa-v08','qa-v09').replace('Citylab-v0.8','Citylab-v0.9');(root/'qa-v09.cjs').write_text(s)
p=root/'tools/smoke-live.cjs';s=p.read_text().replace('qa-v08','qa-v09');s=s.replace("const files=[","const files=['retrofit.js',",1);p.write_text(s)
p=root/'README.md';s=p.read_text().replace('Punkcity 0.8','Punkcity 0.9').replace('Citylab-v0.8','Citylab-v0.9');s+='\n\n0.9 adds facade-mounted galleries, capsule bays, cooling risers, projecting signs and cable bundles. X tours the retrofit layer; Z toggles it for comparison. See RELEASE_09.md and THREEJSPUNK-STUDY.md.\n';p.write_text(s)
print('Integrated deterministic facade retrofit layer and retained existing regression suite.')
