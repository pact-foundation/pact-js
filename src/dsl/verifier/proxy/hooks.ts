/**
 * `beforeEach`/`afterEach` are driven off the provider-state setup/teardown
 * requests the core makes to `/_pactSetup`. For each interaction the core sends
 * one or more "setup" actions, runs the interaction, then sends one or more
 * "teardown" actions.
 *
 * We track the interaction boundary with a single `insideInteraction` flag that
 * flips on the setup<->teardown edges, rather than counting requests. This is:
 *   - idempotent under retries: the core retries a failed state-change request,
 *     and a duplicate "setup" while already inside an interaction is a no-op; and
 *   - self-healing: it cannot accumulate error and latch into a broken state.
 *
 * Hook failures are recorded on `HooksState.errors` and the state-change request
 * is still answered with a success, so a throwing hook never turns into a non-2xx
 * response (which the core would retry, desyncing interaction tracking). The
 * verifier surfaces any recorded errors once verification completes, so a failing
 * hook still fails the build.
 */
import type { RequestHandler } from 'express';

import logger from '../../../common/logger';
import type { Hook } from './types';

export type HooksState = {
  insideInteraction: boolean;
  errors: Error[];
};

export const createHooksState = (): HooksState => ({
  insideInteraction: false,
  errors: [],
});

const runHook = async (
  name: 'beforeEach' | 'afterEach',
  hook: Hook,
  hooksState: HooksState,
): Promise<void> => {
  logger.debug(`executing '${name}' hook`);
  try {
    await hook();
  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e));
    logger.error(`error executing '${name}' hook: ${error.message}`);
    logger.debug(`Stack trace was: ${error.stack}`);
    hooksState.errors.push(
      new Error(`error executing '${name}' hook: ${error.message}`),
    );
  }
};

export const registerHooks =
  (
    hooks: { beforeEach?: Hook; afterEach?: Hook },
    hooksState: HooksState,
  ): RequestHandler =>
  async ({ body }, _res, next) => {
    const action = body?.action;

    if (action === 'setup' && !hooksState.insideInteraction) {
      // rising edge: the first "setup" of a new interaction
      hooksState.insideInteraction = true;
      if (hooks.beforeEach)
        await runHook('beforeEach', hooks.beforeEach, hooksState);
    } else if (action === 'teardown' && hooksState.insideInteraction) {
      // falling edge: the first "teardown" after the interaction ran
      hooksState.insideInteraction = false;
      if (hooks.afterEach)
        await runHook('afterEach', hooks.afterEach, hooksState);
    }

    // Always continue with a successful response. A hook failure must never
    // become a non-2xx state-change response, or the core will retry it and
    // desync interaction tracking. Failures are surfaced by the verifier later.
    next();
  };
