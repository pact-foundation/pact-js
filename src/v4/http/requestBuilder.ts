import { ConsumerInteraction } from '@pact-foundation/pact-core';
import { forEachObjIndexed } from 'ramda';
import { TemplateQuery, TemplateHeaders, Matcher } from '../../v3';
import { matcherValueOrString } from '../../v3/matchers';
import { TemplateHeaderArrayValue, V4RequestBuilder } from './types';
import { readBinaryData } from '.';

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

  multipartBody(
    contentType: string,
    file: string,
    mimePartName: string
  ): V4RequestBuilder {
    this.interaction.withRequestMultipartBody(contentType, file, mimePartName);

    return this;
  }

  body(contentType: string, body: Buffer): V4RequestBuilder {
    this.interaction.withRequestBinaryBody(body, contentType);

    return this;
  }
}
