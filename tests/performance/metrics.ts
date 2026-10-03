export function percentile(samples: readonly number[], quantile: number): number {
  if (samples.length === 0 || samples.some((value) => !Number.isFinite(value)) ||
    !Number.isFinite(quantile) || quantile <= 0 || quantile > 1) {
    throw new RangeError('Expected finite samples and a quantile in (0, 1]')
  }
  return [...samples].sort((a, b) => a - b)[Math.ceil(samples.length * quantile) - 1]
}

export type HeapGrowthOptions = {
  maxGrowthBytes?: number
  minimumIncreasingRatio?: number
}

export function hasSustainedHeapGrowth(
  samples: readonly number[],
  options: HeapGrowthOptions = {},
): boolean {
  const maxGrowthBytes = options.maxGrowthBytes ?? 1_000_000
  const minimumIncreasingRatio = options.minimumIncreasingRatio ?? 0.8
  if (samples.length < 5 || samples.some((value) => !Number.isFinite(value)) ||
    !Number.isFinite(maxGrowthBytes) || maxGrowthBytes <= 0 ||
    !Number.isFinite(minimumIncreasingRatio) || minimumIncreasingRatio <= 0 || minimumIncreasingRatio > 1) {
    throw new RangeError('Expected at least five finite heap samples and valid growth options')
  }
  const increasingSamples = samples.slice(1).filter((value, index) => value > samples[index]).length
  const growthBytes = samples[samples.length - 1] - samples[0]
  return growthBytes > maxGrowthBytes && increasingSamples / (samples.length - 1) >= minimumIncreasingRatio
}
