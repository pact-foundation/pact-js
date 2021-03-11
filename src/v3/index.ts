import logger from "../common/logger"

import PactNative from "../../native/index.node"

const version = PactNative.init()
logger.debug("Initialised native library " + version)

export * from "./pact"

/**
 * Exposes {@link MatchersV3}
 * @memberof Pact
 * @static
 */
export * as MatchersV3 from "./matchers"

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
export * from "./xml/xmlNode"
export * from "./xml/xmlText"
