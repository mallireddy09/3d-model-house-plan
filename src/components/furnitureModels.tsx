import type { FurnitureItem } from '../types'

interface BodyProps {
  item: FurnitureItem
}

function Box({
  position,
  args,
  color,
  roughness = 0.72,
  metalness = 0.04,
  emissive,
  emissiveIntensity = 0,
}: {
  position: [number, number, number]
  args: [number, number, number]
  color: string
  roughness?: number
  metalness?: number
  emissive?: string
  emissiveIntensity?: number
}) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={args} />
      <meshStandardMaterial
        color={color}
        roughness={roughness}
        metalness={metalness}
        emissive={emissive ?? '#000'}
        emissiveIntensity={emissiveIntensity}
      />
    </mesh>
  )
}

function Sofa({ item }: BodyProps) {
  const { width: w, depth: d, height: h, color = '#7a3144' } = item
  const seat = h * 0.42
  return (
    <group>
      <Box position={[0, 0.12, 0]} args={[w, 0.16, d * 0.86]} color="#3a2a22" />
      <Box position={[0, seat / 2 + 0.16, d * 0.06]} args={[w - 0.7, seat, d * 0.62]} color={color} roughness={0.86} />
      <Box position={[0, h * 0.58, -d * 0.34]} args={[w, h * 0.62, 0.38]} color={color} roughness={0.84} />
      <Box position={[-w / 2 + 0.22, h * 0.42, 0.05]} args={[0.38, h * 0.55, d * 0.86]} color="#5c2434" />
      <Box position={[w / 2 - 0.22, h * 0.42, 0.05]} args={[0.38, h * 0.55, d * 0.86]} color="#5c2434" />
      {[-w * 0.28, 0, w * 0.28].map((x) => (
        <Box key={x} position={[x, seat + 0.28, d * 0.08]} args={[w * 0.26, 0.28, d * 0.42]} color="#f0e2cf" roughness={0.9} />
      ))}
    </group>
  )
}

function Coffee({ item }: BodyProps) {
  const { width: w, depth: d, height: h, color = '#8d5a32' } = item
  return (
    <group>
      <Box position={[0, h - 0.08, 0]} args={[w, 0.12, d]} color={color} />
      <Box position={[0, 0.28, 0]} args={[w - 0.4, 0.08, d - 0.35]} color="#c9a27a" />
      {[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([sx, sz]) => (
        <Box key={`${sx}${sz}`} position={[(w / 2 - 0.18) * sx, h / 2, (d / 2 - 0.16) * sz]} args={[0.12, h, 0.12]} color="#3d2b20" />
      ))}
    </group>
  )
}

function Television({ item }: BodyProps) {
  const { width: w, depth: d, height: h } = item
  return (
    <group>
      <Box position={[0, 0.35, 0]} args={[w, 0.7, d]} color="#6b4a30" />
      <Box position={[0, 0.78, d * 0.2]} args={[w * 0.7, 0.08, d * 0.35]} color="#2b2118" />
      <Box position={[0, 0.7 + (h - 0.7) / 2, 0]} args={[w * 0.92, h - 0.85, 0.12]} color="#16181d" metalness={0.4} roughness={0.25} />
      <Box position={[0, 0.7 + (h - 0.7) / 2, 0.07]} args={[w * 0.84, h - 1.05, 0.02]} color="#9fd7e8" emissive="#6ec8df" emissiveIntensity={0.25} metalness={0.6} roughness={0.15} />
    </group>
  )
}

