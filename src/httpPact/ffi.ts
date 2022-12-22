import { ConsumerInteraction } from '@pact-foundation/pact-core/src/consumer/index';

import { forEachObjIndexed } from 'ramda';
import { isArray } from 'util';
import {
  RequestOptions,
  ResponseOptions,
  Headers,
  Query,
} from '../dsl/interaction';
import { Matcher, matcherValueOrString } from '../dsl/matchers';
import { AnyTemplate } from '../v3/matchers';

enum InteractionPart {
  REQUEST = 1,
  RESPONSE = 2,
}

const CONTENT_TYPE_HEADER = 'content-type';
const CONTENT_TYPE_JSON = 'application/json';

export const contentTypeFromHeaders = (
  headers: Headers | undefined,
  defaultContentType: string
): string => {
  let contentType: string | Matcher<string> = defaultContentType;
  forEachObjIndexed((v, k) => {
    if (`${k}`.toLowerCase() === CONTENT_TYPE_HEADER) {
      contentType = matcherValueOrString(v);
    }
  }, headers || {});

  return contentType;
};

export const setRequestMethodAndPath = (
  interaction: ConsumerInteraction,
  req: RequestOptions
): void => {
  if (req?.method && req?.path) {
    const method = req?.method;
    const reqPath = matcherValueOrString(req?.path);
    interaction.withRequest(method, reqPath);
  }
};

export const setQuery = (
  interaction: ConsumerInteraction,
  query?: Query
): void => {
  forEachObjIndexed((v, k) => {
    if (isArray(v)) {
      (v as unknown[]).forEach((vv, i) => {
        interaction.withQuery(k, i, matcherValueOrString(vv));
      });
    } else {
      interaction.withQuery(k, 0, matcherValueOrString(v));
    }
  }, query);
};

export const setBody = (
  part: InteractionPart,
  interaction: ConsumerInteraction,
  headers?: Headers,
  body?: AnyTemplate
): void => {
  if (body) {
    const matcher = matcherValueOrString(body);
    const contentType = contentTypeFromHeaders(headers, CONTENT_TYPE_JSON);

    switch (part) {
      case InteractionPart.REQUEST:
        interaction.withRequestBody(matcher, contentType);
        break;
      case InteractionPart.RESPONSE:
        interaction.withResponseBody(matcher, contentType);
        break;
      default:
        break;
    }
  }
};

export const setHeaders = (
  part: InteractionPart,
  interaction: ConsumerInteraction,
  headers?: Headers
): void => {
  forEachObjIndexed((v, k) => {
    switch (part) {
      case InteractionPart.REQUEST:
        interaction.withRequestHeader(`${k}`, 0, matcherValueOrString(v));

        break;
      case InteractionPart.RESPONSE:
        interaction.withResponseHeader(`${k}`, 0, matcherValueOrString(v));

        break;

      default:
        break;
    }
  }, headers);
};

export const setRequestDetails = (
  interaction: ConsumerInteraction,
  req: RequestOptions
): void => {
  setRequestMethodAndPath(interaction, req);
  setBody(InteractionPart.REQUEST, interaction, req.headers, req.body);
  setHeaders(InteractionPart.REQUEST, interaction, req.headers);
  setQuery(interaction, req.query);
};

export const setResponseDetails = (
  interaction: ConsumerInteraction,
  res: ResponseOptions
): void => {
  interaction.withStatus(res.status);

  setBody(InteractionPart.RESPONSE, interaction, res.headers, res.body);
  setHeaders(InteractionPart.RESPONSE, interaction, res.headers);
};
