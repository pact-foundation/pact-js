import type {
  ConsumerInteraction,
  ConsumerPact,
} from '@pact-foundation/pact-core';
import type { Path } from '../../v3';
import { matcherValueOrString } from '../../v3/matchers';
import { InteractionWithPluginRequest } from './interactionWithPluginRequest';
import { RequestWithPluginBuilder } from './requestWithPluginBuilder';
import type {
  PactV4Options,
  PluginConfig,
  V4InteractionWithPlugin,
  V4InteractionWithPluginRequest,
  V4PluginRequestBuilderFunc,
} from './types';

export class InteractionWithPlugin implements V4InteractionWithPlugin {
  // tslint:disable:no-empty-function
  constructor(
    private pact: ConsumerPact,
    private interaction: ConsumerInteraction,
    private opts: PactV4Options,
    protected cleanupFn: () => void,
  ) {}

  // Multiple plugins are allowed
  usingPlugin(config: PluginConfig): V4InteractionWithPlugin {
    this.pact.addPlugin(config.plugin, config.version);

    return this;
  }

  withRequest(
    method: string,
    path: Path,
    builder?: V4PluginRequestBuilderFunc,
  ): V4InteractionWithPluginRequest {
    this.interaction.withRequest(method, matcherValueOrString(path));

    if (typeof builder === 'function') {
      builder(new RequestWithPluginBuilder(this.interaction));
    }
    return new InteractionWithPluginRequest(
      this.pact,
      this.interaction,
      this.opts,
      this.cleanupFn,
    );
  }
}
