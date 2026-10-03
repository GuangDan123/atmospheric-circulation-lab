import { describe, expect, it } from 'vitest'
import { percentile, hasSustainedHeapGrowth } from '../performance/metrics'

describe('classroom performance metrics', () => {
  it('uses nearest-rank percentiles without changing samples', () => {
    const samples = [40, 10, 30, 20]
    expect(percentile(samples, 0.95)).toBe(40)
    expect(percentile(samples, 0.5)).toBe(20)
    expect(samples).toEqual([40, 10, 30, 20])
  })

  it('rejects empty or invalid measurement inputs', () => {
    expect(() => percentile([], 0.95)).toThrow(RangeError)
    expect(() => percentile([NaN], 0.95)).toThrow(RangeError)
    expect(() => percentile([10], 2)).toThrow(RangeError)
    expect(() => hasSustainedHeapGrowth([1, 2])).toThrow(RangeError)
  })

  it('accepts bounded heap growth with ordinary V8 fluctuation', () => {
    expect(hasSustainedHeapGrowth([100_000_000, 100_400_000, 100_100_000, 100_700_000, 100_500_000, 100_900_000], {
      maxGrowthBytes: 2_000_000,
    })).toBe(false)
  })

  it('detects a sustained trend only when growth exceeds the explicit budget', () => {
    expect(hasSustainedHeapGrowth([100_000_000, 102_000_000, 104_000_000, 106_000_000, 108_000_000, 110_000_000], {
      maxGrowthBytes: 2_000_000,
    })).toBe(true)
    expect(hasSustainedHeapGrowth([100_000_000, 102_000_000, 101_000_000, 103_000_000, 102_000_000, 104_000_000], {
      maxGrowthBytes: 2_000_000,
    })).toBe(false)
  })

  it('rejects invalid heap growth budgets', () => {
    expect(() => hasSustainedHeapGrowth([1, 2, 3, 4, 5], { maxGrowthBytes: 0 })).toThrow(RangeError)
  })
})
