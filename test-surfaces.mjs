import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import * as THREE from './vendor/build/three.module.js';
import {moduleURI} from './tools/resolve-local.mjs';import {compileFixture} from './tools/compile-fixture.mjs';
const{resolveCoplanar,subtractConvex,polygonWidth}=await import(moduleURI(path.resolve('surface-ownership.js')));
const square=[[0,0],[4,0],[4,4],[0,4]],result=subtractConvex(square,[[1,1],[3,1],[3,3],[1,3]]);
const area=p=>Math.abs(p.reduce((a,v,i)=>{const b=p[(i+1)%p.length];return a+v[0]*b[1]-v[1]*b[0];},0))/2;
assert.equal(result.overlap,4);assert.equal(result.pieces.reduce((a,p)=>a+area(p),0),12);assert.equal(subtractConvex(square,[[4,0],[5,0],[5,4],[4,4]]).overlap,0);
assert.equal(polygonWidth(square),4);assert.equal(polygonWidth([[0,0],[30,0],[30,.001],[0,.001]]),.001);
const reports=[];
for(const seed of['HACKERPUNK-02','HP-QA-2','HP-QA-99']){
 globalThis.gc?.();const f=compileFixture(seed);f.B.finish();const repair=f.B.surfaceReport;
 const sources=[];f.root.traverse(o=>{if(!o.isMesh)return;const count=o.isInstancedMesh?o.count:1;for(let i=0;i<count;i++){let g=o.geometry.clone();if(g.index){const old=g;g=g.toNonIndexed();old.dispose();}if(o.isInstancedMesh){const m=new THREE.Matrix4();o.getMatrixAt(i,m);g.applyMatrix4(m);}sources.push({id:sources.length,geometry:g,layer:o.userData.layer,owner:o.name});}});
 const residual=resolveCoplanar(sources);sources.forEach(s=>s.geometry.dispose());sources.length=0;
 const report={seed,repair,residual:{triangles:residual.clippedTriangles,area:residual.removedArea,maxArea:residual.maxOverlapArea,maxWidth:residual.maxOverlapWidth,significantOverlapEvents:residual.significantOverlapEvents,widestExample:residual.widestExample,events:residual.overlapEvents,examples:residual.examples},infill:f.compiled.infill.audit};reports.push(report);console.log(JSON.stringify(report));f.dispose();
}
fs.mkdirSync('qa-v05',{recursive:true});fs.writeFileSync('qa-v05/surfaces.json',JSON.stringify(reports,null,2));
// Verify the actual final Float32 mesh. Require a 0.1 mm maximum support-strip
// width AND a small aggregate residual area, retaining all raw numerical values.
assert(reports.every(r=>r.residual.maxWidth<.0001&&r.residual.significantOverlapEvents===0&&r.residual.area<.03),'Residual face overlap exceeds 0.1 mm edge-rounding tolerance');
