import fs from 'node:fs';import assert from 'node:assert/strict';import {compileFixture} from './tools/compile-fixture.mjs';
const reports=[];
for(const seed of ['HACKERPUNK-02','HP-QA-99']){
 const f=compileFixture(seed),bottoms=new Map();
 for(const item of f.B.items){item.geometry.computeBoundingBox();const y=item.geometry.boundingBox.min.y;bottoms.set(item.owner,Math.min(bottoms.get(item.owner)??Infinity,y));}
 const missing=f.compiled.infill.placements.filter(p=>!Number.isFinite(bottoms.get(p.id))||Math.abs(bottoms.get(p.id)-p.y)>.003).map(p=>({id:p.id,type:p.type,mount:p.mount,bottom:bottoms.get(p.id),supportHeight:p.y}));
 reports.push({seed,assemblies:f.compiled.infill.placements.length,missingSupportContacts:missing});f.dispose();globalThis.gc?.();
}
fs.mkdirSync('qa-v06',{recursive:true});fs.writeFileSync('qa-v06/grounding.json',JSON.stringify(reports,null,2));console.log(JSON.stringify(reports,null,2));assert(reports.every(r=>!r.missingSupportContacts.length),'Infill assembly does not meet its mounting plane');
