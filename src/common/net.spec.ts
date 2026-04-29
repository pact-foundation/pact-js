import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import nodeNet from 'node:net';
import { isPortAvailable } from './net';
import logger from './logger';

const { expect } = chai;

chai.use(chaiAsPromised);

describe('Net', () => {
  const port = 4567;
  const defaultHost = '0.0.0.0';
  const specialPort = -1;

  // Utility function to create a server on a given port and return a Promise
  const createServer = (p: number, host = defaultHost) =>
    new Promise<nodeNet.Server>((resolve, reject) => {
      const server = nodeNet.createServer();

      server.on('error', (err: any) => reject(err));
      server.on('listening', () => resolve(server));

      server.listen({ port: p, host, exclusive: true }, () => {
        logger.info(`test server is up on ${host}:${p}`);
      });
    });

  describe('#isPortAvailable', () => {
    context('when the port is not allowed to be bound', () => {
      it('returns a rejected promise', () =>
        expect(isPortAvailable(specialPort, defaultHost)).to.eventually.be
          .rejected);
    });

    context('when the port is available', () => {
      it('returns a fulfilled promise', () =>
        expect(isPortAvailable(port, defaultHost)).to.eventually.be.fulfilled);
    });

    context('when the port is unavailable', () => {
      it('returns a rejected promise', () => {
        let server: nodeNet.Server;
        return createServer(port)
          .then((s) => {
            server = s;
            return expect(isPortAvailable(port, defaultHost)).to.eventually.be
              .rejected;
          })
          .finally(
            () =>
              new Promise<void>((resolve) => server?.close(() => resolve())),
          );
      });
    });

    context('when a single host is unavailable', () => {
      it('returns a fulfilled promise', () => {
        let server: nodeNet.Server;
        return createServer(port, '::1')
          .then((s) => {
            server = s;
            // this should work as the `127.0.0.1` is NOT `::1`
            return expect(isPortAvailable(port, '127.0.0.1')).to.eventually.be
              .fulfilled;
          })
          .finally(
            () =>
              new Promise<void>((resolve) => server?.close(() => resolve())),
          );
      });
    });
  });
});
