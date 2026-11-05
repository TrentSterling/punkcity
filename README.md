# Punkcity 0.8

HACKERPUNK streets-first sci-fi city generator. Canonical repository: TrentSterling/punkcity. Viewer: https://tront.xyz/punkcity/ . The separate TrentSterling/punk website is unchanged.

## Building identities instead of district uniforms

Eight massing families and twelve curated palettes are selected per building, with nearby-repeat penalties. Setbacks, unequal twin towers, blades, courtyards, shoulders, stepped terraces, lantern crowns and offset cores produce different silhouettes. Window arrangements, trim direction and roof profiles vary independently. Districts retain their functional uses without imposing a single architectural color. The default scene contains 49 tower sites and 734 infill assemblies.

The road skeleton, 36 blocks, sixteen upper links, sixteen connected upper squares and six starter stairs remain. Frontage widths, depths and heights are revised inside existing envelopes; infill is regenerated against the updated structures. Small props are static environmental content, not merchant or traffic simulation.

## Viewer

WASD plus right-drag to move/look. Shift faster, E/Q vertical flight, F walk/fly. M tours architectural families, Shift+M reverses. G greybox. C street inspection, B district tour, V viewpoints, K neighborhood tour, Shift+K previous. U toggles infill; I isolates generator layers, Shift+I restores all. N cycles lighting. 1/2/3 equipment previews. J exports layout, building identities, infill and collision; H shows controls.

Run index.html using a local HTTP server, or open HACKERPUNK-Citylab-v0.8.html directly in a WebGL 2 browser. Runtime asset paths are relative beneath /punkcity/. Do not add a CNAME.

## Source map

architecture.js: deterministic palettes, identities, segmented massing recipes and variety audits.
massing.js: architectural geometry compiler.
urbanism.js: building hosts, streetside programs, public courts and upper routes.
scifi.js: hard-surface details, panel/glass shader and shared advertising atlas.
streets.js: independently owned road ribbons, junctions, rounded curbs and crossing ramps.
placement.js and neighborhoods.js: clearance-tested small buildings and activity pockets.
geometry-batch.js and surface-ownership.js: semantic layers, batching and coplanar coverage repair.
citylab.js: viewer, desktop locomotion, GPU-texture HUD and inspection controls.

Read RELEASE_08.md for the source-reference study and implementation boundaries. CityWorks, Metroforge, Slop New York and Greggman's city code were inspected for planning and geometry lessons; private Metroforge source is not published here.

## Verification

Run test-variety.mjs, test-infill.mjs, test-streets.mjs, test-neighborhoods.mjs, test-grounding.mjs and test-surfaces.mjs with node --expose-gc; run check_locomotion.mjs with node. python3 build_standalone.py rebuilds the offline viewer. qa-variety.cjs and qa-v08.cjs render the city, inspect architectural families, check isolation and controls, and test offline startup. tools/smoke-live.cjs compares sixteen deployed modules against the commit and checks the public viewer. Workflow results, not this README, establish pass/fail.

The rendered scene still uses a constrained family grammar and an orthogonal street layout; repetitive block planning and distant context remain future work. Small-detail collision is simplified, and no VR/Quest performance, full 2 km world, NPCs, traffic, interiors or missions are claimed. Screenshot rendering is not a target-hardware benchmark.
