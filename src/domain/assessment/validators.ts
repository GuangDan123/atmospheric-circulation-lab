import type { AtmosphereSnapshot } from '../atmosphere/deriveAtmosphere'
import { getCoriolisEffect } from '../atmosphere/coriolisModel'
import type { AssessmentResult, AssessmentTask, CompassDirection, DiagnosisCode, StudentAnswer } from './types'

export const windTask: AssessmentTask = { id: 'trade-wind', hemisphere: 'northern' }
const directions: readonly CompassDirection[] = ['north', 'south', 'northeast', 'northwest', 'southeast', 'southwest']
const opposites: Record<CompassDirection, CompassDirection> = { north: 'south', south: 'north', northeast: 'southwest', northwest: 'southeast', southeast: 'northwest', southwest: 'northeast' }

export function isStudentAnswer(value: unknown): value is StudentAnswer {
  if (!value || typeof value !== 'object') return false
  const a = value as StudentAnswer
  return ['high-to-low', 'low-to-high'].includes(a.gradient) && ['left', 'right', 'none'].includes(a.deflection) && directions.includes(a.destination) && directions.includes(a.source) && ['thermal', 'dynamic'].includes(a.formation) && Number.isInteger(a.month) && a.month >= 1 && a.month <= 12 && typeof a.landSea === 'boolean'
}

export function validateAnswer(task: AssessmentTask, snapshot: AtmosphereSnapshot, answer: unknown): AssessmentResult {
  const north = task.hemisphere === 'northern'
  const index = north ? 3 : 2
  const wind = snapshot.windBelts[index]
  const belt = snapshot.pressureBelts[north ? 4 : 2]
  const hemisphere = north ? 'north' : 'south'
  const evidenceObjectIds = [`wind-belt:trade-${hemisphere}`, `pressure-belt:subtropical-${hemisphere}`]
  const result = (diagnosisCode: DiagnosisCode): AssessmentResult => ({ correct: diagnosisCode === 'correct', diagnosisCode, evidenceObjectIds })
  if (!isStudentAnswer(answer)) return result('invalid-answer')
  if (answer.gradient !== 'high-to-low') return result('pressure-gradient')
  const effect = getCoriolisEffect({ ...snapshot.parameters, enabled: snapshot.parameters.coriolisEnabled, latitude: (wind.northLatitude + wind.southLatitude) / 2 })
  if (answer.deflection !== effect.direction) return result('hemisphere-deflection')
  const destination: CompassDirection = wind.eastward === null ? (wind.northward ? 'north' : 'south') : wind.northward ? (wind.eastward ? 'northeast' : 'northwest') : (wind.eastward ? 'southeast' : 'southwest')
  if (answer.destination !== destination || answer.source !== opposites[destination]) return result('wind-source')
  if (answer.formation !== belt.formation) return result('formation')
  if (answer.month !== snapshot.parameters.month) return result('month')
  if (answer.landSea !== ((snapshot.parameters.landSeaContrast ?? 0) > 0)) return result('land-sea')
  return result('correct')
}
