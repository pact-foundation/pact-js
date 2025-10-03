/* tslint:disable:no-unused-expression no-empty */
import {
  MessageDescriptor,
  providerWithMetadata,
  Verifier,
} from '@pact-foundation/pact';
import { AddressInfo } from 'net';
import * as path from 'path';
import { startHTTPServer, startTCPServer } from '../provider';
import { parseMattMessage } from '../protocol';

describe('Plugins', () => {
  const HOST = '127.0.0.1';

  describe('Verification', () => {
    describe('with MATT protocol', () => {
      let httpPort: number;
      let tcpPort: number;

      beforeEach(async () => {
        httpPort = ((await startHTTPServer(HOST)).address() as AddressInfo)
          .port;
        tcpPort = await startTCPServer(HOST);

        console.log('Started on ports TCP: ', tcpPort, ' HTTP:', httpPort);
      });

      it('validates TCP, HTTP and transportless matt messages', async () => {
        const v = new Verifier({
          providerBaseUrl: `http://${HOST}:${httpPort}`,
          transports: [
            {
              port: tcpPort,
              protocol: 'matt',
              scheme: 'tcp',
            },
          ],
          pactUrls: [
            path.join(__dirname, '../', 'pacts', 'myconsumer-myprovider.json'),
          ],
          messageProviders: {
            'an asynchronous MATT message': providerWithMetadata(
              () => {
                return Buffer.from('tcpworld');
              },
              {
                contentType: 'application/matt',
              }
            ),
            'a MATT message (text/plain)': providerWithMetadata(
              (message: MessageDescriptor) => {
                const request = message.content as any;
                if (Buffer.from(request).toString() === 'hellotcp') {
                  return Buffer.from('MATTtcpworldMATT');
                }
                return Buffer.from('error');
              },
              {
                contentType: 'text/plain',
              }
            ),
            'a MATT message (application/json)': (
              message: MessageDescriptor
            ) => {
              const request = message.content as any;

              if (request.matt === 'hellotcp') {
                return {
                  matt: 'tcpworld',
                };
              }

              return {
                matt: 'error',
              };
            },
            'a MATT message (application/matt)': providerWithMetadata(
              (message: MessageDescriptor) => {
                const request = message.content as any;
                if (
                  parseMattMessage(Buffer.from(request).toString()) ===
                  'hellotcp'
                ) {
                  return Buffer.from('MATTtcpworld');
                }
                return Buffer.from('MATTerrorMATT');
              },
              {
                contentType: 'application/matt',
              }
            ),
          },
        });

        return v.verifyProvider();
      });
    });
  });
});
