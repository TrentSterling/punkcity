/** Original renderer-neutral building identities and envelope-contained massing.
 * Districts describe use, not a single color or silhouette. Routes stay reserved.
 */
export const ARCHITECTURE_REVISION='0.8.0';
export function hash(s){let h=2166136261;for(const c of String(s)){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;}
export function random(s){let a=hash(s);return()=>{a+=0x6d2b79f5;let t=Math.imul(a^a>>>15,1|a);t^=t+Math.imul(t^t>>>7,61|t);return((t^t>>>14)>>>0)/4294967296;};}
const q=n=>Math.round(n*1000)/1000;
export const BUILDING_PALETTES=[
 {id:'chalk-copper',hull:'ivory',armor:'armorCopper',edge:'steel',glow:'amber',facade:'facIvory',roof:'dark'},
 {id:'graphite-bone',hull:'carbon',armor:'armorBone',edge:'steel',glow:'cyan',facade:'facDark',roof:'steel'},
 {id:'ceramic-sage',hull:'ivory',armor:'armorSage',edge:'armorBone',glow:'warm',facade:'facIvory',roof:'panel'},
 {id:'oxide-charcoal',hull:'oxide',armor:'armorBrick',edge:'steel',glow:'amber',facade:'facRust',roof:'dark'},
 {id:'slate-nickel',hull:'dark',armor:'armorSlate',edge:'armorSilver',glow:'cyan',facade:'facBlue',roof:'steel'},
 {id:'sand-umber',hull:'sand',armor:'armorTaupe',edge:'carbon',glow:'warm',facade:'facSand',roof:'steel'},
 {id:'bronze-glass',hull:'carbon',armor:'armorGold',edge:'steel',glow:'amber',facade:'facGlass',roof:'dark'},
 {id:'patina-concrete',hull:'concrete',armor:'armorTeal',edge:'steel',glow:'cyan',facade:'facIvory',roof:'panel'},
 {id:'bone-ink',hull:'light',armor:'armorGraphite',edge:'armorBone',glow:'warm',facade:'facIvory',roof:'dark'},
 {id:'blue-ceramic',hull:'panel',armor:'armorIce',edge:'steel',glow:'cyan',facade:'facBlue',roof:'steel'},
 {id:'mauve-steel',hull:'dark',armor:'armorPlum',edge:'steel',glow:'pink',facade:'facMarket',roof:'dark'},
 {id:'concrete-orange',hull:'concrete',armor:'armorOrange',edge:'carbon',glow:'amber',facade:'facIvory',roof:'steel'}
];
export const MASSING_FAMILIES=['setback','blade','split','shouldered','cascade','courtyard','lantern','offset'];
export function paletteFor(obj,block){return BUILDING_PALETTES[obj?.design?.palette??hash(obj?.seed||obj?.id||block?.id||'city')%BUILDING_PALETTES.length];}
function choice(r,options,score){return options.map(value=>({value,score:score(value)+r()*.8})).sort((a,b)=>a.score-b.score||String(a.value).localeCompare(String(b.value)))[0].value;}
export function configureArchitecture(city){
 const prior=[],towerPrior=[],districtCounts=city.districts.map(()=>({}));
 for(const b of city.blocks){
  const members=[...b.masses,...b.towers];
  for(const m of members){
   const r=random(city.seed+':architecture:'+m.id),close=prior.filter(a=>Math.hypot(a.x-m.x,a.z-m.z)<85);
   const palette=choice(r,BUILDING_PALETTES.map((_,i)=>i),i=>close.reduce((s,a)=>s+(a.palette===i?1.4/(1+Math.hypot(a.x-m.x,a.z-m.z)/30):0),0));
   const design={id:m.id,palette,paletteName:BUILDING_PALETTES[palette].id,seed:hash(city.seed+':'+m.id),facade:Math.floor(r()*5),roof:Math.floor(r()*5),rhythm:6.4+r()*5,band:Math.floor(r()*3),age:Math.floor(r()*3)};
   m.design=design;prior.push({x:m.x,z:m.z,palette});
   if(m.role.startsWith('south')){
    // Change lot proportions inward. Keep frontage on its original street line.
    const south=m.z+m.d/2,sign=m.x<b.x?-1:1,outer=m.x+sign*m.w/2;
    m.w=q(m.w*(.79+r()*.20));m.d=q(m.d*(.78+r()*.21));m.x=q(outer-sign*m.w/2);m.z=q(south-m.d/2);
    m.top=q(6+Math.floor(r()*5)*3.4);if(b.district===0)m.top=Math.min(m.top,12.8);
   }
   if(m.role.startsWith('north')&&!b.deck&&b.district!==0)m.top=q(8+Math.floor(r()*4)*3.4);
   if(!('base' in m))m.mat=BUILDING_PALETTES[palette].facade;
  }
  for(const t of b.towers){
   const r=random(city.seed+':silhouette:'+t.id),host=b.masses.find(m=>m.id===t.host),h0=t.top-t.base;
   t.base=host.top;
   const wx=.84+r()*.15,dz=.83+r()*.16;t.w=q(t.w*wx);t.d=q(t.d*dz);
   // Independent heights with a gentle civic skyline peak, not one height per district.
   const prominence=Math.exp(-((t.x-25)**2+(t.z+55)**2)/16000),height=h0*(.70+r()*.62)*(1+.17*prominence);
   t.top=q(t.base+Math.max(13,Math.round(height/3.5)*3.5));
   const eligible=MASSING_FAMILIES.filter(f=>!['split','courtyard','shouldered'].includes(f)||t.w>=11);
   const neighbors=towerPrior.filter(a=>Math.hypot(a.x-t.x,a.z-t.z)<110),counts=districtCounts[b.district];
   const family=choice(r,eligible,f=>(counts[f]||0)*.6+neighbors.reduce((s,a)=>s+(a.family===f?1.4:0),0));
   counts[family]=(counts[family]||0)+1;t.design.family=family;t.design.direction=r()<.5?-1:1;t.design.crown=Math.floor(r()*5);
   t.mat=paletteFor(t,b).facade;towerPrior.push({x:t.x,z:t.z,family});
   t.design.segments=massingSegments(t);
  }
 }
 city.architecture={revision:ARCHITECTURE_REVISION,palettes:BUILDING_PALETTES.map(p=>p.id),families:MASSING_FAMILIES,districtMix:districtCounts};return city;
}
/** Pieces use non-overlapping rectangles at any one elevation; all stay in t's envelope. */
export function massingSegments(t){
 const out=[],{w,d,x,z,base}=t,H=t.top-base,s=t.design.direction||1;
 const add=(id,cx,cz,ww,dd,y,h,primary=true)=>{if(ww*w<1||dd*d<1||h*H<.1)throw Error('Degenerate mass '+t.id);out.push({id:t.id+'/'+id,x:q(x+cx*w),z:q(z+cz*d),w:q(ww*w),d:q(dd*d),base:q(base+y*H),h:q(h*H),primary});};
 switch(t.design.family){
 case 'setback':
  add('base',0,0,.98,.98,0,.43);add('mid',-s*.08,-.06,.77,.78,.43,.32);add('top',-s*.13,-.10,.57,.58,.75,.25);break;
 case 'blade':
  add('blade',-s*.29,0,.38,.92,0,1);add('shoulder',s*.18,.10,.52,.72,0,.48);add('cap',s*.18,.07,.40,.56,.48,.10);break;
 case 'split':
  add('plinth',0,0,.98,.98,0,.18);add('west',-.29,0,.38,.89,.18,.82);add('east',.29,-.06,.38,.75,.18,.60);add('link',0,-.05,.20,.25,.64,.09,false);break;
 case 'shouldered':
  add('shaft',0,-.06,.40,.84,0,1);add('left',-.35,.03,.30,.90,0,.42);add('right',.35,.09,.30,.72,0,.65);break;
 case 'cascade':
  for(let i=0;i<4;i++){const k=1-i*.19;add('terrace'+i,-s*i*.023,-i*.092,.98-i*.10,k*.98,i*.25,.25);}break;
 case 'courtyard':
  add('back',0,-.31,.98,.36,0,.70);add('west',-.33,.18,.32,.62,0,1);add('east',.33,.18,.32,.62,0,.48);break;
 case 'lantern':
  add('stem',0,0,.94,.92,0,.65);add('neck',0,0,.67,.65,.65,.16);add('lantern',0,0,.88,.82,.81,.19);break;
 case 'offset':
  add('core',-s*.35,-.03,.25,.91,0,1);add('low',s*.09,.06,.62,.79,0,.40);add('middle',s*.14,-.04,.60,.91,.40,.32);add('high',s*.03,-.11,.59,.75,.72,.28);break;
 default:throw Error('Unknown massing family '+t.design.family);
 }
 return out;
}
export function auditArchitecture(city){
 const errors=[],towers=city.blocks.flatMap(b=>b.towers),counts={},paletteCounts={},perDistrict=[];
 for(const b of city.blocks){const fs=new Set(),ps=new Set();for(const m of [...b.masses,...b.towers])ps.add(m.design.palette);for(const t of b.towers){fs.add(t.design.family);counts[t.design.family]=(counts[t.design.family]||0)+1;paletteCounts[t.design.paletteName]=(paletteCounts[t.design.paletteName]||0)+1;
  const host=b.masses.find(m=>m.id===t.host);if(t.base<host.top-.001)errors.push(t.id+' below host roof');
  for(const p of t.design.segments){if(Math.abs(p.x-t.x)+p.w/2>t.w/2+.002||Math.abs(p.z-t.z)+p.d/2>t.d/2+.002||p.base<t.base-.002||p.base+p.h>t.top+.003)errors.push(p.id+' escapes envelope');}
 }perDistrict.push({block:b.id,palettes:ps.size,families:fs.size});}
 for(const d of city.districts){const bs=city.blocks.filter(b=>d.blocks.includes(b.id)),fs=new Set(bs.flatMap(b=>b.towers.map(t=>t.design.family))),ps=new Set(bs.flatMap(b=>b.masses.map(t=>t.design.palette)));if(fs.size&&fs.size<4)errors.push('Insufficient family variation in '+d.id);if(ps.size<5)errors.push('Insufficient palette mix in '+d.id);}
 return {ok:!errors.length,errors,towers:towers.length,families:counts,palettes:paletteCounts,blockMix:perDistrict};
}
