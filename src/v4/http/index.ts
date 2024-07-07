import fs = require('fs');

import { ConsumerPact } from '@pact-foundation/pact-core';
import { V3MockServer } from '../../v3';
import { PactV4Options, TestFunction } from './types';
import {
  filterMissingFeatureFlag,
  generateMockServerError,
} from '../../v3/display';
import logger from '../../common/logger';

export const readBinaryData = (file: string): Buffer => {
  try {
    const body = fs.readFileSync(file);

    return body;
  } catch (e) {
    throw new Error(`unable to read file for binary payload : ${e.message}`);
  }
};

const cleanup = (
  success: boolean,
  pact: ConsumerPact,
  opts: PactV4Options,
  server: V3MockServer,
  cleanupFn: () => void
) => {
  if (success) {
    pact.writePactFile(opts.dir || './pacts');
  }
  pact.cleanupMockServer(server.port);
  pact.cleanupPlugins();
  cleanupFn();
};

export const executeTest = async <T>(
  pact: ConsumerPact,
  opts: PactV4Options,
  testFn: TestFunction<T>,
  cleanupFn: () => void
): Promise<T | undefined> => {
  const scheme = opts.tls ? 'https' : 'http';
  const host = opts.host || '127.0.0.1';
  const port = pact.createMockServer(host, opts.port || 0, false);

  const server = { port, url: `${scheme}://${host}:${port}`, id: 'unknown' };
  let val: T | undefined;
  let error: Error | undefined;

  try {
    val = await testFn(server);
  } catch (e) {
    error = e;
  }

  const matchingResults = pact.mockServerMismatches(port);
  const errors = filterMissingFeatureFlag(matchingResults);
  const success = pact.mockServerMatchedSuccessfully(port);

  // Scenario: Pact validation failed
  if (!success && errors.length > 0) {
    let errorMessage = 'Test failed for the following reasons:';
    errorMessage += `\n\n  ${generateMockServerError(matchingResults, '\t')}`;

    cleanup(false, pact, opts, server, cleanupFn);

    // If the tests throws an error, we need to rethrow the error, but print out
    // any additional mock server errors to help the user understand what happened
    // (The proximate cause here is often the HTTP 500 from the mock server,
    // where the HTTP client then throws)
    if (error) {
      logger.error(errorMessage);
      throw error;
    }

    // Test didn't throw, so we need to ensure the test fails
    return Promise.reject(new Error(errorMessage));
  }

  // Scenario: test threw an error, but Pact validation was OK (error in client or test)
  if (error) {
    cleanup(false, pact, opts, server, cleanupFn);
    throw error;
  }

  // Scenario: Pact validation passed, test didn't throw - return the callback value
  cleanup(true, pact, opts, server, cleanupFn);

  return val;
};
