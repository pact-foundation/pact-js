import type { V4UnconfiguredGraphQLInteraction } from './graphql/types';
import type { V4UnconfiguredInteraction } from './http/types';
import type {
  V4UnconfiguredAsynchronousMessage,
  V4UnconfiguredSynchronousMessage,
} from './message/types';

export interface V4ConsumerPact {
  addInteraction(): V4UnconfiguredInteraction;
  addSynchronousInteraction(
    description: string,
  ): V4UnconfiguredSynchronousMessage;
  addAsynchronousInteraction(): V4UnconfiguredAsynchronousMessage;
  addGraphQLInteraction(): V4UnconfiguredGraphQLInteraction;
}
