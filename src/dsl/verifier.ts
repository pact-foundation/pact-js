/**
 * Provider Verifier service
 * @module ProviderVerifier
 */
import pact from '@pact-foundation/pact-node';
import { VerifierOptions } from '@pact-foundation/pact-node';
import { Promise } from 'es6-promise';

export function verifyProvider(opts: VerifierOptions): Promise<string> {
  return pact.verifyPacts(opts)
    .then((value: string) => Promise.resolve(value), (error: any) => Promise.reject(error));
}
