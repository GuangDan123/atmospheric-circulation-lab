import { useState } from 'react'
import { getCoriolisEffect, type CoriolisDirection } from '../../domain/atmosphere/coriolisModel'
import type { AtmosphereSnapshot } from '../../domain/atmosphere/deriveAtmosphere'
import type { SimulationPreset } from '../../state/types'

const directionLabels: Record<CoriolisDirection, string> = {
  left: '左偏',
  right: '右偏',
  none: '不偏转',
}

type PredictionCardProps = Readonly<{
  snapshot: AtmosphereSnapshot
  onApplyPreset: (preset: SimulationPreset) => void
  onPause: () => void
}>

export function PredictionCard({ snapshot, onApplyPreset, onPause }: PredictionCardProps) {
  const [answer, setAnswer] = useState<CoriolisDirection | ''>('')
  const [submitted, setSubmitted] = useState<CoriolisDirection | null>(null)
  const [verified, setVerified] = useState(false)
  const parameters = snapshot.parameters
  const matchesExperiment = parameters.rotationDirection === -1 &&
    parameters.rotationStrength === 1 && parameters.coriolisEnabled &&
    parameters.frictionStrength === 0
  const effect = getCoriolisEffect({
    latitude: 30,
    rotationDirection: parameters.rotationDirection,
    rotationStrength: parameters.rotationStrength,
    frictionStrength: parameters.frictionStrength,
    enabled: parameters.coriolisEnabled,
  })

  function runVerification(): void {
    onPause()
    onApplyPreset({
      parameters: {
        ...parameters,
        rotationDirection: -1,
        rotationStrength: 1,
        coriolisEnabled: true,
        frictionStrength: 0,
      },
      selectedPressureBeltId: null,
      keyframeId: 'prediction:reverse-rotation',
      teachingStep: 0,
    })
    setVerified(true)
  }

  return (
    <section aria-label="基础预测面板" className="panel">
      <h2>先预测，再验证</h2>
      <p>北纬 30°：开启地转偏向，自转相对强度为 1、摩擦为 0。反向自转后，运动气流相对前进方向如何偏转？</p>
      <label>
        预测偏转方向
        <select aria-label="预测偏转方向" value={answer} onChange={(event) => {
          setAnswer(event.target.value as CoriolisDirection | '')
          setSubmitted(null)
          setVerified(false)
        }}>
          <option value="">请选择预测</option>
          <option value="left">左偏</option>
          <option value="right">右偏</option>
          <option value="none">不偏转</option>
        </select>
      </label>
      <button type="button" disabled={answer === ''} onClick={() => {
        if (answer !== '') setSubmitted(answer)
        setVerified(false)
      }}>提交预测</button>
      {submitted !== null && <p>已提交：{directionLabels[submitted]}。运行模拟后查看结果。</p>}
      <button type="button" disabled={submitted === null} onClick={runVerification}>运行模拟验证</button>
      {verified && matchesExperiment && submitted !== null && (
        <p role="status">
          {submitted === effect.direction ? '预测正确' : '预测与模拟不一致'}。
          实际偏转：{directionLabels[effect.direction]}；相对偏转强度：{effect.magnitude.toFixed(2)}。
          正常自转时北半球右偏，反向自转使偏转方向反转为左偏；偏转是相对气流前进方向，不是风的来源名称。
        </p>
      )}
      <p>这是参数化教学实验，不是数值天气预报；验证会更新三视图共享参数，可用撤销恢复。</p>
    </section>
  )
}
