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
  groupByPact,
  type InteractionVerificationResult,
  type PactFileInteraction,
  type PactFileSummary,
  type PactVerificationResult,
  ProviderVerificationError,
  readPactFiles,
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
  it: (name: string, fn: () => Promise<void>, timeout?: number) => unknown;
}

export interface VerificationSuiteOptions extends VerifierOptions {
  /**
   * Local pact files or directories whose interactions become test cases.
   * Defaults to `pactUrls`. Remote sources cannot be enumerated synchronously;
   * for those, download the pact files first.
   */
  pactFiles?: string[];
  /**
   * Timeout in milliseconds for each test case. The first test case waits for
   * the complete verification run, so this must cover the whole run.
   * Defaults to 30000.
   */
  timeout?: number;
  /** Builds the `describe` name of a pact. Defaults to `<consumer> -> <provider>`. */
  pactName?: (pact: PactFileSummary) => string;
  /** Builds the `it` name of an interaction. Defaults to the interaction description. */
  interactionName?: (
    interaction: PactFileInteraction,
    pact: PactFileSummary,
  ) => string;
}

const DEFAULT_TIMEOUT = 30_000;

/**
 * Registers a test suite that reports the provider verification per pact and
 * per interaction.
 *
 * The pact files are read synchronously while the suite is being defined, so
 * that the test framework knows all test cases up front. The verification
 * itself runs exactly once, when the first test case executes; every test
 * case then reports the result of its own interaction.
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
    timeout = DEFAULT_TIMEOUT,
    pactName = defaultPactName,
    interactionName = defaultInteractionName,
  } = options;
  const sources = pactFiles ?? options.pactUrls;
  if (!sources || sources.length === 0) {
    throw new ConfigurationError(
      "defineVerificationSuite needs 'pactFiles' or 'pactUrls' pointing to local pact files",
    );
  }
  const pacts = readPactFiles(sources);
  // Registering no test case at all would make a run that verified nothing
  // look green, so an empty selection is a configuration error.
  if (pacts.length === 0) {
    throw new ConfigurationError(
      `No pact files found in ${sources.map((s) => `'${s}'`).join(', ')}. defineVerificationSuite would not register any test case.`,
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
  const run = lazy(() => runVerification(verifierOptions(options)));

  for (const pact of pacts) {
    adapter.describe(pactName(pact), () => {
      const seen = new Map<string, number>();
      pact.interactions.forEach((interaction, index) => {
        const occurrence = seen.get(interaction.description) ?? 0;
        seen.set(interaction.description, occurrence + 1);
        const name = interactionName(interaction, pact);
        adapter.it(
          occurrence === 0 ? name : `${name} (${occurrence + 1})`,
          async () => {
            const result = await run();
            const outcome = findInteractionResult(
              result,
              pact,
              interaction,
              index,
              occurrence,
            );
            assertInteractionPassed(
              outcome,
              describeInteraction({
                consumer: pact.consumer,
                provider: pact.provider,
                description: interaction.description,
              }),
            );
          },
          timeout,
        );
      });
    });
  }
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
 * verification result that has already been obtained.
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

  for (const pact of groupByPact(result)) {
    adapter.describe(pactName(pact), () => {
      const seen = new Map<string, number>();
      for (const interaction of pact.interactions) {
        const occurrence = seen.get(interaction.description) ?? 0;
        seen.set(interaction.description, occurrence + 1);
        const name = interactionName(interaction, pact);
        adapter.it(
          occurrence === 0 ? name : `${name} (${occurrence + 1})`,
          async () => {
            assertInteractionPassed(
              interaction,
              describeInteraction(interaction),
            );
          },
        );
      }
    });
  }
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
  const { pactFiles, timeout, pactName, interactionName, ...rest } = options;
  return rest;
};

const defaultPactName = (pact: PactFileSummary): string =>
  `${pact.consumer} -> ${pact.provider}`;

const defaultInteractionName = (interaction: PactFileInteraction): string =>
  interaction.description;

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

/**
 * Locates the result of a pact file interaction. With cores that report the
 * pact per interaction the match is exact; older cores only report the
 * description, so the n-th result with that description is taken.
 */
function findInteractionResult(
  result: VerificationResult,
  pact: PactFileSummary,
  interaction: PactFileInteraction,
  index: number,
  occurrence: number,
): InteractionVerificationResult | undefined {
  const byKey =
    interaction.key !== undefined
      ? result.interactions.find((r) => r.interactionKey === interaction.key)
      : undefined;
  if (byKey) {
    return byKey;
  }
  const candidates = result.interactions.filter(
    (r) => r.description === interaction.description,
  );
  const exact = candidates.filter(
    (r) => r.consumer === pact.consumer && r.provider === pact.provider,
  );
  if (exact.length > 0) {
    return exact[Math.min(occurrence, exact.length - 1)];
  }
  const unknownPact = candidates.filter(
    (r) => r.consumer === undefined || r.provider === undefined,
  );
  if (unknownPact.length === 1 && candidates.length === 1) {
    return unknownPact[0];
  }
  // Same description in several pacts and no pact information: fall back to
  // the position of the interaction across all pact files.
  return unknownPact.length > 0
    ? unknownPact[Math.min(occurrence, unknownPact.length - 1)]
    : result.interactions[index];
}

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
  const details = formatFailure(outcome);
  if (outcome.pending) {
    logger.warn(
      `Pending interaction '${label}' failed (does not fail the build):\n${details}`,
    );
    return;
  }
  throw new Error(`Verification of '${label}' failed:\n${details}`);
}

export function formatFailure(outcome: InteractionVerificationResult): string {
  const failure = outcome.failure;
  if (!failure) {
    return '  (no failure details reported by the core)';
  }
  if (failure.type === 'error') {
    return `  ${failure.message}`;
  }
  return failure.mismatches
    .map((m) => {
      const where = m.path ?? m.key ?? m.parameter;
      return `  - ${m.type}${where ? ` at ${where}` : ''}: ${m.mismatch}`;
    })
    .join('\n');
}

function lazy<T>(factory: () => Promise<T>): () => Promise<T> {
  let promise: Promise<T> | undefined;
  return () => {
    promise ??= factory();
    return promise;
  };
}
