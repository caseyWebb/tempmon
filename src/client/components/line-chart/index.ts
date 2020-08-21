import { Chart } from 'chart.js'
import ko from 'knockout'

import { temperatureScale } from '../../lib/chart-scales'
import { cToF } from '../../lib/cToF'
import { Sensor } from '../../lib/sensors'

import template from './template.html'

type LineChartComponentParams = {
  sensors: ko.ObservableArray<Sensor>
  getData(sensor: Sensor): Promise<{ x: number; y: number }[]>
  unit: 'hour' | 'day'
}

class ViewModel {
  constructor({ sensors, getData, unit }: LineChartComponentParams, el: Node) {
    const ctx = (el.firstChild as HTMLCanvasElement).getContext(
      '2d'
    ) as CanvasRenderingContext2D

    Promise.all(
      sensors().map(async (s) => {
        const data = await getData(s)
        return {
          label: s.label(),
          borderColor: s.color,
          fill: false,
          data,
        }
      })
    ).then((datasets) => {
      new Chart(ctx, {
        type: 'line',
        data: {
          datasets,
        },
        options: {
          scales: {
            xAxes: [
              {
                type: 'time',
                time: {
                  unit,
                },
              },
            ],
            yAxes: [temperatureScale],
          },
        },
      })
    })
  }
}

ko.components.register('line-chart', {
  template,
  viewModel: {
    createViewModel(
      params: LineChartComponentParams,
      componentInfo: ko.components.ComponentInfo
    ) {
      return new ViewModel(params, componentInfo.element)
    },
  },
})
