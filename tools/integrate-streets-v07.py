"""Integrate street work only against the verified 0.6 source preimage."""
from pathlib import Path
from hashlib import sha1
ROOT=Path(__file__).resolve().parent.parent
expected={'citylab.js':'515a983d539b06f3bc0a8baca3e4a6d84b2e0f21','districts.js':'483e0531b5667ec6743df80c5c70a525eab69642','index.html':'6a8c35d3d0a16c9b70d180ae92a2157bd6f1afcd','build_standalone.py':'a94778f10819edd47572ea1d7be2249052f61af6'}
if "const VERSION='0.7.0'" not in (ROOT/'citylab.js').read_text():
 for name,want in expected.items():
  b=(ROOT/name).read_bytes();assert sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest()==want,'Unexpected source: '+name
 p=ROOT/'districts.js';s=p.read_text();s="import {compileStreets,installStreetMaterials,auditStreets} from './streets.js';\n"+s
 s=s.replace('  installScifiMaterials(mats,surface);','  installScifiMaterials(mats,surface);\n  installStreetMaterials(mats);')
 a=s.index('  function streetGrid(){');b=s.index('  const buildApi=',a);s=s[:a]+"  const streets=compileStreets({B,indexCollider,ground},data);\n"+s[b:]
 s=s.replace('return {ground,decks,buildings,artifacts,urban,infill};','return {ground,decks,buildings,artifacts,urban,infill,streets};')
 s=s.replace('const urban=auditUrbanism(data,compiled);','const streetAudit=auditStreets(compiled.streets);errors.push(...streetAudit.errors);const urban=auditUrbanism(data,compiled);').replace('return{...urban,ok:', 'return{...urban,streets:streetAudit,ok:');p.write_text(s)
 p=ROOT/'citylab.js';s=p.read_text().replace("const VERSION='0.6.0'","const VERSION='0.7.0'").replace('CITYLAB 0.6 /','CITYLAB 0.7 /')
 s=s.replace('surfaceRepair:B?.surfaceReport,','surfaceRepair:B?.surfaceReport,streets:compiled?.streets?{junctions:compiled.streets.junctions.length,segments:compiled.streets.segments.length,crossings:compiled.streets.crossings,ramps:compiled.streets.ramps.length}:null,')
 where=s.index('function setView(')
 s=s[:where]+'''let streetViewIndex=0;
function visitStreet(n=streetViewIndex+1){streetViewIndex=(n+3)%3;const st=recipe.groundStreets,pts=[{p:[11,2.08,12],t:[-13,2.2,-24]},{p:[st.x[4]+7,2.08,st.z[4]+7],t:[st.x[4]-7,2,st.z[4]-19]},{p:[-18,14,20],t:[0,0,0]}];setLayer('all');player.mode='fly';player.grapple=null;const v=pts[streetViewIndex];camera.position.fromArray(v.p);camera.lookAt(...v.t);yaw=camera.rotation.y;pitch=camera.rotation.x;infillViewName=['CIVIC JUNCTION','LOCAL STREET','JUNCTION DETAIL'][streetViewIndex];hudDirty=true;return v;}
'''+s[where:]
 s=s.replace("case'KeyK':visitInfill", "case'KeyC':visitStreet();break;case'KeyK':visitInfill")
 s=s.replace("'U / K         Infill toggle / new places'","'U / K         Infill toggle / new places','C             Street inspection'")
 s=s.replace('U infill / K new places','C streets / K new places').replace('getCompiled:()=>compiled,visitInfill,','getCompiled:()=>compiled,visitInfill,visitStreet,');p.write_text(s)
 for f in ['index.html','build_standalone.py']:
  p=ROOT/f;p.write_text(p.read_text().replace('0.6.0','0.7.0').replace('v0.6','v0.7').replace('Citylab 0.6','Citylab 0.7'))
# Keep prior revision test files intact; build a current browser harness.
p=ROOT/'qa-v07.cjs';p.write_text((ROOT/'qa-v06.cjs').read_text().replace('qa-v06','qa-v07').replace('0.6.0','0.7.0').replace('v0.6','v0.7'))
print('Integrated street revision, preserving building and infill code.')
