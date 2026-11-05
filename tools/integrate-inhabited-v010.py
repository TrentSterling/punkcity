"""Apply the coordinated critique revision only to its verified source preimage."""
from pathlib import Path
from hashlib import sha256
R=Path(__file__).resolve().parents[1]
pre={
'scifi.js':'796128f56776eae31e888d8c7e35c1ee6f400ae37cb611ba2366121fe0b180ea',
'districts.js':'394d468ec7621d45b459010369487948ac08d1aa8ff268a303ed843984563c1e',
'urbanism.js':'757fbb72daf1cdd88589e7d403972ba8add42927755fe3b32ee3aecbbae153d2',
'placement.js':'628e119efa0843c1d6d4493445ff84c6c5b0a8cb7b310109bfdf8655790b89ef',
'neighborhoods.js':'65a5f12797091724353b1836cdd9cc6600b29884a910ca01194784e882cc1c5a',
'retrofit.js':'3e2bd35a9a573d02002956e9829e255414b1798d578a33b314c08a61e529515e',
'geometry-batch.js':'c4169f0c3c33319c39d83ce07e7e4e5c3d7eb7d5c805aed43b9b5b6747ce23f0',
'citylab.js':'2d4321db4f4acb7029ae1e9a2eedcae0ae68b21ee8ebf533e2ee132e3046a0f0'}
for n,h in pre.items():assert sha256((R/n).read_bytes()).hexdigest()==h,'Unexpected source: '+n
def edit(n,fn):
 p=R/n;p.write_text(fn(p.read_text()))
def scifi(s):
 s="import {inhabitedFacade} from './inhabited-facades.js';\n"+s
 a=s.index('function panelMaterial(');b=s.index('\nfunction makeAds',a)
 s=s[:a]+"function panelMaterial(color,type=0){return inhabitedFacade(color,type,night);}\n"+s[b:]
 s=s.replace('m.top-.75,.7','m.top-.35,.32').replace('5.5,.3','3.65,.18')
 s=s.replace('Math.floor((w-3)/7)','Math.floor((w-3)/10)')
 s=s.replace('const ph=Math.min(4,m.top-7)','const ph=Math.min(1.6,m.top-7)').replace('if(ph<1.8)','if(ph<1.0)')
 s=s.replace('(w-3)/n*.62,ph,.6','Math.min(2.0,(w-3)/n*.42),ph,.42').replace('(w-3)/n*.47,ph*.67','Math.min(1.6,(w-3)/n*.34),ph*.67')
 s=s.replace('7.5+k*.45','7.75+k*.20').replace('(w-3)/n*.32,.11','Math.min(1.3,(w-3)/n*.30),.07')
 s=s.replace('1.55,m.top-.8,.8','.65,m.top-.8,.42').replace('2.1,3.4,1','1.0,2.0,.55')
 s=s.replace('4.6,5.2,0,(b.district+b.i+b.j)%8','3.0,3.6,0,(b.district+b.i+b.j)%8')
 return s
edit('scifi.js',scifi)
def district(s):
 s="import {planPlaces,compilePlaces,installPlaceMaterials} from './places.js';\n"+s
 old="bay=len<2.4?0:Math.max(1,Math.round(len/(mat==='facGlass'?5.8:5.4))),floors=Math.max(1,Math.round(h/7))"
 assert old in s;s=s.replace(old,"bay=len<1.5?0:Math.max(1,Math.round(len/(mat==='facGlass'?2.8:2.55))),floors=Math.max(1,Math.round(h/3.25))")
 s=s.replace('installScifiMaterials(mats,surface);','installScifiMaterials(mats,surface);installPlaceMaterials(mats);')
 old='const infill=planInfill(data,{ground,decks,buildings,urban},B.items||[]);';assert old in s
 s=s.replace(old,"const places=planPlaces(data,{urban},B.items||[]);if(B.scope)compilePlaces(buildApi,createScifiKit(buildApi,data),places);\n  const infill=planInfill(data,{ground,decks,buildings,urban,places},B.items||[]);")
 s=s.replace('urban,infill,streets,retro};','urban,infill,streets,retro,places};')
 s=s.replace('if(compiled.retro&&!compiled.retro.audit.ok)',"if(compiled.places&&!compiled.places.audit.ok)errors.push('Place approach conflict');if(compiled.retro&&!compiled.retro.audit.ok)")
 return s
