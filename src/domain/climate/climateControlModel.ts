import type { ClimateLocation } from '../../data/climateLocations'
import { deriveAtmosphere, type AtmosphereSnapshot } from '../atmosphere/deriveAtmosphere'
import { getLocationControl } from '../atmosphere/locationControlModel'
import type { Month } from '../atmosphere/types'

export function getClimateControl(location: ClimateLocation, snapshot: AtmosphereSnapshot) {
  const control = getLocationControl(location, snapshot)
  return {
    ...control,
    month: snapshot.parameters.month,
    evidenceObjectIds: control.controls.map((item) => item.sourceId),
    otherFactors: ['地形', '海陆位置', '洋流', '水汽来源'],
    monthlyControls: Array.from({ length: 12 }, (_, index) => {
      const month = (index + 1) as Month
      const monthly = getLocationControl(location, deriveAtmosphere({ ...snapshot.parameters, month }))
      return { month, moistureTendency: monthly.moistureTendency, evidenceObjectIds: monthly.controls.map((item) => item.sourceId) }
    }),
  }
}
