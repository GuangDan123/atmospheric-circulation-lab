import { useState } from 'react'
import type { AtmosphereSnapshot } from '../../domain/atmosphere/deriveAtmosphere'
import type { AssessmentResult, DiagnosisCode, StudentAnswer } from '../../domain/assessment/types'
import { validateAnswer, windTask } from '../../domain/assessment/validators'
import { appendRecord, browserRecordStorage, clearRecords, exportRecords, loadRecords } from '../../state/learningRecords'
import { WindDrawingTask } from './WindDrawingTask'

const feedback: Record<DiagnosisCode, string> = {
  correct: '答案正确：各环节与当前科学快照一致。',
  'invalid-answer': '答案不完整或输入超出范围，请检查所有环节。',
  'pressure-gradient': '气压梯度方向错误：近地面气流由高压流向低压。',
  'hemisphere-deflection': '南北半球偏转错误：检查半球、自转方向及地转偏向开关。',
  'wind-source': '气流去向与风向来源混淆：风以吹来的方向命名。',
  formation: '热力/动力成因混淆：副热带高压主要由高空气流下沉形成。',
  month: '忽略月份：请依据当前月份重新判断。',
  'land-sea': '忽略海陆差异：请检查当前海陆差异参数是否启用。',
}

type Props = Readonly<{ snapshot: AtmosphereSnapshot; onPause: () => void }>

export function StudentLearningPanel({ snapshot, onPause }: Props) {
  const [answer, setAnswer] = useState<StudentAnswer>({ gradient: 'high-to-low', deflection: 'right', destination: 'southwest', source: 'northeast', formation: 'dynamic', month: snapshot.parameters.month, landSea: (snapshot.parameters.landSeaContrast ?? 0) > 0 })
  const [submitted, setSubmitted] = useState<{ answer: StudentAnswer; parameters: string } | null>(null)
  const [result, setResult] = useState<AssessmentResult | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [records, setRecords] = useState(() => loadRecords(browserRecordStorage()))
  const parameters = JSON.stringify(snapshot.parameters)
  const current = submitted?.parameters === parameters

  function update(field: keyof StudentAnswer, value: StudentAnswer[keyof StudentAnswer]) {
    setAnswer((previous) => ({ ...previous, [field]: value }))
    setSubmitted(null)
    setResult(null)
    setRevealed(false)
  }

  function verify() {
    if (!submitted || !current) return
    const next = validateAnswer(windTask, snapshot, submitted.answer)
    setResult(next)
    setRecords(appendRecord(browserRecordStorage(), { taskId: windTask.id, month: snapshot.parameters.month, ...next }, records.records))
  }

  function download() {
    const url = URL.createObjectURL(new Blob([exportRecords(records.records)], { type: 'application/json' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'circulation-learning.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  return <>
    <section className="panel" aria-label="学生诊断任务">
      <h2>学生诊断：北半球信风</h2>
      <p>预测 → 提交 → 验证 → 操作月份、自转或海陆变量 → 修订再提交 → 揭示因果链。提交时暂停模拟；变量改变后必须重新提交。</p>
      <label>气压梯度<select aria-label="气压梯度" value={answer.gradient} onChange={(event) => update('gradient', event.target.value)}><option value="high-to-low">高压流向低压</option><option value="low-to-high">低压流向高压</option></select></label>
      <label>任务偏转<select aria-label="任务偏转" value={answer.deflection} onChange={(event) => update('deflection', event.target.value)}><option value="right">右偏</option><option value="left">左偏</option><option value="none">不偏转</option></select></label>
      <WindDrawingTask destination={answer.destination} source={answer.source} onChange={update} />
      <label>副热带高压成因<select aria-label="副热带高压成因" value={answer.formation} onChange={(event) => update('formation', event.target.value)}><option value="dynamic">动力成因</option><option value="thermal">热力成因</option></select></label>
      <label>答案月份<input aria-label="答案月份" type="number" min="1" max="12" value={answer.month} onChange={(event) => update('month', Number(event.target.value))} /></label>
      <label><input type="checkbox" checked={answer.landSea} onChange={(event) => update('landSea', event.target.checked)} />答案考虑海陆差异</label>
      <button type="button" onClick={() => { onPause(); setSubmitted({ answer: { ...answer }, parameters }); setResult(null); setRevealed(false) }}>提交任务预测</button>
      <button type="button" disabled={!current || result !== null} onClick={verify}>验证答案</button>
      {submitted && !current && <p>参数已变化，请操作后重新提交。</p>}
      {result && current && <p role="status">{feedback[result.diagnosisCode]} 证据：{result.evidenceObjectIds.join('、')}</p>}
      <button type="button" disabled={!result || !current} onClick={() => setRevealed(true)}>揭示因果链</button>
      {revealed && current && <p>高压流向低压 → 随半球与自转发生偏转 → 气流去向与来源相反；副热带下沉形成动力高压，月份移动和海陆扰动共同影响控制关系。</p>}
    </section>
    <section className="panel" aria-label="本地学习记录">
      <h2>本地学习记录</h2>
      <p role="status">{records.records.length} 条学习记录。{records.status === 'recovered' ? '损坏记录已恢复为空，可以继续学习。' : records.status === 'unavailable' ? '本地存储不可用，当前记录仅在内存中；清除持久记录可能失败。' : '仅保存在本机，不采集身份信息，不上传。'}</p>
      <button type="button" onClick={download}>导出学习记录</button>
      <button type="button" onClick={() => setRecords(clearRecords(browserRecordStorage()))}>清除学习记录</button>
    </section>
  </>
}
