import type {
  ConsumerPact,
  ConsumerInteraction,
} from '@pact-foundation/pact-core';
import type {
  V4InteractionWithCompleteRequest,
  PactV4Options,
  V4Response,
  V4InteractionWithResponse,
} from './types';

export class InteractionWithCompleteRequest
  implements V4InteractionWithCompleteRequest
{
  constructor(
    _pact: ConsumerPact,
    _interaction: ConsumerInteraction,
    _opts: PactV4Options,
    protected cleanupFn: () => void,
  ) {
    throw Error('V4InteractionWithCompleteRequest is unimplemented');
  }

  withCompleteResponse(_response: V4Response): V4InteractionWithResponse {
    throw new Error('withCompleteResponse is not implemented');
  }
}
