import type { MonsoonResult } from '../../domain/atmosphere/monsoonModel'

const directions = { southwest: '西南季风', southeast: '东南季风', northwest: '西北季风', northeast: '东北季风', transition: '季节过渡', incomplete: '机制不完整' } as const

export function monsoonLabel(result: MonsoonResult): string {
  return `${result.region === 'east-asia' ? '东亚' : '南亚'}：${directions[result.direction]} · ${Math.round(result.relativeStrength * 100)}%`
}
