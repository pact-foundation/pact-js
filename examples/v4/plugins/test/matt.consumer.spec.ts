/* tslint:disable:no-unused-expression no-empty */
import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { SpecificationVersion, PactV4, LogLevel } from '@pact-foundation/pact';
import net = require('net');
import { generateMattMessage, parseMattMessage } from '../protocol';
import axios from 'axios';

chai.use(chaiAsPromised);

const { expect } = chai;

describe('Plugins - Matt Protocol', () => {
  const HOST = '127.0.0.1';

  describe('HTTP transport', () => {
    const pact = new PactV4({
      consumer: 'myconsumer',
      provider: 'myprovider',
      spec: SpecificationVersion.SPECIFICATION_VERSION_V4,
      logLevel: (process.env.LOG_LEVEL as LogLevel) || 'error',
    });
    it('returns a valid MATT message', async () => {
      const mattRequest = `{"request": {"body": "hello"}}`;
      const mattResponse = `{"response":{"body":"world"}}`;

      await pact
        .addInteraction()
        .given('the Matt protocol is up')
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
        .executeTest((mockserver) => {
          return axios
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
            });
        });
    });
  });

  describe('TCP (plugin) transport', () => {
    const pact = new PactV4({
      consumer: 'myconsumer',
      provider: 'myprovider',
      spec: SpecificationVersion.SPECIFICATION_VERSION_V4,
      logLevel: (process.env.LOG_LEVEL as LogLevel) || 'error',
    });

    it('returns a valid MATT message', () => {
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
          const message = await sendMattMessageTCP('hellotcp', HOST, tc.port);
          expect(message).to.eq('tcpworld');
        });
    });
  });

  describe('No transport', () => {
    const pact = new PactV4({
      consumer: 'myconsumer',
      provider: 'myprovider',
      spec: SpecificationVersion.SPECIFICATION_VERSION_V4,
      logLevel: (process.env.LOG_LEVEL as LogLevel) || 'error',
    });

    describe('with plain text (text/plain)', async () => {
      it('returns a valid MATT message', () => {
        return pact
          .addSynchronousInteraction('a MATT message (text/plain)')
          .given('the Matt protocol is up')
          .withRequest((builder) => {
            builder.withContent('text/plain', Buffer.from('hellotcp'));
          })
          .withResponse((builder) => {
            builder.withContent('text/plain', Buffer.from('tcpworld'));
          })
          .executeTest(async (message) => {
            const request = message?.Request?.content?.toString() || '';
            const response = message?.Response[0]?.content?.toString() || '';
            expect(request).to.deep.eq('hellotcp');
            expect(response).to.deep.eq('tcpworld');
          });
      });
    });
    describe('with JSON (application/json)', async () => {
      it('returns a valid MATT message', () => {
        return pact
          .addSynchronousInteraction('a MATT message (application/json)')
          .given('the Matt protocol is up')
          .withRequest((builder) => {
            builder.withJSONContent({
              matt: 'hellotcp',
            });
          })
          .withResponse((builder) => {
            builder.withJSONContent({
              matt: 'tcpworld',
            });
          })
          .executeTest(async (message) => {
            const request = message?.Request?.content?.toString() || '';
            const response = message?.Response[0]?.content?.toString() || '';
            expect(JSON.parse(request)).to.deep.eq({ matt: 'hellotcp' });
            expect(JSON.parse(response)).to.deep.eq({ matt: 'tcpworld' });
          });
      });
    });
    describe('with plugin contents (application/matt)', async () => {
      it('returns a valid MATT message', () => {
        const mattMessage = `{"request": {"body": "hellotcp"}, "response":{"body":"tcpworld"}}`;

        return pact
          .addSynchronousInteraction('a MATT message (application/matt)')
          .given('the Matt protocol is up')
          .usingPlugin({
            plugin: 'matt',
            version: '0.1.1',
          })
          .withPluginContents(mattMessage, 'application/matt')
          .executeTest(async (message) => {
            // simulate sending and received a MATT message
            const response = parseMattMessage(
              message?.Response[0]?.content?.toString() || ''
            );
            expect(response).to.deep.eq('tcpworld');
          });
      });
    });
    describe('with plugin contents (application/matt)', async () => {
      it('receives a valid asynchronous MATT message', () => {
        const mattMessage = `{"response":{"body":"tcpworld"}}`;
        // const mattMessage = `{"request": {"body": "hellotcp"}, "response":{"body":"tcpworld"}}`;

        return pact
          .addAsynchronousInteraction()
          .given('the Matt protocol is up')
          .usingPlugin({
            plugin: 'matt',
            version: '0.1.1',
          })
          .expectsToReceive('an asynchronous MATT message')
          .withPluginContents(mattMessage, 'application/matt')
          .executeTest(async (message) => {
            // simulate sending and received a MATT message

            const response = parseMattMessage(
              Buffer.from(
                String(message?.contents?.content || ''),
                'base64'
              ).toString()
            );
            expect(response).to.deep.eq('tcpworld');
          });
      });
    });
  });
});

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
      socket.destroy();
    });
  });
};
