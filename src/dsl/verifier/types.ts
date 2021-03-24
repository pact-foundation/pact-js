import { VerifierOptions as PactCoreVerifierOptions } from "@pact-foundation/pact-core"

import { ProxyOptions } from "./proxy/types"

export type VerifierOptions = PactCoreVerifierOptions & ProxyOptions
