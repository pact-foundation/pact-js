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
 * Exposes {@link Matchers}
 * To avoid polluting the root module's namespace, re-export
 * Matchers as its own module
 * @memberof Pact
 * @static
 */
import * as MatchersStar from './dsl/matchers';

export const Matchers = MatchersStar;

export { InterfaceToTemplate } from './dsl/matchers';

export * from './httpPact';

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

/**
 * Exposes {@link Message}
 * @memberof Pact
 * @static
 */
export * from './dsl/message';

/**
 * Exposes {@link Verifier}
 * @memberof Pact
 * @static
 */
export * from './dsl/verifier/verifier';

/**
 * Exposes {@link GraphQL}
 * @memberof Pact
 * @static
 */
export * from './dsl/graphql';
/**
 * Exposes {@link ApolloGraphQL}
 * @memberof Pact
 * @static
 */
export * from './dsl/apolloGraphql';

/**
 * Exposes {@link Interaction}
 * @memberof Pact
 * @static
 */
export * from './dsl/interaction';

/**
 * Exposes {@link MockService}
 * @memberof Pact
 * @static
 */
export * from './dsl/mockService';

export * from './v3';

/**
 * Exposes {@link Publisher}
 * @memberof Pact
 * @static
 */
export * from './dsl/publisher';

/**
 * Exposes {@link PactOptions}
 * @memberof Pact
 * @static
 */
export * from './dsl/options';
