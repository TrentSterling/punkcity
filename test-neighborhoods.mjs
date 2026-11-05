import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';
import {moduleURI} from './tools/resolve-local.mjs';import {compileFixture} from './tools/compile-fixture.mjs';
const {INFILL_CATALOG:C}=await import(moduleURI(path.resolve('infill-catalog.js')));
const reports=[];
for(const seed of ['HACKERPUNK-02','HP-QA-99']){
 let plan=null;
 for(const density of ['balanced','busy','packed']){
  const f=compileFixture(seed,1,{density});const raw=JSON.stringify(f.city);if(plan===null)plan=raw;else assert.equal(raw,plan,'Density moved streets or buildings');
  const placements=f.compiled.infill.placements,byId=new Map(placements.map(p=>[p.id,p])),bottoms=new Map(),escapes=[];
  for(const item of f.B.items){const p=byId.get(item.owner);if(!p)continue;item.geometry.computeBoundingBox();const b=item.geometry.boundingBox;bottoms.set(p.id,Math.min(bottoms.get(p.id)??Infinity,b.min.y));const excess=Math.max(p.x-p.w/2-b.min.x,b.max.x-p.x-p.w/2,p.z-p.d/2-b.min.z,b.max.z-p.z-p.d/2,p.y-b.min.y,b.max.y-p.top);if(excess>.01)escapes.push({type:p.type,id:p.id,excess});}
  const floating=placements.filter(p=>Math.abs(bottoms.get(p.id)-p.y)>.003).map(p=>p.id);
  assert(f.audit.ok&&f.compiled.infill.audit.ok);assert.equal(escapes.length,0);assert.equal(floating.length,0);
  const report={seed,density,assemblies:placements.length,types:Object.keys(f.compiled.infill.audit.byType).length,escapes,floating,unchangedCityPlan:true};reports.push(report);
  if(seed==='HACKERPUNK-02'&&density==='busy'){assert.equal(report.types,Object.keys(C).length);assert(report.assemblies>450);}
  f.dispose();globalThis.gc?.();
 }
}
fs.mkdirSync('qa-v06',{recursive:true});fs.writeFileSync('qa-v06/neighborhoods.json',JSON.stringify(reports,null,2));console.log(JSON.stringify(reports,null,2));
