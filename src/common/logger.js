/**
 * Logger module.
 * @module logger
 * @private
 */

'use strict'

var config = require('./config')

module.exports = {
  info: (msg) => {
    if (config.logging) {
      console.log(msg)
    }
  }
}
