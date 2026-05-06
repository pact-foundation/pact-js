import type { ConsumerPact } from '@pact-foundation/pact-core';
import { vi } from 'vitest';
import { executeTest } from '.';
import type { PactV4Options } from './types';

describe('V4 HTTP executeTest', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const buildPactMock = (port: number): ConsumerPact => {
    return {
      pactffiCreateMockServerForTransport: vi.fn().mockReturnValue(port),
      mockServerMatchedSuccessfully: vi.fn().mockReturnValue(true),
      mockServerMismatches: vi.fn().mockReturnValue([]),
      cleanupMockServer: vi.fn().mockReturnValue(true),
      writePactFile: vi.fn(),
      cleanupPlugins: vi.fn(),
      addPlugin: vi.fn(),
    } as unknown as ConsumerPact;
  };

  const baseOpts: PactV4Options = { consumer: 'A', provider: 'B' };

  describe('CORS option', () => {
    it('passes corsPreflight: true by default when cors is not specified', async () => {
      const pactMock = buildPactMock(1234);

      await executeTest(
        pactMock,
        baseOpts,
        async () => Promise.resolve(),
        () => {},
      );

      // biome-ignore lint/suspicious/noExplicitAny: accessing vitest mock internals after ConsumerPact cast
      const stub = pactMock.pactffiCreateMockServerForTransport as any;
      expect(stub).toHaveBeenCalledOnce();
      const [, , config] = stub.mock.calls[0];
      expect(JSON.parse(config)).toEqual({ corsPreflight: true });
    });

    it('passes corsPreflight: true when cors is explicitly true', async () => {
      const pactMock = buildPactMock(1234);

      await executeTest(
        pactMock,
        { ...baseOpts, cors: true },
        async () => Promise.resolve(),
        () => {},
      );

      // biome-ignore lint/suspicious/noExplicitAny: accessing vitest mock internals after ConsumerPact cast
      const stub = pactMock.pactffiCreateMockServerForTransport as any;
      const [, , config] = stub.mock.calls[0];
      expect(JSON.parse(config)).toEqual({ corsPreflight: true });
    });

    it('passes corsPreflight: false when cors is explicitly false', async () => {
      const pactMock = buildPactMock(1234);

      await executeTest(
        pactMock,
        { ...baseOpts, cors: false },
        async () => Promise.resolve(),
        () => {},
      );

      // biome-ignore lint/suspicious/noExplicitAny: accessing vitest mock internals after ConsumerPact cast
      const stub = pactMock.pactffiCreateMockServerForTransport as any;
      const [, , config] = stub.mock.calls[0];
      expect(JSON.parse(config)).toEqual({ corsPreflight: false });
    });
  });

  describe('transport scheme', () => {
    it('uses http scheme by default', async () => {
      const pactMock = buildPactMock(1234);

      await executeTest(
        pactMock,
        baseOpts,
        async () => Promise.resolve(),
        () => {},
      );

      // biome-ignore lint/suspicious/noExplicitAny: accessing vitest mock internals after ConsumerPact cast
      const stub = pactMock.pactffiCreateMockServerForTransport as any;
      const [, transport] = stub.mock.calls[0];
      expect(transport).toBe('http');
    });

    it('uses https scheme when tls is true', async () => {
      const pactMock = buildPactMock(1234);

      await executeTest(
        pactMock,
        { ...baseOpts, tls: true },
        async () => Promise.resolve(),
        () => {},
      );

      // biome-ignore lint/suspicious/noExplicitAny: accessing vitest mock internals after ConsumerPact cast
      const stub = pactMock.pactffiCreateMockServerForTransport as any;
      const [, transport] = stub.mock.calls[0];
      expect(transport).toBe('https');
    });
  });

  describe('when the mock server fails to start', () => {
    it('throws an error when port is 0 or negative', async () => {
      const pactMock = buildPactMock(-3);

      await expect(
        executeTest(
          pactMock,
          baseOpts,
          async () => Promise.resolve(),
          () => {},
        ),
      ).rejects.toThrow('Failed to start mock server');
    });
  });
});
