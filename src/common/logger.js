'use strict'

module.exports = {
  info: (msg) => {
    if (LOGGING === 'true') {
      console.log(msg)
    }
  }
}
