import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {resolveCoplanar,patchedArrays} from './surface-ownership.js';
export const LAYERS=['streets','buildings','traversal','armor','frontage','services','rooftops','signage','retrofit','places','context'];
export class GeometryBatch{
 constructor(root,materials,collider,drawObjects){this.root=root;this.materials=materials;this.collider=collider;this.drawObjects=drawObjects;this.layer='buildings';this.owner='city';this.items=[];this.total=0;this.structures=0;this.duplicatesRemoved=0;this.seen=new Set();this.merge=new Map();this.boxes=[];this.surfaceReport=null;this.unit={box:new THREE.BoxGeometry(1,1,1),cyl:new THREE.CylinderGeometry(1,1,1,10),sphere:new THREE.SphereGeometry(1,8,5)};this.pose=new THREE.Object3D();}
 scope(layer,owner,fn){const old=[this.layer,this.owner];this.layer=layer;this.owner=owner;try{return fn();}finally{[this.layer,this.owner]=old;}}
 geometry(g,mat,dress=false){if(g.index){const old=g;g=g.toNonIndexed();old.dispose();}if(!g.attributes.normal)g.computeVertexNormals();if(!g.attributes.uv)g.setAttribute('uv',new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count*2),2));if(!g.attributes.facadeSeed)g.setAttribute('facadeSeed',new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count),1));this.items.push({id:this.items.length,geometry:g,mat,layer:this.layer,owner:this.owner,dress});}
 box(x,y,z,w,h,d,mat='concrete',solid=false,dress=false,rot=0){if(!(w>0&&h>0&&d>0))return;this.instance('box',x,y,z,w,h,d,mat,dress&&!solid,rot);if(solid&&rot===0){const c=new THREE.Box3(new THREE.Vector3(x-w/2,y-h/2,z-d/2),new THREE.Vector3(x+w/2,y+h/2,z+d/2));this.collider(c);this.boxes.push({x,z,w,d,bottom:y-h/2,top:y+h/2,owner:this.owner,layer:this.layer});}}
 instance(shape,x,y,z,w,h,d,mat,dress=false,rot=0,q=null){
  const p=this.pose;p.position.set(x,y,z);p.scale.set(w,h,d);p.rotation.set(0,rot,0);if(q)p.quaternion.copy(q);p.updateMatrix();
  const signature=shape+'|'+p.matrix.elements.map(n=>n.toFixed(6)).join(',');if(this.seen.has(signature)){this.duplicatesRemoved++;return;}this.seen.add(signature);
  const g=this.unit[shape].clone().toNonIndexed();g.applyMatrix4(p.matrix);g.setAttribute('facadeSeed',new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count),1));this.items.push({id:this.items.length,geometry:g,shape,matrix:p.matrix.clone(),mat,layer:this.layer,owner:this.owner,dress});this.total++;
 }
 beam(a,b,width,mat='steel',dress=true,round=false){const dir=b.clone().sub(a),len=dir.length();if(len<1e-6)return;const mid=a.clone().add(b).multiplyScalar(.5),q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),dir.multiplyScalar(1/len));this.instance(round?'cyl':'box',mid.x,mid.y,mid.z,width,len,width,mat,dress,0,q);}
 finish(){
  const t=performance.now();this.surfaceReport=resolveCoplanar(this.items);this.surfaceReport.resolveMs=Math.round(performance.now()-t);this.surfaceReport.duplicatePrimitivesRemoved=this.duplicatesRemoved;
  const instances=new Map(),merged=new Map();
  const add=(map,key,value)=>{if(!map.has(key))map.set(key,[]);map.get(key).push(value);};
  for(const s of this.items){const key=[s.layer,s.mat,s.dress?1:0].join('|');
   if(s.shape&&!s.patches.size){add(instances,key+'|'+s.shape,s);s.geometry.dispose();}
   else{let g=s.geometry;if(s.patches.size){const arr=patchedArrays(s);g.dispose();g=new THREE.BufferGeometry();for(const[name,values]of Object.entries(arr))g.setAttribute(name,new THREE.Float32BufferAttribute(values,name==='position'||name==='normal'?3:name==='uv'?2:1));}if(g.attributes.position.count)add(merged,key,{...s,geometry:g});else g.dispose();}
  }
  const register=(m,s)=>{m.castShadow=!['paint','cyan','amber','warm','red','adScreen','retroDisplay','asphalt'].includes(s.mat);m.receiveShadow=true;m.renderOrder=s.mat==='paint'?2:0;m.userData={layer:s.layer,dress:s.dress,original:this.materials[s.mat],owned:s.mat.startsWith('sign/')};m.name=s.layer+' / '+s.mat;this.root.add(m);this.drawObjects.push(m);};
  for(const items of instances.values()){const s=items[0],m=new THREE.InstancedMesh(this.unit[s.shape],this.materials[s.mat],items.length);items.forEach((o,i)=>m.setMatrixAt(i,o.matrix));m.instanceMatrix.needsUpdate=true;m.computeBoundingSphere();register(m,s);}
  for(const items of merged.values()){const gs=items.map(s=>s.geometry),g=mergeGeometries(gs,false);gs.forEach(g=>g.dispose());register(new THREE.Mesh(g,this.materials[items[0].mat]),items[0]);}
  this.surfaceReport.batches=instances.size+merged.size;this.items=[];
 }
 dispose(){for(const g of Object.values(this.unit))g.dispose();}
}
