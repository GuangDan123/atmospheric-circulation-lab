import type {
  CausalScenario,
  CausalStep,
} from '../../domain/causality/types'

const disabledComparison = {
  title: '偏转关闭后的对照观察',
  explanation:
    '关闭地转偏向后，高空气流继续更直接地向高纬运动，不展示默认三圈环流的完整合成结果。',
  activeObjectIds: ['airflow:upper-poleward-comparison'],
} as const

const steps: readonly CausalStep[] = [
  {
    id: 'equatorial-heating-rise',
    title: '赤道受热上升',
    explanation:
      '赤道附近获得较多太阳辐射，近地面空气受热膨胀并上升，形成热力低压。',
    labels: ['赤道低压', '热力成因', '上升气流'],
    activeObjectIds: [
      'pressure-belt:equatorial-low',
      'vertical-motion:equator-rising',
    ],
    cameraPresetId: 'camera:equatorial-rise',
    pauseAfter: true,
    causes: [],
    whenCoriolisDisabled: {
      title: '赤道受热上升',
      explanation:
        '关闭地转偏向不改变赤道附近空气受热上升这一热力过程。',
      activeObjectIds: [
        'pressure-belt:equatorial-low',
        'vertical-motion:equator-rising',
      ],
    },
  },
  {
    id: 'upper-poleward-flow',
    title: '高空向两极运动',
    explanation:
      '上升空气到达对流层上部后，沿高空分别向南北两侧高纬方向运动。',
    labels: ['高空气流', '向极运动'],
    activeObjectIds: ['airflow:upper-poleward'],
    cameraPresetId: 'camera:upper-poleward',
    pauseAfter: true,
    causes: ['equatorial-heating-rise'],
    whenCoriolisDisabled: {
      title: '高空径直向两极运动',
      explanation:
        '关闭地转偏向后，高空气流保持更直接的经向运动。',
      activeObjectIds: ['airflow:upper-poleward-comparison'],
    },
  },
  {
    id: 'coriolis-deflection',
    title: '地转偏向增强',
    explanation:
      '空气远离赤道后，随纬度升高受到的地转偏向作用增强，运动方向逐渐转为以纬向为主。',
    labels: ['地转偏向', '纬度越高偏转越强'],
    activeObjectIds: ['force:coriolis', 'airflow:upper-deflected'],
    cameraPresetId: 'camera:coriolis-upper-air',
    pauseAfter: true,
    causes: ['upper-poleward-flow'],
    whenCoriolisDisabled: disabledComparison,
  },
  {
    id: 'upper-air-accumulation',
    title: '30°附近高空气流堆积',
    explanation:
      '高空气流在约30°纬度附近转为强烈纬向运动，持续补充使空气发生动力堆积。',
    labels: ['30°纬度', '高空堆积', '动力过程'],
    activeObjectIds: ['airflow:upper-accumulation-30'],
    cameraPresetId: 'camera:subtropical-upper-air',
    pauseAfter: true,
    causes: ['coriolis-deflection'],
    whenCoriolisDisabled: disabledComparison,
  },
  {
    id: 'subtropical-sinking',
    title: '空气下沉',
    explanation:
      '约30°纬度附近堆积的高空空气向下运动，形成副热带地区的下沉支。',
    labels: ['下沉气流', '动力下沉'],
    activeObjectIds: [
      'vertical-motion:subtropical-north-sinking',
      'vertical-motion:subtropical-south-sinking',
    ],
    cameraPresetId: 'camera:subtropical-sinking',
    pauseAfter: true,
    causes: ['upper-air-accumulation'],
    whenCoriolisDisabled: disabledComparison,
  },
  {
    id: 'subtropical-high-forms',
    title: '副热带高压形成',
    explanation:
      '持续下沉使近地面空气增多、气压升高，形成由大气环流造成的动力高压。',
    labels: ['副热带高压', '动力高压'],
    activeObjectIds: [
      'pressure-belt:subtropical-north',
      'pressure-belt:subtropical-south',
    ],
    cameraPresetId: 'camera:subtropical-high',
    pauseAfter: true,
    causes: ['subtropical-sinking'],
    whenCoriolisDisabled: disabledComparison,
  },
  {
    id: 'surface-divergence',
    title: '分流形成信风与西风',
    explanation:
      '副热带高压近地面空气向赤道和高纬两侧分流，并在地转偏向作用下分别形成信风和盛行西风。',
    labels: ['信风', '盛行西风', '近地面分流'],
    activeObjectIds: [
      'wind-belt:trade-north',
      'wind-belt:trade-south',
      'wind-belt:westerly-north',
      'wind-belt:westerly-south',
    ],
    cameraPresetId: 'camera:surface-wind-belts',
    pauseAfter: true,
    causes: ['subtropical-high-forms'],
    whenCoriolisDisabled: disabledComparison,
  },
]

export const subtropicalHighScenario: CausalScenario = {
  id: 'scenario:subtropical-high',
  title: '副热带高压动力成因',
  steps,
}
