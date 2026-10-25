import { Component, useEffect, type ErrorInfo, type ReactNode } from 'react'
import { HouseCanvas } from './components/HouseCanvas'
import { Inspector, InspectorSheet } from './components/Inspector'
import { NudgePad } from './components/NudgePad'
import { Sidebar } from './components/Sidebar'
import { TopBar } from './components/TopBar'
import { useHouseStore } from './store/useHouseStore'

export default function App() {
  const wiring = useHouseStore((state) => state.wiring)
  const selectedId = useHouseStore((state) => state.selectedId)

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target
      if (target instanceof HTMLElement && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return
      const state = useHouseStore.getState()
      if (event.key === 'Escape') {
        state.select(null)
        return
      }
      if (!state.selectedId) return
      const step = event.shiftKey ? 2 : 0.5
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        state.nudge(state.selectedId, -step, 0)
      } else if (event.key === 'ArrowRight') {
        event.preventDefault()
        state.nudge(state.selectedId, step, 0)
      } else if (event.key === 'ArrowUp') {
        event.preventDefault()
        state.nudge(state.selectedId, 0, -step)
      } else if (event.key === 'ArrowDown') {
        event.preventDefault()
        state.nudge(state.selectedId, 0, step)
      } else if (event.key === 'q' || event.key === 'Q') {
        state.rotateBy(state.selectedId, -15)
      } else if (event.key === 'e' || event.key === 'E') {
        state.rotateBy(state.selectedId, 15)
      } else if (event.key === 'r' || event.key === 'R') {
        state.setTransformMode(state.transformMode === 'rotate' ? 'translate' : 'rotate')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="flex h-full min-h-screen flex-col bg-[#100e0c] text-[#f6efe4]">
      <TopBar />
      <main className="relative min-h-0 flex-1">
        <div className="absolute inset-0 lg:right-[21.5rem] lg:left-[22rem]">
          <CanvasBoundary>
            <HouseCanvas />
          </CanvasBoundary>
          {wiring && (
            <div className="pointer-events-none absolute top-3 left-1/2 z-20 hidden -translate-x-1/2 rounded-full bg-[#1a140f]/80 px-4 py-1.5 text-[12px] text-[#ffe7bf] md:block">
              Mains run along the north and east walls. The distribution board sits in the south-east.
            </div>
          )}
          {selectedId && (
            <div className="pointer-events-auto absolute bottom-4 left-1/2 z-30 hidden -translate-x-1/2 rounded-2xl border border-[#eadcc4]/15 bg-[#16130f]/88 p-2 shadow-xl backdrop-blur md:block">
              <NudgePad id={selectedId} compact />
            </div>
          )}
        </div>
        <Sidebar />
        <Inspector />
        <InspectorSheet />
      </main>
    </div>
  )
}

class CanvasBoundary extends Component<{ children: ReactNode }, { message: string | null }> {
  state = { message: null as string | null }

  static getDerivedStateFromError(error: Error) {
    return { message: error.message }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info)
  }

  render() {
    if (this.state.message) {
      return (
        <div className="grid h-full place-items-center px-6 text-center text-[#f6ead7]">
          <p>The 3D view could not start. {this.state.message}</p>
        </div>
      )
    }
    return this.props.children
  }
}
