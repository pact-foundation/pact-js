/**
 * Pact module meta package.
 * @module Pact
 */

/**
 * Exposes {@link Pact}
 * @memberof Pact
 * @static
 */
export * from "./httpPact"

/**
 * Exposes {@link MessageConsumerPact}
 * @memberof Pact
 * @static
 */
export * from "./messageConsumerPact"

/**
 * Exposes {@link MessageProviderPact}
 * @memberof Pact
 * @static
 */
export * from "./messageProviderPact"

/**
 * Exposes {@link Message}
 * @memberof Pact
 * @static
 */
export * from "./dsl/message"

/**
 * Exposes {@link Verifier}
 * @memberof Pact
 * @static
 */
export * from "./dsl/verifier"

/**
 * Exposes {@link GraphQL}
 * @memberof Pact
 * @static
 */
export * from "./dsl/graphql"
/**
 * Exposes {@link ApolloGraphQL}
 * @memberof Pact
 * @static
 */
export * from "./dsl/apolloGraphql"

/**
 * Exposes {@link Matchers}
 * To avoid polluting the root module's namespace, re-export
 * Matchers as its owns module
 * @memberof Pact
 * @static
 */
import * as Matchers from "./dsl/matchers"
export import Matchers = Matchers

/**
 * Exposes {@link Interaction}
 * @memberof Pact
 * @static
 */
export * from "./dsl/interaction"

/**
 * Exposes {@link MockService}
 * @memberof Pact
 * @static
 */
export * from "./dsl/mockService"

/**
 * Exposes {@link Publisher}
 * @memberof Pact
 * @static
 */
export * from "./dsl/publisher"

/**
 * Exposes {@link PactOptions}
 * @memberof Pact
 * @static
 */
export * from "./dsl/options"
