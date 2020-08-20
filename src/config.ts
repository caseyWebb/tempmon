import path from 'path'

import dotenv from 'dotenv'

dotenv.config()

export const DATA_DIRECTORY =
  process.env.DATA_DIRECTORY || path.resolve(__dirname, '../data')

export const PORT = parseInt(process.env.PORT || '80')
