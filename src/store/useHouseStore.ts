import { create } from 'zustand'
import {
  FLOOR_Y,
  ROOMS,
  WIRING,
  clampPlacement,
  cloneFurniture,
  defaultPose,
  roomAnchor,
  snap,
} from '../data/house'
import { PRINCIPLES, evaluateLayout, zoneOf } from '../lib/vastu'
import type { FloorId, FurnitureItem } from '../types'

const STORAGE_KEY = 'vastu-griha-layout-v1'

export type TransformMode = 'translate' | 'rotate'

interface FocusPoint {
  x: number
  z: number
}

interface SavedPose {
  id: string
  x: number
  z: number
  rotation: number
}

function hydrate(): FurnitureItem[] {
  const base = cloneFurniture()
  if (typeof window === 'undefined') return base
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return base
    const saved = JSON.parse(raw) as SavedPose[]
    if (!Array.isArray(saved)) return base
    const byId = new Map(saved.map((pose) => [pose.id, pose]))
    return base.map((item) => {
      const pose = byId.get(item.id)
      if (!pose || !Number.isFinite(pose.x) || !Number.isFinite(pose.z) || !Number.isFinite(pose.rotation)) return item
      const clamped = clampPlacement(item.floor, pose.x, pose.z)
      return { ...item, x: clamped.x, z: clamped.z, rotation: pose.rotation }
    })
  } catch {
    return base
  }
}

function persist(items: FurnitureItem[]) {
  if (typeof window === 'undefined') return
  try {
    const poses: SavedPose[] = items.map((item) => ({
      id: item.id,
      x: item.x,
      z: item.z,
      rotation: item.rotation,
    }))
    localStorage.setItem(STORAGE_KEY, JSON.stringify(poses))
  } catch {
    // Private mode and full storage can reject the write. The in-memory plan still works.
  }
}

interface HouseState {
  floor: FloorId
  wiring: boolean
  blueprint: boolean
  showZones: boolean
  selectedId: string | null
  highlightedRoom: string | null
  transformMode: TransformMode
  focus: FocusPoint
  focusNonce: number
  furniture: FurnitureItem[]
  setFloor: (floor: FloorId) => void
  select: (id: string | null) => void
  toggleWiring: () => void
  toggleBlueprint: () => void
  toggleZones: () => void
  setTransformMode: (mode: TransformMode) => void
  focusRoom: (roomId: string) => void
  moveFurniture: (id: string, x: number, z: number) => void
  placeFurniture: (id: string, x: number, z: number) => void
  nudge: (id: string, dx: number, dz: number) => void
  rotateBy: (id: string, degrees: number) => void
  setRotation: (id: string, radians: number) => void
  snapFurniture: (id: string) => void
  resetItem: (id: string) => void
  resetLayout: () => void
}

function replaceItem(items: FurnitureItem[], id: string, update: (item: FurnitureItem) => FurnitureItem) {
  return items.map((item) => (item.id === id ? update(item) : item))
}