edit('districts.js',district)
edit('placement.js',lambda s:s.replace('const registry=new PlacementRegistry(),placements=[],F=.28;','const registry=new PlacementRegistry(),placements=[],F=.28;\n for(const p of compiled.places?.reservations||[])registry.reserve(p);'))
edit('neighborhoods.js',lambda s:s.replace('Math.abs(d-7)+p.rank*3','Math.abs(d-4.5)+p.rank*.8').replace('Math.abs(dist-5.5)+r()*4','Math.abs(dist-3.7)+r()*.7'))
def urban(s):
 s=s.replace('m.top-.48,m.z+s*(m.d/2+.13),m.w-1,.32','m.top-.25,m.z+s*(m.d/2+.13),m.w-1,.16')
 old="shell(xx,z,58,51,-.65,h,r()>.6?'facSand':'facBlue',1,1,0,'dark',false);\n    if(r()>.48)shell(xx-12,z-5,25,27,h-.65,20+r()*42,'facDark',1.2,1,0,'dark',false);"
 assert old in s
 new="""const n=2+Math.floor(r()*2),width=(58-(n-1)*2)/n;
    for(let k=0;k<n;k++){const cx=xx-29+width/2+k*(width+2),depth=24+r()*19,hh=9+Math.floor(r()*8)*3.25,mat=['facSand','facBlue','facRust','facIvory'][Math.floor(r()*4)],seed=(i*37+j*71+k*101+10000)*5+k%5;
      shell(cx,z+5,width,depth,-.65,hh,mat,.6,1,0,'dark',false,seed);
      if(r()>.50)shell(cx-1,z+2,width*.66,depth*.65,hh-.65,13+r()*34,mat,1,1,0,'steel',false,seed);
    }"""
 return s.replace(old,new).replace('const x=-216+i*80,z=-195+j*80','const x=-216+i*80+(i>=6?30:0),z=-195+j*80+(j>=6?25:0)')
edit('urbanism.js',urban)
def retro(s):
 a=s.index('  g.beginPath();if(i%4===0)');b=s.index('  g.textAlign=',a)
 icons="""  g.beginPath();
  if(i===2||i===8){g.moveTo(128,86);g.lineTo(128,225);g.moveTo(63,155);g.lineTo(193,155);}
  else if(i===10){g.roundRect(56,116,144,88,24);g.moveTo(76,158);g.lineTo(112,158);g.moveTo(94,140);g.lineTo(94,177);g.moveTo(161,146);g.lineTo(164,146);g.moveTo(180,173);g.lineTo(183,173);}
  else if(i===0||i===5||i===9){g.moveTo(59,135);g.lineTo(197,135);g.quadraticCurveTo(188,230,128,230);g.quadraticCurveTo(68,230,59,135);for(let n=0;n<3;n++){g.moveTo(91+n*35,116);g.lineTo(91+n*35,86);}}
  else if(i===1){g.rect(63,142,130,52);g.moveTo(63,112);g.lineTo(63,224);g.moveTo(193,142);g.lineTo(193,224);g.rect(77,120,38,22);}
  else if(i===6){g.rect(63,84,130,150);g.moveTo(174,164);g.arc(128,164,46,0,Math.PI*2);}
  else if(i===11){g.moveTo(60,135);g.lineTo(84,91);g.lineTo(172,91);g.lineTo(196,135);g.lineTo(196,224);g.lineTo(60,224);g.closePath();g.moveTo(60,135);g.lineTo(196,135);}
  else if(i===13){g.rect(65,111,125,92);g.rect(190,138,13,37);g.moveTo(126,126);g.lineTo(105,162);g.lineTo(143,162);g.lineTo(123,190);}
  else if(i===4||i===14){g.arc(128,162,45,Math.PI*1.2,Math.PI*1.8);g.moveTo(50,120);g.arc(128,162,85,Math.PI*1.16,Math.PI*1.84);g.moveTo(125,198);g.lineTo(131,198);}
  else{g.moveTo(65,100);g.lineTo(125,160);g.lineTo(65,220);g.moveTo(126,100);g.lineTo(186,160);g.lineTo(126,220);}g.stroke();
"""
 s=s[:a]+icons+s[b:]
 old='box(0,h-.2,1.29,w*.6,.10,.07,glow);'
 s=s.replace(old,old+"\n   for(const yy of[.25,h-.30]){beam([-w*.44,yy,1.05],[w*.44,yy,1.05],.14,'copper',true);beam([0,yy,1.05],[0,yy,.04],.18,'steel',true);}box(0,.30,.45,.55,.42,.80,'steel');")
 return s.replace("box(0,3.2,1.1,w-.3,.5,1.3,'steel');","box(0,3.14,1.05,w+.10,.12,2.08,'steel');for(const u of[-w/2+.09,w/2-.09])box(u,1.60,2.16,.12,2.85,.12,'steel');box(0,.88,2.24,w-.24,.10,.16,'armorBone');")
