/* tslint:disable:no-unused-expression no-empty */
import { Verifier } from '@pact-foundation/pact';
import { AddressInfo } from 'net';
import path = require('path');
import { startHTTPServer, startTCPServer } from '../provider';

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

      it('validates TCP and HTTP matt messages', async () => {
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
        });

        return v.verifyProvider();
      });
    });
  });
});
