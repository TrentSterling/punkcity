/** Cheap baked 2.5D light pools. Deliberately approximate, not shadowed point lights.
 * Two shared textures: street and elevated promenade. Updated only on regeneration.
 */
import * as THREE from 'three';
const N=256,SIZE=640,night={value:0};
const make=()=>{const t=new THREE.DataTexture(new Uint8Array(N*N*4),N,N,THREE.RGBAFormat);t.minFilter=t.magFilter=THREE.LinearFilter;t.needsUpdate=true;return{value:t};};
const ground=make(),upper=make();
export const setPlaceNight=v=>{night.value=v?1:0;};
export function bakePlaceLighting(places,city){
 const emitters=[...(places?.lights||[])];
 for(const b of city.blocks){emitters.push({x:b.x,z:b.z+b.d/2+1,y:3,color:[1,.55,.21],radius:7,power:.24});}
 for(const[uniform,level]of[[ground,0],[upper,16]]){
  const buf=uniform.value.image.data;buf.fill(0);for(let i=3;i<buf.length;i+=4)buf[i]=255;
  for(const e of emitters){if(Math.abs(e.y-level)>8)continue;const cx=(e.x/SIZE+.5)*N,cz=(e.z/SIZE+.5)*N,r=e.radius/SIZE*N;
   for(let z=Math.max(0,Math.floor(cz-r));z<=Math.min(N-1,Math.ceil(cz+r));z++)for(let x=Math.max(0,Math.floor(cx-r));x<=Math.min(N-1,Math.ceil(cx+r));x++){
    const d=Math.hypot(x-cx,z-cz)/r;if(d>1)continue;const a=(1-d*d)**2*(e.power||.55)*255,k=(z*N+x)*4;for(let c=0;c<3;c++)buf[k+c]=Math.min(255,buf[k+c]+e.color[c]*a);
   }
  }uniform.value.needsUpdate=true;
 }
}
export function installPlaceLighting(materials){
 for(const mat of Object.values(materials)){if(!mat?.isMeshStandardMaterial||mat.userData.placeLighting)continue;mat.userData.placeLighting=true;
  const previous=mat.onBeforeCompile.bind(mat),key=mat.customProgramCacheKey.bind(mat);
  mat.onBeforeCompile=shader=>{previous(shader);Object.assign(shader.uniforms,{placeGround:ground,placeUpper:upper,placeNight:night});
   shader.vertexShader='varying vec3 placeP;\n'+shader.vertexShader;
   shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>\nvec4 placeWorld=vec4(position,1.);\n#ifdef USE_INSTANCING\nplaceWorld=instanceMatrix*placeWorld;\n#endif\nplaceP=(modelMatrix*placeWorld).xyz;`);
   shader.fragmentShader='varying vec3 placeP;uniform sampler2D placeGround;uniform sampler2D placeUpper;uniform float placeNight;\n'+shader.fragmentShader;
   shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>\nvec2 placeUV=placeP.xz/640.+.5;vec3 placeLight=texture2D(placeGround,placeUV).rgb*exp(-abs(placeP.y-1.5)*.24)+texture2D(placeUpper,placeUV).rgb*exp(-abs(placeP.y-17.5)*.32);totalEmissiveRadiance+=diffuseColor.rgb*placeLight*placeNight*1.7;`);
  };const cache=key();mat.customProgramCacheKey=()=>cache+'|place-pools-v10';mat.needsUpdate=true;
 }
}
