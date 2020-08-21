import { cToF } from './cToF'

export const temperatureScale = {
  type: 'linear',
  scaleLabel: {
    display: true,
    labelString: 'Temperature',
  },
  ticks: {
    callback: (value: number) => `${value}° C / ${cToF(value).toFixed(1)}° F`,
  },
}
