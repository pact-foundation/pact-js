import { ConsumerPact, ConsumerInteraction } from '@pact-foundation/pact-core';
import { InteractionWithPlugin } from './interactionWithPlugin';
import { RequestBuilder } from './requestBuilder';
import { InteractionWithRequest } from './interactionWithRequest';
import { JsonMap } from '../../common/jsonTypes';
import { Path } from '../../v3';
import { matcherValueOrString } from '../../v3/matchers';
import {
  V4UnconfiguredInteraction,
  PactV4Options,
  V4Request,
  V4InteractionWithCompleteRequest,
  V4RequestBuilderFunc,
  V4InteractionWithRequest,
  PluginConfig,
  V4InteractionWithPlugin,
  Comment,
  CustomComment,
} from './types';

type ConsumerInteractionWithMetadata = ConsumerInteraction & {
  setPending: (pending: boolean) => boolean;
  setComment: (key: string, value: string) => boolean;
  addTextComment: (comment: string) => boolean;
  setInteractionTestName: (name: string) => number;
};

export class UnconfiguredInteraction implements V4UnconfiguredInteraction {
  // tslint:disable:no-empty-function
  constructor(
    protected pact: ConsumerPact,
    protected interaction: ConsumerInteraction,
    protected opts: PactV4Options,
    protected cleanupFn: () => void
  ) {}

  uponReceiving(description: string): V4UnconfiguredInteraction {
    this.interaction.uponReceiving(description);

    return this;
  }

  given(state: string, parameters?: JsonMap): V4UnconfiguredInteraction {
    if (parameters) {
      this.interaction.givenWithParams(state, JSON.stringify(parameters));
    } else {
      this.interaction.given(state);
    }

    return this;
  }

  pending(pending: boolean = true): V4UnconfiguredInteraction {
    (this.interaction as ConsumerInteractionWithMetadata).setPending(pending);

    return this;
  }

  comment(comment: Comment | CustomComment): V4UnconfiguredInteraction {
    if (typeof comment === 'string') {
      (this.interaction as ConsumerInteractionWithMetadata).addTextComment(
        comment
      );
      return this;
    }

    (this.interaction as ConsumerInteractionWithMetadata).setComment(
      comment.key,
      comment.value
    );

    return this;
  }

  testName(name: string): V4UnconfiguredInteraction {
    (this.interaction as ConsumerInteractionWithMetadata).setInteractionTestName(
      name
    );

    return this;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  withCompleteRequest(request: V4Request): V4InteractionWithCompleteRequest {
    throw new Error('withCompleteRequest is not implemented');
  }

  withRequest(
    method: string,
    path: Path,
    builder?: V4RequestBuilderFunc
  ): V4InteractionWithRequest {
    this.interaction.withRequest(method, matcherValueOrString(path));

    if (builder) {
      builder(new RequestBuilder(this.interaction));
    }
    return new InteractionWithRequest(
      this.pact,
      this.interaction,
      this.opts,
      this.cleanupFn
    );
  }

  usingPlugin(config: PluginConfig): V4InteractionWithPlugin {
    this.pact.addPlugin(config.plugin, config.version);

    return new InteractionWithPlugin(
      this.pact,
      this.interaction,
      this.opts,
      this.cleanupFn
    );
  }
}
