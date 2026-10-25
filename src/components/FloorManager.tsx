import { Grid } from '@react-three/drei'
import { FloorLabel } from './FloorLabel'
import {
  Balcony,
  BasementStair,
  BrahmasthanInlay,
  Compound,
  EntranceSteps,
  GroundDisc,
  HoleRail,
  MainStair,
  NorthMark,
  Slab,
  StairHallRail,
  WallMesh,
} from './architecture'
import { FLOOR_Y, ROOMS, WALLS } from '../data/house'
import { useHouseStore } from '../store/useHouseStore'
import type { FloorId, Room } from '../types'

const ZONES = [
  { id: 'NW', x0: -21, x1: -7, z0: -27, z1: -9, tint: '#7ea0b8', label: 'NW' },
  { id: 'N', x0: -7, x1: 7, z0: -27, z1: -9, tint: '#8fb59a', label: 'N' },
  { id: 'NE', x0: 7, x1: 21, z0: -27, z1: -9, tint: '#e6c56e', label: 'NE' },
  { id: 'W', x0: -21, x1: -7, z0: -9, z1: 9, tint: '#d9c7ae', label: 'W' },
  { id: 'C', x0: -7, x1: 7, z0: -9, z1: 9, tint: '#f7f4ee', label: 'Centre' },
  { id: 'E', x0: 7, x1: 21, z0: -9, z1: 9, tint: '#efd7a4', label: 'E' },
  { id: 'SW', x0: -21, x1: -7, z0: 9, z1: 27, tint: '#e09a86', label: 'SW' },
  { id: 'S', x0: -7, x1: 7, z0: 9, z1: 27, tint: '#e2b19a', label: 'S' },
  { id: 'SE', x0: 7, x1: 21, z0: 9, z1: 27, tint: '#e8a15a', label: 'SE' },
] as const

function intersect(zone: (typeof ZONES)[number], bounds: { x0: number; x1: number; z0: number; z1: number }) {
  const x0 = Math.max(zone.x0, bounds.x0)
  const x1 = Math.min(zone.x1, bounds.x1)
  const z0 = Math.max(zone.z0, bounds.z0)
  const z1 = Math.min(zone.z1, bounds.z1)
  if (x1 - x0 < 0.4 || z1 - z0 < 0.4) return null
  return { x0, x1, z0, z1 }
}

function RoomFloors({ room, elevation }: { room: Room; elevation: number }) {
  const highlighted = useHouseStore((state) => state.highlightedRoom === room.id)
  const focusRoom = useHouseStore((state) => state.focusRoom)
  const anchor = room.label ?? {
    x: (room.rects[0].x0 + room.rects[0].x1) / 2,
    z: (room.rects[0].z0 + room.rects[0].z1) / 2,
  }
  return (
    <group>
      {room.rects.map((rect) => {
        const width = rect.x1 - rect.x0 - 0.28
        const depth = rect.z1 - rect.z0 - 0.28
        if (width < 0.4 || depth < 0.4) return null
        return (
          <mesh
            key={`${rect.x0}${rect.z0}`}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[(rect.x0 + rect.x1) / 2, elevation + 0.03, (rect.z0 + rect.z1) / 2]}
            receiveShadow
            onClick={(event) => {
              event.stopPropagation()
              focusRoom(room.id)
            }}
          >
            <planeGeometry args={[width, depth]} />
            <meshStandardMaterial color={highlighted ? '#f3d48a' : room.color} roughness={0.9} />
          </mesh>
        )
      })}
      <FloorLabel text={room.name} position={[anchor.x, elevation + 0.35, anchor.z]} />
    </group>
  )
}

function ZoneOverlay({ floor, elevation }: { floor: FloorId; elevation: number }) {
  const bounds = floor === 'basement' ? { x0: -7, x1: 21, z0: -27, z1: 9 } : { x0: -21, x1: 21, z0: -27, z1: 27 }
  return (
    <group>
      {ZONES.map((zone) => {
        const rect = intersect(zone, bounds)
        if (!rect) return null
        return (
          <group key={zone.id}>
            <mesh
              rotation={[-Math.PI / 2, 0, 0]}
              position={[(rect.x0 + rect.x1) / 2, elevation + 0.05, (rect.z0 + rect.z1) / 2]}
              raycast={() => null}
            >
              <planeGeometry args={[rect.x1 - rect.x0, rect.z1 - rect.z0]} />
              <meshBasicMaterial color={zone.tint} transparent opacity={0.34} depthWrite={false} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

export function FloorManager() {
  const floor = useHouseStore((state) => state.floor)
  const blueprint = useHouseStore((state) => state.blueprint)
  const showZones = useHouseStore((state) => state.showZones)
  const elevation = FLOOR_Y[floor]
  const rooms = ROOMS.filter((room) => room.floor === floor)
  const walls = WALLS.filter((wall) => wall.floor === floor)

  return (
    <group>
      {floor === 'basement' ? (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[7, elevation - 0.4, -9]}
          receiveShadow
          onClick={(event) => {
            event.stopPropagation()
            useHouseStore.getState().select(null)
          }}
        >
          <circleGeometry args={[40, 40]} />
          <meshStandardMaterial color="#6d5c49" roughness={1} />
        </mesh>
      ) : floor === 'ground' ? (
        <Compound />
      ) : (
        <GroundDisc color="#c5d0b8" />
      )}
      <Slab floor={floor} />
      {rooms.map((room) => (
        <RoomFloors key={room.id} room={room} elevation={elevation} />
      ))}
      {showZones && <ZoneOverlay floor={floor} elevation={elevation} />}
      {floor !== 'basement' && <BrahmasthanInlay elevation={elevation} />}
      {walls.map((wall) => (
        <WallMesh key={wall.id} wall={wall} elevation={elevation} />
      ))}
      {floor !== 'basement' && <MainStair />}
      {floor !== 'basement' && <StairHallRail />}
      {floor !== 'first' && <BasementStair />}
      {floor === 'ground' && <HoleRail elevation={elevation} />}
      {floor === 'ground' && <EntranceSteps />}
      {floor === 'first' && <Balcony elevation={elevation} />}
      <NorthMark elevation={elevation} />
      <Grid
        position={[0, elevation + (blueprint ? 0.08 : -0.02), 0]}
        args={[90, 90]}
        cellSize={1}
        cellThickness={0.55}
        cellColor={blueprint ? '#7d8da4' : '#cfc6b8'}
        sectionSize={7}
        sectionThickness={1.05}
        sectionColor={blueprint ? '#3e4c63' : '#b6aa98'}
        fadeDistance={96}
        fadeStrength={1.5}
        infiniteGrid
        raycast={() => null}
      />
    </group>
  )
}
