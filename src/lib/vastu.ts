import type { Direction, FurnitureItem, ItemRules, Zone } from '../types'

export const HOUSE = { minX: -21, maxX: 21, minZ: -27, maxZ: 27 }
export const BASEMENT = { minX: -7, maxX: 21, minZ: -27, maxZ: 9 }

export const ZONE_NAME: Record<Zone | 'out', string> = {
  N: 'north',
  NE: 'north-east',
  E: 'east',
  SE: 'south-east',
  S: 'south',
  SW: 'south-west',
  W: 'west',
  NW: 'north-west',
  C: 'brahmasthan',
  out: 'outside the plan',
}

export const DIR_NAME: Record<Direction, string> = {
  N: 'north',
  E: 'east',
  S: 'south',
  W: 'west',
}

export const PENALTY = { high: 12, medium: 6, low: 3 } as const

export interface VastuIssue {
  id: string
  itemId: string
  floor: FurnitureItem['floor']
  severity: 'high' | 'medium' | 'low'
  kind: 'zone' | 'facing' | 'center'
  title: string
  detail: string
  recommendation: string
}

export interface VastuReport {
  score: number
  issues: VastuIssue[]
}

const facing = (
  mode: 'front' | 'head',
  ideal: Direction[],
  advice: string,
  acceptable?: Direction[],
): ItemRules['facing'] => ({ mode, ideal, acceptable, advice })

export const RULES = {
  masterBed: {
    bad: ['NE', 'N', 'NW', 'C', 'SE', 'E'],
    weight: 'heavy',
    zoneAdvice:
      'Keep the master bed in the south-west. A heavy bed in the north-east weighs down the light corner.',
    facing: facing('head', ['S', 'E'], 'Point the head of the bed toward the south or the east.'),
  },
  guestBed: {
    bad: ['NE', 'C', 'SE'],
    weight: 'heavy',
    zoneAdvice:
      'Guest and children sleep well in the north-west or west. Keep beds out of the north-east and the centre.',
    facing: facing('head', ['S', 'E'], 'Point the head of the bed toward the south or the east.'),
  },
  wardrobe: {
    bad: ['NE', 'N', 'E', 'C'],
    weight: 'heavy',
    zoneAdvice: 'Tall storage belongs in the south-west or west. Leave the north-east empty and light.',
  },
  pooja: {
    bad: ['S', 'SW', 'SE', 'W', 'C'],
    weight: 'heavy',
    zoneAdvice: 'Keep the mandir in the north-east. Avoid the south, the kitchen corner, and the centre.',
    facing: facing(
      'front',
      ['W', 'E'],
      'Let the person praying face east, with the shrine front toward the west, or keep the unit on the east wall.',
    ),
  },
  kitchen: {
    bad: ['NE', 'N', 'NW', 'W', 'SW', 'C'],
    weight: 'heavy',
    zoneAdvice: 'The kitchen belongs in the south-east, the Agni corner. Do not cook in the north-east.',
  },
  stove: {
    bad: ['NE', 'N', 'NW', 'W', 'SW', 'C', 'E'],
    weight: 'heavy',
    zoneAdvice: 'Place the stove in the south-east. The north-east and the centre are the wrong places for fire.',
    facing: facing(
      'front',
      ['E'],
      'Cook facing east. North is acceptable; west and south are best avoided.',
      ['N'],
    ),
  },
  wet: {
    bad: ['NE', 'N', 'E', 'SE', 'S', 'C'],
    weight: 'heavy',
    zoneAdvice:
      'Toilets and wash basins belong in the north-west or west. A toilet in the north-east or the centre is a serious conflict.',
  },
  sofa: {
    bad: ['C', 'NE', 'SE'],
    weight: 'light',
    zoneAdvice: 'Seat people in the north, east, or west. Keep the centre open and the north-east uncluttered.',
    facing: facing('front', ['E', 'N'], 'Seat people so they face east or north.', ['S']),
  },
  table: {
    bad: ['C'],
    weight: 'light',
    zoneAdvice: 'Move this table out of the brahmasthan so the centre stays open.',
  },
  tv: {
    bad: ['NE', 'C'],
    weight: 'light',
    zoneAdvice: 'Keep the television out of the north-east and the centre. A south-east wall is the usual place.',
  },
  dining: {
    bad: ['NE', 'C'],
    weight: 'light',
    zoneAdvice: 'Place the dining table in the west or east, clear of the north-east and the centre.',
  },
  study: {
    bad: ['C', 'SW', 'SE'],
    weight: 'light',
    zoneAdvice: 'Study in the north-east or north. Avoid the centre and the south-west sleeping zone.',
    facing: facing('front', ['E', 'N'], 'Face east while studying. North is also favourable.'),
  },
  theater: {
    bad: ['SW', 'C'],
    weight: 'light',
    zoneAdvice: 'A home theatre fits the lighter north or east of the basement, not a heavy corner.',
  },
  screen: {
    bad: ['SW', 'C'],
    weight: 'light',
    zoneAdvice: 'Keep the screen out of the centre.',
  },
  storage: {
    bad: ['SW', 'C', 'NE'],
    weight: 'heavy',
    zoneAdvice: 'Store everyday goods in the east or north. Do not stack heavy storage in the north-east.',
  },
} as const satisfies Record<string, ItemRules>

