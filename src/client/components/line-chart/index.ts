import { Chart, ChartConfiguration, ChartPoint } from 'chart.js'
import ko from 'knockout'
import moment from 'moment'

import { temperatureScale } from '../../lib/chart-scales'
import { cToF } from '../../lib/cToF'
import { Sensor } from '../../lib/sensors'

import template from './template.html'

type LineChartComponentParams = {
  sensors: ko.ObservableArray<Sensor>
}

const getData = async (
  s: Sensor,
  start: Date,
  end: Date
): Promise<ChartPoint[]> =>
  (await s.fetchAllData(start, end)).map(({ time, temp }) => ({
    x: time,
    y: temp,
  }))

const createChartConfig = async (
  { sensors }: LineChartComponentParams,
  start: Date,
  end: Date
): Promise<ChartConfiguration> =>
  Promise.all(
    sensors().map(async (s) => ({
      label: s.label(),
      borderColor: s.color,
      fill: false,
      data: await getData(s, start, end),
    }))
  ).then((datasets) => ({
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
              unit: 'hour',
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
          title: ([tooltipItem]) =>
            moment(new Date(tooltipItem.xLabel as string)).format(
              'MMM D YYYY, h:mm a'
            ),
          label: (tooltipItem) => {
            const degreesCelsius = parseFloat(tooltipItem.value as string)
            return `${degreesCelsius}° C / ${cToF(degreesCelsius).toFixed(
              1
            )}° F`
          },
        },
      },
    },
  }))

const addHours = (d: Date, n: number): void => {
  d.setHours(d.getHours() + n)
}

const getUnit = (start: Date, end: Date): 'hour' | 'day' => {
  const twoDays = new Date(new Date(0).setDate(new Date(0).getDate() + 2))
  const duration = new Date(end.getTime() - start.getTime())
  if (duration >= twoDays) return 'day'
  else return 'hour'
}

ko.components.register('line-chart', {
  template,
  viewModel: {
    createViewModel(
      params: LineChartComponentParams,
      componentInfo: ko.components.ComponentInfo
    ) {
      const el = componentInfo.element as HTMLElement
      let start = new Date(new Date().setDate(new Date().getDate() - 1))
      let end = new Date()

      createChartConfig(params, start, end).then((config) => {
        const chart = new Chart(
          (el.firstChild as HTMLCanvasElement).getContext(
            '2d'
          ) as CanvasRenderingContext2D,
          config
        )

        const updateChart = async (): Promise<void> => {
          await Promise.all(
            params.sensors().map(async (s, i) => {
              const ds = config.data?.datasets
              if (ds) ds[i].data = await getData(s, start, end)
            })
          )
          {
            const axes = config.options?.scales?.xAxes
            if (axes) {
              const timeScale = axes[0].time
              if (timeScale) timeScale.unit = getUnit(start, end)
            }
          }
          chart.update({ duration: 0 })
        }

        el.addEventListener('keydown', (e) => {
          const { shiftKey, keyCode } = e
          const scaleInHours =
            new Date(end.getTime() - start.getTime()).getTime() / 1000 / 60 / 60
          let adjustment = shiftKey
            ? scaleInHours
            : Math.round(scaleInHours / 6)

          switch (keyCode) {
            /* eslint-disable no-fallthrough */
            // left
            case 37:
              adjustment *= -1
            // right
            case 39:
              addHours(start, adjustment)
              addHours(end, adjustment)
              if (end > new Date()) {
                end = new Date()
                start = new Date()
                addHours(start, scaleInHours * -1)
              }
              break
            // -
            case 173:
              addHours(start, -6)
              break
            // +
            case 61:
              if (scaleInHours >= 24) addHours(start, 6)
              break
            default:
              return
          }
          e.preventDefault()
          e.stopPropagation()
          e.stopImmediatePropagation()
          updateChart()
        })

        params.sensors().forEach((s) => s.onInsert(updateChart))
      })
    },
  },
})
