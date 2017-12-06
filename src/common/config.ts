/**
 * Configuration module.
 * @module config
 * @private
 */
import { resolve } from "path";
import * as process from "process";

export interface Config {
  mockService: {
    host: string;
    port: number;
  };
  logging: boolean;
}
const PACT_CONFIG_FILE = resolve(process.cwd(), "config", "pact.config.js");
const DEFAULT_PACT_CONFIG: Config = {
  logging: false,
  mockService: {
    host: "127.0.0.1",
    port: 1234,
  },
};

let config: Config;

try {
  // tslint:disable:no-var-requires
  config = require(PACT_CONFIG_FILE);
} catch (e) {
  config = DEFAULT_PACT_CONFIG;
}

export { config };
