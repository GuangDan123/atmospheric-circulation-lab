export type PlaybackStatus = 'paused' | 'playing'

export type CausalStepVariant = Readonly<{
  title: string
  explanation: string
  activeObjectIds: readonly string[]
}>

export type CausalStep = Readonly<{
  id: string
  title: string
  explanation: string
  labels: readonly string[]
  activeObjectIds: readonly string[]
  cameraPresetId: string
  pauseAfter: boolean
  causes: readonly string[]
  whenCoriolisDisabled: CausalStepVariant
}>

export type CausalScenario = Readonly<{
  id: string
  title: string
  steps: readonly CausalStep[]
}>

export type CausalPlaybackState = Readonly<{
  scenarioId: string
  stepIndex: number
  playback: PlaybackStatus
  speed: number
}>
