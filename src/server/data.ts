/**
 * Data is stored in files split by day with each file having the following schema:
 *
 *  [
 *    [time, { sensor1: temp, sensor2: temp, ... }],
 *    ...
 * ]
 */

import { existsSync as fileExists, promises as fs } from 'fs'
import path from 'path'

import { SensorData } from 'ds18x20'
import writeJSONFile from 'write-json-file'

import { DATA_DIRECTORY } from './config'

export async function append(values: SensorData): Promise<void> {
  const now = new Date()
  const [yyyy, M, d] = [now.getFullYear(), now.getMonth(), now.getDate()]
  const file = path.resolve(DATA_DIRECTORY, `${yyyy}-${M}-${d}.json`)
  const data = fileExists(file)
    ? JSON.parse(await fs.readFile(file, 'utf-8'))
    : []
  const entry = [now.getTime(), values]
  console.info('Appending entry:', entry)
  data.push(entry)
  await writeJSONFile(file, data)
}
