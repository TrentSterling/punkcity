/** 0.10: architecture-backed activities, not arbitrary prop-density quotas.
 * Accepted groups own a frontage, support, customer approach and light source.
 * Every physical component is reserved before emission. Street/stair routes win.
 */
import * as THREE from 'three';
import {PlacementRegistry,overlap} from './placement.js';
import {paletteFor,hash} from './architecture.js';
const V=(...a)=>new THREE.Vector3(...a);
const PROGRAMS=[['FABRICATION ROW','WORKERS CANTEEN'],['COFFEE EXCHANGE','LATE SHIFT DELI'],['REPAIR EXCHANGE','COMPONENTS'],['NEIGHBORHOOD KITCHEN','LAUNDRY COURT'],['NIGHT FOOD HALL','ARCADE WALK'],['GARDEN TEA HOUSE','PLANT EXCHANGE']];
const UPPER=['WORKERS REST','CIVIC TEA TERRACE','COURIER EXCHANGE','RESIDENTS LOUNGE','UPPER FOOD HALL','GARDEN OVERLOOK'];
const atlasNames=[...PROGRAMS.flat(),...UPPER];
export function installPlaceMaterials(mats){
 if(typeof document==='undefined')return;
 const c=document.createElement('canvas');c.width=2048;c.height=768;const g=c.getContext('2d');
 for(let i=0;i<18;i++){const x=i%4*512,y=Math.floor(i/4)*128;g.save();g.translate(x,y);g.fillStyle=['#242d31','#293331','#333036','#303533'][i%4];g.fillRect(0,0,512,128);g.fillStyle=['#e5c18a','#a4ccc5','#cfb1b7','#c5d0a6'][i%4];g.fillRect(12,14,4,100);g.textAlign='left';g.font='bold 26px sans-serif';g.fillText(atlasNames[i],30,53,458);g.font='15px monospace';g.fillText(i<12?'LOCAL TRADE / WALK-IN':'PUBLIC TERRACE / LEVEL 16',30,89);g.fillRect(30,107,450,2);g.restore();}
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;mats.placeSign=new THREE.MeshStandardMaterial({map:t,emissiveMap:t,emissive:0xffffff,emissiveIntensity:.45,roughness:.65});
}
function existingRecords(items){return items.filter(s=>!['streets','context'].includes(s.layer)).map(s=>{if(!s.geometry.boundingBox)s.geometry.computeBoundingBox();const a=s.geometry.boundingBox;return{id:'geometry/'+s.id,owner:s.owner,layer:s.layer,kind:'existing',x:(a.min.x+a.max.x)/2,z:(a.min.z+a.max.z)/2,w:Math.max(.002,a.max.x-a.min.x),d:Math.max(.002,a.max.z-a.min.z),bottom:a.min.y,top:a.max.y};});}
export function planPlaces(city,compiled,items){
 const registry=new PlacementRegistry(),groups=[],reservations=[],approaches=[],lights=[],rejected={};
 existingRecords(items).forEach(r=>registry.reserve(r));
 const keep=r=>{registry.reserve(r);reservations.push(r);};
 for(const b of city.blocks){
  keep({id:b.id+'/walk',kind:'route',x:b.x,z:b.z+b.d/4,w:12,d:b.d/2,bottom:.28,top:4.9});
  keep({id:b.id+'/cross',kind:'route',x:b.x,z:b.z,w:b.w,d:4.5,bottom:.28,top:4.9});
  for(const p of b.walkSurfaces){
   if(p.kind==='square'){
    keep({id:p.id+'/ew',kind:'route',x:p.x,z:p.z,w:p.w,d:7,bottom:16,top:19.2});
    keep({id:p.id+'/ns',kind:'route',x:p.x,z:p.z,w:7,d:p.d,bottom:16,top:19.2});
   }else keep({...p,id:p.id+'/headroom',kind:'route',bottom:16,top:19.2});
  }
 }
 for(const e of compiled.urban.entrances){const[x,y,z]=e.position;keep({id:e.building+'/entry',kind:'route',x,z:z+1.8,w:6,d:4.6,bottom:y,top:y+3.6});}
 for(const s of compiled.urban.stairs)keep({...s.footprint,id:s.block+'/stair',kind:'route',w:s.footprint.w+1,d:s.footprint.d+2,bottom:.28,top:18.5});
 const clash=(a,host='')=>{const hits=new Set();for(const k of registry.keys(a,.04))for(const r of registry.grid.get(k)||[])hits.add(r);return [...hits].find(r=>{
  if(host&&r.kind==='existing'&&(r.owner===host||r.owner===host+'/armor')&&['buildings','armor'].includes(r.layer))return false;
  return overlap(a,r,.025);
 });};
 const accept=(group,parts)=>{for(const p of parts){const hit=clash(p,group.host);if(hit){rejected[hit.kind]=(rejected[hit.kind]||0)+1;return false;}}for(const p of parts)keep({...p,id:group.id+'/'+reservations.length,kind:'place'});group.reservedParts=parts;groups.push(group);return true;};
 for(const b of city.blocks){
  // Tenant strips face the court and physically back onto their host wall.
  for(const m of b.masses.filter(m=>m.role.startsWith('north'))){
   const width=Math.min(12.0,(m.w-10)/2-1.2);if(width<5.4)continue;
   const r=hash(city.seed+':place:'+m.id),order=r%2?[-1,1]:[1,-1];
   for(const side of order){
    const x=m.x+side*(m.w/2-width/2-1.3),z=m.z+m.d/2+1.65,program=(r+(side>0?1:0))%2;
    const group={id:'place/'+m.id+'/'+side,type:'tenant-row',name:PROGRAMS[b.district][program],block:b.id,district:b.district,host:m.id,x,z,y:.28,w:width,d:2.95,h:4.3,program,palette:paletteFor(m,b),sign:b.district*2+program};
    const body={x,z,w:width+.14,d:2.98,bottom:.29,top:4.60};
    const access={id:group.id+'/customer',kind:'customer-access',x,z:z+2.3,w:width-.5,d:1.45,bottom:.29,top:2.7};
    // Customer space may share a public path but not solid geometry or another group.
    const candidates=registry.records.filter(r=>r.kind!=='route');if(candidates.some(r=>overlap(access,r,.04)))continue;
    if(!accept(group,[body]))continue;
    keep(access);approaches.push(access);lights.push({x,z:z+1.7,y:2.8,radius:9,color:program?[.30,.72,1]:[1,.49,.18],power:.58});
   }
  }
  if(!b.deck)continue;
  // A covered junction is a destination; the full seven metre cross remains open.
  const m=b.masses[0],r=hash(city.seed+':shelter:'+b.id),group={id:'place/'+b.id+'/upper',type:'upper-room',name:UPPER[b.district],block:b.id,district:b.district,host:'',x:b.x,z:b.z,y:16,w:11.4,d:8.5,h:5,program:r%3,palette:paletteFor(m,b),sign:12+b.district};
  const parts=[{x:b.x,z:b.z,w:11.4,d:8.5,bottom:20.05,top:21.1}];
  for(const sx of[-1,1])for(const sz of[-1,1])parts.push({x:b.x+sx*5.55,z:b.z+sz*4.05,w:.18,d:.18,bottom:16.01,top:20.1});
  if(accept(group,parts)){
   lights.push({x:b.x,z:b.z,y:18.3,radius:10,color:b.district===2?[.22,.65,1]:[1,.62,.26],power:.75});
   for(const sx of[-1,1]){const sz=(r%2?1:-1),a={x:b.x+sx*4.65,z:b.z+sz*4.65,w:1.75,d:1.55,bottom:16.01,top:17.55};if(!clash(a)){keep({...a,id:group.id+'/seat/'+sx,kind:'place'});(group.corners||(group.corners=[])).push({...a,type:b.district===2?'locker':sx>0?'counter':'seat'});}}
  }
 }
 const errors=[];
 for(const g of groups)for(const p of g.reservedParts)if(![p.x,p.z,p.w,p.d,p.bottom,p.top].every(Number.isFinite))errors.push('Invalid component '+g.id);
 for(const a of approaches)for(const g of groups)for(const p of g.reservedParts)if(!a.id.startsWith(g.id)&&overlap(a,p,.02))errors.push('Blocked approach '+a.id);
 return{groups,reservations:reservations.filter(r=>r.kind==='place'||r.kind==='customer-access'),approaches,lights,audit:{ok:!errors.length,errors,tenantRows:groups.filter(g=>g.type==='tenant-row').length,upperRooms:groups.filter(g=>g.type==='upper-room').length,rejected,centralUpperClearance:7}};
}
export function compilePlaces(api,kit,plan){
 const {B,addGeo,indexCollider}=api;
 const display=(x,y,z,w,h,kind)=>{B.box(x,y,z,w+.15,h+.15,.18,'carbon',false,true);const g=new THREE.PlaneGeometry(w,h),uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,(kind%4+.02+uv.getX(i)*.96)/4,1-(Math.floor(kind/4)+.98-uv.getY(i)*.96)/6);g.translate(x,y,z+.12);addGeo(g,'placeSign');};
 for(const p of plan.groups)B.scope('places',p.id,()=>{
  const {x,z,y,w,d}=p,ac=p.palette.armor;
  const box=(a,b,c,ww,hh,dd,mat='steel',solid=false)=>B.box(x+a,y+b,z+c,ww,hh,dd,mat,solid,!solid);
  if(p.type==='tenant-row'){
   const n=Math.max(2,Math.floor(w/3)),bay=w/n;
   box(0,1.6,-1.40,w,3.2,.14,'dark');
   for(let k=0;k<n;k++){
    const u=-w/2+(k+.5)*bay,food=p.program===0&&![0,2].includes(p.district);
    box(u,.82,.25,bay-.23,1.64,1.30,ac,true);box(u,1.70,.25,bay-.12,.12,1.48,'armorBone');
    box(u,1.25,-1.15,bay-.35,.11,.45,'steel');
    if(food){for(let j=0;j<3;j++){B.instance('cyl',x+u-.6+j*.60,y+1.54,z-1.12,.22,.48,.22,'armorSilver',true);B.instance('cyl',x+u-.6+j*.6,y+1.87,z+.28,.13,.22,.13,'sand',true);}box(u,2.55,-1.15,bay-.4,.15,.48,ac);}
    else{box(u,2.25,-1.23,bay-.45,.75,.12,'carbon');box(u,2.28,-1.14,bay-.65,.48,.05,p.district===0?'amber':'cyan');for(let j=0;j<3;j++)box(u-.55+j*.55,1.87,.25,.38,.22,.40,j%2?'armorSilver':'sand');}
    box(u-bay/2+.08,1.7,-1.35,.12,3.4,.23,'steel');
   }
   // Shared awning and header tie adjacent counters into one inhabited frontage.
   box(0,3.35,-.05,w+.10,.22,2.9,ac,true);box(0,3.19,1.24,w-.5,.07,.10,'warm');
   for(const s of[-1,1]){box(s*(w/2-.12),1.62,1.20,.12,3.24,.12,'steel',true);B.beam(V(x+s*(w/2-.12),y+2.7,z-1.40),V(x+s*(w/2-.12),y+3.18,z+1.30),.12,'steel',true);}
   display(x,y+3.72,z+.2,Math.min(w-1,6),.64,p.sign);
   for(let i=0;i<4;i++)box(-w*.36+i*w*.24,3.5,-.1,.08,.07,2.7,'steel');
  }else{
   for(const sx of[-1,1])for(const sz of[-1,1])box(sx*5.55,2.05,sz*4.05,.16,4.10,.16,'steel',true);
   // Different roof profiles: split clerestory, shallow gable, stepped shade fins.
   if(p.program===2){for(let i=0;i<7;i++)box(-4.8+i*1.6,4.23+(i%2)*.15,0,1.35,.18,8.4,i%2?ac:'steel',true);}
   else{const shape=new THREE.Shape(),half=w/2;shape.moveTo(-half,0);shape.lineTo(-.55,p.program===0?.50:.25);shape.lineTo(-.55,p.program===0?.66:.41);shape.lineTo(-half,.16);shape.closePath();for(const side of[-1,1]){const g=new THREE.ExtrudeGeometry(shape,{depth:d,bevelEnabled:false});g.translate(0,0,-d/2);if(side>0)g.rotateY(Math.PI);g.translate(x,y+4.15,z);addGeo(g,ac);}box(0,4.42,0,.28,.30,8.4,'steel',true);}
   for(const sz of[-1,1]){box(0,4.08,sz*4.05,11.25,.18,.20,'steel');box(0,3.91,sz*3.7,5.4,.07,.12,p.district===2?'cyan':'warm');}
   display(x,y+3.54,z+3.8,4.5,.60,p.sign);
   for(const corner of p.corners||[]){const u=corner.x-x,v=corner.z-z;if(corner.type==='seat'){box(u,.42,v,1.55,.16,1.2,'sand',true);box(u-.55,.2,v,.13,.4,.85);box(u+.55,.2,v,.13,.4,.85);box(u,.85,v-.5,1.55,.75,.12,'steel');}else{box(u,.68,v,1.6,1.36,1.30,ac,true);box(u,1.42,v,1.70,.12,1.40,'armorBone');box(u,1.5,v,.45,.06,.25,p.district===2?'cyan':'warm');}}
  }
 });
}
