import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import nodeNet from 'net';
import { isPortAvailable } from './net';
import logger from './logger';

const { expect } = chai;

chai.use(chaiAsPromised);

describe('Net', () => {
  const port = 4567;
  const defaultHost = '0.0.0.0';
  const specialPort = process.platform.match('win') ? -1 : 80;

  // Utility function to create a server on a given port and return a Promise
  const createServer = (p: number, host = defaultHost) =>
    new Promise((resolve, reject) => {
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
      let closeFn = (cb: any) => cb();

      it('returns a rejected promise', () =>
        createServer(port).then((server: { close(): any }) => {
          closeFn = server.close.bind(server);
          return expect(isPortAvailable(port, defaultHost)).to.eventually.be
            .rejected;
        }));

      // close the servers used in this test as to not conflict with other tests
      afterEach((done) => closeFn(done));
    });

    context('when a single host is unavailable', () => {
      let closeFn = (cb: any) => cb();

      it('returns a fulfilled promise', () =>
        // simulate ::1 being unavailable
        createServer(port, '::1').then((server: { close(): any }) => {
          closeFn = server.close.bind(server);
          // this should work as the `127.0.0.1` is NOT `::1`
          return expect(isPortAvailable(port, '127.0.0.1')).to.eventually.be
            .fulfilled;
        }));

      // close the servers used in this test as to not conflict with other tests
      afterEach((done) => closeFn(done));
    });
  });
});