export function zoneOf(x: number, z: number): Zone | 'out' {
  if (x >= -16 && x <= 16 && z < HOUSE.minZ && z >= -33) return 'N'
  if (x < HOUSE.minX || x > HOUSE.maxX || z < HOUSE.minZ || z > HOUSE.maxZ) return 'out'
  const col = x < -7 ? 'W' : x > 7 ? 'E' : ''
  const row = z < -9 ? 'N' : z > 9 ? 'S' : ''
  const key = `${row}${col}`
  return (key || 'C') as Zone
}

/** Local +Z is the front. A bed's head is the opposite direction. */
export function directionFromRotation(rotation: number, mode: 'front' | 'head'): Direction {
  let x = Math.sin(rotation)
  let z = Math.cos(rotation)
  if (mode === 'head') {
    x = -x
    z = -z
  }
  if (Math.abs(x) > Math.abs(z)) return x > 0 ? 'E' : 'W'
  return z > 0 ? 'S' : 'N'
}

export function describeOrientation(item: FurnitureItem): string | null {
  if (!item.rules.facing) return null
  const dir = directionFromRotation(item.rotation, item.rules.facing.mode)
  const verb = item.rules.facing.mode === 'head' ? 'Head toward' : 'Faces'
  return `${verb} ${DIR_NAME[dir]}`
}

function placeName(zone: Zone | 'out'): string {
  if (zone === 'C') return 'the brahmasthan'
  if (zone === 'out') return 'outside the plan'
  return `the ${ZONE_NAME[zone]}`
}

export function evaluateLayout(items: FurnitureItem[]): VastuReport {
  const issues: VastuIssue[] = []

  for (const item of items) {
    const zone = zoneOf(item.x, item.z)
    const heavy = item.rules.weight === 'heavy'

    if (zone === 'out' || zone === 'C' || item.rules.bad.includes(zone)) {
      const kind = zone === 'C' ? 'center' : 'zone'
      const severity = zone === 'out' || heavy ? 'high' : 'medium'
      issues.push({
        id: `${item.id}:${kind}`,
        itemId: item.id,
        floor: item.floor,
        severity,
        kind,
        title: `${item.name} is in ${placeName(zone)}`,
        detail:
          zone === 'C'
            ? 'The centre of the plan should stay open so movement and light can cross the house.'
            : zone === 'out'
              ? 'The piece has left the floor plate for this level.'
              : `${item.name} is sitting in ${placeName(zone)}, which this layout treats as the wrong zone for it.`,
        recommendation: item.rules.zoneAdvice,
      })
    }

    if (item.rules.facing) {
      const dir = directionFromRotation(item.rotation, item.rules.facing.mode)
      if (!item.rules.facing.ideal.includes(dir)) {
        const acceptable = item.rules.facing.acceptable?.includes(dir) ?? false
        const verb = item.rules.facing.mode === 'head' ? 'head points' : 'front faces'
        issues.push({
          id: `${item.id}:facing`,
          itemId: item.id,
          floor: item.floor,
          severity: acceptable ? 'low' : 'medium',
          kind: 'facing',
          title: `${item.name} ${verb} ${DIR_NAME[dir]}`,
          detail: `The current orientation is ${DIR_NAME[dir]}.`,
          recommendation: item.rules.facing.advice,
        })
      }
    }
  }

  const rank = { high: 0, medium: 1, low: 2 }
  issues.sort((a, b) => rank[a.severity] - rank[b.severity] || a.title.localeCompare(b.title))

  const score = Math.max(0, items.length === 0 ? 100 : 100 - issues.reduce((sum, issue) => sum + PENALTY[issue.severity], 0))
  return { score, issues }
}

export function issuesForItem(report: VastuReport, id: string): VastuIssue[] {
  return report.issues.filter((issue) => issue.itemId === id)
}

export interface Principle {
  id: string
  title: string
  detail: string
}

export const PRINCIPLES: Principle[] = [
  {
    id: 'entrance',
    title: 'North entrance',
    detail: 'The main door is on the north wall, east of centre, and clear of the extreme north-east corner.',
  },
  {
    id: 'pooja',
    title: 'Pooja in the north-east',
    detail: 'The prayer room sits in the sacred corner, with the centre left open.',
  },
  {
    id: 'kitchen',
    title: 'Kitchen in Agni',
    detail: 'Cooking is in the south-east. The stove sits on the east side so the cook faces east.',
  },
  {
    id: 'master',
    title: 'Master bedroom south-west',
    detail: 'The heaviest bedroom anchors the south-west, with the bed head to the south.',
  },
  {
    id: 'guest',
    title: 'Guest room and bath, north-west',
    detail: 'The guest room and the toilet occupy the north-west and west, away from the kitchen and the shrine.',
  },
  {
    id: 'center',
    title: 'Open brahmasthan',
    detail: 'No walls cross the centre. Heavy furniture should stay out of it.',
  },
  {
    id: 'stair',
    title: 'Clockwise west stair',
    detail: 'The stair climbs in the west and south-west and turns to the right as you go up.',
  },
  {
    id: 'basement',
    title: 'Basement under north and east',
    detail: 'The lower level stays under the lighter footprint and does not extend into the south-west.',
  },
  {
    id: 'mcb',
    title: 'Distribution board in the south-east',
    detail: 'The main MCB is on the ground floor in the Agni zone, with mains along the north and east walls.',
  },
]
