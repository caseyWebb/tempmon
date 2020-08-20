import path from 'path'

import cors from 'cors'
import sensor from 'ds18x20'
import express, { Request, Response } from 'express'

import { DATA_DIRECTORY, PORT } from './config'

const app = express()

export const start = (): void => {
  const nocache = (req: Request, res: Response, next: () => void): void => {
    res.set('Cache-Control', 'no-store')
    next()
  }

  app.use(cors())
  app.use(nocache)
  app.use(express.static(path.resolve(__dirname, '../public')))
  app.use(express.static(DATA_DIRECTORY))

  app.get('/current', (req, res) =>
    sensor.getAll((err, data) => {
      if (err) res.status(500).send(err)
      else res.json(data)
    })
  )

  app.listen(PORT)
}
