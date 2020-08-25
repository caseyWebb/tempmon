import { Chart, ChartPoint } from 'chart.js'
import ko from 'knockout'
import moment from 'moment'

import { Sensor } from '../../lib/sensors'

import template from './template.html'
import { temperatureScale } from '../../lib/chart-scales'
import { cToF } from '../../lib/cToF'

type LineChartComponentParams = {
  sensors: ko.ObservableArray<Sensor>
  getData(sensor: Sensor): Promise<[ChartPoint[], ChartPoint[]]>
  timeScale: 'hour' | 'day'
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
  constructor(
    { sensors, getData, timeScale }: LineChartComponentParams,
    el: Node
  ) {
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
                  unit: timeScale,
                },
              },
            ],
            yAxes: [temperatureScale],
          },
          tooltips: {
            xPadding: 20,
            yPadding: 20,
            cornerRadius: 3,
            titleAlign: 'center',
            titleFontSize: 24,
            titleMarginBottom: 20,
            bodyAlign: 'center',
            bodyFontSize: 24,
            displayColors: false,
            callbacks: {
              title: ([tooltipItem]) => {
                const date = new Date(tooltipItem.xLabel as string)
                return moment(date).format('MMMM D YYYY')
              },
              label: (tooltipItem, data) => {
                if (
                  !tooltipItem.index ||
                  !tooltipItem.datasetIndex ||
                  !data.datasets
                )
                  throw new Error()

                const thisDataset = data.datasets[tooltipItem.datasetIndex]
                const accompanyingDataset =
                  tooltipItem.datasetIndex % 2 === 0
                    ? data.datasets[tooltipItem.datasetIndex + 1]
                    : data.datasets[tooltipItem.datasetIndex - 1]

                if (!thisDataset.data || !accompanyingDataset.data)
                  throw new Error()

                const pointA = thisDataset.data[tooltipItem.index] as ChartPoint
                const pointB = accompanyingDataset.data[
                  tooltipItem.index
                ] as ChartPoint

                const max = Math.max(pointA.y as number, pointB.y as number)
                const min = Math.min(pointA.y as number, pointB.y as number)
                const diff = max - min

                return `
                ↓: ${min}°C / ${cToF(min).toFixed()}°F
                ↑: ${max}°C / ${cToF(max).toFixed()}°F 
                Δ: ${diff.toFixed(1)}°C / ${(diff * (9 / 5)).toFixed()}°F
                `
              },
            },
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
