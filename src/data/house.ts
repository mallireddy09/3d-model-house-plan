import type { FloorId, FloorWiring, FurnitureItem, Rect, Room, WallDef } from '../types'
import { BASEMENT, HOUSE, RULES } from '../lib/vastu'

/** Vertical position of each finished floor, in feet. +Y is up. */
export const FLOOR_Y: Record<FloorId, number> = {
  basement: -11,
  ground: 0,
  first: 11,
}

export const FLOOR_LABEL: Record<FloorId, string> = {
  basement: 'Basement',
  ground: 'Ground floor',
  first: 'First floor',
}

export const WALL_HEIGHT = 10
export const WALL_THICKNESS = 0.42

export interface Bounds {
  minX: number
  maxX: number
  minZ: number
  maxZ: number
}

const BALCONY: Bounds = { minX: -16, maxX: 16, minZ: -32.5, maxZ: -26 }

function clampRect(x: number, z: number, rect: Bounds, margin: number) {
  return {
    x: Math.min(rect.maxX - margin, Math.max(rect.minX + margin, x)),
    z: Math.min(rect.maxZ - margin, Math.max(rect.minZ + margin, z)),
  }
}

export function clampPlacement(floor: FloorId, x: number, z: number) {
  const margin = 0.9
  if (floor === 'basement') return clampRect(x, z, BASEMENT, margin)
  const house = clampRect(x, z, HOUSE, margin)
  if (floor !== 'first') return house
  const balcony = clampRect(x, z, BALCONY, margin)
  const houseDist = (house.x - x) ** 2 + (house.z - z) ** 2
  const balconyDist = (balcony.x - x) ** 2 + (balcony.z - z) ** 2
  if (z < -26.2 && balconyDist <= houseDist) return balcony
  return house
}

export function snap(value: number, step = 0.5) {
  return Math.round(value / step) * step
}

export function roomAnchor(room: Room) {
  if (room.label) return room.label
  const rect = room.rects[0]
  return { x: (rect.x0 + rect.x1) / 2, z: (rect.z0 + rect.z1) / 2 }
}

function room(
  id: string,
  name: string,
  floor: FloorId,
  rects: Rect[],
  color: string,
  note: string,
  label?: { x: number; z: number },
): Room {
  return { id, name, floor, rects, color, note, label }
}

