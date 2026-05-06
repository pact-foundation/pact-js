import { ResponseBuilder } from './responseBuilder';
import type { V4ResponseBuilder, V4ResponseWithPluginBuilder } from './types';

export class ResponseWithPluginBuilder
  extends ResponseBuilder
  implements V4ResponseWithPluginBuilder
{
  pluginContents(contentType: string, contents: string): V4ResponseBuilder {
    this.interaction.withPluginResponseInteractionContents(
      contentType,
      contents,
    );
    return this;
  }
}
