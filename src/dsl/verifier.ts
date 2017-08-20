/**
 * Provider Verifier service
 * @module ProviderVerifier
 */
import * as serviceFactory from '@pact-foundation/pact-node';

export function verifyProvider(opts: any): Promise<void> {
  return serviceFactory.verifyPacts(opts);
}
