import sensor, { SensorData } from 'ds18x20'

export const current: SensorData = {}

export const start = (): Promise<void> => {
  return new Promise((resolve) => {
    sensor.getAll((err, data) => {
      updateCurrent(data)
      resolve()
      iterate()
    })
  })
}

function updateCurrent(data: SensorData): void {
  Object.assign(current, data)
}

function iterate(): void {
  sensor.getAll((err, data) => {
    updateCurrent(data)
    iterate()
  })
}
