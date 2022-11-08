/* tslint:disable:no-unused-expression no-empty */
import chai from 'chai';
import axios from 'axios';
import chaiAsPromised from 'chai-as-promised';
import sinonChai from 'sinon-chai';
import { SpecificationVersion } from '../../v3';
import { PactV4 } from '../index';

chai.use(sinonChai);
chai.use(chaiAsPromised);

const { expect } = chai;

describe.skip('PactV4', () => {
  const pact = new PactV4({
    consumer: 'myconsumer',
    provider: 'myprovider',
    spec: SpecificationVersion.SPECIFICATION_VERSION_V4,
    logLevel: 'debug',
  });

  describe('HTTP test', () => {
    it('returns a valid MATT message over HTTP', async () => {
      const mattRequest = `{"request": {"body": "hello"}}`;
      const mattResponse = `{"response":{"body":"world"}}`;

      await pact
        .addInteraction()
        .given('the Matt protocol exists')
        .uponReceiving('an HTTP request to /matt')
        .usingPlugin({
          plugin: 'matt',
          version: '0.0.2',
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
});

const parseMattMessage = (raw: string): string => {
  return raw.replace(/(MATT)+/g, '').trim();
};
const generateMattMessage = (raw: string): string => {
  return `MATT${raw}MATT`;
};