export const ROOMS: Room[] = [
  room('foyer', 'Entrance foyer', 'ground', [
    { x0: 7, x1: 13, z0: -27, z1: -9 },
    { x0: 13, x1: 21, z0: -16, z1: -9 },
  ], '#f3ead7', 'Open north entrance, shifted toward the north-east and clear of the corner.', { x: 10, z: -20 }),
  room('pooja', 'Pooja', 'ground', [{ x0: 13, x1: 21, z0: -27, z1: -16 }], '#f6e7b8', 'Sacred north-east room. Keep it clean and free of storage.', { x: 17, z: -22 }),
  room('living', 'Living', 'ground', [
    { x0: -7, x1: -4.7, z0: -27, z1: -9 },
    { x0: -1.3, x1: 7, z0: -27, z1: -9 },
    { x0: -4.7, x1: -1.3, z0: -16.2, z1: -9 },
    { x0: -4.7, x1: -1.3, z0: -27, z1: -25.2 },
  ], '#e7e1d6', 'North living room. Seat people facing east or north.', { x: 2.2, z: -20 }),
  room('guest', 'Guest room', 'ground', [{ x0: -21, x1: -7, z0: -27, z1: -14 }], '#e4d3bc', 'North-west guest room, the right place for visitors.', { x: -14, z: -20 }),
  room('bath', 'Bathroom', 'ground', [{ x0: -21, x1: -7, z0: -14, z1: -4 }], '#d5e0e2', 'Attached bath in the north-west, with the door away from the shrine.', { x: -14, z: -9 }),
  room('dining', 'Dining', 'ground', [{ x0: 7, x1: 21, z0: -9, z1: 9 }], '#ead7be', 'East dining room, open toward the centre.', { x: 14, z: 0 }),
  room('brahma', 'Brahmasthan', 'ground', [{ x0: -7, x1: 7, z0: -9, z1: 9 }], '#f7f3ea', 'The centre is open on all sides. Do not park heavy furniture here.', { x: 0, z: 0 }),
  room('stair', 'Staircase', 'ground', [{ x0: -21, x1: -7, z0: -4, z1: 12 }], '#e7dcc8', 'West and south-west stair. You turn right, clockwise, as you climb.', { x: -14, z: 4 }),
  room('master', 'Master bedroom', 'ground', [{ x0: -21, x1: -7, z0: 12, z1: 27 }], '#e6c8a4', 'South-west bedroom. The bed head faces south.', { x: -14, z: 20 }),
  room('kitchen', 'Kitchen', 'ground', [{ x0: 7, x1: 21, z0: 9, z1: 27 }], '#ece7df', 'South-east kitchen. The stove is on the east wall.', { x: 14, z: 18 }),
  room('gallery', 'South gallery', 'ground', [{ x0: -7, x1: 7, z0: 9, z1: 27 }], '#e6dfd2', 'A light south passage so the centre can breathe.', { x: 0, z: 18 }),

  room('lounge', 'Family lounge', 'first', [{ x0: -7, x1: 7, z0: -27, z1: -9 }], '#e7e1d6', 'North family sitting, opening to the balcony.', { x: 0, z: -18 }),
  room('children', "Children's room", 'first', [{ x0: -21, x1: -7, z0: -27, z1: -9 }], '#e7d4c2', 'North-west bedroom for children.', { x: -14, z: -18 }),
  room('study', 'Study', 'first', [{ x0: 7, x1: 21, z0: -27, z1: -9 }], '#f3e6c8', 'North-east study. Face east while working.', { x: 14, z: -18 }),
  room('upper-bath', 'Toilet', 'first', [{ x0: -21, x1: -12, z0: -9, z1: -1 }], '#d5e0e2', 'West toilet, stacked away from the north-east study.', { x: -16.5, z: -5 }),
  room('upper-stair', 'Stair hall', 'first', [{ x0: -21, x1: -7, z0: -1, z1: 11 }], '#e7dcc8', 'Arrival of the clockwise stair.', { x: -14, z: 5 }),
  room('landing', 'Open landing', 'first', [
    { x0: -7, x1: 7, z0: -9, z1: 9 },
    { x0: -7, x1: 7, z0: 9, z1: 16 },
  ], '#f7f3ea', 'First-floor brahmasthan. Leave the middle empty.', { x: 0, z: 0 }),
  room('upper-bed', 'Upper bedroom', 'first', [{ x0: -21, x1: -7, z0: 11, z1: 27 }], '#e6c8a4', 'South-west bedroom above the master suite.', { x: -14, z: 19 }),
  room('linen', 'Linen room', 'first', [{ x0: -7, x1: 7, z0: 16, z1: 27 }], '#e5d9c8', 'Closed store on the south, outside the centre.', { x: 0, z: 21 }),
  room('passage', 'East passage', 'first', [{ x0: 7, x1: 21, z0: -9, z1: 9 }], '#eadcc8', 'East link between the study and the terrace.', { x: 14, z: 0 }),
  room('terrace', 'Terrace', 'first', [{ x0: 7, x1: 21, z0: 9, z1: 27 }], '#efe4d2', 'Open terrace over the kitchen, with a low parapet.', { x: 14, z: 18 }),
  room('balcony', 'Balcony', 'first', [{ x0: -16, x1: 16, z0: -32.5, z1: -27 }], '#e5d7c4', 'North balcony off the family lounge.', { x: 0, z: -29.5 }),

  room('theatre', 'Home theatre', 'basement', [{ x0: -7, x1: 21, z0: -27, z1: 9 }], '#3e3a36', 'Under the north and east footprint. Seating faces east.', { x: 2, z: -16 }),
  room('store', 'Storage', 'basement', [{ x0: 12, x1: 21, z0: -6, z1: 9 }], '#51483e', 'East store for everyday goods, not a heavy south-west load.', { x: 16.5, z: 2 }),
]

