import {propKit} from './prop-kit.js';
export function generateFrontage(api,sci,placements){
 for(const p of placements.filter(p=>p.layer==='frontage'))api.B.scope('frontage',p.id,()=>{
  const k=propKit(api,sci,p),{box,casing,cyl,beam,screen,bodyCollider,palette:c}=k;
  if(p.type==='microshop'){
   const w=5.8,d=3.4;box(0,.16,-.25,w,.32,d,'carbon');casing(0,1.9,-1.80,w,3.45,.24,c.armor,0,.30);
   for(const sx of[-1,1]){casing(sx*(w/2-.14),1.9,-.25,d,3.45,.28,c.edge,Math.PI/2,.30);box(sx*(w/2-.38),1.35,1.14,.22,2.4,.24,'steel');}
   casing(0,3.60,-.25,w+.35,.65,d+.35,c.armor,0,.27);casing(0,3.38,1.49,w+.65,.42,2.05,c.armor,0,.16);
   box(0,.35,.9,w-1,.7,.65,'carbon');box(0,1.1,.9,w-.75,.8,.8,'steel');box(0,1.56,1.04,w-.5,.12,1,'armorBone');
   screen(0,4.12,1.6,3.5,.66,(p.district+3)%8);
   for(let i=0;i<4;i++){cyl(-1.7+i*1.1,1.86,.9,.22,.46,i%2?'armorBone':c.armor);}
   for(const sx of[-1,1])box(sx*1.9,3.12,1.55,.8,.08,.14,c.glow);
   for(let i=0;i<3;i++){box(-1.8+i*1.8,2.0,-1.51,1.2,.1,.4,'steel');cyl(-1.8+i*1.8,2.25,-1.51,.22,.35,c.armor);}
   bodyCollider(0,1.8,-1.8,w,3.6,.28);bodyCollider(0,1.1,.9,w-.75,.8,.8);bodyCollider(0,3.6,-.25,w+.35,.65,d+.35);
  }else if(p.type==='vendor'){
   box(0,.1625,.35,3.4,.325,1.05,'carbon');casing(0,.95,.35,3.9,1.25,1.25,c.armor,0,.24);box(0,1.65,.35,4.15,.16,1.5,'armorBone');
   for(const sx of[-1,1]){box(sx*1.95,1.62,-1,.1,3.24,.1,'steel');casing(sx*1.94,.55,-1,.35,.5,.35,c.edge);}
   for(let i=0;i<5;i++)casing(-1.84+i*.92,3.25,-.2,.90,.23,3.6,i%2?c.edge:c.armor,0,.04);
   box(0,3.02,1.46,4.4,.14,.14,'steel');screen(0,2.73,-.93,2.5,.78,(p.district+2)%8);
   for(let i=0;i<4;i++){casing(-1.35+i*.9,1.84,.35,.72,.26,.65,'sand',0,.06);for(let j=0;j<2;j++)cyl(-1.5+i*.9+j*.24,2.06,.35,.11,.24,i%2?'armorOrange':'armorJade');}
   box(1.4,.40,-1,1,.55,.8,'steel');bodyCollider(0,.95,.35,3.9,1.25,1.25);bodyCollider(0,3.25,-.2,4.6,.23,3.6);
  }else{
   box(0,.0625,-.9,4.4,.125,1,'carbon');casing(0,1.7,-.9,4.9,3.15,1.2,c.armor,0,.30);casing(0,1.85,-.24,3.9,2.2,.12,'carbon');
   for(let i=0;i<3;i++){box(-1.35+i*1.35,1.9,-.12,.13,1.65,.13,'armorSilver');box(-1.35+i*1.35,1.9,-.02,.6,.13,.17,'copper');}
   casing(0,3.42,-.25,5.6,.45,3.6,c.edge,0,.18);box(0,1.35,1.0,4.8,.16,1.4,'steel');for(const sx of[-1,1])box(sx*1.9,.65,1,.15,1.3,.9,'steel');
   screen(0,2.8,-.03,2.0,.52,4);for(const sx of[-1,1]){cyl(sx*1.45,1.655,1,.24,.45,c.armor);box(sx*2.45,.05,.7,.6,.1,.8,'carbon');casing(sx*2.45,.7,.7,.8,1.2,1,c.armor);}
   bodyCollider(0,1.7,-.9,4.9,3.15,1.2);bodyCollider(0,1.35,1,4.8,.16,1.4);
  }
 });
}
