import { ConsumerVersionSelector , VerifierOptions as PactCoreVerifierOptions } from '@pact-foundation/pact-core';

import logger from '../common/logger';
import { ProxyOptions } from '../dsl/verifier/proxy/types';
import { Verifier } from '../dsl/verifier';

export type VerifierV3Options = PactCoreVerifierOptions & ProxyOptions;

export { ConsumerVersionSelector };
export class VerifierV3 {
  private internalVerifier: Verifier;

  constructor(config: VerifierV3Options) {
    this.internalVerifier = new Verifier(config);
  }

  /**
   * Verify a HTTP Provider
   */
  public verifyProvider(): Promise<unknown> {
    logger.warn(
      `VerifierV3 is now deprecated

  You no longer need to import the verifier from @pact-foundation/pact/v3
  You may now update your imports to:

      import { Verifier } from '@pact-foundation/pact'

  Thank you for being part of pact-js beta!`
    );
    return this.internalVerifier.verifyProvider();
  }
}
