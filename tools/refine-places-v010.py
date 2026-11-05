"""Corrections from the matched 0.10 browser review; no route tolerances relaxed."""
from pathlib import Path
R=Path(__file__).resolve().parents[1]
p=R/'places.js';s=p.read_text()
s=s.replace("const sz=(r%2?1:-1),a={x:b.x+sx*4.65,z:b.z+sz*4.65,w:1.75,d:1.55,bottom:16.01,top:17.55};", "for(const sz of[-1,1]){const a={x:b.x+sx*4.65,z:b.z+sz*4.95,w:1.75,d:1.55,bottom:16.01,top:18.40};")
s=s.replace("type:b.district===2?'locker':sx>0?'counter':'seat'});}}", "type:b.district===2?'locker':sx*sz>0?'counter':'seat'});}}}")
s=s.replace("for(const sx of[-1,1])for(const sz of[-1,1])parts.push", "for(const s of[-1,1])parts.push({x:b.x,z:b.z+s*3.9,w:11.3,d:.55,bottom:19.96,top:20.20});\n  parts.push({x:b.x,z:b.z+3.8,w:4.65,d:.26,bottom:19.25,top:20.0});\n  for(const sx of[-1,1])for(const sz of[-1,1])parts.push")
s=s.replace('display(x,y+3.54,z+3.8','display(x,y+3.63,z+3.8').replace('box(0,3.91,sz*3.7','box(0,4.0,sz*3.7')
old="const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;mats.placeSign=new THREE.MeshStandardMaterial({map:t,emissiveMap:t,emissive:0xffffff,emissiveIntensity:.45,roughness:.65});"
new=old+'''
 const game=document.createElement('canvas');game.width=512;game.height=512;const q=game.getContext('2d');
 for(let k=0;k<4;k++){q.save();q.translate(k%2*256,Math.floor(k/2)*256);q.fillStyle='#071a23';q.fillRect(0,0,256,256);q.strokeStyle='#164653';q.lineWidth=1;for(let j=0;j<9;j++){q.beginPath();q.moveTo(0,j*32);q.lineTo(256,j*32);q.stroke();}q.fillStyle=['#58bcb7','#ddae65','#b6c287','#a4b9ce'][k];
  if(k===0){for(let j=0;j<5;j++){q.fillRect(30+j*40,55,20,10);q.fillRect(25+j*40,65,30,8);}q.fillRect(116,183,30,10);q.fillRect(126,170,10,16);q.fillRect(130,135,3,12);}
  if(k===1){q.fillRect(32,72,8,45);q.fillRect(216,144,8,45);q.beginPath();q.arc(151,131,6,0,6.29);q.fill();for(let j=0;j<10;j++)q.fillRect(127,j*24+12,2,8);}
  if(k===2){for(let j=0;j<4;j++){q.fillRect(27,56+j*38,134-j*19,10);q.fillRect(206,56+j*38,20,10);}q.font='bold 21px monospace';q.fillText('ORDER / READY',25,232);}
  if(k===3){q.beginPath();q.arc(128,127,70,0,6.29);q.strokeStyle='#a4b9ce';q.lineWidth=4;q.stroke();q.fillRect(123,72,10,64);q.fillRect(128,123,45,8);q.font='18px monospace';q.fillText('SERVICE 24/7',36,231);}
  q.font='bold 16px monospace';q.fillText(['ORBIT / 2400','VECTOR / 02','LOCAL KITCHEN','SYSTEMS'][k],20,27);q.restore();}
 const gt=new THREE.CanvasTexture(game);gt.colorSpace=THREE.SRGBColorSpace;gt.anisotropy=4;mats.placeGame=new THREE.MeshStandardMaterial({map:gt,emissiveMap:gt,emissive:0xffffff,emissiveIntensity:.65,roughness:.4});
'''
assert old in s;s=s.replace(old,new)
needle=" for(const p of plan.groups)B.scope('places',p.id,()=>{"
new=""" const littleScreen=(x,y,z,w,h,kind)=>{const g=new THREE.PlaneGeometry(w,h),uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,(kind%2+.025+uv.getX(i)*.95)/2,1-(Math.floor(kind/2)+.975-uv.getY(i)*.95)/2);g.translate(x,y,z);addGeo(g,'placeGame');};
"""+needle
assert needle in s;s=s.replace(needle,new)
a=s.index('   for(let k=0;k<n;k++){');b=s.index('   // Shared awning',a)
s=s[:a]+'''   const program=p.district===4&&p.program===1?'arcade':p.district===3&&p.program===1?'laundry':p.district===5&&p.program===1?'plants':p.district===2?'repair':p.district===0&&p.program===0?'fabrication':'food';
   for(let k=0;k<n;k++){
    const u=-w/2+(k+.5)*bay;
    box(u-bay/2+.08,1.7,-1.35,.12,3.4,.23,'steel');
    if(program==='arcade'){
     for(const side of[-1,1]){const a=u+side*.60;
      kit.casing(x+a,y+.67,z+.17,.96,1.34,1.02,ac,0,.09);kit.casing(x+a,y+1.75,z+.02,1.02,.94,.80,'carbon',0,.10);
      box(a,1.25,.69,.98,.12,.35,'steel');box(a,2.33,.05,1.07,.20,.90,ac);
      littleScreen(x+a,y+1.78,z+.435,.77,.66,(k+(side>0?1:0))%2);
      B.instance('cyl',x+a-.20,y+1.39,z+.75,.035,.16,.035,'steel',true);B.instance('sphere',x+a-.20,y+1.49,z+.75,.065,.065,.065,'rust',true);
      for(let j=0;j<2;j++)B.instance('cyl',x+a+.12+j*.13,y+1.32,z+.76,.055,.04,.055,j?'amber':'cyan',true);
      box(a,.10,.735,.68,.12,.05,'black');box(a,2.32,.51,.7,.045,.035,'warm');
     }
    }else if(program==='laundry'){
     for(const side of[-1,1])for(let row=0;row<2;row++){const a=u+side*.59,yy=.55+row*1.07;box(a,yy,.05,1.07,1.04,.95,'armorBone',true);B.instance('cyl',x+a,y+yy,z+.56,.34,.11,.34,'steel',true,0,new THREE.Quaternion().setFromAxisAngle(V(1,0,0),Math.PI/2));B.instance('cyl',x+a,y+yy,z+.63,.26,.05,.26,'glass',true,0,new THREE.Quaternion().setFromAxisAngle(V(1,0,0),Math.PI/2));box(a+.24,yy+.39,.56,.23,.12,.06,'cyan');}
    }else{
     box(u,.44,.25,bay-.23,.88,1.30,program==='food'?'steel':ac,true);box(u,.94,.25,bay-.12,.12,1.48,'armorBone');
     box(u,.48,.925,bay-.50,.58,.06,program==='food'?ac:'dark');
     if(program==='food'){
      box(u-.25,1.31,-.10,.90,.62,.65,'steel');box(u-.25,1.38,.24,.64,.25,.04,'black');box(u-.25,1.65,-.10,1.05,.08,.72,ac);
      box(u,2.35,-1.03,bay-.4,.12,.6,'steel');box(u,2.74,-1.18,bay-.38,.64,.38,'dark');littleScreen(x+u,y+2.75,z-.96,Math.min(1.35,bay-.5),.50,2);
      for(let j=0;j<3;j++){const xx=u-.55+j*.55;B.instance('cyl',x+xx,y+2.58,z-1.01,.15,.32,.15,j%2?'sand':'armorBone',true);B.instance('cyl',x+xx,y+1.11,z+.65,.10,.22,.10,'sand',true);}
      box(u+.70,1.06,.15,.45,.12,.65,'carbon');B.instance('cyl',x+u+.70,y+1.29,z+.15,.20,.34,.20,'steel',true);
     }else if(program==='plants'){
      for(const level of[1.0,1.75,2.50]){box(u,level-.06,-.8,bay-.35,.12,.72,'sand');for(let j=0;j<3;j++){const xx=u-.62+j*.62;B.instance('cyl',x+xx,y+level+.12,z-.8,.15,.24,.15,'rust',true);B.instance('sphere',x+xx,y+level+.39,z-.8,.24,.28,.22,'plant',true);}}
     }else{
      for(const level of[1.6,2.25]){box(u,level-.07,-1.0,bay-.35,.14,.62,'steel');for(let j=0;j<4;j++)box(u-.78+j*.52,level+.15,-.98,.41,.30,.44,j%2?'sand':'armorSilver');}
      box(u-.48,1.38,.05,.75,.76,.54,'carbon');littleScreen(x+u-.48,y+1.38,z+.33,.56,.54,3);for(let j=0;j<3;j++)box(u+.05+j*.32,1.07,.48,.22,.14,.40,j%2?'copper':'steel');
     }
    }
   }
''' + s[b:]
old="for(const corner of p.corners||[]){const u=corner.x-x,v=corner.z-z;if(corner.type==='seat'){box(u,.42,v,1.55,.16,1.2,'sand',true);box(u-.55,.2,v,.13,.4,.85);box(u+.55,.2,v,.13,.4,.85);box(u,.85,v-.5,1.55,.75,.12,'steel');}else{box(u,.68,v,1.6,1.36,1.30,ac,true);box(u,1.42,v,1.70,.12,1.40,'armorBone');box(u,1.5,v,.45,.06,.25,p.district===2?'cyan':'warm');}}"
new="""for(const corner of p.corners||[]){const u=corner.x-x,v=corner.z-z;
    if(corner.type==='seat'){box(u,.42,v,1.55,.16,1.2,'sand',true);box(u-.55,.2,v,.13,.4,.85);box(u+.55,.2,v,.13,.4,.85);box(u,.85,v-.5,1.55,.75,.12,'steel');}
    else{box(u,.44,v,1.6,.88,1.30,ac,true);box(u,.94,v,1.70,.12,1.40,'armorBone');box(u,1.39,v-.1,.70,.78,.60,'carbon');littleScreen(x+u,y+1.43,z+v+.215,.53,.55,corner.type==='locker'?3:2);for(const side of[-1,1])B.instance('cyl',x+u+side*.55,y+1.1,z+v+.35,.10,.2,.10,'sand',true);box(u,2.0,v-.45,1.5,.30,.12,'steel');box(u,2.0,v-.37,1.35,.10,.04,'warm');box(u-.65,1.54,v-.47,.09,.8,.09,'steel');box(u+.65,1.54,v-.47,.09,.8,.09,'steel');}
   }"""
