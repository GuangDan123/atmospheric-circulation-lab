export type DiagnosisCode = 'correct' | 'invalid-answer' | 'pressure-gradient' | 'hemisphere-deflection' | 'wind-source' | 'formation' | 'month' | 'land-sea'
export type CompassDirection = 'north' | 'south' | 'northeast' | 'northwest' | 'southeast' | 'southwest'
export type StudentAnswer = Readonly<{
  gradient: string
  deflection: string
  destination: CompassDirection
  source: CompassDirection
  formation: string
  month: number
  landSea: boolean
}>
export type AssessmentTask = Readonly<{ id: string; hemisphere: 'northern' | 'southern' }>
export type AssessmentResult = Readonly<{ correct: boolean; diagnosisCode: DiagnosisCode; evidenceObjectIds: readonly string[] }>
