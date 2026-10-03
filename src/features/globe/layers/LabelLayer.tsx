import { Html } from '@react-three/drei'
import type { LabelDensity } from '../../../rendering/performance/profile'
import type { GlobeLayerTransform, GlobePressureBelt } from '../projectGlobe'

type LabelLayerProps = Readonly<{
  pressureBelts: readonly GlobePressureBelt[]
  transform: GlobeLayerTransform
  density: LabelDensity
  selectedPressureBeltId: string | null
}>

function labelFor(sourceId: string): string {
  if (sourceId.includes('equatorial')) return '赤道低压'
  if (sourceId.includes('subtropical')) return '副热带高压'
  if (sourceId.includes('subpolar')) return '副极地低压'
  return '极地高压'
}

function shouldRenderLabel(
  sourceId: string,
  density: LabelDensity,
  selectedPressureBeltId: string | null,
): boolean {
  if (density === 'full') return true
  if (selectedPressureBeltId === sourceId) return true
  if (density === 'reduced') {
    return sourceId.includes('equatorial') || sourceId.includes('subtropical')
  }
  return (
    sourceId.includes('equatorial') ||
    sourceId.includes('subtropical') ||
    sourceId.includes('subpolar')
  )
}

export function LabelLayer({
  pressureBelts,
  transform,
  density,
  selectedPressureBeltId,
}: LabelLayerProps) {
  return (
    <group scale={transform.scale} name="globe-layer-labels">
      {pressureBelts
        .filter((belt) =>
          shouldRenderLabel(belt.sourceId, density, selectedPressureBeltId),
        )
        .map((belt) => (
          <Html
            key={belt.sourceId}
            position={[belt.coordinates.radius + 0.06, belt.coordinates.height, 0]}
            center
          >
            <span data-source-id={`label:${belt.sourceId}`}>
              {labelFor(belt.sourceId)}
            </span>
          </Html>
        ))}
    </group>
  )
}
