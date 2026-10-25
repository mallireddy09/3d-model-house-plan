import { RotateCcw, RotateCw } from 'lucide-react'
import { useHouseStore } from '../store/useHouseStore'

export function NudgePad({ id, compact = false }: { id: string; compact?: boolean }) {
  const nudge = useHouseStore((state) => state.nudge)
  const rotateBy = useHouseStore((state) => state.rotateBy)
  const step = 0.5
  const button = compact
    ? 'grid h-9 w-9 place-items-center rounded-lg bg-white/8 text-[11px] text-[#f6ead7] hover:bg-white/15'
    : 'grid h-10 w-10 place-items-center rounded-xl bg-[#2a241c] text-[12px] text-[#f6ead7] hover:bg-[#3a3228]'

  return (
    <div className={`grid grid-cols-3 gap-1 ${compact ? '' : 'w-fit'}`}>
      <span />
      <button type="button" className={button} onClick={() => nudge(id, 0, -step)} aria-label="Move north">
        N
      </button>
      <button type="button" className={button} onClick={() => rotateBy(id, -15)} aria-label="Rotate counter-clockwise">
        <RotateCcw size={14} />
      </button>
      <button type="button" className={button} onClick={() => nudge(id, -step, 0)} aria-label="Move west">
        W
      </button>
      <span className="grid place-items-center text-[10px] tracking-[0.14em] text-[#cbbba4]">0.5</span>
      <button type="button" className={button} onClick={() => nudge(id, step, 0)} aria-label="Move east">
        E
      </button>
      <span />
      <button type="button" className={button} onClick={() => nudge(id, 0, step)} aria-label="Move south">
        S
      </button>
      <button type="button" className={button} onClick={() => rotateBy(id, 15)} aria-label="Rotate clockwise">
        <RotateCw size={14} />
      </button>
    </div>
  )
}
