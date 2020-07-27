'use strict'

const fs = require('fs-extra')
const sensor = require('ds18x20')
const { DATA_FILE, UPDATE_INTERVAL } = process.env

exports.start = () => {
  recordCurrentTemps()
  setInterval(recordCurrentTemps, UPDATE_INTERVAL * 60 * 1000)
}

exports.getData = () => {
  return fs.readJSON(DATA_FILE)
}

async function recordCurrentTemps() {
  const data = fs.existsSync(DATA_FILE) ? await fs.readJSON(DATA_FILE) : []
  const current = sensor.getAll()
  const entry = [Date.now(), current]

  console.log(current)

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