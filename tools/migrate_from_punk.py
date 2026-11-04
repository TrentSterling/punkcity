"""Relocate the pinned Citylab build without changing its city or movement code."""
from pathlib import Path
import hashlib
import json
import re
import shutil
import sys

SOURCE_COMMIT = '6420c88506862f1c0e13622e48ec044616de5819'
EXPECTED = {'citylab.js': '9b8d2b7676bc2a3668354e05bd9c5263e0642be3', 'districts.js': '62a15ea0070d1859e1e3a607184c313abd3712be'}
source, root, three = [Path(a).resolve() for a in sys.argv[1:4]]
root.mkdir(parents=True, exist_ok=True)
def blob_sha(path):
    data = path.read_bytes()
    return hashlib.sha1(b'blob ' + str(len(data)).encode() + b'\0' + data).hexdigest()
for name, expected in EXPECTED.items():
    assert blob_sha(source / name) == expected, f'Unexpected source: {name}'
legacy = {'finish-v02.py', 'refine-v01.py', 'refine-v02.py', 'upgrade-v02.py', 'qa.cjs', 'offline-qa.cjs', 'HACKERPUNK-Citylab-v0.1.html'}
mapping = []
for src in sorted(source.iterdir()):
    if not src.is_file():
        continue
    dest = root / ('archive/legacy-tools/' + src.name if src.name in legacy else src.name)
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(src, dest)
    mapping.append({'source': 'citylab/' + src.name, 'destination': str(dest.relative_to(root)), 'source_blob_sha': blob_sha(src)})
assert not (root / 'CNAME').exists(), 'Unexpected custom domain file in target'
p = root / 'index.html'
s = p.read_text()
s = s.replace('https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js', './vendor/build/three.module.js')
s = s.replace('https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/', './vendor/addons/')
s = s.replace('This hosted version needs access to cdn.jsdelivr.net. The downloadable build includes its dependencies.', 'The renderer is included locally. Check that WebGL 2 and hardware acceleration are enabled.')
s = s.replace('<title>HACKERPUNK / Citylab 0.2</title>', '<title>Punkcity / HACKERPUNK Citylab 0.2</title>')
s = s.replace('<meta name="description"', '<link rel="canonical" href="https://tront.xyz/punkcity/"><meta name="description"', 1)
p.write_text(s)
visited = set()
pattern = re.compile(r'(?:\bfrom\s*|\bimport\s*\(\s*)[\'\"]([^\'\"]+)[\'\"]')
def collect(path):
    path = path.resolve()
    if path in visited:
        return
    visited.add(path)
    text = path.read_text()
    for spec in pattern.findall(text):
        dep = None
        if spec == 'three':
            dep = three / 'build/three.module.js'
        elif spec.startswith('three/addons/'):
            dep = three / 'examples/jsm' / spec[len('three/addons/'):]
        elif spec.startswith('.'):
            dep = path.parent / spec
        if dep is not None:
            assert dep.is_file(), f'Missing dependency: {dep}'
            collect(dep)
    if path.is_relative_to(three):
        rel = str(path.relative_to(three)).replace('examples/jsm/', 'addons/')
        dest = root / 'vendor' / rel
        dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(path, dest)
collect(root / 'citylab.js')
shutil.copyfile(three / 'LICENSE', root / 'vendor/THREE-LICENSE')
p = root / 'qa-v02.cjs'
s = p.read_text().replace('citylab/qa-v02', 'qa-v02').replace('citylab/vendor/', 'vendor/').replace('citylab/HACKERPUNK-Citylab-v0.2.html', 'HACKERPUNK-Citylab-v0.2.html')
s = s.replace("await page.goto('http://127.0.0.1:8080/citylab/?capture=1'", "await page.goto((process.env.CITYLAB_BASE || 'http://127.0.0.1:8080/punkcity/')+'?capture=1'")
p.write_text(s)
p = root / 'README.md'
s = p.read_text().replace('# HACKERPUNK Citylab 0.2', '# Punkcity\n\nHACKERPUNK Citylab 0.2').replace('https://punk.tront.xyz/citylab/', 'https://tront.xyz/punkcity/')
s += '\n## Repository and deployment\n\nCanonical repository: https://github.com/TrentSterling/punkcity (main). GitHub Pages serves main at the repository root under /punkcity/. This is separate from the HACKERPUNK marketing website in TrentSterling/punk. All runtime assets are relative and vendored. Do not add a CNAME or root-absolute asset URLs.\n\nFor a local preview, serve the parent directory of this repository and open /punkcity/. The standalone HTML opens directly from disk. Run `node test-districts.mjs`, `node check_locomotion.mjs`, and `python3 build_standalone.py` from the root. `qa-v02.cjs` uses Playwright and accepts CITYLAB_BASE for the served URL. Historical one-time patches are preserved under archive/legacy-tools and must not be run against current source.\n'
p.write_text(s)
(root / '.nojekyll').touch()
(root / '.gitignore').write_text('node_modules/\n_source/\nqa-v02/\n__pycache__/\n*.pyc\n')
(root / 'CONTRIBUTING.md').write_text('# Project boundaries\n\nWork in TrentSterling/punkcity, branch main. Production URL: https://tront.xyz/punkcity/. Use relative runtime asset paths. Do not deploy generator changes to TrentSterling/punk or alter its marketing site.\n\nKeep commits descriptive and free of attribution trailers. Do not add Co-Authored-By lines. Keep the source generator and standalone HTML synchronized by running build_standalone.py after source changes.\n')
(root / 'MIGRATION.json').write_text(json.dumps({'source_repository': 'TrentSterling/punk', 'source_commit': SOURCE_COMMIT, 'destination_repository': 'TrentSterling/punkcity', 'site': 'https://tront.xyz/punkcity/', 'generator_blob_sha': EXPECTED, 'files': mapping, 'notes': 'Core city and movement sources copied byte-for-byte. Hosting, test paths, README and vendoring changed only.'}, indent=2) + '\n')
for name, expected in EXPECTED.items():
    assert blob_sha(root / name) == expected, f'Generator changed: {name}'
assert 'https://cdn.jsdelivr.net' not in (root / 'index.html').read_text()
print(json.dumps({'source_commit': SOURCE_COMMIT, 'files_migrated': len(mapping), 'vendored_modules': sum(p.is_relative_to(three) for p in visited), 'core_unchanged': True}, indent=2))