function Dining({ item }: BodyProps) {
  const { width: w, depth: d, color = '#a86b3c' } = item
  const chairs = [
    [-w * 0.28, d * 0.5 + 0.15, 0],
    [w * 0.28, d * 0.5 + 0.15, 0],
    [-w * 0.28, -d * 0.5 - 0.15, Math.PI],
    [w * 0.28, -d * 0.5 - 0.15, Math.PI],
  ] as const
  return (
    <group>
      <Box position={[0, 2.35, 0]} args={[w, 0.14, d]} color={color} />
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz]) => (
        <Box key={`${sx}${sz}`} position={[(w / 2 - 0.35) * sx, 1.15, (d / 2 - 0.3) * sz]} args={[0.14, 2.3, 0.14]} color="#5a3a24" />
      ))}
      {chairs.map(([x, z, rot], index) => (
        <group key={index} position={[x, 0, z]} rotation={[0, rot, 0]}>
          <Box position={[0, 1.45, 0]} args={[1.15, 0.12, 1.15]} color="#6e4a2c" />
          <Box position={[0, 2.15, -0.48]} args={[1.15, 1.15, 0.12]} color="#7a3144" />
          <Box position={[0, 0.72, 0]} args={[0.12, 1.4, 0.12]} color="#3d2b20" />
        </group>
      ))}
    </group>
  )
}

function Bed({ item }: BodyProps) {
  const { width: w, depth: d, color = '#f4efe6' } = item
  return (
    <group>
      <Box position={[0, 0.7, 0.15]} args={[w, 0.45, d - 0.4]} color={color} roughness={0.9} />
      <Box position={[0, 1.15, -d / 2 + 0.28]} args={[w + 0.15, 2.3, 0.28]} color="#6b3e24" />
      <Box position={[-w * 0.22, 1.15, -d / 2 + 0.7]} args={[w * 0.28, 0.28, 0.7]} color="#f7f4ee" />
      <Box position={[w * 0.22, 1.15, -d / 2 + 0.7]} args={[w * 0.28, 0.28, 0.7]} color="#efe2d2" />
      <Box position={[0, 0.95, d * 0.18]} args={[w - 0.3, 0.16, d * 0.42]} color="#fbf7f1" />
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz]) => (
        <Box key={`${sx}${sz}`} position={[(w / 2 - 0.25) * sx, 0.28, (d / 2 - 0.4) * sz]} args={[0.16, 0.55, 0.16]} color="#3a2a22" />
      ))}
    </group>
  )
}

function Wardrobe({ item }: BodyProps) {
  const { width: w, depth: d, height: h } = item
  return (
    <group>
      <Box position={[0, h / 2, 0]} args={[w, h, d]} color="#7a5232" />
      <Box position={[-w * 0.22, h / 2, d / 2 + 0.01]} args={[w * 0.42, h - 0.4, 0.06]} color="#8d6240" />
      <Box position={[w * 0.22, h / 2, d / 2 + 0.01]} args={[w * 0.42, h - 0.4, 0.06]} color="#8d6240" />
      <Box position={[-0.18, h * 0.55, d / 2 + 0.08]} args={[0.08, 0.5, 0.08]} color="#e6d3a1" metalness={0.6} roughness={0.3} />
      <Box position={[0.18, h * 0.55, d / 2 + 0.08]} args={[0.08, 0.5, 0.08]} color="#e6d3a1" metalness={0.6} roughness={0.3} />
    </group>
  )
}

function Pooja({ item }: BodyProps) {
  const { width: w, depth: d, height: h } = item
  return (
    <group>
      <Box position={[0, 0.35, 0]} args={[w, 0.7, d]} color="#6b2e32" />
      <Box position={[0, 1.35, -d * 0.08]} args={[w * 0.82, 1.3, d * 0.55]} color="#f6e7b2" />
      <Box position={[-w * 0.32, h * 0.42, 0]} args={[0.28, h * 0.55, d * 0.7]} color="#8d3b32" />
      <Box position={[w * 0.32, h * 0.42, 0]} args={[0.28, h * 0.55, d * 0.7]} color="#8d3b32" />
      <mesh position={[0, h * 0.78, 0]} castShadow>
        <coneGeometry args={[w * 0.34, h * 0.34, 4]} />
        <meshStandardMaterial color="#e0a12e" roughness={0.45} metalness={0.25} />
      </mesh>
      <mesh position={[0, 2.15, d * 0.12]}>
        <sphereGeometry args={[0.12, 12, 12]} />
        <meshStandardMaterial color="#ffd37a" emissive="#ffb03a" emissiveIntensity={2} toneMapped={false} />
      </mesh>
      <pointLight position={[0, 2.2, 0.4]} color="#ffb15a" intensity={0.6} distance={5} />
    </group>
  )
}

