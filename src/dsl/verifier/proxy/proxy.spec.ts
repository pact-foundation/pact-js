import http from 'node:http';
import type { AddressInfo } from 'node:net';
import bodyParser from 'body-parser';
import express from 'express';

import { createProxy, waitForServerReady } from './proxy';

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

describe('#createProxy', () => {
  const sendFormPost = (port: number, payload: string): Promise<unknown> =>
    new Promise((resolve, reject) => {
      const req = http.request(
        {
          hostname: '127.0.0.1',
          port,
          path: '/token',
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(payload),
          },
        },
        (res) => {
          const chunks: Buffer[] = [];
          res.on('data', (c) => chunks.push(c));
          res.on('end', () => {
            resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
          });
        },
      );
      req.on('error', reject);
      req.end(payload);
    });

  it('forwards application/x-www-form-urlencoded bodies intact without JSON serialization', async () => {
    const providerApp = express();
    providerApp.use(bodyParser.urlencoded({ extended: true }));
    providerApp.post('/token', (req, res) => {
      res.json(req.body);
    });

    const providerServer = await waitForServerReady(
      providerApp.listen(0, '127.0.0.1'),
    );
    const providerPort = (providerServer.address() as AddressInfo).port;

    const proxyServer = await waitForServerReady(
      createProxy(
        { providerBaseUrl: `http://127.0.0.1:${providerPort}` },
        '/_pactSetup',
        '/_pactMessage',
        { insideInteraction: false, errors: [] },
      ),
    );
    const proxyPort = (proxyServer.address() as AddressInfo).port;

    try {
      const received = await sendFormPost(
        proxyPort,
        'grant_type=client_credentials&scope=read+write',
      );
      expect(received).toEqual({
        grant_type: 'client_credentials',
        scope: 'read write',
      });
    } finally {
      proxyServer.close();
      providerServer.close();
    }
  });

  it('updates Content-Length when requestFilter modifies a urlencoded body object', async () => {
    const providerApp = express();
    providerApp.use(bodyParser.urlencoded({ extended: true }));
    providerApp.post('/token', (req, res) => {
      res.json(req.body);
    });

    const providerServer = await waitForServerReady(
      providerApp.listen(0, '127.0.0.1'),
    );
    const providerPort = (providerServer.address() as AddressInfo).port;

    const proxyServer = await waitForServerReady(
      createProxy(
        {
          providerBaseUrl: `http://127.0.0.1:${providerPort}`,
          requestFilter: (req, _res, next) => {
            req.body.scope = 'admin';
            next();
          },
        },
        '/_pactSetup',
        '/_pactMessage',
        { insideInteraction: false, errors: [] },
      ),
    );
    const proxyPort = (proxyServer.address() as AddressInfo).port;

    try {
      const received = await sendFormPost(
        proxyPort,
        'grant_type=client_credentials',
      );
      expect(received).toEqual({
        grant_type: 'client_credentials',
        scope: 'admin',
      });
    } finally {
      proxyServer.close();
      providerServer.close();
    }
  });
});
