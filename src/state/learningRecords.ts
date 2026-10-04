import type { DiagnosisCode } from '../domain/assessment/types'

export const recordKey = 'circulation-learning-v1'
export type LearningRecord = Readonly<{ taskId: string; month: number; correct: boolean; diagnosisCode: DiagnosisCode; evidenceObjectIds: readonly string[] }>
type RecordStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>
export type RecordState = { records: LearningRecord[]; status: 'ready' | 'recovered' | 'unavailable' }
const codes: readonly DiagnosisCode[] = ['correct', 'invalid-answer', 'pressure-gradient', 'hemisphere-deflection', 'wind-source', 'formation', 'month', 'land-sea']

function cleanRecord(value: unknown): LearningRecord | null {
  if (!value || typeof value !== 'object') return null
  const record = value as LearningRecord
  if (record.taskId !== 'trade-wind' || !Number.isInteger(record.month) || record.month < 1 || record.month > 12 || !codes.includes(record.diagnosisCode) || record.correct !== (record.diagnosisCode === 'correct') || !Array.isArray(record.evidenceObjectIds) || record.evidenceObjectIds.length > 10 || !record.evidenceObjectIds.every((id) => typeof id === 'string' && /^(wind-belt:trade|pressure-belt:subtropical)-(north|south)$/.test(id))) return null
  return { taskId: record.taskId, month: record.month, correct: record.correct, diagnosisCode: record.diagnosisCode, evidenceObjectIds: [...record.evidenceObjectIds] }
}

export function exportRecords(records: readonly LearningRecord[]): string {
  return JSON.stringify({ version: 1, records: records.map(cleanRecord).filter((record) => record !== null).slice(-200) }, null, 2)
}

export function loadRecords(storage: RecordStorage): RecordState {
  let raw: string | null
  try { raw = storage.getItem(recordKey) } catch { return { records: [], status: 'unavailable' } }
  if (raw === null) return { records: [], status: 'ready' }
  try {
    const parsed = JSON.parse(raw)
    if (parsed.version !== 1 || !Array.isArray(parsed.records) || parsed.records.length > 200) throw new Error('Invalid records')
    const records = parsed.records.map(cleanRecord)
    if (records.some((record: LearningRecord | null) => record === null)) throw new Error('Invalid record')
    return { records, status: 'ready' }
  } catch {
    try { storage.removeItem(recordKey) } catch { return { records: [], status: 'unavailable' } }
    return { records: [], status: 'recovered' }
  }
}

export function appendRecord(storage: RecordStorage, value: unknown, fallback: readonly LearningRecord[] = []): RecordState {
  const loaded = loadRecords(storage)
  const record = cleanRecord(value)
  if (!record) return loaded
  const records = [...(loaded.status === 'unavailable' ? fallback : loaded.records), record].slice(-200)
  try { storage.setItem(recordKey, exportRecords(records)) } catch { return { records, status: 'unavailable' } }
  return { records, status: 'ready' }
}

export function clearRecords(storage: RecordStorage): RecordState {
  try { storage.removeItem(recordKey) } catch { return { records: [], status: 'unavailable' } }
  return { records: [], status: 'ready' }
}

export function browserRecordStorage(): RecordStorage {
  return {
    getItem: (key) => window.localStorage.getItem(key),
    setItem: (key, value) => window.localStorage.setItem(key, value),
    removeItem: (key) => window.localStorage.removeItem(key),
  }
}
