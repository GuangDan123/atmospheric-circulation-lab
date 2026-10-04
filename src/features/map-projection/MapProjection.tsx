import type { KeyboardEvent } from 'react'
import type { AtmosphereSnapshot } from '../../domain/atmosphere/deriveAtmosphere'
import {
  projectMap,
  type MapLandSeaAnomaly,
  type MapPressureBelt,
} from './projectMap'

type MapProjectionProps = Readonly<{
  snapshot: AtmosphereSnapshot
  centralLongitude?: number
  selectedPressureBeltId?: string | null
  onSelectPressureBelt?: (id: string) => void
}>

const latitudeLabels = [
  { latitude: 90, label: '北极地' },
  { latitude: 60, label: '60°N' },
  { latitude: 30, label: '30°N' },
  { latitude: 0, label: '赤道' },
  { latitude: -30, label: '30°S' },
  { latitude: -60, label: '60°S' },
  { latitude: -90, label: '南极地' },
] as const

function yForLatitude(latitude: number): number {
  return 20 + ((90 - latitude) / 180) * 360
}

function pressureBeltName(belt: MapPressureBelt): string {
  if (belt.sourceId.includes('equatorial')) {
    return '赤道低压'
  }

  const hemisphere = belt.sourceId.endsWith('south')
    ? '南半球'
    : '北半球'
  const kind = belt.sourceId.includes('subtropical')
    ? '副热带高压'
    : belt.sourceId.includes('subpolar')
      ? '副极地低压'
      : '极地高压'

  return `${hemisphere}${kind}`
}

function beltDescription(belt: MapPressureBelt): string {
  const formation = belt.formation === 'dynamic' ? '动力成因' : '热力成因'
  const motion = belt.verticalMotion === 'rising' ? '上升气流' : '下沉气流'
  return `${formation}，${motion}`
}

function anomalyDescription(anomaly: MapLandSeaAnomaly): string {
  return `${anomaly.kind === 'high' ? '高压' : '低压'}，海陆差异异常强度 ${Math.round(anomaly.anomalyStrength * 100)}%`
}

function longitudeLabel(longitude: number): string {
  if (longitude === 0) {
    return '中央经线 0°'
  }
  return `中央经线 ${Math.abs(longitude)}°${longitude > 0 ? 'E' : 'W'}`
}

export function MapProjection({
  snapshot,
  centralLongitude = 0,
  selectedPressureBeltId = null,
  onSelectPressureBelt,
}: MapProjectionProps) {
  const projection = projectMap(snapshot, centralLongitude)

  function selectOnKeyboard(
    event: KeyboardEvent<SVGGElement>,
    sourceId: string,
  ): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onSelectPressureBelt?.(sourceId)
    }
  }

  return (
    <svg
      role="img"
      aria-label="全球气压带与风带平面图"
      viewBox="0 0 800 420"
    >
      <text x={400} y={410} textAnchor="middle">
        {longitudeLabel(projection.centralLongitude)}
      </text>
      {latitudeLabels.map(({ latitude, label }) => {
        const y = yForLatitude(latitude)
        return (
          <g key={latitude}>
            <line x1={50} x2={750} y1={y} y2={y} stroke="currentColor" />
            <text x={45} y={y} textAnchor="end">
              {label}
            </text>
          </g>
        )
      })}
      {projection.windBelts.map((belt) => (
        <rect
          key={belt.sourceId}
          data-source-id={belt.sourceId}
          x={50}
          y={Math.min(belt.coordinates.y1, belt.coordinates.y2)}
          width={700}
          height={Math.abs(belt.coordinates.y2 - belt.coordinates.y1)}
          fill="none"
          stroke="currentColor"
        />
      ))}
      {projection.landSeaAnomalies.map((anomaly) => (
        <g
          key={anomaly.sourceId}
          data-source-id={anomaly.sourceId}
          aria-label={anomaly.name}
          aria-description={`${anomalyDescription(anomaly)}，${anomaly.source}`}
        >
          <circle
            cx={anomaly.coordinates.x}
            cy={anomaly.coordinates.y}
            r={5 + anomaly.anomalyStrength * 5}
            fill={anomaly.kind === 'high' ? '#ef4444' : '#38bdf8'}
            opacity={0.45 + anomaly.anomalyStrength * 0.55}
          />
        </g>
      ))}
      {projection.pressureBelts.map((belt) => (
        <g
          key={belt.sourceId}
          role="button"
          tabIndex={0}
          data-dimmed={
            selectedPressureBeltId !== null &&
            selectedPressureBeltId !== belt.sourceId
              ? 'true'
              : undefined
          }
          aria-label={pressureBeltName(belt)}
          aria-description={beltDescription(belt)}
          aria-current={
            selectedPressureBeltId === belt.sourceId ? 'true' : undefined
          }
          data-source-id={belt.sourceId}
          onClick={() => onSelectPressureBelt?.(belt.sourceId)}
          onKeyDown={(event) => selectOnKeyboard(event, belt.sourceId)}
        >
          <line
            x1={50}
            x2={750}
            y1={belt.coordinates.y}
            y2={belt.coordinates.y}
            stroke="currentColor"
            strokeWidth={selectedPressureBeltId === belt.sourceId ? 8 : 5}
            opacity={
              selectedPressureBeltId !== null &&
              selectedPressureBeltId !== belt.sourceId
                ? 0.24
                : 1
            }
          />
        </g>
      ))}
    </svg>
  )
}
