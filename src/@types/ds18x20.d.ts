declare module 'ds18x20' {
    type Callback<T> = (err: Error, data: T) => void
    const sensor: {
        getAll(cb: Callback<SensorData>): void
        getAll(): SensorData
    }
    export default sensor
    export type SensorData = Record<string, number>
}