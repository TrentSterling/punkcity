/** Punkcity 0.3. Street-linked block envelopes and purposeful elevated public space.
 * Renderer-neutral reservations come first. Geometry consumes those same records.
 * No assets or implementation code are copied from the reference generators.
 */
import * as THREE from 'three';
import {createScifiKit} from './scifi.js';
const V=(x,y,z)=>new THREE.Vector3(x,y,z);
const FLOOR=.28,LEVEL=16,PATH=7,PLAZA=12;
const round=n=>Math.round(n*1000)/1000;
export const URBAN_REVISION='0.5.0';

export function planUrbanism(city){
  city.version=URBAN_REVISION;city.upperLinks=[];
  // Two inhabited upper streets, connected by two north-south access spines.
  // This is an authored network grammar with seeded buildings, not arbitrary bridges.
  for(const b of city.blocks){
    b.deck=b.j===2||b.j===4||(b.i===2&&b.j>=1)||(b.i===4&&b.j===3);
    b.deckY=LEVEL;b.links=[];b.publicSpace=b.deck?'upper square':'ground court';
    b.entrance={x:b.x,z:b.z-6,y:b.deck?LEVEL:FLOOR};
    b.program=['works','corporate','utilities','housing','commerce','residential'][b.district];
    b.assembly=(b.seed>>>8)%3;
    b.accessStair=b.deck&&((b.j===2&&[0,3,5].includes(b.i))||(b.j===4&&b.i%2===1));
    b.reservedPaths=[{x:b.x,z:b.z+Math.max(6,b.d/4),w:12,d:b.d/2-4,role:'street-to-court'}];
    if(b.deck)b.reservedPaths.push({x:b.x,z:b.z,w:b.w,d:PATH,role:'upper-route'});
  }
  for(const a of city.blocks)if(a.deck)for(const [di,dj,axis,side,opp]of [[1,0,'x','E','W'],[0,1,'z','S','N']]){
    const b=city.blocks.find(b=>b.i===a.i+di&&b.j===a.j+dj);if(!b?.deck)continue;
    // Cross-district links follow the chosen spines, not every possible adjacency.
    if(axis==='z'&&![2,4].includes(a.i))continue;
    city.upperLinks.push({a:a.id,b:b.id,axis,y:LEVEL,width:PATH,role:'public upper street'});
    a.links.push(side);b.links.push(opp);
  }
  const elevations=[];
  for(const b of city.blocks){
    b.masses=[];
    const add=(role,x,z,w,d,top,mat,variant=0)=>{
      if(w<3||d<3)throw new Error('Unusable mass in '+b.id);
      b.masses.push({id:b.id+'/'+role,role,x:round(x),z:round(z),w:round(w),d:round(d),top:round(top),mat,variant});
    };
    // All frontages stop at the same court / route reservation. North-south
    // connections reserve a full through-corridor rather than cutting through walls.
    const innerW=b.w-4,depth=Math.max(10,b.d/2-8),nz=b.z-6-depth/2;
    const splitNorth=b.links.includes('N');
    const topBase=b.deck?LEVEL:12;
    const r=(b.seed%997)/997;
    const district=b.district;
    const baseTop=district===0?10+2*b.assembly:topBase;
    const northWidth=splitNorth?(innerW-12)/2:innerW;
    const northCenters=splitNorth?[b.x-6-northWidth/2,b.x+6+northWidth/2]:[b.x];
    northCenters.forEach((cx,n)=>add('north'+n,cx,nz,northWidth,depth,baseTop,['rust','facIvory','carbon','facSand','facMarket','facIvory'][district],b.assembly));
    const southW=(innerW-14)/2,sd=Math.max(9,Math.min(17,b.d/2-12)),sz=b.z+b.d/2-2-sd/2;
    // In the foundry, one side is a loading yard instead of filling every lot.
    for(const s of[-1,1])if(district!==0||s===-1)add(s<0?'southW':'southE',b.x+s*(7+southW/2),sz,southW,sd, district===1?12:district===2?8:district===0?6:14+4*((b.seed+s+3)%3),district===0?'steel':district===2?'dark':district===5?'facIvory':s<0?'facRust':'facBlue');
    b.towers=[];
    const tower=(host,role,w,d,height,mat,kind=0,offset=0)=>{
      const h=Math.max(host.top+8,Math.round(height*city.heightMultiplier/4)*4);
      b.towers.push({id:b.id+'/'+role,role,host:host.id,x:round(host.x+offset),z:round(host.z-1.5),w:round(Math.min(w,host.w-5)),d:round(Math.min(d,host.d-7)),base:host.top,top:h,mat,kind});
    };
    for(const [n,host]of b.masses.filter(m=>m.role.startsWith('north')).entries()){
      if(district===1){
        const nearCenter=b.i===3&&b.j===2;
        tower(host,'tower'+n,host.w*(splitNorth?.78:.51),host.d*.77,nearCenter?132:52+36*r+(b.j===2?12:0),'facGlass',nearCenter?2:b.assembly,splitNorth?0:-host.w*.16);
        if(!splitNorth&&host.w>40&&!nearCenter)tower(host,'annex',host.w*.24,host.d*.69,32+16*r,'facIvory',0,host.w*.29);
      }else if(district===3||district===4){
        if(host.w>38){
          const gap=2.4,ww=(host.w-6-gap)/2;
          for(const s of[-1,1])tower({...host,x:host.x+s*(ww+gap)/2,w:ww+4},'hab'+n+s,ww,host.d-4,(district===3?36:24)+r*16+(s>0?8:0),s>0?'facIvory':'facSand',b.assembly);
        }else tower(host,'hab'+n,host.w-4,host.d-4,(district===3?40:26)+r*16,n?'facBlue':'facSand',b.assembly);
      }else if(district===2)tower(host,'vault'+n,host.w*.82,host.d*.8,38+r*18,'facDark',1);
      else if(district===5)tower(host,'terrace'+n,host.w-5,host.d-5,32+r*12,'facIvory',3);
    }
    // Explicit endpoint squares and exact arm ends: never rectangular rings.
    if(b.deck){
      const rects=[{id:b.id+'/square',x:b.x,z:b.z,w:PLAZA,d:PLAZA,y:LEVEL,kind:'square'}];
      for(const side of b.links){
        const horizontal=side==='E'||side==='W',sign=side==='N'||side==='W'?-1:1;
        const len=(horizontal?b.w:b.d)/2-PLAZA/2;
        rects.push({id:b.id+'/'+side,x:b.x+(horizontal?sign*(PLAZA/2+len/2):0),z:b.z+(horizontal?0:sign*(PLAZA/2+len/2)),w:horizontal?len:PATH,d:horizontal?PATH:len,y:LEVEL,kind:'arm'});
      }
      b.walkSurfaces=rects;elevations.push(...rects);
    }else b.walkSurfaces=[];
  }
  city.elevatedSurfaces=elevations;
  city.routeGraph={nodes:city.blocks.filter(b=>b.deck).map(b=>({id:b.id,position:[b.x,LEVEL,b.z],program:b.program,groundAccess:b.accessStair,destination:b.masses[0].id})),edges:city.upperLinks.map(l=>({a:l.a,b:l.b}))};
  return city;
}