edit('retrofit.js',retro)
edit('geometry-batch.js',lambda s:s.replace("'signage','retrofit','context'","'signage','retrofit','places','context'"))
def viewer(s):
 s="import {bakePlaceLighting,installPlaceLighting,setPlaceNight} from './place-lighting.js';\n"+s
 s=s.replace("VERSION='0.9.0'","VERSION='0.10.0'").replace('CITYLAB 0.9','CITYLAB 0.10')
 s=s.replace('B.finish();applyAppearance();','installPlaceLighting(mats);bakePlaceLighting(compiled.places,recipe);B.finish();applyAppearance();')
 s=s.replace('setScifiNight(t===2);','setScifiNight(t===2);setPlaceNight(t===2);scene.environmentIntensity=t===2?.10:.46;')
 s=s.replace('hemi.intensity=1.25','hemi.intensity=.80').replace('sun.intensity=3.15','sun.intensity=3.5').replace('sun.position.set(-200,340,210)','sun.position.set(-230,290,140)')
 s=s.replace('hemi.intensity=.85','hemi.intensity=.23').replace('sun.intensity=1.05','sun.intensity=.36').replace('fill.intensity=.2;','fill.intensity=.07;').replace('renderer.toneMappingExposure=1.3','renderer.toneMappingExposure=1.15').replace('bloom.strength=.45','bloom.strength=.30')
 insert="""let placeView=-1;
function visitPlace(n=placeView+1){const entries=[...compiled.places.groups].sort((a,b)=>Number(b.type==='upper-room')-Number(a.type==='upper-room')||Number(b.district===4)-Number(a.district===4));if(!entries.length)return null;placeView=(n+entries.length)%entries.length;const p=entries[placeView];setLayer('all');player.mode='fly';player.grapple=null;player.velocity.set(0,0,0);config.clay=false;applyAppearance();camera.position.set(p.x+Math.min(p.w*.4,4),p.y+2.15,p.z+(p.type==='upper-room'?12:8));camera.lookAt(p.x,p.y+1.9,p.z);yaw=camera.rotation.y;pitch=camera.rotation.x;infillViewName=p.name;hudDirty=true;return p;}
"""
 s=s.replace('let streetViewIndex=-1;',insert+'\nlet streetViewIndex=-1;')
 s=s.replace("case'KeyF':startWalk();","case'KeyY':visitPlace(placeView+(e.shiftKey?-1:1));break;case'KeyF':startWalk();")
 s=s.replace("'X / Z         Retrofit tour / A-B toggle'","'Y / Shift+Y   Inhabited place tour','X / Z         Retrofit tour / A-B toggle'")
 s=s.replace('retrofit:compiled?.retro?.audit,','retrofit:compiled?.retro?.audit,places:compiled?.places?.audit,')
 s=s.replace('retrofit:compiled.retro.packed,','retrofit:compiled.retro.packed,places:compiled.places.groups,')
 return s.replace('visitInfill,visitBuilding,visitStreet,','visitInfill,visitBuilding,visitStreet,visitPlace,')
edit('citylab.js',viewer)
for n in ['index.html','build_standalone.py']:
 edit(n,lambda s:s.replace('0.9.0','0.10.0').replace('v0.9','v0.10').replace('CITYLAB 0.9','CITYLAB 0.10').replace('Citylab 0.9','Citylab 0.10'))
# Preserve old test scripts for earlier releases; run matched copies against this release.
(R/'qa-v10.cjs').write_text((R/'qa-v09.cjs').read_text().replace('0.9.0','0.10.0').replace('v0.9','v0.10').replace('qa-v09','qa-v10'))
edit('qa-variety.cjs',lambda s:s.replace('0.9.0','0.10.0'))
edit('qa-retrofit.cjs',lambda s:s.replace('0.9.0','0.10.0'))
print('Integrated inhabited-city critique pass; original geometry acceptance thresholds retained.')
