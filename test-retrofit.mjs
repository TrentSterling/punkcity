import assert from 'node:assert/strict';import fs from 'node:fs';
import {compileFixture} from './tools/compile-fixture.mjs';import {moduleURI} from './tools/resolve-local.mjs';
const{overlap,PlacementRegistry}=await import(moduleURI('./placement.js'));
const{planRetrofit}=await import(moduleURI('./retrofit.js'));const reports=[];
for(const height of[.55,1,1.6])for(const seed of['HACKERPUNK-02','HP-QA-1','HP-QA-99']){
 const f=compileFixture(seed,height),p=f.compiled.retro;assert(f.audit.ok,JSON.stringify(f.audit.errors));assert(p.audit.ok);assert(p.placements.length>100);
 const grid=new PlacementRegistry();p.baseReservations.forEach(r=>grid.reserve(r));const failures=[];
 for(const a of p.placements){
  if(a.type!=='cable-bundle')assert(a.y-.6>=4.8);
  const nearby=new Set();for(const key of grid.keys(a.bounds,.05))for(const r of grid.grid.get(key)||[])nearby.add(r);
  for(const b of nearby){if(b.kind==='existing'&&b.layer==='buildings'&&b.owner===a.host)continue;if(overlap(a.bounds,b,.05))failures.push({a:a.id,b:b.id});}
 }
 assert.equal(failures.length,0,JSON.stringify(failures.slice(0,5)));
 const byOwner=new Map();for(const item of f.B.items){if(item.layer!=='retrofit')continue;const pos=item.geometry.attributes.position;if(!byOwner.has(item.owner))byOwner.set(item.owner,[]);byOwner.get(item.owner).push(pos);}
 for(const p0 of p.placements)for(const pos of byOwner.get(p0.id)||[])for(let i=0;i<pos.count;i++){
  const x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i),c=Math.cos(p0.rot),s=Math.sin(p0.rot),u=(x-p0.x)*c-(z-p0.z)*s,v=(x-p0.x)*s+(z-p0.z)*c;
  // Brackets may contact the host plane. The millimetre allowance includes Float32 conversion.
  assert(Math.abs(u)<=p0.width/2+.16&&v>=-.141&&v<=p0.depth+.16&&y>=p0.bounds.bottom-.14&&y<=p0.bounds.top+.06,`${p0.type} outside socket ${p0.id}: ${[u,y-p0.y,v]}`);
 }
 assert.equal(p.packed.values.length,p.placements.length*9);assert.equal(new Set(p.packed.ids).size,p.placements.length);
 const again=planRetrofit(f.city,f.compiled,f.B.items.filter(s=>s.layer!=='retrofit'));assert.deepEqual(again.packed,p.packed,'Same input must produce same attachments');
 reports.push({seed,height,...p.audit});console.log(seed,height,p.audit.assemblies);f.dispose();globalThis.gc?.();
}
fs.mkdirSync('qa-v09',{recursive:true});fs.writeFileSync('qa-v09/retrofit.json',JSON.stringify({pass:true,deterministic:true,fixtures:reports},null,2));
