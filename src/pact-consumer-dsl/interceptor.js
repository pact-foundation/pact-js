'use strict'

import Mitm from 'mitm'
import request from 'superagent-bluebird-promise'

export default class Interceptor {

  constructor (targetHost, proxyHost) {
    this.interceptor = Mitm()

    this.interceptor.on('connect', function (socket, opts) {
      if (opts.host !== targetHost) {
        socket.bypass()
      }
    })

    this.interceptor.on('request', (req, res) => {
      request[req.method.toLowerCase()](`${proxyHost}/${req.url}`)
        .set(this.requestHeaders)
        .then(() => { res.end() })
        .catch((err) => { throw err })
    })
  }

  addRequestHeaders (headers) {
    this.requestHeaders = headers || {}
  }

  disable () {
    this.interceptor.disable()
  }
}
