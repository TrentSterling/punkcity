from pathlib import Path
p=Path('neighborhood-props.js');s=p.read_text()
old="const letters=(text,x,y,z,w,h)=>{const a=point(x,y,z);api.sign(text,a.x,a.y,a.z,w,h,p.rot,'#e4cda1');};"
assert old in s and 'drawShopLabel' not in s
s="import {drawShopLabel} from './shop-labels.js';\n"+s
s=s.replace(old,'const letters=(text,x,y,z,w,h)=>drawShopLabel(api,p,text,point(x,y,z),w,h);')
p.write_text(s)
print('Batched shop labels and preserved assembly isolation')
p=Path('citylab.js');s=p.read_text()
old=" camera.position.set(p.x+c*4.7+s*9,p.y+4.7,p.z-s*4.7+c*9);camera.lookAt(p.x,p.y+1.7,p.z);yaw=camera.rotation.y;pitch=camera.rotation.x;"
assert old in s
s=s.replace(old,""" const local=(x,y,z)=>v3(p.x+c*x+s*z,p.y+y,p.z-s*x+c*z);
 const target=local(0,1.65,p.localD*.30),front=p.localD/2;
 const choices=[[3.5,4.5,front+6],[-3.5,4.5,front+6],[0,3.3,front+5],[2.2,3.4,front+4],[-2.2,3.4,front+4],[0,6.2,front+7],[4,7.2,front+8],[-4,7.2,front+8],[0,8.5,front+10]];
 scene.updateMatrixWorld(true);const visible=drawObjects.filter(o=>o.visible);let eye=null;
 for(const a of choices){const candidate=local(...a);if(collision.some(box=>box.containsPoint(candidate)))continue;const delta=target.clone().sub(candidate),distance=delta.length();const ray=new THREE.Raycaster(candidate,delta.normalize(),.15,Math.max(.2,distance-1.2));if(!ray.intersectObjects(visible,false).length){eye=candidate;break;}}
 camera.position.copy(eye||local(0,Math.max(8,p.top-p.y+2),front+10));camera.lookAt(target);yaw=camera.rotation.y;pitch=camera.rotation.x;""")
import re
s=re.sub(r"\{name:'[^']*[Oo]verview[^']*',p:\[[^\]]+\],look:\[[^\]]+\]\}","{name:'District overview',p:[318,255,370],look:[0,25,0]}",s)
p.write_text(s)
print('Tour cameras reject blocked views; overview moved above context roofs')
