'use strict'

import Mitm from 'mitm'
import { parse as parseUrl } from 'url'
import isNil from 'lodash.isnil'
import find from 'lodash.find'
import request from 'superagent-bluebird-promise'
import { logger } from './logger'

export default class Interceptor {

  constructor (proxyHost) {
    if (isNil(proxyHost)) {
      throw new Error('Please provide a proxy to route the request to.')
    }

    this.whitelist = [ parseUrl(proxyHost) ]
    this.mitm = Mitm()
    this.mitm.disable()
    this.disabled = true
    this.proxyHost = proxyHost
  }

  interceptRequestsOn (url) {
    const blacklist = []

    if (isNil(url)) {
      logger.info('!!!! INTERCEPTING ALL REQUESTS !!!!')
    } else {
      logger.info(`Intercepting URL "${url}"`)
      blacklist.push(parseUrl(url))
    }

    logger.info('Enabling interceptor.')
    this.mitm.enable()
    this.disabled = false

    const whitelist = this.whitelist
    this.mitm.on('connect', function (socket, opts) {
      const port = opts.port || null

      logger.info(`Intercepting connection with hostname "${opts.host}", port "${port}"`)

      const foundBypass = !!find(whitelist, { hostname: opts.host, port })
      const shouldIntercept = !!find(blacklist, { hostname: opts.host, port })
      if (foundBypass || !shouldIntercept) {
        logger.info(`Bypassing request to "${opts.host}"`)
        socket.bypass()
      }
    })

    const proxyHost = this.proxyHost
    this.mitm.on('request', (req, res) => {
      logger.info(`Request intercepted. Triggering call to Mock Server on "${proxyHost}${req.url}"`)
      request[req.method.toLowerCase()](`${proxyHost}${req.url}`)
        .set(req.headers || {})
        .then((resp) => {
          logger.info(`HTTP ${resp.status} on ${req.url}`)
          res.end(JSON.stringify(resp.body))
        })
        .catch((err) => {
          logger.info(`HTTP ${err.status} on ${req.url}`)
          res.end(JSON.stringify(err.body))
        })
    })
  }

  stopIntercepting () {
    logger.info('Disabling interceptor.')
    this.mitm.disable()
    this.disabled = true
  }

}
