const fs = require('fs-extra')
const sensor = require('ds18x20')
const { DATA_FILE, UPDATE_INTERVAL } = process.env

exports.start = () => {
  setInterval(() => append(sensor.getAll()), UPDATE_INTERVAL * 60 * 1000)
}

exports.getData = () => {
  return fs.readJSON(DATA_FILE)
}

async function append(current) {
  const data = fs.existsSync(DATA_FILE) ? await fs.readJSON(DATA_FILE) : {}
  const time = Date.now()
  Object.keys(current).forEach((sensorId, temp) => {
    const entry = {
      time,
      temp
    }
    if (!data[sensorId]) data[sensorId] = []
    data[sensorId].push(entry)
  })
}