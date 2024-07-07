import { V4UnconfiguredInteraction } from './http/types';
import { V4UnconfiguredSynchronousMessage } from './message/types';
import { V4UnconfiguredGraphQLInteraction } from './graphql/types';

export interface V4ConsumerPact {
  addInteraction(): V4UnconfiguredInteraction;
  addSynchronousInteraction(
    description: string
  ): V4UnconfiguredSynchronousMessage;
  addGraphQLInteraction(): V4UnconfiguredGraphQLInteraction;
}
