import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import * as THREE from './vendor/build/three.module.js';
const ROOT=path.dirname(fileURLToPath(import.meta.url));
const cache=new Map();
function moduleURI(file){
 file=path.resolve(file);if(cache.has(file))return cache.get(file);
 let s=fs.readFileSync(file,'utf8');s=s.replace(/from\s*(['"])([^'"]+)\1/g,(all,quote,spec)=>{
  if(spec==='three')return 'from '+quote+pathToFileURL(path.join(ROOT,'vendor/build/three.module.js')).href+quote;
  if(spec.startsWith('.'))return 'from '+quote+moduleURI(path.resolve(path.dirname(file),spec))+quote;
  return all;
 });const uri='data:text/javascript;base64,'+Buffer.from(s).toString('base64');cache.set(file,uri);return uri;
}
const {planCity,compileDistricts,auditDistricts}=await import(moduleURI(path.join(ROOT,'districts.js')));
function compile(seed,height=1){
 const boxes=[],indexCollider=c=>boxes.push(c);
 const B={merge:new Map(),structures:0,box(x,y,z,w,h,d,mat,solid=false,dress=false,rot=0){if(solid&&rot===0)indexCollider(new THREE.Box3(new THREE.Vector3(x-w/2,y-h/2,z-d/2),new THREE.Vector3(x+w/2,y+h/2,z+d/2)));},instance(){},beam(){}};
 const city=planCity(seed,height),compiled=compileDistricts({B,mats:{},sign(){},rail(){},pipe(){},indexCollider},city),audit=auditDistricts(city,compiled);
 for(const gs of B.merge.values())for(const g of gs)g.dispose();return{city,compiled,audit,boxes};
}
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
const report={revision:'0.4.0',cases:results,stairWalk,pass:results.every(r=>r.ok&&r.deterministic)&&stairWalk.every(s=>s.reachedSquare)};
fs.mkdirSync(path.join(ROOT,'qa-v04'),{recursive:true});fs.writeFileSync(path.join(ROOT,'qa-v04','geometry.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify({cases:results.length,geometryPass:results.every(r=>r.ok&&r.deterministic),audit:results[5],stairWalk,pass:report.pass},null,2));
if(!report.pass)process.exitCode=1;
