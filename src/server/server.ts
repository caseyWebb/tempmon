import path from 'path'

import cors from 'cors'
import sensor from 'ds18x20'
import express, { Request, Response } from 'express'
import expressStaticGzip from 'express-static-gzip'

import { DATA_DIRECTORY, PORT } from './config'

const app = express()

export const start = (): void => {
  const servePublic = expressStaticGzip(
    path.resolve(__dirname, '../../public'),
    {
      enableBrotli: true,
    }
  )
  const nocache = (req: Request, res: Response, next: () => void): void => {
    res.set('Cache-Control', 'no-store')
    next()
  }

  app.use(cors())
  app.use(servePublic)

  app.get('/', (req, res) => res.redirect('/app'))

  app.get('/current', nocache, (req, res) =>
    sensor.getAll((err, data) => {
      if (err) res.status(500).send(err)
      else res.json(data)
    })
  )

  app.use('/data', nocache, express.static(DATA_DIRECTORY))

  app.listen(PORT)
}
