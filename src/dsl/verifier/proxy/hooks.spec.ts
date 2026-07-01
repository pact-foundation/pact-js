import type { RequestHandler } from 'express';
import { vi } from 'vitest';

import { createHooksState, registerHooks } from './hooks';

// Mimics the proxy: a single hooks middleware handles every `/_pactSetup`
// request. `doRequest` drives it with a given action and resolves once the
// middleware calls next().
const doRequest = (action: string, handler: RequestHandler) => {
  // biome-ignore lint/suspicious/noExplicitAny: partial mock — only body is needed
  const request: any = { body: { action } };

  return new Promise<void>((resolve) => {
    // biome-ignore lint/suspicious/noExplicitAny: null res mock; only body is exercised
    handler(request, null as any, () => resolve());
  });
};

describe('Verifier hooks', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('runs beforeEach and afterEach once per interaction (multiple "given" states)', async () => {
    const state = createHooksState();
    const beforeEach = vi.fn().mockResolvedValue(undefined);
    const afterEach = vi.fn().mockResolvedValue(undefined);
    const handler = registerHooks({ beforeEach, afterEach }, state);

    // Interaction with two "given" states: setup x2, teardown x2
    await doRequest('setup', handler);
    await doRequest('setup', handler);
    await doRequest('teardown', handler);
    await doRequest('teardown', handler);

    expect(beforeEach).toHaveBeenCalledOnce();
    expect(afterEach).toHaveBeenCalledOnce();
  });

  it('runs the hooks once for each of several interactions', async () => {
    const state = createHooksState();
    const beforeEach = vi.fn().mockResolvedValue(undefined);
    const afterEach = vi.fn().mockResolvedValue(undefined);
    const handler = registerHooks({ beforeEach, afterEach }, state);

    // Interaction 1 (two states)
    await doRequest('setup', handler);
    await doRequest('setup', handler);
    await doRequest('teardown', handler);
    await doRequest('teardown', handler);
    // Interaction 2 (one state)
    await doRequest('setup', handler);
    await doRequest('teardown', handler);
    // Interaction 3 (three states)
    await doRequest('setup', handler);
    await doRequest('setup', handler);
    await doRequest('setup', handler);
    await doRequest('teardown', handler);
    await doRequest('teardown', handler);
    await doRequest('teardown', handler);

    expect(beforeEach).toHaveBeenCalledTimes(3);
    expect(afterEach).toHaveBeenCalledTimes(3);
  });

  // Regression for #1864: a failing beforeEach used to desync a global counter,
  // silently disabling the hooks for every subsequent interaction.
  it('keeps running hooks for later interactions after a hook throws, and records the error', async () => {
    const state = createHooksState();
    const beforeEach = vi
      .fn()
      .mockRejectedValueOnce(new Error('transient failure'))
      .mockResolvedValue(undefined);
    const afterEach = vi.fn().mockResolvedValue(undefined);
    const handler = registerHooks({ beforeEach, afterEach }, state);

    // Three single-state interactions; beforeEach throws on the first.
    for (let i = 0; i < 3; i++) {
      await doRequest('setup', handler);
      await doRequest('teardown', handler);
    }

    expect(beforeEach).toHaveBeenCalledTimes(3);
    expect(afterEach).toHaveBeenCalledTimes(3);
    expect(state.errors).toHaveLength(1);
    expect(state.errors[0].message).toContain('beforeEach');
  });

  // A throwing hook must never turn into a non-2xx response (the proxy must keep
  // serving), or the core would retry the request and desync tracking.
  it('still calls next() when a hook throws', async () => {
    const state = createHooksState();
    const beforeEach = vi.fn().mockRejectedValue(new Error('boom'));
    const handler = registerHooks({ beforeEach }, state);

    // doRequest resolves only when next() is called.
    await expect(doRequest('setup', handler)).resolves.toBeUndefined();
  });

  // The core retries a failed state-change request: a duplicate "setup" before
  // any "teardown" must not re-fire beforeEach nor desync the interaction state.
  it('is idempotent under a retried setup request', async () => {
    const state = createHooksState();
    const beforeEach = vi.fn().mockResolvedValue(undefined);
    const afterEach = vi.fn().mockResolvedValue(undefined);
    const handler = registerHooks({ beforeEach, afterEach }, state);

    await doRequest('setup', handler);
    await doRequest('setup', handler); // retried/duplicate setup
    await doRequest('teardown', handler);
    // next interaction
    await doRequest('setup', handler);
    await doRequest('teardown', handler);

    expect(beforeEach).toHaveBeenCalledTimes(2);
    expect(afterEach).toHaveBeenCalledTimes(2);
  });
});
