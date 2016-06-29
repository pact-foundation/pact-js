'use strict'

import Mitm from 'mitm'
import { request } from 'http'
import find from 'lodash.find'
import isNil from 'lodash.isnil'
import { parse as parseUrl } from 'url'

import logger from '../common/logger'

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
      const parsedUrl = parseUrl(url)
      if (parsedUrl.port === null) {
        parsedUrl.port = parsedUrl.protocol === 'http:' ? 80 : 443
      }
      blacklist.push(parsedUrl)
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
    this.mitm.on('request', (interceptedRequest, res) => {
      logger.info(`Request intercepted. Triggering call to Mock Server on "${proxyHost}${interceptedRequest.url}"`)

      const opts = parseUrl(`${proxyHost}${interceptedRequest.url}`)
      opts.method = interceptedRequest.method.toLowerCase()
      opts.headers = interceptedRequest.headers || {}

      const proxyRequest = request(opts, (interceptedResponse) => {
        let interceptedResponseBody = ''
        interceptedResponse.setEncoding('utf8')
        interceptedResponse.on('data', (data) => { interceptedResponseBody += data })
        interceptedResponse.on('end', () => {
          logger.info(`HTTP ${interceptedResponse.statusCode} on ${interceptedRequest.url}`)

          if (interceptedResponse.statusCode > 400) {
            res.statusCode = interceptedResponse.statusCode
          }

          res.end(interceptedResponseBody)
        })
      })

      proxyRequest.on('error', (err) => {
        console.log(`HTTP ${err.statusCode} on ${interceptedRequest.url}`)
        res.end(err)
      })

      proxyRequest.end()
    })
  }

  stopIntercepting () {
    logger.info('Disabling interceptor.')
    this.mitm.disable()
    this.disabled = true
  }

}
