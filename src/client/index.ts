import ko from 'knockout'

import './style.css'

import './components/app'

import * as sensors from './lib/sensors'

sensors
  .init()
  .then((sensors) => ko.applyBindings({ ready: true, sensors }, document.body))
