import { monsoonLabel } from '../monsoon/monsoonLabels'
import { Canvas } from '@react-three/fiber'
import type { AtmosphereSnapshot } from '../../domain/atmosphere/deriveAtmosphere'
import type {
  LabelDensity,
  PerformanceProfile,
} from '../../rendering/performance/profile'
import type { VisibleLayers } from '../../state/types'
import { MapProjection } from '../map-projection/MapProjection'
import { MeridionalSection } from '../meridional-section/MeridionalSection'
import { GlobeScene } from './GlobeScene'
import { projectGlobe } from './projectGlobe'

type GlobeViewProps = Readonly<{
  snapshot: AtmosphereSnapshot
  visibleLayers: VisibleLayers
  selectedPressureBeltId?: string | null
  explodedViewProgress?: number
  performanceProfile?: PerformanceProfile
  labelDensity?: LabelDensity
  webGLAvailable?: boolean
  onSelectPressureBelt?: (id: string) => void
}>

function supportsWebGL(): boolean {
  if (typeof document === 'undefined') {
    return false
  }

  try {
    const canvas = document.createElement('canvas')
    return Boolean(
      canvas.getContext('webgl2') || canvas.getContext('webgl'),
    )
  } catch {
    return false
  }
}

export function GlobeView({
  snapshot,
  visibleLayers,
  selectedPressureBeltId = null,
  explodedViewProgress = 0,
  performanceProfile,
  labelDensity,
  webGLAvailable = supportsWebGL(),
  onSelectPressureBelt,
}: GlobeViewProps) {
  if (!webGLAvailable) {
    return (
      <section aria-label="二维科学视图降级入口">
        <p role="status">三维视图不可用，已切换到二维科学视图。</p>
        <MeridionalSection
          snapshot={snapshot}
          selectedPressureBeltId={selectedPressureBeltId}
          onSelectPressureBelt={onSelectPressureBelt}
        />
        <MapProjection
          snapshot={snapshot}
          selectedPressureBeltId={selectedPressureBeltId}
          onSelectPressureBelt={onSelectPressureBelt}
        />
      </section>
    )
  }

  const projection = projectGlobe(snapshot, explodedViewProgress)

  return (
    <section aria-label="三维全球大气环流球面视图">
      {(snapshot.parameters.landSeaContrast ?? 0) > 0 && <div aria-label="季风投影">
        {projection.monsoons.map((result) => <p key={result.region} data-source-id={`monsoon:${result.region}`} data-direction={result.direction}>{monsoonLabel(result)}</p>)}
      </div>}
      <Canvas
        dpr={performanceProfile?.pixelRatio}
        camera={{ position: [0, 0.4, 3.25], fov: 48 }}
      >
        <GlobeScene
          projection={projection}
          visibleLayers={visibleLayers}
          selectedPressureBeltId={selectedPressureBeltId}
          onSelectPressureBelt={onSelectPressureBelt}
          labelDensity={
            labelDensity ?? performanceProfile?.labelDensity ?? 'full'
          }
          windRendering={performanceProfile?.windRendering ?? 'particles'}
        />
      </Canvas>
    </section>
  )
}
