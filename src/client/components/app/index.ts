import { ChartPoint } from 'chart.js'
import ko from 'knockout'

import { Sensor } from '../../lib/sensors'

import '../area-chart'
import '../current-temp-widget'
import '../line-chart'

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
      const ret = metrics.map((metric) =>
        data.map((dailyAggregate) => ({
          x: dailyAggregate.date,
          y: dailyAggregate[metric],
        }))
      )
      return ret
    }
  },
})
