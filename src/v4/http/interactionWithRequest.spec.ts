import type {
  ConsumerInteraction,
  ConsumerPact,
} from '@pact-foundation/pact-core';
import { vi } from 'vitest';
import { InteractionWithRequest } from './interactionWithRequest';
import { HTTPResponseStatusClass, matchStatus } from '../../v3/matchers';

describe('InteractionWithRequest', () => {
  let withStatus: ReturnType<typeof vi.fn>;
  let withResponseMatchingRules: ReturnType<typeof vi.fn>;
  let interaction: ConsumerInteraction;
  let pact: ConsumerPact;
  let cleanupFn: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    withStatus = vi.fn();
    withResponseMatchingRules = vi.fn();
    interaction = {
      withStatus,
      withResponseMatchingRules,
    } as unknown as ConsumerInteraction;
    pact = {
      pactffiCreateMockServerForTransport: vi.fn().mockReturnValue(1234),
      mockServerMatchedSuccessfully: vi.fn().mockReturnValue(true),
      mockServerMismatches: vi.fn().mockReturnValue([]),
      cleanupMockServer: vi.fn().mockReturnValue(true),
      writePactFile: vi.fn(),
      cleanupPlugins: vi.fn(),
    } as unknown as ConsumerPact;
    cleanupFn = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('#willRespondWith', () => {
    it('calls withStatus with a plain number', () => {
      const req = new InteractionWithRequest(
        pact,
        interaction,
        { consumer: 'A', provider: 'B' },
        cleanupFn,
      );

      req.willRespondWith(200);

      expect(withStatus).toHaveBeenCalledOnce();
      expect(withStatus).toHaveBeenCalledWith(200);
      expect(withResponseMatchingRules).not.toHaveBeenCalled();
    });

    it('calls withStatus with the example value from a StatusCodeMatcher', () => {
      const req = new InteractionWithRequest(
        pact,
        interaction,
        { consumer: 'A', provider: 'B' },
        cleanupFn,
      );
      const matcher = matchStatus(200, HTTPResponseStatusClass.Success);

      req.willRespondWith(matcher);

      expect(withStatus).toHaveBeenCalledOnce();
      expect(withStatus).toHaveBeenCalledWith(200);
    });

    it('calls withResponseMatchingRules with status class matcher FFI format', () => {
      const req = new InteractionWithRequest(
        pact,
        interaction,
        { consumer: 'A', provider: 'B' },
        cleanupFn,
      );
      const matcher = matchStatus(200, HTTPResponseStatusClass.Success);

      req.willRespondWith(matcher);

      expect(withResponseMatchingRules).toHaveBeenCalledOnce();
      const rulesJson = JSON.parse(withResponseMatchingRules.mock.calls[0][0]);
      expect(rulesJson).toEqual({
        status: {
          $: {
            matchers: [{ match: 'statusCode', status: 'success' }],
          },
        },
      });
    });

    it('calls withResponseMatchingRules with specific status code matcher format', () => {
      const req = new InteractionWithRequest(
        pact,
        interaction,
        { consumer: 'A', provider: 'B' },
        cleanupFn,
      );
      const matcher = matchStatus(200, [200, 201]);

      req.willRespondWith(matcher);

      expect(withResponseMatchingRules).toHaveBeenCalledOnce();
      const rulesJson = JSON.parse(withResponseMatchingRules.mock.calls[0][0]);
      expect(rulesJson).toEqual({
        status: {
          $: {
            matchers: [{ match: 'statusCode', status: [200, 201] }],
          },
        },
      });
    });

    it('does not call withResponseMatchingRules for a plain number', () => {
      const req = new InteractionWithRequest(
        pact,
        interaction,
        { consumer: 'A', provider: 'B' },
        cleanupFn,
      );

      req.willRespondWith(201);

      expect(withResponseMatchingRules).not.toHaveBeenCalled();
    });
  });
});
