import express from 'express';

import logger from '../../../common/logger';
import { ProxyOptions } from './types';

export const registerBeforeHook = (
  app: express.Express,
  config: ProxyOptions,
  stateSetupPath: string
): void => {
  app.use(async (req, res, next) => {
    if (config.beforeEach !== undefined) {
      logger.trace("registered 'beforeEach' hook");
      if (req.path === stateSetupPath) {
        logger.debug("executing 'beforeEach' hook");
        try {
          await config.beforeEach();
        } catch (e) {
          logger.error(`error executing 'beforeEach' hook: ${e.message}`);
          logger.debug(`Stack trace was: ${e.stack}`);
          next(new Error(`error executing 'beforeEach' hook: ${e.message}`));
        }
      }
    }
    next();
  });
};

export const registerAfterHook = (
  app: express.Express,
  config: ProxyOptions,
  stateSetupPath: string
): void => {
  app.use(async (req, res, next) => {
    if (config.afterEach !== undefined) {
      logger.trace("registered 'afterEach' hook");
      next();
      if (req.path !== stateSetupPath) {
        logger.debug("executing 'afterEach' hook");
        try {
          await config.afterEach();
        } catch (e) {
          logger.error(`error executing 'afterEach' hook: ${e.message}`);
          logger.debug(`Stack trace was: ${e.stack}`);
          next(new Error(`error executing 'afterEach' hook: ${e.message}`));
        }
      }
    } else {
      next();
    }
  });
};
