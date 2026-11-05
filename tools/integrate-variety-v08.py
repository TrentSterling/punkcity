"""Integrate architecture variety against the verified 0.7 source revision."""
from pathlib import Path
from hashlib import sha1
R=Path(__file__).resolve().parent.parent
expected={'citylab.js':'fa119cb8dad9fa25d640b0cd4dd065fd9d7bed05','scifi.js':'a7e7dd91094a17843db136ea6046a5a7f5f2aa2f','urbanism.js':'42c5f2ec7b8a771273add566f1972e4cf9fecfe9','districts.js':'9e25341020862841d9836894aeab97060c2debf8','prop-kit.js':'a5a737c23bc561f9f52ea703d33882b78fff9741'}
for f,want in expected.items():
 b=(R/f).read_bytes();got=sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest();assert got==want,(f,got,'Unexpected source; refusing stale patch')
s=(R/'urbanism.js').read_text().replace("import {createScifiKit} from './scifi.js';","import {createScifiKit} from './scifi.js';\nimport {configureArchitecture} from './architecture.js';")
s=s.replace("export const URBAN_REVISION='0.6.0';","export const URBAN_REVISION='0.8.0';").replace('  return city;\n}', '  return configureArchitecture(city);\n}',1)
s=s.replace("m.top===LEVEL?'deck':'dark');","m.top===LEVEL?'deck':'dark',true,(m.design.seed%10000)*5+m.design.facade);")
(R/'urbanism.js').write_text(s)
s=(R/'scifi.js').read_text().replace("import * as THREE from 'three';","import * as THREE from 'three';\nimport {paletteFor} from './architecture.js';\nimport {compileMassing} from './massing.js';")
a=s.index(' function tower(t,b,r){');e=s.index('\n function podium(m,b){',a)
s=s[:a]+" function tower(t,b,r){return compileMassing({B,shell,band,casing,screen,plant},t,b,records);}\n"+s[e:]
s=s.replace('const p=PALETTES[b.district],x=m.x','const p=paletteFor(m,b),x=m.x').replace('const p=PALETTES[b.district],n=Math','const p=paletteFor(m,b),n=Math').replace('const p=PALETTES[b.district],north=','const p=paletteFor(b.masses[0],b),north=')
s=s.replace('armorSilver:0x819799}', 'armorSilver:0x819799,armorCopper:0x976b48,armorSage:0x798773,armorBrick:0x8e4f3f,armorSlate:0x506678,armorTaupe:0x7d7061,armorGraphite:0x39454a,armorIce:0x91acb2}')
s=s.replace('band(x,z,w,d,m.top-1.25,1.35,p.armor,.5);',"band(x,z,w,d,m.top-.75,.7,m.design?.band===1?p.edge:p.armor,.38);").replace('band(x,z,w,d,5.5,.65,p.edge,.42);','if(m.top>10)band(x,z,w,d,5.5,.3,p.edge,.25);')
s=s.replace('float id=floor(cSeed+.5),identity=', 'float id=floor(cSeed+.5),style=mod(floor(cSeed+.5),5.),identity=')
s=s.replace('vec3 hull=diffuseColor.rgb;', 'vec3 hull=diffuseColor.rgb;\nvec2 aperture=${aperture};if(style<.5)aperture=vec2(.42,.16);else if(style<1.5)aperture=vec2(.20,.30);else if(style<2.5)aperture=vec2(.35,.24);else if(style<3.5)aperture=vec2(.40,.08);')
s=s.replace('${aperture}+vec2(.036,.035)','aperture+vec2(.036,.035)').replace('${aperture},.027','aperture,.027').replace('))/${aperture}', '))/aperture').replace("const records={revision:'0.6.0'","const records={revision:'0.8.0'")
(R/'scifi.js').write_text(s)
s=(R/'prop-kit.js').read_text().replace("import {PALETTES} from './scifi.js';","import {paletteFor} from './architecture.js';").replace('palette=PALETTES[p.district]','palette=paletteFor(p)');(R/'prop-kit.js').write_text(s)
s="import {auditArchitecture} from './architecture.js';\n"+(R/'districts.js').read_text()
s=s.replace("roof='dark',solid=true){","roof='dark',solid=true,identity=null){").replace('.fill(Math.round(((x*31+z*13+h*7)%991+991)%991))','.fill(identity??Math.round(((x*31+z*13+h*7)%991+991)%991))')
s=s.replace('const streetAudit=auditStreets(compiled.streets);','const architecture=auditArchitecture(data);errors.push(...architecture.errors);const streetAudit=auditStreets(compiled.streets);').replace('return{...urban,streets:streetAudit','return{...urban,architecture,streets:streetAudit');(R/'districts.js').write_text(s)
s=(R/'citylab.js').read_text().replace("const VERSION='0.7.0'","const VERSION='0.8.0'").replace('CITYLAB 0.7 /','CITYLAB 0.8 /')
tour="""let buildingView=0;
function visitBuilding(n=buildingView+1){
 const towers=recipe.blocks.flatMap(b=>b.towers),used=new Set(),first=towers.filter(t=>{if(used.has(t.design.family))return false;used.add(t.design.family);return true;}),rest=towers.filter(t=>!first.includes(t)),all=[...first,...rest];
 buildingView=(n+all.length)%all.length;const t=all[buildingView],h=t.top-t.base;
 player.mode='fly';player.grapple=null;player.velocity.set(0,0,0);config.layer='all';config.clay=false;applyAppearance();
 camera.position.set(t.x+t.w*1.3+12,t.base+h*.48,t.z+t.d+35);camera.lookAt(t.x,t.base+h*.48,t.z);yaw=camera.rotation.y;pitch=camera.rotation.x;
 infillViewName=t.design.family.toUpperCase()+' / '+t.design.paletteName;hudDirty=true;return t;
}
"""
s=s.replace('function setView(which){',tour+'\nfunction setView(which){').replace("case'KeyC':visitStreet();", "case'KeyM':visitBuilding(e.shiftKey?buildingView-1:buildingView+1);break;case'KeyC':visitStreet();")
s=s.replace("'C             Street inspection'","'M / Shift+M   Building tour / previous','C             Street inspection'").replace('C streets / K new places','M buildings / C streets / K new places')
s=s.replace('streets:compiled?.streets?', 'architecture:recipe?.architecture,streets:compiled?.streets?').replace('getCompiled:()=>compiled,visitInfill,visitStreet','getCompiled:()=>compiled,visitInfill,visitBuilding,visitStreet')
(R/'citylab.js').write_text(s)
for f in ['index.html','build_standalone.py']:
 s=(R/f).read_text().replace('0.7','0.8');(R/f).write_text(s)
