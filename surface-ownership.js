/** Exposed planar-face ownership. Geometry repair, not depth bias.
 * Higher-priority details own their overlap; lower faces are clipped away.
 * Opposite-facing contact surfaces and line/point contacts are not conflicts.
 * Coplanarity tolerance is 0.25 mm; it does not excuse intersecting volumes.
 */
const EPS = 1e-7, AREA = 1e-7, PLANE_EPS = 0.00025, TILE = 8;
const RANK = {streets:0,context:1,buildings:10,traversal:20,armor:30,rooftops:40,services:40,frontage:40,signage:50};
const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
const area=p=>Math.abs(p.reduce((s,a,i)=>{const b=p[(i+1)%p.length];return s+a[0]*b[1]-a[1]*b[0];},0))*.5;
function bounds(p){return [Math.min(...p.map(v=>v[0])),Math.min(...p.map(v=>v[1])),Math.max(...p.map(v=>v[0])),Math.max(...p.map(v=>v[1]))];}
const intersects=(a,b)=>Math.min(a[2],b[2])-Math.max(a[0],b[0])>EPS&&Math.min(a[3],b[3])-Math.max(a[1],b[1])>EPS;
function clean(p){return p.filter((v,i)=>{const b=p[(i+p.length-1)%p.length];return Math.hypot(v[0]-b[0],v[1]-b[1])>EPS;});}
function half(p,a,b,inside){
 const out=[];let prev=p[p.length-1],dp=cross(a,b,prev)*(inside?1:-1),pin=dp>=-EPS;
 for(const cur of p){const dc=cross(a,b,cur)*(inside?1:-1),cin=dc>=-EPS;if(cin!==pin){const t=dp/(dp-dc);out.push(prev.map((n,j)=>n+(cur[j]-n)*t));}if(cin)out.push(cur);prev=cur;dp=dc;pin=cin;}
 return clean(out);
}
/** Subtract a CCW convex clip polygon, preserving interpolated vertex payload. */
export function subtractConvex(subject,clip){
 let remainder=subject;const pieces=[];
 for(let i=0;i<clip.length;i++){
  if(remainder.length<3)break;const a=clip[i],b=clip[(i+1)%clip.length],outside=half(remainder,a,b,false);
  if(outside.length>=3&&area(outside)>AREA)pieces.push(outside);
  remainder=half(remainder,a,b,true);
 }
 const overlap=remainder.length>=3?area(remainder):0;
 return overlap>AREA?{pieces,overlap}:{pieces:[subject],overlap:0};
}
class PlaneIndex{
 constructor(){this.groups=new Map();}
 plane(normal,d){
  const key=normal.map(n=>Math.round(n*10000)).join(','),bin=Math.round(d/.002),base=key+':';
  for(let k=bin-1;k<=bin+1;k++)for(const g of this.groups.get(base+k)||[])if(Math.abs(g.d-d)<=PLANE_EPS&&normal.reduce((a,n,i)=>a+(n-g.normal[i])**2,0)<1e-12)return g;
  const id=base+bin,g={d,normal,grid:new Map(),large:[],faces:[]};if(!this.groups.has(id))this.groups.set(id,[]);this.groups.get(id).push(g);return g;
 }
 cells(b){const x0=Math.floor(b[0]/TILE),x1=Math.floor(b[2]/TILE),y0=Math.floor(b[1]/TILE),y1=Math.floor(b[3]/TILE);if((x1-x0+1)*(y1-y0+1)>256)return null;const out=[];for(let x=x0;x<=x1;x++)for(let y=y0;y<=y1;y++)out.push(x+','+y);return out;}
 query(g,b){const cells=this.cells(b);if(!cells)return g.faces.filter(f=>intersects(f.bounds,b));const ids=new Set(g.large);for(const c of cells)for(const f of g.grid.get(c)||[])ids.add(f);return [...ids].filter(f=>intersects(f.bounds,b));}
 add(g,p,owner){const f={poly:p.map(v=>[v[0],v[1]]),bounds:bounds(p),owner},cells=this.cells(f.bounds);g.faces.push(f);if(!cells)g.large.push(f);else for(const c of cells){if(!g.grid.has(c))g.grid.set(c,[]);g.grid.get(c).push(f);}}
}
/** Sources contain world-space non-indexed Float32 geometry and provenance. */
export function resolveCoplanar(sources){
 const index=new PlaneIndex(),report={toleranceMetres:PLANE_EPS,inspectedTriangles:0,clippedTriangles:0,removedArea:0,overlapEvents:0,maxOverlapArea:0,byLayer:{},examples:[]};
 const ordered=[...sources].sort((a,b)=>(RANK[b.layer]??10)-(RANK[a.layer]??10)||b.id-a.id);
 for(const src of ordered){
  const g=src.geometry,pa=g.attributes.position,na=g.attributes.normal,uv=g.attributes.uv,seed=g.attributes.facadeSeed;
  src.patches=new Map();
  for(let t=0;t<pa.count;t+=3){
   report.inspectedTriangles++;
   const p=[0,1,2].map(k=>[pa.getX(t+k),pa.getY(t+k),pa.getZ(t+k)]),u=p[1].map((v,j)=>v-p[0][j]),v=p[2].map((n,j)=>n-p[0][j]);
   let n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]],len=Math.hypot(...n);if(len<AREA)continue;
   n=n.map(a=>a/len);const axis=n.map(Math.abs).indexOf(Math.max(...n.map(Math.abs))),axes=axis===0?[1,2]:axis===1?[2,0]:[0,1],plane=n.reduce((a,b,j)=>a+b*p[0][j],0);
   const group=index.plane(n,plane);
   let poly=p.map((a,k)=>[a[axes[0]],a[axes[1]],...a,na.getX(t+k),na.getY(t+k),na.getZ(t+k),uv?.getX(t+k)||0,uv?.getY(t+k)||0,seed?.getX(t+k)||0]);
   const flipped=cross(poly[0],poly[1],poly[2])<0;if(flipped)poly.reverse();
   const candidates=index.query(group,bounds(poly));let fragments=[poly],removed=0;
   for(const other of candidates){
    const next=[];for(const f of fragments){if(!intersects(bounds(f),other.bounds)){next.push(f);continue;}const result=subtractConvex(f,other.poly);removed+=result.overlap;next.push(...result.pieces);if(result.overlap>AREA){report.overlapEvents++;report.maxOverlapArea=Math.max(report.maxOverlapArea,result.overlap);if(report.examples.length<12)report.examples.push({owner:src.owner,layer:src.layer,triangle:t/3,area:result.overlap});}}
    fragments=next;if(!fragments.length)break;
   }
   if(removed>AREA){src.patches.set(t,{fragments,flipped});report.clippedTriangles++;report.removedArea+=removed/Math.abs(n[axis]);report.byLayer[src.layer]=(report.byLayer[src.layer]||0)+1;}
   for(const f of fragments)index.add(group,f,src.id);
  }
 }
 report.removedArea=Math.round(report.removedArea*1000)/1000;return report;
}
/** Rebuild only affected primitives; untouched instances stay instanced. */
export function patchedArrays(src){
 const g=src.geometry,out={position:[],normal:[],uv:[],facadeSeed:[]};
 for(let i=0;i<g.attributes.position.count;i+=3){
  const patch=src.patches.get(i);
  if(!patch){for(let k=0;k<3;k++){const j=i+k;for(const [name,a]of Object.entries(out)){const attr=g.attributes[name],size=name==='position'||name==='normal'?3:name==='uv'?2:1;for(let c=0;c<size;c++)a.push(attr?attr.array[j*size+c]:0);}}continue;}
  for(let p of patch.fragments){if(patch.flipped)p=[...p].reverse();for(let k=1;k<p.length-1;k++)for(const v of[p[0],p[k],p[k+1]]){out.position.push(...v.slice(2,5));out.normal.push(...v.slice(5,8));out.uv.push(...v.slice(8,10));out.facadeSeed.push(v[10]);}}
 }
 return out;
}
