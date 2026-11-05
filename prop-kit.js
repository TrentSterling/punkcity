/** Small-scale kit shared by isolated frontage/service/roof generators. */
import * as THREE from 'three';
import {PALETTES} from './scifi.js';
export function propKit(api,sci,p){
 const {B,indexCollider}=api,co=Math.cos(p.rot),si=Math.sin(p.rot),palette=PALETTES[p.district];
 const point=(x,y,z)=>new THREE.Vector3(p.x+co*x+si*z,p.y+y,p.z-si*x+co*z);
 const box=(x,y,z,w,h,d,mat='steel')=>{const v=point(x,y,z);B.box(v.x,v.y,v.z,w,h,d,mat,false,true,p.rot);};
 const casing=(x,y,z,w,h,d,mat=palette.armor,rot=0,cut=.18)=>{const v=point(x,y,z);sci.casing(v.x,v.y,v.z,w,h,d,mat,p.rot+rot,cut);};
 const cyl=(x,y,z,r,h,mat='steel')=>{const v=point(x,y,z);B.instance('cyl',v.x,v.y,v.z,r,h,r,mat,true);};
 const beam=(a,b,width=.09,mat='steel')=>B.beam(point(...a),point(...b),width,mat,true);
 const screen=(x,y,z,w,h,kind=0,rot=0)=>{const v=point(x,y,z);sci.screen(v.x,v.y,v.z,w,h,p.rot+rot,kind);};
 const bodyCollider=(x,y,z,w,h,d)=>{const v=point(x,y,z),W=Math.abs(co)*w+Math.abs(si)*d,D=Math.abs(si)*w+Math.abs(co)*d;indexCollider(new THREE.Box3(new THREE.Vector3(v.x-W/2,v.y-h/2,v.z-D/2),new THREE.Vector3(v.x+W/2,v.y+h/2,v.z+D/2)));};
 const planter=(x,y,z,w,d)=>{box(x,y+.15,z,w,.30,d,'carbon');box(x,y+.40,z-d/2+.08,w,.2,.16,palette.armor);box(x,y+.40,z+d/2-.08,w,.2,.16,palette.armor);box(x-w/2+.08,y+.40,z,.16,.2,d-.32,palette.armor);box(x+w/2-.08,y+.40,z,.16,.2,d-.32,palette.armor);box(x,y+.32,z,w-.34,.05,d-.34,'green');for(let i=0;i<3;i++){const v=point(x-w*.3+i*w*.3,y+.65,z);B.instance('sphere',v.x,v.y,v.z,w*.17,.34,d*.44,'plant',true);}};
 return {B,p,palette,point,box,casing,cyl,beam,screen,bodyCollider,planter};
}
