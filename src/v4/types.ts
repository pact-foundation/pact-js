import { V4UnconfiguredInteraction } from './http/types';
import { V4UnconfiguredSynchronousMessage } from './message/types';

export interface V4ConsumerPact {
  addInteraction(): V4UnconfiguredInteraction;
  // addAsynchronousInteraction(): V4UnconfiguredAsynchronousMessage;
  addSynchronousInteraction(
    description: string
  ): V4UnconfiguredSynchronousMessage;
}