function Kitchen({ item }: BodyProps) {
  const { width: w, depth: d, height: h } = item
  return (
    <group>
      <Box position={[0, (h - 0.12) / 2, 0]} args={[w, h - 0.12, d]} color="#f4f1ea" />
      <Box position={[0, h - 0.06, 0]} args={[w + 0.08, 0.12, d + 0.08]} color="#2f3a3a" roughness={0.35} />
      {[-w * 0.3, -w * 0.1, w * 0.1, w * 0.3].map((x) => (
        <Box key={x} position={[x, h * 0.48, d / 2 + 0.01]} args={[w * 0.16, h * 0.62, 0.05]} color="#e7e0d4" />
      ))}
      <mesh position={[-w * 0.22, h + 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.38, 20]} />
        <meshStandardMaterial color="#b9c4c8" metalness={0.45} roughness={0.25} />
      </mesh>
      <Box position={[-w * 0.22, h + 0.28, -d * 0.2]} args={[0.08, 0.45, 0.08]} color="#d5d8dc" metalness={0.7} roughness={0.2} />
    </group>
  )
}

function Stove({ item }: BodyProps) {
  const { width: w, depth: d, height: h } = item
  return (
    <group>
      <Box position={[0, 0.45, 0]} args={[w, 0.9, d]} color="#2a2d31" metalness={0.35} roughness={0.4} />
      <Box position={[0, 0.95, 0]} args={[w * 0.92, 0.08, d * 0.86]} color="#1a1c1f" />
      {[[-0.45, -0.35], [0.45, -0.35], [-0.45, 0.35], [0.45, 0.35]].map(([x, z]) => (
        <mesh key={`${x}${z}`} position={[x, 1.02, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.16, 0.28, 18]} />
          <meshStandardMaterial color="#3a3a3a" emissive="#5a2a16" emissiveIntensity={0.3} />
        </mesh>
      ))}
      <Box position={[0, h * 0.72, -d * 0.15]} args={[w * 0.7, h * 0.45, d * 0.55]} color="#d9dde2" metalness={0.55} roughness={0.3} />
    </group>
  )
}

function Toilet({ item }: BodyProps) {
  const { width: w, depth: d } = item
  return (
    <group>
      <Box position={[0, 0.85, -d * 0.22]} args={[w * 0.85, 1.15, d * 0.32]} color="#f4f7f8" roughness={0.35} />
      <mesh position={[0, 0.7, d * 0.08]} rotation={[0.15, 0, 0]} castShadow>
        <sphereGeometry args={[w * 0.42, 18, 14]} />
        <meshStandardMaterial color="#f7fbfc" roughness={0.28} />
      </mesh>
      <Box position={[0, 1.15, d * 0.12]} args={[w * 0.7, 0.08, d * 0.42]} color="#e7eef0" />
    </group>
  )
}

function Vanity({ item }: BodyProps) {
  const { width: w, depth: d, height: h } = item
  return (
    <group>
      <Box position={[0, 0.7, 0]} args={[w, 1.4, d]} color="#f3f0ea" />
      <Box position={[0, 1.48, 0]} args={[w + 0.06, 0.1, d + 0.06]} color="#d7dbdf" roughness={0.3} />
      <mesh position={[0, 1.58, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.32, 20]} />
        <meshStandardMaterial color="#edf3f5" />
      </mesh>
      <Box position={[0, h * 0.72, -d / 2 + 0.04]} args={[w * 0.7, h * 0.42, 0.06]} color="#d5e7ee" metalness={0.15} roughness={0.15} />
    </group>
  )
}

function Study({ item }: BodyProps) {
  const { width: w, depth: d, height: h } = item
  return (
    <group>
      <Box position={[0, h - 0.08, 0]} args={[w, 0.1, d]} color="#245c54" />
      <Box position={[0, (h - 0.2) / 2, -d * 0.28]} args={[w, h - 0.3, 0.12]} color="#1c4741" />
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz]) => (
        <Box key={`${sx}${sz}`} position={[(w / 2 - 0.2) * sx, h / 2 - 0.1, (d / 2 - 0.18) * sz]} args={[0.1, h - 0.2, 0.1]} color="#1a3330" />
      ))}
      <Box position={[w * 0.18, h + 0.06, -d * 0.1]} args={[0.7, 0.08, 0.5]} color="#f4efe4" />
      <group position={[0, 0, d * 0.55]}>
        <Box position={[0, 1.4, 0]} args={[1.2, 0.1, 1.2]} color="#6b4226" />
        <Box position={[0, 2, -0.5]} args={[1.2, 1.1, 0.1]} color="#6b4226" />
      </group>
    </group>
  )
}

