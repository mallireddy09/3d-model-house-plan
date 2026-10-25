import { useMemo } from 'react'
import { FLOOR_Y, WALL_HEIGHT, WALL_THICKNESS } from '../data/house'
import { useHouseStore } from '../store/useHouseStore'
import { FloorLabel } from './FloorLabel'
import type { FloorId, WallDef } from '../types'

const SILL = 3.05
const GLASS_TOP = 7.15
const DOOR_HEAD = 7.15

interface Part {
  key: string
  kind: 'solid' | 'sill' | 'header' | 'glass' | 'door'
  x0: number
  x1: number
  y0: number
  y1: number
}

function partsFor(length: number, height: number, wall: WallDef): Part[] {
  const openings = [...(wall.openings ?? [])].sort((a, b) => a.t - b.t)
  const parts: Part[] = []
  let cursor = 0
  openings.forEach((opening, index) => {
    const center = opening.t * length
    const start = Math.max(0, center - opening.width / 2)
    const end = Math.min(length, center + opening.width / 2)
    if (start > cursor + 0.04) {
      parts.push({ key: `${wall.id}-s-${index}`, kind: 'solid', x0: cursor, x1: start, y0: 0, y1: height })
    }
    if (opening.kind === 'window') {
      const sill = Math.min(SILL, height)
      const glassTop = Math.min(GLASS_TOP, height)
      if (sill > 0.05) parts.push({ key: `${wall.id}-sill-${index}`, kind: 'sill', x0: start, x1: end, y0: 0, y1: sill })
      if (glassTop > sill + 0.05) parts.push({ key: `${wall.id}-glass-${index}`, kind: 'glass', x0: start, x1: end, y0: sill, y1: glassTop })
      if (height > glassTop + 0.05) parts.push({ key: `${wall.id}-head-${index}`, kind: 'header', x0: start, x1: end, y0: glassTop, y1: height })
    } else if (opening.kind === 'door') {
      const head = Math.min(DOOR_HEAD, height)
      if (height > head + 0.08) parts.push({ key: `${wall.id}-dhead-${index}`, kind: 'header', x0: start, x1: end, y0: head, y1: height })
      parts.push({ key: `${wall.id}-door-${index}`, kind: 'door', x0: start, x1: end, y0: 0, y1: head })
    }
    cursor = Math.max(cursor, end)
  })
  if (cursor < length - 0.04) {
    parts.push({ key: `${wall.id}-end`, kind: 'solid', x0: cursor, x1: length, y0: 0, y1: height })
  }
  return parts
}

export function WallMesh({ wall, elevation }: { wall: WallDef; elevation: number }) {
  const height = wall.height ?? WALL_HEIGHT
  const dx = wall.b[0] - wall.a[0]
  const dz = wall.b[1] - wall.a[1]
  const length = Math.hypot(dx, dz)
  const rotation = Math.atan2(-dz, dx)
  const parts = useMemo(() => partsFor(length, height, wall), [length, height, wall])
  const plaster = '#f4efe6'
  return (
    <group position={[(wall.a[0] + wall.b[0]) / 2, elevation, (wall.a[1] + wall.b[1]) / 2]} rotation={[0, rotation, 0]}>
      {parts.map((part) => {
        const width = part.x1 - part.x0
        const partHeight = part.y1 - part.y0
        const x = (part.x0 + part.x1) / 2 - length / 2
        const y = (part.y0 + part.y1) / 2
        if (part.kind === 'door') {
          return (
            <group key={part.key} position={[part.x0 - length / 2, 0, 0]} rotation={[0, 0.5, 0]}>
              <mesh position={[width / 2, 3.45, 0.08]} castShadow>
                <boxGeometry args={[Math.max(width - 0.08, 0.2), Math.min(6.9, height - 0.2), 0.12]} />
                <meshStandardMaterial color={wall.id.endsWith('north') ? '#8a4b2a' : '#6e4328'} roughness={0.58} />
              </mesh>
            </group>
          )
        }
        if (part.kind === 'glass') {
          return (
            <group key={part.key}>
              <mesh position={[x, y, 0]}>
                <boxGeometry args={[width - 0.12, partHeight - 0.1, 0.06]} />
                <meshStandardMaterial color="#c5e0e8" transparent opacity={0.38} roughness={0.05} metalness={0.15} />
              </mesh>
              <mesh position={[x, y, 0]} castShadow>
                <boxGeometry args={[width, 0.1, 0.16]} />
                <meshStandardMaterial color="#f7f4ee" />
              </mesh>
            </group>
          )
        }
        return (
          <mesh key={part.key} position={[x, y, 0]} castShadow receiveShadow>
            <boxGeometry args={[width, partHeight, WALL_THICKNESS]} />
            <meshStandardMaterial color={part.kind === 'header' || part.kind === 'sill' ? '#efe8dc' : plaster} roughness={0.92} />
          </mesh>
        )
      })}
    </group>
  )
}

