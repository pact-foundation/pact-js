/* tslint:disable:no-unused-expression no-empty */
import { Verifier } from '@pact-foundation/pact';
import path = require('path');
import { startHTTPServer, startTCPServer } from '../provider';

describe('Plugins', () => {
  const HOST = '127.0.0.1';

  describe('Verification', () => {
    describe('with MATT protocol', () => {
      const HTTP_PORT = 8888;
      const TCP_PORT = 8887;

      beforeEach(async () => {
        await startHTTPServer(HOST, HTTP_PORT);
        await startTCPServer(HOST, TCP_PORT);
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
