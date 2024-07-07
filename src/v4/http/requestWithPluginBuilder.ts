import { TemplateHeaders, TemplateQuery } from '../../v3';
import { RequestBuilder } from './requestBuilder';
import { V4RequestWithPluginBuilder } from './types';

export class RequestWithPluginBuilder
  extends RequestBuilder
  implements V4RequestWithPluginBuilder
{
  pluginContents(
    contentType: string,
    contents: string
  ): V4RequestWithPluginBuilder {
    this.interaction.withPluginRequestInteractionContents(
      contentType,
      contents
    );

    return this;
  }

  query(query: TemplateQuery): V4RequestWithPluginBuilder {
    super.query(query);

    return this;
  }

  headers(headers: TemplateHeaders): V4RequestWithPluginBuilder {
    super.headers(headers);

    return this;
  }

  jsonBody(body: unknown): V4RequestWithPluginBuilder {
    super.jsonBody(body);

    return this;
  }

  binaryFile(contentType: string, file: string): V4RequestWithPluginBuilder {
    super.binaryFile(contentType, file);

    return this;
  }

  multipartBody(
    contentType: string,
    file: string,
    mimePartName: string
  ): V4RequestWithPluginBuilder {
    super.multipartBody(contentType, file, mimePartName);

    return this;
  }

  body(contentType: string, body: Buffer): V4RequestWithPluginBuilder {
    super.body(contentType, body);

    return this;
  }
}
