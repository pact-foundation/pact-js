import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { vi } from 'vitest';
import { ProviderVerificationError, parseVerificationResult } from './result';
import {
  defineVerificationSuite,
  defineVerificationSuiteAsync,
  defineVerificationSuiteFromResult,
  type VerificationSuiteAdapter,
  verifyForSuite,
} from './suite';
import { Verifier } from './verifier';

const fixture = (name: string) =>
  parseVerificationResult(
    readFileSync(
      path.resolve(__dirname, '__fixtures__', `${name}.json`),
      'utf8',
    ),
  );

const pactDir = path.resolve(__dirname, '__fixtures__', 'pact-files');

const tmpDirs: string[] = [];
afterAll(() => {
  for (const dir of tmpDirs) {
    rmSync(dir, { recursive: true, force: true });
  }
});

/** Records describe/it registrations and lets the test run the cases. */
type Case = {
  suite: string;
  name: string;
  fn: () => Promise<void>;
  timeout?: number;
};

function recordingAdapter(): VerificationSuiteAdapter & { cases: Case[] } {
  const cases: Case[] = [];
  let current = '';
  return {
    cases,
    describe: (name, fn) => {
      current = name;
      fn();
    },
    it: (name, fn, timeout) => {
      cases.push({ suite: current, name, fn, timeout });
    },
  };
}

/** Runs every recorded case and returns its outcome. */
const runAll = (cases: Case[]) =>
  Promise.all(
    cases.map(async (c) => {
      try {
        await c.fn();
        return { case: `${c.suite} / ${c.name}`, status: 'passed' as const };
      } catch (e) {
        return {
          case: `${c.suite} / ${c.name}`,
          status: 'failed' as const,
          message: (e as Error).message,
        };
      }
    }),
  );

// The pact files that produced the verification fixtures.
const demoPactFiles = [
  path.join(pactDir, 'DemoConsumer-DemoProvider.json'),
  path.join(pactDir, 'OtherConsumer-DemoProvider.json'),
];

const options = {
  provider: 'DemoProvider',
  providerBaseUrl: 'http://localhost:1234',
  pactUrls: demoPactFiles,
};

