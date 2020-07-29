'use strict'

const path = require('path')
const sensor = require('ds18x20')
const express = require('express')
const app = express()
const { DATA_FILE, PORT } = process.env

const nocache = (req, res, next) => {
  res.set('Cache-Control', 'no-store')
  next()
}

const static = express.static(path.resolve(__dirname, '../public'))

exports.start = () => {
  app.use(cors())
  app.use(nocache())
  app.use(static)

  app.get('/data', (req, res) => res.sendFile(DATA_FILE))

  app.get('/current', (req, res) => sensor.getAll((err, data) => {
    if (err) res.err(err)
    else res.json(data)
  }))

  app.listen(PORT)
}
