export type FloorId = 'basement' | 'ground' | 'first'

export type Zone = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW' | 'C'

export type Direction = 'N' | 'E' | 'S' | 'W'

export type FurnitureType =
  | 'sofa'
  | 'table'
  | 'tv'
  | 'dining'
  | 'bed'
  | 'wardrobe'
  | 'pooja'
  | 'kitchen'
  | 'stove'
  | 'toilet'
  | 'vanity'
  | 'study'
  | 'theater'
  | 'screen'
  | 'storage'

export interface FacingRule {
  mode: 'front' | 'head'
  ideal: readonly Direction[]
  acceptable?: readonly Direction[]
  advice: string
}

export interface ItemRules {
  bad: readonly Zone[]
  /** Heavy or sacred pieces take a stronger penalty in a wrong zone. */
  weight: 'heavy' | 'light'
  zoneAdvice: string
  facing?: FacingRule
}

export interface FurnitureItem {
  id: string
  type: FurnitureType
  name: string
  floor: FloorId
  /** Feet. +X is east, -Z is north. */
  x: number
  z: number
  /** Radians around Y. Local +Z is the front; a bed's head is local -Z. */
  rotation: number
  width: number
  depth: number
  height: number
  color?: string
  rules: ItemRules
}

export interface Rect {
  x0: number
  x1: number
  z0: number
  z1: number
}

export interface Room {
  id: string
  name: string
  floor: FloorId
  rects: Rect[]
  color: string
  note: string
  label?: { x: number; z: number }
}

export interface Opening {
  kind: 'door' | 'window' | 'opening'
  /** 0–1 along the wall from a to b. */
  t: number
  width: number
}

export interface WallDef {
  id: string
  floor: FloorId
  a: [number, number]
  b: [number, number]
  height?: number
  openings?: Opening[]
}

export interface SwitchBoard {
  id: string
  label: string
  x: number
  y: number
  z: number
}

export interface Conduit {
  id: string
  kind: 'main' | 'branch'
  points: [number, number, number][]
}

export interface FloorWiring {
  floor: FloorId
  mcb: { x: number; y: number; z: number; label: string }
  conduits: Conduit[]
  boards: SwitchBoard[]
}
