import { Html } from '@react-three/drei'
import { FLOOR_Y } from '../data/house'
import { evaluateLayout } from '../lib/vastu'
import { useHouseStore } from '../store/useHouseStore'
import { useMemo } from 'react'

export function VastuValidator() {
  const furniture = useHouseStore((state) => state.furniture)
  const floor = useHouseStore((state) => state.floor)
  const select = useHouseStore((state) => state.select)
  const report = useMemo(() => evaluateLayout(furniture), [furniture])
  const visible = report.issues.filter((issue) => issue.floor === floor)
  const byItem = new Map<string, (typeof visible)[number]>()
  for (const issue of visible) {
    const current = byItem.get(issue.itemId)
    if (!current || issue.severity === 'high') byItem.set(issue.itemId, issue)
  }

  return (
    <group>
      {[...byItem.values()].map((issue) => {
        const item = furniture.find((entry) => entry.id === issue.itemId)
        if (!item) return null
        const conflict = issue.severity === 'high'
        return (
          <Html
            key={issue.itemId}
            position={[item.x, FLOOR_Y[item.floor] + item.height + 1.15, item.z]}
            center
            zIndexRange={[12, 0]}
            distanceFactor={28}
          >
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                select(item.id)
              }}
              className={`w-52 rounded-xl border px-2.5 py-2 text-left shadow-lg ${
                conflict
                  ? 'border-[#f0b2a4] bg-[#fff5f1]/95 text-[#6d2418]'
                  : 'border-[#efd39a] bg-[#fff8ea]/95 text-[#6a4a12]'
              }`}
            >
              <div className="text-[10px] font-semibold tracking-[0.14em] uppercase">
                {conflict ? 'Vastu conflict' : 'Vastu note'}
              </div>
              <p className="mt-1 text-[12px] leading-snug font-semibold">{issue.title}</p>
              <p className="mt-1 text-[11px] leading-snug">{issue.recommendation}</p>
            </button>
          </Html>
        )
      })}
    </group>
  )
}
