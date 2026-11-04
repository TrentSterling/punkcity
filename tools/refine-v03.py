"""Corrections from the first rendered 0.3 district review."""
from pathlib import Path
root=Path(__file__).resolve().parent.parent
p=root/'facades.js';s=p.read_text();assert 'float identity=fh(idx+vec2(fSeed,fSeed*.31));' in s
s=s.replace('float identity=fh(idx+vec2(fSeed,fSeed*.31));','float buildingId=floor(fSeed+.5);\nfloat identity=fh(idx+vec2(buildingId,buildingId*.31));').replace('fh(vec2(fSeed,13.))','fh(vec2(buildingId,13.))')
s+=r'''
export function pavingMaterial(){
 const m=new THREE.MeshStandardMaterial({color:0x8d9693,roughness:.94,metalness:.03});
 m.onBeforeCompile=s=>{
  s.vertexShader='varying vec3 paveWorld;varying vec3 paveNormal;\n'+s.vertexShader;
  s.vertexShader=s.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
paveWorld=position;paveNormal=normal;
#ifdef USE_INSTANCING
paveWorld=(instanceMatrix*vec4(position,1.)).xyz;paveNormal=normalize(mat3(instanceMatrix)*normal);
#endif
paveWorld=(modelMatrix*vec4(paveWorld,1.)).xyz;paveNormal=normalize(mat3(modelMatrix)*paveNormal);`);
  s.fragmentShader='varying vec3 paveWorld;varying vec3 paveNormal;\n'+s.fragmentShader;
  s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
vec2 p=paveWorld.xz/3.2;vec2 fw=max(fwidth(p),vec2(.0003));vec2 f=abs(fract(p)-.5);
float joint=max(smoothstep(.493-fw.x,.493+fw.x,f.x),smoothstep(.493-fw.y,.493+fw.y,f.y));
float horizontal=smoothstep(.7,.95,abs(paveNormal.y));
diffuseColor.rgb*=1.-.36*joint*horizontal;
`);
 };m.customProgramCacheKey=()=> 'punkcity-metric-paving-v03';return m;
}
''';p.write_text(s)
p=root/'districts.js';s=p.read_text().replace("import {facadeMaterial} from './facades.js';","import {facadeMaterial, pavingMaterial} from './facades.js';").replace('const colors={ivory:','mats.deck=pavingMaterial();\n  const colors={ivory:').replace(".fill(((x*31+z*13+h*7)%991+991)%991)",".fill(Math.round(((x*31+z*13+h*7)%991+991)%991))");p.write_text(s)
p=root/'urbanism.js';s=p.read_text().replace("function parapet(m,y,open=''){","function parapet(m,y,open='',socket=null){")
old="if(open===side){const u=4.2;if(horiz){edge(cx-len/2+.3,cz,cx-u,cz,y);edge(cx+u,cz,cx+len/2-.3,cz,y);}else{edge(cx,cz-len/2+.3,cx,cz-u,y);edge(cx,cz+u,cx,cz+len/2-.3,y);}}"
new="if(open===side){const u=3.5,off=socket?(horiz?socket.x-x:socket.z-z):0;if(horiz){edge(cx-len/2+.3,cz,cx+off-u,cz,y);edge(cx+off+u,cz,cx+len/2-.3,cz,y);}else{edge(cx,cz-len/2+.3,cx,cz+off-u,y);edge(cx,cz+off+u,cx,cz+len/2-.3,y);}}"
assert old in s;s=s.replace(old,new).replace("m.mat,.65,1,0,'dark');","m.mat,.65,1,0,m.top===LEVEL?'deck':'dark');").replace("parapet(m,m.top,'S');","parapet(m,m.top,b.links.includes('N')?(m.x<b.x?'E':'W'):'S',{x:b.x,z:b.z-10});")
old="const m=b.masses[0];entrance({id:m.id+'/upper',x:m.x,z:m.z,w:m.w,d:m.d},LEVEL,true,'PUBLIC TERRACE');"
new="const m=b.masses[0],ww=Math.min(9,m.w-3),zz=b.z-8.7;\n      shell(m.x,zz,ww,3,LEVEL,4.5,'facDark',.35,1,0,'steel');\n      entrance({id:m.id+'/upper',x:m.x,z:zz,w:ww,d:3},LEVEL,true,'PUBLIC TERRACE');"
assert old in s;s=s.replace(old,new).replace('const farZ=b.z-8,ww=Math.min(10,host.w*.4),dd=4;','const farZ=b.z-8.7,ww=Math.min(10,host.w*.4),dd=3;')
s=s.replace("LEVEL,1,'concrete',p.kind", "LEVEL,1,'deck',p.kind").replace("LEVEL,1,'steel','bridge'", "LEVEL,1,'deck','bridge'").replace("LEVEL,.7,'dark','terrace'", "LEVEL,.7,'deck','terrace'")
needle="    if(!b.links.includes('W')){B.box(b.x-4.2,LEVEL+.48,b.z,1.2,.6,3.6,'sand',false,true);}\n";assert needle in s
s=s.replace(needle,needle+"""    const sx=b.x+4.8,sz=b.z+4.6;
    B.box(sx,LEVEL+1.15,sz,.36,2.3,.36,'steel',false,true);
    sign(['WORKS','CIVIC','RELAY','STACKS','MARKET','GARDEN'][b.district],sx,LEVEL+2.65,sz+.24,2.5,.85,0,'#c6b487');
    B.box(sx,LEVEL+1.8,sz+.24,.18,.1,.08,'amber',false,true);
""");p.write_text(s)
p=root/'citylab.js';s=p.read_text().replace('mapX+(b.x+260)*scale,mapY+(b.z+240)*scale','mapX+(b.x-b.w/2+260)*scale,mapY+(b.z-b.d/2+240)*scale')
needle="hc.globalAlpha=1;\nhc.fillStyle='#ffffff';"
new="""hc.globalAlpha=1;
hc.strokeStyle='#e9c18d';hc.lineWidth=1.6;for(const l of recipe.upperLinks){const a=recipe.blocks.find(b=>b.id===l.a),b=recipe.blocks.find(b=>b.id===l.b);hc.beginPath();hc.moveTo(mapX+(a.x+260)*scale,mapY+(a.z+240)*scale);hc.lineTo(mapX+(b.x+260)*scale,mapY+(b.z+240)*scale);hc.stroke();}
hc.fillStyle='#ffffff';"""
assert needle in s;s=s.replace(needle,new);p.write_text(s)
print('Quantized facade identity; aligned terrace openings; added paving and wayfinding.')
