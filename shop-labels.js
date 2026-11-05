/** Shared shop-label atlas: one GPU material, not one texture per shop instance.
 * Label faces inherit their assembly owner/layer so infill isolation cannot leave floating signs.
 */
import * as THREE from 'three';
const names=['NOODLE // 08','BREW / 24','MED / AUGMENTS','AFTERHOURS','ROOT / BOTANICS','SKYLINE / REPAIR','TEA / REST','CELL / SWAP'];
let material=null;
function atlas(){
 const c=document.createElement('canvas');c.width=2048;c.height=128;const g=c.getContext('2d');
 const accents=['#eec384','#e3ad79','#84d7d2','#d6a6ce','#9dcca2','#dcba85','#b1d8b6','#ecc865'];
 names.forEach((name,i)=>{const x=(i%4)*512,y=Math.floor(i/4)*64;g.fillStyle='#12232b';g.fillRect(x,y,512,64);g.fillStyle=accents[i];g.fillRect(x+9,y+10,4,44);g.fillRect(x+20,y+53,464,2);g.font='700 29px monospace';g.textAlign='center';g.textBaseline='middle';g.fillText(name,x+254,y+31,448);for(let n=0;n<5;n++)g.fillRect(x+456+n*6,y+8,2,6);});
 const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;
 return new THREE.MeshStandardMaterial({map:texture,emissiveMap:texture,emissive:0xffffff,emissiveIntensity:.6,roughness:.65});
}
export function drawShopLabel(api,p,text,center,w,h){
 const i=names.indexOf(text);if(i<0)throw Error('Unknown shop label: '+text);
 if(typeof document!=='undefined'){if(!material)material=atlas();api.mats.shopLabels=material;}
 const g=new THREE.PlaneGeometry(w,h),uv=g.attributes.uv,col=i%4,row=Math.floor(i/4);
 for(let n=0;n<uv.count;n++)uv.setXY(n,(col+.008+uv.getX(n)*.984)/4,1-(row+.98-uv.getY(n)*.96)/2);
 g.rotateY(p.rot);g.translate(center.x,center.y,center.z);api.B.geometry(g,'shopLabels',true);
 api.B.box(center.x-Math.sin(p.rot)*.15,center.y,center.z-Math.cos(p.rot)*.15,w+.16,h+.16,.20,'carbon',false,true,p.rot);
}
