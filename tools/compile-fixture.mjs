import * as THREE from '../vendor/build/three.module.js';
import {moduleURI} from './resolve-local.mjs';import path from 'node:path';
export const {GeometryBatch}=await import(moduleURI(path.resolve('geometry-batch.js')));
export const {planCity,compileDistricts,auditDistricts}=await import(moduleURI(path.resolve('districts.js')));
export function compileFixture(seed='HACKERPUNK-02',height=1){
 const boxes=[],root=new THREE.Group(),mats=new Proxy({}, {get:(t,k)=>t[k]||(t[k]=new THREE.MeshStandardMaterial())}),B=new GeometryBatch(root,mats,c=>boxes.push(c),[]),v=(...a)=>new THREE.Vector3(...a);
 const rail=(x1,z1,x2,z2,y)=>{const len=Math.hypot(x2-x1,z2-z1);B.beam(v(x1,y+1.05,z1),v(x2,y+1.05,z2),.085);B.beam(v(x1,y+.46,z1),v(x2,y+.46,z2),.055);for(let i=0;i<=Math.ceil(len/2.6);i++){const t=i/Math.ceil(len/2.6);B.box(x1+(x2-x1)*t,y+.54,z1+(z2-z1)*t,.09,1.08,.09,'steel');}};
 const pipe=(a,b,r=.16,mat='copper')=>{B.beam(v(...a),v(...b),r,mat,true,true);const A=v(...a),D=v(...b).sub(A),len=D.length(),q=new THREE.Quaternion().setFromUnitVectors(v(0,1,0),D.clone().normalize());for(let t=2;t<len;t+=4){const p=A.clone().addScaledVector(D,t/len);B.instance('cyl',p.x,p.y,p.z,r*1.45,.2,r*1.45,'steel',true,0,q);}};
 const sign=(text,x,y,z,w,h,rot=0)=>B.scope('signage',text,()=>{const g=new THREE.PlaneGeometry(w,h);g.rotateY(rot);g.translate(x,y,z);B.geometry(g,'adScreen',true);B.box(x-Math.sin(rot)*.2,y,z-Math.cos(rot)*.2,w+.3,h+.3,.2,'black',false,true,rot);});
 const city=planCity(seed,height),compiled=compileDistricts({B,mats,sign,rail,pipe,indexCollider:c=>boxes.push(c)},city),audit=auditDistricts(city,compiled);
 return{city,compiled,audit,boxes,B,root,dispose(){for(const s of B.items)s.geometry.dispose();B.dispose();root.traverse(o=>{if(o.isInstancedMesh)o.dispose();else o.geometry?.dispose();});for(const m of Object.values(mats))m.dispose();}};
}