describe('defineVerificationSuite', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('registers one describe per pact and one it per interaction', () => {
    const adapter = recordingAdapter();

    defineVerificationSuite(options, adapter);

    expect(adapter.cases.map((c) => `${c.suite} / ${c.name}`)).toEqual([
      'DemoConsumer -> DemoProvider / interaction 1 - GET /one',
      'DemoConsumer -> DemoProvider / interaction 2 - GET /two',
      'DemoConsumer -> DemoProvider / interaction 3 - GET /three',
      'OtherConsumer -> DemoProvider / a request for one',
      'OtherConsumer -> DemoProvider / a request for two',
    ]);
    expect(adapter.cases.every((c) => c.timeout === 30_000)).toBe(true);
  });

  it('runs the verification once and passes every case of a successful run', async () => {
    const verify = vi
      .spyOn(Verifier.prototype, 'verify')
      .mockResolvedValue(fixture('verification-success.extended'));
    const adapter = recordingAdapter();
    defineVerificationSuite(options, adapter);

    const outcomes = await runAll(adapter.cases);

    expect(verify).toHaveBeenCalledTimes(1);
    expect(outcomes.every((o) => o.status === 'passed')).toBe(true);
  });

  it('fails exactly the cases whose interaction failed, with the mismatches in the message', async () => {
    vi.spyOn(Verifier.prototype, 'verify').mockRejectedValue(
      new ProviderVerificationError(fixture('verification-failure.extended')),
    );
    const adapter = recordingAdapter();
    defineVerificationSuite(options, adapter);

    const outcomes = await runAll(adapter.cases);

    expect(outcomes.map((o) => o.status)).toEqual([
      'passed',
      'failed',
      'failed',
      'passed',
      'failed',
    ]);
    expect(outcomes[1].message).toContain(
      "Verification of 'DemoConsumer -> DemoProvider: interaction 2 - GET /two' failed",
    );
    expect(outcomes[1].message).toContain(
      'StatusMismatch: expected 200 but was 500',
    );
    expect(outcomes[2].message).toContain('BodyMismatch at $.ok');
  });

  it('matches results by description when the core does not report the pact', async () => {
    vi.spyOn(Verifier.prototype, 'verify').mockRejectedValue(
      new ProviderVerificationError(fixture('verification-failure')),
    );
    const adapter = recordingAdapter();
    defineVerificationSuite(options, adapter);

    const outcomes = await runAll(adapter.cases);

    expect(outcomes.map((o) => o.status)).toEqual([
      'passed',
      'failed',
      'failed',
      'passed',
      'failed',
    ]);
  });

  it('rethrows errors of a verification that could not run', async () => {
    vi.spyOn(Verifier.prototype, 'verify').mockRejectedValue(
      new Error('Provider verification hooks failed'),
    );
    const adapter = recordingAdapter();
    defineVerificationSuite(options, adapter);

    const outcomes = await runAll(adapter.cases);

    expect(outcomes.every((o) => o.status === 'failed')).toBe(true);
    expect(outcomes[0].message).toBe('Provider verification hooks failed');
  });

  it('reports missing results, e.g. for filtered interactions', async () => {
    const partial = fixture('verification-success.extended');
    partial.interactions = partial.interactions.slice(0, 1);
    vi.spyOn(Verifier.prototype, 'verify').mockResolvedValue(partial);
    const adapter = recordingAdapter();
    defineVerificationSuite(options, adapter);

    const outcomes = await runAll(adapter.cases);

    expect(outcomes[0].status).toBe('passed');
    expect(outcomes[1].status).toBe('failed');
    expect(outcomes[1].message).toMatch(/No verification result for/);
  });

  it('does not fail pending interactions', async () => {
    const result = fixture('verification-failure.extended');
    for (const i of result.interactions) {
      i.pending = true;
    }
    vi.spyOn(Verifier.prototype, 'verify').mockResolvedValue(result);
    const adapter = recordingAdapter();
    defineVerificationSuite(options, adapter);

    const outcomes = await runAll(adapter.cases);

    expect(outcomes.every((o) => o.status === 'passed')).toBe(true);
  });

  it('numbers duplicate descriptions and matches them by key or position', async () => {
    const adapter = recordingAdapter();
    const result = parseVerificationResult({
      result: true,
      notices: [],
      output: [],
      errors: [],
      pendingErrors: [],
      interactionResults: [
        {
          consumer: 'V4Consumer',
          provider: 'Provider',
          description: 'a request with two states',
          providerStates: ['state one', 'state two'],
          pending: false,
          result: 'OK',
          duration: '1ms',
          interactionKey: 'abc123',
        },
        {
          consumer: 'V4Consumer',
          provider: 'Provider',
          description: 'a pending request',
          providerStates: [],
          pending: true,
          result: 'OK',
          duration: '1ms',
        },
        {
          consumer: 'V4Consumer',
          provider: 'Provider',
          description: 'a pending request',
          providerStates: [],
          pending: false,
          result: 'Error',
          duration: '1ms',
          mismatch: { type: 'error', message: 'boom', interactionId: '' },
        },
      ],
    });
    vi.spyOn(Verifier.prototype, 'verify').mockResolvedValue(result);

    defineVerificationSuite(
      {
        ...options,
        pactFiles: [path.join(pactDir, 'v4-consumer-provider.json')],
        pactName: (p) => `Pact ${p.consumer}`,
        interactionName: (i) => `verifies ${i.description}`,
      },
      adapter,
    );
    const outcomes = await runAll(adapter.cases);

    expect(adapter.cases.map((c) => `${c.suite} / ${c.name}`)).toEqual([
      'Pact V4Consumer / verifies a request with two states',
      'Pact V4Consumer / verifies a pending request',
      'Pact V4Consumer / verifies a pending request (2)',
    ]);
    expect(outcomes.map((o) => o.status)).toEqual([
      'passed',
      'passed',
      'failed',
    ]);
  });

  it('reads the verifier options when the verification starts', async () => {
    const verify = vi
      .spyOn(Verifier.prototype, 'verify')
      .mockResolvedValue(fixture('verification-success.extended'));
    const adapter = recordingAdapter();
    let baseUrl = '';
    defineVerificationSuite(
      {
        ...options,
        get providerBaseUrl() {
          return baseUrl;
        },
      },
      adapter,
    );
    baseUrl = 'http://localhost:4321'; // e.g. set in a beforeAll hook

    const outcomes = await runAll(adapter.cases);

    expect(outcomes.every((o) => o.status === 'passed')).toBe(true);
    expect(verify).toHaveBeenCalledTimes(1);
    expect(verify.mock.instances[0]).toHaveProperty(
      'config.providerBaseUrl',
      'http://localhost:4321',
    );
  });

  it('refuses to register nothing when no pact file is found', () => {
    const empty = mkdtempSync(path.join(tmpdir(), 'pact-js-suite-'));
    tmpDirs.push(empty);

    expect(() =>
      defineVerificationSuite(
        { ...options, pactUrls: [empty] },
        recordingAdapter(),
      ),
    ).toThrow(/No pact files found/);
  });

  it('refuses to register nothing when the pact files have no interactions', () => {
    const dir = mkdtempSync(path.join(tmpdir(), 'pact-js-suite-'));
    tmpDirs.push(dir);
    writeFileSync(
      path.join(dir, 'empty-pact.json'),
      JSON.stringify({ consumer: { name: 'C' }, provider: { name: 'P' } }),
    );

    expect(() =>
      defineVerificationSuite(
        { ...options, pactUrls: [dir] },
        recordingAdapter(),
      ),
    ).toThrow(/contain no interactions/);
  });

  it('registers a test case for the messages of a message pact', async () => {
    const result = parseVerificationResult({
      result: true,
      notices: [],
      output: [],
      errors: [],
      pendingErrors: [],
      interactionResults: [
        {
          consumer: 'MessageConsumer',
          provider: 'Provider',
          description: 'an order created event',
          providerStates: ['an order exists'],
          pending: false,
          result: 'OK',
          duration: '1ms',
        },
      ],
    });
    vi.spyOn(Verifier.prototype, 'verify').mockResolvedValue(result);
    const adapter = recordingAdapter();

    defineVerificationSuite(
      {
        ...options,
        pactFiles: [path.join(pactDir, 'message-consumer-provider.json')],
      },
      adapter,
    );
    const outcomes = await runAll(adapter.cases);

    expect(adapter.cases.map((c) => `${c.suite} / ${c.name}`)).toEqual([
      'MessageConsumer -> Provider / an order created event',
    ]);
    expect(outcomes[0].status).toBe('passed');
  });

  it('says so when the core reported a failure without details', async () => {
    const result = fixture('verification-success.extended');
    result.interactions[1].success = false;
    result.interactions[1].failure = undefined;
    vi.spyOn(Verifier.prototype, 'verify').mockResolvedValue(result);
    const adapter = recordingAdapter();
    defineVerificationSuite(options, adapter);

    const outcomes = await runAll(adapter.cases);

    expect(outcomes[1].status).toBe('failed');
    expect(outcomes[1].message).toContain('no failure details');
  });

  it('falls back to the verification order when the reported pact does not match the file', async () => {
    // e.g. after the consumer was renamed: the descriptions still match, the
    // consumer/provider names no longer do.
    const result = parseVerificationResult({
      result: true,
      notices: [],
      output: [],
      errors: [],
      pendingErrors: [],
      interactionResults: [
        'interaction 1 - GET /one',
        'interaction 2 - GET /two',
        'interaction 3 - GET /three',
      ].map((description) => ({
        consumer: 'RenamedConsumer',
        provider: 'DemoProvider',
        description,
        providerStates: [],
        pending: false,
        result: 'OK',
        duration: '1ms',
      })),
    });
    vi.spyOn(Verifier.prototype, 'verify').mockResolvedValue(result);
    const adapter = recordingAdapter();

    defineVerificationSuite(
      {
        ...options,
        pactFiles: [path.join(pactDir, 'DemoConsumer-DemoProvider.json')],
      },
      adapter,
    );
    const outcomes = await runAll(adapter.cases);

    expect(outcomes.map((o) => o.status)).toEqual([
      'passed',
      'passed',
      'passed',
    ]);
  });

  it('requires local pact sources', () => {
    expect(() =>
      defineVerificationSuite(
        { providerBaseUrl: 'http://localhost:1234' },
        recordingAdapter(),
      ),
    ).toThrow(/pactFiles.*pactUrls/);
    expect(() =>
      defineVerificationSuite(
        {
          providerBaseUrl: 'http://localhost:1234',
          pactBrokerUrl: 'http://broker',
          pactUrls: ['http://broker/pacts/provider/p/consumer/c/latest'],
        },
        recordingAdapter(),
      ),
    ).toThrow(/only local pact files/);
  });
});

