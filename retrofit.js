/** Original facade-socket retrofit compiler. No imported meshes or third-party code.
 * Canonical modules use +Z out of the wall, +X along it, Y up; dimensions are metres.
 * Planning is separate from geometry. Existing roads, buildings and infill are unchanged.
 */
import * as THREE from 'three';
import {random,hash,paletteFor} from './architecture.js';
import {PlacementRegistry,overlap} from './placement.js';
const V=(...a)=>new THREE.Vector3(...a),q=n=>Math.round(n*1000)/1000;
export const RETROFIT_TYPES=['gallery','capsule','cooling-spine','blade-sign','display-wall','cable-bundle'];
const LABELS=['NOODLES','ROOMS','CLINIC','REPAIR','DATA','OPEN 24','LAUNDRY','TRANSIT','AUGMENT','COFFEE','ARCADE','MARKET','STORAGE','ENERGY','COMMS','FOUNDRY'];
const sub=['HOT FOOD / LEVEL 02','SLEEP / SHOWER / REPEAT','WALK-IN / NIGHT SHIFT','PARTS / SERVICE / MODS','PRIVATE LINK / PUBLIC PRICE','WORK LATE / EAT LATE','WASH / DRY / RECYCLE','UPPER WALK / CITY LINE','HUMAN HARDWARE','FRESH BREW / NIGHT SHIFT','PLAY / CONNECT / REPEAT','LOCAL GOODS / OPEN LATE','SECURE / SELF SERVICE','POWER / CELL EXCHANGE','BANDWIDTH / ACCESS','TOOLS / PARTS / REPAIR'];
/** One shared original atlas. No external fonts, downloads or per-sign materials. */
export function installRetrofitMaterials(mats){
 if(typeof document==='undefined')return;
 const c=document.createElement('canvas');c.width=1024;c.height=2048;const g=c.getContext('2d');
 const tones=['#e3ac5a','#74cfc9','#c28e9f','#b7c9a8'];
 for(let i=0;i<16;i++){
  g.save();g.translate(i%4*256,Math.floor(i/4)*512);const fg=tones[i%4];
  g.fillStyle=['#1b272e','#243438','#302c36','#252f2d'][i%4];g.fillRect(0,0,256,512);
  g.fillStyle=fg;g.fillRect(15,16,226,7);g.fillRect(15,489,226,7);
  g.strokeStyle=fg;g.lineWidth=8;g.lineCap='square';
  g.beginPath();
  if(i===2||i===8){g.moveTo(128,86);g.lineTo(128,225);g.moveTo(63,155);g.lineTo(193,155);}
  else if(i===10){g.roundRect(56,116,144,88,24);g.moveTo(76,158);g.lineTo(112,158);g.moveTo(94,140);g.lineTo(94,177);g.moveTo(161,146);g.lineTo(164,146);g.moveTo(180,173);g.lineTo(183,173);}
  else if(i===0||i===5||i===9){g.moveTo(59,135);g.lineTo(197,135);g.quadraticCurveTo(188,230,128,230);g.quadraticCurveTo(68,230,59,135);for(let n=0;n<3;n++){g.moveTo(91+n*35,116);g.lineTo(91+n*35,86);}}
  else if(i===1){g.rect(63,142,130,52);g.moveTo(63,112);g.lineTo(63,224);g.moveTo(193,142);g.lineTo(193,224);g.rect(77,120,38,22);}
  else if(i===6){g.rect(63,84,130,150);g.moveTo(174,164);g.arc(128,164,46,0,Math.PI*2);}
  else if(i===11){g.moveTo(60,135);g.lineTo(84,91);g.lineTo(172,91);g.lineTo(196,135);g.lineTo(196,224);g.lineTo(60,224);g.closePath();g.moveTo(60,135);g.lineTo(196,135);}
  else if(i===13){g.rect(65,111,125,92);g.rect(190,138,13,37);g.moveTo(126,126);g.lineTo(105,162);g.lineTo(143,162);g.lineTo(123,190);}
  else if(i===4||i===14){g.arc(128,162,45,Math.PI*1.2,Math.PI*1.8);g.moveTo(50,120);g.arc(128,162,85,Math.PI*1.16,Math.PI*1.84);g.moveTo(125,198);g.lineTo(131,198);}
  else{g.moveTo(65,100);g.lineTo(125,160);g.lineTo(65,220);g.moveTo(126,100);g.lineTo(186,160);g.lineTo(126,220);}g.stroke();
  g.textAlign='center';g.fillStyle=fg;g.font='900 33px sans-serif';g.fillText(LABELS[i],128,302,222);
  g.font='700 17px monospace';const words=sub[i].split(' / ');words.forEach((s,j)=>g.fillText(s,128,350+j*24,220));
  g.font='bold 18px monospace';g.fillText(String(i+1).padStart(2,'0')+' / 24:7',128,464);
  for(let j=0;j<6;j++){g.fillRect(18+j*7,42,3,12);g.fillRect(200+j*6,42,2,12);}
  g.restore();
 }
 const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=4;
 mats.retroDisplay=new THREE.MeshStandardMaterial({map:tex,emissiveMap:tex,emissive:0xffffff,emissiveIntensity:.6,roughness:.48,metalness:.08});
}
function world(p,u,y,out){const c=Math.cos(p.rot),s=Math.sin(p.rot);return V(p.x+c*u+s*out,y,p.z-s*u+c*out);}
function envelope(p){const side=Math.abs(Math.sin(p.rot))>.5,c=world(p,0,0,p.depth/2);return{x:c.x,z:c.z,w:side?p.depth:p.width+.3,d:side?p.width+.3:p.depth,bottom:p.y-.6,top:p.y+p.height+.15};}
function recordsFromGeometry(items){
 return items.filter(s=>!['streets','context'].includes(s.layer)).map(s=>{if(!s.geometry.boundingBox)s.geometry.computeBoundingBox();const b=s.geometry.boundingBox;return{id:'g/'+s.id,owner:s.owner,layer:s.layer,kind:'existing',x:(b.min.x+b.max.x)/2,z:(b.min.z+b.max.z)/2,w:Math.max(.002,b.max.x-b.min.x),d:Math.max(.002,b.max.z-b.min.z),bottom:b.min.y,top:b.max.y};});
}
export function planRetrofit(city,compiled,items){
 const registry=new PlacementRegistry(),out=[],blocked={};
 for(const r of recordsFromGeometry(items))registry.reserve(r);
 for(const b of city.blocks){for(const p of b.walkSurfaces)registry.reserve({id:p.id+'/headroom',...p,bottom:p.y,top:p.y+3.2,kind:'route'});}
 for(const st of compiled.urban.stairs)registry.reserve({id:st.block+'/stairs',...st.footprint,w:st.footprint.w+1,d:st.footprint.d+2,bottom:.28,top:st.top+2.5,kind:'route'});
 for(const p of compiled.infill.placements){registry.reserve({...p,id:p.id+'/keepout',kind:'infill'});if(p.customerAccess)registry.reserve({...p.customerAccess,kind:'route'});}
 const baseReservations=registry.records.slice();
 const conflicts=(e,host)=>{const candidates=new Set();for(const key of registry.keys(e,.06))for(const r of registry.grid.get(key)||[])candidates.add(r);return [...candidates].find(r=>{
   if(r.kind==='existing'&&r.layer==='buildings'&&r.owner===host)return false;
   return overlap(e,r,.06);
 });};
 const accept=p=>{
  const e=envelope(p);p.bounds=e;
  const hit=conflicts(e,p.host);if(hit){blocked[hit.kind]=(blocked[hit.kind]||0)+1;return false;}
  registry.reserve({...e,id:p.id,kind:'retrofit'});out.push(p);return true;
 };
 for(const b of city.blocks){
  const facades=[];
  for(const m of b.masses){
   const south=m.role.startsWith('south'),north=m.role.startsWith('north');
   if(!south&&!north)continue;
   facades.push({host:m.id,x:m.x,z:m.z+(south?1:-1)*m.d/2,rot:south?0:Math.PI,length:m.w,base:.28,top:m.top,design:m.design,tower:false});
   const side=m.x>b.x?1:-1;
   facades.push({host:m.id,x:m.x+side*m.w/2,z:m.z,rot:side*Math.PI/2,length:m.d,base:.28,top:m.top,design:m.design,tower:false});
  }
  for(const t of b.towers){
   const segs=t.design.segments.filter(m=>m.primary&&m.w>6&&m.d>5&&m.h>9);
   for(const m of segs.slice(0,3)){
    facades.push({host:t.id,x:m.x,z:m.z+m.d/2,rot:0,length:m.w,base:m.base,top:m.base+m.h,design:t.design,tower:true});
    if(m.w>10)facades.push({host:t.id,x:m.x-m.w/2,z:m.z,rot:-Math.PI/2,length:m.d,base:m.base,top:m.base+m.h,design:t.design,tower:true});
   }
  }
  for(const [fi,f]of facades.entries()){
   const r=random(city.seed+':retrofit:'+f.host+':'+fi),p=paletteFor({design:f.design},b),usable=f.length-3.2;
   if(usable<3||f.top-f.base<6)continue;
   const isBusy=[3,4].includes(b.district),n=Math.max(1,Math.min(isBusy?4:3,Math.floor(usable/6)));
   const bay=usable/n,phase=Math.floor(r()*5);
   for(let k=0;k<n;k++){
    const u=-usable/2+bay*(k+.5),anchor=world(f,u,0,0);
    let type=['gallery','blade-sign','cooling-spine','capsule','display-wall'][(k+phase)%5];
    if(b.district===2&&type==='gallery')type='cooling-spine';
    const width=Math.min(type==='blade-sign'?1.3:type==='cooling-spine'?2.6:bay-.7,type==='gallery'?10.5:7.8);
    if(width<2.7&&!['blade-sign','cooling-spine'].includes(type))type='blade-sign';
    const depth=type==='blade-sign'?3.1:type==='gallery'?2.65:type==='capsule'?2.2:type==='cooling-spine'?1.35:.85;
    const height=type==='blade-sign'?6.7:type==='cooling-spine'?Math.min(10,f.top-f.base-2.5):type==='display-wall'?5.0:4.0;
    let y=f.tower?f.base+2.8:Math.max(5.8,Math.min(f.top-height-.3,7+r()*3));
    if(y+height>f.top-.2||y-.6<4.8)continue;
    const proposal={id:'retrofit/'+b.id+'/'+fi+'/'+k,block:b.id,host:f.host,type,x:q(anchor.x),z:q(anchor.z),rot:f.rot,y:q(y),width:q(width),depth,height:q(height),palette:p,sign:(hash(f.host)+k*3+fi)%16};
    for(const dy of[0,3.8,-1.4]){const candidate={...proposal,y:q(y+dy)};if(candidate.y-.6<4.8||candidate.y+height>f.top-.2)continue;if(accept(candidate))break;}
   }
  }
  const north=b.masses.filter(m=>m.role.startsWith('north')),south=b.masses.filter(m=>m.role.startsWith('south'));
  for(const n of north)for(const s of south){
   const lo=Math.max(n.x-n.w/2,s.x-s.w/2)+2,hi=Math.min(n.x+n.w/2,s.x+s.w/2)-2;if(hi-lo<4)continue;
   const z0=n.z+n.d/2,z1=s.z-s.d/2,gap=z1-z0,y=Math.min(n.top,s.top)-1.4;if(gap<7||gap>45||y<8)continue;
   const x=(lo+hi)/2,box={x,z:(z0+z1)/2,w:1,d:gap-.8,bottom:y-2.2,top:y+.35};
   if(conflicts(box,''))continue;
   const p={id:'retrofit/'+b.id+'/cable/'+out.length,block:b.id,host:n.id,hostB:s.id,type:'cable-bundle',x,z:z0,rot:0,y,width:1,depth:gap,height:.35,sign:0,bounds:box,palette:paletteFor(n,b)};out.push(p);registry.reserve({...box,id:p.id,kind:'retrofit'});
  }
 }
 const byType={};for(const p of out)byType[p.type]=(byType[p.type]||0)+1;
 const errors=[];for(let i=0;i<out.length;i++)for(let j=i+1;j<out.length;j++)if(overlap(out[i].bounds,out[j].bounds,.04))errors.push([out[i].id,out[j].id]);
 const audit={ok:errors.length===0,assemblies:out.length,byType,rejected:blocked,conflicts:errors,minimumPedestrianClearance:4.8};
 const packed={schema:['type','x','y','z','yaw','width','height','depth','sign'],stride:9,types:RETROFIT_TYPES,ids:out.map(p=>p.id),values:out.flatMap(p=>[RETROFIT_TYPES.indexOf(p.type),p.x,p.y,p.z,p.rot,p.width,p.height,p.depth,p.sign])};
 return{placements:out,audit,packed,baseReservations};
}
export function compileRetrofit(api,kit,plan){
 const {B,addGeo}=api;
 for(const p of plan.placements)B.scope('retrofit',p.id,()=>{
  const at=(u,y,v)=>world(p,u,p.y+y,v),box=(u,y,v,w,h,d,mat='steel',solid=false)=>{const v0=at(u,y,v);B.box(v0.x,v0.y,v0.z,w,h,d,mat,solid,false,p.rot);if(solid&&p.rot!==0){api.indexCollider(new THREE.Box3(V(v0.x-(Math.abs(Math.sin(p.rot))>.5?d:w)/2,v0.y-h/2,v0.z-(Math.abs(Math.sin(p.rot))>.5?w:d)/2),V(v0.x+(Math.abs(Math.sin(p.rot))>.5?d:w)/2,v0.y+h/2,v0.z+(Math.abs(Math.sin(p.rot))>.5?w:d)/2)));}},beam=(a,b,w=.12,mat='steel',round=false)=>B.beam(at(...a),at(...b),w,mat,true,round);
  const screen=(u,y,v,w,h,rot=0)=>{const pos=at(u,y,v),g=new THREE.PlaneGeometry(w,h),uv=g.attributes.uv,col=p.sign%4,row=Math.floor(p.sign/4);for(let i=0;i<uv.count;i++)uv.setXY(i,(col+.02+uv.getX(i)*.96)/4,1-(row+.98-uv.getY(i)*.96)/4);g.rotateY(p.rot+rot);g.translate(pos.x,pos.y,pos.z);addGeo(g,'retroDisplay');};
  const casing=(u,y,v,w,h,d,mat)=>{const a=at(u,y,v);kit.casing(a.x,a.y,a.z,w,h,d,mat,p.rot,.2);};
  const w=p.width,h=p.height,accent=p.palette.armor,glow=p.palette.glow;
  if(p.type==='gallery'){
   box(0,0,1.35,w,.28,2.6,'steel',true);box(0,.19,1.3,w-.2,.1,2.25,'dark',true);
   for(const u of[-w/2+.25,w/2-.25]){beam([u,-.5,.04],[u,-.12,2.4],.20);box(u,1.45,2.45,.16,2.9,.16);}
   box(0,3.0,1.4,w+.15,.26,2.45,accent,true);box(0,2.82,2.55,w-.6,.075,.09,glow);
   box(0,1.15,2.55,w,.10,.12);box(0,.6,2.55,w,.08,.1);
   const n=Math.ceil(w/2.1);for(let i=0;i<=n;i++)box(-w/2+i*w/n,.62,2.55,.075,1.12,.075);
   casing(-w*.22,1.36,.24,1.45,2.5,.42,'carbon');box(-w*.22,1.4,.49,1.16,2.16,.08,'glass');box(-w*.22,2.53,.55,1.15,.07,.07,glow);
   casing(w*.29,.85,.85,1.4,1.35,1.1,'panel');for(let j=0;j<4;j++)box(w*.29,.45+j*.22,1.43,1.1,.06,.06,'black');
  }else if(p.type==='capsule'){
   casing(0,1.6,1.05,w,2.9,2.0,p.palette.hull);box(0,.10,1.1,w,.25,2.15,'steel',true);
   for(const u of[-w*.35,w*.35])beam([u,-.45,.04],[u,.05,1.92],.18);
   const count=Math.max(1,Math.floor((w-.6)/2.0)),bw=(w-.7)/count;
   for(let i=0;i<count;i++){const u=-w/2+.35+bw*(i+.5);casing(u,1.7,2.10,bw-.13,1.6,.18,'carbon');box(u,1.72,2.22,bw-.3,1.3,.06,'glass');box(u,2.55,2.17,bw-.15,.13,.2,accent);}
   box(0,3.14,1.05,w+.10,.12,2.08,'steel');for(const u of[-w/2+.09,w/2-.09])box(u,1.60,2.16,.12,2.85,.12,'steel');box(0,.88,2.24,w-.24,.10,.16,'armorBone');for(let i=0;i<3;i++)box(-w*.25+i*w*.25,3.50,1.1,.25,.07,1,'black');
  }else if(p.type==='cooling-spine'){
   casing(0,h/2,.53,w*.92,h,.92,'dark');
   const levels=Math.max(2,Math.floor(h/2));for(let j=0;j<levels;j++){
    const yy=(j+.5)*h/levels;casing(0,yy,1.02,w*.8,h/levels-.2,.48,'steel');
    for(let a=0;a<4;a++)box(0,yy-h/levels*.3+a*h/levels*.18,1.29,w*.65,.08,.09,'black');
   }
   for(const u of[-w*.44,w*.44]){beam([u,.1,1.05],[u,h-.1,1.05],.12,'copper',true);for(let y=1;y<h;y+=2)box(u,y,.75,.3,.16,1.05,'steel');}
   box(0,h-.2,1.29,w*.6,.10,.07,glow);
   for(const yy of[.25,h-.30]){beam([-w*.44,yy,1.05],[w*.44,yy,1.05],.14,'copper',true);beam([0,yy,1.05],[0,yy,.04],.18,'steel',true);}box(0,.30,.45,.55,.42,.80,'steel');
  }else if(p.type==='blade-sign'){
   for(const y of[.6,h-.55])beam([0,y,.04],[0,y,2.7],.18);
   box(0,h/2,1.8,.35,h,2.3,'carbon');box(0,h-.12,1.8,.48,.24,2.5,accent);
   screen(.205,h/2,1.8,2.0,h-.6,Math.PI/2);screen(-.205,h/2,1.8,2.0,h-.6,-Math.PI/2);
   box(0,h/2,3.01,.13,h-.8,.09,glow);
  }else if(p.type==='display-wall'){
   casing(0,h/2,.42,w,h,.6,'carbon');screen(0,h/2,.76,w-.4,h-.4);
   box(0,h+.04,.42,w+.15,.08,.72,accent);
  }else{
   const sag=Math.min(1.8,p.depth*.075);for(let j=0;j<3;j++){
    const u=(j-1)*.32;for(let k=0;k<12;k++){const a=k/12,b=(k+1)/12;beam([u,-4*sag*a*(1-a),a*p.depth],[u,-4*sag*b*(1-b),b*p.depth],j===1?.09:.045,'black',true);}
   }
   for(const end of[0,p.depth])box(0,0,end,1.25,.16,.28,'steel');
  }
 });
}
