export function getSolarDeclination(month: number): number {
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new RangeError('month must be an integer from 1 to 12')
  }

  return 23.44 * Math.sin((2 * Math.PI * (month - 3)) / 12)
}
