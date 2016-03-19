'use strict'

import Mitm from 'mitm'
import isNil from 'lodash.isnil'
import cloneDeep from 'lodash.clonedeep'
import request from 'superagent-bluebird-promise'

export default class Interceptor {

  constructor (targetHost, targetPort = 80, proxyHost) {
    if (isNil(targetHost) || isNil(proxyHost)) {
      throw new Error('Please provide a target host and a proxy host to route the request to.')
    }

    this.mitm = Mitm()
    this.targetHost = targetHost
    this.targetPort = targetPort
    this.proxyHost = proxyHost
    this.requestHeaders = {}
  }

  interceptRequests () {
    const targetHost = this.targetHost
    const targetPort = this.targetPort
    this.mitm.on('connect', function (socket, opts) {
      if (opts.host !== targetHost && opts.port !== targetPort) {
        socket.bypass()
      }
    })

    const proxyHost = this.proxyHost
    const headers = this.requestHeaders
    this.mitm.on('request', (req, res) => {
      request[req.method.toLowerCase()](`${proxyHost}${req.url}`)
        .set(headers)
        .then(() => { res.end('all good') })
        .catch((err) => { throw err })
    })
  }

  addRequestHeaders (headers) {
    this.requestHeaders = cloneDeep(headers) || {}
  }

  disable () {
    this.mitm.disable()
  }
}
