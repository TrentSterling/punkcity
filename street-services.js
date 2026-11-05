import {generateNeighborhoodProp} from './neighborhood-props.js';
import {propKit} from './prop-kit.js';
export function generateStreetServices(api,sci,placements){
 for(const p of placements.filter(p=>p.layer==='services'))api.B.scope('services',p.id,()=>{
  if(generateNeighborhoodProp(api,sci,p))return;
  const{box,casing,cyl,screen,bodyCollider,planter,palette:c}=propKit(api,sci,p);
  if(p.type==='lockers'){
   casing(0,1.225,-.16,3.35,2.45,1.05,c.armor,0,.22);
   for(let x=0;x<4;x++)for(let y=0;y<3;y++){casing(-1.16+x*.78,.53+y*.68,.46,.66,.55,.13,y===1?'steel':c.edge,0,.06);box(-.96+x*.78,.53+y*.68,.56,.08,.16,.06,c.glow);}
   bodyCollider(0,1.225,-.16,3.35,2.45,1.05);
  }else if(p.type==='cargo'){
   for(let i=0;i<2;i++){const x=-1.1+i*2.1;box(x,.12,0,1.8,.24,2.4,'sand');for(let y=0;y<(i===0?2:1);y++){casing(x,.69+y*.90,0,1.65,.90,2.1,i===0?c.armor:'armorSilver',0,.16);box(x,.69+y*.90,1.08,1.1,.12,.12,'carbon');}}
   bodyCollider(-1.1,1.1,0,1.8,2.15,2.4);bodyCollider(1,.65,0,1.8,1.25,2.4);
  }else if(p.type==='utility'){
   box(-.6,.0125,0,2.35,.025,1.3,'carbon');casing(-.6,1.3,0,2.65,2.55,1.55,c.armor,0,.2);screen(-.7,1.78,.87,1.65,.66,6);for(let i=0;i<5;i++)box(-.6,.4+i*.2,.84,1.95,.07,.12,'carbon');
   cyl(1.5,.05,0,.56,.1,'steel');cyl(1.5,1.2,0,.5,2.2,'armorSilver');cyl(1.5,2.37,0,.56,.14,c.glow);box(.7,.55,0,.9,.18,.2,'copper');
   bodyCollider(-.6,1.3,0,2.65,2.55,1.55);bodyCollider(1.5,1.2,0,1,2.2,1);
  }else if(p.type==='seating'){
   for(const sz of[-1,1]){box(0,.70,sz*1,3.8,.19,.7,c.edge);for(const sx of[-1,1])box(sx*1.4,.3025,sz*1,.13,.605,.45,'steel');box(0,1.045,sz*1.28,3.8,.50,.12,c.armor);bodyCollider(0,.7,sz*1,3.8,.3,.7);}
   box(0,1.12,0,2.3,.12,.7,'steel');box(0,.53,0,.3,1.06,.4,'carbon');
   for(const sx of[-1,1])box(sx*2.3,1.65,-1.35,.1,3.3,.1,'steel');for(let i=0;i<5;i++)box(-1.92+i*.96,3.35,-.15,.84,.13,3.15,i%2?c.edge:c.armor);
  }else{planter(0,0,0,3.8,2.6);bodyCollider(0,.25,0,3.8,.5,2.6);}
 });
}
