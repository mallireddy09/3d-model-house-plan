import { useEffect, useMemo } from 'react'
import * as THREE from 'three'

function makeLabelTexture(text: string, color: string) {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 256
  const context = canvas.getContext('2d')
  if (!context) return new THREE.CanvasTexture(canvas)
  context.clearRect(0, 0, canvas.width, canvas.height)
  context.fillStyle = color
  context.font = '600 92px sans-serif'
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillText(text.toUpperCase(), canvas.width / 2, canvas.height / 2)
  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

export function FloorLabel({
  text,
  position,
  color = '#3a3228',
  width,
}: {
  text: string
  position: [number, number, number]
  color?: string
  width?: number
}) {
  const texture = useMemo(() => makeLabelTexture(text, color), [text, color])
  useEffect(() => () => texture.dispose(), [texture])
  const spriteWidth = width ?? Math.max(4.8, text.length * 0.62)
  return (
    <sprite position={position} scale={[spriteWidth, spriteWidth / 4, 1]} raycast={() => null}>
      <spriteMaterial map={texture} transparent depthWrite={false} toneMapped={false} />
    </sprite>
  )
}
