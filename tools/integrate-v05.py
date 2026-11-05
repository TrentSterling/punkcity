"""One-time v0.5 integration; refuses any source other than the reviewed v0.4 snapshot."""
from pathlib import Path
from hashlib import sha1
P=Path(__file__).resolve().parents[1]
PREIMAGE={'citylab.js': '80ea18aeb97dae0a2608e3c31f612d5833540596', 'districts.js': 'ffb9a26bc4a077af1b92aefad7a33a3b6363896f', 'urbanism.js': '46a56070eff5decc114ca9db92f33456406d8363', 'scifi.js': '212073d4e25ccffde9c2d80f15aaaea2701774d3', 'index.html': 'eb1292fadaf7636b0f57a2589d3d1328498fd0c1', 'build_standalone.py': '729633239065dbb623d4dbf79b27ce185bf2b09c'}
for name,wanted in PREIMAGE.items():
 b=(P/name).read_bytes();assert sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest()==wanted, 'Source changed: '+name
p=P/'districts.js';s=p.read_text();a=s.index('  const addGeo=');b=s.index('\n  function flat',a);s=s[:a]+"  const addGeo=(g,mat)=>{if(B.geometry)B.geometry(g,mat,mat==='paint'||mat==='adScreen');else{if(!g.attributes.facadeSeed)g.setAttribute('facadeSeed',new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count),1));if(!g.attributes.uv)g.setAttribute('uv',new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count*2),2));if(g.index)g=g.toNonIndexed();if(!B.merge.has(mat))B.merge.set(mat,[]);B.merge.get(mat).push(g);}};"+s[b:];s=s.replace('  streetGrid();',"  if(B.scope)B.scope('streets','ground',streetGrid);else streetGrid();");p.write_text(s)
p=P/'citylab.js';s=p.read_text();s="import {GeometryBatch,LAYERS} from './geometry-batch.js';\n"+s;a=s.index('class Builder{');b=s.index('\nlet B;',a);s=s[:a]+s[b:];s=s.replace('B=new Builder(city);','B=new GeometryBatch(city,mats,indexCollider,drawObjects);');s=s.replace('if(!city)return;scene.remove(city);','if(!city)return;B?.dispose();scene.remove(city);');p.write_text(s)
p=P/'urbanism.js';s=p.read_text();s=s.replace("export const URBAN_REVISION='0.4.0'", "export const URBAN_REVISION='0.5.0'")
s=s.replace('  const sci=createScifiKit(api,city);', "  const sci=createScifiKit(api,city);\n  const run=(layer,owner,fn)=>B.scope?B.scope(layer,owner,fn):fn();")
old="""    const r=rands(b.seed);b.masses.forEach(m=>{podium(m,b);sci.podium(m,b);});b.towers.forEach(t=>tower(t,b,r));
    if(b.district===0)industry(b,r);
    platform(b);roofAccess(b);switchback(b);court(b,r);sci.extras(b);"""
new="""    const r=rands(b.seed);
    b.masses.forEach(m=>{run('buildings',m.id,()=>podium(m,b));run('armor',m.id+'/armor',()=>sci.podium(m,b));});
    b.towers.forEach(t=>run('buildings',t.id,()=>tower(t,b,r)));
    if(b.district===0)run('buildings',b.id+'/industry',()=>industry(b,r));
    run('traversal',b.id+'/routes',()=>{platform(b);roofAccess(b);switchback(b);});
    run('services',b.id+'/court',()=>court(b,r));run('services',b.id+'/legacy-services',()=>sci.extras(b));"""
