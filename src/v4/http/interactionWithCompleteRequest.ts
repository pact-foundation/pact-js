import type {
  ConsumerInteraction,
  ConsumerPact,
} from '@pact-foundation/pact-core';
import { InteractionWithResponse } from './interactionWithResponse';
import { ResponseBuilder } from './responseBuilder';
import type {
  PactV4Options,
  V4InteractionWithCompleteRequest,
  V4InteractionWithResponse,
  V4Response,
  V4ResponseBuilderFunc,
} from './types';
import type { StatusCodeMatcher } from '../../v3';
import {
  isStatusCodeMatcher,
  matcherValueOrString,
  reify,
} from '../../v3/matchers';
import { convertStatusMatcherToFFI } from '../../common/matchingRules';
import { contentTypeFromHeaders, setResponseDetails } from '../../v3/ffi';

export class InteractionWithCompleteRequest
  implements V4InteractionWithCompleteRequest
{
  constructor(
    private pact: ConsumerPact,
    private interaction: ConsumerInteraction,
    private opts: PactV4Options,
    protected cleanupFn: () => void,
  ) {}

  withCompleteResponse(response: V4Response): V4InteractionWithResponse {
    setResponseDetails(this.interaction, response);

    if (response.body !== undefined) {
      this.interaction.withResponseBody(
        matcherValueOrString(response.body),
        response.contentType ||
          contentTypeFromHeaders(response.headers, 'application/json'),
      );
    }

    return new InteractionWithResponse(this.pact, this.opts, this.cleanupFn);
  }

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
