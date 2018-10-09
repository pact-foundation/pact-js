/**
 * Provider Verifier service
 * @module ProviderVerifier
 */
import pact from "@pact-foundation/pact-node"
import { qToPromise } from "../common/utils"
import { VerifierOptions } from "@pact-foundation/pact-node"

export class Verifier {
  public verifyProvider(opts: VerifierOptions): Promise<any> {
    return qToPromise<any>(pact.verifyPacts(opts))
  }
}
