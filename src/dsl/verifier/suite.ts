/**
 * Test framework integration for provider verification: one `describe` per
 * pact and one `it` per interaction, backed by a single verification run.
 *
 * @module ProviderVerifier
 */
import logger from '../../common/logger';
import ConfigurationError from '../../errors/configurationError';
import {
  describeInteraction,
  formatFailure,
  groupByPact,
  type InteractionVerificationResult,
  type PactFileInteraction,
  type PactFileSummary,
  type PactVerificationResult,
  ProviderVerificationError,
  readPactFiles,
  summarizeFailure,
  type VerificationResult,
} from './result';
import type { VerifierOptions } from './types';
import { Verifier } from './verifier';

/**
 * The test framework functions the suite is built with. Pass the globals of
 * Jest, Vitest or Mocha, e.g. `{ describe, it }`.
 */
export interface VerificationSuiteAdapter {
  describe: (name: string, fn: () => void) => void;
  /**
   * Jest and Vitest take the timeout as third argument. Mocha ignores it and
   * returns the `Test`, whose `timeout()` method is used instead.
   */
  it: (name: string, fn: () => Promise<void>, timeout?: number) => unknown;
}

export interface VerificationSuiteOptions extends VerifierOptions {
  /**
   * Local pact files or directories whose interactions become test cases.
   * Defaults to `pactUrls`. Remote sources cannot be enumerated synchronously;
   * use {@link defineVerificationSuiteAsync} for those.
   */
  pactFiles?: string[];
  /**
   * Timeout in milliseconds for each test case. The first test case waits for
   * the complete verification run, so this must cover the whole run.
   * Defaults to 30000. (`timeout` keeps its meaning as a verifier option.)
   */
  testTimeout?: number;
  /** Builds the `describe` name of a pact. Defaults to `<consumer> -> <provider>`. */
  pactName?: (pact: PactFileSummary) => string;
  /** Builds the `it` name of an interaction. Defaults to the interaction description. */
  interactionName?: (
    interaction: PactFileInteraction,
    pact: PactFileSummary,
  ) => string;
}

const DEFAULT_TEST_TIMEOUT = 30_000;

/** `describe` name of the test case that checks the run as a whole. */
export const VERIFICATION_RUN_SUITE = 'Provider verification';
/** `it` name of the test case that checks the run as a whole. */
export const VERIFICATION_RUN_TEST =
  'reports no failures outside the listed interactions';

/**
 * Registers a test suite that reports the provider verification per pact and
 * per interaction.
 *
 * The pact files are read synchronously while the suite is being defined, so
 * that the test framework knows all test cases up front. The verification
 * itself runs exactly once, when the first test case executes; every test
 * case then reports the result of its own interaction. One additional test
 * case ({@link VERIFICATION_RUN_SUITE}) fails when the run reported failures
 * that belong to no listed interaction, e.g. a pact that could not be loaded.
 *
 * @example
 * ```ts
 * import { describe, it } from 'vitest';
 * import { defineVerificationSuite } from '@pact-foundation/pact';
 *
 * defineVerificationSuite(
 *   { provider: 'MyProvider', providerBaseUrl: 'http://localhost:8080', pactUrls: ['./pacts'] },
 *   { describe, it },
 * );
 * ```
 */
export function defineVerificationSuite(
  options: VerificationSuiteOptions,
  adapter: VerificationSuiteAdapter,
): void {
  const {
    pactFiles,
    testTimeout = DEFAULT_TEST_TIMEOUT,
    pactName = defaultPactName,
    interactionName = defaultInteractionName,
  } = options;
  const sources = pactFiles ?? options.pactUrls;
  if (!sources || sources.length === 0) {
    throw new ConfigurationError(
      "defineVerificationSuite needs 'pactFiles' or 'pactUrls' pointing to local pact files",
    );
  }
  const pacts = readPactFiles(sources, {
    provider: options.provider,
    consumers: options.consumerFilters,
  });
  // Registering no test case at all would make a run that verified nothing
  // look green, so an empty selection is a configuration error.
  if (pacts.length === 0) {
    throw new ConfigurationError(
      `No pact files${options.provider ? ` for provider '${options.provider}'` : ''}${
        options.consumerFilters?.length
          ? ` and consumer(s) ${options.consumerFilters.map((c) => `'${c}'`).join(', ')}`
          : ''
      } found in ${sources.map((s) => `'${s}'`).join(', ')}. defineVerificationSuite would not register any test case.`,
    );
  }
  if (pacts.every((pact) => pact.interactions.length === 0)) {
    throw new ConfigurationError(
      `The pact file(s) ${pacts.map((p) => `'${p.file}'`).join(', ')} contain no interactions. defineVerificationSuite would not register any test case.`,
    );
  }
  // The verifier options are read when the verification starts, not when the
  // suite is defined, so values that only exist after a beforeAll hook (e.g.
  // the port of a provider started on an ephemeral port) can be supplied via
  // getters.
  const run = lazy(async () =>
    assignResults(await runVerification(verifierOptions(options)), pacts),
  );

  registerPactSuites(
    adapter,
    pacts,
    pactName,
    interactionName,
    (pact, interaction) => async () => {
      const { assigned } = await run();
      assertInteractionPassed(
        assigned.get(interaction),
        describeInteraction({
          consumer: pact.consumer,
          provider: pact.provider,
          description: interaction.description,
        }),
      );
    },
    testTimeout,
  );
  registerRunCheck(
    adapter,
    async () => {
      const { result, unassigned } = await run();
      assertRunClean(result, unassigned);
    },
    testTimeout,
  );
}

