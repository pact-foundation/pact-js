import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

import * as http from 'http';

import { waitForServerReady } from './proxy';

chai.use(chaiAsPromised);

const { expect } = chai;

// Little function to mock out an Event Emitter
const fakeServer = (event: string) => ({
  on: (registeredEvent: string, cb: any) => {
    if (registeredEvent === event) {
      cb();
    }
  },
});

describe('#waitForServerReady', () => {
  context('when the server starts successfully', () => {
    it('returns a successful promise', () => {
      const res = waitForServerReady(fakeServer('listening') as http.Server);

      return expect(res).to.eventually.be.fulfilled;
    });
  });

  context('when the server fails to start', () => {
    it('returns an error', () => {
      const res = waitForServerReady(fakeServer('error') as http.Server);

      return expect(res).to.eventually.be.rejected;
    });
  });
});
