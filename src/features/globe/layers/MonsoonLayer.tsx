import { Vector3 } from 'three'
import type { MonsoonResult } from '../../../domain/atmosphere/monsoonModel'
import type { GlobeLayerTransform } from '../projectGlobe'

type MonsoonLayerProps = Readonly<{
  monsoons: readonly MonsoonResult[]
  transform: GlobeLayerTransform
}>

export function MonsoonLayer({ monsoons, transform }: MonsoonLayerProps) {
  return (
    <group scale={transform.scale} name="globe-layer-monsoon">
      {monsoons.filter((result) => result.relativeStrength > 0).map((result) => {
        const latitude = (result.region === 'east-asia' ? 30 : 20) * Math.PI / 180
        const longitude = (result.region === 'east-asia' ? 120 : 80) * Math.PI / 180
        const origin = new Vector3(Math.cos(latitude) * Math.sin(longitude), Math.sin(latitude), Math.cos(latitude) * Math.cos(longitude)).multiplyScalar(1.1)
        const east = new Vector3(Math.cos(longitude), 0, -Math.sin(longitude))
        const north = new Vector3(-Math.sin(latitude) * Math.sin(longitude), Math.cos(latitude), -Math.sin(latitude) * Math.cos(longitude))
        const eastward = result.direction === 'southwest' || result.direction === 'northwest' ? 1 : -1
        const northward = result.direction === 'southwest' || result.direction === 'southeast' ? 1 : -1
        const direction = east.multiplyScalar(eastward).add(north.multiplyScalar(northward)).normalize()
        return <arrowHelper key={result.region} name={`monsoon:${result.region}`} args={[direction, origin, 0.18 + 0.18 * result.relativeStrength, '#fbbf24', 0.07, 0.045]} userData={{ sourceId: `monsoon:${result.region}`, direction: result.direction }} />
      })}
    </group>
  )
}
