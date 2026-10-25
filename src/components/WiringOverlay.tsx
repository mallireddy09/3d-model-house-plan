import { useMemo, useRef } from 'react'
import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { WIRING } from '../data/house'
import { useHouseStore } from '../store/useHouseStore'

function GlowMaterial({ color, speed = 3 }: { color: string; speed?: number }) {
  const ref = useRef<THREE.MeshStandardMaterial>(null)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.emissiveIntensity = 1.35 + Math.sin(clock.elapsedTime * speed) * 0.45
  })
  return <meshStandardMaterial ref={ref} color={color} emissive={color} roughness={0.32} toneMapped={false} />
}

function Conduit({ points, radius, color }: { points: [number, number, number][]; radius: number; color: string }) {
  const geometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(
      points.map((point) => new THREE.Vector3(point[0], point[1], point[2])),
      false,
      'catmullrom',
      0.12,
    )
    return new THREE.TubeGeometry(curve, Math.max(24, points.length * 12), radius, 6, false)
  }, [points, radius])

  return (
    <mesh geometry={geometry}>
      <GlowMaterial color={color} />
    </mesh>
  )
}

export function WiringOverlay() {
  const enabled = useHouseStore((state) => state.wiring)
  const floor = useHouseStore((state) => state.floor)
  const layer = WIRING.find((entry) => entry.floor === floor)
  if (!enabled || !layer) return null

  return (
    <group>
      {layer.conduits.map((conduit) => (
        <Conduit
          key={conduit.id}
          points={conduit.points}
          radius={conduit.kind === 'main' ? 0.07 : 0.04}
          color={conduit.kind === 'main' ? '#ffb15a' : '#8dffe0'}
        />
      ))}
      <group position={[layer.mcb.x, layer.mcb.y, layer.mcb.z]}>
        <mesh castShadow>
          <boxGeometry args={[0.28, 1.7, 1.15]} />
          <meshStandardMaterial color="#221910" roughness={0.55} />
        </mesh>
        <mesh position={[0.16, 0.15, 0]}>
          <boxGeometry args={[0.04, 1.2, 0.8]} />
          <GlowMaterial color="#ff9a3c" speed={4} />
        </mesh>
        <pointLight color="#ffb15a" intensity={6} distance={9} />
        <Html position={[0, 1.25, 0]} center zIndexRange={[11, 0]} style={{ pointerEvents: 'none' }}>
          <div className="whitespace-nowrap rounded-md bg-amber-100/95 px-1.5 py-0.5 text-[10px] font-semibold text-amber-950">
            {layer.mcb.label}
          </div>
        </Html>
      </group>
      {layer.boards.map((board) => (
        <group key={board.id} position={[board.x, board.y, board.z]}>
          <mesh>
            <boxGeometry args={[0.12, 0.55, 0.4]} />
            <meshStandardMaterial color="#1b140f" />
          </mesh>
          <mesh position={[0.07, 0, 0]}>
            <boxGeometry args={[0.02, 0.28, 0.22]} />
            <GlowMaterial color="#ffe1a8" speed={2} />
          </mesh>
        </group>
      ))}
    </group>
  )
}
