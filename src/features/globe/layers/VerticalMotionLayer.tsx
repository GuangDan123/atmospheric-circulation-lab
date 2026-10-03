import type { GlobeLayerTransform, GlobePressureBelt } from '../projectGlobe'

type VerticalMotionLayerProps = Readonly<{
  pressureBelts: readonly GlobePressureBelt[]
  transform: GlobeLayerTransform
}>

export function VerticalMotionLayer({
  pressureBelts,
  transform,
}: VerticalMotionLayerProps) {
  return (
    <group scale={transform.scale} name="globe-layer-vertical-motion">
      {pressureBelts.map((belt) => {
        const direction = belt.verticalMotion === 'rising' ? 1 : -1
        return (
          <group
            key={belt.sourceId}
            name={`vertical-motion:${belt.sourceId}`}
            position={[belt.coordinates.radius, belt.coordinates.height, 0]}
          >
            <mesh position={[0, direction * 0.07, 0]}>
              <cylinderGeometry args={[0.008, 0.008, 0.12, 8]} />
              <meshBasicMaterial
                color={direction === 1 ? '#22d3ee' : '#fbbf24'}
              />
            </mesh>
            <mesh
              position={[0, direction * 0.15, 0]}
              rotation={[direction === 1 ? 0 : Math.PI, 0, 0]}
            >
              <coneGeometry args={[0.025, 0.06, 10]} />
              <meshBasicMaterial
                color={direction === 1 ? '#22d3ee' : '#fbbf24'}
              />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}
