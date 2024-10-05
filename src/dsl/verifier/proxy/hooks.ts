import express from 'express';

import logger from '../../../common/logger';
import { ProxyOptions } from './types';

export const registerBeforeHook = (
  app: express.Express,
  config: ProxyOptions,
  stateSetupPath: string
): void => {
  if (config.beforeEach) logger.trace("registered 'beforeEach' hook");
  app.use(async (req, res, next) => {
    if (req.path === stateSetupPath && config.beforeEach) {
      logger.debug("executing 'beforeEach' hook");
      try {
        await config.beforeEach();
        next();
      } catch (e) {
        logger.error(`error executing 'beforeEach' hook: ${e.message}`);
        logger.debug(`Stack trace was: ${e.stack}`);
        next(new Error(`error executing 'beforeEach' hook: ${e.message}`));
      }
    } else {
      next();
    }
  });
};

export const registerAfterHook = (
  app: express.Express,
  config: ProxyOptions,
  stateSetupPath: string
): void => {
  if (config.afterEach) logger.trace("registered 'afterEach' hook");
  app.use(async (req, res, next) => {
    if (req.path !== stateSetupPath && config.afterEach) {
      logger.debug("executing 'afterEach' hook");
      try {
        await config.afterEach();
        next();
      } catch (e) {
        logger.error(`error executing 'afterEach' hook: ${e.message}`);
        logger.debug(`Stack trace was: ${e.stack}`);
        next(new Error(`error executing 'afterEach' hook: ${e.message}`));
      }
    } else {
      next();
    }
  });
};
