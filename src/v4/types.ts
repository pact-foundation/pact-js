import { V4UnconfiguredInteraction } from './http/types';
import {
  V4UnconfiguredSynchronousMessage,
  V4UnconfiguredAsynchronousMessage,
} from './message/types';

export interface V4ConsumerPact {
  addInteraction(): V4UnconfiguredInteraction;
  addSynchronousInteraction(
    description: string
  ): V4UnconfiguredSynchronousMessage;
  addAsynchronousInteraction(
    description: string
  ): V4UnconfiguredAsynchronousMessage;
}
