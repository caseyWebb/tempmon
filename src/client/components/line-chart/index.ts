import { Chart, ChartDataSets, ChartPoint } from 'chart.js'
import ko from 'knockout'
import moment from 'moment'

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
                return moment(date).format('MMM D YYYY, h:mm a')
              },
              label: (tooltipItem) => {
                const degreesCelcius = parseFloat(tooltipItem.value as string)
                return `${degreesCelcius}° C / ${cToF(degreesCelcius).toFixed(
                  1
                )}° F`
              },
            },
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
