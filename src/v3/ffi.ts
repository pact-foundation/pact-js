/* eslint-disable import/first */
import { forEachObjIndexed } from 'ramda';
import { ConsumerInteraction } from '@pact-foundation/pact-core/src/consumer/index';
import { isArray } from 'util';
import { TemplateHeaders, V3Request, V3Response } from './types';
import { matcherValueOrString } from './matchers';
import { MatchersV3 } from '../v3';

export const setRequestDetails = (
  interaction: ConsumerInteraction,
  req: V3Request
): void => {
  interaction.withRequest(req.method, matcherValueOrString(req.path));
  forEachObjIndexed((v, k) => {
    interaction.withRequestHeader(k, 0, matcherValueOrString(v));
  }, req.headers);

  forEachObjIndexed((v, k) => {
    if (isArray(v)) {
      (v as unknown[]).forEach((vv, i) => {
        interaction.withQuery(k, i, matcherValueOrString(vv));
      });
    } else {
      interaction.withQuery(k, 0, matcherValueOrString(v));
    }
  }, req.query);
};

export const setResponseDetails = (
  interaction: ConsumerInteraction,
  res: V3Response
): void => {
  interaction.withStatus(res.status);

  forEachObjIndexed((v, k) => {
    interaction.withResponseHeader(k, 0, matcherValueOrString(v));
  }, res.headers);
};

export const contentTypeFromHeaders = (
  headers: TemplateHeaders | undefined,
  defaultContentType: string
): string => {
  let contentType: string | MatchersV3.Matcher<string> = defaultContentType;
  forEachObjIndexed((v, k) => {
    if (`${k}`.toLowerCase() === 'content-type') {
      contentType = matcherValueOrString(v);
    }
  }, headers || {});

  return contentType;
};
