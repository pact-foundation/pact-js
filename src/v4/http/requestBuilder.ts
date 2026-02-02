import { ConsumerInteraction } from '@pact-foundation/pact-core';
import { forEachObjIndexed } from 'ramda';
import { TemplateQuery, TemplateHeaders, Matcher, Rules } from '../../v3';
import { matcherValueOrString } from '../../v3/matchers';
import { TemplateHeaderArrayValue, V4RequestBuilder } from './types';
import { readBinaryData } from '.';
import { convertRulesToFFI, validateRules } from '../../common/matchingRules';

export class RequestBuilder implements V4RequestBuilder {
  // tslint:disable:no-empty-function
  constructor(protected interaction: ConsumerInteraction) {}

  query(query: TemplateQuery): V4RequestBuilder {
    forEachObjIndexed((v, k) => {
      if (Array.isArray(v)) {
        (v as unknown[]).forEach((vv, i) => {
          this.interaction.withQuery(k, i, matcherValueOrString(vv));
        });
      } else {
        this.interaction.withQuery(k, 0, matcherValueOrString(v));
      }
    }, query);

    return this;
  }

  headers(headers: TemplateHeaders): V4RequestBuilder {
    forEachObjIndexed((v, k) => {
      if (Array.isArray(v)) {
        (v as TemplateHeaderArrayValue).forEach(
          (header: string | Matcher<string>, index: number) => {
            this.interaction.withRequestHeader(
              `${k}`,
              index,
              matcherValueOrString(header)
            );
          }
        );
      } else {
        this.interaction.withRequestHeader(`${k}`, 0, matcherValueOrString(v));
      }
    }, headers);

    return this;
  }

  jsonBody(body: unknown): V4RequestBuilder {
    this.interaction.withRequestBody(
      matcherValueOrString(body),
      'application/json'
    );
    return this;
  }

  binaryFile(contentType: string, file: string): V4RequestBuilder {
    const body = readBinaryData(file);
    this.interaction.withRequestBinaryBody(body, contentType);

    return this;
  }

  /**
   * Sets the request body as multipart/form-data content.
   * This is useful for testing APIs that accept file uploads or multipart form submissions.
   *
   * @param contentType - The content type of the multipart body (e.g., 'multipart/form-data')
   * @param file - Path to the file containing the multipart body content
   * @param mimePartName - The name of the mime part in the multipart body
   * @param boundary - Optional boundary string for the multipart content. If not provided, will be passed as undefined.
   * @returns The V4RequestBuilder instance for method chaining
   */
  multipartBody(
    contentType: string,
    file: string,
    mimePartName: string,
    boundary?: string
  ): V4RequestBuilder {
    this.interaction.withRequestMultipartBody(
      contentType,
      file,
      mimePartName,
      boundary
    );

    return this;
  }

  /**
   * Applies matching rules to the consumer request.
   * Matching rules allow you to define flexible matching criteria for request attributes
   * beyond exact equality (e.g., regex patterns, type matching, number ranges).
   *
   * @param rules - The matching rules as a strongly typed Rules object. Rules should follow the Pact matching rules format.
   * @returns The V4RequestBuilder instance for method chaining
   */
  matchingRules(rules: Rules): V4RequestBuilder {
    validateRules(rules);
    const ffiRules = convertRulesToFFI(rules);
    this.interaction.withRequestMatchingRules(JSON.stringify(ffiRules));
    return this;
  }

  body(contentType: string, body: Buffer): V4RequestBuilder {
    this.interaction.withRequestBinaryBody(body, contentType);

    return this;
  }
}
