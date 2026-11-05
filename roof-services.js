import {propKit} from './prop-kit.js';
export function generateRoofServices(api,sci,placements){
 for(const p of placements.filter(p=>p.layer==='rooftops'&&!p.newContent))api.B.scope('rooftops',p.id,()=>{
  const{box,casing,cyl,bodyCollider,planter,palette:c}=propKit(api,sci,p);
  if(p.type==='cooling'){
   box(0,.12,0,3.6,.24,2.6,'steel');for(const sx of[-1,1]){cyl(sx*.85,1.29,0,.64,2.1,c.edge);cyl(sx*.85,1.42,0,.7,.22,c.armor);cyl(sx*.85,2.39,0,.49,.14,'carbon');box(sx*.85,.7,1,.14,1,.14,'copper');}box(0,.35,.65,2,.17,.17,'copper');bodyCollider(0,1.2,0,3.6,2.4,2.6);
  }else if(p.type==='solar'){
   for(const sx of[-1,1]){box(sx*1.4,.4125,0,.14,.825,2.4,'steel');casing(sx*1.1,.95,0,1.9,.25,2.6,c.armor,0,.12);box(sx*1.1,1.105,0,1.65,.06,2.3,'glass');for(let i=0;i<3;i++)box(sx*1.1,1.15,-.7+i*.7,1.5,.03,.025,'armorSilver');}bodyCollider(0,1,0,4.1,.3,2.6);
  }else{planter(-1.15,0,0,1.5,2.9);box(1.15,.60,0,1.45,.18,2.8,c.edge);for(const sz of[-1,1])box(1.15,.255,sz*1,.9,.51,.15,'steel');bodyCollider(0,.35,0,4,.7,3);}
 });
}
