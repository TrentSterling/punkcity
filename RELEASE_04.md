# Punkcity 0.4: armored sci-fi architecture

This is an architectural art-direction iteration on the existing 36-block city, not a world-size expansion. It responds to the supplied sci-fi city reference images: broad cut-corner shells, colored armor, mechanical roof profiles and layered street services replace the predominantly modern-office facade language.

## Visible changes

Tower bodies now use stepped assemblies with three mechanical crown families, radiator cores, external fins and supports, thicker collars, housing balconies and stepped garden blocks. The corporate district uses ochre armor and dark glazing; utility buildings use teal cooling structures; housing, commerce and garden zones have separate material families. Large repeated office-window grids are replaced by wider framed openings and service-panel surfaces. The former dense sill/mullion cage is removed.

A reusable hard-surface kit adds cut-corner casings, fan housings, roof service spines, ducts, intake modules, street counters, terminals, charging posts, cable masts and deck-edge cladding. Cable crossarms are outside the reserved upper walking corridor. Layered crown radiators have continuous internal supports instead of floating plates.

Eight original vector-drawn advertising designs share one texture atlas and material. They are used for wall screens, shop fascia, projecting signs and terminals. No commercial pack meshes, textures, logos or character art were imported. Daylight remains the default; fog is reduced to expose the architecture. Night lighting is still available.

## Retained layout and movement

The six districts, 36 ground blocks, 16 connected upper squares, 16 upper connections and six public stairs remain. The layout is still streets-first, with courts and public approaches reserved before construction. Starter climbing remains unrestricted on structural collision. Existing jump, thrust, low-gravity and grapple preview controls are retained. Equipment and lighting do not reroll the city plan.

## Checks and evidence

The architecture review workflow runs test-scifi.mjs across five seeds and three height settings, including deterministic plan/compiled-data checks, registered ground/deck ownership, building-road exclusions, upper-network connectivity and actual starter-controller walking on all six stairs. qa-v04.cjs captures all districts, daylight/greybox/night, the HUD and neighboring-camera positions; it checks regeneration, console errors, asset requests and offline startup. The overview-matched capture retains the old overview camera for comparison; the primary overview and two other presets were reframed for closer inspection.

The final main-branch workflow additionally verifies the live deployment against all five source modules, including scifi.js. Browser screenshots use Chromium/SwiftShader. Render counters include the passes submitted in that frame, and screenshots are not hardware-performance benchmarks.

## Remaining limitations

This does not claim parity with the reference environment pack. Roads and upper plazas remain under-populated; the city needs more distinctive large attachments, smaller-scale architectural variety, district transitions and environmental storytelling. No pedestrians, traffic simulation or new missions are introduced. Many small armor parts, signs, cables and props are non-colliding dressing. Structural collision remains simplified. Registered-surface tests are not an exhaustive triangle-intersection or every-viewpoint z-fighting proof. No VR/Quest performance qualification, streaming, networking or full 2 km world is implied.

## Maintained sources

scifi.js: parametric hard-surface kit, tower assemblies, panel shader and sign atlas.
urbanism.js: city programs, public routes and access; delegates architectural styling to the kit.
districts.js: street plan, shells, material setup and registered surface audits.
facades.js: retained paving and legacy facade helpers.
citylab.js: renderer, GPU-texture HUD, lighting and desktop movement.

The canonical project remains TrentSterling/punkcity, branch main, deployed at https://tront.xyz/punkcity/. The separate TrentSterling/punk website is unchanged.
