# Punkcity

HACKERPUNK Citylab 0.5. Streets-first sci-fi city and desktop traversal study.

Live: https://tront.xyz/punkcity/ . Canonical repository: TrentSterling/punkcity, main. This is separate from TrentSterling/punk, the marketing website. Keep runtime assets relative; do not add a CNAME. HACKERPUNK-Citylab-v0.5.html is the offline single-file build with its renderer embedded.

## Current iteration

Six districts across 36 blocks retain the sci-fi shells, sixteen connected upper squares, sixteen elevated links and six starter-accessible public stairs. Independent small-shop, vendor-stall, street-service and rooftop generators fill the spaces between them. A 3D reservation system protects approaches and traversal corridors.

The geometry compiler now gives exposed coplanar regions one owner and clips duplicate coverage before batching. Unaffected repeated primitives remain instanced. Final-mesh regression tests report numerical edge slivers separately from substantial overlaps. RELEASE_05.md explains coverage, tolerance and limitations.

## Controls

WASD plus right-drag look, Shift faster, E/Q vertical flight. F fly/walk. E climbs structural surfaces without designated handholds. Space jump; hold airborne with upgraded equipment for thrust. 1 human, 2 jump/jet, 3 grapple. L low gravity. Click captures the pointer in walk mode, then hold left mouse for the grapple. Escape releases it.

K tours the new shops and stalls. I cycles isolated generator layers; Shift+I restores all. U toggles frontage, service and roof groups. Visibility tools enter fly mode and do not rebuild collision. B tours districts, V viewpoints, G greybox, N lighting, O optional ambient occlusion. R rerolls, T enters a seed, [ and ] adjust building heights. H controls, Tab hide HUD, J export data, P screenshot.

## Source responsibilities

urbanism.js: block envelopes, public topology and access. districts.js: street plan and architectural shell helpers. scifi.js: armor, crowns, graphics and shared hard-surface kit. facades.js: procedural surface materials.

placement.js: deterministic spatial reservations. frontage.js, street-services.js and roof-services.js: isolated infill passes. prop-kit.js: local-space prop building helpers. surface-ownership.js: coplanar detection and clipping. geometry-batch.js: provenance-aware compilation, instance retention and layer batching. citylab.js: renderer, WebGL HUD and desktop movement.

## Maintain and verify

Serve the repository under /punkcity/ to test relative hosting. From the root, run node --expose-gc test-infill.mjs, node --expose-gc test-surfaces.mjs, node check_locomotion.mjs, and python3 build_standalone.py. qa-v05.cjs uses Playwright and accepts CITYLAB_BASE. The main workflow tests the packaged offline build and verifies the deployed source hashes.

Tests cover fifteen seed/height combinations, post-batch surface scans on three seeds, deterministic recipes, registered road/deck ownership, reserved access, prop envelopes, upper connectivity and real desktop-controller walking on six stairways. Browser evidence includes layer-isolation and close-up views. Software-rendered screenshots are not target-device performance benchmarks.

## Limits and provenance

This is not a finished game, merchant simulation or VR rig. Collision remains simplified, many small details are non-colliding, distant context is scenery, and the played district is smaller than the proposed full 2 km world. No missions, multiplayer, streaming or Quest performance qualification. No guarantee of zero artifacts on every possible seed or GPU.

REFERENCE-STUDY.md and earlier release notes document CityWorks, Metroforge, Slop New York and Greggman references. The implementation and graphics are original; no commercial environment-pack assets are imported. Three.js's MIT notice remains in vendor/THREE-LICENSE. Prior standalone versions remain for comparison. Historical integration scripts must not be rerun on current source.
