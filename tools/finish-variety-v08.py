from pathlib import Path
p=Path(__file__).resolve().parent.parent/'surface-ownership.js'
s=p.read_text()
s=s.replace('const distance=v=>cross(a,b,v)*(inside?1:-1)/length;', 'const distance=v=>{const d=cross(a,b,v)*(inside?1:-1)/length;return Math.abs(d)<=EPS?0:d;};')
s=s.replace('pin=dp>=-EPS;', 'pin=dp>=0;').replace('cin=dc>=-EPS;', 'cin=dc>=0;')
assert 'return Math.abs(d)<=EPS?0:d' in s
p.write_text(s)
print('Metric clipping predicates snap boundary distances before computing segment intersections. Acceptance thresholds are unchanged.')
