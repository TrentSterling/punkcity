/** Metric, derivative-filtered glazing with stable per-building room identity. */
import * as THREE from 'three';
const night={value:0};
export function setFacadeNight(value){night.value=value?1:0;}
export function facadeMaterial(color,type){
  const material=new THREE.MeshStandardMaterial({color,roughness:.78,metalness:.08,dithering:true});
  material.onBeforeCompile=shader=>{
    shader.uniforms.facadeNight=night;
    shader.vertexShader='attribute float facadeSeed;varying float fSeed;varying vec2 fUV;varying vec3 fP;varying vec3 fN;\n'+shader.vertexShader;
    shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
fSeed=facadeSeed;fUV=uv;fP=(modelMatrix*vec4(position,1.)).xyz;fN=normalize(mat3(modelMatrix)*normal);`);
    shader.fragmentShader=`uniform float facadeNight;varying float fSeed;varying vec2 fUV;varying vec3 fP;varying vec3 fN;
float fh(vec2 p){vec3 q=fract(vec3(p.xyx)*.1031);q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}
float rectAA(vec2 p,vec2 size,vec2 aa){vec2 a=smoothstep(size-aa,size+aa,abs(p));return (1.-a.x)*(1.-a.y);}
`+shader.fragmentShader;
    const glass=type===1,half=glass?'.478,.405':type===2?'.29,.28':'.35,.335';
    shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
vec2 cell=fract(fUV),idx=floor(fUV),aa=max(fwidth(fUV),vec2(.0003));
float buildingId=floor(fSeed+.5);
float identity=fh(idx+vec2(buildingId,buildingId*.31));
vec2 aperture=vec2(${half});
float opening=rectAA(cell-.5,aperture,aa);
float surround=rectAA(cell-.5,aperture+vec2(.028,.026),aa);
float sill=rectAA(cell-vec2(.5,.13),vec2(.39,.026),aa);
vec3 wall=diffuseColor.rgb;
float joints=rectAA(cell-.5,vec2(.496,.49),aa);
wall*=mix(.73,1.,joints);
wall*=.94+.10*fh(vec2(buildingId,13.));
wall*=mix(.72,1.,smoothstep(0.,8.,fP.y));
vec3 N=normalize(fN),T=normalize(cross(vec3(0,1,0),N)),eye=normalize(cameraPosition-fP);
vec3 ro=vec3((cell-.5)/aperture,1.);
vec3 rd=vec3(-dot(eye,T),-eye.y,-max(.12,dot(eye,N)));
vec3 ts=(sign(rd)-ro)/(rd+vec3(.00001));float distance=max(0.,min(ts.x,min(ts.y,ts.z)));
vec3 room=ro+rd*distance;
float back=step(.99,abs(room.z));
float ceiling=step(.985,room.y),floorSurface=step(room.y,-.985);
vec3 roomColor=mix(vec3(.024,.035,.038),vec3(.15,.16,.14),back);
roomColor=mix(roomColor,vec3(.095,.10,.095),ceiling);
roomColor=mix(roomColor,vec3(.018,.025,.027),floorSurface);
float desk=step(abs(room.x-.12),.55)*step(room.y,-.25)*step(-.55,room.y)*back;
roomColor=mix(roomColor,vec3(.045,.047,.04),desk);
float blindDepth=.22+identity*.65;
float blinds=step(cell.y,blindDepth)*step(.53,identity);
float blindLine=smoothstep(.11-aa.y*12.,.11+aa.y*12.,abs(fract(cell.y*12.)-.5));
roomColor=mix(roomColor,vec3(.13,.15,.14)*mix(.65,1.,blindLine),blinds*.76);
float fresnel=pow(1.-max(0.,dot(eye,N)),4.);
vec3 reflected=mix(vec3(.065,.14,.18),vec3(.32,.43,.46),clamp(eye.y*.8+.55,0.,1.));
vec3 glazing=mix(roomColor*vec3(.76,.91,1.),reflected,${glass?'.35':'.24'}+fresnel*.45);
float occupied=step(.84,identity);
glazing=mix(glazing,glazing+vec3(.30,.20,.09),occupied*facadeNight*.65);
vec3 frame=vec3(.045,.061,.066);
diffuseColor.rgb=mix(wall,frame,surround);diffuseColor.rgb=mix(diffuseColor.rgb,glazing,opening);
${glass?'':'diffuseColor.rgb=mix(diffuseColor.rgb,wall*.8,sill*.75);'}
float filtered=clamp(max(aa.x,aa.y)*2.-.55,0.,1.);
diffuseColor.rgb=mix(diffuseColor.rgb,mix(wall,vec3(.13,.19,.21),${glass?'.83':'.51'}),filtered);
`);
    shader.fragmentShader=shader.fragmentShader.replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=mix(.84,.22,opening);');
    shader.fragmentShader=shader.fragmentShader.replace('#include <metalnessmap_fragment>','#include <metalnessmap_fragment>\nmetalnessFactor=mix(.04,.38,opening);');
    shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\ntotalEmissiveRadiance+=vec3(.44,.255,.10)*opening*occupied*facadeNight*.7;');
  };
  material.customProgramCacheKey=()=>`punkcity-v03-facade-${type}`;
  return material;
}

export function pavingMaterial(){
 const m=new THREE.MeshStandardMaterial({color:0x8d9693,roughness:.94,metalness:.03});
 m.onBeforeCompile=s=>{
  s.vertexShader='varying vec3 paveWorld;varying vec3 paveNormal;\n'+s.vertexShader;
  s.vertexShader=s.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
paveWorld=position;paveNormal=normal;
#ifdef USE_INSTANCING
paveWorld=(instanceMatrix*vec4(position,1.)).xyz;paveNormal=normalize(mat3(instanceMatrix)*normal);
#endif
paveWorld=(modelMatrix*vec4(paveWorld,1.)).xyz;paveNormal=normalize(mat3(modelMatrix)*paveNormal);`);
  s.fragmentShader='varying vec3 paveWorld;varying vec3 paveNormal;\n'+s.fragmentShader;
  s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
vec2 p=paveWorld.xz/3.2;vec2 fw=max(fwidth(p),vec2(.0003));vec2 f=abs(fract(p)-.5);
float joint=max(smoothstep(.493-fw.x,.493+fw.x,f.x),smoothstep(.493-fw.y,.493+fw.y,f.y));
float horizontal=smoothstep(.7,.95,abs(paveNormal.y));
diffuseColor.rgb*=1.-.36*joint*horizontal;
`);
 };m.customProgramCacheKey=()=> 'punkcity-metric-paving-v03';return m;
}
