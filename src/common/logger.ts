import logger from '@pact-foundation/pact-core/src/logger';

import { version } from '../../package.json';

export * from '@pact-foundation/pact-core/src/logger';

const context = `pact@${version}`;

export default {
  pactCrash: (message: string): void => logger.pactCrash(message, context),
  error: (message: string): void => logger.error(message, context),
  warn: (message: string): void => logger.warn(message, context),
  info: (message: string): void => logger.info(message, context),
  debug: (message: string): void => logger.debug(message, context),
  trace: (message: string): void => logger.trace(message, context),
};
