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
    constructor(protected params: { sensors: ko.ObservableArray<Sensor> }) {
      this.startScrollSnapping()
    }

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

    private startScrollSnapping() {
      let timeout: number
      let prev = window.scrollY
      let scrollingUp = true

      snapToPage(scrollingUp)

      document.addEventListener('scroll', () => {
        scrollingUp = window.scrollY < prev
        prev = window.scrollY
        if (timeout) window.clearTimeout(timeout)
        timeout = window.setTimeout(() => snapToPage(scrollingUp), 100)
      })
    }
  },
})

function snapToPage(scrollingUp: boolean): void {
  const viewportHeight = window.outerHeight
  const pages = Array.from(
    document.getElementsByClassName('page')
  ) as HTMLElement[]
  const tenPercent = viewportHeight / 10
  const threshold = scrollingUp ? tenPercent * 2 : tenPercent * 8
  const page = Array.from(pages)
    .reverse()
    .find((p) => p.offsetTop - window.scrollY < threshold)

  if (page) window.scrollTo({ behavior: 'smooth', top: page.offsetTop - 50 })
}
