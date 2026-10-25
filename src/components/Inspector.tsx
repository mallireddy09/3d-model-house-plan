import { useMemo } from 'react'
import { Move, RotateCw } from 'lucide-react'
import { FLOOR_LABEL } from '../data/house'
import { ZONE_NAME, describeOrientation, evaluateLayout, issuesForItem, zoneOf } from '../lib/vastu'
import { useHouseStore } from '../store/useHouseStore'
import { NudgePad } from './NudgePad'

export function Inspector() {
  const selectedId = useHouseStore((state) => state.selectedId)
  const furniture = useHouseStore((state) => state.furniture)
  const mode = useHouseStore((state) => state.transformMode)
  const setMode = useHouseStore((state) => state.setTransformMode)
  const place = useHouseStore((state) => state.placeFurniture)
  const setRotation = useHouseStore((state) => state.setRotation)
  const resetItem = useHouseStore((state) => state.resetItem)
  const item = furniture.find((entry) => entry.id === selectedId) ?? null
  const report = useMemo(() => evaluateLayout(furniture), [furniture])

  return (
    <aside className="pointer-events-auto absolute top-3 right-3 bottom-3 z-20 hidden w-80 flex-col overflow-hidden rounded-3xl border border-[#eadcc4]/15 bg-[#16130f]/88 shadow-2xl backdrop-blur-md md:flex">
      <InspectorBody
        item={item}
        mode={mode}
        setMode={setMode}
        place={place}
        setRotation={setRotation}
        resetItem={resetItem}
        issues={item ? issuesForItem(report, item.id) : []}
      />
    </aside>
  )
}

export function InspectorSheet() {
  const selectedId = useHouseStore((state) => state.selectedId)
  const furniture = useHouseStore((state) => state.furniture)
  const mode = useHouseStore((state) => state.transformMode)
  const setMode = useHouseStore((state) => state.setTransformMode)
  const place = useHouseStore((state) => state.placeFurniture)
  const setRotation = useHouseStore((state) => state.setRotation)
  const resetItem = useHouseStore((state) => state.resetItem)
  const item = furniture.find((entry) => entry.id === selectedId) ?? null
  const report = useMemo(() => evaluateLayout(furniture), [furniture])
  if (!item) return null
  return (
    <div className="pointer-events-auto absolute right-3 bottom-3 left-3 z-30 max-h-[46%] overflow-hidden rounded-3xl border border-[#eadcc4]/15 bg-[#16130f]/92 shadow-2xl backdrop-blur md:hidden">
      <InspectorBody
        item={item}
        mode={mode}
        setMode={setMode}
        place={place}
        setRotation={setRotation}
        resetItem={resetItem}
        issues={issuesForItem(report, item.id)}
      />
    </div>
  )
}

