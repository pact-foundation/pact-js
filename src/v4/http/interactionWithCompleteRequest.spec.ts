import type {
  ConsumerInteraction,
  ConsumerPact,
} from '@pact-foundation/pact-core';
import { vi } from 'vitest';
import { InteractionWithCompleteRequest } from './interactionWithCompleteRequest';
import { InteractionWithRequest } from './interactionWithRequest';
import { UnconfiguredInteraction } from './unconfiguredInteraction';
import { HTTPResponseStatusClass, matchStatus } from '../../v3/matchers';
import type { PactV4Options } from './types';

describe('InteractionWithCompleteRequest', () => {
  let withRequest: ReturnType<typeof vi.fn>;
  let withRequestHeader: ReturnType<typeof vi.fn>;
  let withRequestBody: ReturnType<typeof vi.fn>;
  let withQuery: ReturnType<typeof vi.fn>;
  let withStatus: ReturnType<typeof vi.fn>;
  let withResponseHeader: ReturnType<typeof vi.fn>;
  let withResponseBody: ReturnType<typeof vi.fn>;
  let withResponseMatchingRules: ReturnType<typeof vi.fn>;
  let interaction: ConsumerInteraction;
  let pact: ConsumerPact;
  let cleanupFn: ReturnType<typeof vi.fn>;
  const baseOpts: PactV4Options = { consumer: 'A', provider: 'B' };

  beforeEach(() => {
    withRequest = vi.fn();
    withRequestHeader = vi.fn();
    withRequestBody = vi.fn();
    withQuery = vi.fn();
    withStatus = vi.fn();
    withResponseHeader = vi.fn();
    withResponseBody = vi.fn();
    withResponseMatchingRules = vi.fn();
    interaction = {
      withRequest,
      withRequestHeader,
      withRequestBody,
      withQuery,
      withStatus,
      withResponseHeader,
      withResponseBody,
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

  describe('#withCompleteResponse', () => {
    it('sets status, headers, and body with default JSON content type', () => {
      const interactionComplete = new InteractionWithCompleteRequest(
        pact,
        interaction,
        baseOpts,
        cleanupFn,
      );

      interactionComplete.withCompleteResponse({
        status: 200,
        headers: { 'content-type': 'application/json', 'x-custom': 'val' },
        body: { hello: 'world' },
      });

      expect(withStatus).toHaveBeenCalledWith(200);
      expect(withResponseHeader).toHaveBeenCalledWith(
        'content-type',
        0,
        'application/json',
      );
      expect(withResponseHeader).toHaveBeenCalledWith('x-custom', 0, 'val');
      expect(withResponseBody).toHaveBeenCalledWith(
        JSON.stringify({ hello: 'world' }),
        'application/json',
      );
    });

    it('sets explicit contentType on body when specified', () => {
      const interactionComplete = new InteractionWithCompleteRequest(
        pact,
        interaction,
        baseOpts,
        cleanupFn,
      );

      interactionComplete.withCompleteResponse({
        status: 200,
        contentType: 'text/plain',
        body: 'plain text content',
      });

      expect(withStatus).toHaveBeenCalledWith(200);
      expect(withResponseBody).toHaveBeenCalledWith(
        'plain text content',
        'text/plain',
      );
    });

    it('handles status code matchers and matching rules', () => {
      const interactionComplete = new InteractionWithCompleteRequest(
        pact,
        interaction,
        baseOpts,
        cleanupFn,
      );
      const matcher = matchStatus(200, HTTPResponseStatusClass.Success);

      interactionComplete.withCompleteResponse({
        status: matcher,
      });

      expect(withStatus).toHaveBeenCalledWith(200);
      expect(withResponseMatchingRules).toHaveBeenCalledOnce();
    });
  });

  describe('#willRespondWith', () => {
    it('supports builder pattern response definition', () => {
      const interactionComplete = new InteractionWithCompleteRequest(
        pact,
        interaction,
        baseOpts,
        cleanupFn,
      );

      interactionComplete.willRespondWith(201, (builder) => {
        builder.jsonBody({ created: true });
      });

      expect(withStatus).toHaveBeenCalledWith(201);
      expect(withResponseBody).toHaveBeenCalledWith(
        JSON.stringify({ created: true }),
        'application/json',
      );
    });

    it('supports status code matchers and plain status without builder callback', () => {
      const interactionComplete = new InteractionWithCompleteRequest(
        pact,
        interaction,
        baseOpts,
        cleanupFn,
      );
      const matcher = matchStatus(200, HTTPResponseStatusClass.Success);

      interactionComplete.willRespondWith(matcher);

      expect(withStatus).toHaveBeenCalledWith(200);
      expect(withResponseMatchingRules).toHaveBeenCalledOnce();
    });
  });

  describe('UnconfiguredInteraction#withCompleteRequest', () => {
    it('configures request method, path, headers, query, and body', () => {
      const unconfigured = new UnconfiguredInteraction(
        pact,
        interaction,
        baseOpts,
        cleanupFn,
      );

      const completeReq = unconfigured.withCompleteRequest({
        method: 'POST',
        path: '/items',
        query: { filter: 'active' },
        headers: { 'x-client': 'test' },
        body: { item: 'sword' },
      });

      expect(completeReq).toBeInstanceOf(InteractionWithCompleteRequest);
      expect(withRequest).toHaveBeenCalledWith('POST', '/items');
      expect(withRequestHeader).toHaveBeenCalledWith('x-client', 0, 'test');
      expect(withQuery).toHaveBeenCalledWith('filter', 0, 'active');
      expect(withRequestBody).toHaveBeenCalledWith(
        JSON.stringify({ item: 'sword' }),
        'application/json',
      );
    });

    it('configures request without body when omitted', () => {
      const unconfigured = new UnconfiguredInteraction(
        pact,
        interaction,
        baseOpts,
        cleanupFn,
      );

      unconfigured.withCompleteRequest({
        method: 'GET',
        path: '/items',
      });

      expect(withRequest).toHaveBeenCalledWith('GET', '/items');
      expect(withRequestBody).not.toHaveBeenCalled();
    });
  });

  describe('InteractionWithRequest#withCompleteResponse', () => {
    it('allows chaining withCompleteResponse after withRequest', () => {
      const req = new InteractionWithRequest(
        pact,
        interaction,
        baseOpts,
        cleanupFn,
      );

      req.withCompleteResponse({
        status: 204,
      });

      expect(withStatus).toHaveBeenCalledWith(204);
      expect(withResponseBody).not.toHaveBeenCalled();
    });

    it('handles response body with custom content type', () => {
      const req = new InteractionWithRequest(
        pact,
        interaction,
        baseOpts,
        cleanupFn,
      );

      req.withCompleteResponse({
        status: 200,
        contentType: 'application/xml',
        body: '<xml></xml>',
      });

      expect(withStatus).toHaveBeenCalledWith(200);
      expect(withResponseBody).toHaveBeenCalledWith(
        '<xml></xml>',
        'application/xml',
      );
    });
  });
});
