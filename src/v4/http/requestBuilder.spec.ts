import { vi } from 'vitest';
import type { ConsumerInteraction } from '@pact-foundation/pact-core';
import { XmlBuilder } from '../../v4';
import { RequestBuilder } from './requestBuilder';

describe('V4 RequestBuilder', () => {
  let withRequestBody: ReturnType<typeof vi.fn>;
  let interaction: ConsumerInteraction;
  let builder: RequestBuilder;

  beforeEach(() => {
    withRequestBody = vi.fn();
    interaction = { withRequestBody } as unknown as ConsumerInteraction;
    builder = new RequestBuilder(interaction);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('#xmlBody', () => {
    it('calls withRequestBody with application/xml content type', () => {
      const body = new XmlBuilder('1.0', 'UTF-8', 'root').build((el) => {
        el.appendElement('item', new Map(), 'value');
      });

      builder.xmlBody(body);

      expect(withRequestBody).toHaveBeenCalledOnce();
      expect(withRequestBody).toHaveBeenCalledWith(body, 'application/xml');
    });

    it('supports XmlBuilder with matchers', () => {
      const body = new XmlBuilder('1.0', 'UTF-8', 'items').build((el) => {
        el.eachLike('item', new Map(), (item) => item.appendText('value'));
      });

      builder.xmlBody(body);

      expect(withRequestBody).toHaveBeenCalledOnce();
      expect(withRequestBody).toHaveBeenCalledWith(body, 'application/xml');
    });

    it('returns the builder for chaining', () => {
      const body = new XmlBuilder('1.0', 'UTF-8', 'root').build(() => {});

      const result = builder.xmlBody(body);

      expect(result).toBe(builder);
    });
  });
});
