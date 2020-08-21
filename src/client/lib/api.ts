import { SensorData } from 'ds18x20'

const api = localStorage.getItem('config:api') || ''

export async function fetchCurrent(): Promise<SensorData> {
  return (await fetch(api + '/current')).json()
}

export async function fetchHistoricalData(
  date: Date
): Promise<[number, SensorData][]> {
  const [yyyy, M, d] = [date.getFullYear(), date.getMonth(), date.getDate()]
  return (await fetch(`${api}/data/${yyyy}-${M}-${d}.json`)).json()
}
