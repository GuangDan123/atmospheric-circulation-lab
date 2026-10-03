import type { GlobeLayerTransform, GlobeWindBelt } from '../projectGlobe'

type WindLayerProps = Readonly<{
  windBelts: readonly GlobeWindBelt[]
  transform: GlobeLayerTransform
  rendering: 'particles' | 'streamlines'
}>

export function WindLayer({ windBelts, transform, rendering }: WindLayerProps) {
  return (
    <group
      scale={transform.scale}
      name="globe-layer-wind"
      userData={{ rendering }}
    >
      {windBelts.map((belt) => (
        <mesh
          key={belt.sourceId}
          name={belt.sourceId}
          position={[0, belt.coordinates.height, 0]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <torusGeometry args={[belt.coordinates.radius, 0.006, 5, 64]} />
          <meshBasicMaterial color="#22d3ee" transparent opacity={0.58} />
        </mesh>
      ))}
    </group>
  )
}
