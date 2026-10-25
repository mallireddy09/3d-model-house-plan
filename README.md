# Vastu Griha

Interactive 3D planner for an Indian house. The default ground floor follows a classical Vastu layout: pooja and the entrance in the north-east, kitchen in the south-east, master bedroom in the south-west, guest room and toilet in the north-west, and an open brahmasthan. A clockwise stair sits in the west, and the basement stays under the north and east.

## Run

```bash
npm install
npm test
npm run dev
```

Open the local Vite URL. `npm run build` typechecks and writes `dist/`.

## Controls

- Drag a furniture piece to slide it on the current floor. It snaps to a half-foot grid when you release it.
- Arrow keys nudge the selection. Hold Shift for a 2 ft step. Q and E rotate by 15°. R toggles move and rotate. Escape clears the selection.
- In rotate mode, use the yellow ring gizmo.
- Orbit, pan, and zoom in the 3D view. Blueprint switches to a top-down plan: drag empty floor to pan, scroll to zoom.
- Wiring draws the south-east distribution board and the north and east mains for the floor you are viewing.
- Export JSON downloads the rooms, furniture poses, wiring, and the current compliance report.

## Coordinates

One unit is one foot. **+X is east, −Z is north, +Y is up.** The compliance score starts at 100 and drops when a piece enters a zone or facing the rules reject. The check is a planning aid, not a substitute for an architect or a site-specific Vastu review.
