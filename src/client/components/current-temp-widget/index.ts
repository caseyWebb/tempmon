import ko from 'knockout'

import { Sensor } from '../../lib/sensors'

import template from './template.html'

ko.components.register('current-temp', {
  template,
  viewModel: class {
    constructor(protected params: { sensor: Sensor }) {}

    protected setAlias(): void {
      const { sensor } = this.params
      const alias = prompt(`Enter alias for ${sensor.id}`)
      if (alias) sensor.label(alias)
    }
  },
})
