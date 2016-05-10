'use strict'

import path from 'path'
import winston from 'winston'

const LOG_FILE = path.resolve(process.cwd(), 'logs', 'pact-consumer.log')

export const logger = new winston.Logger({
  level: 'info',
  transports: [
    new (winston.transports.File)({
      json: false,
      filename: LOG_FILE,
      handleExceptions: true,
      humanReadableUnhandledException: true
    })
  ]
})
