import { ConsumerPact, ConsumerInteraction } from '@pact-foundation/pact-core';
import { InteractionWithResponse } from './interactionWithResponse';
import { ResponseBuilder } from './responseBuilder';
import {
  V4InteractionWithRequest,
  PactV4Options,
  V4ResponseBuilderFunc,
  V4InteractionWithResponse,
} from './types';

export class InteractionWithRequest implements V4InteractionWithRequest {
  // tslint:disable:no-empty-function
  constructor(
    private pact: ConsumerPact,
    private interaction: ConsumerInteraction,
    private opts: PactV4Options,
    protected cleanupFn: () => void
  ) {}

  willRespondWith(
    status: number,
    builder?: V4ResponseBuilderFunc
  ): V4InteractionWithResponse {
    this.interaction.withStatus(status);

    if (typeof builder === 'function') {
      builder(new ResponseBuilder(this.interaction));
    }

    return new InteractionWithResponse(this.pact, this.opts, this.cleanupFn);
  }
}
