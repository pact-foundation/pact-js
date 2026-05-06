import nodeNet from 'node:net';
import logger from './logger';
import { isPortAvailable } from './net';

describe('Net', () => {
  const port = 4567;
  const defaultHost = '0.0.0.0';
  const specialPort = -1;

  // Utility function to create a server on a given port and return a Promise
  const createServer = (p: number, host = defaultHost) =>
    new Promise<nodeNet.Server>((resolve, reject) => {
      const server = nodeNet.createServer();

      server.on('error', (err: Error) => reject(err));
      server.on('listening', () => resolve(server));

      server.listen({ port: p, host, exclusive: true }, () => {
        logger.info(`test server is up on ${host}:${p}`);
      });
    });

  describe('#isPortAvailable', () => {
    describe('when the port is not allowed to be bound', () => {
      it('returns a rejected promise', async () => {
        await expect(
          isPortAvailable(specialPort, defaultHost),
        ).rejects.toBeDefined();
      });
    });

    describe('when the port is available', () => {
      it('returns a fulfilled promise', async () => {
        await isPortAvailable(port, defaultHost);
      });
    });

    describe('when the port is unavailable', () => {
      it('returns a rejected promise', async () => {
        const server = await createServer(port);
        try {
          await expect(
            isPortAvailable(port, defaultHost),
          ).rejects.toBeDefined();
        } finally {
          await new Promise<void>((resolve) => server?.close(() => resolve()));
        }
      });
    });

    describe('when a single host is unavailable', () => {
      it('returns a fulfilled promise', async () => {
        const server = await createServer(port, '::1');
        try {
          // this should work as the `127.0.0.1` is NOT `::1`
          await isPortAvailable(port, '127.0.0.1');
        } finally {
          await new Promise<void>((resolve) => server?.close(() => resolve()));
        }
      });
    });
  });
});
