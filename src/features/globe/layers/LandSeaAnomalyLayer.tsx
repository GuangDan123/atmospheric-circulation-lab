import type { LandSeaFieldPoint } from '../../../domain/atmosphere/landSeaModel'
import type { GlobeLandSeaAnomaly } from '../projectGlobe'

type LandSeaAnomalyLayerProps = Readonly<{
  field: readonly LandSeaFieldPoint[]
  anomalies: readonly GlobeLandSeaAnomaly[]
  transform: Readonly<{ scale: number }>
}>

function anomalyColor(kind: GlobeLandSeaAnomaly['kind']): string {
  return kind === 'high' ? '#ef4444' : '#38bdf8'
}

export function LandSeaAnomalyLayer({
  anomalies,
  field,
  transform,
}: LandSeaAnomalyLayerProps) {
  return (
    <group scale={transform.scale} name="globe-layer-land-sea-anomaly">
      {field.map((point, index) => {
        const latitude = point.latitude * Math.PI / 180
        const longitude = point.longitude * Math.PI / 180
        return (
          <mesh key={`field-${index}`} position={[1.04 * Math.cos(latitude) * Math.sin(longitude), 1.04 * Math.sin(latitude), 1.04 * Math.cos(latitude) * Math.cos(longitude)]} rotation={[-latitude, longitude, 0]}>
            <planeGeometry args={[0.18 * Math.cos(latitude), 0.18]} />
            <meshBasicMaterial color={point.value > 0 ? '#ef4444' : '#38bdf8'} transparent opacity={Math.min(0.5, Math.abs(point.value) * 0.5)} depthWrite={false} />
          </mesh>
        )
      })}
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
