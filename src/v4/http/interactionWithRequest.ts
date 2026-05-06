import type {
  ConsumerPact,
  ConsumerInteraction,
} from '@pact-foundation/pact-core';
import { InteractionWithResponse } from './interactionWithResponse';
import { ResponseBuilder } from './responseBuilder';
import type {
  V4InteractionWithRequest,
  PactV4Options,
  V4ResponseBuilderFunc,
  V4InteractionWithResponse,
} from './types';
import type { StatusCodeMatcher } from '../../v3';
import { reify } from '../../v3/matchers';
import { convertStatusMatcherToFFI } from '../../common/matchingRules';

const isStatusCodeMatcher = (
  status: number | StatusCodeMatcher<number>,
): status is StatusCodeMatcher<number> =>
  typeof status === 'object' &&
  status['pact:matcher:type'] === 'statusCode';

export class InteractionWithRequest implements V4InteractionWithRequest {
  // tslint:disable:no-empty-function
  constructor(
    private pact: ConsumerPact,
    private interaction: ConsumerInteraction,
    private opts: PactV4Options,
    protected cleanupFn: () => void,
  ) {}

  willRespondWith(
    status: number | StatusCodeMatcher<number>,
    builder?: V4ResponseBuilderFunc,
  ): V4InteractionWithResponse {
    this.interaction.withStatus(reify<number>(status));

    if (isStatusCodeMatcher(status)) {
      this.interaction.withResponseMatchingRules(
        JSON.stringify(convertStatusMatcherToFFI(status)),
      );
    }

    if (typeof builder === 'function') {
      builder(new ResponseBuilder(this.interaction));
    }

    return new InteractionWithResponse(this.pact, this.opts, this.cleanupFn);
  }
}
