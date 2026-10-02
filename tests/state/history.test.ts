import { describe, expect, it } from 'vitest'
import {
  createHistory,
  pushHistory,
  redoHistory,
  undoHistory,
} from '../../src/state/history'

type HistoryValue = Readonly<{
  month: number
  coriolisEnabled: boolean
}>

const march: HistoryValue = { month: 3, coriolisEnabled: true }
const june: HistoryValue = { month: 6, coriolisEnabled: true }
const juneWithoutCoriolis: HistoryValue = {
  month: 6,
  coriolisEnabled: false,
}

describe('history', () => {
  it('moves recorded values backward and forward', () => {
    const history = pushHistory(
      pushHistory(createHistory<HistoryValue>(), march),
      june,
    )
    const undone = undoHistory(history, juneWithoutCoriolis)
    const redone = redoHistory(undone.history, undone.value)

    expect(undone.value).toEqual(june)
    expect(redone.value).toEqual(juneWithoutCoriolis)
  })

  it('clears future values when a new value is recorded', () => {
    const history = pushHistory(
      pushHistory(createHistory<HistoryValue>(), march),
      june,
    )
    const undone = undoHistory(history, juneWithoutCoriolis)
    const replaced = pushHistory(undone.history, {
      month: 12,
      coriolisEnabled: true,
    })

    expect(replaced.future).toEqual([])
  })

  it('keeps the current value at history boundaries', () => {
    const history = createHistory<HistoryValue>()

    expect(undoHistory(history, march)).toEqual({
      history,
      value: march,
    })
    expect(redoHistory(history, march)).toEqual({
      history,
      value: march,
    })
  })
})
