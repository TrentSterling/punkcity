import {EXTRA_DIMS,planNeighborhoods} from './neighborhoods.js';
/** Deterministic 3D reservations for independent infill generators. Metres. */
const CELL=12,EPS=.005;
export function seeded(text){let a=2166136261;for(const c of String(text)){a^=c.charCodeAt(0);a=Math.imul(a,16777619);}return()=>{a+=0x6d2b79f5;let t=Math.imul(a^a>>>15,1|a);t^=t+Math.imul(t^t>>>7,61|t);return((t^t>>>14)>>>0)/4294967296;};}
export const overlap=(a,b,gap=0)=>Math.min(a.x+a.w/2+gap,b.x+b.w/2)-Math.max(a.x-a.w/2-gap,b.x-b.w/2)>EPS&&Math.min(a.z+a.d/2+gap,b.z+b.d/2)-Math.max(a.z-a.d/2-gap,b.z-b.d/2)>EPS&&Math.min(a.top,b.top)-Math.max(a.bottom,b.bottom)>EPS;
export class PlacementRegistry{
 constructor(){this.grid=new Map();this.records=[];this.rejected=0;this.reasons={};}
 keys(r,gap=0){const k=[];for(let x=Math.floor((r.x-r.w/2-gap)/CELL);x<=Math.floor((r.x+r.w/2+gap)/CELL);x++)for(let z=Math.floor((r.z-r.d/2-gap)/CELL);z<=Math.floor((r.z+r.d/2+gap)/CELL);z++)k.push(x+','+z);return k;}
 reserve(r){if(![r.x,r.z,r.w,r.d,r.bottom,r.top].every(Number.isFinite)||r.w<=0||r.d<=0||r.top<r.bottom)throw Error('Invalid reservation '+r.id);this.records.push(r);for(const k of this.keys(r)){if(!this.grid.has(k))this.grid.set(k,[]);this.grid.get(k).push(r);}return r;}
 conflict(r,gap=.45,ignore=[]){const hits=new Set();for(const k of this.keys(r,gap))for(const b of this.grid.get(k)||[])hits.add(b);return [...hits].find(b=>!ignore.includes(b.kind)&&overlap(r,b,gap));}
 place(r){const hit=this.conflict(r);if(hit){this.rejected++;this.reasons[hit.kind||'geometry']=(this.reasons[hit.kind||'geometry']||0)+1;return false;}this.reserve({...r,kind:'infill'});return true;}
}
export function planInfill(city,compiled,geometry=[]){
 const registry=new PlacementRegistry(),placements=[],F=.28;
 for(const s of geometry){if(['streets','context'].includes(s.layer))continue;const g=s.geometry;if(!g.boundingBox)g.computeBoundingBox();const b=g.boundingBox;if(b.isEmpty())continue;registry.reserve({id:'geo/'+s.id,x:(b.min.x+b.max.x)/2,z:(b.min.z+b.max.z)/2,w:Math.max(.005,b.max.x-b.min.x),d:Math.max(.005,b.max.z-b.min.z),bottom:b.min.y,top:b.max.y,kind:'existing'});}
 if(!geometry.length)for(const [i,b]of compiled.buildings.entries())registry.reserve({id:'shell/'+i,x:b.x,z:b.z,w:b.w,d:b.d,bottom:b.base,top:b.base+b.h,kind:'existing'});
 for(const b of city.blocks){
  registry.reserve({id:b.id+'/approach',x:b.x,z:b.z+b.d/4,w:12,d:b.d/2,bottom:F,top:4.9,kind:'ground-route'});
  registry.reserve({id:b.id+'/crosswalk',x:b.x,z:b.z,w:b.w,d:4.5,bottom:F,top:4.9,kind:'ground-route'});
  for(const p of b.walkSurfaces)registry.reserve({id:p.id+'/clearance',...p,bottom:p.y,top:p.y+3.1,kind:'upper-route'});
 }
 for(const e of compiled.urban.entrances){const[x,y,z]=e.position;registry.reserve({id:e.building+'/door',x,z:z+2,w:6,d:5,bottom:y,top:y+3.6,kind:'entrance'});}
 for(const s of compiled.urban.stairs)registry.reserve({id:s.block+'/stairs',...s.footprint,w:s.footprint.w+1,d:s.footprint.d+2,bottom:F,top:s.top+2.5,kind:'stairs'});
 const dims={microshop:[7.2,5.3,4.8],vendor:[5.3,4.4,3.8],repair:[6.3,4.5,4.1],lockers:[3.8,2,2.7],cargo:[4.5,3.4,2.7],utility:[4.5,2.8,3.3],seating:[5.5,3.8,3.8],garden:[4.5,3.5,1.6],cooling:[4.3,3.2,2.9],solar:[4.8,3.1,1.8],roofgarden:[4.8,3.5,2.8],...EXTRA_DIMS};
 const add=(b,type,x,z,y,rot,layer,host)=>{
  const[rawW,rawD,h]=dims[type],scaleXZ=type==='roofgym'?.70:type==='roofworkshop'?.68:['greenhouse','roofcafe'].includes(type)?.78:1,w=rawW*scaleXZ,d=rawD*scaleXZ,side=Math.abs(Math.sin(rot))>.5,ww=side?d:w,dd=side?w:d;
  const envelope=host||b;if(Math.abs(x-envelope.x)+ww/2>envelope.w/2-1.2||Math.abs(z-envelope.z)+dd/2>envelope.d/2-1.2)return false;
  const item={id:b.id+'/'+layer+'/'+placements.filter(p=>p.block===b.id).length,block:b.id,district:b.district,type,scaleXZ,newContent:!!EXTRA_DIMS[type],x,z,y,w:ww,d:dd,localW:w,localD:d,rot,layer,bottom:y+.01,top:y+h,seed:city.seed+':'+b.id+':'+type+':'+x.toFixed(2)+','+z.toFixed(2),host:host?.id||'ground',mount:layer==='rooftops'?'roof':'ground'};
  let customer=null;
  if(item.newContent&&layer==='frontage'){
   const offset=d/2+.9;customer={id:item.id+'/customers',x:x+Math.sin(rot)*offset,z:z+Math.cos(rot)*offset,w:side?1.6:2.8,d:side?2.8:1.6,bottom:y+.01,top:y+2.2,kind:'customer-access'};
   if(registry.conflict(customer,.1,['ground-route','upper-route','roof-route','entrance']))return false;
  }
  if(!registry.place(item))return false;if(customer){registry.reserve(customer);item.customerAccess=customer;}placements.push(item);return item;
 };
 for(const b of city.blocks){
  const r=seeded(city.seed+':infill:'+b.id),northEdge=b.z-6,south=b.masses.filter(m=>m.role.startsWith('south')),back=south.length?Math.min(...south.map(m=>m.z-m.d/2)):b.z+b.d/2-5;
  const programs=[['repair','cargo','utility'],['microshop','lockers','seating'],['repair','utility','lockers'],['microshop','vendor','seating'],['vendor','microshop','vendor'],['microshop','garden','seating']][b.district];
  const pockets=[];for(const sx of[-1,1])for(const f of[.34,.57,.79])for(const dz of[5.9,10.8,-3.0])pockets.push({x:b.x+sx*(7+(b.w/2-8)*f),z:b.z+dz,rot:-sx*Math.PI/2});
  let major=0;for(const p of pockets){if(major>=(b.district===4?7:b.district===0?3:4))break;const type=programs[major%programs.length];if(add(b,type,p.x+(r()-.5)*.35,p.z,F,p.rot,['vendor','microshop','repair'].includes(type)?'frontage':'services'))major++;}
  const service=[['cargo','utility'],['seating','lockers'],['utility','lockers'],['garden','lockers'],['cargo','lockers'],['garden','seating']][b.district];
  let count=0;for(const sx of[-1,1])for(const z of[northEdge+2,back-2.8,b.z+6,b.z+10])for(const f of[.72,.46]){
   if(count>=5)break;const type=service[count%2];if(add(b,type,b.x+sx*b.w*f*.5,z,F,sx>0?-Math.PI/2:Math.PI/2,'services'))count++;
  }
  for(const m of south){let n=0;for(const sx of[-1,1])for(const sz of[1,-1]){
    if(n>=2)break;const type=b.district===5?'roofgarden':b.district===0||b.district===2?'cooling':((b.seed+sx+sz)&1)?'solar':'cooling';
    if(add(b,type,m.x+sx*(m.w/2-4.2),m.z+sz*(m.d/2-3.5),m.top,0,'rooftops',m))n++;
   }}
 }
 planNeighborhoods(city,compiled,add,placements,registry);
 const counts={};for(const p of placements)counts[p.type]=(counts[p.type]||0)+1;
 const audit={ok:true,placements:placements.length,newAssemblies:placements.filter(p=>p.newContent).length,uniqueTypes:Object.keys(counts).length,byType:counts,byDistrict:city.districts.map((d,i)=>({district:d.name,count:placements.filter(p=>p.district===i).length})),rejectedCandidates:registry.rejected,reasonCounts:registry.reasons,clearanceMetres:.45};
 const conflicts=[];for(let i=0;i<placements.length;i++)for(let j=i+1;j<placements.length;j++)if(overlap(placements[i],placements[j],.44))conflicts.push([placements[i].id,placements[j].id]);
 audit.conflicts=conflicts;audit.ok=conflicts.length===0;return {placements,audit};
}
