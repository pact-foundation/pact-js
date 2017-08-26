/**
 * Network module.
 * @module net
 * @private
 */

import * as net from 'net';

const isPortAvailable = function (port: number, host: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const server: any = net.createServer()
      .listen({ port: port, host: host, exclusive: true })
      .on('error', (err: any) => (err.code === 'EADDRINUSE' ? reject(new Error(`Port ${port} is unavailable`)) : reject(err)))
      .on('listening', () => server.once('close', () => resolve()).close())
  })
}

export {
  isPortAvailable
};
