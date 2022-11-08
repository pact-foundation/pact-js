/* tslint:disable:no-unused-expression no-empty */
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinonChai from 'sinon-chai';
import { SpecificationVersion } from '../../v3';
import { PactV4 } from '../index';
import net = require('net');
import { Verifier } from '../../dsl/verifier';
import path = require('path');
import { providerWithMetadata } from '../../messageProviderPact';
import express = require('express');
import * as http from 'http';

chai.use(sinonChai);
chai.use(chaiAsPromised);

const { expect } = chai;

describe.skip('PactV4', () => {
  const HOST = 'localhost';

  const pact = new PactV4({
    consumer: 'myconsumer',
    provider: 'myprovider',
    spec: SpecificationVersion.SPECIFICATION_VERSION_V4,
    logLevel: 'trace',
  });

  describe('TCP Messages', () => {
    describe('with MATT protocol', async () => {
      it('generates a pact with success', () => {
        const mattMessage = `{"request": {"body": "hellotcp"}, "response":{"body":"tcpworld"}}`;

        return pact
          .addSynchronousInteraction('a MATT message')
          .usingPlugin({
            plugin: 'matt',
            version: '0.0.2',
          })
          .withPluginContents(mattMessage, 'application/matt')
          .startTransport('matt', HOST)
          .executeTest(async (tc) => {
            const message = await sendMattMessageTCP('hello', HOST, tc.port);
            expect(message).to.eq('tcpworld');
          });
      });
    });
  });

  describe('Verification', () => {
    describe('with MATT protocol', () => {
      const HTTP_PORT = 8888;
      const TCP_PORT = 8887;

      beforeEach(async () => {
        await startHTTPServer(HOST, HTTP_PORT);
        await startTCPServer(HOST, TCP_PORT);
      });

      it('validates a matt message', async () => {
        const v = new Verifier({
          providerBaseUrl: `http://${HOST}:${HTTP_PORT}`,
          transports: [
            {
              port: TCP_PORT,
              protocol: 'matt',
              scheme: 'tcp',
            },
          ],
          pactUrls: [
            path.join(
              __dirname,
              '../../..',
              'pacts',
              'myconsumer-myprovider.json'
            ),
          ],
          stateHandlers: {
            'a dog named rover': () => {
              // Add the dog to the database
              dogs[27] = {
                id: 27,
                name: 'fido',
                type: 'bulldog',
              };

              return Promise.resolve();
            },
          },
          messageProviders: {
            'a request for a dog': providerWithMetadata(
              () => {
                return createDog(27);
              },
              {
                queue: 'animals',
              }
            ),
          },
        });

        return v.verifyProvider();
      });
    });
  });
});

const parseMattMessage = (raw: string): string => {
  return raw.replace(/(MATT)+/g, '').trim();
};
const generateMattMessage = (raw: string): string => {
  return `MATT${raw}MATT`;
};

const sendMattMessageTCP = (
  message: string,
  host: string,
  port: number
): Promise<string> => {
  const socket = net.connect({
    port: port,
    host: host,
  });

  const res = socket.write(generateMattMessage(message) + '\n');

  if (!res) {
    throw Error('unable to connect to host');
  }

  return new Promise((resolve) => {
    socket.on('data', (data) => {
      resolve(parseMattMessage(data.toString()));
    });
  });
};

// Server Implementation

const startTCPServer = (host: string, port: number) => {
  const server = net.createServer();

  server.on('connection', (sock) => {
    sock.on('data', (data) => {
      const msg = parseMattMessage(data.toString());

      if (msg === 'hellotcp') {
        sock.write(generateMattMessage('tcpworld'));
      } else {
        sock.write(generateMattMessage('message not understood'));
      }
      sock.write('\n');
    });
  });

  return new Promise((resolve) => {
    server.listen(port, host);

    server.on('listening', () => {
      resolve(null);
    });
  });
};

const startHTTPServer = (host: string, port: number): Promise<http.Server> => {
  const server: express.Express = express();

  server.post('/matt', (_, res) => {
    res.setHeader('content-type', 'application/matt');
    res.send(generateMattMessage('world'));
  });

  let s: http.Server;
  return new Promise<void>((resolve) => {
    s = server.listen(port, host, () => {
      resolve();
    });
  }).then(() => s);
};

interface Dog {
  id: number;
  name: string;
  type: string;
}

const dogs = {};

// API integration client
const createDog = (id: number): Promise<Dog> => {
  return new Promise((resolve) => {
    resolve(dogs[id]);
  });
};
