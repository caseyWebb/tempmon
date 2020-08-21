import { Chart } from 'chart.js'
import ko from 'knockout'

import { Sensor } from '../../lib/sensors'

import template from './template.html'

type MaybeArray<T> = T | T[]

type LineChartComponentParams = {
  sensors: ko.ObservableArray<Sensor>
  getData(sensor: Sensor): Promise<MaybeArray<{ x: number; y: number }[]>>
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
        if (Array.isArray(data[0])) {
          return (data as { x: number; y: number }[][]).map((d) => ({
            label: s.label(),
            borderColor: s.color,
            fill: false,
            data: d,
          }))
        } else {
          return [
            {
              label: s.label(),
              borderColor: s.color,
              fill: false,
              data: data as { x: number; y: number }[],
            },
          ]
        }
      })
    ).then((datasets) => {
      new Chart(ctx, {
        type: 'line',
        data: {
          datasets: datasets.flat(),
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
            yAxes: [
              {
                type: 'linear',
                scaleLabel: {
                  display: true,
                  labelString: 'Temperature (Celsius)',
                },
              },
            ],
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
