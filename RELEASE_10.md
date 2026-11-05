# Punkcity 0.10: coordinated response to the 0.9 visual critique

Canonical generator: TrentSterling/punkcity. Viewer: https://tront.xyz/punkcity/. The separate punk marketing website is unchanged.

## Scope and visual intent

The critique identified object density without convincing places, oversized repeated facade panels, empty upper corridors, uniform architectural skins, appliance-like attachments, generic sign semantics, coarse background blocks and evenly lit blue nights. This revision addresses those areas together. It does not claim the city has reached premium authored-art quality or that every composition problem is solved.

### Human-scale architecture

The shell compiler now fits approximately 2.55 m facade bays (2.8 m on curtain-wall materials) and 3.25 m stories, rather than roughly 5.4-5.8 m panels and 7 m vertical units. Complete bay counts are used on each face. inhabited-facades.js provides different opening proportions, mullions, sill lines, curtain/room variation, subtle wall staining, masonry treatment and glass response. Stable building identities continue across component meshes. Major podium armor, corner trim, utility panels and selected signs are reduced rather than making every face a giant chamfered plate.

The eight existing massing families and twelve material combinations remain. This is a facade/proportion revision, not eight newly designed tower families. Background blocks are subdivided into smaller frontage buildings with different heights and inset upper masses. The map still has a finite boundary and the existing grid.

### Activities attached to architecture

places.js plans wall-backed tenant rows and covered elevated meeting points before the scattered-infill stage. Each accepted group owns physical component envelopes and customer approach space. Later prop placement cannot fill those approaches. Nearby activity candidates favor tighter clusters without reducing the existing placement-clearance tolerance.

The default fixture initially accepts 20 tenant rows and 16 upper shelters. Ground programs include kitchens/cafes, repair and fabrication benches, laundries, plant sales and arcade rows. Their equipment and graphics differ: recognizable cabinets with joysticks, washing-machine fronts, menu screens, workbench equipment and plant shelving. Countertops are around one metre above their support level. These are static environmental models, not functioning businesses or playable arcade games.

Upper shelters have three roof profiles, supported corners, place signage, seating and small service counters where clearances allow. They keep the existing seven-metre central route cross and the same stair/bridge topology. They are destinations and landmarks within the route, not a claim of a redesigned parkour network.

### Retrofitted services and signage

Sign icons are assigned by meaning rather than index modulo four: medical symbols belong to the clinic/augmentation labels, game controls to the arcade, washer imagery to laundry, and so on. Capsules receive smaller roof/edge treatment and window framing. Cooling spines have manifold connections returning into the host. Existing socket and route reservations remain authoritative.

### Localized night illumination

place-lighting.js bakes two shared 256-by-256 light-pool textures when the city regenerates, one for ground level and one for the upper street. Warm/cool local pools are sampled by the standard materials with vertical falloff. Ambient, moon and environment contributions are lower at night, giving activities and occupied windows more contrast. Daylight is still available for judging the geometry.

This is approximate 2.5D illumination. It is not shadowed dynamic point lighting, global illumination, a camera-following light map, or a VR-performance qualification. Fine light leakage and repeated shelter composition remain possible.

## Visual review corrections

The first render review exposed overly tall counters and interchangeable lit rectangles in the new rows. The follow-up replaces those with approximately one-metre worktops and program-specific equipment. Upper corner activities are reserved separately from overhead roofs so open space stays open. Header and light-mount elevations are explicitly registered, including clearance from nearby industrial structures.

## Verification

- test-places.mjs checks three seeds at three heights, accepted place geometry against the union of its actual component reservations, customer access, and seven-metre upper-route clearances.
- Existing fifteen city seed/height cases, six starter stair walks and 240 crossing-ramp walks remain in the suite.
- Retrofit sockets, architecture diversity, infill placement, grounding, deterministic generation and final Float32 coplanar scans remain. Existing overlap acceptance thresholds are unchanged.
- qa-inhabited.cjs renders matched avenue, upper street, market, overview, night and greybox cameras plus new place close-ups. qa-v10.cjs retains viewer/isolation/equipment/regeneration/offline checks.
- tools/smoke-live.cjs checks all twenty runtime module hashes and the actual Pages viewer, including Y/Shift+Y place controls and night rendering.

Test and deployment outcomes belong to the workflow artifacts, not to the existence of this document. Software-rendered screenshots do not establish device frame rate or VR traversal quality.

## Controls

Y / Shift+Y tours places. N cycles lighting. M tours massing families, X retrofits, C streets, K infill and B districts. I isolates layers including places; Shift+I restores the whole city. G shows greybox. The usual WASD/right-drag and fly/walk controls remain. JSON export includes place records.

No imported art, external font files, NPCs, traffic, missions, larger world, non-grid roads or complete VR movement system is added in this release.
