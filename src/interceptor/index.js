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
    this.mitm.on('request', (req, res) => {
      logger.info(`Request intercepted. Triggering call to Mock Server on "${proxyHost}${req.url}"`)

      const opts = parseUrl(`${proxyHost}${req.url}`)
      opts.method = req.method.toLowerCase()
      opts.headers = req.headers || {}

      const _request = request(opts, (response) => {
        let responseBody = ''
        response.setEncoding('utf8')
        response.on('data', (data) => { responseBody += data })
        response.on('end', () => {
          logger.info(`HTTP ${response.statusCode} on ${req.url}`)
          res.end(responseBody)
        })
      })

      _request.on('error', (err) => {
        logger.info(`HTTP ${err.statusCode} on ${req.url}`)
        res.end(err)
      })

      // TODO not sure what to do here
      // if (req.body) {
      //   req.write(req.body)
      // }

      _request.end()
    })
  }

  stopIntercepting () {
    logger.info('Disabling interceptor.')
    this.mitm.disable()
    this.disabled = true
  }

}
