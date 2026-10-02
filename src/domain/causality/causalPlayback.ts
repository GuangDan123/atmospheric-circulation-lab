import type {
  CausalPlaybackState,
  CausalScenario,
  CausalStep,
  PlaybackStatus,
} from './types'

export function createPlaybackState(
  scenarioId: string,
): CausalPlaybackState {
  return {
    scenarioId,
    stepIndex: 0,
    playback: 'paused',
    speed: 1,
  }
}

function assertScenarioMatches(
  state: CausalPlaybackState,
  scenario: CausalScenario,
): void {
  if (state.scenarioId !== scenario.id) {
    throw new RangeError('playback scenario does not match causal scenario')
  }
}

export function getActiveCausalStep(
  state: CausalPlaybackState,
  scenario: CausalScenario,
): CausalStep {
  assertScenarioMatches(state, scenario)
  const step = scenario.steps[state.stepIndex]

  if (step === undefined) {
    throw new RangeError('stepIndex is outside the causal scenario')
  }

  return step
}

export function nextStep(
  state: CausalPlaybackState,
  scenario: CausalScenario,
): CausalPlaybackState {
  assertScenarioMatches(state, scenario)

  return {
    ...state,
    stepIndex: Math.min(state.stepIndex + 1, scenario.steps.length - 1),
    playback: 'paused',
  }
}

export function previousStep(
  state: CausalPlaybackState,
): CausalPlaybackState {
  return {
    ...state,
    stepIndex: Math.max(state.stepIndex - 1, 0),
    playback: 'paused',
  }
}

export function resetPlayback(
  state: CausalPlaybackState,
): CausalPlaybackState {
  return {
    ...state,
    stepIndex: 0,
    playback: 'paused',
  }
}

export function setPlayback(
  state: CausalPlaybackState,
  playback: PlaybackStatus,
): CausalPlaybackState {
  return { ...state, playback }
}

export function setPlaybackSpeed(
  state: CausalPlaybackState,
  speed: number,
): CausalPlaybackState {
  if (!Number.isFinite(speed) || speed <= 0 || speed > 4) {
    throw new RangeError('speed must be greater than 0 and at most 4')
  }

  return { ...state, speed }
}
