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
  const current = sensor.getAll()
  const data = fs.existsSync(DATA_FILE) ? await fs.readJSON(DATA_FILE) : {}
  const time = Date.now()

  console.log(current)

  Object.keys(current).forEach((sensorId, temp) => {
    const entry = {
      time,
      temp
    }
    if (!data[sensorId]) data[sensorId] = []
    data[sensorId].push(entry)
  })

  await fs.outputJSON(DATA_FILE, data)
}