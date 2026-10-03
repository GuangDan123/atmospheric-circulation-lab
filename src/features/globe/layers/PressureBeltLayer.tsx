import type { GlobeLayerTransform, GlobePressureBelt } from '../projectGlobe'

type PressureBeltLayerProps = Readonly<{
  pressureBelts: readonly GlobePressureBelt[]
  selectedPressureBeltId: string | null
  transform: GlobeLayerTransform
  onSelectPressureBelt?: (id: string) => void
}>

function beltColor(belt: GlobePressureBelt): string {
  return belt.verticalMotion === 'sinking' ? '#f59e0b' : '#6366f1'
}

export function PressureBeltLayer({
  pressureBelts,
  selectedPressureBeltId,
  transform,
  onSelectPressureBelt,
}: PressureBeltLayerProps) {
  return (
    <group scale={transform.scale} name="globe-layer-pressure">
      {pressureBelts.map((belt) => {
        const selected = selectedPressureBeltId === belt.sourceId
        return (
          <mesh
            key={belt.sourceId}
            name={belt.sourceId}
            userData={{
              selected,
              dimmed: selectedPressureBeltId !== null && !selected,
            }}
            position={[0, belt.coordinates.height, 0]}
            rotation={[Math.PI / 2, 0, 0]}
            onClick={(event) => {
              event.stopPropagation()
              onSelectPressureBelt?.(belt.sourceId)
            }}
          >
            <torusGeometry
              args={[
                belt.coordinates.radius,
                selected ? 0.028 : 0.018,
                8,
                96,
              ]}
            />
            <meshBasicMaterial
              color={selected ? '#fde047' : beltColor(belt)}
              transparent
              opacity={
                selected
                  ? 1
                  : selectedPressureBeltId === null
                    ? 0.78
                    : 0.18
              }
            />
          </mesh>
        )
      })}
    </group>
  )
}
