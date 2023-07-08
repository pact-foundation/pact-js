import { forEachObjIndexed } from 'ramda';
import { ConsumerInteraction } from '@pact-foundation/pact-core';
import { Matcher, TemplateHeaders, V3Request, V3Response } from './types';
import * as MatchersV3 from './matchers';

type TemplateHeaderArrayValue = string[] | Matcher<string>[];

export const setRequestDetails = (
  interaction: ConsumerInteraction,
  req: V3Request
): void => {
  interaction.withRequest(
    req.method,
    MatchersV3.matcherValueOrString(req.path)
  );
  forEachObjIndexed((v, k) => {
    if (Array.isArray(v)) {
      (v as TemplateHeaderArrayValue).forEach((header, index) => {
        interaction.withRequestHeader(
          k,
          index,
          MatchersV3.matcherValueOrString(header)
        );
      });
    } else {
      interaction.withRequestHeader(k, 0, MatchersV3.matcherValueOrString(v));
    }
  }, req.headers);

  forEachObjIndexed((v, k) => {
    if (Array.isArray(v)) {
      (v as unknown[]).forEach((vv, i) => {
        interaction.withQuery(k, i, MatchersV3.matcherValueOrString(vv));
      });
    } else {
      interaction.withQuery(k, 0, MatchersV3.matcherValueOrString(v));
    }
  }, req.query);
};

export const setResponseDetails = (
  interaction: ConsumerInteraction,
  res: V3Response
): void => {
  interaction.withStatus(MatchersV3.reify(res.status) as number);

  forEachObjIndexed((v, k) => {
    if (Array.isArray(v)) {
      (v as TemplateHeaderArrayValue).forEach((header, index) => {
        interaction.withResponseHeader(
          k,
          index,
          MatchersV3.matcherValueOrString(header)
        );
      });
    } else {
      interaction.withResponseHeader(k, 0, MatchersV3.matcherValueOrString(v));
    }
  }, res.headers);
};

// TODO: this might need to consider an array of values
export const contentTypeFromHeaders = (
  headers: TemplateHeaders | undefined,
  defaultContentType: string
): string => {
  let contentType: string | Matcher<string> = defaultContentType;
  forEachObjIndexed((v, k) => {
    if (`${k}`.toLowerCase() === 'content-type') {
      contentType = MatchersV3.matcherValueOrString(v);
    }
  }, headers || {});

  return contentType;
};