assert old in s;s=s.replace(old,new);p.write_text(s)
p=R/'test-places.mjs';s=p.read_text();a=s.index('  if(a.min.x<g.x');b=s.index('\n }',a)
s=s[:a]+'''  const pos=item.geometry.attributes.position,volumes=[...g.reservedParts,...g.corners||[]];
  for(let n=0;n<pos.count;n++){
   const x=pos.getX(n),y=pos.getY(n),z=pos.getZ(n),e=.025;
   if(!volumes.some(v=>x>=v.x-v.w/2-e&&x<=v.x+v.w/2+e&&z>=v.z-v.d/2-e&&z<=v.z+v.d/2+e&&y>=v.bottom-e&&y<=v.top+e)){errors.push({owner:item.owner,point:[x,y,z]});break;}
  }''' + s[b:];p.write_text(s)
p=R/'qa-inhabited.cjs';s=p.read_text();needle=" await capture('tenant-night',()=>citylab.lighting(2));";assert needle in s
s=s.replace(needle,""" await capture('kitchen-row',()=>{const entries=[...citylab.getCompiled().places.groups].sort((a,b)=>Number(b.type==='upper-room')-Number(a.type==='upper-room')||Number(b.district===4)-Number(a.district===4));citylab.visitPlace(entries.findIndex(p=>p.type==='tenant-row'&&p.program===0&&p.district===4));});
"""+needle);p.write_text(s)
print('Reviewed worktops, six equipment programs, screen graphics, corner activities and exact component envelope tests.')
