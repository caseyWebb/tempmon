import path  from 'path' 
import cors  from 'cors' 
import sensor  from 'ds18x20' 
import express, { Request, Response }  from 'express'

import { DATA_FILE, PORT } from './config'

const app = express()

export const start = () => {
  const nocache = (req: Request, res: Response, next: () => void) => {
    res.set('Cache-Control', 'no-store')
    next()
  }

  app.use(cors())
  app.use(nocache)
  app.use(express.static(path.resolve(__dirname, '../public')))

  app.get('/data', (req, res) => res.sendFile(DATA_FILE))

  app.get('/current', (req, res) => sensor.getAll((err, data) => {
    if (err) res.status(500).send(err)
    else res.json(data)
  }))

  app.listen(PORT)
}
