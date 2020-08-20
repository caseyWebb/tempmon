import dotenv from 'dotenv'

dotenv.config()

export const DATA_FILE = process.env.DATA_FILE as string
export const PORT = parseInt(process.env.PORT || '80') as number