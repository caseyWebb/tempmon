import { ChartPoint } from 'chart.js'
import ko from 'knockout'

import { Sensor } from '../../lib/sensors'

import '../current-temp-widget'
import '../temp-line-chart'

import template from './template.html'

ko.components.register('app', {
  template,
  viewModel: class {
    constructor(protected params: { sensors: ko.ObservableArray<Sensor> }) {}

    protected async getRawData(s: Sensor): Promise<ChartPoint[]> {
      return (await s.fetchAllData()).map(({ time, temp }) => ({
        x: time,
        y: temp,
      }))
    }

    protected async getAggregateData(s: Sensor): Promise<ChartPoint[][]> {
      const data = await s.fetchAggregateData()
      const metrics: (keyof typeof data[0])[] = ['min', 'max']
      return data.map((dailyAggregate) =>
        metrics.map((metric) => ({
          x: dailyAggregate.date,
          y: dailyAggregate[metric],
        }))
      )
    }
  },
})
