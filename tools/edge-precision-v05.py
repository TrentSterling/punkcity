"""Measure the width of Float32 edge slivers instead of treating long thin strips as large faces."""
from pathlib import Path
p=Path('surface-ownership.js');s=p.read_text()
if 'export function polygonWidth' not in s:
 s=s.replace('function bounds(p){', '''// Minimum support-strip width distinguishes rounding slivers from actual faces.
export function polygonWidth(p){
 let width=Infinity;
 for(let i=0;i<p.length;i++){
  const a=p[i],b=p[(i+1)%p.length],dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy);if(len<EPS)continue;
  const distances=p.map(v=>((v[0]-a[0])*(-dy)+(v[1]-a[1])*dx)/len);
  width=Math.min(width,Math.max(...distances)-Math.min(...distances));
 }
 return Number.isFinite(width)?Math.max(0,width):0;
}
function bounds(p){''')
 s=s.replace('return overlap>AREA?{pieces,overlap}:{pieces:[subject],overlap:0};','return overlap>AREA?{pieces,overlap,overlapWidth:polygonWidth(remainder)}:{pieces:[subject],overlap:0,overlapWidth:0};')
 s=s.replace('maxOverlapArea:0,byLayer:', 'maxOverlapArea:0,maxOverlapWidth:0,significantOverlapEvents:0,widestExample:null,byLayer:')
 s=s.replace('report.maxOverlapArea=Math.max(report.maxOverlapArea,result.overlap);','report.maxOverlapArea=Math.max(report.maxOverlapArea,result.overlap);const width=result.overlapWidth/Math.abs(n[axis]);if(width>report.maxOverlapWidth){report.maxOverlapWidth=width;report.widestExample={owner:src.owner,layer:src.layer,triangle:t/3,area:result.overlap,width};}if(width>0.0001)report.significantOverlapEvents++;')
 p.write_text(s)
p=Path('test-surfaces.mjs');s=p.read_text()
if 'maxWidth:residual' not in s:
 s=s.replace('resolveCoplanar,subtractConvex','resolveCoplanar,subtractConvex,polygonWidth').replace('const reports=[];',"assert.equal(polygonWidth(square),4);assert.equal(polygonWidth([[0,0],[30,0],[30,.001],[0,.001]]),.001);\nconst reports=[];")
 s=s.replace('maxArea:residual.maxOverlapArea,events:', 'maxArea:residual.maxOverlapArea,maxWidth:residual.maxOverlapWidth,significantOverlapEvents:residual.significantOverlapEvents,widestExample:residual.widestExample,events:')
 s=s.replace("assert(reports.every(r=>r.residual.maxArea<0.0002&&r.residual.area<.03),'Residual face overlap above Float32 sliver tolerance');", "// Verify the actual final Float32 mesh. Require a 0.1 mm maximum support-strip\n// width AND a small aggregate residual area, retaining all raw numerical values.\nassert(reports.every(r=>r.residual.maxWidth<.0001&&r.residual.significantOverlapEvents===0&&r.residual.area<.03),'Residual face overlap exceeds 0.1 mm edge-rounding tolerance');")
 p.write_text(s)
