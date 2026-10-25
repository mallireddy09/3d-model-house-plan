import { type ReactNode } from 'react'
import { Compass, Download, Eye, EyeOff, LayoutGrid, RotateCcw, Zap } from 'lucide-react'
import { FLOOR_LABEL } from '../data/house'
import { downloadBlueprint, useHouseStore } from '../store/useHouseStore'
import type { FloorId } from '../types'

const FLOORS: FloorId[] = ['basement', 'ground', 'first']

export function TopBar() {
  const floor = useHouseStore((state) => state.floor)
  const setFloor = useHouseStore((state) => state.setFloor)
  const wiring = useHouseStore((state) => state.wiring)
  const blueprint = useHouseStore((state) => state.blueprint)
  const showZones = useHouseStore((state) => state.showZones)
  const toggleWiring = useHouseStore((state) => state.toggleWiring)
  const toggleBlueprint = useHouseStore((state) => state.toggleBlueprint)
  const toggleZones = useHouseStore((state) => state.toggleZones)
  const resetLayout = useHouseStore((state) => state.resetLayout)

  return (
    <header className="z-40 flex h-14 shrink-0 items-center gap-3 border-b border-[#eadcc4]/15 bg-[#16130f]/95 px-3 backdrop-blur">
      <div className="flex items-center gap-2 pr-2">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#e0a122] text-[#1a140f]">
          <Compass size={16} />
        </span>
        <div className="leading-tight">
          <div className="font-display text-[15px] text-[#f6ead7]">Vastu Griha</div>
          <div className="text-[10px] tracking-[0.16em] text-[#cbbba4] uppercase">3D house planner</div>
        </div>
      </div>

      <div className="flex rounded-full bg-[#2a241c] p-1" role="tablist" aria-label="Floor">
        {FLOORS.map((id) => {
          const active = floor === id
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setFloor(id)}
              className={`rounded-full px-3 py-1 text-[12px] ${
                active ? 'bg-[#e0a122] text-[#1a140f]' : 'text-[#f3e6d0] hover:bg-white/5'
              }`}
            >
              {FLOOR_LABEL[id].replace(' floor', '')}
            </button>
          )
        })}
      </div>

      <div className="ml-auto flex items-center gap-2 overflow-x-auto">
        <Toggle on={showZones} onClick={toggleZones} icon={<LayoutGrid size={14} />} label="Zones" />
        <Toggle on={wiring} onClick={toggleWiring} icon={<Zap size={14} />} label="Wiring" />
        <Toggle
          on={blueprint}
          onClick={toggleBlueprint}
          icon={blueprint ? <Eye size={14} /> : <EyeOff size={14} />}
          label="Blueprint"
        />
        <button
          type="button"
          onClick={resetLayout}
          className="inline-flex items-center gap-1.5 rounded-full border border-[#eadcc4]/20 px-3 py-1.5 text-[12px] text-[#f6ead7] hover:bg-white/5"
        >
          <RotateCcw size={14} />
          Reset
        </button>
        <button
          type="button"
          onClick={downloadBlueprint}
          className="inline-flex items-center gap-1.5 rounded-full bg-[#f3e6d0] px-3 py-1.5 text-[12px] font-semibold text-[#1a140f] hover:bg-white"
        >
          <Download size={14} />
          Export JSON
        </button>
      </div>
    </header>
  )
}

function Toggle({
  on,
  onClick,
  icon,
  label,
}: {
  on: boolean
  onClick: () => void
  icon: ReactNode
  label: string
}) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] ${
        on ? 'bg-[#efe2c4] text-[#1a140f]' : 'border border-[#eadcc4]/20 text-[#f6ead7] hover:bg-white/5'
      }`}
    >
      {icon}
      {label}
    </button>
  )
}
