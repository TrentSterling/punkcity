# Punkcity 0.7

HACKERPUNK streets-first city generator. Canonical repository: TrentSterling/punkcity. Viewer: https://tront.xyz/punkcity/ . The separate TrentSterling/punk website is unchanged.

## Street reconstruction

streets.js replaces the old flat street pass with separately owned junctions and links, local/avenue lane profiles, shader-painted crossings and road markings, gutters, inspection covers, rounded curb corners, tiled sidewalks and lowered crossing ramps. The default plan has 49 junctions, 84 links, 120 crossings, 240 ramps, 144 rounded corners and 72 corner fixtures. Traffic displays are static scenery, not a simulation.

Buildings, courts, upper routes and neighborhood placement records are unchanged from 0.6. The default seed HACKERPUNK-02 retains 688 infill assemblies across 34 types. These are static shops, service pockets and rooftop installations, not simulated merchants or pedestrians.

## Viewer

WASD plus right-drag looks/moves; Shift faster; E/Q vertical flight; F walk/fly. C tours street details. K tours infill types, Shift+K goes backward. U toggles infill. I isolates generator layers; Shift+I restores everything. B tours districts, V viewpoints, G greybox, N lighting. Equipment previews remain on 1/2/3. H shows controls.

Serve index.html beneath /punkcity/ or open HACKERPUNK-Citylab-v0.7.html directly in a WebGL 2 browser. Dependencies are vendored; runtime paths remain relative. Do not add a CNAME.

## Sources and verification

streets.js owns road/sidewalk topology, road shaders and curb fixtures. urbanism.js owns building programs and upper routes. scifi.js styles architecture. placement.js and the frontage, street-service, roof-service and neighborhood modules own infill. geometry-batch.js and surface-ownership.js clip redundant coplanar coverage while retaining unaffected instances.

Run node --expose-gc test-streets.mjs for all 240 starter-controller ramp traversals and crossing alignment. Retained test-infill.mjs, test-surfaces.mjs, test-grounding.mjs and test-neighborhoods.mjs cover multi-seed geometry, placement, final-mesh overlap and grounding. node check_locomotion.mjs checks climbing/jumping. python3 build_standalone.py rebuilds the offline HTML. qa-streets.cjs and qa-v07.cjs inspect rendering, isolation, controls and offline startup. tools/smoke-live.cjs verifies deployed source hashes and the public viewer. Read workflow results for actual pass/fail status.

Read RELEASE_07.md for boundaries and changes. Ramp and rounded-curb collision use conservative boxes, not exact curved collision. Coplanar regression thresholds are unchanged; no every-viewpoint or every-GPU guarantee is claimed. No traffic, merchant simulation, interiors, VR/Quest qualification, full 2 km world, multiplayer or new missions is introduced. Browser screenshots are not hardware-performance measurements.
