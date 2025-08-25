import { ConsumerPact, ConsumerInteraction } from '@pact-foundation/pact-core';
import { RequestWithPluginBuilder } from './requestWithPluginBuilder';
import { InteractionWithPluginRequest } from './interactionWithPluginRequest';
import { Path } from '../../v3';
import { matcherValueOrString } from '../../v3/matchers';
import {
  V4InteractionWithPlugin,
  PactV4Options,
  PluginConfig,
  V4PluginRequestBuilderFunc,
  V4InteractionWithPluginRequest,
} from './types';

export class InteractionWithPlugin implements V4InteractionWithPlugin {
  // tslint:disable:no-empty-function
  constructor(
    private pact: ConsumerPact,
    private interaction: ConsumerInteraction,
    private opts: PactV4Options,
    protected cleanupFn: () => void
  ) {}

  // Multiple plugins are allowed
  usingPlugin(config: PluginConfig): V4InteractionWithPlugin {
    this.pact.addPlugin(config.plugin, config.version);

    return this;
  }

  withRequest(
    method: string,
    path: Path,
    builder?: V4PluginRequestBuilderFunc
  ): V4InteractionWithPluginRequest {
    this.interaction.withRequest(method, matcherValueOrString(path));

    if (typeof builder === 'function') {
      builder(new RequestWithPluginBuilder(this.interaction));
    }
    return new InteractionWithPluginRequest(
      this.pact,
      this.interaction,
      this.opts,
      this.cleanupFn
    );
  }
}
