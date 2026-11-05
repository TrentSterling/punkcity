# Punkcity 0.10

HACKERPUNK streets-first procedural city generator. Canonical repository: TrentSterling/punkcity. Live viewer: https://tront.xyz/punkcity/. The separate TrentSterling/punk website is unchanged.

## Inhabited-city critique pass

Human-scale facade bays and stories replace the oversized repeated panel treatment. Wall-backed tenant rows and elevated shelter destinations complement the existing eight tower families, street infrastructure, upper routes and neighborhood props. Equipment distinguishes food/coffee, repair/fabrication, laundries, plant shops and arcade rows. Sign imagery follows the tenant meaning. Shared light-pool textures give ground and upper activities local nighttime illumination.

Read RELEASE_10.md for specific changes, verification and limits. These are static environmental assemblies, not NPCs, merchant simulation or playable arcade games. The grid and finite world remain; the visual benchmark is not claimed complete.

## Viewer

WASD and right-drag move/look; Shift faster; E/Q vertical flight; F walk/fly. Y tours new places, Shift+Y backward. N cycles daylight/overcast/night. M inspects building families; X retrofits; Z compares retrofit on/off; C inspects streets; K tours neighborhood props; B tours districts. I isolates generator layers, including places, and Shift+I restores all. G greybox; U infill toggle; H controls. Equipment previews remain on 1/2/3. J exports the city recipe and place records; P captures a screenshot.

Run index.html through a local HTTP server or open HACKERPUNK-Citylab-v0.10.html directly in a WebGL 2 desktop browser. All runtime dependencies are local relative paths beneath /punkcity/. Do not add a CNAME.

## Modules

architecture.js / massing.js: per-building identities and volume recipes. urbanism.js / districts.js: streets-first block envelopes, courts, stairs and upper routes. streets.js: road geometry and surface materials. inhabited-facades.js: complete bay/story layouts and material response. places.js: activity groups, owned component volumes, approaches and original shared sign/screen textures. place-lighting.js: two shared approximate nighttime light maps. neighborhoods.js and the frontage/street/roof modules: smaller infill. retrofit.js: facade sockets and attachments. geometry-batch.js / surface-ownership.js: batching and coplanar repair.

## Verification

Node tests cover places, architecture variety, infill, retrofit sockets, streets, starter stairs/ramps, grounding and reconstructed final-mesh overlap. python3 build_standalone.py builds the single-file viewer. qa-inhabited.cjs captures matched critique cameras and the new place tour. qa-v10.cjs verifies browser controls, isolation, regeneration and offline startup. tools/smoke-live.cjs checks deployed runtime hashes and renders the actual public viewer. Read workflow outcomes for actual pass/fail evidence.

No full 2 km map, non-grid road planning, VR/Quest performance qualification, traffic simulation or enterable interiors is claimed. Screenshot rendering on SwiftShader is not a target-device benchmark.