function Step({
  position,
  size,
}: {
  position: [number, number, number]
  size: [number, number, number]
}) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color="#d9c4a4" roughness={0.78} />
    </mesh>
  )
}

export function MainStair() {
  const rise = 11 / 16
  const tread = 0.8
  const flightOne = Array.from({ length: 8 }, (_, index) => ({
    x: -18.6,
    y: rise * index + rise / 2,
    z: 9.6 - tread * index - tread / 2,
  }))
  const flightTwo = Array.from({ length: 8 }, (_, index) => ({
    x: -14.8 + tread * index + tread / 2,
    y: 5.5 + rise * index + rise / 2,
    z: 1.9,
  }))
  return (
    <group>
      {flightOne.map((step) => (
        <Step key={`a${step.z}`} position={[step.x, step.y, step.z]} size={[3.2, rise, tread]} />
      ))}
      <mesh position={[-17.5, 5.39, 1.9]} castShadow receiveShadow>
        <boxGeometry args={[5.4, 0.22, 2.6]} />
        <meshStandardMaterial color="#cbb89a" roughness={0.8} />
      </mesh>
      {flightTwo.map((step) => (
        <Step key={`b${step.x}`} position={[step.x, step.y, step.z]} size={[tread, rise, 2.6]} />
      ))}
    </group>
  )
}

export function BasementStair() {
  const rise = 11 / 12
  const tread = 9 / 11
  return (
    <group>
      {Array.from({ length: 11 }, (_, index) => {
        const top = -(index + 1) * rise
        return (
          <Step
            key={index}
            position={[-3, top - rise / 2, -16.2 - index * tread - tread / 2]}
            size={[3.2, rise, tread]}
          />
        )
      })}
    </group>
  )
}

export function HoleRail({ elevation }: { elevation: number }) {
  const rails = [
    { position: [-3, 1.6, -25.3] as [number, number, number], args: [3.6, 3.2, 0.12] as [number, number, number] },
    { position: [-4.75, 1.6, -20.7] as [number, number, number], args: [0.12, 3.2, 8.6] as [number, number, number] },
    { position: [-1.25, 1.6, -20.7] as [number, number, number], args: [0.12, 3.2, 8.6] as [number, number, number] },
  ]
  return (
    <group position={[0, elevation, 0]}>
      {rails.map((rail) => (
        <mesh key={rail.position.join(',')} position={rail.position} castShadow>
          <boxGeometry args={rail.args} />
          <meshStandardMaterial color="#efe8dc" transparent opacity={0.55} />
        </mesh>
      ))}
    </group>
  )
}

export function Balcony({ elevation }: { elevation: number }) {
  return (
    <group position={[0, elevation, 0]}>
      <mesh position={[0, 0.08, -29.6]} receiveShadow>
        <boxGeometry args={[32, 0.16, 5.2]} />
        <meshStandardMaterial color="#e4d5bf" roughness={0.86} />
      </mesh>
      {[
        { position: [0, 1.6, -32.2] as [number, number, number], args: [32, 3.2, 0.1] as [number, number, number] },
        { position: [-16, 1.6, -29.6] as [number, number, number], args: [0.1, 3.2, 5.2] as [number, number, number] },
        { position: [16, 1.6, -29.6] as [number, number, number], args: [0.1, 3.2, 5.2] as [number, number, number] },
      ].map((panel) => (
        <mesh key={panel.position.join(',')} position={panel.position}>
          <boxGeometry args={panel.args} />
          <meshStandardMaterial color="#d5e7ee" transparent opacity={0.35} roughness={0.05} />
        </mesh>
      ))}
    </group>
  )
}

export function EntranceSteps() {
  return (
    <group>
      {[0, 1, 2].map((index) => (
        <mesh key={index} position={[10, 0.1 + index * 0.16, -28.2 - index * 0.55]} receiveShadow castShadow>
          <boxGeometry args={[5.4, 0.16, 0.55]} />
          <meshStandardMaterial color="#d9cbb6" />
        </mesh>
      ))}
    </group>
  )
}

