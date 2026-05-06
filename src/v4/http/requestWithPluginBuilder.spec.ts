import type { ConsumerInteraction } from '@pact-foundation/pact-core';
import { vi } from 'vitest';
import { XmlBuilder } from '../../v4';
import { RequestWithPluginBuilder } from './requestWithPluginBuilder';

describe('V4 RequestWithPluginBuilder', () => {
  let withRequestBody: ReturnType<typeof vi.fn>;
  let interaction: ConsumerInteraction;
  let builder: RequestWithPluginBuilder;

  beforeEach(() => {
    withRequestBody = vi.fn();
    interaction = { withRequestBody } as unknown as ConsumerInteraction;
    builder = new RequestWithPluginBuilder(interaction);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('#xmlBody', () => {
    it('delegates to parent and calls withRequestBody with application/xml', () => {
      const body = new XmlBuilder('1.0', 'UTF-8', 'root').build((el) => {
        el.appendElement('item', new Map(), 'value');
      });

      builder.xmlBody(body);

      expect(withRequestBody).toHaveBeenCalledOnce();
      expect(withRequestBody).toHaveBeenCalledWith(body, 'application/xml');
    });

    it('returns a V4RequestWithPluginBuilder for chaining', () => {
      const body = new XmlBuilder('1.0', 'UTF-8', 'root').build(() => {});

      const result = builder.xmlBody(body);

      expect(result).toBe(builder);
    });
  });
});
