export type MonsoonRegion = 'east-asia' | 'south-asia'
export type MonsoonInput = Readonly<{
  region: MonsoonRegion
  month: number
  landSeaContrast: number
  seasonalShiftScale: number
  crossEquatorialEnabled: boolean
  coriolisEnabled: boolean
  rotationDirection: 1 | -1
  rotationStrength: number
  terrainInfluence: boolean
}>
export type MonsoonResult = Readonly<{
  region: MonsoonRegion
  direction: 'southwest' | 'southeast' | 'northwest' | 'northeast' | 'transition' | 'incomplete'
  relativeStrength: number
  activeMechanisms: readonly string[]
  missingMechanisms: readonly string[]
  evidence: readonly string[]
  steps: readonly string[]
}>

export function getMonsoon(input: MonsoonInput): MonsoonResult {
  if (!Number.isInteger(input.month) || input.month < 1 || input.month > 12
    || !['east-asia', 'south-asia'].includes(input.region)
    || ![1, -1].includes(input.rotationDirection) || input.terrainInfluence) {
    throw new RangeError('unsupported monsoon configuration')
  }
  for (const value of [input.landSeaContrast, input.seasonalShiftScale, input.rotationStrength]) {
    if (!Number.isFinite(value) || value < 0 || value > 1) throw new RangeError('mechanism strength must be from 0 to 1')
  }
  const season = Math.cos((input.month - 7) * Math.PI / 6)
  const summer = season > 1e-10
  const transition = Math.abs(season) < 1e-10
  const southSummer = input.region === 'south-asia' && summer
  const mechanisms: readonly (readonly [string, boolean])[] = [
    ...(southSummer ? [['southeast-trades', true], ['seasonal-shift', input.seasonalShiftScale > 0], ['cross-equatorial', input.crossEquatorialEnabled]] as const : []),
    ['coriolis', input.coriolisEnabled && input.rotationStrength > 0 && input.rotationDirection === 1],
    ['land-sea', input.landSeaContrast > 0],
  ]
  const activeMechanisms = transition ? [] : mechanisms.filter(([, active]) => active).map(([name]) => name)
  const missingMechanisms = transition ? ['seasonal-transition'] : mechanisms.filter(([, active]) => !active).map(([name]) => name)
  const direction = transition ? 'transition' : missingMechanisms.length > 0 ? 'incomplete'
    : input.region === 'east-asia' ? summer ? 'southeast' : 'northwest' : summer ? 'southwest' : 'northeast'
  const relativeStrength = transition || missingMechanisms.length > 0 ? 0
    : Math.abs(season) * input.landSeaContrast * input.rotationStrength * (southSummer ? Math.min(1, input.seasonalShiftScale / 0.25) : 1)
  const steps = southSummer ? ['东南信风', '越赤道', '北半球右偏', '印度次大陆热低压吸引', '西南季风']
    : ['海陆热力差异', summer ? '大陆热低压与海洋高压' : '大陆冷高压与海洋低压', '气压梯度与地转偏向', summer ? '东南季风' : input.region === 'east-asia' ? '西北季风' : '东北季风']
  return {
    region: input.region, direction, relativeStrength, activeMechanisms, missingMechanisms,
    steps: direction === 'incomplete' || transition ? steps.slice(0, -1) : steps,
    evidence: ['参数化季风机制示意；方向为风的来源，强度无量纲，非风速或预报', '海陆热力差异与气压带风带季移共同作用；南亚夏季还需越赤道及北半球右偏', '不模拟复杂地形；反向自转仅显示机制缺失，不推断真实地球季风'],
  }
}
