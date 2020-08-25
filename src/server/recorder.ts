import { append } from './data'
import * as sensors from './sensors'

const memo = { ...sensors.current } // clone

export const start = (): void => {
  append(memo)
  setInterval(iterate, 5 * 60 * 1000) // 5 minutes
}

function iterate(): void {
  const updated = Object.keys(sensors.current).reduce((accum, sensorId) => {
    const current = sensors.current[sensorId]
    const prev = memo[sensorId]
    const diff = Math.abs(current - prev)
    console.info(`${sensorId}: ${current} (memo: ${prev})`)
    if (diff > 0) {
      accum[sensorId] = current
      memo[sensorId] = current
    }
    return accum
  }, {} as Record<string, number>)
  if (Object.keys(updated).length > 0) append(updated)
}
