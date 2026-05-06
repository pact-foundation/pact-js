import type * as http from 'node:http';

import { waitForServerReady } from './proxy';

// Little function to mock out an Event Emitter
const fakeServer = (event: string) => ({
  on: (registeredEvent: string, cb: () => void) => {
    if (registeredEvent === event) {
      cb();
    }
  },
});

describe('#waitForServerReady', () => {
  describe('when the server starts successfully', () => {
    it('returns a successful promise', async () => {
      await waitForServerReady(fakeServer('listening') as http.Server);
    });
  });

  describe('when the server fails to start', () => {
    it('returns an error', async () => {
      await expect(
        waitForServerReady(fakeServer('error') as http.Server),
      ).rejects.toBeDefined();
    });
  });
});
