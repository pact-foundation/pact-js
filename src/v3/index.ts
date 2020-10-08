const PactNative = require("../native/index.node")
import logger from "../common/logger"

const version = PactNative.init()
logger.debug("Initialised native library " + version)

export * from "./pact"

/**
 * Exposes {@link MatchersV3}
 * @memberof Pact
 * @static
 */
export * from "./matchers"

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
