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
      const pages = Array.from(
        document.getElementsByClassName('page')
      ).reverse() as HTMLElement[]
      const vh = (p: number): number => (p * window.outerHeight) / 100

      snapToPage(scrollingUp)

      document.addEventListener('scroll', () => {
        scrollingUp = window.scrollY < prev
        prev = window.scrollY
        if (timeout) window.clearTimeout(timeout)
        timeout = window.setTimeout(() => snapToPage(scrollingUp), 50)
      })

      document.addEventListener('keydown', (e) => {
        // page up/down, arrow keys, spacebar
        const up =
          e.keyCode === 33 ||
          e.keyCode === 38 ||
          (e.keyCode === 32 && e.shiftKey)
        const down =
          e.keyCode === 34 ||
          e.keyCode === 40 ||
          (e.keyCode === 32 && !e.shiftKey)
        if (!up && !down) return
        e.preventDefault()
        const i =
          pages.findIndex((p) => p.offsetTop - window.scrollY < vh(50)) +
          (up ? 1 : -1)
        if (i >= pages.length || i < 0) return
        const page = pages[i]
        window.scrollTo({ behavior: 'smooth', top: page.offsetTop - 50 })
      })

      function snapToPage(scrollingUp: boolean): void {
        const threshold = scrollingUp ? vh(20) : vh(80)
        const page = pages.find((p) => p.offsetTop - window.scrollY < threshold)
        if (page)
          window.scrollTo({ behavior: 'smooth', top: page.offsetTop - 50 })
      }
    }
  },
})
