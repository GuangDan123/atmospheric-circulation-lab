export type TrackedLocation = Readonly<{
  id: string
  name: string
  latitude: number
  longitude: number
}>

export const mediterraneanLocation: TrackedLocation = {
  id: 'location:mediterranean',
  name: '地中海地区',
  latitude: 38,
  longitude: 15,
}

export const locations = [mediterraneanLocation] as const
