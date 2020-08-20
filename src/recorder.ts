import sensor, { SensorData } from 'ds18x20'

import { append } from './data'

const memo = sensor.getAll()

export const start = (): void => {
  append(memo)
  setInterval(() => {
    iterate().catch(console.error)
  }, 5 * 60 * 1000) // 5 minutes
}

async function iterate(): Promise<void> {
  const data = await new Promise<SensorData>((resolve) =>
    sensor.getAll((err, _data) => resolve(_data))
  )
  const updated = Object.keys(data).reduce((accum, sensorId) => {
    const current = data[sensorId]
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