export function Compound() {
  const y = 0
  const segments: { position: [number, number, number]; args: [number, number, number] }[] = [
    { position: [-12.5, 1.3, -40], args: [39, 2.6, 0.4] },
    { position: [22.5, 1.3, -40], args: [19, 2.6, 0.4] },
    { position: [32, 1.3, -3], args: [0.4, 2.6, 74] },
    { position: [-32, 1.3, -3], args: [0.4, 2.6, 74] },
    { position: [0, 1.3, 34], args: [64.4, 2.6, 0.4] },
  ]
  return (
    <group position={[0, y, 0]}>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.08, -2]}
        receiveShadow
        onClick={(event) => {
          event.stopPropagation()
          useHouseStore.getState().select(null)
        }}
      >
        <circleGeometry args={[68, 56]} />
        <meshStandardMaterial color="#b7c6a2" roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[10, -0.04, -33.5]} receiveShadow>
        <planeGeometry args={[4.2, 14]} />
        <meshStandardMaterial color="#d7cbb8" />
      </mesh>
      {segments.map((segment) => (
        <mesh key={segment.position.join(',')} position={segment.position} castShadow receiveShadow>
          <boxGeometry args={segment.args} />
          <meshStandardMaterial color="#efe6d6" roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[7.2, 1.5, -40]} castShadow>
        <boxGeometry args={[0.45, 3.1, 0.45]} />
        <meshStandardMaterial color="#6b4226" />
      </mesh>
      <mesh position={[12.8, 1.5, -40]} castShadow>
        <boxGeometry args={[0.45, 3.1, 0.45]} />
        <meshStandardMaterial color="#6b4226" />
      </mesh>
      <group position={[17.2, 0, -33.2]}>
        <mesh position={[0, 0.4, 0]} castShadow>
          <cylinderGeometry args={[0.7, 0.85, 0.8, 14]} />
          <meshStandardMaterial color="#b85a3a" />
        </mesh>
        <mesh position={[0, 1.25, 0]} castShadow>
          <sphereGeometry args={[0.58, 16, 14]} />
          <meshStandardMaterial color="#3d7a48" roughness={0.85} />
        </mesh>
      </group>
    </group>
  )
}

export function Slab({ floor }: { floor: FloorId }) {
  const y = FLOOR_Y[floor]
  if (floor === 'basement') {
    return (
      <mesh position={[7, y - 0.16, -9]} receiveShadow>
        <boxGeometry args={[28.4, 0.32, 36.4]} />
        <meshStandardMaterial color="#2c2824" roughness={0.95} />
      </mesh>
    )
  }
  return (
    <mesh position={[0, y - 0.16, 0]} receiveShadow>
      <boxGeometry args={[42.6, 0.32, 54.6]} />
      <meshStandardMaterial color="#cfc4b2" roughness={0.9} />
    </mesh>
  )
}

export function BrahmasthanInlay({ elevation }: { elevation: number }) {
  return (
    <group position={[0, elevation + 0.045, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.15, 2.4, 64]} />
        <meshStandardMaterial color="#c6a15b" roughness={0.45} metalness={0.15} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3.3, 3.42, 64]} />
        <meshStandardMaterial color="#b08968" />
      </mesh>
    </group>
  )
}

export function NorthMark({ elevation }: { elevation: number }) {
  return (
    <group position={[0, elevation + 0.12, -36]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} castShadow>
        <coneGeometry args={[0.7, 2.1, 3]} />
        <meshStandardMaterial color="#9c3b32" />
      </mesh>
      <FloorLabel text="North" color="#6d2f2a" width={3.4} position={[0, 1.4, -1.8]} />
    </group>
  )
}

export function GroundDisc({ color }: { color: string }) {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -0.12, -2]}
      receiveShadow
      onClick={(event) => {
        event.stopPropagation()
        useHouseStore.getState().select(null)
      }}
    >
      <circleGeometry args={[72, 48]} />
      <meshStandardMaterial color={color} roughness={1} />
    </mesh>
  )
}

export function StairHallRail() {
  return (
    <mesh position={[-7.15, 1.55, 4]} castShadow>
      <boxGeometry args={[0.12, 3.1, 14]} />
      <meshStandardMaterial color="#f7f3ea" transparent opacity={0.45} />
    </mesh>
  )
}
