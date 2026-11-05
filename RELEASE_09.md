# Punkcity 0.9: facade retrofits and visible service infrastructure

Canonical generator: TrentSterling/punkcity, main, https://tront.xyz/punkcity/. The separate punk marketing website is unchanged.

## Direction

The previous city had a varied skyline but still read as clean detached sci-fi buildings. This pass adds a separate facade-mounted generation layer rather than recoloring the districts, replacing procedural buildings with imported models, or hiding the scene behind bloom.

The default seed HACKERPUNK-02 generates 326 assemblies: 57 covered galleries, 74 projecting capsule bays, 34 cooling spines, 79 double-sided projecting signs, 57 wall displays, and 25 cross-court cable bundles. Counts are a fixture result, not the acceptance target for visual quality. Existing block, building, street, upper-route and neighborhood-infill plans are retained.

## Pipeline

retrofit.js plans deterministic facade sockets before emitting geometry. Canonical coordinates are +Z outward from the wall, +X along it and +Y up. Modules use wall contact points, brackets and supported platforms. Galleries and capsule bays add actual silhouette depth; signs and small technical parts remain mostly decorative. There are no enterable capsule interiors or new tenant/NPC simulation.

The placement registry considers existing generated geometry, infill, customer approaches, stair footprints and public upper-route headroom. Only the supporting host's structural shell is a mounting exception. Finite candidate retries move or reject an attachment; they do not move an approved street or remove a route to make the attachment fit. Lower assemblies reserve at least 4.8 m of pedestrian clearance. Existing geometry-ownership repair and final Float32 overlap acceptance limits are unchanged.

Sixteen original graphic signs share one canvas atlas and one display material. No external font or image assets are required. JSON export includes a schema-labelled fixed-stride placement stream for the new layer. This does not turn the entire city into one material or implement a new occlusion system.

## Inspection

X tours one example of each facade-assembly type, followed by remaining placements; Shift+X goes backward. Z toggles the new layer for a same-camera comparison. I can isolate retrofit independently and Shift+I restores all layers. These inspection controls switch to fly mode and do not regenerate colliders. The existing M building, C street, K neighborhood and B district tours remain.

## Verification

The review includes nine seed/height socket fixtures, deterministic placement output, actual generated vertex envelopes, prior geometry reservations, the existing fifteen seed/height city checks, all public stairs and crossing ramps, grounding and final-mesh overlap scans. qa-retrofit.cjs captures daylight/night, same-camera additions on/off, five assembly types, greybox and layer controls. qa-v09.cjs retains the full viewer/offline regression from 0.8. The main workflow additionally checks deployed module hashes and renders the public Pages viewer. Consult the workflow/artifacts for measured results, not this description alone.

## References and boundaries

THREEJSPUNK-STUDY.md records the supplied Threejs-Punk article and public demo, FI BuildingKit's Python-generated geometry, a small procedural Three.js building generator, a Unity shape-grammar project, and Cellscape. These are references, not copied code or imported art. The public Threejs-Punk repository loads an authored GLB; the article separately describes its larger procedural map/placement pipeline.

Still not implemented: the full 2 km city, non-grid road planning, new interiors, merchants, traffic, VR qualification, palette-uber-material conversion, meshoptimizer LODs, camera-following light maps, software occlusion, rain or planar reflections. More geometry and generation work are added. No target-device performance improvement or commercial-art parity is claimed.
