# Punkcity 0.5: street infill and exposed-surface ownership

Canonical project: TrentSterling/punkcity, main, at https://tront.xyz/punkcity/. The separate TrentSterling/punk marketing site is unchanged.

## Filled spaces

The existing six districts, 36 blocks, sixteen upper connections and six public stairs remain. Independent frontage, street-service and roof-service generators fill reserved pockets. Default seed HACKERPUNK-02 adds 268 assemblies: 12 microshops, 14 vendor stalls, 18 repair booths, 32 locker units, 24 shaded seating groups, 15 cargo groups, 17 utility stations, 22 ground planters, 64 cooling banks, 30 solar assemblies and 20 roof gardens. These are static buildings and props, not simulated merchants or pedestrians.

A spatial reservation registry checks existing generated geometry, entrance approaches, ground cross-routes, upper clearance and stair footprints before accepting candidates. Infill envelopes have a 0.45 m placement margin; regression tests check actual prop geometry against those envelopes. Street and building randomness is independent of the dressing stream. Routes are deliberately left open instead of filling every square metre. Close-up review led to support/plinth corrections for counters, cargo, seating and roof equipment.

## Coplanar cleanup

The old audit only compared registered horizontal ground/deck surfaces. The new geometry compiler records actual world-space triangles with source owner and semantic layer. Same-facing overlapping coplanar regions are assigned one owner. Lower-priority faces are clipped, not nudged above their neighbor; interpolated UVs, normals and facade identity are retained. Unaffected primitives stay instanced. Exact duplicate transforms are also removed.

The scan covers submitted architecture, armor, signs, services and infill. It is not a full solid-model Boolean system: opposite-facing contact surfaces, noncoplanar volume intersections and ordinary shared triangle edges are distinct cases. Coplanar grouping tolerance is 0.25 mm. Tests reconstruct the final Float32 meshes, including instance transforms, and scan again. Raw numerical edge slivers are retained in the reports. Acceptance requires a maximum 0.1 mm overlap-strip width and less than 0.03 square metres total residual area across the scene. The measured default and two additional seeds remained below 0.02 mm maximum residual width.

The default geometry fixture removes 96 duplicate primitives and clips 2,854 input triangles. These counts include hidden overlaps and are not a count of visible flickers. Repair runs during generation, not every frame, and adds startup/regeneration work. Software-renderer timings are not target-device performance measurements.

## Inspect individual generators

I cycles streets, buildings, traversal, armor, frontage, services, rooftops, signage and distant context. Shift+I restores everything. U toggles the frontage/service/roof groups. These visibility tools switch to fly mode and do not rebuild collision. Shared ownership cuts can become visible when the neighboring owning layer is hidden; solo mode is a debugging view, not an independently closed export.

K tours shops and stalls, starting in Nightmarket. B tours districts, V switches the original viewpoints, G shows greybox and N cycles lighting. J exports the full structural collider list, compiled buildings, infill placements and repair summary, removing the old central-only collider export limit.

## Verification

- test-infill.mjs: five seeds at three height settings, deterministic plan/compiled-data checks, actual prop envelopes, reserved clearances, connectivity and starter-controller walking on all six public stairs.
- test-surfaces.mjs: polygon subtraction tests and final-mesh overlap scans on three seeds, with raw numerical residuals.
- test-grounding.mjs: generated infill assemblies meet their ground or roof mounting plane on two seeds.
- check_locomotion.mjs: retained climbing, landing and jumping fixture.
- qa-v05.cjs: district/daylight/night/greybox/HUD captures, neighboring camera positions, generator isolation, close-up tour, regeneration, equipment and offline startup.

The main workflow additionally compares twelve live source modules against the checkout and checks the public Pages app in Chromium. Runtime assets remain relative beneath /punkcity/.

## Limits

No guarantee of perfect output for every seed, view or GPU. Small detail collision remains simplified; many visual details are non-colliding. No NPC merchants, traffic, interiors, missions, multiplayer or VR qualification is introduced. The played district is still smaller than the proposed 2 km world. Architectural repetition and district transitions still need visual iteration. Historical one-time integration scripts are removed from the current tools directory and preserved in Git history.
