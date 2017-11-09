/**
 * Provider Verifier service
 * @module ProviderVerifier
 */
const pact = require('@pact-foundation/pact-node');

export function verifyProvider(opts: any): Promise<void> {
  return pact.verifyPacts(opts);
}
