import type { ConsumerInteraction } from '@pact-foundation/pact-core';
import { vi } from 'vitest';
import { XmlBuilder } from '../../v4';
import { ResponseBuilder } from './responseBuilder';

describe('V4 ResponseBuilder', () => {
  let withResponseBody: ReturnType<typeof vi.fn>;
  let interaction: ConsumerInteraction;
  let builder: ResponseBuilder;

  beforeEach(() => {
    withResponseBody = vi.fn();
    interaction = { withResponseBody } as unknown as ConsumerInteraction;
    builder = new ResponseBuilder(interaction);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('#xmlBody', () => {
    it('calls withResponseBody with application/xml content type', () => {
      const body = new XmlBuilder('1.0', 'UTF-8', 'root').build((el) => {
        el.appendElement('item', new Map(), 'value');
      });

      builder.xmlBody(body);

      expect(withResponseBody).toHaveBeenCalledOnce();
      expect(withResponseBody).toHaveBeenCalledWith(body, 'application/xml');
    });

    it('supports XmlBuilder with matchers', () => {
      const body = new XmlBuilder('1.0', 'UTF-8', 'items').build((el) => {
        el.eachLike('item', new Map(), (item) => item.appendText('value'));
      });

      builder.xmlBody(body);

      expect(withResponseBody).toHaveBeenCalledOnce();
      expect(withResponseBody).toHaveBeenCalledWith(body, 'application/xml');
    });

    it('returns the builder for chaining', () => {
      const body = new XmlBuilder('1.0', 'UTF-8', 'root').build(() => {});

      const result = builder.xmlBody(body);

      expect(result).toBe(builder);
    });
  });
});