/** Naming options for a suite built from a verification result. */
export interface VerificationSuiteResultOptions {
  /** Builds the `describe` name of a pact. Defaults to `<consumer> -> <provider>`. */
  pactName?: (pact: PactVerificationResult) => string;
  /** Builds the `it` name of an interaction. Defaults to the interaction description. */
  interactionName?: (
    interaction: InteractionVerificationResult,
    pact: PactVerificationResult,
  ) => string;
}

export interface AsyncVerificationSuiteOptions
  extends VerifierOptions,
    VerificationSuiteResultOptions {}

/**
 * Runs a provider verification and returns its result, whether it passed or
 * failed. Only errors that prevented the verification from running at all
 * (configuration, hooks, a crash of the core) are thrown.
 *
 * Use this when the verification has to run before the test cases are
 * registered, e.g. in a Jest `globalSetup`, and hand the result to
 * {@link defineVerificationSuiteFromResult}.
 */
export async function verifyForSuite(
  options: VerifierOptions,
): Promise<VerificationResult> {
  return runVerification(options);
}

/**
 * Registers one `describe` per pact and one `it` per interaction from a
 * verification result that has already been obtained, plus one test case
 * ({@link VERIFICATION_RUN_SUITE}) that fails when the run reported failures
 * that belong to no listed interaction, e.g. a pact that could not be loaded.
 *
 * Unlike {@link defineVerificationSuite} this needs no pact files: the pacts
 * and interactions are taken from the result, so it works with every source
 * the verifier supports, a Pact Broker included.
 *
 * @throws {ConfigurationError} if the result contains no interaction, because
 *         registering no test case would make a run that verified nothing look
 *         green
 */
export function defineVerificationSuiteFromResult(
  result: VerificationResult,
  adapter: VerificationSuiteAdapter,
  options: VerificationSuiteResultOptions = {},
): void {
  const {
    pactName = defaultResultPactName,
    interactionName = defaultResultInteractionName,
  } = options;
  if (result.interactions.length === 0) {
    throw new ConfigurationError(
      'The verification result contains no interaction. defineVerificationSuiteFromResult would not register any test case.',
    );
  }
  if (result.interactions.some((i) => !i.consumer || !i.provider)) {
    logger.warn(
      'The core did not report the pact of every interaction, so the test cases cannot all be grouped by pact. Upgrade to @pact-foundation/pact-core >= 20.2.0.',
    );
  }

  registerPactSuites(
    adapter,
    groupByPact(result),
    pactName,
    interactionName,
    (_pact, interaction) => async () => {
      assertInteractionPassed(interaction, describeInteraction(interaction));
    },
  );
  registerRunCheck(adapter, async () => {
    assertRunClean(result, []);
  });
}

