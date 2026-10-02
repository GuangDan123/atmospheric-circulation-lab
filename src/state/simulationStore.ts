import { create } from 'zustand'
import {
  deriveAtmosphere,
  type AtmosphereSnapshot,
} from '../domain/atmosphere/deriveAtmosphere'
import type {
  Month,
  RotationDirection,
  SimulationParameters,
} from '../domain/atmosphere/types'
import {
  createHistory,
  pushHistory,
  redoHistory,
  undoHistory,
  type History,
} from './history'
import type {
  SimulationPreset,
  TeachingState,
  ViewProjection,
  VisibleLayer,
  VisibleLayers,
} from './types'

const defaultVisibleLayers: VisibleLayers = {
  surface: true,
  'latitude-grid': true,
  pressure: true,
  wind: true,
  'vertical-motion': true,
  labels: true,
}

export const initialSimulationState = {
  month: 6 as Month,
  coriolisEnabled: true,
  rotationDirection: 1 as RotationDirection,
  rotationStrength: 1,
  frictionStrength: 0,
  seasonalShiftScale: 0.25,
  selectedPressureBeltId: null,
  keyframeId: null,
  teachingStep: 0,
  explodedViewProgress: 0,
  visibleLayers: defaultVisibleLayers,
} as const

type SimulationValues = {
  month: Month
  coriolisEnabled: boolean
  rotationDirection: RotationDirection
  rotationStrength: number
  frictionStrength: number
  seasonalShiftScale: number
  selectedPressureBeltId: string | null
  keyframeId: string | null
  teachingStep: number
  explodedViewProgress: number
  visibleLayers: VisibleLayers
  history: History<TeachingState>
}

type SimulationActions = {
  setMonth: (month: number) => void
  setCoriolisEnabled: (enabled: boolean) => void
  setRotationDirection: (direction: RotationDirection) => void
  setFrictionStrength: (strength: number) => void
  selectPressureBelt: (id: string | null) => void
  setExplodedViewProgress: (progress: number) => void
  setVisibleLayer: (layer: VisibleLayer, visible: boolean) => void
  applyPreset: (preset: SimulationPreset) => void
  undo: () => void
  redo: () => void
  reset: () => void
}

export type SimulationStoreState = SimulationValues & SimulationActions

function assertFiniteInRange(
  value: number,
  name: string,
  minimum: number,
  maximum: number,
): void {
  if (!Number.isFinite(value) || value < minimum || value > maximum) {
    throw new RangeError(`${name} must be from ${minimum} to ${maximum}`)
  }
}

function assertMonth(month: number): asserts month is Month {
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new RangeError('month must be an integer from 1 to 12')
  }
}

function assertRotationDirection(
  direction: number,
): asserts direction is RotationDirection {
  if (direction !== 1 && direction !== -1) {
    throw new RangeError('rotationDirection must be 1 or -1')
  }
}

function toTeachingState(state: SimulationValues): TeachingState {
  return {
    month: state.month,
    coriolisEnabled: state.coriolisEnabled,
    rotationDirection: state.rotationDirection,
    rotationStrength: state.rotationStrength,
    frictionStrength: state.frictionStrength,
    seasonalShiftScale: state.seasonalShiftScale,
    selectedPressureBeltId: state.selectedPressureBeltId,
    keyframeId: state.keyframeId,
    teachingStep: state.teachingStep,
  }
}

function restoreTeachingState(
  teachingState: TeachingState,
): Pick<
  SimulationValues,
  | 'month'
  | 'coriolisEnabled'
  | 'rotationDirection'
  | 'rotationStrength'
  | 'frictionStrength'
  | 'seasonalShiftScale'
  | 'selectedPressureBeltId'
  | 'keyframeId'
  | 'teachingStep'
> {
  return teachingState
}

function recordChange(
  state: SimulationStoreState,
  change: Partial<TeachingState>,
): Partial<SimulationValues> {
  return {
    ...change,
    history: pushHistory(state.history, toTeachingState(state)),
  }
}

