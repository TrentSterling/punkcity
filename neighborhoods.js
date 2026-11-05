/** Punkcity 0.6. Additive, reserved neighborhood assemblies.
 * Each cluster owns its geometry, mounting plane and body collision.
 * Existing streets, architecture, v0.5 placements and walking routes are retained.
 */
import {propKit} from './prop-kit.js';
export const EXTRA_DIMS={
 noodlebar:[6.8,5.4,4.5],produce:[5.8,4.8,4.1],clinic:[6.4,4.6,4.5],arcade:[6.2,4.8,4.4],fabricator:[6.4,4.6,4.2],coffee:[5.8,4.8,4.2],botanist:[5.6,4.8,4.2],
 vendingbay:[3.8,1.9,2.9],dronehub:[3.8,3.4,2.9],battery:[3.6,2.8,3.1],bikebay:[4.6,3.1,1.9],recycling:[3.6,1.9,2.1],hydration:[2.5,2.0,2.9],streettable:[3.8,3.8,3.5],neonpylon:[1.8,1.8,4.2],toolcart:[2.8,1.9,1.9],transit:[5.8,3.4,3.6],
 greenhouse:[6.4,4.8,4.1],roofcafe:[6.6,5.2,4.0],roofworkshop:[6.0,4.8,4.1],commarray:[3.8,3.8,4.5],waterbank:[4.8,3.4,3.9],roofgym:[5.6,4.6,3.5]
};
export const PLACE_NAMES={noodlebar:'SOMA noodle kitchen',produce:'Produce and provisions',clinic:'NEURO street clinic',arcade:'CHROMA arcade',fabricator:'HARDLINE fabrication booth',coffee:'ORBIT coffee counter',botanist:'Garden supply stall',vendingbay:'Vending bank',dronehub:'Courier drone station',battery:'Battery exchange',bikebay:'Courier bike rack',recycling:'Sorted recycling',hydration:'Public water station',streettable:'Street dining pocket',neonpylon:'District service directory',toolcart:'Maintenance cart',transit:'Transit waiting shelter',greenhouse:'Rooftop hydroponics',roofcafe:'Rooftop café',roofworkshop:'Rooftop repair shop',commarray:'Communications array',waterbank:'Water recovery tanks',roofgym:'Residential exercise terrace'};
function rng(text){let a=2166136261;for(const c of String(text)){a^=c.charCodeAt(0);a=Math.imul(a,16777619);}return()=>{a+=0x6d2b79f5;let t=Math.imul(a^a>>>15,1|a);t^=t+Math.imul(t^t>>>7,61|t);return((t^t>>>14)>>>0)/4294967296;};}
export function planNeighborhoods(city,compiled,add,placements,registry){
 // Public terrace edges remain accessible even when their podium roof has spare area.
 for(const b of city.blocks)for(const m of b.masses)if(m.role.startsWith('north')&&m.top===16){
  registry.reserve({id:m.id+'/roof-promenade',x:m.x,z:m.z+m.d/2-1.3,w:m.w,d:2.6,bottom:m.top+.01,top:m.top+3,kind:'roof-route'});
  registry.reserve({id:m.id+'/roof-approach',x:m.x,z:m.z,w:3.4,d:m.d,bottom:m.top+.01,top:m.top+3,kind:'roof-route'});
 }
 const front=[['fabricator','coffee'],['coffee','clinic'],['fabricator','clinic'],['clinic','produce','noodlebar','arcade'],['noodlebar','arcade','produce','coffee','clinic'],['botanist','coffee','produce']];
 const street=[['toolcart','battery','dronehub','recycling'],['transit','vendingbay','dronehub','neonpylon','hydration'],['battery','dronehub','toolcart','vendingbay'],['bikebay','recycling','streettable','hydration','vendingbay'],['streettable','vendingbay','bikebay','recycling','neonpylon'],['streettable','hydration','bikebay','transit','recycling']];
 const roofs=[['roofworkshop','waterbank','commarray'],['roofcafe','commarray','greenhouse'],['commarray','waterbank','roofworkshop'],['roofgym','greenhouse','roofcafe','waterbank'],['roofcafe','roofworkshop','greenhouse'],['greenhouse','roofcafe','roofgym','waterbank']];
 for(const b of city.blocks){
  const r=rng(city.seed+':neighborhood:'+b.id),candidates=[];
  for(let z=b.z-b.d/2+4.5;z<b.z+b.d/2-4;z+=4.8)for(let x=b.x-b.w/2+4.5;x<b.x+b.w/2-4;x+=4.8)candidates.push({x:x+(r()-.5)*.45,z:z+(r()-.5)*.45,rank:r()});
  const anchors=placements.filter(p=>p.block===b.id&&p.layer==='frontage');
  const score=p=>{const d=anchors.length?Math.min(...anchors.map(a=>Math.hypot(a.x-p.x,a.z-p.z))):Math.abs(p.z-b.z-7);return Math.abs(d-4.5)+p.rank*.8;};
  candidates.sort((a,c)=>score(a)-score(c));
  let placed=0;const majorLimit=[3,3,3,5,7,4][b.district];
  for(const p of candidates){if(placed>=majorLimit)break;const rot=p.x<b.x?Math.PI/2:-Math.PI/2,types=front[b.district];
   for(let k=0;k<types.length;k++){const type=types[(placed+k+b.assembly)%types.length],item=add(b,type,p.x,p.z,.28,rot,'frontage');if(item){item.neighborhood=b.program;anchors.push(item);placed++;break;}}
  }
  // Service pockets cluster around shops/courts; clear pedestrian reservations win.
  const small=[];for(let z=b.z-b.d/2+2.7;z<b.z+b.d/2-2.5;z+=3.0)for(let x=b.x-b.w/2+2.7;x<b.x+b.w/2-2.5;x+=3.0){const dist=anchors.length?Math.min(...anchors.map(a=>Math.hypot(x-a.x,z-a.z))):Math.abs(z-b.z);small.push({x,z,rank:Math.abs(dist-3.7)+r()*.7});}
  small.sort((a,c)=>a.rank-c.rank);let count=0;const quota=[12,12,12,15,18,14][b.district],used={};
  for(const p of small){if(count>=quota)break;const types=street[b.district];for(let i=0;i<types.length;i++){const type=types[(count+i+b.assembly)%types.length];if((used[type]||0)>=(type==='neonpylon'?1:['hydration','recycling','vendingbay'].includes(type)?3:4))continue;const item=add(b,type,p.x,p.z,.28,p.x<b.x?Math.PI/2:-Math.PI/2,'services');if(item){item.neighborhood=b.program;used[type]=(used[type]||0)+1;count++;break;}}}
  for(const host of b.masses){
   const spots=[];for(let z=host.z-host.d/2+3;z<=host.z+host.d/2-3;z+=4.3)for(let x=host.x-host.w/2+3;x<=host.x+host.w/2-3;x+=4.3)spots.push({x,z,rank:r()});spots.sort((a,c)=>a.rank-c.rank);
   let count=0;const max=Math.min(5,Math.max(2,Math.floor(host.w*host.d/95))),types=[...roofs[b.district]].sort((a,c)=>placements.filter(p=>p.type===a).length-placements.filter(p=>p.type===c).length);
   for(const p of spots){if(count>=max)break;for(let i=0;i<types.length;i++){const type=types[(count+i+b.assembly)%types.length],item=add(b,type,p.x,p.z,host.top,(b.seed%2)*Math.PI,'rooftops',host);if(item){item.neighborhood=b.program;count++;break;}}}
  }
 }
}

