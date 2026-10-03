import { useEffect } from 'react'
import { getActiveCausalStep } from '../../domain/causality/causalPlayback'
import type { PlaybackStatus } from '../../domain/causality/types'
import { subtropicalHighScenario } from '../../scenarios/p0/subtropicalHigh'

type CausalPanelProps = Readonly<{
  coriolisEnabled: boolean
  selectedPressureBeltId: string | null
  teachingStep: number
  playback: PlaybackStatus
  speed: number
  onTeachingStepChange: (step: number) => void
  onPrevious: () => void
  onNext: () => void
  onPlaybackChange: (playback: PlaybackStatus) => void
}>

export function CausalPanel({
  coriolisEnabled,
  selectedPressureBeltId,
  teachingStep,
  playback,
  speed,
  onTeachingStepChange,
  onPrevious,
  onNext,
  onPlaybackChange,
}: CausalPanelProps) {
  const controlledPlayback = {
    scenarioId: subtropicalHighScenario.id,
    stepIndex: teachingStep,
    playback,
    speed,
  } as const

  useEffect(() => {
    if (playback !== 'playing') return

    const timer = window.setTimeout(() => {
      const nextStep = Math.min(
        teachingStep + 1,
        subtropicalHighScenario.steps.length - 1,
      )

      if (nextStep === teachingStep) {
        onPlaybackChange('paused')
        return
      }

      onTeachingStepChange(nextStep)
    }, 1000 / speed)

    return () => window.clearTimeout(timer)
  }, [
    onPlaybackChange,
    onTeachingStepChange,
    playback,
    speed,
    teachingStep,
  ])

  const step = getActiveCausalStep(controlledPlayback, subtropicalHighScenario)
  const displayedStep = coriolisEnabled
    ? step
    : { ...step, ...step.whenCoriolisDisabled }

  return (
    <section aria-label="因果链面板" className="panel causal-panel">
      <h2>{subtropicalHighScenario.title}</h2>
      <p className="causal-panel__progress">
        第 {controlledPlayback.stepIndex + 1} / {subtropicalHighScenario.steps.length} 步
      </p>
      <h3>{displayedStep.title}</h3>
      <p>{displayedStep.explanation}</p>
      {selectedPressureBeltId?.includes('subtropical') && (
        <p aria-label="当前选中气压带成因">动力成因</p>
      )}
      <div className="causal-panel__labels">
        {displayedStep.labels.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
      <div className="causal-panel__actions">
        <button type="button" onClick={onPrevious}>
          上一步
        </button>
        <button type="button" onClick={onNext}>
          下一步
        </button>
        <button
          type="button"
          aria-pressed={playback === 'playing'}
          onClick={() => onPlaybackChange('playing')}
        >
          播放
        </button>
        <button
          type="button"
          aria-pressed={playback === 'paused'}
          onClick={() => onPlaybackChange('paused')}
        >
          暂停
        </button>
        <button
          type="button"
          aria-label="重置因果链"
          onClick={() => {
            onTeachingStepChange(0)
            onPlaybackChange('paused')
          }}
        >
          重置
        </button>
      </div>
    </section>
  )
}
