'use strict'

const parse = require('url').parse
const logger = require('./logger')

module.exports = class Request {

  constructor () {
    if (typeof window === 'undefined') {
      logger.info('Using Node "HTTP" module')
      this._httpRequest = require('http')
      this._httpsRequest = require('https')
    } else {
      logger.info('Using browser "XMLHttpRequest" module')
      this._request = new window.XMLHttpRequest()
    }
  }

  send (method, url, body) {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        const opts = parse(url)
        opts.method = method
        opts.headers = {
          'X-Pact-Mock-Service': 'true',
          'Content-Type': 'application/json'
        }

        logger.info(`Sending request with opts: ${JSON.stringify(opts)}`)

        const req = opts.protocol === 'https:' ? this._httpsRequest : this._httpRequest
        const request = req.request(opts, (response) => {
          let responseBody = ''
          response.setEncoding('utf8')
          response.on('data', (data) => { responseBody += data })
          response.on('end', () => {
            if (response.statusCode >= 200 && response.statusCode < 400) {
              logger.info(`Resolving promise with: ${responseBody}`)
              resolve(responseBody)
            } else {
              logger.info(`Rejecting promise with: ${responseBody}`)
              reject(responseBody)
            }
          })
        })

        request.on('error', (err) => {
          logger.info(`Rejecting promise with: ${err}`)
          reject(err)
        })

        if (body) {
          request.write(body)
        }

        request.end()
      } else {
        const req = this._request
        req.onload = () => {
          if (req.status >= 200 && req.status < 400) {
            logger.info(`Resolving promise with: ${req.responseText}`)
            resolve(req.responseText)
          } else {
            logger.info(`Rejecting promise with: ${req.responseText}`)
            reject(req.responseText)
          }
        }

        req.onerror = (err) => {
          logger.info(`Rejecting promise with: ${err}`)
          reject(err)
        }

        req.open(method, url, true)
        req.setRequestHeader('X-Pact-Mock-Service', 'true')
        req.setRequestHeader('Content-Type', 'application/json')
        req.send(body)
      }
    })
  }
}
