import { start as startRecorder } from './recorder'
import { start as startSensors } from './sensors'
import { start as startServer } from './server'

startSensors().then(() => {
  startRecorder()
  startServer()
})
