import { ConsumerPact, ConsumerInteraction } from '@pact-foundation/pact-core';
import {
  V4InteractionWithCompleteRequest,
  PactV4Options,
  V4Response,
  V4InteractionWithResponse,
} from './types';

export class InteractionWithCompleteRequest
  implements V4InteractionWithCompleteRequest
{
  constructor(
    private pact: ConsumerPact,
    private interaction: ConsumerInteraction,
    private opts: PactV4Options,
    protected cleanupFn: () => void
  ) {
    throw Error('V4InteractionWithCompleteRequest is unimplemented');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  withCompleteResponse(response: V4Response): V4InteractionWithResponse {
    throw new Error('withCompleteResponse is not implemented');
  }
}
