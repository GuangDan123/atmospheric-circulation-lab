import { pressureCenterDefinitions } from '../../data/pressureCenters'

export type LandSeaContrast = number & { readonly __landSeaContrast: unique symbol }
export type PressureCenterKind = 'high' | 'low'
export type PressureCenterDefinition = Readonly<{
  id: string
  kind: PressureCenterKind
  latitude: number
  longitude: number
  peakMonth: number
  responseLagMonths: number
  spatialScaleDegrees: number
  name: string
  source: string
}>
export type LandSeaAnomaly = Readonly<{
  id: string
  kind: PressureCenterKind
  latitude: number
  longitude: number
  anomalyStrength: number
  spatialScaleDegrees: number
  evidence: readonly string[]
  name: string
  source: string
}>
export type LandSeaAnomalyInput = Readonly<{
  month: number
  landSeaContrast: LandSeaContrast
}>

export function getLandSeaAnomalies(input: LandSeaAnomalyInput): readonly LandSeaAnomaly[] {
  if (!Number.isInteger(input.month) || input.month < 1 || input.month > 12) {
    throw new RangeError('month must be an integer from 1 to 12')
  }
  if (!Number.isFinite(input.landSeaContrast) || input.landSeaContrast < 0 || input.landSeaContrast > 1) {
    throw new RangeError('landSeaContrast must be from 0 to 1')
  }
  if (input.landSeaContrast === 0) return []
  return pressureCenterDefinitions.map((center) => {
    const lag = center.responseLagMonths * Math.PI / 6
    const phase = (input.month - center.peakMonth) * Math.PI / 6 - lag
    const response = Math.min(1, Math.max(0, Math.cos(phase) / Math.cos(lag)))
    return {
      id: center.id,
      kind: center.kind,
      latitude: center.latitude,
      longitude: center.longitude,
      anomalyStrength: response * input.landSeaContrast,
      spatialScaleDegrees: center.spatialScaleDegrees,
      name: center.name,
      source: center.source,
      evidence: [
        center.responseLagMonths === 0 ? '大陆响应：年度余弦周期，无滞后' : `海洋热惯性：响应滞后 ${center.responseLagMonths} 个月，端点归一化`,
        `球面高斯衰减尺度 ${center.spatialScaleDegrees}°；异常强度无量纲，非 hPa`,
      ],
    }
  }).filter(({ anomalyStrength }) => anomalyStrength > 1e-10)
}

export function sampleLandSeaAnomaly(anomalies: readonly LandSeaAnomaly[], latitude: number, longitude: number): number {
  if (!Number.isFinite(latitude) || Math.abs(latitude) > 90 || !Number.isFinite(longitude)) {
    throw new RangeError('sample coordinates must have finite longitude and latitude from -90 to 90')
  }
  const radians = Math.PI / 180
  return anomalies.reduce((sum, anomaly) => {
    const cosine = Math.sin(latitude * radians) * Math.sin(anomaly.latitude * radians)
      + Math.cos(latitude * radians) * Math.cos(anomaly.latitude * radians) * Math.cos((longitude - anomaly.longitude) * radians)
    const distance = Math.acos(Math.min(1, Math.max(-1, cosine))) / radians
    return sum + (anomaly.kind === 'high' ? 1 : -1) * anomaly.anomalyStrength * Math.exp(-0.5 * (distance / anomaly.spatialScaleDegrees) ** 2)
  }, 0)
}

export type LandSeaFieldPoint = Readonly<{ latitude: number; longitude: number; value: number }>

export function getLandSeaField(anomalies: readonly LandSeaAnomaly[]): readonly LandSeaFieldPoint[] {
  if (anomalies.length === 0) return []
  return Array.from({ length: 18 * 36 }, (_, index) => {
    const latitude = -85 + Math.floor(index / 36) * 10
    const longitude = -175 + (index % 36) * 10
    return { latitude, longitude, value: sampleLandSeaAnomaly(anomalies, latitude, longitude) }
  })
}