export const useHouseStore = create<HouseState>((set, get) => ({
  floor: 'ground',
  wiring: false,
  blueprint: false,
  showZones: true,
  selectedId: null,
  highlightedRoom: null,
  transformMode: 'translate',
  focus: { x: 0, z: -2 },
  focusNonce: 0,
  furniture: hydrate(),

  setFloor: (floor) =>
    set((state) => {
      const selected = state.furniture.find((item) => item.id === state.selectedId)
      return {
        floor,
        selectedId: selected && selected.floor === floor ? selected.id : null,
        highlightedRoom: null,
        focus: { x: 0, z: floor === 'basement' ? -9 : -2 },
        focusNonce: state.focusNonce + 1,
      }
    }),

  select: (id) => {
    const item = get().furniture.find((entry) => entry.id === id)
    set((state) => ({
      selectedId: id,
      floor: item ? item.floor : state.floor,
      focusNonce: item && item.floor !== state.floor ? state.focusNonce + 1 : state.focusNonce,
      focus: item && item.floor !== state.floor ? { x: item.x, z: item.z } : state.focus,
    }))
  },

  toggleWiring: () => set((state) => ({ wiring: !state.wiring })),
  toggleBlueprint: () => set((state) => ({ blueprint: !state.blueprint, focusNonce: state.focusNonce + 1 })),
  toggleZones: () => set((state) => ({ showZones: !state.showZones })),
  setTransformMode: (mode) => set({ transformMode: mode }),

  focusRoom: (roomId) => {
    const found = ROOMS.find((room) => room.id === roomId)
    if (!found) return
    const anchor = roomAnchor(found)
    set((state) => ({
      floor: found.floor,
      highlightedRoom: roomId,
      focus: anchor,
      focusNonce: state.focusNonce + 1,
      selectedId: state.furniture.find((item) => item.id === state.selectedId)?.floor === found.floor ? state.selectedId : null,
    }))
  },

  moveFurniture: (id, x, z) =>
    set((state) => ({
      furniture: replaceItem(state.furniture, id, (item) => {
        const next = clampPlacement(item.floor, x, z)
        return { ...item, x: next.x, z: next.z }
      }),
    })),

  placeFurniture: (id, x, z) =>
    set((state) => ({
      furniture: replaceItem(state.furniture, id, (item) => {
        const next = clampPlacement(item.floor, snap(x), snap(z))
        return { ...item, x: next.x, z: next.z }
      }),
    })),

  nudge: (id, dx, dz) => {
    const item = get().furniture.find((entry) => entry.id === id)
    if (!item) return
    get().placeFurniture(id, item.x + dx, item.z + dz)
  },

  rotateBy: (id, degrees) =>
    set((state) => ({
      furniture: replaceItem(state.furniture, id, (item) => ({
        ...item,
        rotation: item.rotation + (degrees * Math.PI) / 180,
      })),
    })),

  setRotation: (id, radians) =>
    set((state) => ({
      furniture: replaceItem(state.furniture, id, (item) => ({ ...item, rotation: radians })),
    })),

  snapFurniture: (id) => {
    const item = get().furniture.find((entry) => entry.id === id)
    if (!item) return
    get().placeFurniture(id, item.x, item.z)
  },

  resetItem: (id) => {
    const fresh = defaultPose(id)
    if (!fresh) return
    set((state) => ({
      furniture: replaceItem(state.furniture, id, (item) => ({
        ...item,
        x: fresh.x,
        z: fresh.z,
        rotation: fresh.rotation,
      })),
    }))
  },

  resetLayout: () =>
    set((state) => ({
      furniture: cloneFurniture(),
      selectedId: null,
      highlightedRoom: null,
      focusNonce: state.focusNonce + 1,
    })),
}))

if (typeof window !== 'undefined') {
  useHouseStore.subscribe((state, previous) => {
    if (state.furniture !== previous.furniture) persist(state.furniture)
  })
  if (import.meta.env.DEV) {
    Object.assign(window, { __vastu: useHouseStore })
  }
}

export function buildBlueprint() {
  const state = useHouseStore.getState()
  const report = evaluateLayout(state.furniture)
  const round = (value: number) => Math.round(value * 100) / 100
  return {
    name: 'Vastu Griha',
    units: 'feet',
    axes: { east: '+X', north: '-Z', up: '+Y' },
    exportedAt: new Date().toISOString(),
    activeFloor: state.floor,
    floorElevations: FLOOR_Y,
    compliance: {
      score: report.score,
      issues: report.issues,
    },
    principles: PRINCIPLES,
    rooms: ROOMS.map((room) => ({
      id: room.id,
      name: room.name,
      floor: room.floor,
      rects: room.rects,
      note: room.note,
    })),
    furniture: state.furniture.map((item) => ({
      id: item.id,
      name: item.name,
      type: item.type,
      floor: item.floor,
      x: round(item.x),
      z: round(item.z),
      y: FLOOR_Y[item.floor],
      rotationDeg: round((item.rotation * 180) / Math.PI),
      width: item.width,
      depth: item.depth,
      height: item.height,
      zone: zoneOf(item.x, item.z),
    })),
    wiring: WIRING.map((layer) => ({
      floor: layer.floor,
      mcb: layer.mcb,
      boards: layer.boards,
      conduits: layer.conduits,
    })),
  }
}

export function downloadBlueprint() {
  const payload = buildBlueprint()
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'vastu-griha-blueprint.json'
  link.click()
  URL.revokeObjectURL(url)
}
