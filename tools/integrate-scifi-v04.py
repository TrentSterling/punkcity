"""Source-checked integration of the sci-fi architecture iteration."""
from pathlib import Path
from hashlib import sha1
R=Path(__file__).resolve().parents[1]
expected={'citylab.js':'e78149a3e5c092a83d6a50a836d29d31f20b2163','districts.js':'2befb1c35a25529df240b2bb3b9df57c33d5c2a9','urbanism.js':'57416c9620694b9c39987ae09b968d29f1aef44f','facades.js':'b850830b05d90433e5e146e217bc9176c0685720'}
for name,sha in expected.items():
 b=(R/name).read_bytes();assert sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest()==sha,'Unexpected source '+name
p=R/'urbanism.js';s=p.read_text();s=s.replace("import * as THREE from 'three';","import * as THREE from 'three';\nimport {createScifiKit} from './scifi.js';").replace("URBAN_REVISION='0.3.0'","URBAN_REVISION='0.4.0'")
s=s.replace('const records={entrances:', 'const sci=createScifiKit(api,city);\n  const records={entrances:')
a=s.index('  function shop(m,b){');b=s.index('  function podium(',a);s=s[:a]+'  function shop(m,b){sci.shops(m,b);}\n'+s[b:]
a=s.index('  function tower(t,b,r){');b=s.index('  function loadingDock(',a)
s=s[:a]+"  function tower(t,b,r){sci.tower(t,b,r);records.roofs.push({building:t.id,y:t.top,x:t.x,z:t.z,w:t.w,d:t.d});}\n"+s[b:]
s=s.replace('b.masses.forEach(m=>podium(m,b));','b.masses.forEach(m=>{podium(m,b);sci.podium(m,b);});')
s=s.replace('switchback(b);court(b,r);','switchback(b);court(b,r);sci.extras(b);')
s=s.replace('  return records;','  records.scifi=sci.records;\n  return records;')
p.write_text(s)
p=R/'districts.js';s=p.read_text();s=s.replace("import * as THREE from 'three';","import * as THREE from 'three';\nimport {installScifiMaterials} from './scifi.js';")
s=s.replace("version:'0.3.0'","version:'0.4.0'")
a=s.index('  mats.paint=');b=s.index('\n}',a);s=s[:b]+ '\n  installScifiMaterials(mats,surface);'+s[b:]
s=s.replace("len/(mat==='facGlass'?2.8:3.2)","len/(mat==='facGlass'?5.8:5.4)").replace('Math.round(h/3.3)','Math.round(h/7)')
a=s.index('    // Physical sill profiles');b=s.index('    B.structures++;',a);s=s[:a]+s[b:]
p.write_text(s)
p=R/'citylab.js';s=p.read_text();s=s.replace("import {setFacadeNight} from './facades.js';","import {setFacadeNight} from './facades.js';\nimport {setScifiNight} from './scifi.js';")
s=s.replace("VERSION='0.3.0'","VERSION='0.4.0'").replace('CITYLAB 0.3 / ','CITYLAB 0.4 / ')
s=s.replace('setFacadeNight(t===2);','setFacadeNight(t===2);setScifiNight(t===2);')
s=s.replace('scene.fog.density=.00145','scene.fog.density=.0007').replace('scene.fog.color.set(0x95acb8)','scene.fog.color.set(0xb9b2a6)')
s=s.replace('hemi.intensity=1.45','hemi.intensity=1.25').replace('sun.color.set(0xffd3a0)','sun.color.set(0xffdfb5)').replace('sun.intensity=3.55','sun.intensity=3.15')
s=s.replace('skyMat.uniforms.top.value.set(0x527d96)','skyMat.uniforms.top.value.set(0x47748e)').replace('skyMat.uniforms.horizon.value.set(0xb8c6c9)','skyMat.uniforms.horizon.value.set(0xd7c3a9)')
s=s.replace('p:[-6,3.1,30],look:[-27,22,-25]','p:[-6,5.3,30],look:[-27,22,-25]')
s=s.replace('version:VERSION,seed:config.seed,districts:', 'version:VERSION,seed:config.seed,scifi:compiled?.urban?.scifi,districts:')
p.write_text(s)
p=R/'index.html';p.write_text(p.read_text().replace('0.3','0.4'))
p=R/'build_standalone.py';p.write_text(p.read_text().replace('0.3','0.4'))
p=R/'qa-v03.cjs';s=p.read_text().replace('qa-v03','qa-v04').replace('v0.3.html','v0.4.html');(R/'qa-v04.cjs').write_text(s)
p=R/'test-urbanism.mjs';s=p.read_text().replace('qa-v03','qa-v04').replace("revision:'0.3.0'","revision:'0.4.0'");(R/'test-scifi.mjs').write_text(s)
print('Integrated armored city kit while preserving v0.3 ground and upper-route plans.')
