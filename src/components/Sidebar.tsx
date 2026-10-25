import { useMemo } from 'react'
import { AlertTriangle, Check } from 'lucide-react'
import { FLOOR_LABEL, ROOMS } from '../data/house'
import { PRINCIPLES, ZONE_NAME, evaluateLayout, zoneOf } from '../lib/vastu'
import { useHouseStore } from '../store/useHouseStore'
import type { Zone } from '../types'

const GRID: (Zone | 'C')[][] = [
  ['NW', 'N', 'NE'],
  ['W', 'C', 'E'],
  ['SW', 'S', 'SE'],
]

export function Sidebar() {
  const floor = useHouseStore((state) => state.floor)
  const furniture = useHouseStore((state) => state.furniture)
  const selectedId = useHouseStore((state) => state.selectedId)
  const highlighted = useHouseStore((state) => state.highlightedRoom)
  const focusRoom = useHouseStore((state) => state.focusRoom)
  const report = useMemo(() => evaluateLayout(furniture), [furniture])
  const selected = furniture.find((item) => item.id === selectedId)
  const activeZone = selected ? zoneOf(selected.x, selected.z) : null
  const rooms = ROOMS.filter((room) => room.floor === floor)
  const blocked = report.issues.some((issue) => issue.kind === 'center')

  return (
    <aside className="pointer-events-auto absolute top-3 bottom-3 left-3 z-20 flex w-[min(20rem,calc(100%-1.5rem))] flex-col overflow-hidden rounded-3xl border border-[#eadcc4]/15 bg-[#16130f]/88 shadow-2xl backdrop-blur-md lg:w-80">
      <div className="border-b border-white/10 px-4 py-4">
        <div className="flex items-center gap-4">
          <ScoreDial score={report.score} />
          <div>
            <p className="text-[11px] tracking-[0.16em] text-[#cbbba4] uppercase">Vastu compliance</p>
            <p className="font-display text-2xl text-[#f6ead7]">{labelFor(report.score)}</p>
            <p className="mt-1 text-[12px] leading-snug text-[#e7d7c1]/80">
              {report.issues.length === 0
                ? 'The default plan matches the room rules. Move a piece to test another placement.'
                : `${report.issues.length} placement ${report.issues.length === 1 ? 'note' : 'notes'} across the house.`}
            </p>
          </div>
        </div>
      </div>

      <div className="panel-scroll flex-1 space-y-5 overflow-y-auto px-4 py-4">
        <section>
          <h2 className="mb-2 text-[11px] tracking-[0.16em] text-[#cbbba4] uppercase">Zone of the selection</h2>
          <div className="grid grid-cols-3 gap-1">
            {GRID.flat().map((zone) => {
              const on = activeZone === zone
              return (
                <div
                  key={zone}
                  className={`rounded-lg px-2 py-2 text-center text-[11px] ${
                    on ? 'bg-[#e0a122] text-[#1a140f]' : 'bg-white/5 text-[#f3e6d0]'
                  }`}
                >
                  {zone === 'C' ? 'Centre' : zone}
                </div>
              )
            })}
          </div>
          <p className="mt-2 text-[11px] text-[#d9cbb8]">
            {activeZone ? `Selected piece is in ${ZONE_NAME[activeZone]}.` : 'Select a sofa, bed, or fixture in the model.'}
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-[11px] tracking-[0.16em] text-[#cbbba4] uppercase">{FLOOR_LABEL[floor]}</h2>
          <ul className="space-y-1">
            {rooms.map((room) => (
              <li key={room.id}>
                <button
                  type="button"
                  onClick={() => focusRoom(room.id)}
                  className={`w-full rounded-xl px-3 py-2 text-left hover:bg-white/6 ${
                    highlighted === room.id ? 'bg-[#e0a122]/18 ring-1 ring-[#e0a122]/50' : 'bg-white/4'
                  }`}
                >
                  <span className="block text-[13px] text-[#f6ead7]">{room.name}</span>
                  <span className="mt-0.5 block text-[11px] leading-snug text-[#d9cbb8]">{room.note}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-[11px] tracking-[0.16em] text-[#cbbba4] uppercase">Warnings and tips</h2>
          {report.issues.length === 0 ? (
            <p className="rounded-xl bg-[#1f8a68]/15 px-3 py-3 text-[12px] leading-snug text-[#d7f3e8]">
              Nothing to flag. The brahmasthan is clear, the kitchen sits in Agni, and the heavy bed is in the south-west.
            </p>
          ) : (
            <ul className="space-y-2">
              {report.issues.map((issue) => (
                <li
                  key={issue.id}
                  className={`rounded-xl px-3 py-2 text-[12px] leading-snug ${
                    issue.severity === 'high'
                      ? 'bg-[#9c4540]/20 text-[#ffd7cf]'
                      : issue.severity === 'medium'
                        ? 'bg-[#e0a122]/15 text-[#ffe7bf]'
                        : 'bg-white/5 text-[#f3e6d0]'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold">{issue.title}</p>
                      <p className="mt-1 text-[11px] opacity-90">{issue.recommendation}</p>
                      <p className="mt-1 text-[10px] tracking-[0.12em] uppercase opacity-70">{issue.floor}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="mb-2 text-[11px] tracking-[0.16em] text-[#cbbba4] uppercase">Why this plan</h2>
          <ul className="space-y-2">
            {PRINCIPLES.map((principle) => {
              const attention = principle.id === 'center' && blocked
              return (
                <li key={principle.id} className="flex gap-2 text-[12px] leading-snug text-[#f3e6d0]">
                  <span
                    className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full ${
                      attention ? 'bg-[#e0a122] text-[#1a140f]' : 'bg-[#1f8a68] text-white'
                    }`}
                  >
                    {attention ? <AlertTriangle size={10} /> : <Check size={10} />}
                  </span>
                  <span>
                    <span className="font-semibold">{principle.title}. </span>
                    {attention ? 'A piece is sitting in the centre. Move it outward.' : principle.detail}
                  </span>
                </li>
              )
            })}
          </ul>
        </section>
      </div>
      <p className="border-t border-white/10 px-4 py-3 text-[10px] leading-snug text-[#cbbba4]">
        A planning aid based on widely taught residential Vastu. Confirm a working drawing with your architect.
      </p>
    </aside>
  )
}

function ScoreDial({ score }: { score: number }) {
  const radius = 28
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - score / 100)
  const color = score >= 90 ? '#1f8a68' : score >= 75 ? '#e0a122' : '#d4533c'
  return (
    <div className="relative h-20 w-20 shrink-0">
      <svg viewBox="0 0 72 72" className="h-full w-full -rotate-90">
        <circle cx="36" cy="36" r={radius} fill="none" stroke="#3a3228" strokeWidth="6" />
        <circle
          cx="36"
          cy="36"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <span className="font-display text-lg text-[#f6ead7]">{score}</span>
      </div>
    </div>
  )
}

function labelFor(score: number) {
  if (score >= 90) return 'Aligned'
  if (score >= 75) return 'Review placements'
  return 'Significant conflicts'
}
