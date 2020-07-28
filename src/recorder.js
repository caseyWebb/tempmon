'use strict'

const fs = require('fs-extra')
const sensor = require('ds18x20')
const { DATA_FILE } = process.env

const memo = sensor.getAll()

exports.start = () => {
  append(memo)
  setInterval(iterate, 5 * 60 * 1000) // 5 minutes
}

async function iterate() {
  const data = sensor.getAll()
  const updated = Object.keys(data).reduce((accum, sensorId) => {
    const current = data[sensorId]
    const prev = memo[sensorId]
    const diff = Math.abs(current - prev)
    console.log(`${sensor}: ${current} (memo: ${prev})`)
    if (diff > 0) {
      accum[sensorId] = current
      memo[sensorId] = current
    }
    return accum
  }, {})
  if (Object.keys(updated).length > 0) append(updated)
}

async function append(values) {
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