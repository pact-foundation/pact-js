import type { ConsumerInteraction } from '@pact-foundation/pact-core';
import { vi } from 'vitest';
import { XmlBuilder } from '../../v4';
import { ResponseWithPluginBuilder } from './responseWithPluginBuilder';

describe('V4 ResponseWithPluginBuilder', () => {
  let withResponseBody: ReturnType<typeof vi.fn>;
  let interaction: ConsumerInteraction;
  let builder: ResponseWithPluginBuilder;

  beforeEach(() => {
    withResponseBody = vi.fn();
    interaction = { withResponseBody } as unknown as ConsumerInteraction;
    builder = new ResponseWithPluginBuilder(interaction);
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

    it('returns the builder for chaining', () => {
      const body = new XmlBuilder('1.0', 'UTF-8', 'root').build(() => {});

      const result = builder.xmlBody(body);

      expect(result).toBe(builder);
    });
  });
});
