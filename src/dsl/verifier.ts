/**
 * Provider Verifier service
 * @module ProviderVerifier
 */
import pact from "@pact-foundation/pact-node";
import { VerifierOptions } from "@pact-foundation/pact-node";
import { Promise } from "es6-promise";

export class Verifier {
  public verifyProvider(opts: VerifierOptions): Promise<string> {
    return new Promise((resolve, reject) => {
      pact.verifyPacts(opts)
        .then((value: string) => resolve(value), (error: any) => reject(error));
    });
  }
}
