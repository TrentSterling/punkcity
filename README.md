# Punkcity

HACKERPUNK Citylab 0.3. Streets-first sci-fi city and desktop traversal study.

Live: https://tront.xyz/punkcity/ . Canonical repository: TrentSterling/punkcity, main. This is separate from the HACKERPUNK marketing website in TrentSterling/punk. Keep runtime assets relative; do not add a CNAME. HACKERPUNK-Citylab-v0.3.html includes its pinned renderer for offline use.

## The 0.3 iteration

The six districts and ground street reservations remain. Repeated deck rings are replaced by 16 connected upper squares and 16 cross-block connections. Six switchback stairways link the network to the ground without equipment. Building envelopes reserve courts and through-routes before construction. Doorways, entrance pavilions, loading bays, shopfronts and roof terraces give those routes destinations. The building assemblies include podiums, offset towers, setbacks, housing balconies, cooling infrastructure and planted terraces. Distant context follows a block pattern instead of scattered isolated skyscrapers.

Facades use a single wall shell, filtered full bays, stable per-building room identity, separate glass/wall roughness and night-only window glow. Small details remain non-colliding. This iteration does not import commercial environment-pack assets or external textures.

## Controls

WASD plus right-drag look; Shift faster; E/Q vertical in fly mode. F switches fly/walk. E climbs structural surfaces without designated handholds. Space jumps; hold airborne with augmented equipment for thrust. 1 human / 2 jump-jet / 3 grapple. L low gravity. In walk mode click to capture the pointer, then hold left mouse for a tier-3 grapple. Esc releases capture.

B tours districts; V viewpoints; R rerolls; T enters seed; G greybox; Alt+D dressing; N lighting; O optional SSAO; [ and ] height; Tab hides HUD; H controls; J exports data; P screenshot.

## Maintain and test

urbanism.js owns block envelopes, upper-route reservations, stairs and their geometry. districts.js owns street surfaces, architectural shell primitives and surface auditing. facades.js owns procedural glazing. citylab.js owns rendering, collision, movement and the WebGL texture-backed HUD.

Serve the repository beneath /punkcity/ to check relative deployment paths. Run `node test-urbanism.mjs` and `python3 build_standalone.py` from the root. `qa-v03.cjs` uses Playwright and accepts CITYLAB_BASE. It renders one frame at a time on SwiftShader; this is not a hardware-performance benchmark. The geometry suite checks five seeds at three height settings, the upper graph, ground/deck ownership and reserved mass clearances. It also walks all six staircases using the actual desktop movement functions in a headless fixture. These checks do not establish every-viewpoint freedom from z-fighting.

## Boundaries

Not a finished game, VR rig or claim of commercial-art parity. Streets remain an orthogonal authored grammar with seeded variation, not the full CityWorks street graph. The upper network is authored rather than a general parkour optimizer. Doorways are visual destinations; building interiors are not enterable. Tapered buildings use conservative AABB collision. Distant context is non-colliding. No missions, progression, multiplayer, streaming or Quest performance qualification.

## Provenance

REFERENCE-STUDY.md records the earlier CityWorks, Metroforge and Slop New York study. The 0.3 layout uses original implementations of court reservations, coherent envelopes and endpoint-based elevated streets. greggman/gen-city-auto's street and always-resident city geometry were additionally consulted. This is not a port of those complete generators. The reference repositories were not modified. Three.js's MIT notice remains in vendor/THREE-LICENSE. Historical one-time integration tools must not be rerun against current source.
