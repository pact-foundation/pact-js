import type {
  ConsumerInteraction,
  ConsumerPact,
} from '@pact-foundation/pact-core';
import { InteractionWithPluginResponse } from './interactionWithPluginResponse';
import { ResponseWithPluginBuilder } from './responseWithPluginBuilder';
import type {
  PactV4Options,
  V4InteractionWithPluginRequest,
  V4InteractionWithPluginResponse,
  V4PluginResponseBuilderFunc,
} from './types';
import type { StatusCodeMatcher } from '../../v3';
import { isStatusCodeMatcher, reify } from '../../v3/matchers';
import { convertStatusMatcherToFFI } from '../../common/matchingRules';

export class InteractionWithPluginRequest
  implements V4InteractionWithPluginRequest
{
  // tslint:disable:no-empty-function
  constructor(
    private pact: ConsumerPact,
    private interaction: ConsumerInteraction,
    private opts: PactV4Options,
    protected cleanupFn: () => void,
  ) {}

  willRespondWith(
    status: number | StatusCodeMatcher<number>,
    builder?: V4PluginResponseBuilderFunc,
  ): V4InteractionWithPluginResponse {
    this.interaction.withStatus(reify<number>(status));

    if (isStatusCodeMatcher(status)) {
      this.interaction.withResponseMatchingRules(
        JSON.stringify(convertStatusMatcherToFFI(status)),
      );
    }

    if (typeof builder === 'function') {
      builder(new ResponseWithPluginBuilder(this.interaction));
    }

    return new InteractionWithPluginResponse(
      this.pact,
      this.opts,
      this.cleanupFn,
    );
  }
}
