import assert from 'node:assert/strict';import fs from 'node:fs';
import {compileFixture} from './tools/compile-fixture.mjs';
import {moduleURI} from './tools/resolve-local.mjs';
const {overlap}=await import(moduleURI('./placement.js'));const rows=[];
for(const seed of['HACKERPUNK-02','HP-QA-1','HP-QA-99'])for(const height of[.55,1,1.6]){
 const f=compileFixture(seed,height),p=f.compiled.places;assert(f.audit.ok,JSON.stringify(f.audit.errors));assert(p.audit.ok);assert(p.audit.tenantRows>=10);assert.equal(p.audit.upperRooms,16);
 const groups=new Map(p.groups.map(g=>[g.id,g]));const errors=[];
 for(const item of f.B.items){if(item.layer!=='places')continue;const g=groups.get(item.owner);assert(g);item.geometry.computeBoundingBox();const a=item.geometry.boundingBox;
  if(a.min.x<g.x-g.w/2-.11||a.max.x>g.x+g.w/2+.11||a.min.z<g.z-g.d/2-.55||a.max.z>g.z+g.d/2+.55||a.min.y<g.y-.01||a.max.y>g.y+g.h+.10)errors.push({owner:item.owner,bounds:[a.min.toArray(),a.max.toArray()]});
 }
 assert.equal(errors.length,0,JSON.stringify(errors.slice(0,4)));
 for(const a of p.approaches)for(const i of f.compiled.infill.placements)assert(!overlap(a,i,.02),'Blocked venue customer approach');
 for(const g of p.groups.filter(g=>g.type==='upper-room')){
  const routes=[{x:g.x,z:g.z,w:12,d:7,bottom:16.01,top:19.2},{x:g.x,z:g.z,w:7,d:12,bottom:16.01,top:19.2}];
  for(const a of [...g.reservedParts,...g.corners||[]])for(const r of routes)assert(!overlap(a,r,.01),'Upper venue intrudes on 7m route');
 }
 rows.push({seed,height,places:p.audit,infill:f.compiled.infill.audit.placements,pass:true});f.dispose();globalThis.gc?.();console.log(seed,height,'passed');
}
fs.mkdirSync('qa-v10',{recursive:true});fs.writeFileSync('qa-v10/places.json',JSON.stringify({pass:true,fixtures:rows},null,2));
