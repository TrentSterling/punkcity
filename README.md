# Punkcity

HACKERPUNK Citylab 0.4. A streets-first procedural sci-fi city and desktop traversal study.

Live: https://tront.xyz/punkcity/ . Canonical repository: TrentSterling/punkcity, main. This is separate from the HACKERPUNK marketing website in TrentSterling/punk. Keep runtime assets relative; do not add a CNAME. HACKERPUNK-Citylab-v0.4.html contains the pinned renderer and runs offline.

## Architecture

The six districts and 36-block street plan retain 16 connected upper squares, 16 upper links and six switchback stairways. Public approaches and courts are reserved before buildings. The 0.4 kit replaces modern office-window grids with larger panel bays, cut-corner casings, colored armor, stepped tower crowns, cooling structures, roof machinery, habitat balconies and original street graphics. Mechanical layers and cable runs have supports. All eight billboard graphics share a generated texture atlas. See RELEASE_04.md for the scope and known limitations.

## Controls

WASD plus right-drag look; Shift faster; E/Q vertical flight; F fly/walk; E climbs structural surfaces without designated handholds. Space jumps or holds thrust with upgraded gear. 1 human / 2 jump-jet / 3 grapple. L low gravity. In walk mode click to capture the pointer, then hold left mouse for tier-3 grapple. Esc releases capture.

B tours districts; V viewpoints; R rerolls; T enters a seed; G greybox; Alt+D dressing; N daylight/overcast/night; O optional SSAO; [ and ] height; Tab hides HUD; H controls; J exports data; P captures a screenshot.

## Source and checks

scifi.js owns the hard-surface art kit, tower assemblies, panel shader and graphics atlas. urbanism.js owns block envelopes and public movement routes. districts.js owns streets, shells and registered surface audits. citylab.js owns the renderer, GPU-texture HUD and desktop controller. facades.js retains paving and legacy material helpers.

Serve the repository beneath /punkcity/ to check relative hosting. From the root run `node test-scifi.mjs` and `python3 build_standalone.py`. `qa-v04.cjs` uses Playwright and accepts CITYLAB_BASE. The main workflow tests geometry, walks all six stairs, captures the districts, tests offline startup and compares the live site against the committed source hashes. Historical source-patch scripts must not be rerun against current code.

## Boundaries

This is not a finished VR game or a claim of reference-pack parity. It is a roughly half-kilometre, authored orthogonal district grammar, not the complete 2 km Unity world. Interiors are not enterable. Small dressing is largely non-colliding, structural collision is simplified and background buildings are scenery. No missions, progression, multiplayer, streaming or Quest performance qualification is implied. Surface audits cover registered surfaces and exclusions, not every possible triangle pair.

## Provenance

REFERENCE-STUDY.md documents CityWorks, Metroforge and Slop New York research; greggman/gen-city-auto was also consulted during the preceding layout iteration. The supplied sci-fi city screenshots informed the new art direction without importing commercial assets. Generated geometry and advertising graphics are original. Three.js's MIT notice remains in vendor/THREE-LICENSE. All references and the separate marketing repository remain unchanged.