export const useSimulationStore = create<SimulationStoreState>((set) => ({
  ...initialSimulationState,
  history: createHistory<TeachingState>(),
  setMonth: (month) => {
    assertMonth(month)
    set((state) => recordChange(state, { month }))
  },
  setCoriolisEnabled: (coriolisEnabled) => {
    set((state) => recordChange(state, { coriolisEnabled }))
  },
  setRotationDirection: (rotationDirection) => {
    assertRotationDirection(rotationDirection)
    set((state) => recordChange(state, { rotationDirection }))
  },
  setFrictionStrength: (frictionStrength) => {
    assertFiniteInRange(frictionStrength, 'frictionStrength', 0, 1)
    set((state) => recordChange(state, { frictionStrength }))
  },
  selectPressureBelt: (selectedPressureBeltId) => {
    set((state) => recordChange(state, { selectedPressureBeltId }))
  },
  setExplodedViewProgress: (explodedViewProgress) => {
    assertFiniteInRange(
      explodedViewProgress,
      'explodedViewProgress',
      0,
      1,
    )
    set({ explodedViewProgress })
  },
  setVisibleLayer: (layer, visible) => {
    set((state) => ({
      visibleLayers: { ...state.visibleLayers, [layer]: visible },
    }))
  },
  applyPreset: (preset) => {
    assertMonth(preset.parameters.month)
    assertRotationDirection(preset.parameters.rotationDirection)
    assertFiniteInRange(
      preset.parameters.rotationStrength,
      'rotationStrength',
      0,
      1,
    )
    assertFiniteInRange(
      preset.parameters.frictionStrength,
      'frictionStrength',
      0,
      1,
    )
    assertFiniteInRange(
      preset.parameters.seasonalShiftScale,
      'seasonalShiftScale',
      0,
      1,
    )
    if (!Number.isInteger(preset.teachingStep) || preset.teachingStep < 0) {
      throw new RangeError('teachingStep must be a non-negative integer')
    }
    set((state) =>
      recordChange(state, {
        ...preset.parameters,
        selectedPressureBeltId: preset.selectedPressureBeltId,
        keyframeId: preset.keyframeId,
        teachingStep: preset.teachingStep,
      }),
    )
  },
  undo: () => {
    set((state) => {
      const transition = undoHistory(
        state.history,
        toTeachingState(state),
      )
      return {
        ...restoreTeachingState(transition.value),
        history: transition.history,
      }
    })
  },
  redo: () => {
    set((state) => {
      const transition = redoHistory(
        state.history,
        toTeachingState(state),
      )
      return {
        ...restoreTeachingState(transition.value),
        history: transition.history,
      }
    })
  },
  reset: () => {
    set({
      ...initialSimulationState,
      visibleLayers: { ...defaultVisibleLayers },
      history: createHistory<TeachingState>(),
    })
  },
}))

let cachedParameters: SimulationParameters | undefined
let cachedSnapshot: AtmosphereSnapshot | undefined

function parametersEqual(
  first: SimulationParameters,
  second: SimulationParameters,
): boolean {
  return (
    first.month === second.month &&
    first.coriolisEnabled === second.coriolisEnabled &&
    first.rotationDirection === second.rotationDirection &&
    first.rotationStrength === second.rotationStrength &&
    first.frictionStrength === second.frictionStrength &&
    first.seasonalShiftScale === second.seasonalShiftScale
  )
}

export function selectAtmosphereSnapshot(
  state: SimulationStoreState,
): AtmosphereSnapshot {
  const parameters: SimulationParameters = {
    month: state.month,
    coriolisEnabled: state.coriolisEnabled,
    rotationDirection: state.rotationDirection,
    rotationStrength: state.rotationStrength,
    frictionStrength: state.frictionStrength,
    seasonalShiftScale: state.seasonalShiftScale,
  }

  if (
    cachedParameters === undefined ||
    cachedSnapshot === undefined ||
    !parametersEqual(cachedParameters, parameters)
  ) {
    cachedParameters = parameters
    cachedSnapshot = deriveAtmosphere(parameters)
  }

  return cachedSnapshot
}

export function selectViewProjection(
  state: SimulationStoreState,
): ViewProjection {
  return {
    snapshot: selectAtmosphereSnapshot(state),
    selectedPressureBeltId: state.selectedPressureBeltId,
    explodedViewProgress: state.explodedViewProgress,
    visibleLayers: state.visibleLayers,
  }
}
