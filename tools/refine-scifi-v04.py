"""One-time refinements from the first daylight district renders."""
from pathlib import Path
from hashlib import sha1
R=Path(__file__).resolve().parents[1]
p=R/'scifi.js';raw=p.read_bytes();expected='c1b1cffd04c38e4fe33df42e09f8e6e91f56e8ba'
current=sha1(b'blob '+str(len(raw)).encode()+b'\0'+raw).hexdigest()
if current!=expected:
 assert '// Street service and roof-spine refinement.' in raw.decode(),'Unexpected sci-fi source'
 print('Refinement already applied');raise SystemExit(0)
s=raw.decode()
needle="     strip(sx,y+hh*.5,zz+dd/2+.87,.15,hh*.76,.07,p.glow);"
assert s.count(needle)==1
s=s.replace(needle,needle+"\n     B.beam(V(sx,y+.5,zz+dd/2+1.1),V(sx-side*.6,y+Math.min(8,hh*.3),zz+dd/2+.45),.65,p.armor,true);")
needle='  for(const rect of b.walkSurfaces){';assert s.count(needle)==1
addition=r'''
  // Street service and roof-spine refinement.
  for(const m of b.masses.filter(m=>m.role.startsWith('south'))){
   const spineW=Math.min(9,m.w*.58),spineD=Math.min(4,m.d*.40),rx=m.x,rz=m.z-1;
   servicePod(rx,m.top+.04,rz,spineW,2.15,spineD,p.armor);
   for(const side of[-1,1]){
    B.instance('cyl',rx+side*spineW*.27,m.top+2.5,rz,Math.min(.75,spineD*.25),.60,Math.min(.75,spineD*.25),'armorBone',true);
    B.instance('cyl',rx+side*spineW*.27,m.top+2.83,rz,Math.min(.57,spineD*.19),.08,Math.min(.57,spineD*.19),'carbon',true);
   }
   pipe([rx-spineW*.35,m.top+.8,rz+spineD/2+.5],[m.x-m.w/2+1.1,m.top+.8,rz+spineD/2+.5],.22,'armorSilver');
   if(b.district!==0&&b.district!==2){
    const front=m.z+m.d/2,xx=m.x+m.w*.23;
    casing(xx,.95,front+1.1,2.3,1.1,1.05,p.armor,0,.2);
    B.box(xx,1.55,front+1.1,2.4,.15,1.12,'steel',false,true);
    screen(xx,1.08,front+1.68,1.35,.56,0,(b.district+b.j+2)%8);
    for(let i=0;i<3;i++)B.instance('cyl',xx-.65+i*.65,1.82,front+1.13,.18,.40,.18,i%2?'armorBone':p.armor,true);
    const postX=m.x-m.w*.32,postZ=front+2.1;
    B.instance('cyl',postX,1.05,postZ,.23,1.55,.23,'steel',true);
    B.instance('cyl',postX,1.74,postZ,.25,.12,.25,p.glow,true);
    records.kiosks++;
   }
  }
'''
s=s.replace(needle,addition+needle)
needle="    casing(x,15.10,z,len/n-.28,.72,.26,p.armor,rot,.18);";assert s.count(needle)==1
s=s.replace(needle,needle+"\n    if(!(rect.id.endsWith('/N')&&Math.abs(z-(b.z-10))<4.1)){casing(x,16.40,z,len/n-.48,.54,.16,'steel',rot,.12);strip(x,16.48,z,.12,.12,.12,p.glow);}")
p.write_text(s)
p=R/'citylab.js';s=p.read_text();s=s.replace('p:[-6,5.3,30],look:[-27,22,-25]','p:[-6,8,63],look:[29,21,-33]')
s=s.replace('p:[318,255,370],look:[0,25,0]','p:[210,170,255],look:[0,20,0]')
s=s.replace("name:'Market court',p:[-46,3,142],look:[-46,13,108]","name:'Market frontage',p:[-66,9,164],look:[-38,11,128]")
p.write_text(s)
p=R/'qa-v04.cjs';s=p.read_text();needle='  const context=await browser.newContext';assert needle in s
extra="  await page.evaluate(()=>{citylab.setHUD(false);citylab.setCamera([318,255,370],[0,25,0]);window.__frame(performance.now());});await page.screenshot({path:out+'/overview-matched.png',timeout:45000});\n"
s=s.replace(needle,extra+needle);p.write_text(s)
print('Added roof service spines, counters, charging posts and armored deck skirts; kept street/stair reservations.')
