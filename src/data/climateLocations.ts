import { mediterraneanLocation, type TrackedLocation } from './locations'

export type ClimateLocation = TrackedLocation & Readonly<{ climate: string }>
export const climateLocations: readonly ClimateLocation[] = [
  { ...mediterraneanLocation, climate: '地中海气候' },
  { id: 'location:savanna', name: '北半球热带草原示例', latitude: 10, longitude: 20, climate: '热带草原气候' },
]