export function generateNeighborhoods(api,sci,placements){
 for(const p of placements.filter(p=>p.newContent))api.B.scope(p.layer,p.id,()=>{
  const k=propKit(api,sci,p),{box,casing,cyl,beam,screen,bodyCollider,planter,palette:c}=k,r=rng(p.seed),variant=Math.floor(r()*3);
  const accent=variant===0?c.armor:variant===1?'armorOrange':c.edge;
  const base=(w,d)=>{box(0,.08,0,w,.16,d,'carbon');};
  const seat=(x,z,rot=0)=>{casing(x,.64,z,.68,.18,.68,c.armor,rot,.1);box(x,.28,z,.14,.56,.38,'steel');bodyCollider(x,.45,z,.68,.9,.68);};
  const counter=(x,z,w,d=1)=>{casing(x,.70,z,w,1.4,d,c.armor,0,.18);box(x,1.48,z,w+.16,.16,d+.18,c.edge);bodyCollider(x,.74,z,w,1.48,d);};
  const sign=(kind,w=2.6,z=-1.45,y=3.55)=>screen(0,y,z,w,.70,kind);
  const canopy=(w=5.2,d=4,top=3.6)=>{
   for(const sx of[-1,1]){box(sx*(w/2-.18),top/2,-d/2+.18,.13,top,.13,'steel');box(sx*(w/2-.18),.12,-d/2+.18,.42,.24,.42,c.armor);}
   casing(0,top,0,w,.26,d,c.armor,0,.12);box(0,top-.22,d/2-.16,w-.6,.09,.12,c.glow);
   for(let i=0;i<4;i++)box(-w*.33+i*w*.22,top+.15,0,.11,.04,d-.3,c.edge);
   bodyCollider(0,top,0,w,.26,d);
  };
  const cabinet=(x,z,w=1.05,kind=5)=>{
   casing(x,1.25,z,w,2.5,.95,c.armor,0,.20);screen(x,1.75,z+.57,w*.70,.8,kind);casing(x,.62,z+.53,w*.72,.50,.12,'carbon');box(x+.28,.95,z+.65,.13,.13,.07,c.glow);bodyCollider(x,1.25,z,w,2.5,.95);
  };
  const backwall=(w=4.8,d=3.2,h=3.3)=>{casing(0,h/2,-d/2,w,h,.24,c.edge,0,.25);for(const sx of[-1,1])casing(sx*(w/2-.12),h/2,-.4,d*.62,h,.24,c.armor,Math.PI/2,.22);bodyCollider(0,h/2,-d/2,w,h,.24);};
  if(['noodlebar','coffee','produce','botanist'].includes(p.type)){
   const noodle=p.type==='noodlebar',w=noodle?6:5,depth=4;canopy(w,depth,noodle?3.95:3.6);backwall(w-.2,3,3.3);counter(0,.75,w-1.2);sign(p.type==='coffee'?1:p.type==='botanist'?6:3,w*.56,-1.35,3.08);
   for(const sx of[-1,1])box(sx*(w/2-.6),2.15,-1.26,.15,1.7,.18,'steel');
   if(noodle||p.type==='coffee'){
    box(0,1.25,-.9,w-1.3,.16,.8,'steel');
    for(let i=0;i<3;i++){const x=-1.3+i*1.3;cyl(x,1.83,-.9,.33,.99,'armorSilver');cyl(x,2.37,-.9,.36,.09,'carbon');cyl(x,1.76,.75,.18,.36,i%2?'armorBone':'armorOrange');}
    for(const sx of[-1,1]){seat(sx*(noodle?2.55:2.1),1.1);box(sx*(w/2-.3),2.85,1.3,.10,.8,.1,'steel');casing(sx*(w/2-.3),2.5,1.3,.46,.52,.46,'amber',0,.08);}
   }else if(p.type==='produce'){
    for(let i=0;i<4;i++){const x=-1.35+i*.9;casing(x,1.69,.75,.79,.24,.74,'sand',0,.05);for(let a=0;a<2;a++)for(let b=0;b<2;b++)cyl(x-.15+a*.30,1.97,.6+b*.30,.12,.31,(i+a)%2?'armorJade':'armorOrange');}
    for(const sx of[-1,1]){casing(sx*1.65,.38,-.75,.8,.76,.8,'sand');cyl(sx*1.65,.99,-.75,.30,.44,'armorJade');}
   }else{
    for(const sx of[-1,1]){planter(sx*1.65,0,-.5,.85,1.5);for(let j=0;j<3;j++){cyl(sx*1.2,1.72+j*.40,-.8,.26,.35,'armorJade');}}
    for(let i=0;i<3;i++)cyl(-.8+i*.8,1.87,.75,.22,.6,'green');
   }
   base(w-.4,3.2);
  }else if(p.type==='clinic'){
   base(5.5,3.4);backwall(5.5,3.4,3.5);canopy(5.8,3.8,3.7);casing(-1.45,1.8,-.55,1.9,3.2,1.7,'armorBone',0,.35);casing(-1.45,1.85,.34,1.3,2.3,.12,'carbon',0,.25);
   box(-1.45,1.85,.44,.18,1.2,.08,'cyan');box(-1.45,1.85,.44,.9,.18,.08,'cyan');counter(1.05,.65,2.0);screen(1.05,2.30,-1.39,1.6,.9,0);sign(0,3.3,-1.2,3.72);
   seat(.55,-.65);bodyCollider(-1.45,1.8,-.55,1.9,3.2,1.7);
  }else if(p.type==='arcade'){
   base(5.4,3.5);backwall(5.3,3.5,3.4);canopy(5.6,3.9,3.65);sign(2,3.9,-1.42,3.65);
   for(let i=0;i<3;i++){const x=-1.65+i*1.65;casing(x,1.1,-.55,1.2,2.2,1.35,'carbon',0,.2);casing(x,1.65,.17,1.05,.95,.18,c.armor);screen(x,1.72,.34,.75,.62,(i+2)%8);box(x,1.10,.49,1.22,.15,.58,c.armor);cyl(x-.25,1.26,.56,.06,.18,'armorOrange');for(let j=0;j<3;j++)cyl(x+.12+j*.13,1.20,.56,.045,.06,'cyan');bodyCollider(x,1.12,-.4,1.25,2.24,1.7);seat(x,1.25);}
  }else if(p.type==='fabricator'){
   base(5.6,3.5);backwall(5.4,3.4,3.25);canopy(5.8,3.9,3.6);sign(4,3,-1.40,3.0);
   for(const sx of[-1,1]){casing(sx*1.75,.90,-.4,1.5,1.8,1.9,'steel');beam([sx*1.75,1.9,-1.0],[sx*.70,2.75,-.25],.18,'armorOrange');beam([sx*.70,2.75,-.25],[sx*.30,2.1,.40],.15,'armorSilver');cyl(sx*1.75,2.03,-.4,.45,.38,'carbon');bodyCollider(sx*1.75,.9,-.4,1.5,1.8,1.9);}
   counter(0,1.20,4.7,.7);for(let i=0;i<4;i++)box(-1.4+i*.95,1.72,1.2,.65,.32,.38,i%2?'steel':'armorSilver');
  }else if(p.type==='vendingbay'){
   for(let i=0;i<3;i++)cabinet(-1.15+i*1.15,0,1.0,(i+bias(p))%8);box(0,2.62,0,3.5,.17,1.3,c.edge);
  }else if(p.type==='dronehub'){
   base(3.3,2.8);casing(-.55,.9,0,1.55,1.64,2.3,c.armor);box(-.55,1.80,0,1.8,.16,2.5,'carbon');box(-.55,1.9,0,.8,.05,.07,c.glow);box(-.55,1.9,0,.07,.05,.8,c.glow);
   casing(-.55,2.12,0,.86,.34,.65,'armorSilver');for(const sx of[-1,1])for(const sz of[-1,1]){beam([-.55,2.1,0],[-.55+sx*.58,2.1,sz*.5],.08,'steel');cyl(-.55+sx*.58,2.14,sz*.5,.20,.05,'carbon');}
   cabinet(1.1,.25,.85,1);bodyCollider(-.55,.9,0,1.55,1.8,2.3);
  }else if(p.type==='battery'){
   base(3.1,2.2);casing(0,1.28,-.5,3,2.4,.7,c.armor);for(let i=0;i<3;i++){const x=-1+i;cyl(x,.95,.3,.32,1.56,'armorSilver');cyl(x,1.22,.3,.34,.16,'cyan');cyl(x,1.85,.3,.27,.22,'steel');}screen(0,2.3,-.08,2.4,.5,6);bodyCollider(0,1.2,0,3,2.4,1.8);
  }else if(p.type==='bikebay'){
   base(4,2.5);for(let i=0;i<2;i++){const x=-1.05+i*2.1;box(x,.45,-.85,.14,.74,.45,c.armor);beam([x,.38,-.85],[x,.70,.7],.12,'steel');beam([x,.85,0],[x,1.1,-.70],.12,'armorSilver');box(x,1.04,0,.40,.13,.55,'carbon');box(x,1.20,-.70,.65,.08,.12,'steel');for(const z of[-.85,.9]){casing(x,.42,z,.32,.70,.67,c.armor,0,.24);box(x,.42,z+.36,.22,.30,.06,'cyan');}bodyCollider(x,.65,0,.7,1.3,2.2);}
  }else if(p.type==='recycling'){
   for(let i=0;i<3;i++){const x=-1.05+i*1.05;casing(x,.88,0,.88,1.76,1.18,i===0?c.armor:i===1?'steel':'armorSilver');casing(x,1.38,.62,.63,.32,.08,'carbon',0,.08);box(x,.65,.66,.4,.13,.07,i===0?'cyan':i===1?'amber':'warm');bodyCollider(x,.88,0,.88,1.76,1.18);}
  }else if(p.type==='hydration'){
   base(2,1.5);casing(-.25,1.25,-.15,1.2,2.35,.95,'armorBone',0,.25);box(-.25,1.34,.36,.68,.55,.13,'carbon');box(-.25,1.0,.56,.9,.12,.55,'steel');box(-.25,1.75,.45,.12,.35,.13,'cyan');cyl(.78,.9,-.1,.28,1.64,'armorTeal');screen(-.25,2.2,.40,.65,.36,6);bodyCollider(-.25,1.25,-.15,1.2,2.5,.95);
  }else if(p.type==='streettable'){
   cyl(0,.10,0,.48,.20,'steel');cyl(0,.64,0,.12,1.08,'steel');cyl(0,1.23,0,.85,.10,c.edge);box(0,2.1,0,.09,1.65,.09,'steel');cyl(0,3.0,0,1.5,.16,c.armor);for(const sx of[-1,1])seat(sx*1.35,0);bodyCollider(0,.70,0,1.7,1.4,1.7);
  }else if(p.type==='neonpylon'){
   casing(0,.13,0,1.4,.26,1.4,'steel');box(0,1.9,0,.22,3.54,.22,'steel');screen(0,2.7,0,.96,2.0,bias(p)%8);box(0,1.05,.05,.4,.15,.4,c.glow);bodyCollider(0,1.9,0,.5,3.8,.5);
  }else if(p.type==='toolcart'){
   for(const sx of[-1,1])for(const sz of[-1,1])casing(sx*.98,.18,sz*.55,.24,.36,.30,'carbon',0,.06);
   casing(0,.75,0,2.0,1.14,1.2,c.armor);box(0,1.38,0,2.25,.14,1.4,'steel');for(let i=0;i<3;i++){box(0,.42+i*.27,.64,1.7,.07,.07,c.edge);box(.45+i*.25,1.53,0,.12,.16,.55,'armorSilver');}beam([-1.1,1.05,-.5],[-1.1,1.72,-.5],.08);beam([-1.1,1.72,-.5],[-1.1,1.72,.5],.08);bodyCollider(0,.8,0,2.2,1.6,1.4);
  }else if(p.type==='transit'){
   base(5.1,2.6);canopy(5.2,2.8,3.2);casing(0,1.6,-1.20,4.9,2.9,.15,'carbon');screen(-1.7,1.95,-1.03,1.0,1.4,1);box(.55,.64,-.35,2.8,.18,.62,c.edge);for(const sx of[-1,1])box(.55+sx*.9,.28,-.35,.13,.56,.45,'steel');bodyCollider(.55,.64,-.35,2.8,.25,.62);
  }else if(p.type==='greenhouse'){
   base(5.8,4.1);for(const sx of[-1,1])for(const sz of[-1,1])box(sx*2.65,1.45,sz*1.8,.13,2.74,.13,'armorBone');
   for(const sx of[-1,1]){box(sx*2.65,1.45,0,.10,2.5,3.55,'glass');beam([sx*2.65,2.78,-1.8],[0,3.8,-1.8],.13,c.armor);beam([sx*2.65,2.78,1.8],[0,3.8,1.8],.13,c.armor);for(let i=-1;i<=1;i++)beam([sx*2.65,2.78,i*1.6],[0,3.8,i*1.6],.10,'steel');}
   beam([0,3.8,-1.8],[0,3.8,1.8],.16,c.armor);box(0,1.45,-1.85,5.25,2.5,.08,'glass');for(const sx of[-1,1])planter(sx*1.6,.16,0,1.25,3.1);screen(0,2.65,1.85,2.1,.65,6);bodyCollider(0,1.45,-1.85,5.4,2.6,.14);
  }else if(p.type==='roofcafe'){
   base(6,4.6);for(const sx of[-1,1])for(const sz of[-1,1])box(sx*2.8,1.75,sz*2,.14,3.34,.14,'steel');for(let i=0;i<6;i++)casing(-2.65+i*1.06,3.45,0,.82,.22,4.5,i%2?c.armor:c.edge,0,.06);
   for(const sx of[-1,1]){cyl(sx*1.5,.64,0,.12,.96,'steel');cyl(sx*1.5,1.17,0,.64,.10,'armorBone');for(const sz of[-1,1])seat(sx*1.5,sz*1.2);}
   planter(0,.16,-1.8,1.2,.7);screen(0,2.70,-2,2,.6,1);
  }else if(p.type==='roofworkshop'){
   base(5.4,4.1);backwall(5.1,3.8,3.3);canopy(5.4,4.0,3.55);counter(-.8,.65,3.2,.8);cabinet(1.75,-.7,.95,4);screen(-.7,2.65,-1.7,2.5,.7,4);for(let i=0;i<3;i++)cyl(-1.8+i*.8,1.82,.65,.21,.5,i%2?'armorSilver':c.armor);
  }else if(p.type==='commarray'){
   base(3.3,3.2);casing(0,.62,0,2.8,1.08,2.6,c.armor);box(0,2.15,0,.22,2.1,.22,'steel');for(const sx of[-1,1]){beam([sx*1.15,.9,0],[0,2.6,0],.11,'steel');casing(sx*.9,2.50,0,.55,2,.35,c.edge);box(sx*.9,2.50,.23,.12,1.65,.07,'cyan');}box(0,3.9,0,.13,.8,.13,'steel');cyl(0,4.32,0,.13,.08,'red');bodyCollider(0,.65,0,2.8,1.3,2.6);
  }else if(p.type==='waterbank'){
   base(4.2,2.9);for(const sx of[-1,1]){cyl(sx*1.05,1.60,0,.85,2.88,'armorSilver');cyl(sx*1.05,3.1,0,.88,.12,c.armor);cyl(sx*1.05,3.28,0,.45,.24,'steel');for(const y of[.65,2.4])cyl(sx*1.05,y,0,.89,.12,'steel');box(sx*1.05,1.6,.88,.13,2.4,.12,'copper');bodyCollider(sx*1.05,1.6,0,1.8,3.2,1.8);}beam([-1.05,.4,1.1],[1.05,.4,1.1],.12,'copper');
  }else if(p.type==='roofgym'){
   base(5,3.9);for(const sx of[-1,1])box(sx*2.05,1.55,-1.35,.12,2.94,.12,'steel');box(0,3.05,-1.35,4.2,.14,.14,c.armor);
   for(const sx of[-1,1]){box(sx*1.4,.85,.6,.8,.18,1.85,c.armor);for(const sz of[-1,1])box(sx*1.4,.465,.6+sz*.65,.10,.77,.40,'steel');beam([sx*1.4-.5,1.50,-.25],[sx*1.4+.5,1.50,-.25],.08,'armorSilver');for(const a of[-1,1])cyl(sx*1.4+a*.42,1.55,-.25,.18,.22,'carbon');bodyCollider(sx*1.4,.6,.6,.9,1.2,1.9);}
   screen(0,2.35,-1.25,1.6,.7,0);
  }
 });
}
function bias(p){return (p.district*3+p.id.length)%8;}
