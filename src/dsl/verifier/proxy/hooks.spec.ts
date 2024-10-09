import { expect } from 'chai';
import { stub } from 'sinon';
import { RequestHandler } from 'express';

import {
  registerHookStateTracking,
  registerBeforeHook,
  registerAfterHook,
  HooksState,
} from './hooks';

// This mimics the proxy setup (src/dsl/verifier/proxy/proxy.ts), whereby the
// state handling middleware is run regardless of whether a hook is registered
// or not.
const doRequest = async (
  action: string,
  hooksState: HooksState,
  hookHandler?: RequestHandler
) => {
  const hooksStateHandler = registerHookStateTracking(hooksState);
  const hookRequestHandler = hookHandler || ((req, res, next) => next());

  const request: any = {
    body: {
      action,
    },
  };

  return new Promise((resolve) => {
    hooksStateHandler(request, null as any, () => {
      hookRequestHandler(request, null as any, resolve);
    });
  });
};

describe('Verifier', () => {
  describe('#registerBeforeHook', () => {
    describe('when the state setup routine is called multiple times before the next teardown', () => {
      it('it executes the beforeEach hook only once', async () => {
        const hooksState: HooksState = { setupCounter: 0 };
        const hook = stub().resolves();
        const hookHandler = registerBeforeHook(hook, hooksState);

        await doRequest('setup', hooksState, hookHandler);
        await doRequest('setup', hooksState, hookHandler);
        await doRequest('teardown', hooksState);
        await doRequest('teardown', hooksState);

        expect(hook).to.be.calledOnce;
      });
    });
  });

  describe('#registerAfterHook', () => {
    describe('when the state teardown routine is called multiple times before the next setup', () => {
      it('it executes the afterEach hook only once', async () => {
        const hooksState: HooksState = { setupCounter: 0 };
        const hook = stub().resolves();
        const hookHandler = registerAfterHook(hook, hooksState);

        await doRequest('setup', hooksState);
        await doRequest('setup', hooksState);
        await doRequest('teardown', hooksState, hookHandler);
        await doRequest('teardown', hooksState, hookHandler);

        expect(hook).to.be.calledOnce;
      });
    });
  });

  describe('#registerBeforeHook and #registerAfterHook', () => {
    describe('when the state teardown routine is called multiple times before the next setup', () => {
      it('it executes the beforeEach and afterEach hooks only once', async () => {
        const hooksState: HooksState = { setupCounter: 0 };
        const beforeHook = stub().resolves();
        const afterHook = stub().resolves();
        const beforeHookHandler = registerBeforeHook(beforeHook, hooksState);
        const afterHookHandler = registerAfterHook(afterHook, hooksState);

        await doRequest('setup', hooksState, beforeHookHandler);
        await doRequest('setup', hooksState, beforeHookHandler);
        await doRequest('teardown', hooksState, afterHookHandler);
        await doRequest('teardown', hooksState, afterHookHandler);

        expect(beforeHook).to.be.calledOnce;
        expect(afterHook).to.be.calledOnce;
      });
    });

    describe('when multiple interactions are executed', () => {
      it('it executes the beforeEach and afterEach hooks once for each interaction', async () => {
        const hooksState: HooksState = { setupCounter: 0 };
        const beforeHook = stub().resolves();
        const afterHook = stub().resolves();
        const beforeHookHandler = registerBeforeHook(beforeHook, hooksState);
        const afterHookHandler = registerAfterHook(afterHook, hooksState);

        // Interaction 1 (two "given" states)
        await doRequest('setup', hooksState, beforeHookHandler);
        await doRequest('setup', hooksState, beforeHookHandler);
        await doRequest('teardown', hooksState, afterHookHandler);
        await doRequest('teardown', hooksState, afterHookHandler);

        // Interaction 2 (one "given" state)
        await doRequest('setup', hooksState, beforeHookHandler);
        await doRequest('teardown', hooksState, afterHookHandler);

        // Interaction 3 (three "given" states)
        await doRequest('setup', hooksState, beforeHookHandler);
        await doRequest('setup', hooksState, beforeHookHandler);
        await doRequest('setup', hooksState, beforeHookHandler);
        await doRequest('teardown', hooksState, afterHookHandler);
        await doRequest('teardown', hooksState, afterHookHandler);
        await doRequest('teardown', hooksState, afterHookHandler);

        expect(beforeHook).to.be.calledThrice;
        expect(afterHook).to.be.calledThrice;
      });
    });
  });
});