function InspectorBody({
  item,
  mode,
  setMode,
  place,
  setRotation,
  resetItem,
  issues,
}: {
  item: ReturnType<typeof useHouseStore.getState>['furniture'][number] | null
  mode: 'translate' | 'rotate'
  setMode: (mode: 'translate' | 'rotate') => void
  place: (id: string, x: number, z: number) => void
  setRotation: (id: string, radians: number) => void
  resetItem: (id: string) => void
  issues: ReturnType<typeof issuesForItem>
}) {
  if (!item) {
    return (
      <div className="flex h-full flex-col justify-between p-5">
        <div>
          <p className="text-[11px] tracking-[0.16em] text-[#cbbba4] uppercase">Inspector</p>
          <h2 className="font-display mt-2 text-2xl text-[#f6ead7]">Nothing selected</h2>
          <p className="mt-3 text-[13px] leading-relaxed text-[#e7d7c1]">
            Click a sofa, bed, stove, or other piece. Drag it across the floor, or use the pad to shift it by half a foot and rotate it.
          </p>
        </div>
        <p className="text-[12px] leading-relaxed text-[#cbbba4]">
          North is the arrow outside the plot. East is to the right when you face north.
        </p>
      </div>
    )
  }

  const zone = zoneOf(item.x, item.z)
  const orientation = describeOrientation(item)
  const conflict = issues.some((issue) => issue.severity === 'high')
  const caution = issues.length > 0
  const degrees = Math.round((((item.rotation * 180) / Math.PI) % 360 + 360) % 360)

  return (
    <div className="panel-scroll flex h-full flex-col overflow-y-auto">
      <div className="border-b border-white/10 px-5 py-4">
        <p className="text-[11px] tracking-[0.16em] text-[#cbbba4] uppercase">{FLOOR_LABEL[item.floor]}</p>
        <h2 className="font-display mt-1 text-2xl text-[#f6ead7]">{item.name}</h2>
        <p className="mt-1 text-[12px] text-[#d9cbb8] capitalize">{item.type}</p>
      </div>
      <div className="space-y-4 px-5 py-4">
        <div
          className={`rounded-2xl px-3 py-3 text-[12px] leading-snug ${
            conflict ? 'bg-[#9c4540]/20 text-[#ffd7cf]' : caution ? 'bg-[#e0a122]/15 text-[#ffe7bf]' : 'bg-[#1f8a68]/15 text-[#d7f3e8]'
          }`}
        >
          <p className="font-semibold">
            {conflict ? 'Vastu conflict' : caution ? 'Check this placement' : 'Placement is within the rules'}
          </p>
          <p className="mt-1">Zone: {ZONE_NAME[zone]}</p>
          {orientation && <p>{orientation}</p>}
          {issues.map((issue) => (
            <p key={issue.id} className="mt-2">
              {issue.recommendation}
            </p>
          ))}
        </div>

        <dl className="grid grid-cols-3 gap-2 text-center">
          <Stat label="Width" value={`${item.width} ft`} />
          <Stat label="Depth" value={`${item.depth} ft`} />
          <Stat label="Height" value={`${item.height} ft`} />
        </dl>

        <div className="grid grid-cols-2 gap-2">
          <Field
            label="East / west X"
            value={item.x}
            onChange={(value) => place(item.id, value, item.z)}
          />
          <Field
            label="North / south Z"
            value={item.z}
            onChange={(value) => place(item.id, item.x, value)}
          />
        </div>
        <label className="block text-[11px] tracking-[0.14em] text-[#cbbba4] uppercase">
          Rotation
          <input
            className="mt-1 w-full rounded-xl border border-white/10 bg-[#100e0c] px-3 py-2 text-[13px] tracking-normal text-[#f6ead7] normal-case"
            type="number"
            step={5}
            value={degrees}
            onChange={(event) => {
              const next = Number(event.target.value)
              if (Number.isFinite(next)) setRotation(item.id, (next * Math.PI) / 180)
            }}
          />
        </label>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode('translate')}
            className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-2 text-[12px] ${
              mode === 'translate' ? 'bg-[#e0a122] text-[#1a140f]' : 'bg-white/6 text-[#f6ead7]'
            }`}
          >
            <Move size={14} />
            Move
          </button>
          <button
            type="button"
            onClick={() => setMode('rotate')}
            className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-2 text-[12px] ${
              mode === 'rotate' ? 'bg-[#e0a122] text-[#1a140f]' : 'bg-white/6 text-[#f6ead7]'
            }`}
          >
            <RotateCw size={14} />
            Rotate
          </button>
        </div>
        <p className="text-[11px] leading-snug text-[#cbbba4]">
          {mode === 'rotate'
            ? 'Drag the yellow ring in the model. Q and E rotate by 15 degrees.'
            : 'Drag the piece on the floor, or nudge it north, east, south, and west.'}
        </p>
        <NudgePad id={item.id} />
        <button
          type="button"
          onClick={() => resetItem(item.id)}
          className="text-[12px] text-[#e0a122] underline-offset-2 hover:underline"
        >
          Restore this piece
        </button>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/5 px-2 py-2">
      <dt className="text-[10px] tracking-[0.14em] text-[#cbbba4] uppercase">{label}</dt>
      <dd className="mt-1 text-[13px] text-[#f6ead7]">{value}</dd>
    </div>
  )
}

function Field({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="text-[11px] tracking-[0.14em] text-[#cbbba4] uppercase">
      {label}
      <input
        className="mt-1 w-full rounded-xl border border-white/10 bg-[#100e0c] px-3 py-2 text-[13px] tracking-normal text-[#f6ead7] normal-case"
        type="number"
        step={0.5}
        value={Number(value.toFixed(2))}
        onChange={(event) => {
          const next = Number(event.target.value)
          if (Number.isFinite(next)) onChange(next)
        }}
      />
    </label>
  )
}
