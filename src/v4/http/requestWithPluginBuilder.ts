import { Rules, TemplateHeaders, TemplateQuery } from '../../v3';
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

  /**
   * Sets the request body as multipart/form-data content for plugin-based interactions.
   * This is useful for testing APIs that accept file uploads or multipart form submissions.
   *
   * @param contentType - The content type of the multipart body (e.g., 'multipart/form-data')
   * @param file - Path to the file containing the multipart body content
   * @param mimePartName - The name of the mime part in the multipart body
   * @param boundary - Optional boundary string for the multipart content. If not provided, will be passed as undefined.
   * @returns The V4RequestWithPluginBuilder instance for method chaining
   */
  multipartBody(
    contentType: string,
    file: string,
    mimePartName: string,
    boundary?: string
  ): V4RequestWithPluginBuilder {
    super.multipartBody(contentType, file, mimePartName, boundary);

    return this;
  }

  /**
   * Applies matching rules to the consumer request.
   * Matching rules allow you to define flexible matching criteria for request attributes
   * beyond exact equality (e.g., regex patterns, type matching, number ranges).
   *
   * @param rules - The matching rules as a strongly typed Rules object. Rules should follow the Pact matching rules format.
   * @returns The V4RequestWithPluginBuilder instance for method chaining
   */
  matchingRules(rules: Rules): V4RequestWithPluginBuilder {
    super.matchingRules(rules);
    return this;
  }

  body(contentType: string, body: Buffer): V4RequestWithPluginBuilder {
    super.body(contentType, body);

    return this;
  }
}
