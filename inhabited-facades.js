/** Human-scale fenestration. UV units are complete 2.4-3 m bays / 3.25 m stories.
 * Body, frame, glass, weathering and service functions have separate visual scales.
 */
import * as THREE from 'three';
export function inhabitedFacade(color,type,night){
 const m=new THREE.MeshStandardMaterial({color,roughness:.82,metalness:.08,dithering:true});
 m.onBeforeCompile=s=>{
  s.uniforms.cyberNight=night;
  s.vertexShader='attribute float facadeSeed;varying float lifeID;varying vec2 lifeUV;varying vec3 lifeP;varying vec3 lifeN;\n'+s.vertexShader;
  s.vertexShader=s.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
lifeID=facadeSeed;lifeUV=uv;lifeP=(modelMatrix*vec4(position,1.)).xyz;lifeN=normalize(mat3(modelMatrix)*normal);`);
  s.fragmentShader=`uniform float cyberNight;varying float lifeID;varying vec2 lifeUV;varying vec3 lifeP;varying vec3 lifeN;
float lhash(vec2 p){vec3 a=fract(vec3(p.xyx)*.1031);a+=dot(a,a.yzx+33.33);return fract((a.x+a.y)*a.z);}
float lbox(vec2 p,vec2 extent,vec2 aa){vec2 f=1.-smoothstep(extent-aa,extent+aa,abs(p));return f.x*f.y;}
`+s.fragmentShader;
  s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
vec2 uv=lifeUV,cell=fract(uv),bay=floor(uv),aa=max(fwidth(uv),vec2(.0004));
float id=floor(lifeID+.5),family=mod(id,5.);float seed=lhash(bay+vec2(id,id*.17));
// Neutral wall is the dominant surface, not a large repeated armored tile.
vec3 wall=diffuseColor.rgb;float cw=cell.x-.5,cy=cell.y-.56;
vec2 opening=vec2(.29,.255);
if(family<.5)opening=vec2(.43,.31);
else if(family<1.5)opening=vec2(.23,.28);
else if(family<2.5)opening=vec2(.34,.245);
else if(family<3.5)opening=vec2(.40,.18);
${type===1?'opening=vec2(.458,.37);':type===2?'opening=vec2(.33,.20);':''}
float frame=lbox(vec2(cw,cy),opening+vec2(.026,.025),aa);
float win=lbox(vec2(cw,cy),opening,aa);
float sill=lbox(cell-vec2(.5,.245),vec2(opening.x+.045,.018),aa);
float floorJoint=1.-smoothstep(.007,.007+aa.y,abs(cell.y-.035));
float plaster=.97+.05*lhash(vec2(floor(uv.x*.38),floor(uv.y*.47)+id));
float streak=(.5+.5*sin(lifeP.x*4.1+lifeP.z*3.3+id))*smoothstep(.72,.96,cell.y)*(1.-frame);
wall*=plaster*(1.-.14*streak);wall=mix(wall,wall*.62,floorJoint*.35);
// Aged masonry, curtain wall and modular housing do not share one chamfer motif.
if(family>3.5&&${type===1?'false':'true'}){vec2 brick=fract(vec2(uv.x*5.+floor(uv.y*11.)*.5,uv.y*11.));vec2 ba=max(aa*vec2(5.,11.),.001);float mortar=max(1.-smoothstep(.035,.035+ba.x,brick.x),1.-smoothstep(.06,.06+ba.y,brick.y));wall*=1.-mortar*.15;}
vec3 N=normalize(lifeN),T=normalize(cross(vec3(0,1,0),N)),eye=normalize(cameraPosition-lifeP);
vec3 ro=vec3(vec2(cw,cy)/opening,1.),rd=vec3(-dot(eye,T),-eye.y,-max(.16,dot(eye,N)));
vec3 rayT=(sign(rd)-ro)/(rd+vec3(.00001));vec3 room=ro+rd*max(0.,min(rayT.x,min(rayT.y,rayT.z)));
float back=step(.99,abs(room.z));float curtain=step(.72,lhash(bay+id+13.))*smoothstep(.05,.65,room.x);
float occupied=step(.65,seed);float fresnel=pow(1.-max(0.,dot(eye,N)),4.);
vec3 roomColor=mix(vec3(.018,.031,.035),vec3(.10,.14,.15),back);roomColor*=mix(.48,1.,smoothstep(-1.,.6,room.y));
roomColor=mix(roomColor,vec3(.21,.19,.15),curtain*.65);
vec3 glass=mix(roomColor,vec3(.18,.29,.34),.14+.40*fresnel);
glass=mix(glass,vec3(.48,.30,.13),cyberNight*occupied*.75);
float mullion=(1.-smoothstep(.013,.013+aa.x,abs(cw)))*win;
if(family<.5||family>2.5)mullion=max(mullion,(1.-smoothstep(.012,.012+aa.y,abs(cy-.03)))*win);
diffuseColor.rgb=mix(wall,wall*.22,frame);diffuseColor.rgb=mix(diffuseColor.rgb,glass,win);diffuseColor.rgb=mix(diffuseColor.rgb,wall*.42,mullion);diffuseColor.rgb=mix(diffuseColor.rgb,wall*1.13,sill);
// No windows on narrow solid corner returns (zero horizontal bay count).
float valid=step(.001,abs(uv.x));diffuseColor.rgb=mix(wall,diffuseColor.rgb,valid);win*=valid;
float distant=clamp(max(aa.x,aa.y)*2.-.45,0.,1.);diffuseColor.rgb=mix(diffuseColor.rgb,mix(wall,vec3(.09,.15,.16),.40),distant);
`);
  s.fragmentShader=s.fragmentShader.replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=mix(.87,.25,win);');
  s.fragmentShader=s.fragmentShader.replace('#include <metalnessmap_fragment>','#include <metalnessmap_fragment>\nmetalnessFactor=mix(.05,.35,win);');
  s.fragmentShader=s.fragmentShader.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\ntotalEmissiveRadiance+=vec3(.65,.32,.11)*win*(1.-mullion)*occupied*cyberNight*.85;');
 };m.customProgramCacheKey=()=>`inhabited-facade-v10-${type}`;return m;
}
