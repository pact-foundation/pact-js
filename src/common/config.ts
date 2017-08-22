/**
 * Configuration module.
 * @module config
 * @private
 */
import { resolve } from 'path';
import * as process from 'process';

export interface Config {
  mockService: {
    host: string;
    port: number;
  };
  logging: boolean;
}
const PACT_CONFIG_FILE = resolve(process.cwd(), 'config', 'pact.config.js');
const DEFAULT_PACT_CONFIG: Config = {
  mockService: {
    host: '127.0.0.1',
    port: 1234
  },
  logging: false
};

let config: Config;

try {
  config = require(PACT_CONFIG_FILE);
} catch (e) {
  config = DEFAULT_PACT_CONFIG;
}

export { config };
