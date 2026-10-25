import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { TransformControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { FLOOR_Y } from '../data/house'
import { useHouseStore } from '../store/useHouseStore'
import type { FurnitureItem } from '../types'
import { FurnitureBody } from './furnitureModels'
import { dragState } from './dragState'

const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
const hitPoint = new THREE.Vector3()

function orbitControls(): { enabled: boolean } | null {
  const controls = (window as unknown as { __vastuControls?: { enabled: boolean } }).__vastuControls
  return controls ?? null
}

export function registerOrbit(controls: { enabled: boolean } | null) {
  ;(window as unknown as { __vastuControls?: { enabled: boolean } | null }).__vastuControls = controls
}

function MovableItem({ item }: { item: FurnitureItem }) {
  const group = useRef<THREE.Group>(null)
  const [target, setTarget] = useState<THREE.Object3D | null>(null)
  const selected = useHouseStore((state) => state.selectedId === item.id)
  const mode = useHouseStore((state) => state.transformMode)
  const select = useHouseStore((state) => state.select)
  const setRotation = useHouseStore((state) => state.setRotation)
  const { gl } = useThree()

  useLayoutEffect(() => {
    setTarget(group.current)
  }, [])

  const onPointerDown = (event: { stopPropagation: () => void; ray: THREE.Ray; nativeEvent: PointerEvent }) => {
    event.stopPropagation()
    select(item.id)
    if (mode === 'rotate') return
    plane.constant = -FLOOR_Y[item.floor]
    const hit = event.ray.intersectPlane(plane, hitPoint)
    if (!hit) return
    dragState.current = {
      id: item.id,
      offsetX: item.x - hit.x,
      offsetZ: item.z - hit.z,
    }
    const controls = orbitControls()
    if (controls) controls.enabled = false
    gl.domElement.style.cursor = 'grabbing'
  }

  return (
    <>
      <group
        ref={group}
        position={[item.x, FLOOR_Y[item.floor], item.z]}
        rotation={[0, item.rotation, 0]}
        userData={{ movable: true }}
        onPointerDown={onPointerDown}
        onPointerOver={(event) => {
          event.stopPropagation()
          gl.domElement.style.cursor = mode === 'rotate' ? 'alias' : 'grab'
        }}
        onPointerOut={() => {
          if (!dragState.current) gl.domElement.style.cursor = 'auto'
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <FurnitureBody item={item} />
        {selected && (
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]} raycast={() => null}>
            <ringGeometry args={[Math.max(item.width, item.depth) * 0.48, Math.max(item.width, item.depth) * 0.48 + 0.12, 40]} />
            <meshBasicMaterial color="#e0a122" />
          </mesh>
        )}
        {selected && (
          <Html position={[0, item.height + 0.35, 0]} center zIndexRange={[10, 0]} style={{ pointerEvents: 'none' }}>
            <div className="rounded-full bg-[#1c1612]/90 px-2 py-1 text-[11px] text-[#f6ead7] shadow-lg">{item.name}</div>
          </Html>
        )}
      </group>
      {selected && mode === 'rotate' && target && (
        <TransformControls
          object={target}
          mode="rotate"
          space="world"
          showX={false}
          showZ={false}
          size={0.75}
          rotationSnap={THREE.MathUtils.degToRad(5)}
          onMouseDown={() => {
            const controls = orbitControls()
            if (controls) controls.enabled = false
          }}
          onMouseUp={() => {
            if (group.current) setRotation(item.id, group.current.rotation.y)
            const controls = orbitControls()
            if (controls) controls.enabled = true
          }}
        />
      )}
    </>
  )
}

function DragController() {
  const { camera, gl } = useThree()
  const moveFurniture = useHouseStore((state) => state.moveFurniture)
  const snapFurniture = useHouseStore((state) => state.snapFurniture)

  useEffect(() => {
    const element = gl.domElement
    const onMove = (event: PointerEvent) => {
      const drag = dragState.current
      if (!drag) return
      const rect = element.getBoundingClientRect()
      const ndc = new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1,
      )
      const raycaster = new THREE.Raycaster()
      raycaster.setFromCamera(ndc, camera)
      const item = useHouseStore.getState().furniture.find((entry) => entry.id === drag.id)
      if (!item) return
      plane.constant = -FLOOR_Y[item.floor]
      const hit = raycaster.ray.intersectPlane(plane, hitPoint)
      if (!hit) return
      moveFurniture(drag.id, hit.x + drag.offsetX, hit.z + drag.offsetZ)
    }
    const onUp = () => {
      const drag = dragState.current
      if (!drag) return
      dragState.current = null
      snapFurniture(drag.id)
      const controls = orbitControls()
      if (controls && !useHouseStore.getState().blueprint) controls.enabled = true
      element.style.cursor = 'auto'
    }
    element.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      element.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [camera, gl, moveFurniture, snapFurniture])

  return null
}

export function FurnitureControls() {
  const floor = useHouseStore((state) => state.floor)
  const furniture = useHouseStore((state) => state.furniture)
  const items = furniture.filter((item) => item.floor === floor)

  useEffect(() => {
    dragState.current = null
  }, [floor])

  return (
    <group>
      {items.map((item) => (
        <MovableItem key={item.id} item={item} />
      ))}
      <DragController />
    </group>
  )
}
