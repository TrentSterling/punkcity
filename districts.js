import {generateNeighborhoods} from './neighborhoods.js';
import {planInfill} from './placement.js';
import {generateFrontage} from './frontage.js';
import {generateStreetServices} from './street-services.js';
import {generateRoofServices} from './roof-services.js';
/** HACKERPUNK 0.3: street reservations -> district parcels -> owned shells -> decks.
 * References studied (not copied): CityWorks shared-court/access contracts;
 * Metroforge urban-fabric.js and surface-ownership architecture;
 * mrdoob/slop-newyork buildings.js and filtered procedural facade materials.
 * Metric, seeded recipes remain separate from rendering and movement equipment.
 */
import * as THREE from 'three';
import {createScifiKit,installScifiMaterials} from './scifi.js';
import {planUrbanism, compileUrbanism, auditUrbanism} from './urbanism.js';
import {facadeMaterial, pavingMaterial} from './facades.js';
export const DISTRICTS = [
  {id:'foundry',name:'THE FOUNDRY',short:'FOUNDRY',color:'#d18a5b',description:'Furnaces, sawtooth halls and cargo gantries'},
  {id:'crown',name:'CORPORATE CROWN',short:'CROWN',color:'#cfccb7',description:'Tapered glass towers and civic megastructures'},
  {id:'relay',name:'RELAY / DATA WARD',short:'RELAY',color:'#6e9ba9',description:'Armored data vaults and cooling infrastructure'},
  {id:'stacks',name:'THE STACKS',short:'STACKS',color:'#b7a285',description:'Dense housing, stacked balconies and service courts'},
  {id:'market',name:'NIGHTMARKET',short:'MARKET',color:'#d39a80',description:'Narrow shopfronts, canopies and crowded upper streets'},
  {id:'garden',name:'GARDEN TERRACES',short:'GARDEN',color:'#83a895',description:'Stepped residences, water courts and planted terraces'}
];
const hash=s=>{let a=2166136261;for(const c of String(s)){a^=c.charCodeAt(0);a=Math.imul(a,16777619);}return a>>>0;};
const rng=s=>{let a=hash(s);return()=>{a+=0x6d2b79f5;let t=Math.imul(a^a>>>15,1|a);t^=t+Math.imul(t^t>>>7,61|t);return((t^t>>>14)>>>0)/4294967296;};};
const pick=(r,a)=>a[Math.floor(r()*a.length)],V=(x,y,z)=>new THREE.Vector3(x,y,z);
const q=n=>Math.round(n*1000)/1000;
export function planCity(seed,height=1){
  const r=rng(seed),xs=[-254,-172,-96,0,83,161,251],zs=[-232,-158,-79,0,70,155,247];
  for(let i=1;i<6;i++){if(i!==3){xs[i]+=q((r()-.5)*8);zs[i]+=q((r()-.5)*8);}}
  const widthsX=xs.map((_,i)=>[0,3,6].includes(i)?18:i===2?14:10),widthsZ=zs.map((_,i)=>[0,3,6].includes(i)?18:10);
  const blocks=[],upperLinks=[];
  for(let j=0;j<6;j++)for(let i=0;i<6;i++){
    const L=xs[i]+widthsX[i]/2+3.2,R=xs[i+1]-widthsX[i+1]/2-3.2,N=zs[j]+widthsZ[j]/2+3.2,S=zs[j+1]-widthsZ[j+1]/2-3.2;
    const district=Math.floor(i/2)+(j>=3?3:0);
    const deck=district!==0||j===2;
    blocks.push({id:i+','+j,i,j,x:q((L+R)/2),z:q((N+S)/2),w:q(R-L),d:q(S-N),district,deck,deckY:16,links:[],seed:hash(seed+':block:'+i+','+j)});
  }
  for(const a of blocks)if(a.deck)for(const[di,dj,axis,side,opp]of[[1,0,'x','E','W'],[0,1,'z','S','N']]){
    const b=blocks.find(b=>b.i===a.i+di&&b.j===a.j+dj);if(!b?.deck)continue;
    if(axis==='z'&&a.i%2===0&&a.j%3===0)continue;
    upperLinks.push({a:a.id,b:b.id,axis,y:16,width:a.district===4||b.district===4?7:5.2});a.links.push(side);b.links.push(opp);
  }
  const districts=DISTRICTS.map((d,n)=>{const bs=blocks.filter(b=>b.district===n);return{...d,blocks:bs.map(b=>b.id),x:bs.reduce((t,b)=>t+b.x,0)/bs.length,z:bs.reduce((t,b)=>t+b.z,0)/bs.length};});
  return planUrbanism({version:'0.4.0',seed,unit:'metre',heightMultiplier:height,groundStreets:{x:xs,z:zs,widthsX,widthsZ},blocks,upperLinks,districts,bounds:[xs[0]-12,-1,zs[0]-12,xs[6]+12,180,zs[6]+12],baseline:'All structural surfaces climbable. Equipment does not change layout.'});
}
export function addDistrictMaterials(mats,surface){
  mats.deck=pavingMaterial();
  const colors={ivory:0xcac6b2,ceramic:0xd1d4c9,ochre:0xb68758,oxide:0x8e5140,carbon:0x1b2b32,green:0x345f50,water:0x1e5765};
  for(const [k,c]of Object.entries(colors))mats[k]=surface(c,k==='water'?.22:.8,k==='water'?.5:.12,.035);
  for(const [name,col,type]of [['facIvory',0xb8b6a7,0],['facSand',0xa18a6c,0],['facRust',0x9b6750,0],['facBlue',0x516c76,0],['facGlass',0x59717b,1],['facDark',0x263c47,2],['facMarket',0xa88570,3]])mats[name]=facadeMaterial(col,type);
  mats.paint=new THREE.MeshStandardMaterial({color:0xd2c7ad,roughness:.95,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});
  installScifiMaterials(mats,surface);
}
export function compileDistricts(api,data){
  const {B,mats,sign,rail,pipe,indexCollider}=api;
  const ground=[],decks=[],buildings=[],artifacts=[],pi=Math.PI;
  const addGeo=(g,mat)=>{if(B.geometry)B.geometry(g,mat,mat==='paint'||mat==='adScreen');else{if(!g.attributes.facadeSeed)g.setAttribute('facadeSeed',new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count),1));if(!g.attributes.uv)g.setAttribute('uv',new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count*2),2));if(g.index)g=g.toNonIndexed();if(!B.merge.has(mat))B.merge.set(mat,[]);B.merge.get(mat).push(g);}};
  function flat(x,z,w,d,y,mat){const g=new THREE.PlaneGeometry(w,d);g.rotateX(-pi/2);g.translate(x,y,z);addGeo(g,mat);}
  function slab(x,z,w,d,top,thick,mat,kind){B.box(x,top-thick/2,z,w,thick,d,mat,true);if(kind)(kind==='ground'?ground:decks).push({x,z,w,d,y:top,kind});}
  function rectangle(w,d,c=0){const a=w/2,b=d/2;c=Math.min(c,a*.5,b*.5);return c?[[-a+c,-b],[a-c,-b],[a,-b+c],[a,b-c],[a-c,b],[-a+c,b],[-a,b-c],[-a,-b+c]]:[[-a,-b],[a,-b],[a,b],[-a,b]];}
  // One shell owns each wall and cap. No outward bevel expansion or layered window boxes.
  function shell(x,z,w,d,base,h,mat='facIvory',chamfer=1,topScale=1,shift=0,roof='dark',solid=true){
    const p=rectangle(w,d,chamfer),positions=[],uvs=[],top=p.map(([a,b])=>[a*topScale+shift,b*topScale]);
    const tri=(a,b,c,ua,ub,uc)=>{positions.push(...a,...b,...c);uvs.push(...ua,...ub,...uc);};
    for(let i=0;i<p.length;i++){
      const j=(i+1)%p.length,[ax,az]=p[i],[bx,bz]=p[j],[atx,atz]=top[i],[btx,btz]=top[j];
      const len=Math.hypot(bx-ax,bz-az),bay=len<2.4?0:Math.max(1,Math.round(len/(mat==='facGlass'?5.8:5.4))),floors=Math.max(1,Math.round(h/7));
      const a=[x+ax,base,z+az],b=[x+bx,base,z+bz],c=[x+btx,base+h,z+btz],d0=[x+atx,base+h,z+atz];
      tri(a,c,b,[0,0],[bay,floors],[bay,0]);tri(a,d0,c,[0,0],[0,floors],[bay,floors]);
    }
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));g.computeVertexNormals();g.setAttribute('facadeSeed',new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count).fill(Math.round(((x*31+z*13+h*7)%991+991)%991)),1));addGeo(g,mat);
    const cap=new THREE.Shape();top.forEach(([a,b],i)=>i?cap.lineTo(a,b):cap.moveTo(a,b));cap.closePath();const cg=new THREE.ShapeGeometry(cap);cg.rotateX(-pi/2);cg.translate(x,base+h,z);addGeo(cg,roof);
    if(solid)indexCollider(new THREE.Box3(V(x-w/2,base,z-d/2),V(x+w/2,base+h,z+d/2)));
    B.structures++;buildings.push({x,z,w,d,base,h,mat,topScale});return base+h;
  }
  function tank(x,z,r,h,base=.35){
    B.instance('cyl',x,base+h/2,z,r,h,r,'steel');B.instance('sphere',x,base+h,z,r,r*.32,r,'panel');
    for(const yy of[base+1,base+h*.45,base+h-.8])B.instance('cyl',x,yy,z,r+.17,.25,r+.17,'dark',true);
    B.box(x,base+h*.5,z+r+.2,.7,h*.8,.3,'rust',false,true);
    for(let y=1;y<h-.5;y+=.65)B.box(x,base+y,z+r+.42,.8,.065,.18,'steel',false,true);
    indexCollider(new THREE.Box3(V(x-r,base,z-r),V(x+r,base+h+r*.32,z+r)));
  }
  function roofkit(x,z,w,d,y,r){
    const px=x-w*.26,pz=z-d*.23;shell(px,pz,Math.max(2.8,w*.22),Math.max(2.6,d*.18),y,.9+r()*1.5,'steel',.2,1,0,'dark');
    for(let i=0;i<2;i++){const xx=x+w*.23,zz=z+(i-.5)*3.2;
      B.box(xx,y+.58,zz,2.4,1.16,2.3,'steel',true);
      B.box(xx,y+1.28,zz-1.075,2.4,.24,.15,'steel',false,true);B.box(xx,y+1.28,zz+1.075,2.4,.24,.15,'steel',false,true);
      B.box(xx-1.125,y+1.28,zz,.15,.24,2,'steel',false,true);B.box(xx+1.125,y+1.28,zz,.15,.24,2,'steel',false,true);
      flat(xx,zz,2.1,2,y+1.22,'black');
      B.instance('cyl',xx,y+1.49,zz,.72,.12,.72,'panel',true);
      B.box(xx,y+1.58,zz,1.15,.08,.17,'dark',false,true,.6);B.box(xx,y+1.58,zz,.17,.08,1.15,'dark',false,true,.6);
    }
    pipe([px,y+.6,pz],[px,y+.6,z+d*.25],.12);
    if(w>12){B.box(x+w*.27,y+3.2,z-d*.3,.16,6.2,.16,'steel',false,true);B.box(x+w*.27,y+6.4,z-d*.3,.23,.25,.23,'red',false,true);}
  }
  function panels(x,z,w,h,d,base,tone='steel',step=5.5){
    for(let a=-w/2+1.2;a<w/2-1;a+=step)for(const s of[-1,1])B.box(x+a,base+h/2,z+s*(d/2+.22),.28,h-.3,.42,tone,false,true);
    for(let a=-d/2+1.2;a<d/2-1;a+=step)for(const s of[-1,1])B.box(x+s*(w/2+.22),base+h/2,z+a,.42,h-.3,.28,tone,false,true);
  }
  function rim(x,z,w,d,y,mat='ceramic'){
    B.box(x,y,z-d/2+.16,w,.5,.32,mat,false,true);B.box(x,y,z+d/2-.16,w,.5,.32,mat,false,true);
    B.box(x-w/2+.16,y,z,.32,.5,d-.64,mat,false,true);B.box(x+w/2-.16,y,z,.32,.5,d-.64,mat,false,true);
  }
  function plant(x,z,w,d,y){
    B.box(x,y+.14,z,w,.28,d,'dark',true);
    B.box(x,y+.37,z-d/2+.08,w,.18,.16,'dark',false,true);B.box(x,y+.37,z+d/2-.08,w,.18,.16,'dark',false,true);
    B.box(x-w/2+.08,y+.37,z,.16,.18,d-.32,'dark',false,true);B.box(x+w/2-.08,y+.37,z,.16,.18,d-.32,'dark',false,true);
    flat(x,z,w-.32,d-.32,y+.34,'green');
    const n=Math.max(1,Math.floor(w/1.6));for(let i=0;i<n;i++){const px=x-w/2+.8+i*(w-1.6)/Math.max(1,n-1);B.instance('sphere',px,y+.65,z,.7,.35,Math.min(.8,d*.48),'plant',true);}
  }
  function tree(x,z,y,r){
    const h=3.6+r()*2;B.instance('cyl',x,y+h/2,z,.18,h,.18,'sand',true);
    for(let j=0;j<5;j++){const a=j*2.4,xx=x+Math.cos(a)*1.2,zz=z+Math.sin(a)*1.2;B.beam(V(x,y+h*.6,z),V(xx,y+h,zz),.1,'sand',true);B.instance('sphere',xx,y+h,zz,1.5,1.2,1.4,'plant',true);}
  }
  function storefront(x,z,w,y,text,tone='oxide'){
    shell(x,z,w,4.2,y,3.8,tone,.25,1,0,'dark');B.box(x,y+1.8,z+2.18,w-.7,2.8,.15,'black',false,true);B.box(x,y+1.85,z+2.32,w-.95,2.45,.10,'glass',false,true);
    for(let a=-w/2+.6;a<w/2;a+=2.2)B.box(x+a,y+1.8,z+2.45,.095,2.8,.12,'copper',false,true);
    B.box(x,y+3.45,z+2.8,w+.15,.22,1.8,tone,true);B.box(x,y+3.28,z+3.63,w-.35,.08,.06,'warm',false,true);
    sign(text,x,y+4.2,z+2.3,w*.88,.95,0,tone==='oxide'?'#ecb37f':'#93c7cc');
  }
  function streetGrid(){
    const {x:xs,z:zs,widthsX:wx,widthsZ:wz}=data.groundStreets,L=xs[0]-wx[0]/2,R=xs[6]+wx[6]/2,N=zs[0]-wz[0]/2,S=zs[6]+wz[6]/2;
    for(let i=0;i<7;i++)slab(xs[i],(N+S)/2,wx[i],S-N,0,.6,'asphalt','ground');
    for(let j=0;j<7;j++)for(let i=0;i<6;i++){const a=xs[i]+wx[i]/2,b=xs[i+1]-wx[i+1]/2;slab((a+b)/2,zs[j],b-a,wz[j],0,.6,'asphalt','ground');}
    for(const b of data.blocks)slab(b.x,b.z,b.w+6.4,b.d+6.4,.28,.55,'pavement','ground');
    for(const [axis,lines,widths,cross,cwidths] of [['z',xs,wx,zs,wz],['x',zs,wz,xs,wx]])for(let i=0;i<7;i++){
      const p=lines[i],w=widths[i],alongX=axis==='x';
      for(let t=(alongX?L:N)+2;t<(alongX?R:S)-2;t+=6){if(cross.some((c,k)=>Math.abs(c-t)<cwidths[k]/2+7))continue;for(const s of[-1,1])flat(alongX?t:p+s*.15,alongX?p+s*.15:t,alongX?2.8:.08,alongX?.08:2.8,.012,'paint');}
      for(let j=0;j<7;j++)for(const s of[-1,1])for(let a=-w/2+1.3;a<w/2-1;a+=1.25){const t=cross[j]+s*(cwidths[j]/2+2.8);flat(alongX?t:p+a,alongX?p+a:t,alongX?2.5:.52,alongX?.52:2.5,.015,'paint');}
    }
    B.box(0,-2,0,1800,1,1800,'asphalt');
    for(const b of data.blocks){
      for(const s of[-1,1]){B.box(b.x+s*(b.w/2+2.6),.32,b.z,.12,.06,b.d+5,'steel',false,true);B.box(b.x,.32,b.z+s*(b.d/2+2.6),b.w+4.9,.06,.12,'steel',false,true);}
      for(const s of[-1,1]){const x=b.x+s*(b.w/2+1.8),z=b.z+b.d/2+1.8;B.box(x,4.6,z,.16,8.6,.16,'steel',false,true);B.box(x,8.8,z-1,.2,.18,2.2,'steel',false,true);B.box(x,8.68,z-1.3,.4,.06,1.3,'warm',false,true);}
    }
  }
  if(B.scope)B.scope('streets','ground',streetGrid);else streetGrid();
  const buildApi={B,shell,flat,slab,roofkit,plant,tree,sign,rail,pipe,indexCollider,addGeo};
  const urban=compileUrbanism(buildApi,data);
  const infill=planInfill(data,{ground,decks,buildings,urban},B.items||[]);
  if(B.scope){const kit=createScifiKit(buildApi,data);generateFrontage(buildApi,kit,infill.placements);generateStreetServices(buildApi,kit,infill.placements);generateRoofServices(buildApi,kit,infill.placements);generateNeighborhoods(buildApi,kit,infill.placements);}
  return {ground,decks,buildings,artifacts,urban,infill};
}

