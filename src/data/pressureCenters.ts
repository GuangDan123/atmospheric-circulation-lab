import type { PressureCenterDefinition } from '../domain/atmosphere/landSeaModel'

export const pressureCenterDefinitions: readonly PressureCenterDefinition[] = [
  {
    id: 'pressure-center:asia-high', kind: 'high', latitude: 45, longitude: 90,
    peakMonth: 1, responseLagMonths: 0, spatialScaleDegrees: 20,
    name: '亚洲高压', source: '本地参数化教学数据：冬季大陆冷源中心；高中地理概念示意，非观测数据',
  },
  {
    id: 'pressure-center:north-pacific-low', kind: 'low', latitude: 45, longitude: -165,
    peakMonth: 1, responseLagMonths: 0.75, spatialScaleDegrees: 25,
    name: '北太平洋低压', source: '本地参数化教学数据：冬季海洋热惯性中心；高中地理概念示意，非观测数据',
  },
  {
    id: 'pressure-center:north-atlantic-low', kind: 'low', latitude: 45, longitude: -30,
    peakMonth: 1, responseLagMonths: 0.75, spatialScaleDegrees: 25,
    name: '北大西洋低压', source: '本地参数化教学数据：冬季海洋热惯性中心；高中地理概念示意，非观测数据',
  },
  {
    id: 'pressure-center:asia-low', kind: 'low', latitude: 30, longitude: 90,
    peakMonth: 7, responseLagMonths: 0, spatialScaleDegrees: 20,
    name: '亚洲低压', source: '本地参数化教学数据：夏季大陆热源中心；高中地理概念示意，非观测数据',
  },
  {
    id: 'pressure-center:north-pacific-high', kind: 'high', latitude: 30, longitude: -150,
    peakMonth: 7, responseLagMonths: 0.75, spatialScaleDegrees: 25,
    name: '北太平洋高压', source: '本地参数化教学数据：夏季海洋热惯性中心；高中地理概念示意，非观测数据',
  },
  {
    id: 'pressure-center:north-atlantic-high', kind: 'high', latitude: 30, longitude: -30,
    peakMonth: 7, responseLagMonths: 0.75, spatialScaleDegrees: 25,
    name: '北大西洋高压', source: '本地参数化教学数据：夏季海洋热惯性中心；高中地理概念示意，非观测数据',
  },
]
