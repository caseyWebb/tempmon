import ko from 'knockout'
import * as OfflinePluginRuntime from 'offline-plugin/runtime'

import './style.css'

import './components/app'

import * as sensors from './lib/sensors'

OfflinePluginRuntime.install()

sensors
  .init()
  .then((sensors) => ko.applyBindings({ ready: true, sensors }, document.body))
