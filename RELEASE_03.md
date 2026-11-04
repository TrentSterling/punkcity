# Punkcity 0.3: inhabited upper streets

This iteration keeps the six districts and existing streets-first reservations, but replaces identical parcel-outline decks with a connected public-space network. It is a layout and material iteration, not a new game or a claim of commercial environment-pack quality.

## Changed

Sixteen upper squares and sixteen cross-block connections replace the forty-seven-link ring system. Six switchback stairways connect the street to the upper network. North podiums, offset and stepped towers, street-front wings and loading yards reserve courts and access before infill. Upper terrace rail openings are aligned to route sockets. Ground entries, shopfronts, loading bays, roof pavilions and district wayfinding identify destinations. Doorways remain visual; there are no enterable interiors.

Facades use stable per-building identity, room-depth approximation, filtered openings, separate wall/glass roughness and night-only occupied-window glow. An initial rendered review exposed interpolation noise; integer seed handling fixes that issue. Upper paving joints are shaded on the owned surface instead of layered geometry. The minimap displays the actual elevated network.

## Verified before publication

Review workflow 41925749170 succeeded on iteration/urban-logic-v03. Its retained artifact includes nine view captures, greybox, night, HUD, three neighboring-camera captures, geometry and browser reports, and the offline HTML.

Fifteen cases cover five seeds at height multipliers 0.55, 1 and 1.6. All pass deterministic recipe and compiled-data comparisons, registered surface ownership, road/massing exclusions, upper-network connectivity and the tested reserved clearances. Default-plan results: 16 connected upper nodes, 16 links, 6 ground stairs, 58 entrance records, 185 registered ground/deck surfaces, zero registered coplanar-overlap pairs and zero tested road/upper-clearance conflicts.

The actual desktop movement functions walked all six switchback stairs from ground level to the upper square with equipment tier 0 and without climbing, jumping or thrust. Climbing, landing and jumping also passed the retained movement fixture. Browser runs reported no captured JavaScript/console errors or failed asset requests; the standalone initialized with networking disabled. SwiftShader single-frame captures are not performance measurements.

These checks do not prove all triangle pairs, all seeds or every viewpoint artifact-free. Decorative railing, small props and simplified tapered-building AABBs still need gameplay review. The authored orthogonal city grammar remains visibly repetitive; district transitions, facade depth and smaller street props need further art work. No VR, Quest, multiplayer, mission or progression qualification is implied.

## Source layout

- urbanism.js: block programs, massing reservations, upper topology and access geometry.
- facades.js: stable procedural glazing and upper paving.
- districts.js: street surfaces, shell helpers and ownership audits.
- citylab.js: rendering, GPU-texture HUD and desktop movement.

The v0.2 standalone is retained for comparison. The short-lived review workflow is removed; the standard main-branch workflow now tests v0.3 and verifies the deployed source hashes. The separate TrentSterling/punk marketing repository is unchanged by this iteration.
