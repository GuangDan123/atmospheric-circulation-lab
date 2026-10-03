import type { GlobeLayerTransform } from '../projectGlobe'

type SurfaceLayerProps = Readonly<{
  transform: GlobeLayerTransform
}>

export function SurfaceLayer({ transform }: SurfaceLayerProps) {
  return (
    <group scale={transform.scale} name="globe-layer-surface">
      <mesh>
        <sphereGeometry args={[1, 48, 32]} />
        <meshStandardMaterial
          color="#427aa1"
          transparent
          opacity={0.48}
          roughness={0.72}
        />
      </mesh>
    </group>
  )
}
