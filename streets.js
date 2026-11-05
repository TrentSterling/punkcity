/** Punkcity street kit. One owned pavement mesh, paint in the material.
 * Link ribbons stop at junction plates. Sidewalks have rounded corners and
 * lowered crossing ramps; buildings, parcels and random streams are unchanged.
 */
import * as THREE from 'three';
export const STREET_STYLE={curbHeight:.28,cornerRadius:2.4,gutterWidth:.48,crossingOffset:4.2,crossingDepth:2.6,rampWidth:3,rampRun:1.8,rampFlare:.3};
const V=(x,y,z)=>new THREE.Vector3(x,y,z), PI=Math.PI;
const NAMES=['FOUNDRY ROAD','STACK STREET','CIVIC AVENUE','HELIX BOULEVARD','RELAY DRIVE','GARDEN WAY','OUTER CIRCUIT','NORTH SERVICE','ION STREET','CROWN WALK','CENTRAL AVENUE','MARKET STREET','TERRACE ROAD','SOUTH SERVICE'];
const shaderHead=`varying vec3 sWorld;varying vec2 sUV;varying float sCode;
float sh(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float sn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(sh(i),sh(i+vec2(1,0)),f.x),mix(sh(i+vec2(0,1)),sh(i+1.),f.x),f.y);}
float sb(float p,float c,float r){float a=max(fwidth(p)*.8,.002);return 1.-smoothstep(r-a,r+a,abs(p-c));}
float sr(vec2 p,vec2 r){return sb(p.x,0.,r.x)*sb(p.y,0.,r.y);}
float dash(float p,float on,float period){float v=mod(p,period),a=max(fwidth(p),.002);return smoothstep(0.,a,v)*(1.-smoothstep(on-a,on+a,v));}
`;
function material(color,body,key,roughness=.94){
 const m=new THREE.MeshStandardMaterial({color,roughness,metalness:.025});
 m.onBeforeCompile=s=>{
  s.vertexShader='attribute float facadeSeed;varying vec3 sWorld;varying vec2 sUV;varying float sCode;\n'+s.vertexShader;
  s.vertexShader=s.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>\nvec4 sw=vec4(position,1.);\n#ifdef USE_INSTANCING\nsw=instanceMatrix*sw;\n#endif\nsWorld=(modelMatrix*sw).xyz;sUV=uv;sCode=facadeSeed;`);
  s.fragmentShader=shaderHead+s.fragmentShader;
  s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\n'+body);
 };m.customProgramCacheKey=()=>key;return m;
}
const asphalt=`vec2 p=sWorld.xz;float grain=sh(floor(p*55.));float grainFade=1.-clamp(length(fwidth(p*55.)),0.,1.);
float cloud=sn(p*.075)*.55+sn(p*.7)*.3+sn(p*5.)*.15;
diffuseColor.rgb*=.89+.18*cloud+(grain-.5)*.14*grainFade;
`;
export function installStreetMaterials(mats){
 mats.streetJunction=material(0x4e575c,asphalt,'street-junction-07');
 for(const width of[10,14,18]){
  const half=width/2,lanes=width>=14?2:1;
  mats['street'+width]=material(0x4e575c,asphalt+`
float hw=${half.toFixed(1)},nc=${lanes.toFixed(1)},u=sUV.x,v=sUV.y,L=mod(floor(sCode+.5),1000.);
// Local segment length and endpoint flags share the preserved scalar attribute.
L=mod(sCode,1000.);float flags=floor(sCode/1000.+.00001);
float crossing=mod(flags,2.),startAhead=mod(floor(flags/2.),2.),endAhead=mod(floor(flags/4.),2.);
float edge=hw-abs(u),lane=(hw-.82)/nc,d=min(v,L-v);
float gutter=1.-smoothstep(.46,.50,edge);
diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.145,.17,.18)*( .93+.1*sn(p*5.)),gutter);
float joint=sb(edge,.50,.018);diffuseColor.rgb*=1.-joint*.5;
float track=0.;for(int i=0;i<2;i++){if(float(i)>=nc)break;float center=(float(i)+.5)*lane;track+=sb(abs(u),center-.62,.21)+sb(abs(u),center+.62,.21);}
diffuseColor.rgb*=1.-min(track,1.)*.10*smoothstep(1.,5.,d);
float visible=step(8.,d),paint=0.;
float center=(sb(u,-.12,.045)+sb(u,.12,.045))*visible;
diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.49,.32,.065),min(1.,center)*.84);
paint=max(paint,sb(abs(u),hw-.78,.065)*visible);
if(nc>1.)paint=max(paint,sb(abs(u),lane,.055)*dash(v+1.,3.,8.)*visible);
float crossZone=sb(d,4.2,1.30)*crossing;
float zebra=dash(u+hw-.80,.42,.90)*step(.78,edge)*crossZone;
paint=max(paint,zebra);
float stop=sb(v,u>0.?L-6.6:6.6,.16)*step(.38,abs(u))*step(.78,edge)*crossing;
paint=max(paint,stop);
float laneCenter=(floor(abs(u)/lane)+.5)*lane,au=abs(u)-laneCenter;
float av=(u>0.?v-(L-14.):14.-v),ahead=u>0.?endAhead:startAhead;
float shaft=sr(vec2(au,av+.42),vec2(.115,1.12));
float head=step(-.05,av)*step(av,1.30)*(1.-smoothstep(.02,.08,abs(au)-(.74-.55*av)));
paint=max(paint,max(shaft,head)*ahead*step(abs(u),hw-.78));
float wear=.80+.16*sn(p*3.2);diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.62,.61,.54)*wear,clamp(paint,0.,1.));
// Flush inspection covers and gutter grates are shaded on the owning road surface.
vec2 mh=vec2(u+hw-1.65,v-L*.52);float mr=length(mh),cover=1.-smoothstep(.43,.45,mr);
vec3 metal=vec3(.13,.16,.17)*( .82+.12*sn(p*12.));float slots=dash(mh.y+.35,.035,.12)*step(abs(mh.x),.30);metal*=1.-slots*.45;
metal+=vec3(.10)*sb(mr,.385,.016);diffuseColor.rgb=mix(diffuseColor.rgb,metal,cover);
float drain=sr(vec2(edge-.25,d-10.3),vec2(.175,.52));
float grate=dash(v,.045,.14);diffuseColor.rgb=mix(diffuseColor.rgb,mix(vec3(.025),vec3(.22,.25,.26),grate),drain);
`,'street-profile-'+width);
 }
 const paving=`vec2 p=sWorld.xz;vec2 t=p/vec2(1.2,.8);t.x+=mod(floor(t.y),2.)*.5;vec2 f=fract(t);vec2 aa=max(fwidth(t),vec2(.001));
float seam=1.-min(smoothstep(0.,.014+aa.x,min(f.x,1.-f.x)),smoothstep(0.,.018+aa.y,min(f.y,1.-f.y)));
float tile=sh(floor(t));diffuseColor.rgb*=.91+.12*tile;diffuseColor.rgb*=1.-seam*.20;
diffuseColor.rgb*=.96+.07*sn(p*9.);
`;
 mats.streetWalk=material(0x939b98,paving,'street-paving-07');
 mats.streetCurb=material(0xb3b7ad,`diffuseColor.rgb*=.92+.10*sn(sWorld.xz*4.);`,'street-curb-07');
 mats.streetTactile=material(0xb99b59,`vec2 q=fract(sWorld.xz/.16)-.5;float dotMask=1.-smoothstep(.14,.22,length(q));diffuseColor.rgb*=.84+.20*dotMask;`,'street-tactile-07');
 mats.streetSignal=new THREE.MeshStandardMaterial({color:0x4fbfaf,emissive:0x309789,emissiveIntensity:1.3,roughness:.55});
 mats.streetSignalRed=new THREE.MeshStandardMaterial({color:0xc55e43,emissive:0xb63e27,emissiveIntensity:.85,roughness:.55});
 if(typeof document!=='undefined'){
  const canvas=document.createElement('canvas');canvas.width=2048;canvas.height=512;const c=canvas.getContext('2d');
  for(let i=0;i<16;i++){const x=i%4*512,y=Math.floor(i/4)*128;c.fillStyle='#18393d';c.fillRect(x,y,512,128);c.strokeStyle='#8aa4a0';c.lineWidth=4;c.strokeRect(x+6,y+6,500,116);c.fillStyle='#e4dfc4';c.font='bold 33px monospace';c.textAlign='center';c.fillText(NAMES[i]||'PUBLIC ACCESS',x+256,y+66,475);c.fillStyle='#7da9a2';c.font='18px monospace';c.fillText('SECTOR '+String(i+1).padStart(2,'0')+'  /  PUBLIC WAY',x+256,y+100);}
  const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=4;
  mats.streetNames=new THREE.MeshStandardMaterial({map,roughness:.8,emissive:0xffffff,emissiveMap:map,emissiveIntensity:.18});
 }
}

