'use strict'

import { parse } from 'url'
import { Promise } from 'es6-promise'

export default class Request {

  constructor () {
    if (typeof window === 'undefined') {
      this._request = require('http')
    } else {
      this._request = new window.XMLHttpRequest()
    }
  }

  send (method, url, body) {
    const req = this._request
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        const opts = parse(url)
        opts.method = method
        opts.headers = {
          'X-Pact-Mock-Service': 'true',
          'Content-Type': 'application/json'
        }

        const request = req.request(opts, (response) => {
          let responseBody = ''
          response.setEncoding('utf8')
          response.on('data', (data) => { responseBody += data })
          response.on('end', () => {
            if (response.statusCode >= 200 && response.statusCode < 400) {
              resolve(responseBody)
            } else {
              reject(responseBody)
            }
          })
        })

        request.on('error', (err) => { reject(err) })

        if (body) {
          request.write(body)
        }

        request.end()
      } else {
        req.onload = () => {
          if (req.status >= 200 && req.status < 400) {
            resolve(req.responseText)
          } else {
            reject(req.responseText)
          }
        }

        req.onerror = (err) => { reject(err) }

        req.open(method, url, true)
        req.setRequestHeader('X-Pact-Mock-Service', 'true')
        req.setRequestHeader('Content-Type', 'application/json')
        req.send(body)
      }
    })
  }
}
