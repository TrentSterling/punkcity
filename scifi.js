/** Punkcity 0.4. Original parametric hard-surface architecture and graphics.
 * Hosts retain v0.3 street, stair and public-route reservations. No pack assets.
 * Fine panels are visual dressing; tower bodies/crowns retain structural collision.
 */
import * as THREE from 'three';
const V=(x,y,z)=>new THREE.Vector3(x,y,z),night={value:0};
export const setScifiNight=value=>{night.value=value?1:0;};
export const PALETTES=[
 {hull:'oxide',armor:'armorOrange',edge:'armorBone',glow:'amber',ink:0xc65e35},
 {hull:'carbon',armor:'armorGold',edge:'armorBone',glow:'amber',ink:0xe5a633},
 {hull:'carbon',armor:'armorTeal',edge:'armorSilver',glow:'cyan',ink:0x3aaba5},
 {hull:'sand',armor:'armorCoral',edge:'armorBone',glow:'warm',ink:0xc46a58},
 {hull:'dark',armor:'armorPlum',edge:'armorBone',glow:'pink',ink:0xa15a86},
 {hull:'ivory',armor:'armorJade',edge:'armorBone',glow:'cyan',ink:0x6c9e72}
];
function panelMaterial(color,type=0){
 const m=new THREE.MeshStandardMaterial({color,roughness:.7,metalness:.12,dithering:true});
 m.onBeforeCompile=s=>{
  s.uniforms.cyberNight=night;
  s.vertexShader='attribute float facadeSeed;varying float cSeed;varying vec2 cUV;varying vec3 cP;varying vec3 cN;\n'+s.vertexShader;
  s.vertexShader=s.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
cSeed=facadeSeed;cUV=uv;cP=(modelMatrix*vec4(position,1.)).xyz;cN=normalize(mat3(modelMatrix)*normal);`);
  s.fragmentShader=`uniform float cyberNight;varying float cSeed;varying vec2 cUV;varying vec3 cP;varying vec3 cN;
float hashC(vec2 p){vec3 q=fract(vec3(p.xyx)*.1031);q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}
float cutBox(vec2 p,vec2 size,float cut,vec2 aa){vec2 a=abs(p);float d=max(max(a.x-size.x,a.y-size.y),(a.x+a.y-size.x-size.y+cut)*.707);float fw=max(aa.x,aa.y);return 1.-smoothstep(-fw,fw,d);}
`+s.fragmentShader;
  const aperture=type===1?'vec2(.43,.195)':type===2?'vec2(.28,.055)':type===3?'vec2(.325,.24)':'vec2(.32,.20)';
  s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
vec2 cell=fract(cUV),idx=floor(cUV),aa=max(fwidth(cUV),vec2(.0003));
float id=floor(cSeed+.5),identity=hashC(idx+vec2(id,id*.37));
vec3 hull=diffuseColor.rgb;
float plate=cutBox(cell-.5,vec2(.482,.475),.065,aa);
float inset=cutBox(cell-vec2(.5,.62),${aperture}+vec2(.036,.035),.03,aa);
float window=cutBox(cell-vec2(.5,.62),${aperture},.027,aa);
float sill=cutBox(cell-vec2(.5,.28),vec2(.39,.047),.025,aa);
float service=cutBox(cell-vec2(.68,.14),vec2(.17,.035),.01,aa);
float lip=cutBox(cell-vec2(.5,.945),vec2(.40,.014),0.,aa);
vec3 N=normalize(cN),T=normalize(cross(vec3(0,1,0),N)),eye=normalize(cameraPosition-cP);
vec3 ro=vec3((cell-vec2(.5,.62))/${aperture},1.);
vec3 rd=vec3(-dot(eye,T),-eye.y,-max(.18,dot(eye,N)));
vec3 d=(sign(rd)-ro)/(rd+vec3(.00001));vec3 room=ro+rd*max(0.,min(d.x,min(d.y,d.z)));
float back=step(.99,abs(room.z));
vec3 interior=mix(vec3(.027,.055,.065),vec3(.13,.20,.22),back);
interior*=mix(.43,1.,smoothstep(-1.,1.,room.y));
float occupied=step(.68,identity),fresnel=pow(1.-max(dot(eye,N),0.),3.);
vec3 glass=mix(interior,vec3(.21,.39,.44),.18+fresnel*.5);
glass=mix(glass,vec3(.47,.29,.10),cyberNight*occupied*.6);
vec3 plateColor=hull*(.92+.08*hashC(vec2(id,7.)));
plateColor*=mix(.80,1.,smoothstep(0.,5.,cP.y));
diffuseColor.rgb=mix(hull*.25,plateColor,plate);
diffuseColor.rgb=mix(diffuseColor.rgb,hull*.40,sill);diffuseColor.rgb=mix(diffuseColor.rgb,hull*1.25,lip*.7);
diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.022,.035,.041),inset);
diffuseColor.rgb=mix(diffuseColor.rgb,glass,window);
${type===2?`float vent=cutBox(cell-vec2(.5,.31),vec2(.35,.15),.04,aa);float slit=1.-smoothstep(.20-aa.y*16.,.20+aa.y*16.,abs(fract(cell.y*16.)-.5));diffuseColor.rgb=mix(diffuseColor.rgb,hull*.26,vent*slit);`:''}
float distanceFilter=clamp(max(aa.x,aa.y)*2.-.5,0.,1.);
diffuseColor.rgb=mix(diffuseColor.rgb,mix(hull,vec3(.08,.17,.20),.26),distanceFilter);
`);
  s.fragmentShader=s.fragmentShader.replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=mix(.70,.24,window);');
  s.fragmentShader=s.fragmentShader.replace('#include <metalnessmap_fragment>','#include <metalnessmap_fragment>\nmetalnessFactor=mix(.12,.44,window);');
  s.fragmentShader=s.fragmentShader.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\ntotalEmissiveRadiance+=vec3(.72,.40,.10)*window*occupied*cyberNight*.75;totalEmissiveRadiance+=vec3(.05,.25,.29)*service*.2;');
 };m.customProgramCacheKey=()=>`punkcity-armored-panels-v04-${type}`;return m;
}
function makeAds(){
 const canvas=document.createElement('canvas');canvas.width=2048;canvas.height=1024;const c=canvas.getContext('2d');
 const brands=[['NEURO','UPGRADE YOURSELF','#59ded1','#112f45'],['ORBIT','UPPER CITY TRANSIT','#efb442','#303843'],['CHROMA','AFTER DARK','#e77abb','#452c62'],['SOMA','HOT FOOD / ALL HOURS','#f0ae5b','#843c44'],['HARDLINE','AUGMENT SERVICE','#bde16e','#293f42'],['MESH','STAY CONNECTED','#6dcbf0','#384862'],['ION','CLEAN ENERGY','#c7db92','#426f66'],['VAULT','YOUR MIND. SECURED.','#f2c787','#584b72']];
 brands.forEach(([name,sub,fg,bg],i)=>{const x=(i%4)*512,y=Math.floor(i/4)*512;c.save();c.translate(x,y);c.fillStyle=bg;c.fillRect(0,0,512,512);c.fillStyle=fg;c.fillRect(20,20,472,6);c.fillRect(20,486,472,6);c.globalAlpha=.12;for(let a=0;a<12;a++){c.fillRect(24+a*43,28,1,452);}c.globalAlpha=1;c.strokeStyle=fg;c.lineWidth=10;c.lineJoin='bevel';
  if(i%4===0){c.beginPath();c.moveTo(132,264);c.lineTo(182,110);c.lineTo(310,90);c.lineTo(366,182);c.lineTo(330,278);c.lineTo(276,296);c.lineTo(280,324);c.lineTo(180,324);c.lineTo(190,275);c.closePath();c.stroke();c.beginPath();c.arc(264,205,47,0,Math.PI*2);c.stroke();for(let a=0;a<3;a++){c.beginPath();c.moveTo(115,150+a*53);c.lineTo(169,150+a*53);c.stroke();}}
  else if(i%4===1){c.beginPath();c.ellipse(256,209,153,61,-.38,0,Math.PI*2);c.stroke();c.beginPath();c.arc(256,209,85,0,Math.PI*2);c.stroke();c.fillRect(224,171,65,73);}
  else if(i%4===2){for(let a=0;a<3;a++){c.beginPath();c.moveTo(110+a*64,125);c.lineTo(198+a*64,215);c.lineTo(110+a*64,305);c.stroke();}}
  else{c.beginPath();c.moveTo(134,219);c.lineTo(375,219);c.quadraticCurveTo(353,320,255,320);c.quadraticCurveTo(156,320,134,219);c.stroke();for(let a=0;a<3;a++){c.beginPath();c.moveTo(197+a*58,187);c.bezierCurveTo(167+a*58,158,226+a*58,141,196+a*58,111);c.stroke();}}
  c.textAlign='center';c.font='900 64px sans-serif';c.fillStyle=fg;c.fillText(name,256,402,460);c.font='bold 18px monospace';c.fillText(sub,256,442,460);c.font='13px monospace';c.textAlign='left';c.fillText('HP / 0'+(i+1),28,63);c.textAlign='right';c.fillText('24:7',482,63);c.restore();
 });
 const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=4;
 return new THREE.MeshStandardMaterial({map:tex,emissiveMap:tex,emissive:0xffffff,emissiveIntensity:.48,roughness:.46,metalness:.05});
}
export function installScifiMaterials(mats,surface){
 for(const [name,col]of Object.entries({armorGold:0xe4a52f,armorOrange:0xcd6435,armorCoral:0xbb5d4d,armorTeal:0x378e8a,armorJade:0x729c70,armorPlum:0x81546f,armorBone:0xc9c5b5,armorSilver:0x819799}))mats[name]=surface(col,.62,.16,.025);
 mats.pink=new THREE.MeshStandardMaterial({color:0xf579cc,emissive:0xdd369d,emissiveIntensity:1.3,roughness:.4});
 for(const [name,color,type]of [['facIvory',0xacb3aa,0],['facSand',0xb08f65,0],['facRust',0xa95d46,0],['facBlue',0x4a777a,0],['facGlass',0x3e666b,1],['facDark',0x304c56,2],['facMarket',0x94647b,3]])mats[name]=panelMaterial(color,type);
 mats.pavement.color.set(0x76777d);mats.asphalt.color.set(0x29323b);mats.paint.color.set(0xe5bd5f);mats.steel.color.set(0x51636a);mats.concrete.color.set(0xb2b1a3);mats.rust.color.set(0xb76544);
 if(typeof document!=='undefined')mats.adScreen=makeAds();
}
export function createScifiKit(api,city){
 const {B,shell,flat,plant,pipe,rail,addGeo,indexCollider}=api;
 const records={revision:'0.6.0',crowns:[],panels:0,screens:0,kiosks:0,cableRuns:0};
 const pose=(x,y,z,rot=0)=>new THREE.Matrix4().compose(V(x,y,z),new THREE.Quaternion().setFromAxisAngle(V(0,1,0),rot),V(1,1,1));
 // Cut-corner face with real depth, not a nearly coplanar decal on another face.
 function casing(x,y,z,w,h,d,mat,rot=0,cut=.25){
  cut=Math.min(cut,w*.18,h*.18);const a=w/2,b=h/2,shape=new THREE.Shape();
  shape.moveTo(-a+cut,-b);shape.lineTo(a-cut,-b);shape.lineTo(a,-b+cut);shape.lineTo(a,b-cut);shape.lineTo(a-cut,b);shape.lineTo(-a+cut,b);shape.lineTo(-a,b-cut);shape.lineTo(-a,-b+cut);shape.closePath();
  const g=new THREE.ExtrudeGeometry(shape,{depth:d,bevelEnabled:false,steps:1,curveSegments:1});g.translate(0,0,-d/2);g.applyMatrix4(pose(x,y,z,rot));if(B.scope&&B.layer==='buildings')B.scope('armor',B.owner+'/casing',()=>addGeo(g,mat));else addGeo(g,mat);records.panels++;
 }
 function screen(x,y,z,w,h,rot,kind){
  casing(x,y,z,w+.55,h+.55,.55,'carbon',rot,.32);
  const g=new THREE.PlaneGeometry(w,h),uv=g.attributes.uv,col=kind%4,row=Math.floor(kind/4);
  for(let i=0;i<uv.count;i++)uv.setXY(i,(col+.02+uv.getX(i)*.96)/4,1-(row+.98-uv.getY(i)*.96)/2);
  g.translate(0,0,.34);g.applyMatrix4(pose(x,y,z,rot));addGeo(g,'adScreen');records.screens++;
 }
 function strip(x,y,z,w,h,d,mat,rot=0){B.box(x,y,z,w,h,d,mat,false,true,rot);}
 function band(x,z,w,d,y,h,mat,depth=.42){
  const inset=Math.min(.75,w*.07,d*.07);
  for(const s of[-1,1]){casing(x,y,z+s*(d/2+.12),w-inset*2,h,depth,mat,s<0?Math.PI:0,Math.min(.3,h*.22));casing(x+s*(w/2+.12),y,z,d-inset*2,h,depth,mat,s*Math.PI/2,Math.min(.3,h*.22));}
 }
 function fan(x,y,z,size,rot=0){
  casing(x,y,z,size,size,.48,'armorSilver',rot,.22);const matrix=pose(x,y,z,rot);
  const pt=(a,b,c)=>V(a,b,c).applyMatrix4(matrix),axis=new THREE.Quaternion().setFromUnitVectors(V(0,1,0),V(Math.sin(rot),0,Math.cos(rot)));
  let p=pt(0,0,.30);B.instance('cyl',p.x,p.y,p.z,size*.36,.10,size*.36,'black',true,0,axis);
  p=pt(0,0,.39);B.instance('cyl',p.x,p.y,p.z,size*.11,.15,size*.11,'steel',true,0,axis);
  for(let i=0;i<5;i++){const a=i*Math.PI*.4;B.beam(pt(Math.cos(a)*size*.12,Math.sin(a)*size*.12,.43),pt(Math.cos(a+.4)*size*.29,Math.sin(a+.4)*size*.29,.43),size*.075,'armorSilver',true);}
 }
 function servicePodBody(x,y,z,w,h,d,mat){
  shell(x,z,w,d,y,h,mat,Math.min(.65,w*.16,d*.16),1,0,'steel');
  band(x,z,w,d,y+h*.25,.28,'carbon',.25);band(x,z,w,d,y+h*.81,.34,'armorBone',.3);
  const n=Math.max(1,Math.floor(w/2.5));for(let i=0;i<n;i++)fan(x-w*.36+(i+.5)*w*.72/n,y+h*.54,z+d/2+.28,Math.min(1.65,h*.5));
 }
 function servicePod(...args){if(B.scope)return B.scope('rooftops',B.owner+'/service-pod',()=>servicePodBody(...args));return servicePodBody(...args);}
 function crown(t,b,x,z,w,d,base,top){
  const p=PALETTES[b.district],h=top-base,kind=b.assembly%3;
  if(kind===0){
   // A continuous core supports the spaced radiator layers.
   shell(x,z,w*.44,d*.44,base,h,'steel',.35,1,0,p.edge);
   for(let i=0;i<3;i++){const ww=w*(.90-i*.075),dd=d*(.90-i*.075),y=base+i*h*.25;shell(x,z,ww,dd,y,h*.21,p.armor,Math.min(1.1,ww*.15),1,0,p.edge);}
   shell(x,z,w*.51,d*.52,base+h*.75,h*.25,'steel',.65,1,0,p.armor);
  }else if(kind===1){
   shell(x,z,w*.83,d*.83,base,h*.75,p.armor,1.1,.82,0,p.edge);
   for(const s of[-1,1])shell(x+s*w*.33,z,w*.13,d*.62,base,h,p.edge,.25,1,0,'steel');
   for(let i=0;i<4;i++)strip(x,base+.7+i*h*.14,z+d*.425,w*.55,.16,.16,'carbon');
  }else{
   shell(x,z,w*.66,d*.69,base,h*.8,'carbon',Math.min(w,d)*.20,1,0,p.edge);
   for(const s of[-1,1])shell(x+s*w*.38,z,w*.12,d*.63,base,h,p.armor,.2,.75,0,p.edge);
   for(let i=0;i<3;i++)band(x,z,w*.68,d*.71,base+(i+.5)*h*.24,.28,p.armor,.25);
  }
  records.crowns.push({building:t.id,kind,base,top});
 }
 function tower(t,b,r){
  const p=PALETTES[b.district],height=t.top-t.base,cap=Math.min(9,Math.max(3,height*.15)),bodyTop=t.top-cap;
  if(b.district===5){
   let ww=t.w*.96,dd=t.d*.95,z=t.z,y=t.base;const step=(height-cap)/3;
   for(let i=0;i<3;i++){
    shell(t.x,z,ww,dd,y,step,'facIvory',Math.min(2,dd*.16),1,0,'dark');band(t.x,z,ww,dd,y+step-1,.85,p.armor);
    plant(t.x,z+dd/2-.9,Math.max(2,ww-2.6),1.35,y+step);y+=step;ww*=.83;dd*=.83;z-=.7;
   }
   crown(t,b,t.x,z,ww,dd,y,t.top);
  }else if(b.district===2){
   shell(t.x,t.z,t.w*.86,t.d*.86,t.base,bodyTop-t.base,'facDark',1.2,1,0,'steel');
   for(const side of[-1,1]){
    const xx=t.x+side*t.w*.46;shell(xx,t.z,t.w*.08,t.d*.72,t.base,height,p.armor,.25,1,0,'steel');
    for(let y=t.base+3;y<bodyTop-1;y+=5){casing(t.x,y,t.z+side*(t.d*.43+.4),t.w*.65,3.2,.8,'steel',side<0?Math.PI:0,.45);for(let k=0;k<5;k++)strip(t.x,y-1+k*.47,t.z+side*(t.d*.43+.85),t.w*.56,.14,.24,'carbon');}
   }
   crown(t,b,t.x,t.z,t.w*.86,t.d*.86,bodyTop,t.top);
  }else{
   const step=height>45?2:1;let xx=t.x,zz=t.z,ww=t.w*.93,dd=t.d*.91,y=t.base;
   for(let level=0;level<step;level++){
    const hh=(bodyTop-t.base)/step,glass=b.district===1?'facGlass':b.district===4?'facMarket':t.mat;
    shell(xx,zz,ww,dd,y,hh,glass,Math.min(2.3,ww*.14,dd*.14),1,0,'dark');
    const rows=Math.max(1,Math.round(hh/7)),spacing=hh/rows;
    for(let row=0;row<rows;row++){
     const yy=y+row*spacing+1.1;band(xx,zz,ww,dd,yy,1.05,p.armor,.46);
     if(b.district===3||b.district===4){
      const bw=Math.max(2.8,ww*.62),front=zz+dd/2+.8;
      // The usable balcony projects at most 1.7 m; existing host courts stay clear.
      B.box(xx,yy+1.0,front,bw,.28,1.7,'steel',true);
      casing(xx,yy+1.58,front+.75,bw-.2,.85,.22,p.armor,0,.18);
      for(const s of[-1,1])B.box(xx+s*(bw/2-.15),yy+1.65,front,.14,1,1.6,'steel',false,true);
     }
    }
    for(const side of[-1,1]){
     const sx=xx+side*(ww/2-.55);
     casing(sx,y+hh*.5,zz+dd/2+.4,1.0,hh-.4,.85,p.edge,0,.22);
     casing(sx,y+hh*.5,zz-dd/2-.4,1.0,hh-.4,.85,p.edge,Math.PI,.22);
     strip(sx,y+hh*.5,zz+dd/2+.87,.15,hh*.76,.07,p.glow);
     B.beam(V(sx,y+.5,zz+dd/2+1.1),V(sx-side*.6,y+Math.min(8,hh*.3),zz+dd/2+.45),.65,p.armor,true);
    }
    y+=hh;xx-=ww*.085;zz-=dd*.03;ww*=.77;dd*=.80;
   }
   // Top mass is stepped, not another flat roof with one antenna.
   const crownW=step===2?t.w*.73:t.w*.92,crownD=step===2?t.d*.73:t.d*.90;
   crown(t,b,step===2?t.x-t.w*.079:t.x,step===2?t.z-t.d*.027:t.z,crownW,crownD,bodyTop,t.top);
   if(b.district===1){
    const sz=t.z+t.d*.46+.56,w=Math.min(t.w*.43,6),h=Math.min(17,height*.27);
    screen(t.x-t.w*.18,t.base+height*.64,sz,w,h,0,(b.i+b.j)%2?1:7);
   }
  }
  if(b.district===2||b.district===1){
   const rr=Math.min(t.w,t.d)*.12,yy=t.top+.08;
   B.instance('cyl',t.x,yy+.65,t.z,rr,1.3,rr,p.edge,true);
   B.instance('cyl',t.x,yy+1.45,t.z,rr*.72,.3,rr*.72,'carbon',true);
   B.instance('cyl',t.x,yy+1.7,t.z,rr*.52,.18,rr*.52,p.glow,true);
  }
 }
 function podium(m,b){
  const p=PALETTES[b.district],x=m.x,z=m.z,w=m.w,d=m.d;
  band(x,z,w,d,m.top-1.25,1.35,p.armor,.5);
  band(x,z,w,d,5.5,.65,p.edge,.42);
  for(const side of[-1,1]){
   const zz=z+side*(d/2+.37),rot=side<0?Math.PI:0,n=Math.max(1,Math.floor((w-3)/7));
   for(let i=0;i<n;i++){
    const xx=x-w/2+1.5+(i+.5)*(w-3)/n;
    if((i+b.assembly)%3!==0)continue;
    const ph=Math.min(4,m.top-7);if(ph<1.8)continue;
    casing(xx,8.1,zz,(w-3)/n*.62,ph,.6,p.armor,rot,.48);
    casing(xx,8.1,zz+side*.34,(w-3)/n*.47,ph*.67,.12,'carbon',rot,.30);
    for(let k=0;k<3;k++)strip(xx,7.5+k*.45,zz+side*.45,(w-3)/n*.32,.11,.12,p.edge,rot);
   }
   for(const sx of[-1,1]){
    const xx=x+sx*(w/2-1.35);casing(xx,m.top*.5,zz,1.55,m.top-.8,.8,p.edge,rot,.4);
    casing(xx,2.0,zz+side*.18,2.1,3.4,1,p.armor,rot,.42);
    strip(xx,m.top*.62,zz+side*.47,.17,Math.min(3,m.top*.25),.06,p.glow,rot);
   }
  }
  // Roof infrastructure occupies checked unused roof corners, never public thresholds.
  const px=x+w/2-3.2,pz=z-d/2+3.4;
  if(m.w>12&&m.d>9&&!b.towers.some(t=>Math.abs(t.x-px)<t.w/2+2.5&&Math.abs(t.z-pz)<t.d/2+2.5))servicePod(px,m.top+.04,pz,4.1,2.6,4.3,p.armor);
  if(m.role.startsWith('north')&&m.w>14){
   const xx=x-w*.27,yy=Math.min(m.top-4,9.5);
   if(yy>5.5)screen(xx,yy,z+d/2+.95,4.6,5.2,0,(b.district+b.i+b.j)%8);
  }
 }
 function shops(m,b){
  const p=PALETTES[b.district],n=Math.max(1,Math.floor(m.w/8)),bay=m.w/n,z=m.z+m.d/2;
  for(let i=0;i<n;i++){
   const x=m.x-m.w/2+(i+.5)*bay;
   casing(x,2.1,z+.18,bay-.6,3.8,.34,'carbon',0,.45);
   casing(x,2.0,z+.40,bay-1.2,2.85,.12,'glass',0,.22);
   for(const side of[-1,1])casing(x+side*(bay/2-.52),2.1,z+.65,.55,3.65,.8,p.edge,0,.12);
   casing(x,3.9,z+1.25,bay-.3,.75,2.8,p.armor,0,.25);
   strip(x,3.61,z+2.68,bay-.8,.08,.08,p.glow);
   screen(x,5.0,z+.65,Math.min(bay-1,5.8),1.65,0,(i+b.district+b.j)%8);
   if(i===0&&m.w>12){
    B.box(x-bay*.34,5.6,z+2,.13,5.2,.13,'steel',false,true);
    screen(x-bay*.34,7.9,z+2,1.9,4.9,Math.PI/2,(b.seed+i)%8);
   }
  }
 }
 function kiosk(x,z,p,kind){
  casing(x,1.30,z,1.45,2.05,.85,p.armor,0,.2);casing(x,1.65,z+.45,1.08,1.25,.12,'carbon',0,.13);
  screen(x,1.72,z+.54,.82,.90,0,kind);strip(x,.83,z+.56,.55,.12,.09,'black');
  B.box(x,.36,z,1.65,.20,1.05,'steel',false,true);records.kiosks++;
 }
 function extras(b){
  const p=PALETTES[b.district],north=b.masses.filter(m=>m.role.startsWith('north'));
  for(const m of north){
   const xx=m.x-m.w/2+2.5,zz=m.z+m.d/2+.65;
   if(m.w>10&&b.district!==0)kiosk(xx,zz+1,p,b.district%8);
   if(m.d>12)fan(m.x+m.w/2+.4,m.top*.57,m.z,2.6,Math.PI/2);
  }
  if(b.district===0){
   const m=north[0],yy=m.top,zz=m.z;
   if(m.w>18){servicePod(m.x-m.w*.26,yy+.04,zz,Math.min(8,m.w*.3),4.2,Math.min(6,m.d*.7),p.armor);pipe([m.x-m.w*.26,yy+1.2,zz+3.5],[m.x+m.w*.26,yy+1.2,zz+3.5],.32,'armorSilver');}
   const x=b.x+b.w*.31,z=b.z+b.d*.18;
   for(const side of[-1,1])for(let row=0;row<3;row++)B.instance('cyl',x+side*3.5,3+row*4,z,2.73,.55,2.73,p.armor,true);
  }
  if(b.district===3||b.district===4){
   // Sagging service cables stay above 20 m, clear of the 16 m pedestrian level.
   const z=b.z-4.7,height=Math.max(23,Math.min(30,north[0].top+9));
   // Masts sit outside the seven-metre public street; both wires meet crossarms.
   for(const side of[-1,1]){
    const x=b.x+side*b.w*.44;
    B.box(x,(height+.28)/2,z,.22,height-.28,.22,'steel',true);
    casing(x,.9,z,.75,1.2,.75,p.armor,0,.16);
    B.box(x,height,z+.4,.25,.22,1.5,'steel',false,true);
    for(let row=0;row<2;row++)B.instance('cyl',x,height+.10,z+row*.8,.15,.20,.15,'armorBone',true);
   }
   for(let row=0;row<2;row++){
    const curve=new THREE.QuadraticBezierCurve3(V(b.x-b.w*.44,height,z+row*.8),V(b.x,height-3,z+row*.8),V(b.x+b.w*.44,height,z+row*.8));
    const pts=curve.getPoints(12);for(let i=0;i<12;i++)B.beam(pts[i],pts[i+1],.07,'carbon',true);records.cableRuns++;
   }
   for(const m of b.masses.filter(m=>m.role.startsWith('south'))){
    const x=m.x+m.w/2-1.8,z=m.z+m.d/2+1.3;
    for(let k=0;k<2;k++){casing(x-k*1.3,.75,z,1.10,.95,1.05,k?'armorBone':p.armor,0,.14);strip(x-k*1.3,.77,z+.54,.65,.09,.05,'carbon');}
   }
  }

  // Street service and roof-spine refinement.
  for(const m of b.masses.filter(m=>m.role.startsWith('south'))){
   const spineW=Math.min(9,m.w*.58),spineD=Math.min(4,m.d*.40),rx=m.x,rz=m.z-1;
   servicePod(rx,m.top+.04,rz,spineW,2.15,spineD,p.armor);
   for(const side of[-1,1]){
    B.instance('cyl',rx+side*spineW*.27,m.top+2.5,rz,Math.min(.75,spineD*.25),.60,Math.min(.75,spineD*.25),'armorBone',true);
    B.instance('cyl',rx+side*spineW*.27,m.top+2.83,rz,Math.min(.57,spineD*.19),.08,Math.min(.57,spineD*.19),'carbon',true);
   }
   pipe([rx-spineW*.35,m.top+.8,rz+spineD/2+.5],[m.x-m.w/2+1.1,m.top+.8,rz+spineD/2+.5],.22,'armorSilver');
   if(b.district!==0&&b.district!==2){
    const front=m.z+m.d/2,xx=m.x+m.w*.23;
    casing(xx,.95,front+1.1,2.3,1.1,1.05,p.armor,0,.2);
    B.box(xx,1.55,front+1.1,2.4,.15,1.12,'steel',false,true);
    screen(xx,1.08,front+1.68,1.35,.56,0,(b.district+b.j+2)%8);
    for(let i=0;i<3;i++)B.instance('cyl',xx-.65+i*.65,1.82,front+1.13,.18,.40,.18,i%2?'armorBone':p.armor,true);
    const postX=m.x-m.w*.32,postZ=front+2.1;
    B.instance('cyl',postX,1.05,postZ,.23,1.55,.23,'steel',true);
    B.instance('cyl',postX,1.74,postZ,.25,.12,.25,p.glow,true);
    records.kiosks++;
   }
  }
  for(const rect of b.walkSurfaces){
   if(rect.kind!=='arm')continue;const horiz=rect.w>rect.d,len=horiz?rect.w:rect.d,n=Math.max(1,Math.floor(len/5));
   for(const side of[-1,1])for(let i=0;i<n;i++){
    const u=-len/2+(i+.5)*len/n,x=rect.x+(horiz?u:side*(rect.w/2+.07)),z=rect.z+(horiz?side*(rect.d/2+.07):u),rot=horiz?(side>0?0:Math.PI):side*Math.PI/2;
    casing(x,15.10,z,len/n-.28,.72,.26,p.armor,rot,.18);
    if(!(rect.id.endsWith('/N')&&Math.abs(z-(b.z-10))<4.1)){casing(x,16.40,z,len/n-.48,.54,.16,'steel',rot,.12);strip(x,16.48,z,.12,.12,.12,p.glow);}
    strip(x,15.15,z,.1,.1,.1,p.glow);
   }
  }
 }
 return {tower,podium,shops,extras,records,casing,screen,fan,servicePod,band};
}