function wall(
  floor: FloorId,
  id: string,
  x1: number,
  z1: number,
  x2: number,
  z2: number,
  openings?: WallDef['openings'],
  height?: number,
): WallDef {
  return { id, floor, a: [x1, z1], b: [x2, z2], openings, height }
}

const door = (t: number, width = 2.8): WallDef['openings'] => [{ kind: 'door', t, width }]

export const WALLS: WallDef[] = [
  wall('ground', 'g-north', -21, -27, 21, -27, [
    { kind: 'window', t: 5 / 42, width: 3 },
    { kind: 'window', t: 19 / 42, width: 4 },
    { kind: 'door', t: 31 / 42, width: 4 },
  ]),
  wall('ground', 'g-east', 21, -27, 21, 27, [
    { kind: 'window', t: 5 / 54, width: 3 },
    { kind: 'window', t: 25 / 54, width: 4 },
    { kind: 'window', t: 45 / 54, width: 3.5 },
  ]),
  wall('ground', 'g-south', -21, 27, 21, 27, [
    { kind: 'window', t: 6 / 42, width: 4 },
    { kind: 'window', t: 0.5, width: 3 },
    { kind: 'window', t: 35 / 42, width: 3.5 },
  ]),
  wall('ground', 'g-west', -21, -27, -21, 27, [
    { kind: 'window', t: 6 / 54, width: 3 },
    { kind: 'window', t: 47 / 54, width: 3.5 },
  ]),
  wall('ground', 'g-guest-living', -7, -27, -7, -14, door(7 / 13, 2.8)),
  wall('ground', 'g-guest-bath', -21, -14, -7, -14, door(5 / 14, 2.6)),
  wall('ground', 'g-bath-east', -7, -14, -7, -4),
  wall('ground', 'g-bath-south', -21, -4, -7, -4, door(0.5, 2.6)),
  wall('ground', 'g-master-north', -21, 12, -7, 12, door(8 / 14, 3)),
  wall('ground', 'g-master-east', -7, 12, -7, 27),
  wall('ground', 'g-pooja-west', 13, -27, 13, -16, door(9 / 11, 2.6)),
  wall('ground', 'g-pooja-south', 13, -16, 21, -16),
  wall('ground', 'g-kitchen-north', 7, 9, 21, 9, door(4 / 14, 3)),
  wall('ground', 'g-kitchen-west', 7, 9, 7, 27, door(7 / 18, 2.8)),
  wall('ground', 'g-foyer-dining', 7, -9, 21, -9, [{ kind: 'opening', t: 8 / 14, width: 6 }]),
  wall('ground', 'g-living-foyer', 7, -27, 7, -9, [{ kind: 'opening', t: 0.5, width: 6 }]),

  wall('first', 'f-north', -21, -27, 21, -27, [
    { kind: 'window', t: 7 / 42, width: 3.5 },
    { kind: 'door', t: 0.5, width: 5.5 },
    { kind: 'window', t: 35 / 42, width: 3.5 },
  ]),
  wall('first', 'f-east', 21, -27, 21, 9, [
    { kind: 'window', t: 9 / 36, width: 3.5 },
    { kind: 'window', t: 0.75, width: 4 },
  ]),
  wall('first', 'f-east-parapet', 21, 9, 21, 27, undefined, 3.3),
  wall('first', 'f-south', -21, 27, 7, 27, [
    { kind: 'window', t: 7 / 28, width: 4 },
    { kind: 'window', t: 0.75, width: 3 },
  ]),
  wall('first', 'f-south-parapet', 7, 27, 21, 27, undefined, 3.3),
  wall('first', 'f-west', -21, -27, -21, 27, [
    { kind: 'window', t: 9 / 54, width: 3.5 },
    { kind: 'window', t: 47 / 54, width: 3.5 },
  ]),
  wall('first', 'f-kids-south', -21, -9, -7, -9, door(0.5, 3)),
  wall('first', 'f-kids-east', -7, -27, -7, -9, door(11 / 18, 3)),
  wall('first', 'f-study-west', 7, -27, 7, -9, door(11 / 18, 3)),
  wall('first', 'f-study-south', 7, -9, 21, -9, door(0.5, 3)),
  wall('first', 'f-wc-east', -12, -9, -12, -1, door(0.5, 2.5)),
  wall('first', 'f-wc-south', -21, -1, -12, -1),
  wall('first', 'f-bed-north', -21, 11, -7, 11, door(0.5, 3)),
  wall('first', 'f-bed-east', -7, 11, -7, 27),
  wall('first', 'f-linen-north', -7, 16, 7, 16, door(0.5, 2.8)),
  wall('first', 'f-linen-east', 7, 16, 7, 27, door(4 / 11, 2.6)),
  wall('first', 'f-terrace-north', 7, 9, 21, 9, door(9 / 14, 3.2)),

  wall('basement', 'b-north', -7, -27, 21, -27),
  wall('basement', 'b-east', 21, -27, 21, 9),
  wall('basement', 'b-south', 21, 9, -7, 9),
  wall('basement', 'b-west', -7, 9, -7, -27),
  wall('basement', 'b-store', 12, -6, 12, 9, door(0.35, 3)),
]