/**
 * Runs the verification and then registers one `describe` per pact and one
 * `it` per interaction from its result.
 *
 * This is the variant to use with a Pact Broker: pass the usual broker options
 * (`pactBrokerUrl`, `consumerVersionSelectors`, ...) and the pacts the broker
 * returns become the test cases. The verification runs as a normal broker
 * verification, so the broker links stay intact and
 * `publishVerificationResult` keeps working.
 *
 * Because the verification has to finish before the test cases can be
 * registered, the provider must already be reachable when this is awaited, and
 * the call has to happen before the framework starts running tests:
 *
 * - Vitest: `await` it at the top level of the test file
 * - Mocha: `--delay` and call `run()` afterwards
 * - Jest: run {@link verifyForSuite} in a `globalSetup`, persist the result and
 *   hand it to {@link defineVerificationSuiteFromResult} in the test file
 *
 * @example
 * ```ts
 * import { describe, it } from 'vitest';
 * import { defineVerificationSuiteAsync } from '@pact-foundation/pact';
 *
 * const server = createApp().listen(3001);
 * await defineVerificationSuiteAsync(
 *   {
 *     provider: 'UserProvider',
 *     providerBaseUrl: 'http://localhost:3001',
 *     pactBrokerUrl: process.env.PACT_BROKER_BASE_URL,
 *     consumerVersionSelectors: [{ mainBranch: true }],
 *     publishVerificationResult: true,
 *     providerVersion: process.env.GIT_COMMIT,
 *   },
 *   { describe, it },
 * );
 * server.close();
 * ```
 */
export async function defineVerificationSuiteAsync(
  options: AsyncVerificationSuiteOptions,
  adapter: VerificationSuiteAdapter,
): Promise<void> {
  const { pactName, interactionName, ...verifier } = options;
  const result = await verifyForSuite(verifier);
  defineVerificationSuiteFromResult(result, adapter, {
    pactName,
    interactionName,
  });
}

const defaultResultPactName = (pact: PactVerificationResult): string =>
  pact.consumer && pact.provider
    ? `${pact.consumer} -> ${pact.provider}`
    : 'verified interactions';

const defaultResultInteractionName = (
  interaction: InteractionVerificationResult,
): string => interaction.description;

const verifierOptions = (
  options: VerificationSuiteOptions,
): VerifierOptions => {
  const { pactFiles, testTimeout, pactName, interactionName, ...rest } =
    options;
  return rest;
};

const defaultPactName = (pact: PactFileSummary): string =>
  `${pact.consumer} -> ${pact.provider}`;

const defaultInteractionName = (interaction: PactFileInteraction): string =>
  interaction.description;

/**
 * Registers one `describe` per pact and one `it` per interaction. Repeated
 * descriptions within a pact are numbered: `name`, `name (2)`, `name (3)`.
 */
function registerPactSuites<
  P extends { interactions: I[] },
  I extends { description: string },
>(
  adapter: VerificationSuiteAdapter,
  pacts: P[],
  pactName: (pact: P) => string,
  interactionName: (interaction: I, pact: P) => string,
  body: (pact: P, interaction: I) => () => Promise<void>,
  timeout?: number,
): void {
  for (const pact of pacts) {
    adapter.describe(pactName(pact), () => {
      const seen = new Map<string, number>();
      for (const interaction of pact.interactions) {
        const occurrence = (seen.get(interaction.description) ?? 0) + 1;
        seen.set(interaction.description, occurrence);
        const name = interactionName(interaction, pact);
        registerTest(
          adapter,
          occurrence === 1 ? name : `${name} (${occurrence})`,
          body(pact, interaction),
          timeout,
        );
      }
    });
  }
}

function registerRunCheck(
  adapter: VerificationSuiteAdapter,
  check: () => Promise<void>,
  timeout?: number,
): void {
  adapter.describe(VERIFICATION_RUN_SUITE, () => {
    registerTest(adapter, VERIFICATION_RUN_TEST, check, timeout);
  });
}

function registerTest(
  adapter: VerificationSuiteAdapter,
  name: string,
  fn: () => Promise<void>,
  timeout?: number,
): void {
  const test = adapter.it(name, fn, timeout);
  // Mocha ignores the third argument of `it`; its Test has a timeout() method.
  if (timeout !== undefined && hasTimeoutMethod(test)) {
    test.timeout(timeout);
  }
}

const hasTimeoutMethod = (
  v: unknown,
): v is { timeout: (ms: number) => unknown } =>
  typeof v === 'object' &&
  v !== null &&
  typeof (v as { timeout?: unknown }).timeout === 'function';

/** Runs the verification once; a failed verification still yields its result. */
async function runVerification(
  options: VerifierOptions,
): Promise<VerificationResult> {
  try {
    return await new Verifier(options).verify();
  } catch (e) {
    if (e instanceof ProviderVerificationError) {
      return e.result;
    }
    throw e;
  }
}

type AssignedResults = {
  result: VerificationResult;
  /** The result of each pact file interaction that has one */
  assigned: Map<PactFileInteraction, InteractionVerificationResult>;
  /** Results that belong to no pact file interaction */
  unassigned: InteractionVerificationResult[];
};

