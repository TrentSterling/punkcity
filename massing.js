/** Independent architectural compiler. Reads the deterministic segmented recipes. */
import * as THREE from 'three';
import {paletteFor} from './architecture.js';
const V=(x,y,z)=>new THREE.Vector3(x,y,z);
export function compileMassing(api,t,b,records){
 const {B,shell,band,casing,screen,plant}=api,p=paletteFor(t,b),a=t.design,segs=a.segments;
 const emit=(m)=>{
  const cut=a.family==='lantern'?Math.min(m.w,m.d)*.25:Math.min(1.7,m.w*.12,m.d*.12);
  shell(m.x,m.z,m.w,m.d,m.base,m.h,m.primary?p.facade:'steel',cut,1,0,p.roof,true,(a.seed%10000)*5+a.facade);
  // Different articulation systems, not a colored ring copied on every floor.
  const ytop=m.base+m.h,mode=a.band;
  if(mode===0){band(m.x,m.z,m.w,m.d,ytop-.48,.58,p.armor,.27);if(m.h>27)band(m.x,m.z,m.w,m.d,m.base+m.h*.36,.35,p.edge,.22);}
  else if(mode===1){
   for(const side of[-1,1]){const xx=m.x+side*(m.w/2-.7);casing(xx,m.base+m.h/2,m.z+m.d/2+.18,.65,m.h-.25,.38,p.armor,0,.13);}
   if(m.h>20)band(m.x,m.z,m.w,m.d,m.base+2,.45,p.edge,.23);
  }else{
   for(const side of[-1,1]){const xx=m.x+side*(m.w/2-.55);casing(xx,m.base+m.h/2,m.z+m.d/2+.18,.50,m.h-.25,.35,p.edge,0,.12);}
   const n=Math.max(1,Math.floor(m.h/16));for(let i=0;i<n;i++)band(m.x,m.z,m.w,m.d,m.base+(i+.6)*m.h/n,.28,i===0?p.armor:p.edge,.22);
  }
  if(a.family==='blade'||a.family==='shouldered'){
   const n=Math.max(1,Math.floor(m.w/5));for(let i=0;i<n;i++){const xx=m.x-m.w*.36+(i+.5)*m.w*.72/n;B.box(xx,m.base+m.h*.5,m.z-m.d/2-.17,.18,m.h*.88,.34,'steel',false,true);}
  }
  if(a.family==='cascade'){
   const i=segs.indexOf(m),next=segs[i+1];if(next){const front=m.z+m.d/2,backOfLedge=next.z+next.d/2;if(front-backOfLedge>1.6)plant(m.x,front-.65,Math.max(2,m.w-3),.9,ytop);}
  }
  if(a.age===2&&m.h>18&&m.w>7){const zz=m.z+m.d/2+.35;casing(m.x-m.w*.25,m.base+m.h*.32,zz,1.5,2.2,.55,'steel',0,.2);}
 };
 for(const m of segs)emit(m);
 const highest=segs.reduce((a,b)=>a.base+a.h>b.base+b.h?a:b),y=highest.base+highest.h;
 // Caps are small supported constructions inside the real highest roof footprint.
 const w=highest.w,d=highest.d,x=highest.x,z=highest.z,cap=Math.min(5,Math.max(1.5,(t.top-t.base)*.075));
 if(a.crown===0&&w>4&&d>4){
  shell(x,z,w*.44,d*.45,y,cap,'steel',.35,1,0,p.armor);
  for(let i=0;i<3;i++)band(x,z,w*.44,d*.45,y+.4+i*cap*.29,.16,p.edge,.16);
 }else if(a.crown===1){
  const h=cap*1.5;B.box(x,y+h/2,z,Math.max(.4,w*.09),h,Math.max(.4,d*.09),'steel',true);B.box(x,y+h+.12,z,.22,.24,.22,p.glow,false,true);
 }else if(a.crown===2&&w>5&&d>4){
  for(const s of[-1,1])shell(x+s*w*.26,z,w*.19,d*.52,y,cap*(s<0?1:.66),s<0?p.armor:'steel',.25,1,0,p.edge);
 }else if(a.crown===3){
  B.box(x,y+.18,z,w*.48,.36,d*.42,'steel',true);B.box(x,y+.40,z,w*.40,.08,d*.34,'black',false,true);
 }else{
  const rr=Math.min(w,d)*.19;B.instance('cyl',x,y+.6,z,rr,1.2,rr,'steel',true);B.instance('cyl',x,y+1.24,z,rr*.91,.08,rr*.91,p.armor,true);
 }
 if(a.seed%5===0){const m=segs[0];if(m.w>9&&m.h>12)screen(m.x+m.w*.18,m.base+m.h*.55,m.z+m.d/2+.56,Math.min(3.2,m.w*.24),Math.min(8,m.h*.42),0,a.seed%8);}
 records.crowns.push({building:t.id,kind:a.crown,base:y,top:y+cap*1.5});
 (records.architecture||(records.architecture=[])).push({id:t.id,family:a.family,palette:a.paletteName,height:t.top-t.base,segments:segs.length,facade:a.facade});
}
