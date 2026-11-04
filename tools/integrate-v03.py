"""One-time source-checked integration of the urbanism and facade modules."""
from pathlib import Path
from hashlib import sha1
root=Path(__file__).resolve().parent.parent
for name,expected in {'districts.js':'62a15ea0070d1859e1e3a607184c313abd3712be','citylab.js':'9b8d2b7676bc2a3668354e05bd9c5263e0642be3'}.items():
 b=(root/name).read_bytes();assert sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest()==expected,'Source changed: '+name
s=(root/'districts.js').read_text()
s=s.replace("import * as THREE from 'three';", "import * as THREE from 'three';\nimport {planUrbanism, compileUrbanism, auditUrbanism} from './urbanism.js';\nimport {facadeMaterial} from './facades.js';")
a=s.index('function facadeMaterial(');e=s.index('export function addDistrictMaterials',a);s=s[:a]+s[e:]
s=s.replace("return {version:'0.2.0'", "return planUrbanism({version:'0.3.0'").replace("Equipment does not change layout.'};", "Equipment does not change layout.'});")
a=s.index('  function deck(b)');e=s.index('  function streetGrid()',a);s=s[:a]+s[e:]
a=s.index('  function crown(b,r)');e=s.index('\nexport function auditDistricts',a)
s=s[:a]+'''  streetGrid();
  const urban=compileUrbanism({B,shell,flat,slab,roofkit,plant,tree,sign,rail,pipe,indexCollider,addGeo},data);
  return {ground,decks,buildings,artifacts,urban};
}
'''+s[e:]
s=s.replace("const addGeo=(g,mat)=>{", "const addGeo=(g,mat)=>{if(!g.attributes.facadeSeed)g.setAttribute('facadeSeed',new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count),1));")
s=s.replace("g.computeVertexNormals();addGeo(g,mat);", "g.computeVertexNormals();g.setAttribute('facadeSeed',new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count).fill(((x*31+z*13+h*7)%991+991)%991),1));addGeo(g,mat);")
s=s.replace("bay=Math.max(1,Math.round(len/(mat==='facGlass'?2.6:3.1)))", "bay=len<2.4?0:Math.max(1,Math.round(len/(mat==='facGlass'?2.8:3.2)))")
s=s.replace("base<.6 && h>8", "h>8")
s=s.replace("mat==='facGlass'?.09:.23", "mat==='facGlass'?.065:.16").replace("k+=mat==='facGlass'?1:2", "k+=mat==='facGlass'?3:3")
s=s.replace("for(let row=1;row<nr;row++)", "for(let row=1;row<nr;row+=mat==='facGlass'?1:2)")
s=s.replace("return{ok:!errors.length,errors,ownedSurfaces:","const urban=auditUrbanism(data,compiled);errors.push(...urban.errors);return{...urban,ok:!errors.length,errors,ownedSurfaces:")
s=s.replace('HACKERPUNK 0.2:', 'HACKERPUNK 0.3:');(root/'districts.js').write_text(s)
s=(root/'citylab.js').read_text()
s=s.replace("import * as THREE from 'three';", "import * as THREE from 'three';\nimport {setFacadeNight} from './facades.js';")
s=s.replace("const VERSION='0.2.0'", "const VERSION='0.3.0'").replace("CITYLAB 0.2 / ", "CITYLAB 0.3 / ")
s=s.replace('const t=config.lighting;if(t===0)', 'const t=config.lighting;setFacadeNight(t===2);if(t===0)')
s=s.replace('skyMat.uniforms.horizon.value.set(0xd7c4a8)', 'skyMat.uniforms.horizon.value.set(0xb8c6c9)').replace('scene.fog.color.set(0x96a7aa)','scene.fog.color.set(0x95acb8)')
s=s.replace('scene.fog.density=.0009', 'scene.fog.density=.00145').replace('skyMat.uniforms.top.value.set(0x477a94)','skyMat.uniforms.top.value.set(0x527d96)').replace('hemi.intensity=1.05','hemi.intensity=1.45')
s=s.replace('const W=hudCanvas.width=innerWidth,H=hudCanvas.height=innerHeight;', 'const W=innerWidth,H=innerHeight;if(hudCanvas.width!==W||hudCanvas.height!==H){hudCanvas.width=W;hudCanvas.height=H;}')
s=s.replace('buildings:compiled?.buildings.length,blocks:', 'buildings:compiled?.buildings.length,upperPlazas:recipe?.routeGraph?.nodes.length,stairs:compiled?.urban?.stairs.length,blocks:')
a=s.index('const views=[');e=s.index('\nlet districtView',a)
s=s[:a]+'''const views=[
{name:'Civic avenue',p:[-6,3.1,30],look:[-27,22,-25]},
{name:'District overview',p:[318,255,370],look:[0,25,0]},
{name:'Upper market street',p:[-13,18.1,110],look:[-60,20,110]},
{name:'Foundry loading court',p:[-172,5,-145],look:[-207,10,-184]},
{name:'Corporate Crown',p:[12,32,8],look:[42,59,-41]},
{name:'Relay service street',p:[163,4,-78],look:[121,24,-114]},
{name:'The Stacks',p:[-172,4,103],look:[-217,20,107]},
{name:'Market court',p:[-46,3,142],look:[-46,13,108]},
{name:'Garden terraces',p:[173,42,149],look:[125,23,111]}
];
'''+s[e:]
old="else if(step[axis]>0){player.feet[axis]=c.min[axis]-.301;player.velocity[axis]=0;}else if(step[axis]<0){player.feet[axis]=c.max[axis]+.301;player.velocity[axis]=0;}"
new="""else {const rise=c.max.y-player.feet.y;const raised=player.feet.clone();raised.y=c.max.y+.004;if(rise>0&&rise<=.48&&player.velocity.y<=.5&&!nearby(raised).some(other=>bodyBox(raised).intersectsBox(other))){player.feet.copy(raised);player.grounded=true;}else if(step[axis]>0){player.feet[axis]=c.min[axis]-.301;player.velocity[axis]=0;}else if(step[axis]<0){player.feet[axis]=c.max[axis]+.301;player.velocity[axis]=0;}}"""
assert old in s;s=s.replace(old,new)
s=s.replace('config,getCompiled:', 'setKey:(key,on)=>on?keys.add(key):keys.delete(key),config,getCompiled:')
s=s.replace('c.height=Math.max(128,Math.round(512*h/w))','c.height=Math.min(1024,Math.max(128,Math.round(512*h/w)))');(root/'citylab.js').write_text(s)
p=root/'index.html';p.write_text(p.read_text().replace('0.2','0.3'))
p=root/'build_standalone.py';p.write_text(p.read_text().replace('./citylab.js?v=0.2.0','./citylab.js?v=0.3.0').replace('HACKERPUNK-Citylab-v0.2.html','HACKERPUNK-Citylab-v0.3.html'))
print('Integrated Punkcity 0.3')
