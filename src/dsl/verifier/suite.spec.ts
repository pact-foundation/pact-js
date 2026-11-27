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

/** A pact file with the given interactions, written to a fresh directory. */
const writePact = (
  dir: string,
  name: string,
  consumer: string,
  provider: string,
  interactions: Record<string, unknown>[],
): string => {
  const file = path.join(dir, name);
  writeFileSync(
    file,
    JSON.stringify({
      consumer: { name: consumer },
      provider: { name: provider },
      interactions,
    }),
  );
  return file;
};

/** A parsed result built from interaction entries in the core's JSON shape. */
const resultOf = (
  interactionResults: Record<string, unknown>[],
  extra: Record<string, unknown> = {},
) =>
  parseVerificationResult({
    result: true,
    notices: [],
    output: [],
    errors: [],
    pendingErrors: [],
    interactionResults,
    ...extra,
  });

import { Verifier } from './verifier';

const fixture = (name: string) =>
  parseVerificationResult(
    readFileSync(
      path.resolve(__dirname, '__fixtures__', `${name}.json`),
      'utf8',
    ),
  );

const pactDir = path.resolve(__dirname, '__fixtures__', 'pact-files');

/** The interaction entries of a fixture, in the core's JSON shape. */
const rawInteractions = (name: string): Record<string, unknown>[] =>
  (fixture(name).raw as { interactionResults: Record<string, unknown>[] })
    .interactionResults;

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
      'Provider verification / reports no failures outside the listed interactions',
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
      'passed',
    ]);
    expect(outcomes[1].message).toContain(
      "Verification of 'DemoConsumer -> DemoProvider: interaction 2 - GET /two' failed",
    );
    expect(outcomes[1].message).toContain(
      'StatusMismatch: expected 200 but was 500',
    );
    expect(outcomes[2].message).toContain('BodyMismatch at $.ok');
  });

  it('needs the pact of every result; results without one (cores < 20.2.0) match nothing', async () => {
    vi.spyOn(Verifier.prototype, 'verify').mockRejectedValue(
      new ProviderVerificationError(fixture('verification-failure')),
    );
    const adapter = recordingAdapter();
    defineVerificationSuite(options, adapter);

    const outcomes = await runAll(adapter.cases);

    // failures carry their pact (recovered from the errors list) and fail
    // with their mismatches; the passing results carry none, so their cases
    // report a missing result and the run check lists them
    expect(outcomes.every((o) => o.status === 'failed')).toBe(true);
    expect(outcomes[0].message).toMatch(/No verification result for/);
    expect(outcomes[1].message).toContain('StatusMismatch');
    expect(outcomes[5].message).toContain(
      "'interaction 1 - GET /one' was verified but has no test case",
    );
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
    result.success = true; // pending failures do not fail the run
    vi.spyOn(Verifier.prototype, 'verify').mockResolvedValue(result);
    const adapter = recordingAdapter();
    defineVerificationSuite(options, adapter);

    const outcomes = await runAll(adapter.cases);

    expect(outcomes.every((o) => o.status === 'passed')).toBe(true);
  });

  it('numbers duplicate descriptions and matches them by key or order', async () => {
    const adapter = recordingAdapter();
    const result = resultOf([
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
    ]);
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
      'Provider verification / reports no failures outside the listed interactions',
    ]);
    expect(outcomes.map((o) => o.status)).toEqual([
      'passed',
      'passed',
      'failed',
      'passed',
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
    ).toThrow(/No pact files .*found/);
  });

  it('refuses to register nothing when the pact files have no interactions', () => {
    const dir = mkdtempSync(path.join(tmpdir(), 'pact-js-suite-'));
    tmpDirs.push(dir);
    writeFileSync(
      path.join(dir, 'empty-pact.json'),
      JSON.stringify({
        consumer: { name: 'C' },
        provider: { name: 'DemoProvider' },
      }),
    );

    expect(() =>
      defineVerificationSuite(
        { ...options, pactUrls: [dir] },
        recordingAdapter(),
      ),
    ).toThrow(/contain no interactions/);
  });

  it('registers a test case for the messages of a message pact', async () => {
    const result = resultOf([
      {
        consumer: 'MessageConsumer',
        provider: 'Provider',
        description: 'an order created event',
        providerStates: ['an order exists'],
        pending: false,
        result: 'OK',
        duration: '1ms',
      },
    ]);
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
      'Provider verification / reports no failures outside the listed interactions',
    ]);
    expect(outcomes.map((o) => o.status)).toEqual(['passed', 'passed']);
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

  it('does not borrow the results of another pact, even when the descriptions match', async () => {
    // e.g. the core reports a consumer under a different name than the file
    const result = resultOf(
      [
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
    );
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
      'failed',
      'failed',
      'failed',
      'failed',
    ]);
    expect(outcomes[0].message).toMatch(/No verification result for/);
    expect(outcomes[3].message).toContain(
      "'RenamedConsumer -> DemoProvider: interaction 1 - GET /one' was verified but has no test case",
    );
  });

  it('does not take the result of another interaction when its own is missing', async () => {
    // Only `two` was verified (e.g. PACT_DESCRIPTION filter): the test case
    // of `one` must not pick up the successful result at position 0.
    const dir = mkdtempSync(path.join(tmpdir(), 'pact-js-suite-'));
    tmpDirs.push(dir);
    const file = writePact(dir, 'c-p.json', 'C', 'P', [
      { description: 'one' },
      { description: 'two' },
    ]);
    vi.spyOn(Verifier.prototype, 'verify').mockResolvedValue(
      resultOf([
        {
          consumer: 'C',
          provider: 'P',
          description: 'two',
          providerStates: [],
          pending: false,
          result: 'OK',
          duration: '1ms',
        },
      ]),
    );
    const adapter = recordingAdapter();

    defineVerificationSuite(
      {
        provider: 'P',
        providerBaseUrl: 'http://localhost:1',
        pactFiles: [file],
      },
      adapter,
    );
    const outcomes = await runAll(adapter.cases);

    expect(outcomes.map((o) => `${o.case}: ${o.status}`)).toEqual([
      'C -> P / one: failed',
      'C -> P / two: passed',
      'Provider verification / reports no failures outside the listed interactions: passed',
    ]);
  });

  it('assigns duplicate descriptions one-to-one, in verification order', async () => {
    const dir = mkdtempSync(path.join(tmpdir(), 'pact-js-suite-'));
    tmpDirs.push(dir);
    const file = writePact(dir, 'c-p.json', 'C', 'P', [
      { description: 'same' },
      { description: 'same' },
    ]);
    const entry = (result: string) => ({
      consumer: 'C',
      provider: 'P',
      description: 'same',
      providerStates: [],
      pending: false,
      result,
      duration: '1ms',
      ...(result === 'OK'
        ? {}
        : { mismatch: { type: 'error', message: 'boom', interactionId: '' } }),
    });
    vi.spyOn(Verifier.prototype, 'verify').mockResolvedValue(
      resultOf([entry('OK'), entry('Error')], { result: false }),
    );
    const adapter = recordingAdapter();

    defineVerificationSuite(
      {
        provider: 'P',
        providerBaseUrl: 'http://localhost:1',
        pactFiles: [file],
      },
      adapter,
    );
    const outcomes = await runAll(adapter.cases);

    // neither result is used twice
    expect(outcomes.map((o) => `${o.case}: ${o.status}`)).toEqual([
      'C -> P / same: passed',
      'C -> P / same (2): failed',
      'Provider verification / reports no failures outside the listed interactions: passed',
    ]);
  });

  it('matches V4 keys within the pact only', async () => {
    // Two consumers may well hold an interaction with the same key (the key
    // is a hash of the interaction). The passing one must not hide the other.
    const dir = mkdtempSync(path.join(tmpdir(), 'pact-js-suite-'));
    tmpDirs.push(dir);
    writePact(dir, 'a-p.json', 'A', 'P', [{ description: 'get', key: 'k1' }]);
    writePact(dir, 'b-p.json', 'B', 'P', [{ description: 'get', key: 'k1' }]);
    const entry = (consumer: string, result: string) => ({
      consumer,
      provider: 'P',
      description: 'get',
      providerStates: [],
      pending: false,
      result,
      duration: '1ms',
      interactionKey: 'k1',
      ...(result === 'OK'
        ? {}
        : { mismatch: { type: 'error', message: 'boom', interactionId: '' } }),
    });
    vi.spyOn(Verifier.prototype, 'verify').mockResolvedValue(
      resultOf([entry('A', 'OK'), entry('B', 'Error')], { result: false }),
    );
    const adapter = recordingAdapter();

    defineVerificationSuite(
      { provider: 'P', providerBaseUrl: 'http://localhost:1', pactUrls: [dir] },
      adapter,
    );
    const outcomes = await runAll(adapter.cases);

    expect(outcomes.map((o) => `${o.case}: ${o.status}`)).toEqual([
      'A -> P / get: passed',
      'B -> P / get: failed',
      'Provider verification / reports no failures outside the listed interactions: passed',
    ]);
  });

  it('fails the run check when a pact could not be loaded, although every interaction passed', async () => {
    const result = resultOf(rawInteractions('verification-success.extended'), {
      result: false,
      errors: [
        {
          interaction: 'Failed to load pact',
          mismatch: {
            type: 'error',
            message:
              "Failed to load pact from './pacts' - Failed to parse Pact JSON",
          },
        },
      ],
    });
    vi.spyOn(Verifier.prototype, 'verify').mockRejectedValue(
      new ProviderVerificationError(result),
    );
    const adapter = recordingAdapter();
    defineVerificationSuite(options, adapter);

    const outcomes = await runAll(adapter.cases);

    expect(outcomes.slice(0, 5).every((o) => o.status === 'passed')).toBe(true);
    expect(outcomes[5].status).toBe('failed');
    expect(outcomes[5].message).toContain(
      'Failed to load pact: Failed to load pact from',
    );
  });

  it('fails the run check for a failed interaction that has no test case', async () => {
    const result = fixture('verification-failure.extended');
    vi.spyOn(Verifier.prototype, 'verify').mockRejectedValue(
      new ProviderVerificationError(result),
    );
    const adapter = recordingAdapter();
    // only the first pact is registered; the failure in the second has no case
    defineVerificationSuite(
      { ...options, pactFiles: [demoPactFiles[0]] },
      adapter,
    );

    const outcomes = await runAll(adapter.cases);

    expect(outcomes[3].status).toBe('failed');
    expect(outcomes[3].message).toContain(
      "'OtherConsumer -> DemoProvider: a request for two' failed but has no test case",
    );
  });

  it('only registers the pacts of the configured provider and consumers, like the core', () => {
    const adapter = recordingAdapter();
    defineVerificationSuite({ ...options, pactUrls: [pactDir] }, adapter);
    expect(new Set(adapter.cases.map((c) => c.suite))).toEqual(
      new Set([
        'DemoConsumer -> DemoProvider',
        'OtherConsumer -> DemoProvider',
        'Provider verification',
      ]),
    );

    const filtered = recordingAdapter();
    defineVerificationSuite(
      { ...options, pactUrls: [pactDir], consumerFilters: ['OtherConsumer'] },
      filtered,
    );
    expect(filtered.cases.map((c) => c.suite)).toEqual([
      'OtherConsumer -> DemoProvider',
      'OtherConsumer -> DemoProvider',
      'Provider verification',
    ]);

    expect(() =>
      defineVerificationSuite(
        { ...options, pactUrls: [pactDir], provider: 'NoSuchProvider' },
        recordingAdapter(),
      ),
    ).toThrow(/No pact files for provider 'NoSuchProvider'/);
  });

  it("passes 'timeout' on to the verifier and keeps 'testTimeout' for the test cases", async () => {
    const verify = vi
      .spyOn(Verifier.prototype, 'verify')
      .mockResolvedValue(fixture('verification-success.extended'));
    const adapter = recordingAdapter();
    defineVerificationSuite(
      { ...options, timeout: 5_000, testTimeout: 120_000 },
      adapter,
    );

    await runAll(adapter.cases);

    expect(adapter.cases.every((c) => c.timeout === 120_000)).toBe(true);
    expect(verify.mock.instances[0]).toHaveProperty('config.timeout', 5_000);
    expect(verify.mock.instances[0]).not.toHaveProperty('config.testTimeout');
  });

  it('sets the timeout on the returned test for Mocha, which ignores its third argument', () => {
    const timeouts: number[] = [];
    const mochaLike: VerificationSuiteAdapter = {
      describe: (_name, fn) => fn(),
      it: () => ({ timeout: (ms: number) => timeouts.push(ms) }),
    };

    defineVerificationSuite(options, mochaLike);

    expect(timeouts).toEqual(Array(6).fill(30_000));
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
      'Provider verification / reports no failures outside the listed interactions',
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
      'passed',
    ]);
    expect(outcomes[1].message).toContain(
      'StatusMismatch: expected 200 but was 500',
    );
  });

  it('groups interactions whose pact the core did not report', () => {
    const adapter = recordingAdapter();

    defineVerificationSuiteFromResult(fixture('verification-success'), adapter);

    expect(adapter.cases).toHaveLength(6);
    expect(new Set(adapter.cases.slice(0, 5).map((c) => c.suite))).toEqual(
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

    expect(adapter.cases.slice(0, 2).map((c) => c.name)).toEqual([
      'same',
      'same (2)',
    ]);
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
    result.success = true; // pending failures do not fail the run
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

  it('fails the run check when the run failed outside the listed interactions', async () => {
    const loadFailure = resultOf(
      rawInteractions('verification-success.extended'),
      {
        result: false,
        errors: [
          {
            interaction: 'Failed to load pact',
            mismatch: { type: 'error', message: 'broker returned 401' },
          },
        ],
      },
    );
    const adapter = recordingAdapter();
    defineVerificationSuiteFromResult(loadFailure, adapter);

    const outcomes = await runAll(adapter.cases);

    expect(outcomes.slice(0, 5).every((o) => o.status === 'passed')).toBe(true);
    expect(outcomes[5].status).toBe('failed');
    expect(outcomes[5].message).toContain('broker returned 401');

    // a failed run without any listed failure is not green either
    const unexplained = resultOf(
      rawInteractions('verification-success.extended'),
      { result: false },
    );
    const other = recordingAdapter();
    defineVerificationSuiteFromResult(unexplained, other);
    const last = (await runAll(other.cases))[5];
    expect(last.status).toBe('failed');
    expect(last.message).toContain('no listed interaction failed');
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
      'Provider verification / reports no failures outside the listed interactions',
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
