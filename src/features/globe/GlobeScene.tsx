import { OrbitControls } from '@react-three/drei'
import type {
  LabelDensity,
} from '../../rendering/performance/profile'
import type { VisibleLayers } from '../../state/types'
import { LandSeaAnomalyLayer } from './layers/LandSeaAnomalyLayer'
import { LabelLayer } from './layers/LabelLayer'
import { LatitudeGridLayer } from './layers/LatitudeGridLayer'
import { PressureBeltLayer } from './layers/PressureBeltLayer'
import { SurfaceLayer } from './layers/SurfaceLayer'
import { VerticalMotionLayer } from './layers/VerticalMotionLayer'
import { WindLayer } from './layers/WindLayer'
import type { GlobeProjection } from './projectGlobe'

type GlobeSceneProps = Readonly<{
  projection: GlobeProjection
  visibleLayers: VisibleLayers
  selectedPressureBeltId: string | null
  onSelectPressureBelt?: (id: string) => void
  labelDensity: LabelDensity
  windRendering: 'particles' | 'streamlines'
}>

export function GlobeScene({
  projection,
  visibleLayers,
  selectedPressureBeltId,
  onSelectPressureBelt,
  labelDensity,
  windRendering,
}: GlobeSceneProps) {
  return (
    <>
      <ambientLight intensity={1.15} />
      <directionalLight position={[3, 3, 4]} intensity={1.8} />
      {visibleLayers.surface && (
        <SurfaceLayer transform={projection.layerTransforms.surface} />
      )}
      {visibleLayers['latitude-grid'] && (
        <LatitudeGridLayer
          transform={projection.layerTransforms['latitude-grid']}
        />
      )}
      {visibleLayers.pressure && (
        <PressureBeltLayer
          pressureBelts={projection.pressureBelts}
          selectedPressureBeltId={selectedPressureBeltId}
          transform={projection.layerTransforms.pressure}
          onSelectPressureBelt={onSelectPressureBelt}
        />
      )}
      {visibleLayers.pressure && projection.landSeaAnomalies.length > 0 && (
        <LandSeaAnomalyLayer
          anomalies={projection.landSeaAnomalies}
          transform={projection.layerTransforms.pressure}
        />
      )}
      {visibleLayers.wind && (
        <WindLayer
          windBelts={projection.windBelts}
          transform={projection.layerTransforms.wind}
          rendering={windRendering}
        />
      )}
      {visibleLayers['vertical-motion'] && (
        <VerticalMotionLayer
          pressureBelts={projection.pressureBelts}
          transform={projection.layerTransforms['vertical-motion']}
        />
      )}
      {visibleLayers.labels && (
        <LabelLayer
          pressureBelts={projection.pressureBelts}
          transform={projection.layerTransforms.labels}
          density={labelDensity}
          selectedPressureBeltId={selectedPressureBeltId}
        />
      )}
      <OrbitControls enablePan={false} minDistance={2.6} maxDistance={5} />
    </>
  )
}
