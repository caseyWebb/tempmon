import { Chart, ChartPoint } from 'chart.js'
import ko from 'knockout'

import { Sensor } from '../../lib/sensors'

import template from './template.html'
import { temperatureScale } from '../../lib/chart-scales'

type LineChartComponentParams = {
  sensors: ko.ObservableArray<Sensor>
  getData(sensor: Sensor): Promise<[ChartPoint[], ChartPoint[]]>
  unit: 'hour' | 'day'
}

function transparent(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return
  const { r, g, b } = {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  }
  return `rgba(${r},${g},${b},0.3)`
}

class ViewModel {
  constructor({ sensors, getData, unit }: LineChartComponentParams, el: Node) {
    const ctx = (el.firstChild as HTMLCanvasElement).getContext(
      '2d'
    ) as CanvasRenderingContext2D

    Promise.all(
      sensors().map(async (s) => {
        const data = await getData(s)
        return data.map((d, i) => ({
          label: i % 2 === 0 ? s.label() : '',
          borderColor: s.color,
          fill: i % 2 === 0 ? '+1' : false,
          backgroundColor: transparent(s.color),
          data: d,
          order: data.length - i,
          pointRadius: 0,
        }))
      })
    ).then((datasets) => {
      const chart = new Chart(ctx, {
        type: 'line',
        data: {
          datasets: datasets.flat(),
        },
        options: {
          legend: {
            onClick: (e, legendItem) => {
              const index = legendItem.datasetIndex
              if (typeof index === 'undefined') return
              ;[index, index + 1]
                .map((i) => chart.getDatasetMeta(i))
                .forEach((meta) => {
                  meta.hidden = !meta.hidden
                })

              chart.update()
            },
            labels: {
              filter: (item) => item.text,
            },
          },
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

ko.components.register('area-chart', {
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
