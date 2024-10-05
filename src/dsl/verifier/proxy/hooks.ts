/* eslint-disable no-param-reassign */
/**
 * These handlers assume that the number of "setup" and "teardown" requests to
 * `/_pactSetup` are always sequential and balanced, i.e. if 3 "setup" actions
 * are received prior to an interaction being executed, then 3 "teardown"
 * actions will be received after that interaction has ended.
 */
import { RequestHandler } from 'express';

import logger from '../../../common/logger';
import { Hook } from './types';

export type HooksState = {
  setupCounter: number;
};

export const registerHookStateTracking =
  (hooksState: HooksState): RequestHandler =>
  async ({ body }, res, next) => {
    if (body?.action === 'setup') hooksState.setupCounter += 1;
    if (body?.action === 'teardown') hooksState.setupCounter -= 1;

    logger.debug(
      `hooks state counter is ${hooksState.setupCounter} after receiving "${body?.action}" action`
    );

    next();
  };

export const registerBeforeHook =
  (beforeEach: Hook, hooksState: HooksState): RequestHandler =>
  async ({ body }, res, next) => {
    if (body?.action === 'setup' && hooksState.setupCounter === 1) {
      logger.debug("executing 'beforeEach' hook");
      try {
        await beforeEach();
        next();
      } catch (e) {
        logger.error(`error executing 'beforeEach' hook: ${e.message}`);
        logger.debug(`Stack trace was: ${e.stack}`);
        next(new Error(`error executing 'beforeEach' hook: ${e.message}`));
      }
    } else {
      next();
    }
  };

export const registerAfterHook =
  (afterEach: Hook, hooksState: HooksState): RequestHandler =>
  async ({ body }, res, next) => {
    if (body?.action === 'teardown' && hooksState.setupCounter === 0) {
      logger.debug("executing 'afterEach' hook");
      try {
        await afterEach();
        next();
      } catch (e) {
        logger.error(`error executing 'afterEach' hook: ${e.message}`);
        logger.debug(`Stack trace was: ${e.stack}`);
        next(new Error(`error executing 'afterEach' hook: ${e.message}`));
      }
    } else {
      next();
    }
  };
