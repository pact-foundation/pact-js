import { ConsumerInteraction } from '@pact-foundation/pact-core';
import { forEachObjIndexed } from 'ramda';
import { readBinaryData } from '.';
import { TemplateHeaders } from '../../v3';
import { matcherValueOrString } from '../../v3/matchers';
import { V4ResponseBuilder } from './types';

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

  multipartBody(
    contentType: string,
    file: string,
    mimePartName: string
  ): V4ResponseBuilder {
    this.interaction.withResponseMultipartBody(contentType, file, mimePartName);

    return this;
  }

  body(contentType: string, body: Buffer): V4ResponseBuilder {
    this.interaction.withResponseBinaryBody(body, contentType);

    return this;
  }
}
