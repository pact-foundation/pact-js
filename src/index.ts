/**
 * Pact module meta package.
 * @module Pact
 */

/**
 * Exposes {@link Pact}
 * @memberof Pact
 * @static
 */

/**
 * Exposes {@link MatchersV2}
 * To avoid polluting the root module's namespace, re-export
 * MatchersV2 as its own module
 * @memberof Pact
 * @static
 */
import * as MatchersStar from './dsl/matchers';

export const MatchersV2 = MatchersStar;

/**
 * Exposes {@link ApolloGraphQL}
 * @memberof Pact
 * @static
 */
export * from './dsl/apolloGraphql';
/**
 * Exposes {@link GraphQL}
 * @memberof Pact
 * @static
 */
export * from './dsl/graphql';
/**
 * Exposes {@link Interaction}
 * @memberof Pact
 * @static
 */
export * from './dsl/interaction';
export { InterfaceToTemplate } from './dsl/matchers';
/**
 * Exposes {@link Message}
 * @memberof Pact
 * @static
 */
export * from './dsl/message';
/**
 * Exposes {@link MockService}
 * @memberof Pact
 * @static
 */
export * from './dsl/mockService';
/**
 * Exposes {@link PactV2Options}
 * @memberof Pact
 * @static
 */
export * from './dsl/options';
export { VerifierOptions } from './dsl/verifier/types';
/**
 * Exposes {@link Verifier}
 * @memberof Pact
 * @static
 */
export * from './dsl/verifier/verifier';
export { Pact as PactV2 } from './httpPact';
/**
 * Exposes {@link MessageConsumerPact}
 * @memberof Pact
 * @static
 */
export * from './messageConsumerPact';
/**
 * Exposes {@link MessageProviderPact}
 * @memberof Pact
 * @static
 */
export {
  MessageProviderPact,
  providerWithMetadata,
} from './messageProviderPact';

export * from './v3';
/**
 * Exposes {@link Matchers}
 * To avoid polluting the root module's namespace, re-export
 * Matchers as its own module
 * @memberof Pact
 * @static
 */
export { MatchersV3 as Matchers } from './v3';
/**
 * Exposes {@link Pact}
 * @memberof Pact
 * @static
 */
export * from './v4';
