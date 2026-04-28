import * as chai from 'chai';
import { contentTypeFromHeaders } from './ffi';
import { regex } from './matchers';

const { expect } = chai;

describe('V3 Pact FFI', () => {
  describe('#contentTypeFromHeaders', () => {
    it('uses matcher example value when content-type header is a matcher', () => {
      const headers = {
        'Content-Type': regex(
          /^application\/json(;\s?charset=[\w-]+)?$/i,
          'application/json'
        ),
      };

      expect(contentTypeFromHeaders(headers, 'application/json')).to.eq(
        'application/json'
      );
    });
  });
});