assert old in s;s=s.replace(old,new).replace('  city.upperLinks.forEach(bridge);',"  city.upperLinks.forEach(l=>run('traversal',l.a+'>'+l.b,()=>bridge(l)));\n  const previousLayer=B.layer;B.layer='context';")
s=s.replace('  records.scifi=sci.records;',"  B.layer=previousLayer;\n  records.scifi=sci.records;")
s=s.replace('function shop(m,b){sci.shops(m,b);}',"function shop(m,b){run('frontage',m.id+'/shops',()=>sci.shops(m,b));}")
p.write_text(s)
p=P/'scifi.js';s=p.read_text();s=s.replace("const records={revision:'0.4.0'", "const records={revision:'0.5.0'")
s=s.replace("  const g=new THREE.ExtrudeGeometry(shape,{depth:d,bevelEnabled:false,steps:1,curveSegments:1});g.translate(0,0,-d/2);g.applyMatrix4(pose(x,y,z,rot));addGeo(g,mat);records.panels++;", "  const g=new THREE.ExtrudeGeometry(shape,{depth:d,bevelEnabled:false,steps:1,curveSegments:1});g.translate(0,0,-d/2);g.applyMatrix4(pose(x,y,z,rot));if(B.scope&&B.layer==='buildings')B.scope('armor',B.owner+'/casing',()=>addGeo(g,mat));else addGeo(g,mat);records.panels++;")
s=s.replace('g.translate(0,0,.31);','g.translate(0,0,.34);')
s=s.replace(' function servicePod(x,y,z,w,h,d,mat){',' function servicePodBody(x,y,z,w,h,d,mat){')
s=s.replace(' function crown(t,b,x,z,w,d,base,top){'," function servicePod(...args){if(B.scope)return B.scope('rooftops',B.owner+'/service-pod',()=>servicePodBody(...args));return servicePodBody(...args);}\n function crown(t,b,x,z,w,d,base,top){")
s=s.replace(' return {tower,podium,shops,extras,records};',' return {tower,podium,shops,extras,records,casing,screen,fan,servicePod,band};')
p.write_text(s)
p=P/'districts.js';s=p.read_text();s="import {planInfill} from './placement.js';\nimport {generateFrontage} from './frontage.js';\nimport {generateStreetServices} from './street-services.js';\nimport {generateRoofServices} from './roof-services.js';\n"+s
s=s.replace("import {installScifiMaterials", "import {createScifiKit,installScifiMaterials") if 'import {installScifiMaterials' in s else s
if 'createScifiKit' not in s: s="import {createScifiKit} from './scifi.js';\n"+s
old="  const urban=compileUrbanism({B,shell,flat,slab,roofkit,plant,tree,sign,rail,pipe,indexCollider,addGeo},data);\n  return {ground,decks,buildings,artifacts,urban};"
new="""  const api={B,shell,flat,slab,roofkit,plant,tree,sign,rail,pipe,indexCollider,addGeo};
  const urban=compileUrbanism(api,data);
  const infill=planInfill(data,{ground,decks,buildings,urban},B.items||[]);
  if(B.scope){const kit=createScifiKit(api,data);generateFrontage(api,kit,infill.placements);generateStreetServices(api,kit,infill.placements);generateRoofServices(api,kit,infill.placements);}
  return {ground,decks,buildings,artifacts,urban,infill};"""
