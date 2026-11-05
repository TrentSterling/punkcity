/** Original neighbourhood assemblies; consumes reservations, never changes city topology.
 * All geometry goes through the same owner-tagged coplanar compiler as the host city.
 */
import * as THREE from 'three';
import {propKit} from './prop-kit.js';
const extra=new Set(['noodlebar','coffeebar','clinic','arcade','florist','droneworks','teashop','vending','recyclers','battery','courierpad','newsstand','bikedock','dining','hydration','greenhouse','antenna','laundry','ductbank','comms','maptable','toolrack','flowercart','benches']);
export function generateNeighborhoodProp(api,sci,p){
 if(!extra.has(p.type))return false;
 const k=propKit(api,sci,p),{box,casing,cyl,beam,screen,bodyCollider,planter,palette:c,point,B}=k;
 const detail=p.variant||0,accent=detail%3===0?c.armor:detail%3===1?c.edge:'armorSilver';
 // Supports touch the mounting plane. No duplicated foundation skin is added to the sidewalk.
 const foot=(x,z,w,d)=>box(x,.08,z,w,.16,d,'carbon');
 const wheel=(x,y,z,r=.2)=>{const a=point(x,y-r*(1-Math.cos(Math.PI/10)),z);const axis=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(Math.sin(p.rot),0,Math.cos(p.rot)));B.instance('cyl',a.x,a.y,a.z,r,.12,r,'carbon',true,0,axis);};
 const orb=(x,y,z,r,mat='plant')=>{const a=point(x,y,z);B.instance('sphere',a.x,a.y,a.z,r,r*.8,r,mat,true);};
 const letters=(text,x,y,z,w,h)=>{const a=point(x,y,z);api.sign(text,a.x,a.y,a.z,w,h,p.rot,'#e4cda1');};
 const counter=(x,z,w=3,d=1.15)=>{foot(x,z,w-.25,d-.15);casing(x,.80,z,w,1.28,d,c.armor,0,.18);box(x,1.49,z+.06,w+.18,.12,d+.18,c.edge);bodyCollider(x,.77,z,w,1.54,d);};
 const stool=(x,z)=>{cyl(x,.07,z,.29,.14,'steel');cyl(x,.43,z,.06,.58,'steel');cyl(x,.78,z,.32,.13,accent);};
 const canopy=(w,d,h=3.25)=>{for(const sx of[-1,1])box(sx*(w/2-.2),h/2,-d/2+.2,.12,h,.12,'steel');casing(0,h,0,w,.24,d,c.armor,0,.13);box(0,h-.17,d/2-.18,w-.4,.08,.09,c.glow);};
 const cubicle=(w,d,h)=>{foot(0,0,w,d);casing(0,h/2+.16,-d/2+.13,w,h,.26,c.armor,0,.25);for(const sx of[-1,1])casing(sx*(w/2-.13),h/2+.16,0,d-.3,h,.26,accent,Math.PI/2,.25);casing(0,h+.25,0,w+.16,.35,d+.2,c.edge,0,.17);bodyCollider(0,h/2+.16,-d/2+.13,w,h,.26);};
 const drone=(x,y,z)=>{casing(x,y,z,1.0,.25,.63,'armorSilver',0,.16);screen(x,y+.02,z+.4,.3,.13,6);for(const sx of[-1,1])for(const sz of[-1,1]){beam([x,y,z],[x+sx*.65,y,z+sz*.48],.08,'steel');cyl(x+sx*.65,y+.03,z+sz*.48,.25,.09,c.armor);cyl(x+sx*.65,y+.09,z+sz*.48,.17,.03,'carbon');}for(const sx of[-1,1])box(x+sx*.30,y-.24,z,.07,.25,.50,'steel');};
 if(p.type==='noodlebar'){
  cubicle(5.7,2.6,3.0);canopy(6.1,3.6,3.50);counter(0,1.0,5.25,.95);
  for(const x of[-1.7,0,1.7]){stool(x,2.0);cyl(x,1.68,1.05,.23,.22,'armorBone');cyl(x,1.81,1.05,.18,.025,'armorOrange');}
  casing(-1.7,2.05,-.92,1.3,.65,.25,'steel');for(let i=0;i<3;i++)box(.2+i*.6,1.8,-.8,.4,1.1,.6,'carbon');
  box(-1.7,2.7,-.8,1.65,.4,.8,'steel');box(-1.7,3.12,-.8,.6,.44,.5,'steel');
  letters('NOODLE // 08',0,3.94,1.5,4.5,.52);for(const x of[-2.7,2.7]){cyl(x,2.75,1.3,.20,.48,'amber');beam([x,3.3,1.3],[x,3.04,1.3],.045,'steel');}
 }else if(p.type==='coffeebar'){
  canopy(3.7,3.0,2.95);counter(0,.35,3.15,1.2);casing(0,1.8,-1.2,3.1,2.3,.22,accent,0,.22);
  casing(-.65,1.95,.15,1.1,.8,.7,'carbon');screen(-.65,2.04,.57,.63,.36,2);for(let i=0;i<3;i++)cyl(.4+i*.3,1.70,.4,.10,.29,'armorBone');
  cyl(.95,2.10,-.85,.27,.9,c.armor);letters('BREW / 24',0,3.3,1.05,3,.46);for(const sx of[-1,1])stool(sx*1.2,1.43);
 }else if(p.type==='clinic'){
  cubicle(4.8,3.6,3.45);casing(0,1.8,1.73,4.35,3,.15,'carbon');casing(-.85,1.7,1.87,1.55,2.6,.15,'glass');box(-.85,1.7,1.98,.1,2.6,.1,'steel');
  screen(1.15,2.03,1.93,1.15,.9,1);box(1.15,3.1,2.02,.75,.15,.13,'cyan');box(1.15,3.1,2.04,.15,.75,.13,'cyan');
  letters('MED / AUGMENTS',0,4.0,1.76,4.2,.5);bodyCollider(0,1.8,0,4.8,3.6,3.6);
 }else if(p.type==='arcade'){
  canopy(4.9,3.8,3.30);casing(0,1.6,-1.5,4.6,3.2,.24,c.armor);letters('AFTERHOURS',0,3.66,1.6,4.2,.48);
  for(let i=0;i<3;i++){const x=-1.50+i*1.5;foot(x,.05,1.15,1.4);casing(x,1.2,.05,1.25,2.15,1.45,'carbon',0,.23);screen(x,1.62,.83,.83,.72,3+i);box(x,.95,1.0,1.12,.12,.4,c.armor);cyl(x-.22,1.10,1.03,.05,.18,'steel');for(let j=0;j<2;j++)cyl(x+.18+j*.16,1.04,1.03,.06,.05,j?'pink':'cyan');bodyCollider(x,1.1,.10,1.25,2.2,1.8);}
 }else if(p.type==='florist'){
  canopy(4.7,3.8,3.1);letters('ROOT / BOTANICS',0,3.55,1.5,4.0,.46);counter(0,.7,3.8,.9);
  for(const sx of[-1,1]){planter(sx*1.55,0,-.90,.9,1.3);for(let j=0;j<3;j++){cyl(sx*1.55,.9+j*.40,-.95,.13,.8,'sand');orb(sx*1.55,.95+j*.45,-.95,.34);}}
  for(let i=0;i<4;i++){cyl(-1.4+i*.93,1.7,.75,.20,.26,c.edge);orb(-1.4+i*.93,2.0,.75,.26,i%2?'plant':'armorPlum');}
 }else if(p.type==='droneworks'){
  cubicle(5.5,3.3,3.1);canopy(5.9,3.9,3.45);letters('SKYLINE / REPAIR',0,3.88,1.6,4.6,.46);counter(0,.8,4.9,1.1);drone(-.65,1.86,.75);
  for(let i=0;i<3;i++){casing(1.2,1.75+i*.28,.75,.8,.2,.65,i%2?'steel':c.armor);box(-1.8+i*1.8,2.0,-1.4,.13,1.1,.15,'copper');}
  screen(0,2.6,-1.38,2.1,.6,4);bodyCollider(0,.95,.8,4.9,1.7,1.1);
 }else if(p.type==='teashop'){
  canopy(4.2,3.7,2.9);casing(0,3.17,0,3.2,.35,2.7,c.edge,0,.20);counter(0,.5,3.4,1.0);
  for(let i=0;i<4;i++)cyl(-1.1+i*.74,1.8,.4,.19,.50,i%2?'armorJade':'armorBone');
  for(const sx of[-1,1]){cyl(sx*1.65,2.52,1.0,.22,.43,'warm');beam([sx*1.65,2.85,1],[sx*1.65,2.74,1],.04);stool(sx*1.0,1.48);}
  letters('TEA / REST',0,3.52,1.27,2.9,.42);
 }else if(p.type==='vending'){
  for(let i=0;i<2;i++){const x=-.72+i*1.44;foot(x,0,1.25,1.35);casing(x,1.34,0,1.32,2.36,1.42,i?accent:c.armor,0,.18);screen(x,1.75,.77,.92,.90,i?2:0);casing(x,.60,.78,.91,.37,.16,'carbon',0,.05);box(x+.43,1.08,.84,.12,.21,.08,c.glow);bodyCollider(x,1.2,0,1.32,2.4,1.42);}
 }else if(p.type==='recyclers'){
  for(let i=0;i<3;i++){const x=(i-1)*1.17;foot(x,0,1.05,1.25);casing(x,.82,0,1.08,1.32,1.3,i===1?'armorJade':i===0?c.armor:'armorSilver',0,.16);box(x,1.30,.68,.70,.19,.08,'carbon');casing(x,1.65,0,1.11,.20,1.3,c.edge,0,.10);bodyCollider(x,.85,0,1.1,1.7,1.3);}
 }else if(p.type==='battery'){
  foot(0,0,2.65,1.65);casing(0,1.35,-.10,2.65,2.38,1.48,'carbon',0,.23);
  for(const x of[-.72,0,.72])for(let y=0;y<2;y++){casing(x,.7+y*1.03,.75,.53,.80,.25,c.armor,0,.10);box(x,.76+y*1.03,.91,.08,.42,.05,c.glow);}
  letters('CELL / SWAP',0,2.63,.70,2.3,.30);bodyCollider(0,1.2,0,2.65,2.4,1.7);
 }else if(p.type==='courierpad'){
  casing(0,.13,0,2.8,.26,2.8,c.edge,0,.10);box(0,.285,0,1.7,.05,1.7,'carbon');for(const x of[-1.10,1.10])box(x,.29,0,.08,.05,2.2,'amber');drone(0,.56,0);casing(-1.10,.9,-1.15,.42,1.5,.35,c.armor);screen(-1.10,1.45,-.9,.3,.38,6);bodyCollider(0,.20,0,2.8,.4,2.8);
 }else if(p.type==='newsstand'){
  foot(0,0,1.8,1.2);casing(0,1.30,-.1,1.8,2.3,1.15,c.armor,0,.20);screen(0,1.68,.54,1.3,1.15,5);box(0,.66,.57,1.3,.22,.16,'carbon');casing(0,2.60,-.05,2.05,.18,1.3,c.edge,0,.08);bodyCollider(0,1.2,0,1.8,2.4,1.2);
 }else if(p.type==='bikedock'){
  box(0,.10,-.82,4.3,.2,.45,c.armor);for(let i=0;i<3;i++){const x=(i-1)*1.3;box(x,.50,-.82,.18,.8,.3,'steel');
   // Small parked scooters, not vehicles or agents. Wheels meet the pavement.
   for(const sx of[-1,1])wheel(x+sx*.41,.20,.18,.20);box(x,.27,.18,1.05,.13,.3,c.edge);beam([x-.40,.29,.18],[x-.53,1.32,.18],.10,'steel');box(x-.53,1.36,.18,.15,.12,.74,c.armor);box(x,.71,-.62,.12,1.0,.20,'carbon');
  }bodyCollider(0,.65,0,4.3,1.3,1.9);
 }else if(p.type==='dining'){
  foot(0,0,.8,.8);cyl(0,.64,0,.10,1.12,'steel');casing(0,1.25,0,2.7,.16,1.6,c.edge,0,.18);for(const sx of[-1,1])for(const sz of[-1,1])stool(sx*1.25,sz*1.2);
  box(0,2.2,-.45,.09,1.8,.09,'steel');casing(0,3.15,-.45,3.7,.22,3.2,c.armor,0,.22);bodyCollider(0,1.25,0,2.7,.16,1.6);
 }else if(p.type==='hydration'){
  foot(0,0,1.7,1.35);casing(0,1.25,-.15,1.65,2.18,1.25,c.armor,0,.20);screen(0,1.95,.54,1.05,.45,7);casing(0,1.08,.54,1.12,.80,.15,'carbon',0,.1);box(0,1.30,.73,.13,.15,.24,'steel');box(0,.68,.69,1.15,.12,.55,c.edge);bodyCollider(0,1.2,0,1.7,2.4,1.35);
 }else if(p.type==='comms'){
  foot(0,0,1.6,1.2);casing(0,1.4,-.1,1.45,2.45,1.0,c.armor,0,.2);screen(0,1.92,.48,.9,.86,6);box(0,.95,.62,1.2,.12,.42,c.edge);casing(0,2.73,0,1.85,.16,1.45,c.edge,0,.08);bodyCollider(0,1.25,0,1.6,2.5,1.2);
 }else if(p.type==='maptable'){
  foot(0,0,1.2,1.0);casing(0,.67,0,.8,1.0,.65,c.armor,0,.12);casing(0,1.25,0,2.1,.3,1.7,c.edge,0,.14);box(0,1.44,0,1.8,.06,1.4,'carbon');
  for(let i=0;i<3;i++)box(-.55+i*.55,1.5,0,.05,.05,1.15,'cyan');for(let i=0;i<3;i++)box(0,1.51,-.45+i*.45,1.55,.04,.05,'amber');for(let i=0;i<4;i++)casing(-.65+i*.43,1.62,-.2,.22,.18,.27,c.armor,0,.035);bodyCollider(0,1.25,0,2.1,.3,1.7);
 }else if(p.type==='toolrack'){
  foot(0,0,1.95,1.15);casing(0,1.4,-.12,1.95,2.45,1.05,c.armor,0,.18);box(0,1.5,.45,1.6,1.5,.08,'carbon');
  for(let i=0;i<3;i++){const x=-.55+i*.55;box(x,1.4,.55,.11,1.0,.12,'armorSilver');box(x,1.85,.60,.30,.16,.12,'copper');}
  screen(0,2.35,.50,1.25,.32,4);bodyCollider(0,1.3,0,1.95,2.6,1.15);
 }else if(p.type==='flowercart'){
  for(const sx of[-1,1])for(const sz of[-1,1])wheel(sx*.9,.18,sz*.62,.18);box(0,.35,0,2.2,.15,1.4,'steel');casing(0,.74,0,2.2,.65,1.4,c.armor,0,.12);
  for(let i=0;i<3;i++)for(const sz of[-1,1]){const x=-.72+i*.72;cyl(x,1.2,sz*.35,.23,.28,c.edge);orb(x,1.55,sz*.35,.30,i%2?'plant':'armorPlum');}
  bodyCollider(0,.70,0,2.2,1.2,1.4);
 }else if(p.type==='benches'){
  for(const sx of[-1,1])box(sx*1.15,.28,0,.18,.56,.7,'steel');casing(0,.67,0,2.9,.22,.8,c.edge,0,.08);casing(0,1.01,-.35,2.9,.46,.14,c.armor,0,.08);bodyCollider(0,.67,0,2.9,.22,.8);
 }else if(p.type==='greenhouse'){
  // Opaque panes avoid transparent sorting issues; plants are visible outside.
  box(0,.10,0,5.1,.2,3.6,'steel');casing(0,1.44,0,4.8,2.48,3.25,'glass',0,.30);
  for(const x of[-2.35,0,2.35]){box(x,1.47,1.70,.13,2.54,.12,c.armor);box(x,1.47,-1.70,.13,2.54,.12,c.armor);beam([x,2.74,-1.7],[x,3.35,0],.14,c.edge);beam([x,3.35,0],[x,2.74,1.7],.14,c.edge);}
  box(0,2.74,1.7,4.83,.14,.13,c.armor);box(0,2.74,-1.7,4.83,.14,.13,c.armor);beam([-2.4,3.35,0],[2.4,3.35,0],.15,c.armor);
  for(const s of[-1,1])planter(s*1.4,.2,1.8,1.8,.55);bodyCollider(0,1.5,0,5.1,3.0,3.6);
 }else if(p.type==='antenna'){
  casing(0,.15,0,2.8,.3,2.8,c.armor,0,.12);for(const sx of[-1,1])for(const sz of[-1,1])beam([sx*1.2,.3,sz*1.2],[0,3.8,0],.12,'steel');cyl(0,2.65,0,.14,4.7,'steel');
  for(const s of[-1,1]){casing(s*.7,3.45,0,.55,2.0,.3,c.edge,0,.13);beam([0,3,0],[s*.70,3,0],.13,'steel');}box(0,5.1,0,.28,.18,.28,'red');casing(.65,.7,.45,1,.8,.8,'carbon');bodyCollider(0,.4,0,2.8,.8,2.8);
 }else if(p.type==='laundry'){
  for(const x of[-1.7,1.7]){foot(x,-1.15,.6,.6);box(x,1.35,-1.15,.10,2.5,.10,'steel');}beam([-1.7,2.55,-1.15],[1.7,2.55,-1.15],.05,'steel');
  for(let i=0;i<4;i++)box(-1.23+i*.83,2.0,-1.15,.61,1.1,.055,i%2?c.edge:c.armor);
  foot(-.95,.55,1.5,1.2);casing(-.95,.8,.55,1.45,1.3,1.2,'armorSilver',0,.13);screen(-.95,.9,1.20,.65,.52,2);planter(1.1,0,.55,1.5,1.3);bodyCollider(-.95,.8,.55,1.5,1.6,1.3);
 }else if(p.type==='ductbank'){
  for(const sx of[-1,1])foot(sx*1.9,0,.5,2.4);casing(0,1.30,0,4.8,2.25,2.6,c.armor,0,.3);
  for(let i=0;i<3;i++){const x=-1.5+i*1.5;box(x,1.3,1.34,1.10,1.45,.08,'carbon');for(let j=0;j<5;j++)box(x,.8+j*.25,1.43,1,.06,.16,c.edge);}box(0,2.49,0,3.7,.11,1.7,'steel');bodyCollider(0,1.25,0,4.8,2.5,2.6);
 }
 return true;
}
