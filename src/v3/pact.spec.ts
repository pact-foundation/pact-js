import type { ConsumerPact } from '@pact-foundation/pact-core';
import { vi } from 'vitest';
import { PactV3 } from './pact';

describe('PactV3', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('#executeTest', () => {
    const buildPactMock = (port: number): ConsumerPact => {
      return {
        addMetadata: vi.fn().mockReturnValue(true),
        newInteraction: vi.fn(),
        pactffiCreateMockServerForTransport: vi.fn().mockReturnValue(port),
        mockServerMatchedSuccessfully: vi.fn().mockReturnValue(true),
        mockServerMismatches: vi.fn().mockReturnValue([]),
        cleanupMockServer: vi.fn().mockReturnValue(true),
        writePactFile: vi.fn(),
        cleanupPlugins: vi.fn(),
        addPlugin: vi.fn(),
      } as unknown as ConsumerPact;
    };

    describe('CORS option', () => {
      it('passes corsPreflight: true by default when cors is not specified', async () => {
        const pactMock = buildPactMock(1234);
        const p = new PactV3({ consumer: 'A', provider: 'B' });
        // @ts-expect-error: accessing private field for testing
        p.pact = pactMock;

        await p.executeTest(async () => Promise.resolve());

        // biome-ignore lint/suspicious/noExplicitAny: accessing vitest mock internals after ConsumerPact cast
        const stub = pactMock.pactffiCreateMockServerForTransport as any;
        expect(stub).toHaveBeenCalledOnce();
        const [, , config] = stub.mock.calls[0];
        expect(JSON.parse(config)).toEqual({ corsPreflight: true });
      });

      it('passes corsPreflight: true when cors is explicitly true', async () => {
        const pactMock = buildPactMock(1234);
        const p = new PactV3({ consumer: 'A', provider: 'B', cors: true });
        // @ts-expect-error: accessing private field for testing
        p.pact = pactMock;

        await p.executeTest(async () => Promise.resolve());

        // biome-ignore lint/suspicious/noExplicitAny: accessing vitest mock internals after ConsumerPact cast
        const stub = pactMock.pactffiCreateMockServerForTransport as any;
        const [, , config] = stub.mock.calls[0];
        expect(JSON.parse(config)).toEqual({ corsPreflight: true });
      });

      it('passes corsPreflight: false when cors is explicitly false', async () => {
        const pactMock = buildPactMock(1234);
        const p = new PactV3({ consumer: 'A', provider: 'B', cors: false });
        // @ts-expect-error: accessing private field for testing
        p.pact = pactMock;

        await p.executeTest(async () => Promise.resolve());

        // biome-ignore lint/suspicious/noExplicitAny: accessing vitest mock internals after ConsumerPact cast
        const stub = pactMock.pactffiCreateMockServerForTransport as any;
        const [, , config] = stub.mock.calls[0];
        expect(JSON.parse(config)).toEqual({ corsPreflight: false });
      });
    });

    describe('transport scheme', () => {
      it('uses http scheme by default', async () => {
        const pactMock = buildPactMock(1234);
        const p = new PactV3({ consumer: 'A', provider: 'B' });
        // @ts-expect-error: accessing private field for testing
        p.pact = pactMock;

        await p.executeTest(async () => Promise.resolve());

        // biome-ignore lint/suspicious/noExplicitAny: accessing vitest mock internals after ConsumerPact cast
        const stub = pactMock.pactffiCreateMockServerForTransport as any;
        const [, transport] = stub.mock.calls[0];
        expect(transport).toBe('http');
      });

      it('uses https scheme when tls is true', async () => {
        const pactMock = buildPactMock(1234);
        const p = new PactV3({ consumer: 'A', provider: 'B', tls: true });
        // @ts-expect-error: accessing private field for testing
        p.pact = pactMock;

        await p.executeTest(async () => Promise.resolve());

        // biome-ignore lint/suspicious/noExplicitAny: accessing vitest mock internals after ConsumerPact cast
        const stub = pactMock.pactffiCreateMockServerForTransport as any;
        const [, transport] = stub.mock.calls[0];
        expect(transport).toBe('https');
      });
    });

    describe('when the mock server fails to start', () => {
      it('throws an error when port is 0 or negative', async () => {
        const pactMock = buildPactMock(-3);
        const p = new PactV3({ consumer: 'A', provider: 'B' });
        // @ts-expect-error: accessing private field for testing
        p.pact = pactMock;

        await expect(
          p.executeTest(async () => Promise.resolve()),
        ).rejects.toThrow('Failed to start mock server');
      });
    });
  });
});