export function compileUrbanism(api,city){
  const {B,shell,flat,slab,roofkit,plant,tree,sign,rail,pipe,indexCollider,addGeo}=api;
  const sci=createScifiKit(api,city);
  const run=(layer,owner,fn)=>B.scope?B.scope(layer,owner,fn):fn();
  const records={entrances:[],stairs:[],supports:[],access:[],context:[],roofs:[]};
  const rands=s=>{let a=s>>>0;return()=>{a+=0x6d2b79f5;let t=Math.imul(a^a>>>15,1|a);t^=t+Math.imul(t^t>>>7,61|t);return((t^t>>>14)>>>0)/4294967296;};};
  const edge=(x1,z1,x2,z2,y)=>{if(Math.hypot(x2-x1,z2-z1)>.15)rail(x1,z1,x2,z2,y);};
  const isNarrow=mat=>mat==='facGlass'?'steel':'concrete';

  function parapet(m,y,open='',socket=null){
    const {x,z,w,d}=m;
    for(const side of['N','S','E','W']){
      const horiz=side==='N'||side==='S',s=side==='N'||side==='W'?-1:1,len=horiz?w:d,cx=x+(horiz?0:s*w/2),cz=z+(horiz?s*d/2:0);
      if(open===side){const u=3.5,off=socket?(horiz?socket.x-x:socket.z-z):0;if(horiz){edge(cx-len/2+.3,cz,cx+off-u,cz,y);edge(cx+off+u,cz,cx+len/2-.3,cz,y);}else{edge(cx,cz-len/2+.3,cx,cz+off-u,y);edge(cx,cz+off+u,cx,cz+len/2-.3,y);}}
      else edge(cx-(horiz?len/2-.3:0),cz-(horiz?0:len/2-.3),cx+(horiz?len/2-.3:0),cz+(horiz?0:len/2-.3),y);
    }
  }
  function entrance(m,y,upper=false,text='ACCESS'){
    const x=m.x,z=m.z+m.d/2,w=Math.min(5,m.w-2),h=3.5;
    // A recessed-looking portal is architectural dressing, not a promise of an interior.
    B.box(x,y+h/2,z+.12,w,h,.18,'black',false,true);
    B.box(x,y+1.55,z+.25,w-.65,3,.12,'glass',false,true);
    for(const s of[-1,1])B.box(x+s*(w/2+.16),y+1.8,z+.38,.24,3.6,.5,'steel',false,true);
    B.box(x,y+1.55,z+.35,.1,3,.1,'steel',false,true);
    B.box(x,y+3.8,z+.9,w+1,.26,2.8,'steel',false,true);
    B.box(x,y+3.63,z+2.1,w-.3,.06,.07,'warm',false,true);
    sign(text,x,y+4.65,z+.3,w+1,1,0,upper?'#91b9ba':'#c3b28e');
    records.entrances.push({building:m.id,position:[x,y,z+.5],level:upper?'upper':'ground'});
  }
  function shop(m,b){run('frontage',m.id+'/shops',()=>sci.shops(m,b));}
  function podium(m,b){
    shell(m.x,m.z,m.w,m.d,FLOOR,m.top-FLOOR,m.mat,.65,1,0,m.top===LEVEL?'deck':'dark');
    // Coarse architectural division, not a cage of trim around every window.
    const sz=m.z+m.d/2;
    if(b.district!==0)for(const s of[-1,1]){
      B.box(m.x,m.top-.48,m.z+s*(m.d/2+.13),m.w-1,.32,.22,'steel',false,true);
      for(let i=-m.w/2+2;i<m.w/2-1;i+=6.5)B.box(m.x+i,2.25,m.z+s*(m.d/2+.22),.4,3.9,.55,'concrete',false,true);
    }
    if(m.role.startsWith('south')&&b.district!==0&&b.district!==2)shop(m,b);
    if(m.role.startsWith('north')){
      entrance(m,FLOOR,false,['WORKS ENTRY','CIVIC LOBBY','SERVICE ENTRY','RESIDENT ACCESS','MARKET HALL','GARDEN COURT'][b.district]);
      if(b.deck&&m.top===LEVEL){
        parapet(m,m.top,b.links.includes('N')?(m.x<b.x?'E':'W'):'S',{x:b.x,z:b.z-10});
        // Upper level has a real terrace landing, not a disconnected facade portal.
        const host=city.blocks.find(bb=>bb.id===b.id);
        if(!b.links.includes('N')){
          const len=Math.max(0,m.z+m.d/2-(b.z-6));
          records.access.push({block:b.id,level:LEVEL,kind:'terrace threshold',at:[m.x,LEVEL,b.z-6]});
        }
      }
    }
    // Sides are visually distinct machinery strips, without decorating every wall.
    if(b.district===2||b.district===0)for(let i=0;i<3;i++){
      const xx=m.x+m.w/2+.22,zz=m.z-m.d*.25+i*m.d*.23;
      B.box(xx,m.top*.48,zz,.32,m.top*.60,1.8,'steel',false,true);
      for(let k=0;k<5;k++)B.box(xx+.22,m.top*.22+k*.38,zz,.18,.12,1.5,'black',false,true);
    }
  }
  function tower(t,b,r){sci.tower(t,b,r);records.roofs.push({building:t.id,y:t.top,x:t.x,z:t.z,w:t.w,d:t.d});}
  function loadingDock(m,b){
    const z=m.z+m.d/2;
    const n=Math.floor(m.w/7.5),ww=m.w/n;
    for(let k=0;k<n;k++){
      const x=m.x-m.w/2+(k+.5)*ww;
      B.box(x,2.8,z+.14,ww-1.5,4.8,.22,'dark',false,true);
      for(let j=0;j<9;j++)B.box(x,.75+j*.48,z+.28,ww-1.8,.06,.14,'steel',false,true);
      for(const s of[-1,1])B.box(x+s*(ww/2-.6),1,z+1,.13,1.6,.13,'copper',false,true);
    }
    B.box(m.x,6,z+1.5,m.w,.35,4.2,'steel',true);
    sign('LOADING / '+b.id,m.x,7,z+.35,Math.min(11,m.w*.5),1.3,0,'#d2b185');
  }
  function industry(b,r){
    const m=b.masses[0];loadingDock(m,b);
    const x=m.x,z=m.z,w=m.w,d=m.d,y=m.top;
    for(let i=0;i<4;i++){
      const z0=z-d/2+(i+.5)*d/4;
      B.box(x,y+.75,z0,w-2,1.5,2,'steel',false,true);
      B.box(x,y+.80,z0+1.08,w-3,1,.10,'glass',false,true);
    }
    const gx=b.x+b.w*.31,gz=b.z+b.d*.18;
    for(let i=0;i<2;i++){
      const xx=gx+(i-.5)*7,h=13+i*3;
      B.instance('cyl',xx,h/2+.28,gz,2.6,h,2.6,'steel');
      B.instance('sphere',xx,h+.28,gz,2.6,.8,2.6,'panel');
      indexCollider(new THREE.Box3(V(xx-2.6,.28,gz-2.6),V(xx+2.6,h+1,gz+2.6)));
      pipe([xx,h-2,gz],[xx,h-2,m.z+m.d/2+1],.25,'copper');
    }
    // Crane lives over the yard, not through every block's upper route.
    if(b.j===0||b.assembly===1){
      const z=b.z+4,h=24,x=b.x;
      for(const s of[-1,1])B.box(x+s*(b.w/2-3),h/2,z,1.1,h,1.8,'rust',true);
      B.box(x,h,z,b.w-4,1.3,2.5,'rust',false,true);
      B.box(x,h-2.6,z,b.w-4,.25,.4,'steel',false,true);
      for(let a=-b.w/2+3;a<b.w/2-5;a+=4)B.beam(V(x+a,h,z),V(x+a+4,h-2.6,z),.15,'steel',true);
      B.box(x+b.w*.17,h-5,z,.08,8,.08,'black',false,true);
    }
    if(b.deck){
      const ww=12,dd=7,zz=b.z-6-dd/2;
      shell(b.x,zz,ww,dd,m.top,LEVEL-m.top,'steel',.3,1,0,'dark');
      shell(b.x,zz,ww,dd,LEVEL,4,'facDark',.3,1,0,'steel');
      entrance({id:b.id+'/service',x:b.x,z:zz,w:ww,d:dd},LEVEL,true,'WORKS CONTROL');
    }
  }
  function roofAccess(b){
    if(!b.deck||b.district===0)return;
    const host=b.masses.find(m=>m.role.startsWith('north'));
    if(b.links.includes('N')){
      // Northern through routes stay open; two short arms meet terrace edges.
      for(const s of[-1,1]){
        const xx=b.x+s*4.75,zz=b.z-10;
        slab(xx,zz,2.5,PATH,LEVEL,.7,'deck','terrace');
      }
      const m=b.masses[0],ww=Math.min(9,m.w-3),zz=b.z-8.7;
      shell(m.x,zz,ww,3,LEVEL,4.5,'facDark',.35,1,0,'steel');
      entrance({id:m.id+'/upper',x:m.x,z:zz,w:ww,d:3},LEVEL,true,'PUBLIC TERRACE');
    }else{
      const farZ=b.z-8.7,ww=Math.min(10,host.w*.4),dd=3;
      shell(b.x,farZ,ww,dd,LEVEL,4.5,'facDark',.35,1,0,'steel');
      entrance({id:host.id+'/pavilion',x:b.x,z:farZ,w:ww,d:dd},LEVEL,true,['WORKS','CIVIC','RELAY','RESIDENTS','MARKET','GARDEN'][b.district]);
    }
  }
  function supports(rect){
    const horizontal=rect.w>=rect.d,len=horizontal?rect.w:rect.d;
    const n=Math.max(1,Math.ceil(len/11));
    for(let i=0;i<n;i++){
      const t=-len/2+(i+.5)*len/n,x=rect.x+(horizontal?t:0),z=rect.z+(horizontal?0:t);
      B.box(x,7.5,z,.8,14.44,.8,'concrete',true);
      for(const s of[-1,1])B.beam(V(x,12,z),V(x+(horizontal?0:s*2.5),15,z+(horizontal?s*2.5:0)),.28,'steel',true);
      records.supports.push({x,z,top:15,owner:rect.id});
    }
  }
  function platform(b){
    for(const p of b.walkSurfaces){
      slab(p.x,p.z,p.w,p.d,LEVEL,1,'deck',p.kind);
      if(p.kind==='arm'){
        supports(p);const horiz=p.w>p.d,len=horiz?p.w:p.d,half=(horiz?p.d:p.w)/2;
        for(const s of[-1,1]){
          const x=p.x+(horiz?0:s*(half-.15)),z=p.z+(horiz?s*(half-.15):0);
          if(p.id.endsWith('/N')){edge(x,z-len/2,x,b.z-13.5,LEVEL);edge(x,b.z-6.5,x,z+len/2,LEVEL);}
          else edge(x-(horiz?len/2:0),z-(horiz?0:len/2),x+(horiz?len/2:0),z+(horiz?0:len/2),LEVEL);
          B.box(x,LEVEL-.55,z,horiz?len:.09,.11,horiz?.09:len,'amber',false,true);
        }
      }
    }
    if(!b.deck)return;
    // Railing gaps agree with route arms, roof thresholds and stair exits.
    for(const side of['N','S','E','W']){
      const horiz=side==='N'||side==='S',s=side==='N'||side==='W'?-1:1;
      const cx=b.x+(horiz?0:s*6),cz=b.z+(horiz?s*6:0);
      let gap=b.links.includes(side)?PATH:0;
      if(side==='N')gap=PLAZA;
      if(side==='S'&&b.accessStair)gap=6;
      const line=(a,c)=>edge(cx+(horiz?a:0),cz+(horiz?0:a),cx+(horiz?c:0),cz+(horiz?0:c),LEVEL);
      if(gap>0){line(-6,-gap/2);line(gap/2,6);}else line(-6,6);
    }
    if(!b.links.includes('E')){plant(b.x+4.4,b.z,1.4,5,LEVEL);}
    if(!b.links.includes('W')){B.box(b.x-4.2,LEVEL+.48,b.z,1.2,.6,3.6,'sand',false,true);}
    const sx=b.x+4.8,sz=b.z+4.6;
    B.box(sx,LEVEL+1.15,sz,.36,2.3,.36,'steel',false,true);
    sign(['WORKS','CIVIC','RELAY','STACKS','MARKET','GARDEN'][b.district],sx,LEVEL+2.65,sz+.24,2.5,.85,0,'#c6b487');
    B.box(sx,LEVEL+1.8,sz+.24,.18,.1,.08,'amber',false,true);
  }
  function switchback(b){
    if(!b.accessStair)return;
    const x=b.x,z=b.z+6,flightHeight=(LEVEL-FLOOR)/4,tread=.34,n=18,run=n*tread,ww=2.65,gap=.3;
    for(let f=0;f<4;f++){
      const base=FLOOR+f*flightHeight,forward=f%2===0,xx=x+(forward?-1:1)*(ww+gap)/2;
      for(let i=0;i<n;i++){
        const top=base+(i+1)*flightHeight/n;
        const zz=forward?z+1.8+(i+.5)*tread:z+1.8+run-(i+.5)*tread;
        B.box(xx,top-.13,zz,ww,.26,tread,'concrete',true);
      }
      for(const s of[-1,1]){
        const sx=xx+s*(ww/2-.07);
        B.beam(V(sx,base+.9,forward?z+1.8:z+1.8+run),V(sx,base+flightHeight+.9,forward?z+1.8+run:z+1.8),.07,'steel',true);
        B.beam(V(sx,base-.15,forward?z+1.8:z+1.8+run),V(sx,base+flightHeight-.15,forward?z+1.8+run:z+1.8),.17,'steel',true);
      }
      const landingZ=forward?z+1.8+run+.9:z+.9;
      slab(x,landingZ,ww*2+gap,1.8,base+flightHeight,.26,'concrete','stairLanding');
      edge(x-ww-gap/2,landingZ+(forward?.82:-.82),x+ww+gap/2,landingZ+(forward?.82:-.82),base+flightHeight);
    }
    for(const s of[-1,1])B.box(x+s*2.7,7.6,z+run+2.7,.25,15,.25,'steel',true);
    sign('PUBLIC STAIRS',x,3.25,z+run+3.2,5,1,0,'#c6baa1');
    records.stairs.push({block:b.id,bottom:FLOOR,top:LEVEL,rise:flightHeight/n,tread,width:ww,footprint:{x,z:z+(run+3.6)/2,w:ww*2+gap,d:run+3.6}});
  }
  function bridge(l){
    const a=city.blocks.find(b=>b.id===l.a),b=city.blocks.find(b=>b.id===l.b),horizontal=l.axis==='x';
    const lo=horizontal?a.x+a.w/2:a.z+a.d/2,hi=horizontal?b.x-b.w/2:b.z-b.d/2;
    const rect={id:l.a+'>'+l.b,x:horizontal?(lo+hi)/2:a.x,z:horizontal?a.z:(lo+hi)/2,w:horizontal?hi-lo:PATH,d:horizontal?PATH:hi-lo,y:LEVEL,kind:'bridge'};
    slab(rect.x,rect.z,rect.w,rect.d,LEVEL,1,'deck','bridge');
    const len=hi-lo;
    for(const s of[-1,1]){
      const x=rect.x+(horizontal?0:s*(PATH/2-.15)),z=rect.z+(horizontal?s*(PATH/2-.15):0);
      edge(x-(horizontal?len/2:0),z-(horizontal?0:len/2),x+(horizontal?len/2:0),z+(horizontal?0:len/2),LEVEL);
      B.box(x,13.9,z,horizontal?len:.2,.25,horizontal?.2:len,'dark',false,true);
      const n=Math.ceil(len/3.5);
      for(let i=0;i<n;i++){const t=-len/2+i*len/n;B.beam(V(x+(horizontal?t:0),15,z+(horizontal?0:t)),V(x+(horizontal?t+len/n:0),13.9,z+(horizontal?0:t+len/n)),.14,'steel',true);}
      for(const end of[-1,1])B.box(x+(horizontal?end*(len/2+.45):0),7.5,z+(horizontal?0:end*(len/2+.45)),.8,14.45,.8,'concrete',true);
    }
    records.access.push({kind:'bridge',a:l.a,b:l.b,rect});
  }
  function court(b,r){
    if(b.district===5){
      const x=b.x,z=b.z+b.d*.26;
      for(const s of[-1,1]){plant(x+s*4.3,z,2,5,FLOOR);tree(x+s*4.3,z,.75,r);}
    }else if(b.district===4){
      for(const s of[-1,1]){
        const x=b.x+s*(b.w/2-8),z=b.z+2;
        B.box(x,1.1,z,3.4,1.6,2.2,'rust',true);B.box(x,3.2,z,4.4,.16,3.6,s>0?'rust':'sand',true);
        for(const a of[-1,1])B.box(x+a*1.7,1.9,z-1,.07,2.6,.07,'steel',false,true);
      }
    }
    for(const s of[-1,1]){
      const m=b.masses.find(m=>m.role===(s<0?'southW':'southE'));if(!m)continue;
      B.box(m.x+s*(m.w/2+.35),1.1,m.z,.55,1.65,1.2,'steel',false,true);
      for(let i=0;i<3;i++)B.box(m.x+s*(m.w/2+.65),1+i*.2,m.z,.05,.045,.85,'black',false,true);
    }
    if(!b.deck){const m=b.masses[0];plant(m.x-m.w*.3,b.z-3,Math.max(3,m.w*.22),2.2,FLOOR);}
  }

  for(const b of city.blocks){
    const r=rands(b.seed);
    b.masses.forEach(m=>{run('buildings',m.id,()=>podium(m,b));run('armor',m.id+'/armor',()=>sci.podium(m,b));});
    b.towers.forEach(t=>run('buildings',t.id,()=>tower(t,b,r)));
    if(b.district===0)run('buildings',b.id+'/industry',()=>industry(b,r));
    run('traversal',b.id+'/routes',()=>{platform(b);roofAccess(b);switchback(b);});
    run('services',b.id+'/court',()=>court(b,r));run('services',b.id+'/legacy-services',()=>sci.extras(b));
  }
  city.upperLinks.forEach(l=>run('traversal',l.a+'>'+l.b,()=>bridge(l)));
  const previousLayer=B.layer;B.layer='context';

  // Ordered urban context replaces the fence of isolated random skyscrapers.
  const r=rands(8211);
  for(let j=-2;j<8;j++)for(let i=-2;i<8;i++){
    if(i>=0&&i<6&&j>=0&&j<6)continue;
    const x=-216+i*80,z=-195+j*80,xx=x+((i+j)%2)*4;
    const h=16+Math.floor(r()*6)*4;
    shell(xx,z,58,51,-.65,h,r()>.6?'facSand':'facBlue',1,1,0,'dark',false);
    if(r()>.48)shell(xx-12,z-5,25,27,h-.65,20+r()*42,'facDark',1.2,1,0,'dark',false);
    records.context.push({x:xx,z,h});
  }
  B.layer=previousLayer;
  records.scifi=sci.records;
  return records;
}