export function auditDistricts(data,compiled){
  const errors=[],pairs=[],overlaps=(a,b)=>Math.min(a.x+a.w/2,b.x+b.w/2)-Math.max(a.x-a.w/2,b.x-b.w/2)>1e-4&&Math.min(a.z+a.d/2,b.z+b.d/2)-Math.max(a.z-a.d/2,b.z-b.d/2)>1e-4;
  for(const group of[compiled.ground,compiled.decks])for(let i=0;i<group.length;i++)for(let j=i+1;j<group.length;j++)if(Math.abs(group[i].y-group[j].y)<.001&&overlaps(group[i],group[j]))pairs.push([i,j,group[i].kind]);
  if(pairs.length)errors.push(`${pairs.length} overlapping coplanar owned surfaces`);
  const{x:xs,z:zs,widthsX:wx,widthsZ:wz}=data.groundStreets;let blocked=0;
  for(const b of compiled.buildings){if(b.base>=12||b.x<xs[0]||b.x>xs[6]||b.z<zs[0]||b.z>zs[6])continue;for(let i=0;i<7;i++)if(b.x-b.w/2<xs[i]+wx[i]/2&&b.x+b.w/2>xs[i]-wx[i]/2)blocked++;for(let i=0;i<7;i++)if(b.z-b.d/2<zs[i]+wz[i]/2&&b.z+b.d/2>zs[i]-wz[i]/2)blocked++;}
  if(blocked)errors.push(`${blocked} building/road conflicts`);
  const urban=auditUrbanism(data,compiled);errors.push(...urban.errors);if(compiled.infill&&!compiled.infill.audit.ok)errors.push('Infill reservation conflict');return{...urban,ok:!errors.length,errors,ownedSurfaces:compiled.ground.length+compiled.decks.length,coplanarOverlapPairs:pairs.length,roadConflicts:blocked,districts:data.districts.map(d=>({name:d.name,blocks:d.blocks.length})),blocks:data.blocks.length,links:data.upperLinks.length};
}
