import { beforeEach, describe, expect, it } from 'vitest'
import { appendRecord, clearRecords, exportRecords, loadRecords, recordKey } from '../../src/state/learningRecords'

const record = { taskId: 'trade-wind', month: 7, correct: false, diagnosisCode: 'pressure-gradient', evidenceObjectIds: ['wind-belt:trade-north'] } as const

describe('local learning records', () => {
  beforeEach(() => localStorage.clear())
  it('persists necessary fields and exports versioned JSON without identity', () => {
    appendRecord(localStorage, { ...record, name: 'must not persist' })
    const loaded = loadRecords(localStorage)
    expect(loaded.records).toEqual([record])
    expect(JSON.parse(exportRecords(loaded.records))).toEqual({ version: 1, records: [record] })
    expect(localStorage.getItem(recordKey)).not.toContain('must not persist')
  })
  it.each(['{broken', '{"version":2,"records":[]}', '{"version":1,"records":[{}]}', '{"version":1,"records":[{"month":99}]}'])('recovers corrupt data %s and permits subsequent writes', (data) => {
    localStorage.setItem(recordKey, data)
    expect(loadRecords(localStorage)).toEqual({ records: [], status: 'recovered' })
    appendRecord(localStorage, record)
    expect(loadRecords(localStorage).records).toEqual([record])
  })
  it('clears only its own key and remains empty after reload', () => {
    localStorage.setItem('unrelated', 'keep')
    appendRecord(localStorage, record)
    expect(clearRecords(localStorage).status).toBe('ready')
    expect(loadRecords(localStorage).records).toEqual([])
    expect(localStorage.getItem('unrelated')).toBe('keep')
  })
  it('survives unavailable storage and reports that persistence failed', () => {
    const unavailable = { getItem: () => { throw new Error('blocked') }, setItem: () => { throw new Error('quota') }, removeItem: () => { throw new Error('blocked') } }
    expect(loadRecords(unavailable).status).toBe('unavailable')
    expect(appendRecord(unavailable, record).status).toBe('unavailable')
    expect(clearRecords(unavailable).status).toBe('unavailable')
  })
  it('bounds stored history and rejects inconsistent records', () => {
    for (let index = 0; index < 205; index++) appendRecord(localStorage, record)
    expect(loadRecords(localStorage).records).toHaveLength(200)
    localStorage.setItem(recordKey, JSON.stringify({ version: 1, records: [{ ...record, correct: true }] }))
    expect(loadRecords(localStorage).status).toBe('recovered')
  })
})
