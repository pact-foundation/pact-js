import * as mockery from 'mockery';

import * as chai from 'chai';

const MockNative = {
  generate_datetime_string: () => '',
  generate_regex_string: () => '',
};
mockery.registerMock('../../native/index.node', MockNative);

// eslint-disable-next-line import/first
import { VerifierV3 } from './verifier';

const { expect } = chai;

describe('V3 Verifier', () => {
  describe('invalid configuration', () => {
    it('returns an error when no provider name is given', () => {
      expect(
        () =>
          new VerifierV3({
            logLevel: 'info',
            provider: '',
            providerBaseUrl: 'http://localhost',
          })
      ).to.throw('provider name is required');
    });
    it('returns an error when no pactBrokerUrl and an empty list of pactUrls is given', () => {
      expect(
        () =>
          new VerifierV3({
            logLevel: 'info',
            provider: 'unitTest',
            providerBaseUrl: 'http://localhost',
            pactUrls: [],
          })
      ).to.throw('a list of pactUrls or a pactBrokerUrl must be provided');
    });
    it('returns an error when no pactBrokerUrl an no pactUrls is given', () => {
      expect(
        () =>
          new VerifierV3({
            logLevel: 'info',
            provider: 'unitTest',
            providerBaseUrl: 'http://localhost',
          })
      ).to.throw('a list of pactUrls or a pactBrokerUrl must be provided');
    });
  });
});
