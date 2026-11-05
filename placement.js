import {INFILL_CATALOG as C, NEIGHBORHOOD_PROGRAMS} from './infill-catalog.js';
/** Deterministic 3D reservations for independent infill generators. Metres. */
const CELL=12,EPS=.005;
export function seeded(text){let a=2166136261;for(const c of String(text)){a^=c.charCodeAt(0);a=Math.imul(a,16777619);}return()=>{a+=0x6d2b79f5;let t=Math.imul(a^a>>>15,1|a);t^=t+Math.imul(t^t>>>7,61|t);return((t^t>>>14)>>>0)/4294967296;};}
export const overlap=(a,b,gap=0)=>Math.min(a.x+a.w/2+gap,b.x+b.w/2)-Math.max(a.x-a.w/2-gap,b.x-b.w/2)>EPS&&Math.min(a.z+a.d/2+gap,b.z+b.d/2)-Math.max(a.z-a.d/2-gap,b.z-b.d/2)>EPS&&Math.min(a.top,b.top)-Math.max(a.bottom,b.bottom)>EPS;
export class PlacementRegistry{
 constructor(){this.grid=new Map();this.records=[];this.rejected=0;this.reasons={};}
 keys(r,gap=0){const k=[];for(let x=Math.floor((r.x-r.w/2-gap)/CELL);x<=Math.floor((r.x+r.w/2+gap)/CELL);x++)for(let z=Math.floor((r.z-r.d/2-gap)/CELL);z<=Math.floor((r.z+r.d/2+gap)/CELL);z++)k.push(x+','+z);return k;}
 reserve(r){if(![r.x,r.z,r.w,r.d,r.bottom,r.top].every(Number.isFinite)||r.w<=0||r.d<=0||r.top<r.bottom)throw Error('Invalid reservation '+r.id);this.records.push(r);for(const k of this.keys(r)){if(!this.grid.has(k))this.grid.set(k,[]);this.grid.get(k).push(r);}return r;}
 conflict(r,gap=.45){const hits=new Set();for(const k of this.keys(r,gap))for(const b of this.grid.get(k)||[])hits.add(b);return [...hits].find(b=>overlap(r,b,gap));}
 place(r){const hit=this.conflict(r);if(hit){this.rejected++;this.reasons[hit.kind||'geometry']=(this.reasons[hit.kind||'geometry']||0)+1;return false;}this.reserve({...r,kind:'infill'});return true;}
}
export function planInfill(city,compiled,geometry=[],options={}){
 const density=['balanced','busy','packed'].includes(options.density)?options.density:'busy';
 const multiplier={balanced:.65,busy:1,packed:1.35}[density];
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
 const typeCounts={},blockCounts=new Map(),businessCounts=new Map();
 const add=(b,type,x,z,y,rot,host,cluster='court')=>{
  const def=C[type];if(!def)throw Error('Unrecognized infill type '+type);
  const [w,d,h]=def.size,layer=def.layer,side=Math.abs(Math.sin(rot))>.5,ww=side?d:w,dd=side?w:d;
  const envelope=host||b;if(Math.abs(x-envelope.x)+ww/2>envelope.w/2-1.2||Math.abs(z-envelope.z)+dd/2>envelope.d/2-1.2)return false;
  const id=b.id+'/'+layer+'/'+(blockCounts.get(b.id)||0),seed=city.seed+':'+b.id+':'+type+':'+x.toFixed(2)+','+z.toFixed(2);
  const item={id,block:b.id,district:b.district,type,name:def.name,x,z,y,w:ww,d:dd,localW:w,localD:d,rot,layer,bottom:y+.01,top:y+h,seed,variant:Math.floor(seeded(seed+':visual')()*12),host:host?.id||'ground',mount:host?'roof':'ground',cluster};
  if(!registry.place(item))return false;placements.push(item);blockCounts.set(b.id,(blockCounts.get(b.id)||0)+1);typeCounts[type]=(typeCounts[type]||0)+1;return true;
 };
 const shuffled=(items,r)=>items.map(v=>({v,k:r()})).sort((a,b)=>a.k-b.k).map(o=>o.v);
 // First allocate full-size businesses. Amenities never crowd them out.
 for(const b of city.blocks){
  const program=NEIGHBORHOOD_PROGRAMS[b.district],r=seeded(city.seed+':business:'+b.id);
  const candidates=[];
  for(const sx of[-1,1])for(const dz of[7,12,-3,17])for(const f of[.30,.49,.68,.85])candidates.push({x:b.x+sx*(7+(b.w/2-8)*f),z:b.z+dz,rot:-sx*Math.PI/2});
  // A second row can activate the quieter street-facing pockets where buildings leave room.
  for(const sx of[-1,1])for(const f of[.34,.64,.84])candidates.push({x:b.x+sx*b.w*f/2,z:b.z+b.d/2-5,rot:0});
  let accepted=0;const budget=Math.ceil((b.district===4?7:b.district===3?5:4)*multiplier);
  for(const p of shuffled(candidates,r)){
   if(accepted>=budget)break;
   const choices=shuffled(program.business,r).sort((a,b)=>(typeCounts[a]||0)-(typeCounts[b]||0));
   for(const type of choices)if(add(b,type,p.x,p.z,F,p.rot,null,'business-court')){accepted++;break;}
  }
  businessCounts.set(b.id,accepted);
 }
 // Large communal amenities get first refusal; small service objects then occupy
 // otherwise unusable pockets. Each footprint has a deterministic acceptance order.
 for(const b of city.blocks){
  const program=NEIGHBORHOOD_PROGRAMS[b.district],r=seeded(city.seed+':amenities:'+b.id);
  const candidates=[];for(const sx of[-1,1])for(let z=b.z+4.2;z<b.z+b.d/2-1.2;z+=3.9)for(const f of[.35,.55,.75,.91])candidates.push({x:b.x+sx*b.w*f/2,z,rot:-sx*Math.PI/2});
  for(const sx of[-1,1])for(let z=b.z-b.d/2+4;z<b.z;z+=5.3)candidates.push({x:b.x+sx*(b.w/2-2.7),z,rot:-sx*Math.PI/2});
  let accepted=0;const budget=Math.ceil((b.district===4?12:10)*multiplier);
  for(const p of shuffled(candidates,r)){
   if(accepted>=budget)break;
   const choices=shuffled(program.amenities.filter(t=>placements.filter(p=>p.block===b.id&&p.type===t).length<3),r).sort((a,b)=>(typeCounts[a]||0)-(typeCounts[b]||0));
   for(const type of choices)if(add(b,type,p.x,p.z,F,p.rot,null,'street-services')){accepted++;break;}
  }
  // Quiet courtyard edges can take one additional planted/seating cluster.
  for(const sx of[-1,1])for(const type of b.district===5?['dining','garden']:['garden','hydration']){
   if(add(b,type,b.x+sx*(b.w/2-5.4),b.z+4.8,F,-sx*Math.PI/2,null,'court-edge'))break;
  }
 }
 // Rooftop layouts use the actual host dimensions, excluding tower bases, rails,
 // upper-route reservations and existing plant. A host is never scaled to fit a prop.
 for(const b of city.blocks){
  const program=NEIGHBORHOOD_PROGRAMS[b.district];
  for(const m of b.masses){
   const r=seeded(city.seed+':roof:'+m.id),candidates=[];
   for(let x=m.x-m.w/2+3.8;x<m.x+m.w/2-2.7;x+=4.8)for(let z=m.z-m.d/2+3.4;z<m.z+m.d/2-2.7;z+=4.2)candidates.push({x,z});
   let accepted=0;const budget=Math.ceil((m.role.startsWith('south')?4:3)*multiplier);
   const roofTypes=m.role.startsWith('north')&&b.deck?['roofgarden','laundry',...program.roof]:program.roof;
   for(const p of shuffled(candidates,r)){
    if(accepted>=budget)break;
    const choices=shuffled(roofTypes,r).sort((a,b)=>(typeCounts[a]||0)-(typeCounts[b]||0));
    for(const type of choices)if(add(b,type,p.x,p.z,m.top,0,m,'roof-'+m.role)){accepted++;break;}
   }
  }
 }
 const counts={};for(const p of placements)counts[p.type]=(counts[p.type]||0)+1;
 const audit={ok:true,density,catalogTypes:Object.keys(C).length,representedTypes:Object.keys(counts).length,placements:placements.length,byType:counts,byDistrict:city.districts.map((d,i)=>({district:d.name,count:placements.filter(p=>p.district===i).length,types:[...new Set(placements.filter(p=>p.district===i).map(p=>p.type))]})),rejectedCandidates:registry.rejected,reasonCounts:registry.reasons,clearanceMetres:.45};
 const conflicts=[];for(let i=0;i<placements.length;i++)for(let j=i+1;j<placements.length;j++)if(overlap(placements[i],placements[j],.44))conflicts.push([placements[i].id,placements[j].id]);
 audit.conflicts=conflicts;audit.ok=conflicts.length===0;return {placements,audit};
}
