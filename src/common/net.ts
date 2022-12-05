/**
 * Network module.
 * @module net
 * @private
 */

import * as net from 'net';

export const localAddresses = ['127.0.0.1', 'localhost', '0.0.0.0', '::1'];

export const portCheck = (port: number, host: string): Promise<void> =>
  new Promise((resolve, reject) => {
    const server = net
      .createServer()
      .listen({ port, host, exclusive: true })
      .on('error', (e: NodeJS.ErrnoException) => {
        if (e.code === 'EADDRINUSE') {
          reject(new Error(`Port ${port} is unavailable on address ${host}`));
        } else {
          reject(e);
        }
      })
      .on('listening', () => {
        server.once('close', () => resolve()).close();
      });
  });

export const isPortAvailable = (port: number, host: string): Promise<void> =>
  Promise.allSettled(
    localAddresses.map((localHost) => portCheck(port, localHost))
  ).then((settledPortChecks) => {
    // if every port check failed, then fail the `isPortAvailable` check
    if (settledPortChecks.every((result) => result.status === 'rejected')) {
      throw new Error(`Cannot open port ${port} on ipv4 or ipv6 interfaces`);
    }

    // the local addresses passed - now check the host that the user has specified
    return portCheck(port, host);
  });

export const freePort = (): Promise<number> => {
  return new Promise((res) => {
    const s = net.createServer();
    s.listen(0, () => {
      const addr = s.address();
      if (addr !== null && typeof addr !== 'string') {
        const port = addr.port;
        s.close(() => res(port));
      } else {
        throw Error('unable to find a free port');
      }
    });
  });
};
