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
      const result = new VerifierV3({
        logLevel: '',
        provider: '',
        providerBaseUrl: '',
      }).verifyProvider();

      return expect(result).to.eventually.be.rejectedWith(
        Error,
        'Provider name is required'
      );
    });
    it('returns an error when no pactBrokerUrl and an empty list of pactUrls is given', () => {
      const result = new VerifierV3({
        logLevel: '',
        provider: 'unitTest',
        providerBaseUrl: '',
        pactUrls: [],
      }).verifyProvider();
      return expect(result).to.eventually.be.rejectedWith(
        Error,
        'Either a list of pactUrls or a pactBrokerUrl must be provided'
      );
    });
    it('returns an error when no pactBrokerUrl an no pactUrls is given', () => {
      const result = new VerifierV3({
        logLevel: '',
        provider: 'unitTest',
        providerBaseUrl: '',
      }).verifyProvider();
      return expect(result).to.eventually.be.rejectedWith(
        Error,
        'Either a list of pactUrls or a pactBrokerUrl must be provided'
      );
    });
  });
});
