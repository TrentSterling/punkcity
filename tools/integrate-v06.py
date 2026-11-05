"""Apply explicit text edits to the exact 0.5 source snapshot, then verify 0.6 hashes."""
from pathlib import Path
import hashlib, subprocess
ROOT=Path(__file__).resolve().parents[1]
def edit(name, before, after, edits):
 p=ROOT/name; original=p.read_text(); assert hashlib.sha256(p.read_bytes()).hexdigest()==before, 'Unexpected base: '+name
 for start,end,old,new in reversed(edits):
  assert original[start:end]==old, 'Unexpected preimage: '+name
  original=original[:start]+new+original[end:]
 p.write_text(original); assert hashlib.sha256(p.read_bytes()).hexdigest()==after, 'Unexpected result: '+name

# placement.js
edit('placement.js', '60e79c96a4412fcacdd599f7d592242255b1f48a8a9d1ef8d31b07435905a8ce', '628e119efa0843c1d6d4493445ff84c6c5b0a8cb7b310109bfdf8655790b89ef', [(0, 0, '', "import {EXTRA_DIMS,planNeighborhoods} from './neighborhoods.js';\n"), (1208, 1208, '', ',ignore=[]'), (1336, 1336, '', '!ignore.includes(b.kind)&&'), (3170, 3170, '', ',...EXTRA_DIMS'), (3225, 3225, '', 'ra'), (3226, 3226, '', 'W'), (3227, 3228, 'd', 'rawD'), (3242, 3242, '', ",scaleXZ=type==='roofgym'?.70:type==='roofworkshop'?.68:['greenhouse','roofcafe'].includes(type)?.78:1,w=rawW*scaleXZ,d=rawD*scaleXZ"), (3549, 3549, '', 'scaleXZ,newContent:!!EXTRA_DIMS[type],'), (3750, 3750, '', "let customer=null;\n  if(item.newContent&&layer==='frontage'){\n   const offset=d/2+.9;customer={id:item.id+'/customers',x:x+Math.sin(rot)*offset,z:z+Math.cos(rot)*offset,w:side?1.6:2.8,d:side?2.8:1.6,bottom:y+.01,top:y+2.2,kind:'customer-access'};\n   if(registry.conflict(customer,.1,['ground-route','upper-route','roof-route','entrance']))return false;\n  }\n  "), (3788, 3788, '', 'if(customer){registry.reserve(customer);item.customerAccess=customer;}'), (3817, 3817, '', 'i'), (3818, 3820, 'ru', ''), (3821, 3821, '', 'm'), (5399, 5399, '', 'planNeighborhoods(city,compiled,add,placements,registry);\n '), (5522, 5522, '', '.length,newAssemblies:placements.filter(p=>p.newContent).length,uniqueTypes:Object.keys(counts)')])

# prop-kit.js
edit('prop-kit.js', 'df817c5a0676306ffc15554de959d26a30516881bc56fd8a17d2787b15d14879', '825fb6e8f737cd011f4a06b51da2fa8768818a31272d188ffe3349d1a6446bdb', [(276, 276, '', ',scale=p.scaleXZ||1'), (322, 322, '', '('), (331, 331, '', ')*scale'), (341, 341, '', '+('), (351, 351, '', ')*scale'), (433, 433, '', '*scale'), (437, 437, '', '*scale'), (570, 570, '', '*scale'), (574, 574, '', '*scale'), (592, 592, '', '*scale'), (685, 685, '', '*scale'), (689, 689, '', '*scale'), (780, 780, '', '*scale'), (878, 878, '', '*scale'), (959, 959, '', '('), (988, 988, '', ')*scale'), (991, 991, '', '('), (1020, 1020, '', ')*scale'), (1528, 1528, '', '*scale'), (1538, 1538, '', '*scale')])

# frontage.js
edit('frontage.js', '605a7ab9686678074f5b08bd147e753f466b3f3e44251a497a4ebc3a709422c6', '9d40905049d0b28b64e5fb99bc8d605aaedc7e9bb095d394ff8df8e2b503f98b', [(150, 150, '', '&&!p.newContent')])

# street-services.js
edit('street-services.js', 'f27468ccb2c33a57225f995fcefdcf5aab52ae8362b009cbf8f875b54539fe2a', '501e7b39da70365205f2b49748b63902dd28d451348567ed7ec5ff266142cba4', [(156, 156, '', '&&!p.newContent')])

# roof-services.js
edit('roof-services.js', 'e139e03bf42532eaad8b84d5871ad8d1829c5b5aec2aafdd2838423ac54c8644', '55c02d415c7691621fe7695a880f12e63c4f87ca1cb38629282fc830823a2d0e', [(154, 154, '', '&&!p.newContent')])