describe('defineVerificationSuiteFromResult', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('registers one describe per pact and one it per interaction from the result alone', () => {
    const adapter = recordingAdapter();

    defineVerificationSuiteFromResult(
      fixture('verification-success.extended'),
      adapter,
    );

    expect(adapter.cases.map((c) => `${c.suite} / ${c.name}`)).toEqual([
      'DemoConsumer -> DemoProvider / interaction 1 - GET /one',
      'DemoConsumer -> DemoProvider / interaction 2 - GET /two',
      'DemoConsumer -> DemoProvider / interaction 3 - GET /three',
      'OtherConsumer -> DemoProvider / a request for one',
      'OtherConsumer -> DemoProvider / a request for two',
    ]);
  });

  it('fails exactly the cases whose interaction failed', async () => {
    const adapter = recordingAdapter();
    defineVerificationSuiteFromResult(
      fixture('verification-failure.extended'),
      adapter,
    );

    const outcomes = await runAll(adapter.cases);

    expect(outcomes.map((o) => o.status)).toEqual([
      'passed',
      'failed',
      'failed',
      'passed',
      'failed',
    ]);
    expect(outcomes[1].message).toContain(
      'StatusMismatch: expected 200 but was 500',
    );
  });

  it('groups interactions whose pact the core did not report', () => {
    const adapter = recordingAdapter();

    defineVerificationSuiteFromResult(fixture('verification-success'), adapter);

    expect(adapter.cases).toHaveLength(5);
    expect(new Set(adapter.cases.map((c) => c.suite))).toEqual(
      new Set(['verified interactions']),
    );
  });

  it('numbers duplicate descriptions within a pact', () => {
    const adapter = recordingAdapter();
    const result = parseVerificationResult({
      result: true,
      notices: [],
      output: [],
      errors: [],
      pendingErrors: [],
      interactionResults: ['same', 'same'].map((description) => ({
        consumer: 'C',
        provider: 'P',
        description,
        providerStates: [],
        pending: false,
        result: 'OK',
        duration: '1ms',
      })),
    });

    defineVerificationSuiteFromResult(result, adapter);

    expect(adapter.cases.map((c) => c.name)).toEqual(['same', 'same (2)']);
  });

  it('applies custom names', () => {
    const adapter = recordingAdapter();

    defineVerificationSuiteFromResult(
      fixture('verification-success.extended'),
      adapter,
      {
        pactName: (pact) => `Pact ${pact.consumer}`,
        interactionName: (interaction) => `verifies ${interaction.description}`,
      },
    );

    expect(adapter.cases[0]).toMatchObject({
      suite: 'Pact DemoConsumer',
      name: 'verifies interaction 1 - GET /one',
    });
  });

  it('does not fail pending interactions', async () => {
    const result = fixture('verification-failure.extended');
    for (const interaction of result.interactions) {
      interaction.pending = true;
    }
    const adapter = recordingAdapter();
    defineVerificationSuiteFromResult(result, adapter);

    const outcomes = await runAll(adapter.cases);

    expect(outcomes.every((o) => o.status === 'passed')).toBe(true);
  });

  it('refuses to register nothing for an empty result', () => {
    const empty = parseVerificationResult({
      result: true,
      notices: [],
      output: [],
      errors: [],
      pendingErrors: [],
      interactionResults: [],
    });

    expect(() =>
      defineVerificationSuiteFromResult(empty, recordingAdapter()),
    ).toThrow(/contains no interaction/);
  });
});

