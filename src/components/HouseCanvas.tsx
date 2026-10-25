import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, OrthographicCamera, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'
import { FLOOR_Y } from '../data/house'
import { useHouseStore } from '../store/useHouseStore'
import { dragState } from './dragState'
import { FloorManager } from './FloorManager'
import { FurnitureControls, registerOrbit } from './FurnitureControls'
import { VastuValidator } from './VastuValidator'
import { WiringOverlay } from './WiringOverlay'

type Orbit = {
  enabled: boolean
  target: THREE.Vector3
  update: () => void
}

function Mood() {
  const wiring = useHouseStore((state) => state.wiring)
  const blueprint = useHouseStore((state) => state.blueprint)
  const scene = useThree((state) => state.scene)
  useEffect(() => {
    scene.background = new THREE.Color(blueprint ? '#e6e0d2' : wiring ? '#141b27' : '#d5dee8')
  }, [blueprint, scene, wiring])
  return null
}

function Lighting() {
  const wiring = useHouseStore((state) => state.wiring)
  return (
    <>
      <hemisphereLight
        color={wiring ? '#8ea0b8' : '#fff6e8'}
        groundColor={wiring ? '#241c16' : '#c8b59a'}
        intensity={wiring ? 0.22 : 0.78}
      />
      <ambientLight intensity={wiring ? 0.12 : 0.26} />
      <directionalLight
        castShadow
        position={[24, 36, -14]}
        intensity={wiring ? 0.38 : 1.45}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={1}
        shadow-camera-far={90}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={46}
        shadow-camera-bottom={-46}
        shadow-bias={-0.0004}
      />
      <directionalLight position={[-18, 14, 24]} intensity={wiring ? 0.08 : 0.34} color="#d5e4f5" />
    </>
  )
}

function CameraAnimator() {
  const floor = useHouseStore((state) => state.floor)
  const focus = useHouseStore((state) => state.focus)
  const focusNonce = useHouseStore((state) => state.focusNonce)
  const camera = useThree((state) => state.camera)
  const get = useThree((state) => state.get)
  const anim = useRef(0)
  const goalPos = useRef(new THREE.Vector3(48, 42, 54))
  const goalTarget = useRef(new THREE.Vector3(0, 1, -2))

  useLayoutEffect(() => {
    const y = FLOOR_Y[floor]
    const distance = Math.hypot(focus.x, focus.z) < 8 ? 1 : 0.62
    goalTarget.current.set(focus.x, y + 0.8, focus.z)
    goalPos.current.set(focus.x + 46 * distance, y + 40 * distance, focus.z + 52 * distance)
    anim.current = 1
  }, [floor, focus, focusNonce])

  useFrame((_, delta) => {
    if (anim.current <= 0) return
    anim.current = Math.max(0, anim.current - delta * 0.55)
    camera.position.lerp(goalPos.current, 0.14)
    const controls = get().controls as Orbit | null
    if (controls?.target) {
      controls.target.lerp(goalTarget.current, 0.14)
      controls.update()
    }
  })

  return null
}

function OrbitBridge() {
  const controls = useThree((state) => state.controls) as Orbit | null
  useEffect(() => {
    registerOrbit(controls)
    return () => registerOrbit(null)
  }, [controls])
  return null
}

