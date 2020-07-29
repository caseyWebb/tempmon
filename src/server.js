'use strict'

const path = require('path')
const cors = require('cors')
const sensor = require('ds18x20')
const express = require('express')
const app = express()
const { DATA_FILE, PORT } = process.env

exports.start = () => {
  const nocache = (req, res, next) => {
    res.set('Cache-Control', 'no-store')
    next()
  }

  app.use(cors())
  app.use(nocache)
  app.use(express.static(path.resolve(__dirname, '../public')))

  app.get('/data', (req, res) => res.sendFile(DATA_FILE))

  app.get('/current', (req, res) => sensor.getAll((err, data) => {
    if (err) res.err(err)
    else res.json(data)
  }))

  app.listen(PORT)
}
