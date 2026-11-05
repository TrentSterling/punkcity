# Punkcity 0.7: streets as infrastructure

Canonical repository: TrentSterling/punkcity. The generator remains at https://tront.xyz/punkcity/ and the separate punk marketing site is unchanged.

## Street reconstruction

The old streetGrid function is replaced by streets.js, an independently inspectable street compiler and material set. The existing 7-by-7 street skeleton, 36 blocks, architectural geometry and neighborhood random streams are retained. Default-seed plan, compiled-building and infill-placement JSON hashes match the 0.6 snapshot exactly; all 688 default infill placements are preserved.

Roads are now 84 link ribbons terminating at 49 separately owned junction plates. Local roads have two lanes; wider avenues have four. Lane edges, center lines, dashed dividers, directional arrows, stop lines, white pedestrian crossings, asphalt variation, tyre wear, gutter grates and inspection covers are generated in the owning surface material, not stacked paint meshes. They are fictional game-road profiles, not a traffic-engineering or regulatory-compliance claim.

Sidewalks have 144 rounded corners, segmented raised curbs, tiled paving and 240 lowered crossing ramps with tactile-looking panels. The 120 crossings each align with two ramp endpoints. Corner asphalt wedges, curb faces, sloped ramp tops and sidewalk tops are disjoint geometry. Street edges are derived directly from the same unrounded skeleton coordinates; independently rounded parcel bounds are not reused for joining surfaces.

Seventy-two corner fixtures combine lighting, selected traffic displays and shared-atlas street-name signs. These are static environmental fixtures, not a traffic simulation. Curved curb collision uses conservative small box slices and ramp collision uses short steps; neither claims exact curved collision.

## Inspection

C cycles three street inspection cameras: civic junction, local street and junction detail. Existing B district tour, V viewpoints, K neighborhood tour, G greybox and I/Shift+I generator isolation remain. I can isolate the streets without rebuilding the city. U still toggles neighborhood infill.

## Regression coverage

- test-streets.mjs verifies 84 links, 49 junctions, 120 crossings, 240 paired ramp endpoints, complete projected ground coverage, preserved default infill count, and starter-controller walking up every crossing ramp without jumping or climbing.
- Existing test-infill.mjs checks five seeds at three height multipliers, reserved clearances, deterministic compiled output and all six upper-street stair routes.
- Existing test-surfaces.mjs reconstructs the final Float32 meshes and scans three seeds. Its 0.1 mm maximum overlap-width and 0.03 square metre aggregate residual-area thresholds are unchanged. Local post-fix results remained below 0.016 mm maximum residual width.
- qa-streets.cjs captures ground-level junctions, local roads, matching avenue and detail views, night, isolated streets and neighboring camera positions; qa-v07.cjs retains neighborhood, equipment, isolation and offline-viewer regression checks.
- The main verification workflow checks the deployed source, including streets.js, against its checkout before rendering the public viewer.

This is a street-art and surface-ownership pass, not a new road-layout algorithm, a larger world, driving simulation, VR qualification or proof that all possible seeds and GPUs are artifact-free. The owned-ground area check is supplemented by the existing triangle overlap scan; area equality alone does not prove correct coverage.