function BlueprintRig() {
  const floor = useHouseStore((state) => state.floor)
  const focus = useHouseStore((state) => state.focus)
  const focusNonce = useHouseStore((state) => state.focusNonce)
  const camera = useThree((state) => state.camera)
  const gl = useThree((state) => state.gl)
  const size = useThree((state) => state.size)
  const pose = useRef({ x: 0, z: -2, zoom: 10 })

  useLayoutEffect(() => {
    pose.current.x = focus.x
    pose.current.z = focus.z
    const span = floor === 'basement' ? 50 : 76
    pose.current.zoom = Math.min(size.width, size.height) / span
  }, [floor, focus.x, focus.z, focusNonce, size.height, size.width])

  useFrame(() => {
    const ortho = camera as THREE.OrthographicCamera
    const y = FLOOR_Y[floor]
    ortho.up.set(0, 0, -1)
    ortho.position.set(pose.current.x, y + 70, pose.current.z)
    ortho.lookAt(pose.current.x, y, pose.current.z)
    ortho.zoom = pose.current.zoom
    ortho.updateProjectionMatrix()
  })

  useEffect(() => {
    const element = gl.domElement
    let maybePan = false
    let lastX = 0
    let lastY = 0
    const onDown = (event: PointerEvent) => {
      if (event.button !== 0) return
      maybePan = true
      lastX = event.clientX
      lastY = event.clientY
    }
    const onMove = (event: PointerEvent) => {
      if (!maybePan || dragState.current) return
      const zoom = pose.current.zoom || 1
      pose.current.x -= (event.clientX - lastX) / zoom
      pose.current.z -= (event.clientY - lastY) / zoom
      lastX = event.clientX
      lastY = event.clientY
    }
    const onUp = () => {
      maybePan = false
    }
    const onWheel = (event: WheelEvent) => {
      event.preventDefault()
      pose.current.zoom = THREE.MathUtils.clamp(pose.current.zoom * Math.exp(-event.deltaY * 0.001), 4, 40)
    }
    element.addEventListener('pointerdown', onDown)
    element.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    element.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      element.removeEventListener('pointerdown', onDown)
      element.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      element.removeEventListener('wheel', onWheel)
    }
  }, [gl])

  return null
}

function Scene() {
  const blueprint = useHouseStore((state) => state.blueprint)
  const select = useHouseStore((state) => state.select)
  return (
    <>
      <Mood />
      <Lighting />
      {blueprint ? (
        <OrthographicCamera makeDefault near={0.1} far={400} zoom={10} />
      ) : (
        <PerspectiveCamera makeDefault fov={46} near={0.1} far={320} position={[48, 42, 54]} />
      )}
      {blueprint ? (
        <BlueprintRig />
      ) : (
        <>
          <OrbitControls
            makeDefault
            enableDamping
            dampingFactor={0.08}
            maxPolarAngle={Math.PI / 2.05}
            minPolarAngle={0.22}
            minDistance={12}
            maxDistance={140}
            target={[0, 1, -2]}
          />
          <OrbitBridge />
          <CameraAnimator />
        </>
      )}
      <FloorManager />
      <FurnitureControls />
      <VastuValidator />
      <WiringOverlay />
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -12, 0]}
        onClick={(event) => {
          event.stopPropagation()
          select(null)
        }}
      >
        <planeGeometry args={[400, 400]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </>
  )
}

export function HouseCanvas() {
  const compass = useRef<HTMLDivElement>(null)
  return (
    <div className="absolute inset-0">
      <Canvas
        shadows
        dpr={[1, 1.75]}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
        onPointerMissed={() => {
          if (!dragState.current) useHouseStore.getState().select(null)
        }}
        onCreated={({ gl }) => {
          gl.shadowMap.type = THREE.PCFSoftShadowMap
        }}
      >
        <Scene />
        <CompassReporter compass={compass} />
      </Canvas>
      <div className="pointer-events-none absolute bottom-4 left-4 z-20 hidden rounded-2xl bg-[#16130f]/75 px-3 py-2 text-[11px] text-[#f3e6d0] backdrop-blur md:block">
        Drag a piece · Arrows nudge · Q / E rotate · Scroll to zoom
      </div>
      <div className="pointer-events-none absolute right-4 bottom-4 z-20">
        <div className="relative grid h-16 w-16 place-items-center rounded-full border border-[#eadcc4]/30 bg-[#16130f]/75 text-[10px] text-[#f6ead7] backdrop-blur">
          <div ref={compass} className="absolute inset-1">
            <span className="absolute top-0 left-1/2 -translate-x-1/2 font-semibold tracking-[0.14em]">N</span>
            <span className="absolute top-3.5 left-1/2 h-4 w-px -translate-x-1/2 bg-[#e0a122]" />
          </div>
        </div>
      </div>
    </div>
  )
}

function CompassReporter({ compass }: { compass: RefObject<HTMLDivElement | null> }) {
  const camera = useThree((state) => state.camera)
  const up = useRef(new THREE.Vector3())
  useFrame(() => {
    if (!compass.current) return
    up.current.set(0, 1, 0).applyQuaternion(camera.quaternion)
    const angle = Math.atan2(up.current.x, -up.current.z)
    compass.current.style.transform = `rotate(${angle}rad)`
  })
  return null
}
