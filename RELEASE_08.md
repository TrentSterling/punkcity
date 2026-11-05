# Punkcity 0.8: building identities and massing variety

Canonical generator: TrentSterling/punkcity, main, deployed at https://tront.xyz/punkcity/. The separate punk marketing website is not modified.

## Why 0.7 looked like colored clone districts

The previous architecture selected PALETTES[block.district], used the same tier strategy for whole districts, and based crown types on a three-value block assembly. Functional district assignment therefore also determined most of the visible building identity.

0.8 assigns identities per building instead. Twelve curated material combinations are shared across districts. A deterministic nearby-repeat penalty discourages the same palette on adjacent buildings. Ground buildings, towers and small props no longer take a district-wide uniform. Neutral wall and metal colors carry the architecture; stronger colors are localized accents. Per-building window layouts and trim direction also vary. The same facade identity is retained across a building's component meshes.

## Actual geometry changes

Eight tower massing families: asymmetric setbacks, blade with lower shoulder, unequal split towers with a connecting volume, central shaft with two unequal shoulders, stepped terrace cascade, open courtyard wings, lantern head over a recessed neck, and offset stacked volumes beside a continuous core. These are renderer-neutral component recipes in architecture.js, compiled by massing.js. Five crown treatments and three articulation systems are independent of the family and palette.

South-frontage buildings have inward-only width/depth variations while retaining the original street-facing boundary. Heights vary independently, with a gentle civic prominence bias instead of one standard skyline per district. North roofs that meet the upper streets retain their access level. Streets, block bounds, sixteen upper links, sixteen upper squares and six public stair routes are unchanged. Infill is recomputed against the revised envelopes; it is not promised to preserve the old exact prop population.

The default plan has 49 tower sites and uses all eight massing families and all twelve material palettes. Variety tests also check five seeds at three height settings, family coverage within districts, deterministic results and component containment. This is a constrained family grammar, not a claim of unlimited unique architecture or a new non-grid street planner.

## References actually inspected

- CityWorks src/building-plan.js: frontage subdivision, usable footprints, reserved court access, inset massing and independent part seeds.
- Metroforge metroforge-urban-v08/src/urban-fabric.js: inward-only footprint fitting, coherent facade runs and reserved roof/service clearances. No private source is copied into this public project.
- mrdoob/slop-newyork js/buildings.js: surveyed polygon envelopes, per-building facade choice, and independent storefront/detail reservations. This iteration does not import Manhattan geometry.
- greggman/gen-city-auto src/city/gen-tile.ts: separate building kinds and validated inward offsets for bodies/crowns.

The implementation is original code informed by those structural ideas, not an import of their renderers or asset packs.

## Surface regression

The existing 0.1 mm maximum residual-strip and 0.03 m² aggregate residual-area acceptance limits remain. New geometry exposed a numerical clipping bug: unnormalised edge predicates could amplify epsilon on tiny edges, and tolerance-based inside/outside classification could extrapolate intersections beyond segment endpoints. Signed metric distance, snapped boundary distances and a local-origin polygon-area calculation address that case. Final Float32 geometry is scanned again after repair.

Existing street-ramp, stair, infill-envelope, grounding, customer-approach, movement and offline checks remain. Two obsolete exact-population assertions from the 0.6/0.7 preservation pass are replaced with population floors because changing building envelopes intentionally changes valid prop placements. Clearance checks are not relaxed.

## Viewer

M tours one example of each massing family, then the remaining buildings. Shift+M goes backward. G shows greybox; B tours districts; C inspects streets; K tours small shops and rooftop activity; I/Shift+I isolates/restores layers. J exports the deterministic city plan including architecture identities and component recipes.

Browser captures include the previous overview camera, a high overhead view, a greybox counterpart and eight family inspections. Software-renderer captures are not a GPU performance benchmark. Collision on chamfered shells remains conservative, fine trim is visual dressing, and no VR performance, interiors, pedestrians, traffic or larger world is claimed.
