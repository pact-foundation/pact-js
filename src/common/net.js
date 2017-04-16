/**
 * Network module.
 * @module net
 * @private
 */

'use strict'
const net = require('net')

module.exports = {
  isPortAvailable: (port, host) => new Promise((resolve, reject) => {
    const server = net.createServer()
      .listen({port: port, host: host, exclusive: true})
      .on('error', err => (err.code === 'EADDRINUSE' ? reject(new Error(`Port ${port} is unavailable`)) : reject(err)))
      .on('listening', () => server.once('close', () => resolve()).close())
  })
}
