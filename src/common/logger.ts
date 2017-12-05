/* tslint:disable:no-console */

/**
 * Logger module.
 * @module logger
 * @private
 */

import { config } from "./config";

const logger = {
  info: (msg: any) => {
    if (config.logging) {
      console.log(msg);
    }
  },
  warn: (msg: any) => {
    if (config.logging) {
      console.warn(msg);
    }
  },
};

export { logger };