export function auditUrbanism(city,compiled){
  const errors=[],nodes=city.routeGraph.nodes,edges=city.routeGraph.edges;
  const adjacency=new Map(nodes.map(n=>[n.id,[]]));
  for(const e of edges){if(!adjacency.has(e.a)||!adjacency.has(e.b)){errors.push('Dangling link');continue;}adjacency.get(e.a).push(e.b);adjacency.get(e.b).push(e.a);}
  const seen=new Set(),visit=id=>{if(seen.has(id))return;seen.add(id);for(const n of adjacency.get(id)||[])visit(n);};if(nodes.length)visit(nodes[0].id);
  if(seen.size!==nodes.length)errors.push('Disconnected upper street network');
  const stairs=compiled.urban?.stairs||[];
  if(!stairs.length)errors.push('No ground access');
  const intersects=(a,b,pad=0)=>Math.min(a.x+a.w/2,b.x+b.w/2)-Math.max(a.x-a.w/2,b.x-b.w/2)>pad&&Math.min(a.z+a.d/2,b.z+b.d/2)-Math.max(a.z-a.d/2,b.z-b.d/2)>pad;
  let clearanceConflicts=0;
  for(const b of city.blocks){
    for(const a of b.walkSurfaces)for(const m of b.masses){if(m.top<LEVEL+.001)continue;if(intersects(a,m,.001))clearanceConflicts++;}
    for(const a of b.walkSurfaces)for(const m of b.towers){if(m.top<LEVEL+.001||m.base>LEVEL+2.3)continue;if(intersects(a,m,.001))clearanceConflicts++;}
    const stair=stairs.find(s=>s.block===b.id);if(stair){for(const m of b.masses)if(intersects(stair.footprint,m,.001))errors.push('Stair footprint occupied in '+b.id);if(Math.abs(stair.top-LEVEL)>.001)errors.push('Stair height mismatch');}
    for(let i=0;i<b.masses.length;i++)for(let j=i+1;j<b.masses.length;j++)if(intersects(b.masses[i],b.masses[j],.001))errors.push('Ground mass overlap in '+b.id);
  }
  if(clearanceConflicts)errors.push('Upper headroom occupied: '+clearanceConflicts);
  return {ok:!errors.length,errors,upperNodes:nodes.length,upperConnections:edges.length,connectedUpperNodes:seen.size,groundStairs:stairs.length,upperClearanceConflicts:clearanceConflicts,entrances:compiled.urban?.entrances.length||0,ringPlatforms:0};
}
