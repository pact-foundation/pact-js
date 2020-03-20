const PactNative = require("../native")
import logger from "../common/logger"

const version = PactNative.init()
logger.debug("Initialised native library " + version)

export * from "./pact"

/**
 * Exposes {@link MatchersV3}
 * To avoid polluting the root module's namespace, re-export
 * Matchers as its owns module
 * @memberof Pact
 * @static
 */
import * as MatchersV3 from "./matchers"
export import MatchersV3 = MatchersV3

/**
 * Exposes {@link VerifierV3}
 * @memberof Pact
 * @static
 */
export * from "./verifier"

/**
 * Exposes {@link xml}
 * @memberof Pact
 * @static
 */
export * from "./xml/xmlBuilder"
export * from "./xml/xmlElement"
