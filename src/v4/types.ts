import { V4UnconfiguredInteraction } from './http/types';
import {
  V4UnconfiguredAsynchronousMessage,
  V4UnconfiguredSynchronousMessage,
} from './message/types';
import { V4UnconfiguredGraphQLInteraction } from './graphql/types';

export interface V4ConsumerPact {
  addInteraction(): V4UnconfiguredInteraction;
  addSynchronousInteraction(
    description: string
  ): V4UnconfiguredSynchronousMessage;
  addAsynchronousInteraction(): V4UnconfiguredAsynchronousMessage;
  addGraphQLInteraction(): V4UnconfiguredGraphQLInteraction;
}
