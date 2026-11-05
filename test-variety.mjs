import assert from 'node:assert/strict';import fs from 'node:fs';import {moduleURI} from './tools/resolve-local.mjs';import {compileFixture} from './tools/compile-fixture.mjs';
const {planCity}=await import(moduleURI('./districts.js'));const {auditArchitecture}=await import(moduleURI('./architecture.js'));
const results=[];
for(const height of[.55,1,1.6])for(const seed of['HACKERPUNK-02','HP-QA-1','HP-QA-2','HP-QA-3','HP-QA-99']){
 const city=planCity(seed,height),again=planCity(seed,height),audit=auditArchitecture(city);assert.deepEqual(city,again);assert(audit.ok,JSON.stringify(audit));
 assert.equal(Object.keys(audit.families).length,8);assert(Object.keys(audit.palettes).length>=10);
 assert.equal(city.routeGraph.nodes.length,16);assert.equal(city.upperLinks.length,16);assert.equal(city.blocks.filter(b=>b.accessStair).length,6);
 // Distinct families have distinct relative-volume signatures even without paint.
 const signatures=new Map();for(const t of city.blocks.flatMap(b=>b.towers)){const signature=JSON.stringify(t.design.segments.map(p=>[Math.round((p.x-t.x)/t.w*100),Math.round((p.z-t.z)/t.d*100),Math.round(p.w/t.w*100),Math.round(p.d/t.d*100),Math.round((p.base-t.base)/(t.top-t.base)*100),Math.round(p.h/(t.top-t.base)*100)]));if(!signatures.has(t.design.family))signatures.set(t.design.family,signature);}
 assert.equal(new Set(signatures.values()).size,8,'Massing families must differ geometrically');results.push({seed,height,...audit});
}
const f=compileFixture();assert(f.audit.ok,JSON.stringify(f.audit.errors));assert.equal(f.compiled.urban.scifi.architecture.length,f.city.blocks.flatMap(b=>b.towers).length);
const content={cases:results.length,pass:true,default:results[5],infill:f.compiled.infill.audit,compiledFamilies:f.compiled.urban.scifi.architecture};
fs.mkdirSync('qa-v08',{recursive:true});fs.writeFileSync('qa-v08/variety.json',JSON.stringify(content,null,2));console.log(JSON.stringify(content,null,2));f.dispose();
