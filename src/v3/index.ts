const PactNative = require("../../src/v3/native")

PactNative.init()

export * from "./pact"

/**
 * Exposes {@link Matchers}
 * To avoid polluting the root module's namespace, re-export
 * Matchers as its owns module
 * @memberof Pact
 * @static
 */
import * as Matchers from "./matchers"
export import Matchers = Matchers

/**
 * Exposes {@link VerifierV3}
 * @memberof Pact
 * @static
 */
export * from "./verifier"
