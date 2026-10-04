import type { GlobeLandSeaAnomaly } from '../projectGlobe'

type LandSeaAnomalyLayerProps = Readonly<{
  anomalies: readonly GlobeLandSeaAnomaly[]
  transform: Readonly<{ scale: number }>
}>

function anomalyColor(kind: GlobeLandSeaAnomaly['kind']): string {
  return kind === 'high' ? '#ef4444' : '#38bdf8'
}

export function LandSeaAnomalyLayer({
  anomalies,
  transform,
}: LandSeaAnomalyLayerProps) {
  return (
    <group scale={transform.scale} name="globe-layer-land-sea-anomaly">
      {anomalies.map((anomaly) => (
        <mesh
          key={anomaly.sourceId}
          name={anomaly.sourceId}
          position={[
            anomaly.coordinates.x,
            anomaly.coordinates.y,
            anomaly.coordinates.z,
          ]}
          userData={{
            sourceId: anomaly.sourceId,
            kind: anomaly.kind,
            name: anomaly.name,
            source: anomaly.source,
          }}
        >
          <sphereGeometry args={[0.035 + anomaly.anomalyStrength * 0.035, 16, 12]} />
          <meshBasicMaterial
            color={anomalyColor(anomaly.kind)}
            transparent
            opacity={0.45 + anomaly.anomalyStrength * 0.55}
          />
        </mesh>
      ))}
    </group>
  )
}
