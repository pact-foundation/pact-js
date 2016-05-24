'use strict'

const SHOULD_LOG = process.env.LOGGING ? process.env.LOGGING : 'false'

export const logger = {
  info: (msg) => {
    if (SHOULD_LOG === 'true') {
      console.log(msg)
    }
  }
}
