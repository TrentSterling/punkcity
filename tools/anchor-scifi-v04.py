from pathlib import Path
from hashlib import sha1
p=Path('scifi.js');b=p.read_bytes();assert sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest()=='8ecb532cdc10385503df0b091d361a128c26abee','Unexpected source'
s=b.decode()
a='  if(kind===0){\n   for(let i=0;i<3;i++)';assert s.count(a)==1
s=s.replace(a,"  if(kind===0){\n   // A continuous core supports the spaced radiator layers.\n   shell(x,z,w*.44,d*.44,base,h,'steel',.35,1,0,p.edge);\n   for(let i=0;i<3;i++)")
a='const z=b.z-2,height=Math.max(23,Math.min(30,north[0].top+9));';assert s.count(a)==1
s=s.replace(a,"""const z=b.z-4.7,height=Math.max(23,Math.min(30,north[0].top+9));
   // Masts sit outside the seven-metre public street; both wires meet crossarms.
   for(const side of[-1,1]){
    const x=b.x+side*b.w*.44;
    B.box(x,(height+.28)/2,z,.22,height-.28,.22,'steel',true);
    casing(x,.9,z,.75,1.2,.75,p.armor,0,.16);
    B.box(x,height,z+.4,.25,.22,1.5,'steel',false,true);
    for(let row=0;row<2;row++)B.instance('cyl',x,height+.10,z+row*.8,.15,.20,.15,'armorBone',true);
   }""")
s=s.replace('z+row*.9','z+row*.8');p.write_text(s)
print('Anchored service cables and supported layered mechanical crowns.')
