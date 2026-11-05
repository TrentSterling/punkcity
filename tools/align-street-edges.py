"""Use the street skeleton's exact edges, not independently rounded parcels."""
from pathlib import Path
p=Path(__file__).resolve().parent.parent/'streets.js';s=p.read_text()
a='const L=b.x-b.w/2-3.2,T=b.z-b.d/2-3.2,X=b.x+b.w/2+3.2,Z=b.z+b.d/2+3.2,W=X-L,D=Z-T;'
b='const L=xs[b.i]+wx[b.i]/2,T=zs[b.j]+wz[b.j]/2,X=xs[b.i+1]-wx[b.i+1]/2,Z=zs[b.j+1]-wz[b.j+1]/2,W=X-L,D=Z-T;'
assert a in s or b in s
s=s.replace(a,b).replace('ground.push({x:b.x,z:b.z,w:W,d:D,y:H,kind:', 'ground.push({x:(L+X)/2,z:(T+Z)/2,w:W,d:D,y:H,kind:')
p.write_text(s)