# The new footprint/height pass intentionally regenerates infill. Keep access and
# population tests, replacing only obsolete exact 0.6 population snapshot checks.
p=R/'test-streets.mjs';s=p.read_text();s=s.replace("assert.equal(f.compiled.infill.placements.length,688,'Street work must preserve default infill');","assert(f.compiled.infill.placements.length>=600,'Massing variety must retain populated streets');");p.write_text(s)
p=R/'test-neighborhoods.mjs';s=p.read_text().replace("assert.equal(p.filter(p=>!p.newContent).length,268,'The previous infill population must be retained');","assert(p.filter(p=>!p.newContent).length>=200,'Retain substantial original infill alongside new lot shapes');");p.write_text(s)
# Stable metric predicates fix tolerance amplification on tiny clipping edges.
p=R/'surface-ownership.js';s=p.read_text()
s=s.replace("const area=p=>Math.abs(p.reduce((s,a,i)=>{const b=p[(i+1)%p.length];return s+a[0]*b[1]-a[1]*b[0];},0))*.5;", "const area=p=>p.length<3?0:Math.abs(p.slice(1,-1).reduce((s,a,i)=>s+cross(p[0],a,p[i+2]),0))*.5;")
s=s.replace(' const out=[];let prev=p[p.length-1],dp=cross(a,b,prev)*(inside?1:-1),pin=dp>=-EPS;', ' const length=Math.hypot(b[0]-a[0],b[1]-a[1]);if(length<EPS)return p;\n const distance=v=>cross(a,b,v)*(inside?1:-1)/length;\n const out=[];let prev=p[p.length-1],dp=distance(prev),pin=dp>=-EPS;').replace('const dc=cross(a,b,cur)*(inside?1:-1),cin=dc>=-EPS;','const dc=distance(cur),cin=dc>=-EPS;')
p.write_text(s)
p=R/'qa-v07.cjs';s=p.read_text().replace('0.7.0','0.8.0').replace('v0.7','v0.8').replace('qa-v07','qa-v08');(R/'qa-v08.cjs').write_text(s)
print('Integrated 0.8 massing, per-building palettes, facade identity and inspection tour.')
