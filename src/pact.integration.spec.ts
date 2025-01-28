/* tslint:disable:no-unused-expression no-empty */
import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinonChai from 'sinon-chai';
import axios from 'axios';
import net = require('net');

process.env.ENABLE_FEATURE_V4 = 'true';

// eslint-disable-next-line import/first
import { PactV4 } from './v4';

const { expect } = chai;

chai.use(sinonChai);
chai.use(chaiAsPromised);

describe('V4 Pact', () => {
  let pact: PactV4;

  beforeEach(() => {
    pact = new PactV4({
      consumer: 'v4consumer',
      provider: 'v4provider',
    });
  });

  describe('HTTP req/res contract', () => {
    it('generates a pact', () =>
      pact
        .addInteraction()
        .given('some state')
        .given('a second state')
        .uponReceiving('a standard HTTP req/res')
        .withRequest('POST', '/', (builder) => {
          builder
            .jsonBody({
              foo: 'bar',
            })
            .headers({
              'x-foo': 'x-bar',
            });
        })
        .willRespondWith(200, (builder) => {
          builder
            .jsonBody({
              foo: 'bar',
            })
            .headers({
              'x-foo': 'x-bar',
            });
        })
        .executeTest(async (server) =>
          axios.post(
            server.url,
            {
              foo: 'bar',
            },
            {
              headers: {
                'x-foo': 'x-bar',
              },
            }
          )
        ));
  });

  describe('Plugin test', () => {
    describe('Using the MATT plugin', () => {
      const parseMattMessage = (raw: string): string =>
        raw.replace(/(MATT)+/g, '').trim();

      const generateMattMessage = (raw: string): string => `MATT${raw}MATT`;

      describe('HTTP interface', () => {
        it('generates a pact', async () => {
          const mattRequest = `{"request": {"body": "hello"}}`;
          const mattResponse = `{"response":{"body":"world"}}`;

          await pact
            .addInteraction()
            .given('the Matt protocol exists')
            .uponReceiving('an HTTP request to /matt')
            .usingPlugin({
              plugin: 'matt',
              version: '0.1.1',
            })
            .withRequest('POST', '/matt', (builder) => {
              builder.pluginContents('application/matt', mattRequest);
            })
            .willRespondWith(200, (builder) => {
              builder.pluginContents('application/matt', mattResponse);
            })
            .executeTest((mockserver) =>
              axios
                .request({
                  baseURL: mockserver.url,
                  headers: {
                    'content-type': 'application/matt',
                    Accept: 'application/matt',
                  },
                  data: generateMattMessage('hello'),
                  method: 'POST',
                  url: '/matt',
                })
                .then((res) => {
                  expect(parseMattMessage(res.data)).to.eq('world');
                })
            );
        });
      });

      describe('Synchronous Message (TCP) ', () => {
        describe('with MATT protocol', () => {
          const HOST = '127.0.0.1';

          const sendMattMessageTCP = (
            message: string,
            host: string,
            port: number
          ): Promise<string> => {
            const socket = net.connect({
              port,
              host,
            });

            const res = socket.write(`${generateMattMessage(message)}\n`);

            if (!res) {
              throw Error('unable to connect to host');
            }

            return new Promise((resolve) => {
              socket.on('data', (data) => {
                resolve(parseMattMessage(data.toString()));
                socket.destroy();
              });
            });
          };

          it('generates a pact', () => {
            const mattMessage = `{"request": {"body": "hellotcp"}, "response":{"body":"tcpworld"}}`;

            return pact
              .addSynchronousInteraction('a MATT message')
              .usingPlugin({
                plugin: 'matt',
                version: '0.1.1',
              })
              .withPluginContents(mattMessage, 'application/matt')
              .startTransport('matt', HOST)
              .executeTest(async (tc) => {
                const message = await sendMattMessageTCP(
                  'hellotcp',
                  HOST,
                  tc.port
                );
                expect(message).to.eq('tcpworld');
              });
          });
        });
      });
    });
  });
});
