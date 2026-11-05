# Punkcity 0.6

HACKERPUNK streets-first city generator. Canonical repository: TrentSterling/punkcity. Viewer: https://tront.xyz/punkcity/ . The separate TrentSterling/punk website is unchanged.

## Neighborhood expansion

Default seed HACKERPUNK-02 retains 268 earlier infill assemblies and adds 420, giving 688 placements across 34 types. The 23 new families include noodle kitchens, coffee counters, produce stalls, clinics, arcades, fabrication booths, garden suppliers, vending banks, courier-drone stations, battery exchanges, bike racks, recycling, water stations, dining pockets, directories, maintenance carts, transit shelters, rooftop hydroponics, cafes, workshops, communications, water recovery and exercise terraces.

Existing roads, buildings, public decks and starter stairs retain their layout. New shops reserve customer approaches. Rooftop placement protects public terrace routes. These are static environmental assemblies, not NPCs or traffic simulation.

## Viewer

WASD plus right-drag looks/moves; Shift faster; E/Q vertical flight; F walk/fly. K tours new content types before repeats, Shift+K goes backward. U toggles infill. I isolates generator layers; Shift+I restores everything. B tours districts, V viewpoints, G greybox, N lighting. Equipment previews remain on 1/2/3. H shows controls.

Run index.html through a local HTTP server or open HACKERPUNK-Citylab-v0.6.html directly in a WebGL 2 browser. Runtime paths remain relative beneath /punkcity/. Do not add a CNAME.

## Sources and verification

neighborhoods.js contains the new catalog and generators. placement.js owns reservations. frontage.js, street-services.js and roof-services.js retain the earlier infill. Existing surface-ownership and final-mesh regression thresholds are unchanged.

Tests: node --expose-gc test-infill.mjs, test-surfaces.mjs, test-grounding.mjs and test-neighborhoods.mjs; node check_locomotion.mjs. python3 build_standalone.py builds the offline HTML. qa-v06.cjs checks browser rendering, layers, inputs, regeneration and offline startup. tools/smoke-live.cjs verifies the deployed modules and live viewer. Read workflow results for the actual pass/fail status, not this README.

The source and standalone are matched against the packaged 0.6 candidate using SHA-256 during integration. No VR/Quest performance qualification, full 2 km world, merchant simulation, traffic, interiors or new missions is claimed. Screenshot rendering is not a hardware-performance benchmark.
