import path from 'node:path';
import {
  type LogLevel,
  Matchers,
  Pact,
  SpecificationVersion,
} from '@pact-foundation/pact';
import { describe, expect, it } from 'vitest';
import { DemoClient } from './consumer';

const { like } = Matchers;

const logLevel = (process.env.LOG_LEVEL as LogLevel) ?? 'warn';
const pactDir = path.resolve(process.cwd(), 'pacts');

/**
 * Two consumers of the same provider. Each consumer test writes its own pact
 * file, so the provider verification has to deal with multiple pacts:
 *
 *   DemoConsumer  -> DemoProvider  (3 interactions, one with a provider state)
 *   OtherConsumer -> DemoProvider  (2 interactions)
 *
 * The interactions mirror the reference project
 * (frudisch/pact-beforeeach-desync-repro): GET /one, /two and /three.
 */
describe('DemoConsumer', () => {
  const pact = new Pact({
    consumer: 'DemoConsumer',
    provider: 'DemoProvider',
    spec: SpecificationVersion.SPECIFICATION_VERSION_V4,
    dir: pactDir,
    logLevel,
  });

  it('interaction 1 - GET /one', async () => {
    await pact
      .addInteraction()
      .uponReceiving('interaction 1 - GET /one')
      .withRequest('GET', '/one', (builder) => {
        builder.headers({ Accept: 'application/json' });
      })
      .willRespondWith(200, (builder) => {
        builder.headers({ 'Content-Type': 'application/json' });
        builder.jsonBody({ ok: like(true) });
      })
      .executeTest(async (mockserver) => {
        const result = await new DemoClient(mockserver.url).one();
        expect(result.ok).toBe(true);
      });
  });

  it('interaction 2 - GET /two', async () => {
    await pact
      .addInteraction()
      .uponReceiving('interaction 2 - GET /two')
      .withRequest('GET', '/two', (builder) => {
        builder.headers({ Accept: 'application/json' });
      })
      .willRespondWith(200, (builder) => {
        builder.headers({ 'Content-Type': 'application/json' });
        builder.jsonBody({ ok: like(true) });
      })
      .executeTest(async (mockserver) => {
        const result = await new DemoClient(mockserver.url).two();
        expect(result.ok).toBe(true);
      });
  });

  it('interaction 3 - GET /three', async () => {
    await pact
      .addInteraction()
      .given('resource three is available')
      .uponReceiving('interaction 3 - GET /three')
      .withRequest('GET', '/three', (builder) => {
        builder.headers({ Accept: 'application/json' });
      })
      .willRespondWith(200, (builder) => {
        builder.headers({ 'Content-Type': 'application/json' });
        builder.jsonBody({ ok: like(true) });
      })
      .executeTest(async (mockserver) => {
        const result = await new DemoClient(mockserver.url).three();
        expect(result.ok).toBe(true);
      });
  });
});

describe('OtherConsumer', () => {
  const pact = new Pact({
    consumer: 'OtherConsumer',
    provider: 'DemoProvider',
    spec: SpecificationVersion.SPECIFICATION_VERSION_V4,
    dir: pactDir,
    logLevel,
  });

  it('a request for one', async () => {
    await pact
      .addInteraction()
      .uponReceiving('a request for one')
      .withRequest('GET', '/one', (builder) => {
        builder.headers({ Accept: 'application/json' });
      })
      .willRespondWith(200, (builder) => {
        builder.headers({ 'Content-Type': 'application/json' });
        builder.jsonBody({ ok: like(true) });
      })
      .executeTest(async (mockserver) => {
        const result = await new DemoClient(mockserver.url).one();
        expect(result.ok).toBe(true);
      });
  });

  it('a request for two', async () => {
    await pact
      .addInteraction()
      .uponReceiving('a request for two')
      .withRequest('GET', '/two', (builder) => {
        builder.headers({ Accept: 'application/json' });
      })
      .willRespondWith(200, (builder) => {
        builder.headers({ 'Content-Type': 'application/json' });
        builder.jsonBody({ ok: like(true) });
      })
      .executeTest(async (mockserver) => {
        const result = await new DemoClient(mockserver.url).two();
        expect(result.ok).toBe(true);
      });
  });
});
