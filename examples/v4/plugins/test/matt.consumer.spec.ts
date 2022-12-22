/* tslint:disable:no-unused-expression no-empty */
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { SpecificationVersion, PactV4, LogLevel } from '@pact-foundation/pact';
import net = require('net');
import { generateMattMessage, parseMattMessage } from '../protocol';
import axios from 'axios';

chai.use(chaiAsPromised);

const { expect } = chai;

describe('Plugins - Matt Protocol', () => {
  const HOST = '127.0.0.1';

  describe('HTTP interface', () => {
    const pact = new PactV4({
      consumer: 'myconsumer',
      provider: 'myprovider',
      spec: SpecificationVersion.SPECIFICATION_VERSION_V4,
      logLevel: (process.env.LOG_LEVEL as LogLevel) || 'error',
    });
    it('returns a valid MATT message over HTTP', async () => {
      const mattRequest = `{"request": {"body": "hello"}}`;
      const mattResponse = `{"response":{"body":"world"}}`;

      await pact
        .addInteraction()
        .given('the Matt protocol exists')
        .uponReceiving('an HTTP request to /matt')
        .usingPlugin({
          plugin: 'matt',
          version: '0.0.7',
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

  describe('TCP interface', () => {
    const pact = new PactV4({
      consumer: 'myconsumer',
      provider: 'myprovider',
      spec: SpecificationVersion.SPECIFICATION_VERSION_V4,
      logLevel: (process.env.LOG_LEVEL as LogLevel) || 'error',
    });

    describe('with MATT protocol', async () => {
      it('generates a pact with success', () => {
        const mattMessage = `{"request": {"body": "hellotcp"}, "response":{"body":"tcpworld"}}`;

        return pact
          .addSynchronousInteraction('a MATT message')
          .usingPlugin({
            plugin: 'matt',
            version: '0.0.7',
          })
          .withPluginContents(mattMessage, 'application/matt')
          .startTransport('matt', HOST)
          .executeTest(async (tc) => {
            const message = await sendMattMessageTCP('hellotcp', HOST, tc.port);
            expect(message).to.eq('tcpworld');
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
    });
  });
};
