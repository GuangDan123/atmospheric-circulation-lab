import type { GlobeLayerTransform } from '../projectGlobe'

type LatitudeGridLayerProps = Readonly<{
  transform: GlobeLayerTransform
}>

const latitudes = [-60, -30, 0, 30, 60] as const

export function LatitudeGridLayer({ transform }: LatitudeGridLayerProps) {
  return (
    <group scale={transform.scale} name="globe-layer-latitude-grid">
      {latitudes.map((latitude) => {
        const radians = (latitude * Math.PI) / 180
        const radius = Math.cos(radians) * 1.012
        const height = Math.sin(radians) * 1.012
        return (
          <mesh
            key={latitude}
            position={[0, height, 0]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <torusGeometry args={[Math.max(0.01, radius), 0.0025, 6, 96]} />
            <meshBasicMaterial color="#b9d6e5" transparent opacity={0.72} />
          </mesh>
        )
      })}
    </group>
  )
}