const yGround = FLOOR_Y.ground
const yFirst = FLOOR_Y.first
const yBase = FLOOR_Y.basement

export const WIRING: FloorWiring[] = [
  {
    floor: 'ground',
    mcb: { x: 20.15, y: yGround + 4.7, z: 22.2, label: 'Main MCB · Agni' },
    conduits: [
      {
        id: 'g-main',
        kind: 'main',
        points: [
          [20.15, yGround + 4.7, 22.2],
          [20.35, yGround + 8.7, 22.2],
          [20.35, yGround + 8.7, -26.35],
          [-20.35, yGround + 8.7, -26.35],
        ],
      },
      {
        id: 'g-living',
        kind: 'branch',
        points: [
          [-2, yGround + 8.7, -26.35],
          [-2, yGround + 4.3, -26.35],
        ],
      },
      {
        id: 'g-pooja',
        kind: 'branch',
        points: [
          [17, yGround + 8.7, -26.35],
          [17, yGround + 4.3, -26.35],
        ],
      },
      {
        id: 'g-foyer',
        kind: 'branch',
        points: [
          [10, yGround + 8.7, -26.35],
          [10, yGround + 4.3, -26.35],
        ],
      },
      {
        id: 'g-guest',
        kind: 'branch',
        points: [
          [-20.35, yGround + 8.7, -26.35],
          [-20.35, yGround + 8.7, -20],
          [-20.35, yGround + 4.3, -20],
        ],
      },
      {
        id: 'g-master',
        kind: 'branch',
        points: [
          [-20.35, yGround + 8.7, -26.35],
          [-20.35, yGround + 8.7, 18],
          [-20.35, yGround + 4.3, 18],
        ],
      },
      {
        id: 'g-dining',
        kind: 'branch',
        points: [
          [20.35, yGround + 8.7, 0],
          [20.35, yGround + 4.3, 0],
        ],
      },
      {
        id: 'g-kitchen',
        kind: 'branch',
        points: [
          [20.35, yGround + 8.7, 16],
          [20.35, yGround + 4.3, 16],
        ],
      },
    ],
    boards: [
      { id: 'sw-living', label: 'Living', x: -2, y: yGround + 4.3, z: -26.35 },
      { id: 'sw-pooja', label: 'Pooja', x: 17, y: yGround + 4.3, z: -26.35 },
      { id: 'sw-foyer', label: 'Foyer', x: 10, y: yGround + 4.3, z: -26.35 },
      { id: 'sw-guest', label: 'Guest', x: -20.35, y: yGround + 4.3, z: -20 },
      { id: 'sw-master', label: 'Master', x: -20.35, y: yGround + 4.3, z: 18 },
      { id: 'sw-dining', label: 'Dining', x: 20.35, y: yGround + 4.3, z: 0 },
      { id: 'sw-kitchen', label: 'Kitchen', x: 20.35, y: yGround + 4.3, z: 16 },
    ],
  },
  {
    floor: 'first',
    mcb: { x: 18.4, y: yFirst + 4.6, z: 13.5, label: 'Sub DB · south-east' },
    conduits: [
      {
        id: 'f-main',
        kind: 'main',
        points: [
          [18.4, yFirst + 4.6, 13.5],
          [20.35, yFirst + 8.6, 13.5],
          [20.35, yFirst + 8.6, -26.35],
          [-20.35, yFirst + 8.6, -26.35],
        ],
      },
      {
        id: 'f-lounge',
        kind: 'branch',
        points: [
          [0, yFirst + 8.6, -26.35],
          [0, yFirst + 4.2, -26.35],
        ],
      },
      {
        id: 'f-study',
        kind: 'branch',
        points: [
          [15, yFirst + 8.6, -26.35],
          [15, yFirst + 4.2, -26.35],
        ],
      },
      {
        id: 'f-kids',
        kind: 'branch',
        points: [
          [-20.35, yFirst + 8.6, -26.35],
          [-20.35, yFirst + 8.6, -18],
          [-20.35, yFirst + 4.2, -18],
        ],
      },
      {
        id: 'f-bed',
        kind: 'branch',
        points: [
          [-20.35, yFirst + 8.6, -26.35],
          [-20.35, yFirst + 8.6, 19],
          [-20.35, yFirst + 4.2, 19],
        ],
      },
    ],
    boards: [
      { id: 'sw-lounge', label: 'Lounge', x: 0, y: yFirst + 4.2, z: -26.35 },
      { id: 'sw-study', label: 'Study', x: 15, y: yFirst + 4.2, z: -26.35 },
      { id: 'sw-kids', label: 'Children', x: -20.35, y: yFirst + 4.2, z: -18 },
      { id: 'sw-upper-bed', label: 'Bedroom', x: -20.35, y: yFirst + 4.2, z: 19 },
    ],
  },
  {
    floor: 'basement',
    mcb: { x: 19.4, y: yBase + 4.5, z: 6.4, label: 'Basement DB · east' },
    conduits: [
      {
        id: 'b-main',
        kind: 'main',
        points: [
          [19.4, yBase + 4.5, 6.4],
          [20.2, yBase + 8.2, 6.4],
          [20.2, yBase + 8.2, -26.2],
          [-6.2, yBase + 8.2, -26.2],
        ],
      },
      {
        id: 'b-theatre',
        kind: 'branch',
        points: [
          [2, yBase + 8.2, -26.2],
          [2, yBase + 4.1, -26.2],
        ],
      },
      {
        id: 'b-store',
        kind: 'branch',
        points: [
          [20.2, yBase + 8.2, 2],
          [20.2, yBase + 4.1, 2],
        ],
      },
    ],
    boards: [
      { id: 'sw-theatre', label: 'Theatre', x: 2, y: yBase + 4.1, z: -26.2 },
      { id: 'sw-store', label: 'Store', x: 20.2, y: yBase + 4.1, z: 2 },
    ],
  },
]