# districts.js
edit('districts.js', '1db8eda049f79c22818d84a0d6cbbdd627bd5c1448f114601595e9d23af5f751', 'f5a2cd7662f1bab58dc261a7644e194d4971ad7ee32e7c1072097c4f7ad506bb', [(0, 0, '', "import {generateNeighborhoods} from './neighborhoods.js';\n"), (12314, 12314, '', 'generateNeighborhoods(buildApi,kit,infill.placements);')])

# urbanism.js
edit('urbanism.js', '585cc56cd1abdab84470e1ecf62a1cd66ed6e7679a0e52c09ca3c6e03dd9f468', '42d3d1ca0266d6e9eb7827c1198b541d10ff6b3e5bd45a6779847cd79340c3b6', [(482, 483, '5', '6')])

# scifi.js
edit('scifi.js', 'ac47b96354bf139cbb0c6bea7c3af7494e7033d337e822db527eab5b2a961a1c', 'df1773d9753a2bd7866160aa40fc55a29c3ce5bf50cda32fbcfe884015ffb160', [(7952, 7953, '5', '6')])

# citylab.js
edit('citylab.js', 'c07abd6560466dca203916fc8cc6d0654551bfcf7ec1099e65cd823c139acd33', '7106f62ce82feb8cacc99d02f84126724c4446ddde4b60b09efeda178b6f0fdf', [(0, 0, '', "import {PLACE_NAMES} from './neighborhoods.js';\n"), (842, 843, '5', '6'), (14790, 14797, 'entries', 'all'), (14837, 14840, 'lay', 'n'), (14841, 14848, "r==='fr", 'wC'), (14851, 14853, 'ag', ''), (14854, 14855, "'", 'nt'), (14914, 14914, '', "||Number(b.layer==='frontage'"), (14915, 14915, '', "-Number(a.layer==='frontage'));const unique=[...new Map(all.map(p=>[p.type,p])).values()];const entries=[...unique,...all.filter(p=>!unique.includes(p))]"), (15398, 15398, '', '(PLACE_NAMES['), (15404, 15404, '', ']||p.type)'), (22617, 22618, '5', '6'), (25039, 25042, 'sho', 'new '), (25043, 25043, '', 'lace'), (26242, 26242, '', 'new pla'), (26243, 26245, 'lo', 'e'), (26246, 26252, 'e tour', ''), (29696, 29696, '', 'e.shiftKey?infillViewIndex-1:infillViewIndex+1')])

# index.html
edit('index.html', '60c2e8132428fb9accf4397b3778b8170899d387f5d7ba83224ffc71afbf7d2b', '123995090c8daa281e9beb2408b7bb99342938b8febe40b8112d68cb7f8bfddb', [(369, 370, '5', '6'), (1298, 1299, '5', '6'), (1815, 1816, '5', '6')])

# build_standalone.py
edit('build_standalone.py', '6e14fb5a0f46e4e4f2b4d0140a175c09b781835c593e18e10d0e90a5d844fa0b', '65c2666f95456d707502fd5a0a3747549e59eca889f0aebf9858b3d686d04026', [(1219, 1220, '5', '6'), (1740, 1741, '5', '6')])

# test-infill.mjs
edit('test-infill.mjs', '2f24aec4664ba60c0076ae7c1ce1ceb12c29388c4ed73c2717ce8ff710627083', '1310feb0b688e1f1bd8a67cd6e049c17cd91cb668f234631c5ab11777ecae00c', [(2976, 2977, '5', '6'), (3123, 3124, '5', '6'), (3183, 3184, '5', '6')])

# test-surfaces.mjs
edit('test-surfaces.mjs', 'ba2fc6747cb5d2f1108811e3159db8bd4248289cd4192eec9c2d10ec08ecf067', '7c37623de58d9b83d07220dc7aabffdd4536f93002e758b9dcf0c4f6f21770c8', [(1938, 1939, '5', '6'), (1982, 1983, '5', '6')])

# test-grounding.mjs
edit('test-grounding.mjs', '948e500883e1276a8454ba61611a37f15858bf2cb0e3d949b3353cf28ba1529a', '6c660fa60e38598653491a4af5d1481d4fd69a1bba2a7acde208401b5dcf0761', [(789, 790, '5', '6'), (833, 834, '5', '6')])

assert hashlib.sha256((ROOT/'neighborhoods.js').read_bytes()).hexdigest()=='65a5f12797091724353b1836cdd9cc6600b29884a910ca01194784e882cc1c5a','New module mismatch'
subprocess.run(['python3','build_standalone.py'],cwd=ROOT,check=True)
html=ROOT/'HACKERPUNK-Citylab-v0.6.html'
assert hashlib.sha256(html.read_bytes()).hexdigest()=='788d7b3ae0a61335e0a8ab184b29c9ef648dff396e7d6543498bed5245dfed36','Standalone mismatch'
print('Exact packaged 0.6 source and standalone verified')
