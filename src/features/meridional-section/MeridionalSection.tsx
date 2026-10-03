import type { KeyboardEvent } from 'react'
import type { AtmosphereSnapshot } from '../../domain/atmosphere/deriveAtmosphere'
import { projectSection, type SectionPressureBelt } from './projectSection'

type MeridionalSectionProps = Readonly<{
  snapshot: AtmosphereSnapshot
  selectedPressureBeltId?: string | null
  onSelectPressureBelt?: (id: string) => void
}>

const latitudeLabels = [
  { latitude: -90, label: '南极地' },
  { latitude: -60, label: '60°S' },
  { latitude: -30, label: '30°S' },
  { latitude: 0, label: '赤道' },
  { latitude: 30, label: '30°N' },
  { latitude: 60, label: '60°N' },
  { latitude: 90, label: '北极地' },
] as const

function xForLatitude(latitude: number): number {
  return 40 + ((latitude + 90) / 180) * 720
}

function pressureBeltName(belt: SectionPressureBelt): string {
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

function beltDescription(belt: SectionPressureBelt): string {
  const formation = belt.formation === 'dynamic' ? '动力成因' : '热力成因'
  const motion = belt.verticalMotion === 'rising' ? '上升气流' : '下沉气流'
  return `${formation}，${motion}`
}

export function MeridionalSection({
  snapshot,
  selectedPressureBeltId = null,
  onSelectPressureBelt,
}: MeridionalSectionProps) {
  const projection = projectSection(snapshot)

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
      aria-label="全球大气环流经向剖面"
      viewBox="0 0 800 400"
    >
      {latitudeLabels.map(({ latitude, label }) => {
        const x = xForLatitude(latitude)
        return (
          <g key={latitude}>
            <line x1={x} x2={x} y1={40} y2={350} stroke="currentColor" />
            <text x={x} y={375} textAnchor="middle">
              {label}
            </text>
          </g>
        )
      })}
      {projection.windBelts.map((belt) => (
        <line
          key={belt.sourceId}
          data-source-id={belt.sourceId}
          x1={belt.coordinates.x1}
          x2={belt.coordinates.x2}
          y1={belt.coordinates.y}
          y2={belt.coordinates.y}
          stroke="currentColor"
        />
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
          <circle
            cx={belt.coordinates.x}
            cy={belt.coordinates.y}
            r={selectedPressureBeltId === belt.sourceId ? 11 : 8}
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
