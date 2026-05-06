import type { ConsumerInteraction } from '@pact-foundation/pact-core';
import { forEachObjIndexed } from 'ramda';
import type {
  Matcher,
  StatusCodeMatcher,
  TemplateHeaders,
  V3Request,
  V3Response,
} from './types';
import * as MatchersV3 from './matchers';
import { convertStatusMatcherToFFI } from '../common/matchingRules';

type TemplateHeaderArrayValue = string[] | Matcher<string>[];

const isStatusCodeMatcher = (
  status: number | StatusCodeMatcher<number>,
): status is StatusCodeMatcher<number> =>
  MatchersV3.isMatcher(status) && status['pact:matcher:type'] === 'statusCode';

export const setRequestDetails = (
  interaction: ConsumerInteraction,
  req: V3Request,
): void => {
  interaction.withRequest(
    req.method,
    MatchersV3.matcherValueOrString(req.path),
  );
  forEachObjIndexed((v, k) => {
    if (Array.isArray(v)) {
      (v as TemplateHeaderArrayValue).forEach((header, index) => {
        interaction.withRequestHeader(
          k,
          index,
          MatchersV3.matcherValueOrString(header),
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
  res: V3Response,
): void => {
  interaction.withStatus(MatchersV3.reify<number>(res.status));

  if (isStatusCodeMatcher(res.status)) {
    interaction.withResponseMatchingRules(
      JSON.stringify(convertStatusMatcherToFFI(res.status)),
    );
  }

  forEachObjIndexed((v, k) => {
    if (Array.isArray(v)) {
      (v as TemplateHeaderArrayValue).forEach((header, index) => {
        interaction.withResponseHeader(
          k,
          index,
          MatchersV3.matcherValueOrString(header),
        );
      });
    } else {
      interaction.withResponseHeader(k, 0, MatchersV3.matcherValueOrString(v));
    }
  }, res.headers);
};

export const contentTypeFromHeaders = (
  headers: TemplateHeaders | undefined,
  defaultContentType: string,
): string => {
  let contentType: string | Matcher<string> = defaultContentType;
  forEachObjIndexed((v, k) => {
    if (`${k}`.toLowerCase() === 'content-type') {
      const headerValue = Array.isArray(v) ? v[0] : v;
      contentType = MatchersV3.isMatcher(headerValue)
        ? MatchersV3.matcherValueOrString(headerValue.value)
        : MatchersV3.matcherValueOrString(headerValue);
    }
  }, headers || {});

  return contentType;
};
