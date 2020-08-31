import ko from 'knockout'
import { SensorData } from 'ds18x20'
import { openDB, DBSchema } from 'idb/with-async-ittr'

import { fetchCurrent, fetchHistoricalData } from './api'

interface SensorDB extends DBSchema {
  readings: {
    value: {
      time: Date
      temp: number
    }
    key: Date
    indexes: { 'by-time': Date }
  }
}

const sensors = ko.observableArray<Sensor>([])

const colors = ['#37CF62', '#8EDFD9', '#53A8A5', '#00746C', '#030E46']

export async function init() {
  const sensorIds = localStorage.getItem('known_sensors')
  if (sensorIds) {
    sensors(JSON.parse(sensorIds).map((id: string) => Sensor.get(id)))
  }
  sensors.subscribe(() => {
    localStorage.setItem(
      'known_sensors',
      JSON.stringify(sensors().map((s) => s.id))
    )
  })
  currentAutoUpdate()
  const initialized = backfill()
  if (!sensorIds) await initialized
  setInterval(() => fetchHistoricalData(new Date()).then(insert), 5 * 60 * 1000) // 5 min
  return sensors
}

export class Sensor {
  private readonly labelStorageKey = `label:${this.id}`
  public readonly label = ko.observable<string>(
    localStorage.getItem(this.labelStorageKey) || this.id
  )
  public readonly temp = ko.observable<number>()

  private db = openDB<SensorDB>(this.id, 1, {
    upgrade(db) {
      const store = db.createObjectStore('readings', { keyPath: 'time' })
      store.createIndex('by-time', 'time')
    },
  })

  private readonly ready = ko.observable(false)

  private readonly onInsertCallbacks: (() => void)[] = []

  constructor(public readonly id: string, public readonly color: string) {
    this.db.then(() => this.ready(true))

    this.label.subscribe((l) => localStorage.setItem(this.labelStorageKey, l))
  }

  public async insert(readings: [number, number][]) {
    const db = await this.db
    const tx = db.transaction('readings', 'readwrite')
    await Promise.all<any>([
      ...readings.map(([time, temp]) =>
        tx.store.put({ time: new Date(time), temp })
      ),
      tx.done,
    ])
    this.onInsertCallbacks.forEach((cb) => cb())
  }

  public onInsert(cb: () => void | Promise<void>) {
    this.onInsertCallbacks.push(cb)
  }

  public async fetchAllData(
    start: Date = new Date(new Date().setDate(new Date().getDate() - 1)),
    end: Date = new Date()
  ) {
    const range = IDBKeyRange.bound(start, end)
    return (await this.db)
      .transaction('readings')
      .store.index('by-time')
      .getAll(range)
  }

  public async fetchAggregateData(
    start: Date = new Date(new Date().setDate(new Date().getDate() - 90)),
    end: Date = new Date()
  ): Promise<
    {
      date: Date
      delta: number
      min: number
      max: number
    }[]
  > {
    const range = IDBKeyRange.bound(start, end)
    const tx = await (await this.db).transaction('readings')
    const index = tx.store.index('by-time')
    const ret = []
    let memo:
      | undefined
      | {
          date: Date
          min: number
          max: number
        }
    for await (const {
      value: { time, temp },
    } of index.iterate(range)) {
      const date = new Date(time)

      if (!memo) memo = { date, min: temp, max: temp }
      else if (temp < memo.min) memo.min = temp
      else if (temp > memo.max) memo.max = temp

      if (date.getDate() !== memo.date.getDate()) {
        ret.push({ ...memo, delta: memo.max - memo.min })
        memo = undefined
      }
    }
    if (memo) ret.push({ ...memo, delta: memo.max - memo.min })
    await tx.done
    return ret
  }

  public static get(id: string) {
    let s = sensors().find((s) => s.id === id)
    if (!s) {
      s = new Sensor(id, colors[sensors().length])
      sensors.push(s)
    }
    return s
  }
}

function currentAutoUpdate() {
  fetchCurrent()
    .then((data) => [
      Object.keys(data).forEach((sensorId) =>
        Sensor.get(sensorId).temp(data[sensorId])
      ),
    ])
    .then(currentAutoUpdate)
}

async function backfill() {
  const lastUpdated = localStorage.getItem('lastUpdated')
  const now = new Date()

  if (!lastUpdated) {
    const d = new Date()
    while (true) {
      try {
        const data = await fetchHistoricalData(d)
        await insert(data)
        d.setDate(d.getDate() - 1)
      } catch (e) {
        break
      }
    }
  } else {
    const pending: Promise<void>[] = []
    const d = new Date(JSON.parse(lastUpdated))
    while (d < now) {
      pending.push(fetchHistoricalData(d).then((data) => insert(data)))
      d.setDate(d.getDate() + 1)
    }
    await Promise.all(pending)
  }

  localStorage.setItem('lastUpdated', JSON.stringify(now.getTime()))
}

async function insert(readings: [number, SensorData][]) {
  const groupedReadings = readings.reduce((accum, [time, temps]) => {
    Object.keys(temps).forEach((sensorId) => {
      if (!accum[sensorId]) accum[sensorId] = []
      accum[sensorId].push([time, temps[sensorId]])
    })
    return accum
  }, {} as Record<string, [number, number][]>)
  await Promise.all(
    Object.keys(groupedReadings).map((sensorId) =>
      Sensor.get(sensorId).insert(groupedReadings[sensorId])
    )
  )
}
