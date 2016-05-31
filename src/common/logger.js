'use strict'

import config from './config'

module.exports = {
  info: (msg) => {
    if (config.logging) {
      console.log(msg)
    }
  }
}
