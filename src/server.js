'use strict'

const path = require('path')
const express = require('express')
const app = express()
const { DATA_FILE, PORT } = process.env

exports.start = () => {
  app.use(express.static(path.resolve(__dirname, '../public')))
  app.get('/data', (req, res) => res.sendFile(DATA_FILE))
  app.get('/current', (req, res) => res.json(sensor.getAll()))

  app.listen(PORT)
}
