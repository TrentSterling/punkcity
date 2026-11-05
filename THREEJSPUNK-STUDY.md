# Threejs-Punk and procedural cyberpunk reference study

Research date: 2026-11-05. Scope: learn from the sources without importing asset packs or replacing Punkcity's procedural geometry.

## Threejs-Punk: distinguish the public demo from the city article

Article: https://andersonmancini.dev/blog/threejs-punk-city-from-an-image
Performance article: https://andersonmancini.dev/blog/threejs-punk-occlusion-culling
Public repository inspected: https://github.com/ektogamat/threejs-conference at 8cc20593b2270e2ce832e7b7b44356705daddec4.

The city article describes a procedural layout and placement pipeline using an existing Blender alley kit: roughly twenty building assets and twenty-four skyline assets. A headless Blender script applies modifiers, corrects winding and canonicalizes the source assets. This is scripted asset processing, not evidence that the building meshes were originally synthesized by Python. The article's occupancy-based frontage and tower placement, facade signs, flat placement streams, low-cost pass proxies and palette batching remain useful independently of how the source models were made.

The supplied public repository is a rainy alley demonstration. Its src/world/city/loadCity.js loads cyberpunk_compressed.glb and colider.glb and constructs BVHs; it does not contain the complete image-to-city pipeline described in the article. Its README points to WebGPU rain-height, wet-ground reflection and look-profile techniques. The asset-license section explicitly separates MIT code from public models, textures, audio and videos. None of those assets or code were copied into Punkcity.

The occlusion article describes conservative box rasterization into a low-resolution CPU depth buffer and rebuilding visible instances on motion/time thresholds. This remains a future performance study, not a feature claimed in 0.9. Avoid using conservative collision hulls as aggressive occluders across real openings.

## Closer procedural geometry sources

### FI ShipKit / BuildingKit
https://github.com/savannah-i-g/fi-shipkit
Read README.md and build_buildingkit.py, blob a48bd5841dfdd9399fd4f169d9cff50612119044. This is actual bpy code constructing Geometry Nodes groups, including plinth/entrance geometry and procedural building families. The documented surface-detail and LOD controls, canonical contact frames and self-tests are relevant. The code has GPL-3.0-or-later headers and the kit assets have a separate license. No code, node graph or asset was copied. The Blender generator has not been executed or performance-qualified here.

### Procedural-cyberpunk-city
https://github.com/jhonatan98rios/Procedural-cyberpunk-city
Read lib/generator/building.ts, blob ad60e2a714e665dc09d47c1022bd5e0f739589a4. A small renderer-neutral part generator using seeded primitive bodies, roof equipment, windows and signs. Its building grammar is simpler than Punkcity's current massing. Useful as a facade-assembly reference, not an upgrade to adopt wholesale. No code copied.

### ProceduralCityGeneration
https://github.com/Developer-The-Great/ProceduralCityGeneration
Author explanation: https://developer-the-great.github.io/ProceduralCityGenerator.html
The author describes different architectural grammars, including BSP/shape-grammar entropic growth and parametric n-gon meshes. The author also acknowledges the result lacks many Night City features. Reviewed the explanation and project location, not a completed Unity integration.

### Cellscape
https://blenderprocedural.github.io/cellscape/index.html
Its author documents MarkovJunior building generation and WFC street plans with roof terraces, stairs, bridges and arcades. Relevant to future route-aware stacked architecture, not used as proof of VR playability and not integrated into this revision.

## Applied to Punkcity 0.9

The original retrofit.js separates deterministic socket planning from geometry. Modules use +Z outward, +X along a facade, +Y up. They attach to actual building faces and stay clear of other generated geometry, infill, stairs and public upper routes. Galleries, projecting capsule bays, cooling spines, double-sided signs, wall displays and cable bundles add depth and use to otherwise clean surfaces. Sixteen original signs share a canvas atlas. A schema-labelled nine-number placement stream is included in JSON export; full object records remain available for debugging.

No generated map image, external building kit, one-material city renderer, WebGPU migration, occlusion culler, rain simulation or reflection pass is claimed as implemented. Buildings still come from Punkcity's procedural recipes. The city remains smaller than the proposed 2 km world.
