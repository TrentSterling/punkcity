"""Shared street edges and final fixes from the rendered street review."""
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent
p=ROOT/'streets.js';s=p.read_text()
a='const L=b.x-b.w/2-3.2,T=b.z-b.d/2-3.2,X=b.x+b.w/2+3.2,Z=b.z+b.d/2+3.2,W=X-L,D=Z-T;'
b='const L=xs[b.i]+wx[b.i]/2,T=zs[b.j]+wz[b.j]/2,X=xs[b.i+1]-wx[b.i+1]/2,Z=zs[b.j+1]-wz[b.j+1]/2,W=X-L,D=Z-T;'
assert a in s or b in s
s=s.replace(a,b).replace('ground.push({x:b.x,z:b.z,w:W,d:D,y:H,kind:', 'ground.push({x:(L+X)/2,z:(T+Z)/2,w:W,d:D,y:H,kind:')
# The flare starts at 4.2 - 1.5 - 0.3 = 2.4 m, exactly at the corner tangent.
for old,new in [('rampWidth:3,rampRun:1.8}', 'rampWidth:3,rampRun:1.8,rampFlare:.3}'), ('(2.1-Math.abs(t-c))/.6','(1.8-Math.abs(t-c))/.3'), ('[-2.1,-1.5,1.5,2.1]','[-1.8,-1.5,1.5,1.8]'), ("sz<0?'streetSignalRed':'black'","'streetSignalRed'"),("sz>0?'streetSignal':'black'","'black'"),("sz<0?'streetSignal':'streetSignalRed'","'streetSignal'"),('// Length is quantized to centimetres via the fractional component, flags to thousands.','// Local segment length and endpoint flags share the preserved scalar attribute.')]:
 s=s.replace(old,new)
p.write_text(s)
p=ROOT/'citylab.js';s=p.read_text()
s=s.replace('let streetViewIndex=0;','let streetViewIndex=-1;').replace('p:[11,2.08,12],t:[-13,2.2,-24]','p:[6,2.08,7],t:[-13,2.2,-24]').replace('p:[-18,14,20],t:[0,0,0]','p:[5,16,7],t:[-8,0,-10]')
p.write_text(s)
print('Shared boundaries, continuous ramp flares, static opposing signals and clear inspection cameras.')
