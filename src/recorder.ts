
import fs  from 'fs-extra'
import sensor, { SensorData } from 'ds18x20'
import { DATA_FILE } from './config'

const memo = sensor.getAll()

export const start = () => {
  append(memo)
  setInterval(iterate, 5 * 60 * 1000) // 5 minutes
}

async function iterate() {
  const data = await new Promise<SensorData>((resolve) => sensor.getAll((err, _data) => resolve(_data)))
  const updated = Object.keys(data).reduce((accum, sensorId) => {
    const current = data[sensorId]
    const prev = memo[sensorId]
    const diff = Math.abs(current - prev)
    console.log(`${sensorId}: ${current} (memo: ${prev})`)
    if (diff > 0) {
      accum[sensorId] = current
      memo[sensorId] = current
    }
    return accum
  }, {} as Record<string, number>)
  if (Object.keys(updated).length > 0) append(updated)
}

async function append(values: SensorData) {
  const data = fs.existsSync(DATA_FILE) ? await fs.readJSON(DATA_FILE) : []
  const entry = [Date.now(), values]
  console.log('Appending entry:', entry)
  data.push(entry)
  await fs.outputJSON(DATA_FILE, data)
}

/**
 * JSON Schema
 *
 * [
 *   [time, { sensor1: temp1, sensor2: temp2, ... }],
 *   ...
 * ]
 */