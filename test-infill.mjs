import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import * as THREE from './vendor/build/three.module.js';
const ROOT=path.dirname(fileURLToPath(import.meta.url));
import {compileFixture} from './tools/compile-fixture.mjs';
function compile(seed,height=1){globalThis.gc?.();const f=compileFixture(seed,height);const {city,compiled,audit,boxes}=f;f.dispose();return{city,compiled,audit,boxes};}
const results=[];
for(const height of[.55,1,1.6])for(const seed of['HACKERPUNK-02','HP-QA-1','HP-QA-2','HP-QA-3','HP-QA-99']){
 const {city,compiled,audit}=compile(seed,height),repeat=compile(seed,height);
 const deterministic=JSON.stringify(city)===JSON.stringify(repeat.city)&&JSON.stringify(compiled)===JSON.stringify(repeat.compiled);
 results.push({seed,height,...audit,deterministic});
}
const {compiled,boxes}=compile('HACKERPUNK-02');
const src=fs.readFileSync(path.join(ROOT,'citylab.js'),'utf8'),movement=src.slice(src.indexOf('const player={'),src.indexOf('const grappleGeo='));
const run=new Function('THREE','allBoxes','stairs',`
const v3=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z),clamp=THREE.MathUtils.clamp;
const camera=new THREE.PerspectiveCamera(62,1,.1,1400);camera.rotation.order='YXZ';let hudDirty=false;
const collision=allBoxes,spatial=new Map();
for(const [i,c]of collision.entries())for(let x=Math.floor(c.min.x/12);x<=Math.floor(c.max.x/12);x++)for(let z=Math.floor(c.min.z/12);z<=Math.floor(c.max.z/12);z++){const key=x+','+z;if(!spatial.has(key))spatial.set(key,[]);spatial.get(key).push(i);}
${movement}
const output=[];
for(const s of stairs){
 const x=s.footprint.x,z=s.footprint.z-s.footprint.d/2;
 player.mode='walk';player.gear=0;player.feet.set(x-1.475,.29,z+1.0);player.velocity.set(0,0,0);player.grounded=true;
 function walkTo(xx,zz){keys.clear();keys.add('KeyW');let steps=0;
  while(Math.hypot(xx-player.feet.x,zz-player.feet.z)>.10&&steps<700){yaw=Math.atan2(player.feet.x-xx,player.feet.z-zz);stepPlayer(1/60);steps++;}
  keys.clear();player.velocity.x=player.velocity.z=0;return steps;
 }
 for(let f=0;f<4;f++){
  const left=f%2===0,xx=x+(left?-1:1)*1.475;walkTo(xx,left?z+8.8:z+.8);
  if(f<3)walkTo(x+(left?1:-1)*1.475,left?z+8.8:z+.8);
 }
 walkTo(x,z-.5);output.push({block:s.block,feet:player.feet.toArray(),reachedSquare:player.feet.y>15.9&&player.feet.z<z+.2,gear:player.gear});
}
return output;`);
const stairWalk=run(THREE,boxes,compiled.urban.stairs);
const report={revision:'0.5.0',cases:results,stairWalk,pass:results.every(r=>r.ok&&r.deterministic)&&stairWalk.every(s=>s.reachedSquare)};
fs.mkdirSync(path.join(ROOT,'qa-v05'),{recursive:true});fs.writeFileSync(path.join(ROOT,'qa-v05','geometry.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify({cases:results.length,geometryPass:results.every(r=>r.ok&&r.deterministic),audit:results[5],stairWalk,pass:report.pass},null,2));
if(!report.pass)process.exitCode=1;
