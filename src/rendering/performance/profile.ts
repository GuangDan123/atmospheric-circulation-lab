export type PerformanceTier = 'high' | 'standard' | 'low'

export type PerformanceSelection = PerformanceTier | 'auto'

export type LabelDensity = 'full' | 'standard' | 'reduced'

export type DeviceCapabilities = Readonly<{
  hardwareConcurrency: number
  deviceMemory: number | null
  devicePixelRatio: number
  webgl2: boolean
  prefersReducedPerformance: boolean
}>

export type PerformanceProfile = Readonly<{
  tier: PerformanceTier
  particleCount: number
  pixelRatio: number
  postprocessing: boolean
  labelDensity: LabelDensity
  windRendering: 'particles' | 'streamlines'
  teachingLayers: Readonly<{
    pressure: true
    wind: true
    verticalMotion: true
    causalChain: true
  }>
}>

const teachingLayers = {
  pressure: true,
  wind: true,
  verticalMotion: true,
  causalChain: true,
} as const

function profileFor(
  tier: PerformanceTier,
  capabilities: DeviceCapabilities,
): PerformanceProfile {
  if (tier === 'low') {
    return {
      tier,
      particleCount: 0,
      pixelRatio: 1,
      postprocessing: false,
      labelDensity: 'reduced',
      windRendering: 'streamlines',
      teachingLayers,
    }
  }

  if (tier === 'standard') {
    return {
      tier,
      particleCount: 1200,
      pixelRatio: Math.min(capabilities.devicePixelRatio, 1.5),
      postprocessing: false,
      labelDensity: 'standard',
      windRendering: 'particles',
      teachingLayers,
    }
  }

  return {
    tier,
    particleCount: 2400,
    pixelRatio: Math.min(capabilities.devicePixelRatio, 2),
    postprocessing: true,
    labelDensity: 'full',
    windRendering: 'particles',
    teachingLayers,
  }
}

function detectTier(capabilities: DeviceCapabilities): PerformanceTier {
  if (
    capabilities.prefersReducedPerformance ||
    !capabilities.webgl2 ||
    capabilities.hardwareConcurrency <= 2 ||
    (capabilities.deviceMemory !== null && capabilities.deviceMemory <= 2)
  ) {
    return 'low'
  }

  if (
    capabilities.hardwareConcurrency >= 8 &&
    (capabilities.deviceMemory === null || capabilities.deviceMemory >= 8) &&
    capabilities.webgl2
  ) {
    return 'high'
  }

  return 'standard'
}

export function getPerformanceProfile(
  capabilities: DeviceCapabilities,
  manualTier?: PerformanceTier,
): PerformanceProfile {
  return profileFor(manualTier ?? detectTier(capabilities), capabilities)
}

export function createPerformanceProfile(
  capabilities: DeviceCapabilities,
): PerformanceProfile {
  return getPerformanceProfile(capabilities)
}

export function detectDeviceCapabilities(): DeviceCapabilities {
  const browserNavigator = typeof navigator === 'undefined' ? undefined : navigator
  const memory = browserNavigator as Navigator & { deviceMemory?: number }
  let webgl2 = false

  if (typeof document !== 'undefined') {
    try {
      webgl2 = Boolean(document.createElement('canvas').getContext('webgl2'))
    } catch {
      webgl2 = false
    }
  }

  return {
    hardwareConcurrency: browserNavigator?.hardwareConcurrency ?? 4,
    deviceMemory: memory?.deviceMemory ?? null,
    devicePixelRatio: typeof window === 'undefined' ? 1 : window.devicePixelRatio,
    webgl2,
    prefersReducedPerformance:
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true,
  }
}
