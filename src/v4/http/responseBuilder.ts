import { ConsumerInteraction } from '@pact-foundation/pact-core';
import { forEachObjIndexed } from 'ramda';
import { readBinaryData } from '.';
import { TemplateHeaders, Rules } from '../../v3';
import { matcherValueOrString } from '../../v3/matchers';
import { V4ResponseBuilder } from './types';
import { convertRulesToFFI, validateRules } from '../../common/matchingRules';

export class ResponseBuilder implements V4ResponseBuilder {
  protected interaction: ConsumerInteraction;

  constructor(interaction: ConsumerInteraction) {
    this.interaction = interaction;
  }

  headers(headers: TemplateHeaders): V4ResponseBuilder {
    forEachObjIndexed((v, k) => {
      this.interaction.withResponseHeader(`${k}`, 0, matcherValueOrString(v));
    }, headers);

    return this;
  }

  jsonBody(body: unknown): V4ResponseBuilder {
    this.interaction.withResponseBody(
      matcherValueOrString(body),
      'application/json'
    );
    return this;
  }

  binaryFile(contentType: string, file: string): V4ResponseBuilder {
    const body = readBinaryData(file);
    this.interaction.withResponseBinaryBody(body, contentType);

    return this;
  }

  /**
   * Sets the response body as multipart/form-data content.
   * This is useful for testing APIs that respond with multipart/form-data.
   *
   * @param contentType - The content type of the multipart body (e.g., 'multipart/form-data')
   * @param file - Path to the file containing the multipart body content
   * @param mimePartName - The name of the mime part in the multipart body
   * @param boundary - Optional boundary string for the multipart content. If not provided, will be passed as undefined.
   * @returns The V4ResponseBuilder instance for method chaining
   */
  multipartBody(
    contentType: string,
    file: string,
    mimePartName: string,
    boundary?: string
  ): V4ResponseBuilder {
    this.interaction.withResponseMultipartBody(
      contentType,
      file,
      mimePartName,
      boundary
    );

    return this;
  }

  /**
   * Applies matching rules to the provider response.
   * Matching rules allow you to define flexible matching criteria for response attributes
   * beyond exact equality (e.g., regex patterns, type matching, number ranges).
   *
   * @param rules - The matching rules as a strongly typed Rules object. Rules should follow the Pact matching rules format.
   * @returns The V4ResponseBuilder instance for method chaining
   */
  matchingRules(rules: Rules): V4ResponseBuilder {
    validateRules(rules);
    const ffiRules = convertRulesToFFI(rules);
    this.interaction.withResponseMatchingRules(JSON.stringify(ffiRules));
    return this;
  }

  body(contentType: string, body: Buffer): V4ResponseBuilder {
    this.interaction.withResponseBinaryBody(body, contentType);

    return this;
  }
}