export function compileStreets(api,data){
 const {B,indexCollider,ground}=api,{x:xs,z:zs,widthsX:wx,widthsZ:wz}=data.groundStreets;
 const H=STREET_STYLE.curbHeight,R=STREET_STYLE.cornerRadius,CH=STREET_STYLE.crossingOffset;
 const rec={revision:'0.7.0',junctions:[],segments:[],ramps:[],corners:[],fixtures:[],ownedTopArea:0,expectedArea:0};
 const topArea=pts=>Math.abs(pts.reduce((v,p,i)=>{const b=pts[(i+1)%pts.length];return v+p[0]*b[2]-b[0]*p[2];},0))*.5;
 function face(points,mat,uv=null,code=0,want=[0,1,0]){
  const positions=[],tex=[],indices=[];for(let i=1;i<points.length-1;i++)indices.push([0,i,i+1]);
  for(let ids of indices){const a=V(...points[ids[0]]),normal=V(...points[ids[1]]).sub(a).cross(V(...points[ids[2]]).sub(a));if(normal.dot(V(...want))<0)ids=[ids[0],ids[2],ids[1]];for(const j of ids){positions.push(...points[j]);tex.push(...(uv?.[j]||[points[j][0],points[j][2]]));}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(tex,2));g.setAttribute('facadeSeed',new THREE.Float32BufferAttribute(new Float32Array(positions.length/3).fill(code),1));g.computeVertexNormals();B.geometry(g,mat,false);
  if(want[1]>.5)rec.ownedTopArea+=topArea(points);
 }
 function collider(x0,z0,x1,z1,y){if(x1-x0<.001||z1-z0<.001)return;indexCollider(new THREE.Box3(V(x0,-.60,z0),V(x1,y,z1)));}
 function rectangle(x0,z0,x1,z1,y,mat){face([[x0,y,z0],[x1,y,z0],[x1,y,z1],[x0,y,z1]],mat);}
 function roadRibbon(axis,c,a,b,w,index){
  const across=u=>axis==='z'?c-u:u,at=(u,v)=>axis==='z'?[c-u,0,a+v]:[a+v,0,c+u],L=b-a;
  const cross=index>0&&index<6,flags=(cross?1:0)+(a>(axis==='z'?zs[0]+wz[0]/2:xs[0]+wx[0]/2)+.01?2:0)+(b<(axis==='z'?zs[6]-wz[6]/2:xs[6]-wx[6]/2)-.01?4:0);
  const points=[at(-w/2,0),at(w/2,0),at(w/2,L),at(-w/2,L)];
  face(points,'street'+w,[[-w/2,0],[w/2,0],[w/2,L],[-w/2,L]],flags*1000+L);
  const p=points.map(v=>[v[0],v[2]]),x0=Math.min(...p.map(v=>v[0])),x1=Math.max(...p.map(v=>v[0])),z0=Math.min(...p.map(v=>v[1])),z1=Math.max(...p.map(v=>v[1]));
  collider(x0,z0,x1,z1,0);ground.push({x:(x0+x1)/2,z:(z0+z1)/2,w:x1-x0,d:z1-z0,y:0,kind:'ground'});
  rec.segments.push({axis,index,c,a,b,width:w,length:L,lanes:w>=14?4:2,crossings:cross?2:0,flags});
 }
 function label(index,x,y,z,angle){
  const w=3.2,h=.62,g=new THREE.PlaneGeometry(w,h),uv=g.attributes.uv;
  for(let i=0;i<uv.count;i++)uv.setXY(i,(index%4+uv.getX(i))/4,(3-Math.floor(index/4)+uv.getY(i))/4);
  g.rotateY(angle);g.translate(x,y,z);B.geometry(g,'streetNames',true);
  B.box(x-Math.sin(angle)*.11,y,z-Math.cos(angle)*.11,w+.12,h+.12,.14,'dark',false,true,angle);
 }
 function fixture(b,sx,sz){
  const l=b.x-b.w/2-3.2,r=b.x+b.w/2+3.2,n=b.z-b.d/2-3.2,s=b.z+b.d/2+3.2;
  const x=sx<0?l+1.45:r-1.45,z=sz<0?n+2.45:s-2.45;
  const junctionI=b.i+(sx>0?1:0),junctionJ=b.j+(sz>0?1:0),major=wx[junctionI]>=14||wz[junctionJ]>=14;
  B.box(x,H+.24,z,.42,.48,.42,'dark',false,true);B.box(x,H+2.75,z,.15,5.25,.15,'steel',false,true);
  B.box(x-sx*.85,H+5.27,z,1.85,.18,.24,'steel',false,true);B.box(x-sx*1.45,H+5.15,z,.72,.075,.32,'warm',false,true);
  if(major){
   // Fixed display, not an implemented traffic simulation. Orthogonal approaches differ.
   B.box(x-sx*.28,H+3.65,z-sz*.18,.50,1.3,.45,'dark',false,true);
   B.box(x-sx*.28,H+4.0,z-sz*.43,.25,.23,.05,'streetSignalRed',false,true);
   B.box(x-sx*.28,H+3.30,z-sz*.43,.25,.23,.05,'black',false,true);
   B.box(x-sx*.56,H+3.55,z,.05,.30,.27,'streetSignal',false,true);
   label(junctionI,x,H+4.6,z+.24,0);
  }
  rec.fixtures.push({x,z,block:b.id,major});
 }
 function block(b){
  const L=xs[b.i]+wx[b.i]/2,T=zs[b.j]+wz[b.j]/2,X=xs[b.i+1]-wx[b.i+1]/2,Z=zs[b.j+1]-wz[b.j+1]/2,W=X-L,D=Z-T;
  // Existing elevated floor remains exact. No new slab is laid over the old one.
  rectangle(L+R,T+R,X-R,Z-R,H,'streetWalk');collider(L+R,T+R,X-R,Z-R,H);
  ground.push({x:(L+X)/2,z:(T+Z)/2,w:W,d:D,y:H,kind:'ground'});
  const sides=[['N',L,T,W,true,b.j>0],['S',L,Z,W,true,b.j+1<6],['W',L,T,D,false,b.i>0],['E',X,T,D,false,b.i+1<6]];
  for(const[side,ox,oz,len,horiz,active]of sides){
   const positive=side==='N'||side==='W',inside=positive?1:-1;
   const at=(t,d,y)=>horiz?[ox+t,y,oz+inside*d]:[ox+inside*d,y,oz+t];
   const centers=active?[CH,len-CH]:[];
   const lowers=(t,d)=>{let w=0;for(const c of centers)w=Math.max(w,THREE.MathUtils.clamp((1.8-Math.abs(t-c))/.3,0,1));return H-(H-.012)*w*(1-THREE.MathUtils.clamp(d/1.8,0,1));};
   const breaks=[R,len-R];for(const c of centers)for(const delta of[-1.8,-1.5,1.5,1.8])if(c+delta>R&&c+delta<len-R)breaks.push(c+delta);
   const ts=[...new Set(breaks)].sort((a,b)=>a-b),depths=[0,.28,.45,.75,1.05,1.35,1.8,R];
   for(let i=0;i<ts.length-1;i++)for(let j=0;j<depths.length-1;j++){
    const a=ts[i],e=ts[i+1],d0=depths[j],d1=depths[j+1],mid=(a+e)/2;
    const tactile=centers.some(c=>Math.abs(mid-c)<1.5)&&d0>=.45&&d1<=1.05,mat=tactile?'streetTactile':d1<=.28?'streetCurb':'streetWalk';
    const points=[at(a,d0,lowers(a,d0)),at(e,d0,lowers(e,d0)),at(e,d1,lowers(e,d1)),at(a,d1,lowers(a,d1))];face(points,mat);
    collider(Math.min(...points.map(p=>p[0])),Math.min(...points.map(p=>p[2])),Math.max(...points.map(p=>p[0])),Math.max(...points.map(p=>p[2])),Math.max(...points.map(p=>p[1])));
   }
   for(let i=0;i<ts.length-1;i++){const a=ts[i],e=ts[i+1];face([at(a,0,-.4),at(e,0,-.4),at(e,0,lowers(e,0)),at(a,0,lowers(a,0))],'streetCurb',null,0,horiz?[0,0,-inside]:[-inside,0,0]);}
   for(const c of centers){const end=at(c,0,.012),start=at(c,1.8,H);rec.ramps.push({block:b.id,side,from:end,to:start,width:3,rise:H-.012,run:1.8});}
  }
  for(const sx of[-1,1])for(const sz of[-1,1]){
   const cx=sx<0?L+R:X-R,cz=sz<0?T+R:Z-R,corner=[sx<0?L:X,0,sz<0?T:Z];
   const angles=sx<0?(sz<0?[PI,PI*1.5]:[PI*.5,PI]):(sz<0?[PI*1.5,PI*2]:[0,PI*.5]);
   for(let k=0;k<8;k++){
    const a=angles[0]+(angles[1]-angles[0])*k/8,e=angles[0]+(angles[1]-angles[0])*(k+1)/8;
    const arc=(ang,r,y)=>[cx+Math.cos(ang)*r,y,cz+Math.sin(ang)*r];
    face([[cx,H,cz],arc(a,R-.28,H),arc(e,R-.28,H)],'streetWalk');
    face([arc(a,R-.28,H),arc(a,R,H),arc(e,R,H),arc(e,R-.28,H)],'streetCurb');
    face([corner,arc(e,R,0),arc(a,R,0)],'streetJunction');
    face([arc(a,R,-.4),arc(e,R,-.4),arc(e,R,H),arc(a,R,H)],'streetCurb',null,0,[Math.cos((a+e)/2),0,Math.sin((a+e)/2)]);
   }
   const bx0=sx<0?L:X-R,bz0=sz<0?T:Z-R;collider(bx0,bz0,bx0+R,bz0+R,0);
   // Small conservative slices approximate the rounded collision boundary.
   for(let k=0;k<12;k++){const xa=bx0+R*k/12,xb=bx0+R*(k+1)/12,far=Math.max(Math.abs(xa-cx),Math.abs(xb-cx)),arcZ=Math.sqrt(Math.max(0,R*R-far*far));collider(xa,sz<0?cz-arcZ:cz,xb,sz<0?cz:cz+arcZ,H);}
   rec.corners.push({block:b.id,x:cx,z:cz,radius:R});
  }
  fixture(b,-1,-1);fixture(b,1,1);
 }
 B.scope('streets','road-network',()=>{
  for(let i=0;i<7;i++)for(let j=0;j<7;j++){
   const x=xs[i],z=zs[j];rectangle(x-wx[i]/2,z-wz[j]/2,x+wx[i]/2,z+wz[j]/2,0,'streetJunction');collider(x-wx[i]/2,z-wz[j]/2,x+wx[i]/2,z+wz[j]/2,0);
   ground.push({x,z,w:wx[i],d:wz[j],y:0,kind:'ground'});rec.junctions.push({x,z,w:wx[i],d:wz[j]});
  }
  for(let i=0;i<7;i++)for(let j=0;j<6;j++)roadRibbon('z',xs[i],zs[j]+wz[j]/2,zs[j+1]-wz[j+1]/2,wx[i],i);
  for(let j=0;j<7;j++)for(let i=0;i<6;i++)roadRibbon('x',zs[j],xs[i]+wx[i]/2,xs[i+1]-wx[i+1]/2,wz[j],j);
  for(const b of data.blocks)B.scope('streets',b.id+'/sidewalk',()=>block(b));
  B.box(0,-2,0,1800,1,1800,'asphalt');
 });
 rec.expectedArea=(xs[6]+wx[6]/2-xs[0]+wx[0]/2)*(zs[6]+wz[6]/2-zs[0]+wz[0]/2);
 rec.coverageError=Math.abs(rec.expectedArea-rec.ownedTopArea);
 rec.crossings=rec.segments.reduce((n,s)=>n+s.crossings,0);
 return rec;
}
export function auditStreets(streets){
 const errors=[];if(streets.coverageError>.5)errors.push('Street/sidewalk coverage area differs from district envelope');
 if(streets.ramps.length!==streets.crossings*2)errors.push('Crossings do not have paired sidewalk ramps');
 for(const s of streets.segments)if(s.length<30||s.width<10)errors.push('Invalid street profile');
 return {ok:errors.length===0,errors,junctions:streets.junctions.length,segments:streets.segments.length,crossings:streets.crossings,ramps:streets.ramps.length,roundedCorners:streets.corners.length,fixtures:streets.fixtures.length,coverageError:streets.coverageError};
}