function item(
  id: string,
  type: FurnitureItem['type'],
  name: string,
  floor: FloorId,
  x: number,
  z: number,
  rotation: number,
  width: number,
  depth: number,
  height: number,
  rules: FurnitureItem['rules'],
  color?: string,
): FurnitureItem {
  return { id, type, name, floor, x, z, rotation, width, depth, height, rules, color }
}

export const INITIAL_FURNITURE: FurnitureItem[] = [
  item('sofa', 'sofa', 'Living sofa', 'ground', -5.5, -19, Math.PI / 2, 7, 3, 2.8, RULES.sofa, '#7a3144'),
  item('coffee', 'table', 'Coffee table', 'ground', 1, -19, 0, 3.2, 1.8, 1.35, RULES.table, '#8d5a32'),
  item('tv', 'tv', 'Television', 'ground', 2.5, -25.5, 0, 4.4, 1.15, 2.3, RULES.tv),
  item('dining', 'dining', 'Dining table', 'ground', 14, 0, 0, 6, 3.4, 2.55, RULES.dining, '#a86b3c'),
  item('master-bed', 'bed', 'Master bed', 'ground', -14, 23, Math.PI, 6.5, 6.5, 2.5, RULES.masterBed),
  item('master-wardrobe', 'wardrobe', 'Master wardrobe', 'ground', -19.5, 15.5, Math.PI / 2, 5.5, 1.8, 7, RULES.wardrobe),
  item('pooja', 'pooja', 'Pooja mandir', 'ground', 18, -23.5, -Math.PI / 2, 3.4, 1.7, 6.2, RULES.pooja),
  item('kitchen', 'kitchen', 'Kitchen counter', 'ground', 14.5, 25, 0, 9, 2.2, 3, RULES.kitchen),
  item('stove', 'stove', 'Gas stove', 'ground', 19, 13.5, Math.PI / 2, 2.4, 2.2, 3.5, RULES.stove),
  item('guest-bed', 'bed', 'Guest bed', 'ground', -14, -18.5, Math.PI, 6, 6.5, 2.35, RULES.guestBed, '#cbb89a'),
  item('guest-wc', 'toilet', 'Guest toilet', 'ground', -18.5, -11.5, 0, 1.7, 2.6, 2.4, RULES.wet),
  item('vanity', 'vanity', 'Wash vanity', 'ground', -8.5, -11, -Math.PI / 2, 3.2, 1.5, 2.7, RULES.wet),

  item('child-bed', 'bed', "Children's bed", 'first', -14, -18, -Math.PI / 2, 6, 6, 2.2, RULES.guestBed, '#d9c7a6'),
  item('study-desk', 'study', 'Study desk', 'first', 15, -18, Math.PI / 2, 4.2, 2.3, 2.5, RULES.study),
  item('diwan', 'sofa', 'Family diwan', 'first', 0, -18, Math.PI, 6.5, 3, 2.5, RULES.sofa, '#243047'),
  item('upper-bed', 'bed', 'Upper bedroom bed', 'first', -14, 21, Math.PI, 6.5, 6.5, 2.5, RULES.masterBed),
  item('upper-wardrobe', 'wardrobe', 'Upper wardrobe', 'first', -19.5, 16, Math.PI / 2, 5.2, 1.8, 7, RULES.wardrobe),
  item('upper-wc', 'toilet', 'Upper toilet', 'first', -17, -4, 0, 1.7, 2.6, 2.4, RULES.wet),

  item('theatre', 'theater', 'Theatre seats', 'basement', 2, -18, Math.PI / 2, 7.2, 3, 3.2, RULES.theater),
  item('screen', 'screen', 'Theatre screen', 'basement', 14, -18, -Math.PI / 2, 5.2, 0.45, 3.2, RULES.screen),
  item('storage', 'storage', 'Storage racks', 'basement', 16, 2, Math.PI / 2, 6, 1.8, 6.2, RULES.storage),
]

export function cloneFurniture(): FurnitureItem[] {
  return structuredClone(INITIAL_FURNITURE)
}

export function defaultPose(id: string) {
  return INITIAL_FURNITURE.find((item) => item.id === id)
}
