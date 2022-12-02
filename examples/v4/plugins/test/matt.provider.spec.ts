/* tslint:disable:no-unused-expression no-empty */
import { Verifier } from '@pact-foundation/pact';
import { AddressInfo } from 'net';
import path = require('path');
import { startHTTPServer, startTCPServer } from '../provider';

describe('Plugins', () => {
  const HOST = '127.0.0.1';

  describe('Verification', () => {
    describe('with MATT protocol', () => {
      let HTTP_PORT: number;
      let TCP_PORT: number;

      beforeEach(async () => {
        HTTP_PORT = ((await startHTTPServer(HOST)).address() as AddressInfo)
          .port;
        TCP_PORT = await startTCPServer(HOST);

        console.log(
          'servers started on ports => TCP: ',
          TCP_PORT,
          ' HTTP:',
          HTTP_PORT
        );
      });

      it('validates TCP and HTTP matt messages', async () => {
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
            path.join(__dirname, '../', 'pacts', 'myconsumer-myprovider.json'),
          ],
        });

        return v.verifyProvider();
      });
    });
  });
});