/**
 * Assigns every interaction result to at most one pact file interaction.
 *
 * An interaction takes the first still unassigned result of its own pact with
 * the same key, or else the same description and provider states. Only when
 * the core did not report the pact of a result (cores < 20.2.0 omit it for
 * successful interactions) is a result without pact information accepted, by
 * key or by description. Nothing else is matched: an interaction without a
 * matching result fails its test case instead of borrowing another result.
 */
function assignResults(
  result: VerificationResult,
  pacts: PactFileSummary[],
): AssignedResults {
  const open = new Set(result.interactions);
  const take = (
    matches: (r: InteractionVerificationResult) => boolean,
  ): InteractionVerificationResult | undefined => {
    for (const candidate of open) {
      if (matches(candidate)) {
        open.delete(candidate);
        return candidate;
      }
    }
    return undefined;
  };
  const assigned = new Map<
    PactFileInteraction,
    InteractionVerificationResult
  >();
  for (const pact of pacts) {
    const ofPact = (r: InteractionVerificationResult) =>
      r.consumer === pact.consumer && r.provider === pact.provider;
    const ofUnknownPact = (r: InteractionVerificationResult) =>
      r.consumer === undefined || r.provider === undefined;
    for (const interaction of pact.interactions) {
      const byKey = (r: InteractionVerificationResult) =>
        interaction.key !== undefined && r.interactionKey === interaction.key;
      const byDescription = (r: InteractionVerificationResult) =>
        r.description === interaction.description &&
        (r.providerStates === undefined ||
          sameStates(r.providerStates, interaction.providerStates));
      const match =
        take((r) => ofPact(r) && byKey(r)) ??
        take((r) => ofPact(r) && byDescription(r)) ??
        take((r) => ofUnknownPact(r) && byKey(r)) ??
        take((r) => ofUnknownPact(r) && byDescription(r));
      if (match) {
        assigned.set(interaction, match);
      }
    }
  }
  const unassigned = [...open];
  if (unassigned.length > 0) {
    logger.warn(
      `${unassigned.length} verified interaction(s) belong to none of the pact files of the suite: ${unassigned
        .map((r) => `'${describeInteraction(r)}'`)
        .join(', ')}`,
    );
  }
  return { result, assigned, unassigned };
}

const sameStates = (a: string[], b: string[]): boolean =>
  a.length === b.length && a.every((s, i) => s === b[i]);

function assertInteractionPassed(
  outcome: InteractionVerificationResult | undefined,
  label: string,
): void {
  if (!outcome) {
    throw new Error(
      `No verification result for '${label}'. The interaction was not verified, e.g. because it was filtered out (PACT_DESCRIPTION / PACT_PROVIDER_STATE) or the pact could not be loaded.`,
    );
  }
  if (outcome.success) {
    return;
  }
  const details = formatFailure(outcome.failure);
  if (outcome.pending) {
    logger.warn(
      `Pending interaction '${label}' failed (does not fail the build):\n${details}`,
    );
    return;
  }
  throw new Error(`Verification of '${label}' failed:\n${details}`);
}

/**
 * Fails when the run reported failures that no interaction test case reports:
 * errors without an interaction (a pact that could not be loaded), failed
 * interactions without a test case, or a failed run without any of these.
 */
function assertRunClean(
  result: VerificationResult,
  unassigned: InteractionVerificationResult[],
): void {
  const problems = (result.unattributedErrors ?? []).map(
    (e) => `${e.interaction}: ${summarizeFailure(e.failure)}`,
  );
  for (const r of unassigned) {
    if (!r.success && !r.pending) {
      problems.push(
        `'${describeInteraction(r)}' failed but has no test case:\n${formatFailure(r.failure)}`,
      );
    }
  }
  const failedInteractions = result.interactions.some(
    (i) => !i.success && !i.pending,
  );
  if (!result.success && !failedInteractions && problems.length === 0) {
    problems.push(
      'The core reported a failed run, but no listed interaction failed. See the verification output.',
    );
  }
  if (problems.length > 0) {
    throw new Error(
      `The verification run reported failures outside the listed interactions:\n${problems
        .map((p) => `  - ${p}`)
        .join('\n')}`,
    );
  }
}

function lazy<T>(factory: () => Promise<T>): () => Promise<T> {
  let promise: Promise<T> | undefined;
  return () => {
    promise ??= factory();
    return promise;
  };
}
