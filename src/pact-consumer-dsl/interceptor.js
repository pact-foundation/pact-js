'use strict'

import Mitm from 'mitm'
import { parse as parseUrl } from 'url'
import isNil from 'lodash.isnil'
import find from 'lodash.find'
import request from 'superagent'

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
      console.log('!!!! Intercepting all requests !!!!')
    } else {
      blacklist.push(parseUrl(url))
    }

    this.mitm.enable()
    this.disabled = false

    const whitelist = this.whitelist
    this.mitm.on('connect', function (socket, opts) {
      const port = opts.port || null

      const foundBypass = !!find(whitelist, { hostname: opts.host, port })
      const shouldIntercept = !!find(blacklist, { hostname: opts.host, port })
      if (foundBypass || !shouldIntercept) {
        socket.bypass()
      }
    })

    const proxyHost = this.proxyHost
    this.mitm.on('request', (req, res) => {
      request[req.method.toLowerCase()](`${proxyHost}${req.url}`)
        .set(req.headers || {})
        .then((resp) => { res.end(JSON.stringify(resp.body)) })
        .catch((err) => {
          const errorMsg = {
            error: true,
            body: err.body
          }
          res.end(JSON.stringify(errorMsg))
        })
    })
  }

  disable () {
    this.mitm.disable()
    this.disabled = true
  }

}
