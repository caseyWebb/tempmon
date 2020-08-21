import { cToF } from './cToF'

export const temperatureScale = {
  type: 'linear',
  scaleLabel: {
    display: true,
    labelString: 'Temperature',
  },
  ticks: {
    stepSize: 2,
    callback: (value: number) => `${value}° C / ${cToF(value).toFixed(1)}° F`,
  },
}