assert old in s;s=s.replace(old,new);s=s.replace('const urban=auditUrbanism(data,compiled);errors.push(...urban.errors);',"const urban=auditUrbanism(data,compiled);errors.push(...urban.errors);if(compiled.infill&&!compiled.infill.audit.ok)errors.push('Infill reservation conflict');")
p.write_text(s)
p=P/'citylab.js';s=p.read_text().replace("const VERSION='0.4.0'","const VERSION='0.5.0'").replace('CITYLAB 0.4 /','CITYLAB 0.5 /');s=s.replace("height:1,detail:true", "height:1,layer:url.searchParams.get('layer')||'all',infill:true,detail:true")
s=s.replace('m.userData={dress:true,original:mat,owned:true};',"m.userData={dress:true,original:mat,owned:true,layer:'signage'};")
s=s.replace('B.box(x-Math.sin(rot)*.2,y,z-Math.cos(rot)*.2,w+.3,h+.3,.2,\'black\',false,true,rot);',"B.scope('signage','sign/'+text,()=>B.box(x-Math.sin(rot)*.2,y,z-Math.cos(rot)*.2,w+.3,h+.3,.2,'black',false,true,rot));")
a=s.index('function applyAppearance()');e=s.index('\nfunction lighting',a)
s=s[:a]+"""function applyAppearance(){for(const m of drawObjects){const layer=m.userData.layer||'buildings';m.visible=(!m.userData.dress||config.detail&&!config.clay)&&(config.layer==='all'||config.layer===layer)&&(config.infill||!['frontage','services','rooftops'].includes(layer));m.material=config.clay?mats.clay:m.userData.original;}bloom.enabled=!config.clay&&config.quality>0;renderer.shadowMap.needsUpdate=true;hudDirty=true;}
function setLayer(layer){if(layer!=='all'&&!LAYERS.includes(layer))throw Error('Unknown generator layer: '+layer);config.layer=layer;applyAppearance();return layer;}
function cycleLayer(){const a=['all',...LAYERS];setLayer(a[(a.indexOf(config.layer)+1)%a.length]);say('Generator layer: '+config.layer+' (I next / Shift+I all)');}
"""+s[e:]
s=s.replace("case'KeyB':", "case'KeyI':if(e.shiftKey)setLayer('all');else cycleLayer();break;case'KeyU':config.infill=!config.infill;applyAppearance();break;case'KeyB':")
s=s.replace("'WASD          Move'", "'I / Shift+I   Isolate generator / all','U             Toggle infill layers','WASD          Move'")
s=s.replace('338,394','338,440')
s=s.replace("SEED ${config.seed}   /", "SEED ${config.seed}   /   I layers: ${config.layer.toUpperCase()}   /   U infill   /")
s=s.replace('version:VERSION,seed:config.seed,districts:',"version:VERSION,seed:config.seed,layer:config.layer,infill:compiled?.infill.audit,surfaceRepair:B?.surfaceReport,districts:")
s=s.replace('getCompiled:()=>compiled,renderer,scene,camera',"getCompiled:()=>compiled,setLayer,layers:LAYERS,getSurfaceReport:()=>B.surfaceReport,setInfill:v=>{config.infill=!!v;applyAppearance();},renderer,scene,camera")
s=s.replace("if(o.userData.owned)o.material.dispose();", "if(o.userData.owned)o.userData.original.dispose();")
p.write_text(s)
p=P/'districts.js';s=p.read_text().replace('const api={B,shell,flat,slab,roofkit,plant,tree,sign,rail,pipe,indexCollider,addGeo};','const buildApi={B,shell,flat,slab,roofkit,plant,tree,sign,rail,pipe,indexCollider,addGeo};').replace('compileUrbanism(api,data)','compileUrbanism(buildApi,data)').replace('createScifiKit(api,data);generateFrontage(api,kit','createScifiKit(buildApi,data);generateFrontage(buildApi,kit').replace('generateStreetServices(api,kit','generateStreetServices(buildApi,kit').replace('generateRoofServices(api,kit','generateRoofServices(buildApi,kit');p.write_text(s)
p=P/'citylab.js';s=p.read_text();old="m.name='Sign / '+text;city.add(m);drawObjects.push(m);";new="m.updateMatrix();m.geometry.applyMatrix4(m.matrix);const signKey='sign/'+signTextures.length;mats[signKey]=mat;B.scope('signage','sign/'+text,()=>B.geometry(m.geometry,signKey,true));";assert old in s;s=s.replace(old,new).replace('signTextures=[];drawObjects=[];',"signTextures=[];for(const key of Object.keys(mats))if(key.startsWith('sign/'))delete mats[key];drawObjects=[];").replace("config.layer=layer;applyAppearance();return layer;","config.layer=layer;if(layer!=='all')player.mode='fly';applyAppearance();return layer;");p.write_text(s)
p=P/'build_standalone.py';s=p.read_text().replace('v=0.4.0','v=0.5.0').replace('Citylab-v0.4.html','Citylab-v0.5.html');p.write_text(s)
p=P/'index.html';p.write_text(p.read_text().replace('0.4','0.5'))
EXPECTED={'citylab.js': 'e49b46b017a8b6ea215dba617131604a4e58e34f', 'districts.js': '799df39bde938298a4fb5cbdd2dedf7b29e19e25', 'urbanism.js': '6cdbdddf9357f5801d8f721cee7cd8d2a11d6d6b', 'scifi.js': '35543242d39ac7c3a73121f52656a374fc7d751f', 'index.html': '5867a39a79c3786bba67c997be4e1615114219d8', 'build_standalone.py': '6df33de3c018ee634431d2fdb72a1dd1bb2aeb04'}
for name,wanted in EXPECTED.items():
 b=(P/name).read_bytes();assert sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest()==wanted, 'Output mismatch: '+name
print('Integrated reviewed v0.5 sources')
