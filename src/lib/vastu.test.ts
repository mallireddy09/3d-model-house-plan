import { describe, expect, it } from 'vitest'
import { INITIAL_FURNITURE, clampPlacement } from '../data/house'
import { directionFromRotation, evaluateLayout, zoneOf } from './vastu'

describe('zoneOf', () => {
  it('names the nine zones, the north balcony, and the outside', () => {
    expect(zoneOf(0, 0)).toBe('C')
    expect(zoneOf(14, -18)).toBe('NE')
    expect(zoneOf(14, 18)).toBe('SE')
    expect(zoneOf(-14, 18)).toBe('SW')
    expect(zoneOf(-14, -18)).toBe('NW')
    expect(zoneOf(0, -18)).toBe('N')
    expect(zoneOf(0, 18)).toBe('S')
    expect(zoneOf(14, 0)).toBe('E')
    expect(zoneOf(-14, 0)).toBe('W')
    expect(zoneOf(0, -30)).toBe('N')
    expect(zoneOf(40, 0)).toBe('out')
  })
})

describe('directionFromRotation', () => {
  it('reads front and head directions from the yaw', () => {
    expect(directionFromRotation(Math.PI / 2, 'front')).toBe('E')
    expect(directionFromRotation(-Math.PI / 2, 'front')).toBe('W')
    expect(directionFromRotation(0, 'front')).toBe('S')
    expect(directionFromRotation(Math.PI, 'front')).toBe('N')
    expect(directionFromRotation(Math.PI, 'head')).toBe('S')
    expect(directionFromRotation(-Math.PI / 2, 'head')).toBe('E')
  })
})

describe('default layout', () => {
  it('keeps every piece inside its floor and scores 100', () => {
    for (const item of INITIAL_FURNITURE) {
      expect(clampPlacement(item.floor, item.x, item.z)).toEqual({ x: item.x, z: item.z })
    }
    const report = evaluateLayout(INITIAL_FURNITURE)
    expect(report.issues).toEqual([])
    expect(report.score).toBe(100)
  })
})

describe('violations', () => {
  it('flags a master bed moved into the north-east with the head to the north', () => {
    const items = INITIAL_FURNITURE.map((item) =>
      item.id === 'master-bed' ? { ...item, x: 16, z: -18, rotation: 0 } : item,
    )
    const report = evaluateLayout(items)
    const bed = report.issues.filter((issue) => issue.itemId === 'master-bed')
    expect(bed).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ kind: 'zone', severity: 'high' }),
        expect.objectContaining({ kind: 'facing', severity: 'medium' }),
      ]),
    )
    expect(report.score).toBe(82)
  })

  it('flags a toilet in the brahmasthan', () => {
    const items = INITIAL_FURNITURE.map((item) => (item.id === 'guest-wc' ? { ...item, x: 0, z: 0 } : item))
    const report = evaluateLayout(items)
    expect(report.issues).toEqual([
      expect.objectContaining({ itemId: 'guest-wc', kind: 'center', severity: 'high' }),
    ])
    expect(report.score).toBe(88)
  })

  it('warns when the cook faces west', () => {
    const items = INITIAL_FURNITURE.map((item) =>
      item.id === 'stove' ? { ...item, rotation: -Math.PI / 2 } : item,
    )
    const report = evaluateLayout(items)
    expect(report.issues).toEqual([
      expect.objectContaining({ itemId: 'stove', kind: 'facing', severity: 'medium' }),
    ])
    expect(report.score).toBe(94)
  })
})
