export type History<T> = Readonly<{
  past: readonly T[]
  future: readonly T[]
}>

export type HistoryTransition<T> = Readonly<{
  history: History<T>
  value: T
}>

export const HISTORY_LIMIT = 20

export function createHistory<T>(): History<T> {
  return { past: [], future: [] }
}

export function pushHistory<T>(
  history: History<T>,
  value: T,
): History<T> {
  return {
    past: [...history.past, value].slice(-HISTORY_LIMIT),
    future: [],
  }
}

export function undoHistory<T>(
  history: History<T>,
  currentValue: T,
): HistoryTransition<T> {
  const value = history.past.at(-1)

  if (value === undefined) {
    return { history, value: currentValue }
  }

  return {
    history: {
      past: history.past.slice(0, -1),
      future: [currentValue, ...history.future],
    },
    value,
  }
}

export function redoHistory<T>(
  history: History<T>,
  currentValue: T,
): HistoryTransition<T> {
  const value = history.future[0]

  if (value === undefined) {
    return { history, value: currentValue }
  }

  return {
    history: {
      past: [...history.past, currentValue],
      future: history.future.slice(1),
    },
    value,
  }
}
