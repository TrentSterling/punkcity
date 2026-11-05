import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from './vendor/build/three.module.js';
import {compileFixture} from './tools/compile-fixture.mjs';
const f=compileFixture(),s=f.compiled.streets;
assert(f.audit.ok,JSON.stringify(f.audit.errors));assert.equal(s.segments.length,84);assert.equal(s.junctions.length,49);assert.equal(s.crossings,120);assert.equal(s.ramps.length,240);assert.equal(f.compiled.infill.placements.length,688,'Street work must preserve default infill');
let paired=0;
for(const road of s.segments)if(road.crossings){
 for(const t of[road.a+4.2,road.b-4.2])for(const side of[-1,1]){
  const p=road.axis==='z'?[road.c+side*road.width/2,t]:[t,road.c+side*road.width/2];
  const matches=s.ramps.filter(r=>Math.hypot(r.from[0]-p[0],r.from[2]-p[1])<.002);assert.equal(matches.length,1,'Crossing must meet exactly one ramp at each end');paired++;
 }
}
const src=fs.readFileSync('citylab.js','utf8'),movement=src.slice(src.indexOf('const player={'),src.indexOf('const grappleGeo='));
const walk=new Function('THREE','allBoxes','ramps',`
const v3=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z),clamp=THREE.MathUtils.clamp;
const camera=new THREE.PerspectiveCamera();camera.rotation.order='YXZ';let hudDirty=false;const collision=allBoxes,spatial=new Map();
for(const[i,b]of collision.entries())for(let x=Math.floor(b.min.x/12);x<=Math.floor(b.max.x/12);x++)for(let z=Math.floor(b.min.z/12);z<=Math.floor(b.max.z/12);z++){const k=x+','+z;if(!spatial.has(k))spatial.set(k,[]);spatial.get(k).push(i);}
${movement}
const result=[];
for(const r of ramps){
 const dx=(r.to[0]-r.from[0])/r.run,dz=(r.to[2]-r.from[2])/r.run;
 player.mode='walk';player.gear=0;player.feet.set(r.from[0]-dx*.8,.015,r.from[2]-dz*.8);player.velocity.set(0,0,0);player.grounded=true;keys.clear();keys.add('KeyW');
 const goal=[r.to[0]+dx*.35,r.to[2]+dz*.35];let n=0;
 while(Math.hypot(goal[0]-player.feet.x,goal[1]-player.feet.z)>.10&&n++<180){yaw=Math.atan2(player.feet.x-goal[0],player.feet.z-goal[1]);stepPlayer(1/60);}
 result.push({block:r.block,side:r.side,reached:Math.hypot(goal[0]-player.feet.x,goal[1]-player.feet.z)<.11&&player.feet.y>.25,steps:n});
}
return result;`);
const walks=walk(THREE,f.boxes,s.ramps);assert(walks.every(r=>r.reached),JSON.stringify(walks.filter(r=>!r.reached)));
const report={audit:f.audit.streets,infill:f.compiled.infill.audit,pairedRampEndpoints:paired,starterRampWalks:walks,pass:true};fs.mkdirSync('qa-v07',{recursive:true});fs.writeFileSync('qa-v07/streets.json',JSON.stringify(report,null,2));console.log(JSON.stringify({audit:report.audit,infill:report.infill.placements,paired,starterRampWalks:walks.length,pass:true},null,2));f.dispose();
