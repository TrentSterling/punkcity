# Punkcity 0.6: neighborhood expansion

Canonical source: TrentSterling/punkcity. Viewer: https://tront.xyz/punkcity/ . The separate punk website is unchanged.

## Saved content

The candidate previously supplied as a local download is now preserved as complete editable source and HACKERPUNK-Citylab-v0.6.html in Git history. Integration checked the original 0.5 preimages and the resulting source hashes. The rebuilt standalone exactly matches the downloaded candidate: SHA-256 788d7b3ae0a61335e0a8ab184b29c9ef648dff396e7d6543498bed5245dfed36.

The default HACKERPUNK-02 plan retains 268 prior infill assemblies and adds 420, totaling 688 across 34 types. New frontage includes noodle kitchens, coffee counters, produce stalls, clinics, arcades, fabrication booths and garden suppliers. Street-service additions include vending, courier-drone stations, battery exchanges, bike racks, recycling, water stations, dining pockets, directories, maintenance carts and transit shelters. Rooftops add hydroponics, cafes, workshops, communications, water recovery and exercise terraces.

Existing roads, masses, decks and stairs retain their layout. New frontage reserves customer approaches; rooftop placement protects terrace routes. Geometry ownership repair and final-mesh overlap acceptance thresholds remain unchanged. These are static assemblies, not NPC merchants, moving traffic or new missions.

## Controls

K tours new content types before repeats; Shift+K goes backward. U toggles infill; I isolates layers; Shift+I restores all. B tours districts, V viewpoints, G greybox, N lighting. Standard movement/equipment previews remain.

## Verification

The review workflow applies source-checked integration, saves the full source remotely, runs geometry and locomotion regressions, and runs qa-v06.cjs in Chromium/SwiftShader. The main workflow repeats regression checks, verifies the rebuilt standalone, and checks the public viewer and thirteen deployed source modules with tools/smoke-live.cjs. Consult each workflow's actual result for pass/fail status. Software-rendered captures do not certify hardware or VR performance.

The one-time integration script and review workflow are removed from the current main tree after use and remain in Git history. No CNAME is added; all runtime assets remain relative beneath /punkcity/.
