import { ConsumerInteraction } from '@pact-foundation/pact-core';
import { forEachObjIndexed } from 'ramda';
import { TemplateQuery, TemplateHeaders, Matcher } from '../../v3';
import { matcherValueOrString } from '../../v3/matchers';
import { TemplateHeaderArrayValue } from '../http/types';
import { V4GraphQLRequestBuilder } from './types';

export class GraphQLRequestBuilder implements V4GraphQLRequestBuilder {
  // tslint:disable:no-empty-function
  constructor(protected interaction: ConsumerInteraction) {}

  query(query: TemplateQuery): V4GraphQLRequestBuilder {
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

  headers(headers: TemplateHeaders): V4GraphQLRequestBuilder {
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
}