describe('verifyForSuite', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns the result of a failed verification instead of throwing', async () => {
    const failed = fixture('verification-failure.extended');
    vi.spyOn(Verifier.prototype, 'verify').mockRejectedValue(
      new ProviderVerificationError(failed),
    );

    const result = await verifyForSuite(options);

    expect(result.success).toBe(false);
    expect(result.interactions).toHaveLength(5);
  });

  it('rethrows errors that prevented the verification from running', async () => {
    vi.spyOn(Verifier.prototype, 'verify').mockRejectedValue(
      new Error('Provider verification hooks failed'),
    );

    await expect(verifyForSuite(options)).rejects.toThrow(
      'Provider verification hooks failed',
    );
  });
});

describe('defineVerificationSuiteAsync', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('verifies from the configured source and registers the reported pacts', async () => {
    const verify = vi
      .spyOn(Verifier.prototype, 'verify')
      .mockResolvedValue(fixture('verification-success.extended'));
    const adapter = recordingAdapter();

    // No pact files anywhere: a broker run is configured the same way.
    await defineVerificationSuiteAsync(
      {
        provider: 'DemoProvider',
        providerBaseUrl: 'http://localhost:1234',
        pactBrokerUrl: 'http://broker.example.com',
        consumerVersionSelectors: [{ mainBranch: true }],
        publishVerificationResult: true,
        providerVersion: '1.0.0',
      },
      adapter,
    );
    const outcomes = await runAll(adapter.cases);

    expect(verify).toHaveBeenCalledTimes(1);
    expect(adapter.cases.map((c) => `${c.suite} / ${c.name}`)).toEqual([
      'DemoConsumer -> DemoProvider / interaction 1 - GET /one',
      'DemoConsumer -> DemoProvider / interaction 2 - GET /two',
      'DemoConsumer -> DemoProvider / interaction 3 - GET /three',
      'OtherConsumer -> DemoProvider / a request for one',
      'OtherConsumer -> DemoProvider / a request for two',
    ]);
    expect(outcomes.every((o) => o.status === 'passed')).toBe(true);
  });

  it('passes the broker options through to the verifier', async () => {
    const verify = vi
      .spyOn(Verifier.prototype, 'verify')
      .mockResolvedValue(fixture('verification-success.extended'));

    await defineVerificationSuiteAsync(
      {
        provider: 'DemoProvider',
        providerBaseUrl: 'http://localhost:1234',
        pactBrokerUrl: 'http://broker.example.com',
        pactBrokerToken: 'secret',
        pactName: (pact) => `Pact ${pact.consumer}`,
      },
      recordingAdapter(),
    );

    expect(verify.mock.instances[0]).toMatchObject({
      config: {
        pactBrokerUrl: 'http://broker.example.com',
        pactBrokerToken: 'secret',
      },
    });
    // the naming callback must not reach the verifier
    expect(verify.mock.instances[0]).not.toHaveProperty('config.pactName');
  });
});