function Theater({ item }: BodyProps) {
  const { width: w, depth: d, height: h } = item
  const seats = 3
  const seatW = w / seats
  return (
    <group>
      {Array.from({ length: seats }, (_, index) => {
        const x = -w / 2 + seatW * (index + 0.5)
        return (
          <group key={index} position={[x, 0, 0]}>
            <Box position={[0, 0.85, 0.1]} args={[seatW - 0.18, 0.4, d * 0.62]} color="#6a2438" />
            <Box position={[0, h * 0.62, -d * 0.22]} args={[seatW - 0.18, h * 0.5, 0.28]} color="#4a2030" />
            <Box position={[-(seatW / 2) + 0.08, 0.9, 0]} args={[0.12, 0.7, d * 0.7]} color="#2c1218" />
          </group>
        )
      })}
    </group>
  )
}

function Screen({ item }: BodyProps) {
  const { width: w, height: h } = item
  return (
    <group>
      <Box position={[0, h / 2 + 0.4, 0]} args={[w, h, 0.18]} color="#141414" />
      <Box position={[0, h / 2 + 0.4, 0.1]} args={[w - 0.35, h - 0.35, 0.04]} color="#d7dee8" emissive="#9eb4c8" emissiveIntensity={0.2} />
      <Box position={[-w * 0.28, 0.45, 0]} args={[0.12, 0.9, 0.4]} color="#2a2a2a" />
      <Box position={[w * 0.28, 0.45, 0]} args={[0.12, 0.9, 0.4]} color="#2a2a2a" />
    </group>
  )
}

function Storage({ item }: BodyProps) {
  const { width: w, depth: d, height: h } = item
  const shelves = 4
  return (
    <group>
      {[ -w / 2 + 0.08, w / 2 - 0.08 ].map((x) => (
        <Box key={x} position={[x, h / 2, 0]} args={[0.1, h, d]} color="#8d9398" metalness={0.6} roughness={0.35} />
      ))}
      {Array.from({ length: shelves }, (_, index) => {
        const y = 0.4 + ((h - 0.6) / (shelves - 1)) * index
        return <Box key={y} position={[0, y, 0]} args={[w, 0.08, d]} color="#9aa1a6" metalness={0.5} roughness={0.4} />
      })}
      <Box position={[-w * 0.18, 1.15, 0]} args={[w * 0.28, 0.7, d * 0.7]} color="#c4553a" />
      <Box position={[w * 0.16, 2.3, 0]} args={[w * 0.3, 0.55, d * 0.65]} color="#2f6f62" />
      <Box position={[0, 3.5, 0]} args={[w * 0.22, 0.45, d * 0.6]} color="#e0c37a" />
    </group>
  )
}

export function FurnitureBody({ item }: BodyProps) {
  switch (item.type) {
    case 'sofa':
      return <Sofa item={item} />
    case 'table':
      return <Coffee item={item} />
    case 'tv':
      return <Television item={item} />
    case 'dining':
      return <Dining item={item} />
    case 'bed':
      return <Bed item={item} />
    case 'wardrobe':
      return <Wardrobe item={item} />
    case 'pooja':
      return <Pooja item={item} />
    case 'kitchen':
      return <Kitchen item={item} />
    case 'stove':
      return <Stove item={item} />
    case 'toilet':
      return <Toilet item={item} />
    case 'vanity':
      return <Vanity item={item} />
    case 'study':
      return <Study item={item} />
    case 'theater':
      return <Theater item={item} />
    case 'screen':
      return <Screen item={item} />
    case 'storage':
      return <Storage item={item} />
    default:
      return null
  }
}
